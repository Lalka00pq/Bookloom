from typing import Any
from fastapi import HTTPException

def handle_endpoint_error(exc: Exception, logger: Any, message: str, **kwargs: Any) -> None:
    """
    Handle exceptions in API endpoints to avoid code duplication.
    
    Args:
        exc: Maximum caught exception (e.g. Exception)
        logger: Structlog logger instance
        message: Error message to log and return in 500 detail
        **kwargs: Additional context to log
    """
    if isinstance(exc, HTTPException):
        raise exc
    
    logger.error(
        message,
        error=str(exc),
        error_type=type(exc).__name__,
        exc_info=True,
        **kwargs
    )
    raise HTTPException(
        status_code=500,
        detail=message,
    ) from exc
