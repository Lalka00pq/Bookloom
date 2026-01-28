# python
import json
from pathlib import Path
from typing import Dict, Any, Optional

# project
from app.core.logging import get_logger

logger = get_logger(__name__)


class BaseJsonStorage:
    """Base class for JSON file storage"""

    def __init__(self, file_path: Path, entity_name: str = "Data"):
        self.file_path = file_path
        self.entity_name = entity_name
        self._ensure_storage_directory()

    def _ensure_storage_directory(self) -> None:
        """Ensure the storage directory exists."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        logger.debug(
            f"{self.entity_name} storage directory ensured",
            path=str(self.file_path.parent),
        )

    def _load_json(self, empty_value: Dict[str, Any]) -> Dict[str, Any]:
        """Generic method to load JSON data.
        
        Args:
            empty_value (Dict[str, Any]): Value to return if file doesn't exist, is empty or invalid.
            
        Returns:
            Dict[str, Any]: Loaded data or empty_value
        """
        try:
            if not self.file_path.exists():
                logger.info(
                    f"{self.entity_name} storage file does not exist, returning empty value",
                    path=str(self.file_path),
                )
                return empty_value

            with open(self.file_path, "r", encoding="utf-8") as f:
                content = f.read().strip()

            if not content:
                logger.info(
                    f"{self.entity_name} storage file is empty, returning empty value",
                    path=str(self.file_path),
                )
                return empty_value

            data = json.loads(content)
            # Subclasses can add specific logging after calling this method
            return data

        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse {self.entity_name} JSON file",
                path=str(self.file_path),
                error=str(e),
            )
            return empty_value
        except IOError as e:
            logger.error(
                f"Failed to read {self.entity_name} file",
                path=str(self.file_path),
                error=str(e),
            )
            raise

    def _save_json(self, data: Dict[str, Any]) -> None:
        """Generic method to save JSON data.
        
        Args:
            data (Dict[str, Any]): Data to save
        """
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            logger.info(
                f"{self.entity_name} saved to storage",
                path=str(self.file_path),
            )
        except IOError as e:
            logger.error(
                f"Failed to save {self.entity_name} file",
                path=str(self.file_path),
                error=str(e),
            )
            raise
