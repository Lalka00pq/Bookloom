# 3rd party
from fastapi import APIRouter, status

# project
from app.schemas.schemas import HealthCheckResponse
from app.core.config import settings
from app.core.redis_client import redis_client
from app.core.chroma_client import chroma_client
from app.core.logging import get_logger


router = APIRouter()
logger = get_logger(__name__)


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Check health status of ML service and its components (Redis, ChromaDB)"
)
async def health_check() -> HealthCheckResponse:
    """Perform health check on ML service components.
    
    Returns:
        HealthCheckResponse with service status and component health
    """
    components = {}
    
    # Check Redis
    try:
        redis_healthy = await redis_client.health_check()
        components["redis"] = "healthy" if redis_healthy else "unhealthy"
    except Exception as e:
        logger.error("Redis health check failed", error=str(e))
        components["redis"] = "unhealthy"
    
    # Check ChromaDB
    try:
        chroma_healthy = await chroma_client.health_check()
        components["chromadb"] = "healthy" if chroma_healthy else "unhealthy"
    except Exception as e:
        logger.error("ChromaDB health check failed", error=str(e))
        components["chromadb"] = "unhealthy"
    
    # Overall status
    all_healthy = all(status == "healthy" for status in components.values())
    overall_status = "healthy" if all_healthy else "degraded"
    
    logger.info(
        "Health check completed",
        status=overall_status,
        components=components
    )
    
    return HealthCheckResponse(
        status=overall_status,
        service=settings.app_name,
        version=settings.app_version,
        components=components
    )
