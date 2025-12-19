from typing import Dict, Any, List
import networkx as nx
from app.schemas.graph import Node, Edge, Graph


class NetworkXGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._node_counter = 0

    def _generate_node_id(self) -> str:
        self._node_counter += 1
        return str(self._node_counter)

    def show_graph(self) -> Graph:
        nodes = [Node(id=str(n), label=self.graph.nodes[n]['label'],
                      properties=self.graph.nodes[n]['properties']) for n in self.graph.nodes]
        edges = [Edge(source=str(u), target=str(
            v), weight=self.graph.edges[u, v]['weight']) for u, v in self.graph.edges]
        return Graph(nodes=nodes, edges=edges)

    def add_node(self, label: str, properties: Dict[str, Any]) -> Node:
        node_id = self._generate_node_id()
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


# Create a singleton instance of the graph
graph_instance = NetworkXGraph()
