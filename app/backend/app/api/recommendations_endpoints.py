from fastapi import APIRouter, HTTPException

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

router = APIRouter()
logger = get_logger(__name__)

recommendation_service: IRecommendationService = GeminiRecommendationService()


@router.post(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="Получить рекомендации книг на основе графа пользователя",
)
async def get_user_recommendations(
    request: UserRecommendationsRequest,
) -> RecommendationsResponse:
    """
    Проанализировать граф прочитанных книг пользователя и получить рекомендации
    от модели Google Gemini.
    """
    logger.info(
        "Generating recommendations for user",
        user_id=request.user_id,
        limit=request.limit,
    )

    try:
        # Получаем актуальное состояние графа из единого инстанса
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
        # Пробрасываем HTTP-исключения как есть
        raise
    except Exception as exc:
        logger.error(
            "Failed to generate recommendations",
            user_id=request.user_id,
            error=str(exc),
            error_type=type(exc).__name__,
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to generate recommendations",
        ) from exc
