# python
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, Optional

# project
from app.core.logging import get_logger
from app.core.base_json_storage import BaseJsonStorage


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


class JsonGraphStorage(BaseJsonStorage, IGraphStorage):
    """JSON file-based graph storage implementation"""

    def __init__(self, file_path: Optional[Path] = None) -> None:
        """Initialize JSON storage.

        Args:
            file_path (Path, optional): Path to graph JSON file.
                Defaults to app/backend/app/data/graph.json
        """
        if file_path is None:
            file_path = Path(__file__).parent.parent / "data" / "graph.json"
        
        super().__init__(file_path=Path(file_path), entity_name="Graph")

    def load_graph(self) -> Dict[str, Any]:
        """Load graph data from JSON file.

        If file doesn't exist or is empty, returns empty graph structure.

        Returns:
            Dict[str, Any]: Graph data with 'nodes' and 'edges' keys
        """
        data = self._load_json(empty_value={"nodes": [], "edges": []})
        
        # Log specific details if data was loaded successfully and is not the empty default
        # (Technically _load_json already logged generic success or failure)
        if data and (data.get("nodes") or data.get("edges")):
             logger.info(
                "Graph detailed stats",
                nodes_count=len(data.get("nodes", [])),
                edges_count=len(data.get("edges", [])),
            )
        return data

    def save_graph(self, graph_data: Dict[str, Any]) -> None:
        """Save graph data to JSON file.

        Args:
            graph_data (Dict[str, Any]): Graph data with 'nodes' and 'edges' keys

        Raises:
            IOError: If write operation fails
        """
        self._save_json(graph_data)


class GraphPersistenceService:
    """Service for managing graph persistence"""

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
