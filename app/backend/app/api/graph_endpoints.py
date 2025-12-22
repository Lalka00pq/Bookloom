# python
from typing import Dict

# project
from app.schemas.graph import AddNodeRequest, ChangeNodeRequest, AddEdgeRequest, Graph, Node, Edge
from app.core.graph import graph_instance


# 3rd party
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/show_graph")
async def show_graph() -> Graph:
    """Show graph structure

    Returns:
        Graph: graph structure
    """
    return graph_instance.show_graph()


@router.post("/add_node")
async def add_node(request: AddNodeRequest) -> Node:
    """Add node to graph

    Args:
        request (AddNodeRequest): request with label and properties of the node

    Returns:
        Node: new node
    """
    new_node = graph_instance.add_node(request.label, request.properties)
    return new_node


@router.delete("/remove_node/{node_id}")
async def remove_node(node_id: str) -> Dict[str, str]:
    """Remove node from graph

    Args:
        node_id (str): id of the node to remove

    Raises:
        HTTPException: if the node is not found

    Returns:
        dict: message about the success of the operation
    """
    if not graph_instance.remove_node(node_id):
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node removed successfully"}


@router.put("/change_node/{node_id}")
async def change_node(node_id: str, request: ChangeNodeRequest) -> Dict[str, str]:
    """Change node in graph

    Args:
        node_id (str): id of the node to change
        request (ChangeNodeRequest): request with label and properties of the node

    Raises:
        HTTPException: if the node is not found

    Returns:
        dict: message about the success of the operation
    """
    if not graph_instance.change_node(node_id, request.label, request.properties):
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node changed successfully"}


@router.post("/add_edge")
async def add_edge(request: AddEdgeRequest) -> Edge:
    """Add edge to graph

    Args:
        request (AddEdgeRequest): request with source, target and weight of the edge

    Raises:
        HTTPException: if the source or target node is not found

    Returns:
        Edge: new edge
    """
    try:
        new_edge = graph_instance.add_edge(
            request.source, request.target, request.weight)
        return new_edge
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/remove_edge/{source_id}/{target_id}")
async def remove_edge(source_id: str, target_id: str) -> Dict[str, str]:
    """Remove edge from graph

    Args:
        source_id (str): id of the source node
        target_id (str): id of the target node

    Raises:
        HTTPException: if the edge is not found

    Returns:
        dict: message about the success of the operation
    """
    if not graph_instance.remove_edge(source_id, target_id):
        raise HTTPException(status_code=404, detail="Edge not found")
    return {"message": "Edge removed successfully"}
