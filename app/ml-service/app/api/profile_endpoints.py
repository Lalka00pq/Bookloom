# python
import time

# 3rd party
from fastapi import APIRouter, HTTPException, status

# project
from app.schemas.schemas import ProfileRequest, ProfileResponse
from app.agents.profile_agent import profile_agent
from app.core.logging import get_logger


router = APIRouter()
logger = get_logger(__name__)


@router.post(
    "/books/profile",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create semantic profile for a book",
    description="Generates semantic profile, embeddings, and stores them in vector DB with Redis caching"
)
async def create_book_profile(request: ProfileRequest) -> ProfileResponse:
    """Create semantic profile for a book.
    
    This endpoint:
    1. Checks Redis cache for existing profile
    2. If not  cached, generates profile using Gemini LLM
    3. Creates embedding using Gemini Embeddings API
    4. Stores embedding in ChromaDB vector database
    5. Caches profile in Redis (30 days TTL)
    
    Args:
        request: ProfileRequest with book metadata
    
    Returns:
        ProfileResponse with generated profile
    
    Raises:
        HTTPException: If profile creation fails
    """
    start_time = time.time()
    
    logger.info(
        "Profile creation requested",
        book_id=request.book_metadata.book_id,
        title=request.book_metadata.title,
        user_id=request.user_id
    )
    
    try:
        # Create profile using Profile Agent
        profile = await profile_agent.create_profile(
            book_metadata=request.book_metadata,
            user_id=request.user_id
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        # Check if it was served from cache (heuristic: very fast response)
        cached = processing_time < 100  # Less than 100ms likely from cache
        
        logger.info(
            "Profile created successfully",
            book_id=request.book_metadata.book_id,
            embedding_id=profile.embedding_id,
            cached=cached,
            processing_time_ms=f"{processing_time:.2f}"
        )
        
        return ProfileResponse(
            profile=profile,
            embedding_stored=True,
            cached=cached,
            processing_time_ms=processing_time
        )
    
    except Exception as e:
        logger.error(
            "Failed to create profile",
            book_id=request.book_metadata.book_id,
            error=str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create book profile: {str(e)}"
        )
