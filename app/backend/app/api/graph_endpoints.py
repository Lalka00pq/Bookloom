from fastapi import APIRouter, HTTPException
from app.schemas.graph import AddNodeRequest, ChangeNodeRequest, AddEdgeRequest
from app.core.graph import graph_instance

router = APIRouter()


@router.get("/show_graph")
async def show_graph():
    """Show graph structure"""
    return graph_instance.show_graph()


@router.post("/add_node")
async def add_node(request: AddNodeRequest):
    """Add node to graph"""
    new_node = graph_instance.add_node(request.label, request.properties)
    return new_node


@router.delete("/remove_node/{node_id}")
async def remove_node(node_id: str):
    if not graph_instance.remove_node(node_id):
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node removed successfully"}


@router.put("/change_node/{node_id}")
async def change_node(node_id: str, request: ChangeNodeRequest):
    if not graph_instance.change_node(node_id, request.label, request.properties):
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node changed successfully"}


@router.post("/add_edge")
async def add_edge(request: AddEdgeRequest):
    try:
        new_edge = graph_instance.add_edge(
            request.source, request.target, request.weight)
        return new_edge
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/remove_edge/{source_id}/{target_id}")
async def remove_edge(source_id: str, target_id: str):
    if not graph_instance.remove_edge(source_id, target_id):
        raise HTTPException(status_code=404, detail="Edge not found")
    return {"message": "Edge removed successfully"}
