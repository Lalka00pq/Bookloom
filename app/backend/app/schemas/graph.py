from typing import Dict, Any, List
from pydantic import BaseModel


class Node(BaseModel):
    id: str
    label: str
    properties: Dict[str, Any]


class Edge(BaseModel):
    source: str
    target: str
    weight: float = 1.0


class Graph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class AddNodeRequest(BaseModel):
    label: str
    properties: Dict[str, Any]


class ChangeNodeRequest(BaseModel):
    label: str
    properties: Dict[str, Any]


class AddEdgeRequest(BaseModel):
    source: str
    target: str
    weight: float = 1.0
