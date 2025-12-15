from typing import Dict, Any, List
from app.schemas.graph import Node, Edge, Graph


class InMemoryGraph:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []

    def show_graph(self) -> Graph:
        return Graph(nodes=list(self.nodes.values()), edges=self.edges)

    def add_node(self, label: str, properties: Dict[str, Any]) -> Node:
        node_id = str(len(self.nodes) + 1)
        new_node = Node(id=node_id, label=label, properties=properties)
        self.nodes[node_id] = new_node
        return new_node

    def remove_node(self, node_id: str) -> bool:
        if node_id in self.nodes:
            del self.nodes[node_id]
            self.edges = [edge for edge in self.edges if edge.source !=
                          node_id and edge.target != node_id]
            return True
        return False

    def change_node(self, node_id: str, label: str, properties: Dict[str, Any]) -> bool:
        if node_id in self.nodes:
            self.nodes[node_id].label = label
            self.nodes[node_id].properties = properties
            return True
        return False

    def add_edge(self, source: str, target: str, weight: float) -> Edge:
        if source not in self.nodes or target not in self.nodes:
            raise ValueError("Both source and target nodes must exist.")

        new_edge = Edge(source=source, target=target, weight=weight)
        self.edges.append(new_edge)
        return new_edge


# Create a singleton instance of the graph
graph_instance = InMemoryGraph()
