# project
from app.api.health_check import router as health_router
from app.api.graph_endpoints import router as graph_router
from app.api.search_endpoints import router as search_router
from app.api.book_graph_endpoints import router as book_graph_router
from app.core.logging import setup_logging, get_logger
from app.core.config import HealthMonitorSettings
from app.core.health_monitor import HealthMonitorService, IHealthMonitor
# 3rd party
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import time
import uvicorn

# Setup logging
setup_logging()

logger = get_logger(__name__)

# Health monitor settings
health_monitor_settings = HealthMonitorSettings()
health_monitor: IHealthMonitor = HealthMonitorService(
    base_url=health_monitor_settings.base_url,
    health_endpoint=health_monitor_settings.health_endpoint,
    timeout=health_monitor_settings.timeout,
)


async def health_check_task():
    """Background task for periodic health checks."""
    if not health_monitor_settings.enabled:
        logger.info("Health monitoring is disabled")
        return

    logger.info(
        "Health monitoring started",
        check_interval=health_monitor_settings.check_interval,
        base_url=health_monitor_settings.base_url,
        health_endpoint=health_monitor_settings.health_endpoint,
    )

    while True:
        try:
            result = await health_monitor.check_health()
            logger.info(
                "Health check completed",
                **result.to_dict(),
            )
        except Exception as exc:
            logger.error(
                "Health check task error",
                error=str(exc),
                error_type=type(exc).__name__,
                exc_info=True,
            )

        await asyncio.sleep(health_monitor_settings.check_interval)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("Application starting")

    # Start health monitoring background task
    task = None
    if health_monitor_settings.enabled:
        task = asyncio.create_task(health_check_task())
        logger.info("Health monitoring background task started")

    yield

    # Shutdown
    logger.info("Application shutting down")
    if task is not None:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            logger.info("Health monitoring background task cancelled")


app = FastAPI(lifespan=lifespan)
logger.info("Application initialized")

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    # Log request start (skip OPTIONS for less noise, but still process them)
    if method != "OPTIONS":
        logger.info(
            "Request received",
            method=method,
            path=path,
            url=url,
            client_ip=client_ip,
        )

    try:
        # Process request (CORS middleware will handle OPTIONS)
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time
        status_code = response.status_code

        # Log response (skip OPTIONS for less noise)
        if method != "OPTIONS":
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
