# python
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, Optional

# project
from app.core.logging import get_logger


logger = get_logger(__name__)


class IGraphStorage(ABC):
    """Interface for graph storage"""

    @abstractmethod
    def load_graph(self) -> Dict[str, Any]:
        """Load graph data from storage.

        Returns:
            Dict[str, Any]: Graph data with 'nodes' and 'edges' keys
        """
        raise NotImplementedError

    @abstractmethod
    def save_graph(self, graph_data: Dict[str, Any]) -> None:
        """Save graph data to storage.

        Args:
            graph_data (Dict[str, Any]): Graph data with 'nodes' and 'edges' keys

        Raises:
            IOError: If save operation fails
        """
        raise NotImplementedError


class JsonGraphStorage(IGraphStorage):
    """JSON file-based graph storage implementation"""

    def __init__(self, file_path: Optional[Path] = None) -> None:
        """Initialize JSON storage.

        Args:
            file_path (Path, optional): Path to graph JSON file.
                Defaults to app/backend/app/data/graph.json
        """
        if file_path is None:
            file_path = Path(__file__).parent.parent / "data" / "graph.json"

        self.file_path = Path(file_path)
        self._ensure_storage_directory()

    def _ensure_storage_directory(self) -> None:
        """Ensure the storage directory exists."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        logger.debug(
            "Graph storage directory ensured",
            path=str(self.file_path.parent),
        )

    def load_graph(self) -> Dict[str, Any]:
        """Load graph data from JSON file.

        If file doesn't exist or is empty, returns empty graph structure.

        Returns:
            Dict[str, Any]: Graph data with 'nodes' and 'edges' keys
        """
        try:
            if not self.file_path.exists():
                logger.info(
                    "Graph storage file does not exist, returning empty graph",
                    path=str(self.file_path),
                )
                return {"nodes": [], "edges": []}

            with open(self.file_path, "r", encoding="utf-8") as f:
                content = f.read().strip()

            if not content:
                logger.info(
                    "Graph storage file is empty, returning empty graph",
                    path=str(self.file_path),
                )
                return {"nodes": [], "edges": []}

            data = json.loads(content)
            logger.info(
                "Graph loaded from storage",
                path=str(self.file_path),
                nodes_count=len(data.get("nodes", [])),
                edges_count=len(data.get("edges", [])),
            )
            return data

        except json.JSONDecodeError as e:
            logger.error(
                "Failed to parse graph JSON file",
                path=str(self.file_path),
                error=str(e),
            )
            return {"nodes": [], "edges": []}
        except IOError as e:
            logger.error(
                "Failed to read graph file",
                path=str(self.file_path),
                error=str(e),
            )
            raise

    def save_graph(self, graph_data: Dict[str, Any]) -> None:
        """Save graph data to JSON file.

        Args:
            graph_data (Dict[str, Any]): Graph data with 'nodes' and 'edges' keys

        Raises:
            IOError: If write operation fails
        """
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(graph_data, f, ensure_ascii=False, indent=2)

            logger.info(
                "Graph saved to storage",
                path=str(self.file_path),
                nodes_count=len(graph_data.get("nodes", [])),
                edges_count=len(graph_data.get("edges", [])),
            )
        except IOError as e:
            logger.error(
                "Failed to save graph file",
                path=str(self.file_path),
                error=str(e),
            )
            raise


class GraphPersistenceService:
    """Service for managing graph persistence (SOLID: SRP, DIP - Dependency Inversion)."""

    def __init__(self, storage: Optional[IGraphStorage] = None) -> None:
        """Initialize persistence service.

        Args:
            storage (IGraphStorage, optional): Graph storage implementation.
                Defaults to JsonGraphStorage with default path.
        """
        self.storage = storage or JsonGraphStorage()

    def load_graph(self) -> Dict[str, Any]:
        """Load graph from storage.

        Returns:
            Dict[str, Any]: Graph data with 'nodes' and 'edges' keys
        """
        return self.storage.load_graph()

    def save_graph(self, graph_data: Dict[str, Any]) -> None:
        """Save graph to storage.

        Args:
            graph_data (Dict[str, Any]): Graph data with 'nodes' and 'edges' keys
        """
        self.storage.save_graph(graph_data)


# Global persistence service instance
persistence_service = GraphPersistenceService()
