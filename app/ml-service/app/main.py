# python
from contextlib import asynccontextmanager

# 3rd party
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# project
from app.core.logging import setup_logging, get_logger
from app.core.config import settings
from app.core.redis_client import redis_client
from app.core.chroma_client import chroma_client
from app.api.health_endpoints import router as health_router
from app.api.profile_endpoints import router as profile_router


# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("ML Service starting up", version=settings.app_version)
    
    try:
        # Connect to Redis
        await redis_client.connect()
        logger.info("Redis connection established")
    except Exception as e:
        logger.error("Failed to connect to Redis", error=str(e), exc_info=True)
        # Continue without Redis (degraded mode)
    
    try:
        # Connect to ChromaDB
        await chroma_client.connect()
        logger.info("ChromaDB connection established")
    except Exception as e:
        logger.error("Failed to connect to ChromaDB", error=str(e), exc_info=True)
        raise  # ChromaDB is critical, fail fast
    
    logger.info("✅ ML Service startup complete")
    
    yield
    
    # Shutdown
    logger.info("ML Service shutting down")
    
    try:
        await redis_client.disconnect()
        logger.info("Redis disconnected")
    except Exception as e:
        logger.error("Error disconnecting Redis", error=str(e))
    
    try:
        await chroma_client.disconnect()
        logger.info("ChromaDB disconnected")
    except Exception as e:
        logger.error("Error disconnecting ChromaDB", error=str(e))
    
    logger.info("✅ ML Service shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="ML Service for BookLoom - Semantic profiling, embeddings, and recommendations",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/ml", tags=["health"])
app.include_router(profile_router, prefix="/ml", tags=["profile"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
