# python
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
import os

# 3rd party
import chromadb
from chromadb.config import Settings as ChromaSettings

# project
from app.core.config import chroma_settings
from app.core.logging import get_logger


logger = get_logger(__name__)


class IVectorStore(ABC):
    """Interface for vector store operations."""
    
    @abstractmethod
    async def add_embedding(
        self,
        embedding_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> bool:
        """Add embedding to vector store."""
        pass
    
    @abstractmethod
    async def get_embedding(self, embedding_id: str) -> Optional[Dict[str, Any]]:
        """Get embedding by ID."""
        pass
    
    @abstractmethod
    async def query_similar(
        self,
        embedding: List[float],
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Query similar embeddings."""
        pass
    
    @abstractmethod
    async def delete_embedding(self, embedding_id: str) -> bool:
        """Delete embedding by ID."""
        pass


class ChromaDBClient(IVectorStore):
    """ChromaDB vector store client implementation."""
    
    def __init__(self):
        """Initialize ChromaDB client."""
        self._client: Optional[chromadb.Client] = None
        self._collection = None
        self.settings = chroma_settings
        logger.info("ChromaDB client initialized", db_path=self.settings.db_path)
    
    async def connect(self) -> None:
        """Initialize ChromaDB client and collection."""
        try:
            # Ensure storage directory exists
            os.makedirs(self.settings.db_path, exist_ok=True)
            
            # Initialize persistent ChromaDB client
            self._client = chromadb.PersistentClient(
                path=self.settings.db_path,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=False,
                )
            )
            
            # Get or create collection
            self._collection = self._client.get_or_create_collection(
                name=self.settings.collection_name,
                metadata={"description": "Book embeddings for semantic search"}
            )
            
            logger.info(
                "ChromaDB collection ready",
                collection=self.settings.collection_name,
                count=self._collection.count()
            )
        except Exception as e:
            logger.error("Failed to initialize ChromaDB", error=str(e), exc_info=True)
            raise
    
    async def disconnect(self) -> None:
        """Cleanup ChromaDB client."""
        # ChromaDB doesn't require explicit disconnection
        logger.info("ChromaDB client disconnected")
    
    async def add_embedding(
        self,
        embedding_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> bool:
        """Add embedding to ChromaDB collection.
        
        Args:
            embedding_id: Unique identifier for the embedding
            embedding: Vector embedding (list of floats)
            metadata: Associated metadata (book_id, title, etc.)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # ChromaDB requires documents, we use book_id as document
            document = metadata.get("book_id", embedding_id)
            
            self._collection.add(
                embeddings=[embedding],
                documents=[document],
                metadatas=[metadata],
                ids=[embedding_id]
            )
            
            logger.info(
                "Embedding added to ChromaDB",
                embedding_id=embedding_id,
                book_id=metadata.get("book_id")
            )
            return True
        except Exception as e:
            logger.error(
                "Failed to add embedding to ChromaDB",
                embedding_id=embedding_id,
                error=str(e),
                exc_info=True
            )
            return False
    
    async def get_embedding(self, embedding_id: str) -> Optional[Dict[str, Any]]:
        """Get embedding by ID from ChromaDB.
        
        Args:
            embedding_id: Embedding identifier
        
        Returns:
            Dict with embedding data or None if not found
        """
        try:
            result = self._collection.get(
                ids=[embedding_id],
                include=["embeddings", "metadatas", "documents"]
            )
            
            if result and result["ids"]:
                return {
                    "embedding_id": result["ids"][0],
                    "embedding": result["embeddings"][0],
                    "metadata": result["metadatas"][0],
                    "document": result["documents"][0]
                }
            return None
        except Exception as e:
            logger.error(
                "Failed to get embedding from ChromaDB",
                embedding_id=embedding_id,
                error=str(e)
            )
            return None
    
    async def query_similar(
        self,
        embedding: List[float],
        top_k: int = 10,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Query similar embeddings using cosine similarity.
        
        Args:
            embedding: Query embedding vector
            top_k: Number of results to return
            filter_metadata: Optional metadata filters
        
        Returns:
            List of similar embeddings with scores
        """
        try:
            results = self._collection.query(
                query_embeddings=[embedding],
                n_results=top_k,
                where=filter_metadata,
                include=["embeddings", "metadatas", "documents", "distances"]
            )
            
            similar_items = []
            if results and results["ids"]:
                for i in range(len(results["ids"][0])):
                    similar_items.append({
                        "embedding_id": results["ids"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "document": results["documents"][0][i],
                        "distance": results["distances"][0][i],
                        "similarity": 1.0 - results["distances"][0][i]  # Convert distance to similarity
                    })
            
            logger.debug(
                "ChromaDB similarity query completed",
                results_count=len(similar_items),
                top_k=top_k
            )
            return similar_items
        except Exception as e:
            logger.error("Failed to query similar embeddings", error=str(e), exc_info=True)
            return []
    
    async def delete_embedding(self, embedding_id: str) -> bool:
        """Delete embedding from ChromaDB.
        
        Args:
            embedding_id: Embedding identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self._collection.delete(ids=[embedding_id])
            logger.info("Embedding deleted from ChromaDB", embedding_id=embedding_id)
            return True
        except Exception as e:
            logger.error(
                "Failed to delete embedding from ChromaDB",
                embedding_id=embedding_id,
                error=str(e)
            )
            return False
    
    async def health_check(self) -> bool:
        """Check ChromaDB health."""
        try:
            # Try to get collection count
            count = self._collection.count()
            logger.debug("ChromaDB health check passed", count=count)
            return True
        except Exception as e:
            logger.error("ChromaDB health check failed", error=str(e))
            return False


# Singleton instance
chroma_client = ChromaDBClient()
