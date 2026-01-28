# project
from app.core.graph import graph_instance
from app.core.logging import get_logger
from app.core.recommendation_service import (
    GeminiRecommendationService,
    IRecommendationService,
)
from app.schemas.recommendations import (
    RecommendationsResponse,
    UserRecommendationsRequest,
)

# 3rd party
from fastapi import APIRouter, HTTPException
from app.core.error_utils import handle_endpoint_error

router = APIRouter()
logger = get_logger(__name__)

recommendation_service: IRecommendationService = GeminiRecommendationService()


@router.post(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="Getting recommendations for user",
)
async def get_user_recommendations(
    request: UserRecommendationsRequest,
) -> RecommendationsResponse:
    """
    Analysis of user's graph to get recommendations for him
    """
    logger.info(
        "Generating recommendations for user",
        user_id=request.user_id,
        limit=request.limit,
    )

    try:
        # Get graph state from instance
        graph = graph_instance.show_graph()

        recommendations = await recommendation_service.get_recommendations(
            user_id=request.user_id,
            graph=graph,
            limit=request.limit,
        )

        logger.info(
            "Recommendations successfully generated",
            user_id=request.user_id,
            recommendations_count=len(recommendations.recommendations),
        )

        return recommendations
    except HTTPException:
        raise
    except Exception as exc:
        handle_endpoint_error(
            exc=exc, 
            logger=logger, 
            message="Failed to generate recommendations",
            user_id=request.user_id
        )


@router.get(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="Get saved recommendations",
    description="Retrieve previously saved recommendations from storage",
)
async def get_saved_recommendations() -> RecommendationsResponse:
    """
    Get previously saved recommendations from storage.

    This endpoint returns the last set of recommendations that were generated
    and saved to storage. If no recommendations exist, returns an empty response.

    Returns:
        RecommendationsResponse: Saved recommendations or empty response
    """
    logger.info("Retrieving saved recommendations from storage")

    try:
        recommendations = recommendation_service.load_saved_recommendations()

        logger.info(
            "Saved recommendations retrieved",
            user_id=recommendations.user_id,
            recommendations_count=len(recommendations.recommendations),
        )

        return recommendations
    except Exception as exc:
        handle_endpoint_error(
            exc=exc,
            logger=logger,
            message="Failed to retrieve saved recommendations",
        )
