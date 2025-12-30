# python
from typing import Dict, Any, Optional

# project
from app.schemas.graph import Node, Edge, Graph

# 3rd party
import networkx as nx


class NetworkXGraph:
    """Graph implementation using NetworkX library."""

    def __init__(self):
        """Initialize an empty graph."""
        self.graph = nx.DiGraph()
        self._node_counter = 0

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

    def add_node(self, label: str, properties: Dict[str, Any]) -> Node:
        """Add a node to the graph.

        Args:
            label (str): Node label
            properties (Dict[str, Any]): Node properties

        Returns:
            Node: Added node
        """
        node_id = self._generate_node_id()
        self.graph.add_node(node_id, label=label, properties=properties)
        return Node(id=node_id, label=label, properties=properties)

    def remove_node(self, node_id: str) -> bool:
        """Remove a node from the graph.

        Args:
            node_id (str): Node ID

        Returns:
            bool: True if the node was removed, False otherwise
        """
        if self.graph.has_node(node_id):
            self.graph.remove_node(node_id)
            return True
        return False

    def change_node(self, node_id: str, label: str, properties: Dict[str, Any]) -> bool:
        """Change a node in the graph.

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
            return True
        return False

    def add_edge(self, source: str, target: str, weight: float) -> Edge:
        """Add an edge to the graph.

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
        return Edge(source=source, target=target, weight=weight)

    def remove_edge(self, source: str, target: str) -> bool:
        """Remove an edge from the graph.

        Args:
            source (str): Source node ID
            target (str): Target node ID

        Returns:
            bool: True if the edge was removed, False otherwise
        """
        if self.graph.has_edge(source, target):
            self.graph.remove_edge(source, target)
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


# Initialize the graph
graph_instance = NetworkXGraph()
