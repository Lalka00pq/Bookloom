# python
from typing import Dict, Any, Optional

# project
from app.schemas.graph import Node, Edge, Graph
from app.core.graph_persistence import GraphPersistenceService

# 3rd party
import networkx as nx


class NetworkXGraph:
    """Wrapper for NetworkX library operations"""

    def __init__(self):
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, label: str, properties: Dict[str, Any]) -> Node:
        self.graph.add_node(node_id, label=label, properties=properties)
        return Node(id=node_id, label=label, properties=properties)

    def remove_node(self, node_id: str) -> bool:
        if self.graph.has_node(node_id):
            self.graph.remove_node(node_id)
            return True
        return False

    def change_node(self, node_id: str, label: str, properties: Dict[str, Any]) -> bool:
        if self.graph.has_node(node_id):
            self.graph.nodes[node_id]['label'] = label
            self.graph.nodes[node_id]['properties'] = properties
            return True
        return False

    def add_edge(self, source: str, target: str, weight: float) -> Edge:
        if not self.graph.has_node(source) or not self.graph.has_node(target):
            raise ValueError("Both source and target nodes must exist.")
        self.graph.add_edge(source, target, weight=weight)
        return Edge(source=source, target=target, weight=weight)

    def remove_edge(self, source: str, target: str) -> bool:
        if self.graph.has_edge(source, target):
            self.graph.remove_edge(source, target)
            return True
        return False

    def get_structure(self) -> Graph:
        nodes = [Node(id=str(n), label=self.graph.nodes[n]['label'],
                      properties=self.graph.nodes[n]['properties']) for n in self.graph.nodes]
        edges = [Edge(source=str(u), target=str(
            v), weight=self.graph.edges[u, v]['weight']) for u, v in self.graph.edges]
        return Graph(nodes=nodes, edges=edges)

    def find_node_by_property(self, property_key: str, property_value: Any) -> Optional[Node]:
        for node_id in self.graph.nodes:
            node_properties = self.graph.nodes[node_id].get('properties', {})
            if node_properties.get(property_key) == property_value:
                return Node(
                    id=node_id,
                    label=self.graph.nodes[node_id]['label'],
                    properties=node_properties
                )
        return None

    def has_node(self, node_id: str) -> bool:
        return self.graph.has_node(node_id)


class IdGenerator:
    """Manages unique ID generation"""

    def __init__(self, start_id: int = 0):
        self._counter = start_id

    def next_id(self) -> str:
        self._counter += 1
        return str(self._counter)

    def sync_with_existing_ids(self, nodes: list[Dict[str, Any]]) -> None:
        for node in nodes:
            node_id = node.get("id")
            if node_id:
                try:
                    self._counter = max(self._counter, int(node_id))
                except (ValueError, TypeError):
                    pass


class GraphManager:
    """Orchestrates graph operations, persistence and ID generation"""

    def __init__(
        self,
        graph: Optional[NetworkXGraph] = None,
        persistence_service: Optional[GraphPersistenceService] = None,
        id_generator: Optional[IdGenerator] = None
    ):
        self._graph = graph or NetworkXGraph()
        self._persistence_service = persistence_service or GraphPersistenceService()
        self._id_generator = id_generator or IdGenerator()
        self.load_from_storage()

    def load_from_storage(self) -> None:
        """Load graph data from storage and populate the in-memory graph."""
        try:
            graph_data = self._persistence_service.load_graph()
            nodes = graph_data.get("nodes", [])
            edges = graph_data.get("edges", [])

            if not nodes:
                return

            self._id_generator.sync_with_existing_ids(nodes)

            for node_data in nodes:
                self._graph.add_node(
                    node_id=node_data.get("id"),
                    label=node_data.get("label", ""),
                    properties=node_data.get("properties", {}),
                )

            for edge_data in edges:
                source = edge_data.get("source")
                target = edge_data.get("target")
                if source and target and self._graph.has_node(source) and self._graph.has_node(target):
                    self._graph.add_edge(
                        source,
                        target,
                        weight=edge_data.get("weight", 1.0),
                    )
        except Exception as e:
            from app.core.logging import get_logger
            logger = get_logger(__name__)
            logger.error("Failed to load graph from storage", error=str(e))

    def _save_to_storage(self) -> None:
        """Save current graph state to storage."""
        try:
            graph_struct = self._graph.get_structure()
            # Convert to dict for persistence layer
            graph_data = graph_struct.model_dump()
            self._persistence_service.save_graph(graph_data)
        except Exception as e:
            from app.core.logging import get_logger
            logger = get_logger(__name__)
            logger.error("Failed to save graph to storage", error=str(e))

    def show_graph(self) -> Graph:
        return self._graph.get_structure()

    def add_node(self, label: str, properties: Dict[str, Any]) -> Node:
        node_id = self._id_generator.next_id()
        new_node = self._graph.add_node(node_id, label, properties)
        self._save_to_storage()
        return new_node

    def remove_node(self, node_id: str) -> bool:
        success = self._graph.remove_node(node_id)
        if success:
            self._save_to_storage()
        return success

    def change_node(self, node_id: str, label: str, properties: Dict[str, Any]) -> bool:
        success = self._graph.change_node(node_id, label, properties)
        if success:
            self._save_to_storage()
        return success

    def add_edge(self, source: str, target: str, weight: float) -> Edge:
        new_edge = self._graph.add_edge(source, target, weight)
        self._save_to_storage()
        return new_edge

    def remove_edge(self, source: str, target: str) -> bool:
        success = self._graph.remove_edge(source, target)
        if success:
            self._save_to_storage()
        return success

    def find_node_by_property(self, property_key: str, property_value: Any) -> Optional[Node]:
        return self._graph.find_node_by_property(property_key, property_value)


# Initialize the graph orchestrator
graph_instance = GraphManager()

