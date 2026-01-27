# python
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, Optional

# project
from app.core.logging import get_logger
from app.core.base_json_storage import BaseJsonStorage


logger = get_logger(__name__)


class IRecommendationsStorage(ABC):
    """Interface for recommendations storage"""

    @abstractmethod
    def load_recommendations(self) -> Dict[str, Any]:
        """Load recommendations from storage.

        Returns:
            Dict[str, Any]: Recommendations data with 'user_id' and 'recommendations' keys
        """
        raise NotImplementedError

    @abstractmethod
    def save_recommendations(self, recommendations_data: Dict[str, Any]) -> None:
        """Save recommendations to storage.

        Args:
            recommendations_data (Dict[str, Any]): Recommendations data with 'user_id' and 'recommendations' keys

        Raises:
            IOError: If save operation fails
        """
        raise NotImplementedError


class JsonRecommendationsStorage(BaseJsonStorage, IRecommendationsStorage):
    """JSON file-based recommendations storage implementation"""

    def __init__(self, file_path: Optional[Path] = None) -> None:
        """Initialize JSON storage.

        Args:
            file_path (Path, optional): Path to recommendations JSON file.
                Defaults to app/backend/app/data/recommendations.json
        """
        if file_path is None:
            file_path = Path(__file__).parent.parent / \
                "data" / "recommendations.json"
        
        super().__init__(file_path=Path(file_path), entity_name="Recommendations")

    def load_recommendations(self) -> Dict[str, Any]:
        """Load recommendations from JSON file.

        If file doesn't exist or is empty, returns empty recommendations structure.

        Returns:
            Dict[str, Any]: Recommendations data with 'user_id' and 'recommendations' keys
        """
        data = self._load_json(empty_value={"user_id": "", "recommendations": []})
        
        if data and data.get("user_id"):
             logger.info(
                "Recommendations detailed stats",
                user_id=data.get("user_id"),
                recommendations_count=len(data.get("recommendations", [])),
            )
        return data

    def save_recommendations(self, recommendations_data: Dict[str, Any]) -> None:
        """Save recommendations to JSON file.

        Args:
            recommendations_data (Dict[str, Any]): Recommendations data with 'user_id' and 'recommendations' keys

        Raises:
            IOError: If write operation fails
        """
        self._save_json(recommendations_data)


class RecommendationsPersistenceService:
    """Service for managing recommendations persistence"""

    def __init__(self, storage: Optional[IRecommendationsStorage] = None) -> None:
        """Initialize persistence service.

        Args:
            storage (IRecommendationsStorage, optional): Recommendations storage implementation.
                Defaults to JsonRecommendationsStorage with default path.
        """
        self.storage = storage or JsonRecommendationsStorage()

    def load_recommendations(self) -> Dict[str, Any]:
        """Load recommendations from storage.

        Returns:
            Dict[str, Any]: Recommendations data with 'user_id' and 'recommendations' keys
        """
        return self.storage.load_recommendations()

    def save_recommendations(self, recommendations_data: Dict[str, Any]) -> None:
        """Save recommendations to storage.

        Args:
            recommendations_data (Dict[str, Any]): Recommendations data with 'user_id' and 'recommendations' keys
        """
        self.storage.save_recommendations(recommendations_data)


# Global persistence service instance
persistence_service = RecommendationsPersistenceService()
