# python
from typing import Dict, Any, Optional

# project
from app.schemas.graph import Node, Edge, Graph
from app.core.graph_persistence import GraphPersistenceService

# 3rd party
import networkx as nx


class NetworkXGraph:
    """Graph implementation using NetworkX library with persistence (SOLID: SRP + DIP)."""

    def __init__(self, persistence_service: Optional[GraphPersistenceService] = None):
        """Initialize graph, optionally load from storage.

        Args:
            persistence_service (GraphPersistenceService, optional): Service for graph persistence.
                If provided and graph data exists, loads it. Defaults to creating new instance.
        """
        self.graph = nx.DiGraph()
        self._node_counter = 0
        self._persistence_service = persistence_service or GraphPersistenceService()

    def load_from_storage(self) -> None:
        """Load graph data from storage and populate the in-memory graph.

        This is called at application startup to restore the graph state.
        """
        try:
            graph_data = self._persistence_service.load_graph()
            if not graph_data.get("nodes"):
                return

            # Restore nodes
            for node_data in graph_data.get("nodes", []):
                node_id = node_data.get("id")
                if node_id:
                    # Update counter to ensure new IDs don't conflict
                    try:
                        self._node_counter = max(
                            self._node_counter, int(node_id))
                    except (ValueError, TypeError):
                        pass

                    self.graph.add_node(
                        node_id,
                        label=node_data.get("label", ""),
                        properties=node_data.get("properties", {}),
                    )

            # Restore edges
            for edge_data in graph_data.get("edges", []):
                source = edge_data.get("source")
                target = edge_data.get("target")
                if source and target and self.graph.has_node(source) and self.graph.has_node(target):
                    self.graph.add_edge(
                        source,
                        target,
                        weight=edge_data.get("weight", 1.0),
                    )
        except Exception as e:
            # Log error but don't fail - continue with empty graph
            from app.core.logging import get_logger
            logger = get_logger(__name__)
            logger.error(
                "Failed to load graph from storage",
                error=str(e),
            )

    def _generate_node_id(self) -> str:
        """Generate a unique node ID.

        Returns:
            str: A unique node ID
        """
        self._node_counter += 1
        return str(self._node_counter)

    def show_graph(self) -> Graph:
        """Show the graph structure.

        Returns:
            Graph: graph structure
        """
        nodes = [Node(id=str(n), label=self.graph.nodes[n]['label'],
                      properties=self.graph.nodes[n]['properties']) for n in self.graph.nodes]
        edges = [Edge(source=str(u), target=str(
            v), weight=self.graph.edges[u, v]['weight']) for u, v in self.graph.edges]
        return Graph(nodes=nodes, edges=edges)

    def _save_to_storage(self) -> None:
        """Save current graph state to storage (SOLID: SRP - persistence is delegated)."""
        try:
            graph_data = self._graph_to_dict()
            self._persistence_service.save_graph(graph_data)
        except Exception as e:
            # Log error but don't fail - graph changes are still applied in memory
            from app.core.logging import get_logger
            logger = get_logger(__name__)
            logger.error(
                "Failed to save graph to storage",
                error=str(e),
            )

    def _graph_to_dict(self) -> Dict[str, Any]:
        """Convert current graph to dictionary format for storage.

        Returns:
            Dict[str, Any]: Graph data with 'nodes' and 'edges' keys
        """
        graph = self.show_graph()
        return {
            "nodes": [
                {
                    "id": node.id,
                    "label": node.label,
                    "properties": node.properties,
                }
                for node in graph.nodes
            ],
            "edges": [
                {
                    "source": edge.source,
                    "target": edge.target,
                    "weight": edge.weight,
                }
                for edge in graph.edges
            ],
        }

    def add_node(self, label: str, properties: Dict[str, Any]) -> Node:
        """Add a node to the graph and save to storage.

        Args:
            label (str): Node label
            properties (Dict[str, Any]): Node properties

        Returns:
            Node: Added node
        """
        node_id = self._generate_node_id()
        self.graph.add_node(node_id, label=label, properties=properties)
        self._save_to_storage()
        return Node(id=node_id, label=label, properties=properties)

    def remove_node(self, node_id: str) -> bool:
        """Remove a node from the graph and save to storage.

        Args:
            node_id (str): Node ID

        Returns:
            bool: True if the node was removed, False otherwise
        """
        if self.graph.has_node(node_id):
            self.graph.remove_node(node_id)
            self._save_to_storage()
            return True
        return False

    def change_node(self, node_id: str, label: str, properties: Dict[str, Any]) -> bool:
        """Change a node in the graph and save to storage.

        Args:
            node_id (str): Node id
            label (str): Node label
            properties (Dict[str, Any]): Node properties

        Returns:
            bool: True if the node was changed, False otherwise
        """
        if self.graph.has_node(node_id):
            self.graph.nodes[node_id]['label'] = label
            self.graph.nodes[node_id]['properties'] = properties
            self._save_to_storage()
            return True
        return False

    def add_edge(self, source: str, target: str, weight: float) -> Edge:
        """Add an edge to the graph and save to storage.

        Args:
            source (str): Source node ID
            target (str): Target node ID
            weight (float): Edge weight

        Raises:
            ValueError: If both source and target nodes do not exist

        Returns:
            Edge: Added edge
        """
        if not self.graph.has_node(source) or not self.graph.has_node(target):
            raise ValueError("Both source and target nodes must exist.")

        self.graph.add_edge(source, target, weight=weight)
        self._save_to_storage()
        return Edge(source=source, target=target, weight=weight)

    def remove_edge(self, source: str, target: str) -> bool:
        """Remove an edge from the graph and save to storage.

        Args:
            source (str): Source node ID
            target (str): Target node ID

        Returns:
            bool: True if the edge was removed, False otherwise
        """
        if self.graph.has_edge(source, target):
            self.graph.remove_edge(source, target)
            self._save_to_storage()
            return True
        return False

    def find_node_by_property(self, property_key: str, property_value: Any) -> Optional[Node]:
        """Find a node by a specific property value.

        Args:
            property_key: The key of the property to search for
            property_value: The value of the property to match

        Returns:
            Node if found, None otherwise
        """
        for node_id in self.graph.nodes:
            node_properties = self.graph.nodes[node_id].get('properties', {})
            if node_properties.get(property_key) == property_value:
                return Node(
                    id=node_id,
                    label=self.graph.nodes[node_id]['label'],
                    properties=node_properties
                )
        return None


# Initialize the graph with persistence
graph_instance = NetworkXGraph()
