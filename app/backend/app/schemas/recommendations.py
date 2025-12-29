from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


class UserRecommendationsRequest(BaseModel):
    """
    Запрос на получение рекомендаций для пользователя на основе его графа прочитанных книг.
    Сам граф на вход не передаётся – он извлекается на стороне backend из текущего состояния.
    """

    user_id: str = Field(..., description="Идентификатор пользователя")
    limit: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Максимальное количество рекомендаций",
    )


class BookRecommendation(BaseModel):
    """
    Описание одной рекомендованной книги.
    Поля сделаны максимально гибкими, чтобы их можно было масштабировать без смены контракта.
    """

    book_id: Optional[str] = Field(
        default=None, description="Идентификатор книги во внутренней системе/графе"
    )
    title: str = Field(..., description="Название книги")
    author: Optional[str] = Field(
        default=None, description="Автор книги, если доступен"
    )
    reason: Optional[str] = Field(
        default=None,
        description="Краткое текстовое объяснение, почему эта книга рекомендована",
    )
    score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Нормализованный скор релевантности рекомендации (0-1)",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Произвольные дополнительные метаданные от модели (жанр, теги и т.п.)",
    )


class RecommendationsResponse(BaseModel):
    """Ответ эндпоинта с рекомендациями для пользователя."""

    user_id: str = Field(..., description="Идентификатор пользователя")
    recommendations: List[BookRecommendation] = Field(
        default_factory=list, description="Список рекомендованных книг"
    )


