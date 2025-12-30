# python
from typing import Dict, Any, List

# 3rd party
from pydantic import BaseModel


class Node(BaseModel):
    """Node representation."""
    id: str
    label: str
    properties: Dict[str, Any]


class Edge(BaseModel):
    """Edge representation."""
    source: str
    target: str
    weight: float = 1.0


class Graph(BaseModel):
    """Graph representation."""
    nodes: List[Node]
    edges: List[Edge]


class AddNodeRequest(BaseModel):
    """Add node request."""
    label: str
    properties: Dict[str, Any]


class ChangeNodeRequest(BaseModel):
    """Change node request."""
    label: str
    properties: Dict[str, Any]


class AddEdgeRequest(BaseModel):
    """Add edge request."""
    source: str
    target: str
    weight: float = 1.0
