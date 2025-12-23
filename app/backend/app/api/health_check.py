from typing import Dict

from fastapi import APIRouter
from app.core.logging import get_logger

router = APIRouter(
    prefix="/health",
    tags=["health-check"],
)

logger = get_logger(__name__)


@router.get("/check", summary="Health Check Endpoint",
            description="Check if the API is running",
            response_model=Dict[str, str],
            status_code=200)
async def health_check() -> Dict[str, str]:
    """Check if the API is running

    Returns:
        Dict[str, str]: message about the success of the operation
    """
    logger.debug("Health check requested")
    return {"status": "200 OK"}
