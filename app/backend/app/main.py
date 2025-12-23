# project
from app.api.health_check import router as health_router
from app.api.graph_endpoints import router as graph_router
from app.api.search_endpoints import router as search_router
from app.api.book_graph_endpoints import router as book_graph_router
from app.core.logging import setup_logging, get_logger
# 3rd party
from fastapi import FastAPI, Request
import time
import uvicorn

# Setup logging
setup_logging()

app = FastAPI()
logger = get_logger(__name__)

logger.info("Application started")

# Setup middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all HTTP requests."""
    start_time = time.time()
    
    # Get request details
    method = request.method
    url = str(request.url)
    path = request.url.path
    client_ip = request.client.host if request.client else "unknown"
    
    # Log request start
    logger.info(
        "Request received",
        method=method,
        path=path,
        url=url,
        client_ip=client_ip,
    )
    
    try:
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        status_code = response.status_code
        
        # Log response
        logger.info(
            "Request completed",
            method=method,
            path=path,
            status_code=status_code,
            process_time=f"{process_time:.4f}s",
            client_ip=client_ip,
        )
        
        return response
        
    except Exception as exc:
        # Calculate processing time even if error occurred
        process_time = time.time() - start_time
        
        # Log error
        logger.error(
            "Request failed",
            method=method,
            path=path,
            error=str(exc),
            error_type=type(exc).__name__,
            process_time=f"{process_time:.4f}s",
            client_ip=client_ip,
            exc_info=True,
        )
        raise

app.include_router(health_router, tags=["health-check"])
app.include_router(graph_router, prefix="/graph", tags=["graph"])
app.include_router(search_router, prefix="/books", tags=["books-search"])
app.include_router(book_graph_router, prefix="/books", tags=["books-graph"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
