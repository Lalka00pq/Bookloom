from typing import Dict

from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["health-check"],
)


@router.get("/check", summary="Health Check Endpoint",
            description="Check if the API is running",
            response_model=Dict[str, str],
            status_code=200)
async def health_check() -> Dict[str, str]:
    """Check if the API is running

    Returns:
        Dict[str, str]: message about the success of the operation
    """
    return {"status": "200 OK"}
