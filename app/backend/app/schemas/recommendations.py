from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


class UserRecommendationsRequest(BaseModel):
    """
    Request for getting recommendations for user.
    """

    user_id: str = Field(..., description="User identifier")
    limit: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Max number of recommendations",
    )


class BookRecommendation(BaseModel):
    """
    Description of a book recommendation.
    """

    book_id: Optional[str] = Field(
        default=None, description="Book's id in graph (optional)"
    )
    title: str = Field(..., description="Book's name")
    author: Optional[str] = Field(
        default=None, description="Book's author"
    )
    reason: Optional[str] = Field(
        default=None,
        description="Short description of the reason for recommendation",
    )
    score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Relevancy score of the recommendation",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata of the book",
    )


class RecommendationsResponse(BaseModel):
    """Response for getting recommendations for user."""

    user_id: str = Field(..., description="User's identifier")
    recommendations: List[BookRecommendation] = Field(
        default_factory=list, description="Books recommendations list"
    )
