from fastapi import APIRouter

router = APIRouter()


@router.get("/show_graph")
async def show_graph():
    pass
