from fastapi import FastAPI
from app.core.config import settings
from app.api.base import api_router

def create_app() -> FastAPI:
    """Creates and configures the FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Service coordinating multiple agents for book operations",
        version="0.1.0",
    )
    
    # Register the main API router
    app.include_router(api_router, prefix="/api/v1")
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
        
    return app

app = create_app()
