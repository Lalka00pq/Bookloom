# python
from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod
import json
import time

# 3rd party
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core import Settings as LlamaSettings
import google.generativeai as genai

# project
from app.core.config import gemini_settings, redis_settings
from app.core.logging import get_logger
from app.core.redis_client import redis_client, generate_cache_key
from app.core.chroma_client import chroma_client
from app.schemas.schemas import BookMetadata, BookProfile


logger = get_logger(__name__)


class IProfileAgent(ABC):
    """Interface for Profile Agent."""
    
    @abstractmethod
    async def create_profile(
        self,
        book_metadata: BookMetadata,
        user_id: Optional[str] = None
    ) -> BookProfile:
        """Create semantic profile for a book."""
        pass


class GeminiProfileAgent(IProfileAgent):
    """Profile Agent implementation using Google Gemini and LlamaIndex.
    
    This agent:
    1. Checks Redis cache for existing profile
    2. If not cached, generates profile using Gemini LLM
    3. Creates embedding using Gemini Embeddings
    4. Stores embedding in ChromaDB
    5. Caches profile in Redis
    """
    
    def __init__(self):
        """Initialize Gemini Profile Agent."""
        self.settings = gemini_settings
        self.cache_ttl = redis_settings.ttl_profile
        
        # Configure Gemini API
        genai.configure(api_key=self.settings.api_key)
        
        # Initialize LlamaIndex embedding model
        self.embedding_model = GeminiEmbedding(
            model_name=self.settings.embedding_model,
            api_key=self.settings.api_key
        )
        
        # Configure LlamaIndex global settings
        LlamaSettings.embed_model = self.embedding_model
        
        logger.info(
            "GeminiProfileAgent initialized",
            model=self.settings.model_name,
            embedding_model=self.settings.embedding_model
        )
    
    async def create_profile(
        self,
        book_metadata: BookMetadata,
        user_id: Optional[str] = None
    ) -> BookProfile:
        """Create semantic profile for a book.
        
        Args:
            book_metadata: Book metadata (title, author, description, etc.)
            user_id: Optional user ID for multi-user isolation
        
        Returns:
            BookProfile with semantic data and embedding reference
        """
        start_time = time.time()
        
        # Generate cache key
        cache_key = self._generate_cache_key(book_metadata.book_id, user_id)
        
        # Check Redis cache
        cached_profile = await self._get_from_cache(cache_key)
        if cached_profile:
            logger.info(
                "Profile served from cache",
                book_id=book_metadata.book_id,
                saved_tokens=True
            )
            return cached_profile
        
        logger.info(
            "Creating new profile (cache miss)",
            book_id=book_metadata.book_id,
            title=book_metadata.title
        )
        
        # Extract semantic profile using LLM
        profile_data = await self._extract_semantic_profile(book_metadata)
        
        # Generate embedding
        embedding = await self._generate_embedding(book_metadata)
        
        # Store embedding in ChromaDB
        embedding_id = f"emb_{book_metadata.book_id}"
        if user_id:
            embedding_id = f"emb_{user_id}_{book_metadata.book_id}"
        
        await self._store_embedding(
            embedding_id=embedding_id,
            embedding=embedding,
            book_metadata=book_metadata,
            user_id=user_id
        )
        
        # Create BookProfile object
        profile = BookProfile(
            book_id=book_metadata.book_id,
            themes=profile_data.get("themes", []),
            genres=profile_data.get("genres", book_metadata.genres or []),
            mood=profile_data.get("mood"),
            complexity=profile_data.get("complexity"),
            key_concepts=profile_data.get("key_concepts", []),
            similar_to=profile_data.get("similar_to", []),
            embedding_id=embedding_id,
            metadata={
                "title": book_metadata.title,
                "author": book_metadata.author,
                "user_id": user_id
            }
        )
        
        # Cache profile in Redis
        await self._save_to_cache(cache_key, profile)
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(
            "Profile created successfully",
            book_id=book_metadata.book_id,
            processing_time_ms=f"{processing_time:.2f}",
            embedding_id=embedding_id
        )
        
        return profile
    
    async def _extract_semantic_profile(
        self,
        book_metadata: BookMetadata
    ) -> Dict[str, Any]:
        """Extract semantic profile using Gemini LLM.
        
        Args:
            book_metadata: Book metadata
        
        Returns:
            Dictionary with extracted profile data
        """
        # Build prompt for profile extraction
        prompt = self._build_profile_prompt(book_metadata)
        
        try:
            # Use Gemini generative model
            model = genai.GenerativeModel(self.settings.model_name)
            response = model.generate_content(prompt)
            
            # Parse JSON response
            profile_data = self._parse_llm_response(response.text)
            
            logger.debug(
                "Semantic profile extracted",
                book_id=book_metadata.book_id,
                themes_count=len(profile_data.get("themes", []))
            )
            
            return profile_data
        except Exception as e:
            logger.error(
                "Failed to extract semantic profile",
                book_id=book_metadata.book_id,
                error=str(e),
                exc_info=True
            )
            # Return basic profile on error
            return {
                "themes": [],
                "genres": book_metadata.genres or [],
                "key_concepts": [],
                "similar_to": []
            }
    
    def _build_profile_prompt(self, book_metadata: BookMetadata) -> str:
        """Build prompt for semantic profile extraction.
        
        Args:
            book_metadata: Book metadata
        
        Returns:
            Formatted prompt string
        """
        prompt = f"""Analyze the following book and extract its semantic profile.

Book Title: {book_metadata.title}
Author: {book_metadata.author or 'Unknown'}
Description: {book_metadata.description or 'No description available'}
User Notes: {book_metadata.user_notes or 'No notes'}

Extract the following information and return ONLY valid JSON:
{{
  "themes": ["main theme 1", "main theme 2", ...],
  "genres": ["genre 1", "genre 2", ...],
  "mood": "overall mood/tone (e.g., dark, uplifting, contemplative)",
  "complexity": "reading complexity (easy/medium/hard)",
  "key_concepts": ["concept 1", "concept 2", ...],
  "similar_to": ["similar well-known book 1", "similar book 2", ...]
}}

Requirements:
- Return ONLY the JSON object, no explanatory text
- Themes should be specific (e.g., "AI Ethics", "Time Travel", not just "Technology")
- Include 3-5 themes
- Include 2-4 genres
- Include 3-5 key concepts
- Include 2-3 similar books
- Complexity should be one of: easy, medium, hard

JSON Response:"""
        return prompt
    
    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        """Parse LLM JSON response.
        
        Args:
            response_text: Raw LLM response
        
        Returns:
            Parsed dictionary
        """
        try:
            # Remove markdown code blocks if present
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                # Find JSON content between ```json and ```
                start = cleaned.find("{")
                end = cleaned.rfind("}") + 1
                if start != -1 and end > start:
                    cleaned = cleaned[start:end]
            
            profile_data = json.loads(cleaned)
            return profile_data
        except json.JSONDecodeError as e:
            logger.error("Failed to parse LLM response as JSON", error=str(e), response=response_text)
            return {}
    
    async def _generate_embedding(self, book_metadata: BookMetadata) -> List[float]:
        """Generate embedding vector using Gemini Embeddings.
        
        Args:
            book_metadata: Book metadata
        
        Returns:
            Embedding vector (list of floats)
        """
        try:
            # Create text representation for embedding
            text_for_embedding = self._create_embedding_text(book_metadata)
            
            # Generate embedding using LlamaIndex
            embedding = self.embedding_model.get_text_embedding(text_for_embedding)
            
            logger.debug(
                "Embedding generated",
                book_id=book_metadata.book_id,
                embedding_dim=len(embedding)
            )
            
            return embedding
        except Exception as e:
            logger.error(
                "Failed to generate embedding",
                book_id=book_metadata.book_id,
                error=str(e),
                exc_info=True
            )
            raise
    
    def _create_embedding_text(self, book_metadata: BookMetadata) -> str:
        """Create text representation for embedding generation.
        
        Args:
            book_metadata: Book metadata
        
        Returns:
            Formatted text string
        """
        parts = [
            f"Title: {book_metadata.title}",
            f"Author: {book_metadata.author or 'Unknown'}",
        ]
        
        if book_metadata.description:
            parts.append(f"Description: {book_metadata.description}")
        
        if book_metadata.user_notes:
            parts.append(f"Reader notes: {book_metadata.user_notes}")
        
        if book_metadata.genres:
            parts.append(f"Genres: {', '.join(book_metadata.genres)}")
        
        return "\n".join(parts)
    
    async def _store_embedding(
        self,
        embedding_id: str,
        embedding: List[float],
        book_metadata: BookMetadata,
        user_id: Optional[str]
    ) -> bool:
        """Store embedding in ChromaDB.
        
        Args:
            embedding_id: Unique embedding identifier
            embedding: Embedding vector
            book_metadata: Book metadata
            user_id: Optional user ID
        
        Returns:
            True if successful
        """
        metadata = {
            "book_id": book_metadata.book_id,
            "title": book_metadata.title,
            "author": book_metadata.author or "",
            "user_id": user_id or "",
        }
        
        success = await chroma_client.add_embedding(
            embedding_id=embedding_id,
            embedding=embedding,
            metadata=metadata
        )
        
        return success
    
    def _generate_cache_key(self, book_id: str, user_id: Optional[str]) -> str:
        """Generate Redis cache key for profile.
        
        Args:
            book_id: Book identifier
            user_id: Optional user identifier
        
        Returns:
            Cache key string
        """
        if user_id:
            return f"profile:{user_id}:{book_id}"
        return f"profile:{book_id}"
    
    async def _get_from_cache(self, cache_key: str) -> Optional[BookProfile]:
        """Get profile from Redis cache.
        
        Args:
            cache_key: Redis key
        
        Returns:
            BookProfile if cached, None otherwise
        """
        try:
            cached_json = await redis_client.get(cache_key)
            if cached_json:
                profile_dict = json.loads(cached_json)
                return BookProfile(**profile_dict)
            return None
        except Exception as e:
            logger.error("Failed to get profile from cache", cache_key=cache_key, error=str(e))
            return None
    
    async def _save_to_cache(self, cache_key: str, profile: BookProfile) -> bool:
        """Save profile to Redis cache.
        
        Args:
            cache_key: Redis key
            profile: BookProfile to cache
        
        Returns:
            True if successful
        """
        try:
            profile_json = profile.model_dump_json()
            success = await redis_client.set(cache_key, profile_json, ttl=self.cache_ttl)
            
            if success:
                logger.debug("Profile cached in Redis", cache_key=cache_key, ttl=self.cache_ttl)
            
            return success
        except Exception as e:
            logger.error("Failed to save profile to cache", cache_key=cache_key, error=str(e))
            return False


# Singleton instance
profile_agent = GeminiProfileAgent()
