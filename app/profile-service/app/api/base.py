from fastapi import APIRouter
from app.api.endpoints import embeddings

api_router = APIRouter()

# Include various routers
api_router.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])
