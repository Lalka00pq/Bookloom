# python
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, Optional

# project
from app.core.logging import get_logger


logger = get_logger(__name__)


class IRecommendationsStorage(ABC):
    """Interface for recommendations storage (SOLID: ISP - Interface Segregation Principle)."""

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


class JsonRecommendationsStorage(IRecommendationsStorage):
    """JSON file-based recommendations storage implementation (SOLID: SRP - Single Responsibility)."""

    def __init__(self, file_path: Optional[Path] = None) -> None:
        """Initialize JSON storage.

        Args:
            file_path (Path, optional): Path to recommendations JSON file.
                Defaults to app/backend/app/data/recommendations.json
        """
        if file_path is None:
            file_path = Path(__file__).parent.parent / \
                "data" / "recommendations.json"

        self.file_path = Path(file_path)
        self._ensure_storage_directory()

    def _ensure_storage_directory(self) -> None:
        """Ensure the storage directory exists."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        logger.debug(
            "Recommendations storage directory ensured",
            path=str(self.file_path.parent),
        )

    def load_recommendations(self) -> Dict[str, Any]:
        """Load recommendations from JSON file.

        If file doesn't exist or is empty, returns empty recommendations structure.

        Returns:
            Dict[str, Any]: Recommendations data with 'user_id' and 'recommendations' keys
        """
        try:
            if not self.file_path.exists():
                logger.info(
                    "Recommendations storage file does not exist, returning empty recommendations",
                    path=str(self.file_path),
                )
                return {"user_id": "", "recommendations": []}

            with open(self.file_path, "r", encoding="utf-8") as f:
                content = f.read().strip()

            if not content:
                logger.info(
                    "Recommendations storage file is empty, returning empty recommendations",
                    path=str(self.file_path),
                )
                return {"user_id": "", "recommendations": []}

            data = json.loads(content)
            logger.info(
                "Recommendations loaded from storage",
                path=str(self.file_path),
                user_id=data.get("user_id"),
                recommendations_count=len(data.get("recommendations", [])),
            )
            return data

        except json.JSONDecodeError as e:
            logger.error(
                "Failed to parse recommendations JSON file",
                path=str(self.file_path),
                error=str(e),
            )
            return {"user_id": "", "recommendations": []}
        except IOError as e:
            logger.error(
                "Failed to read recommendations file",
                path=str(self.file_path),
                error=str(e),
            )
            raise

    def save_recommendations(self, recommendations_data: Dict[str, Any]) -> None:
        """Save recommendations to JSON file.

        Args:
            recommendations_data (Dict[str, Any]): Recommendations data with 'user_id' and 'recommendations' keys

        Raises:
            IOError: If write operation fails
        """
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(recommendations_data, f,
                          ensure_ascii=False, indent=2)

            logger.info(
                "Recommendations saved to storage",
                path=str(self.file_path),
                user_id=recommendations_data.get("user_id"),
                recommendations_count=len(
                    recommendations_data.get("recommendations", [])),
            )
        except IOError as e:
            logger.error(
                "Failed to save recommendations file",
                path=str(self.file_path),
                error=str(e),
            )
            raise


class RecommendationsPersistenceService:
    """Service for managing recommendations persistence (SOLID: SRP, DIP - Dependency Inversion)."""

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
