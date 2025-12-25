"""Health monitoring service for backend health checks."""
from abc import ABC, abstractmethod
from typing import Dict, Optional
from datetime import datetime

import httpx
from app.core.logging import get_logger
from app.core.config import Settings


class HealthCheckResult:
    """Result of a health check operation."""
    
    def __init__(
        self,
        is_healthy: bool,
        status_code: Optional[int] = None,
        response_time: Optional[float] = None,
        error: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ):
        self.is_healthy = is_healthy
        self.status_code = status_code
        self.response_time = response_time
        self.error = error
        self.timestamp = timestamp or datetime.now()
    
    def to_dict(self) -> Dict:
        """Convert result to dictionary for logging."""
        return {
            "is_healthy": self.is_healthy,
            "status_code": self.status_code,
            "response_time": self.response_time,
            "error": self.error,
            "timestamp": self.timestamp.isoformat(),
        }


class IHealthMonitor(ABC):
    """Interface for health monitoring service (Dependency Inversion Principle)."""
    
    @abstractmethod
    async def check_health(self) -> HealthCheckResult:
        """Perform health check.
        
        Returns:
            HealthCheckResult: Result of the health check
        """
        pass


class HealthMonitorService(IHealthMonitor):
    """Service for monitoring backend health status."""
    
    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        health_endpoint: str = "/health/check",
        timeout: float = 5.0,
    ):
        """Initialize health monitor service.
        
        Args:
            base_url: Base URL of the backend service
            health_endpoint: Health check endpoint path
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.health_endpoint = health_endpoint
        self.timeout = timeout
        self.logger = get_logger(__name__)
    
    async def check_health(self) -> HealthCheckResult:
        """Perform health check by calling the health endpoint.
        
        Returns:
            HealthCheckResult: Result of the health check
        """
        url = f"{self.base_url}{self.health_endpoint}"
        start_time = datetime.now()
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response_time = (datetime.now() - start_time).total_seconds()
                
                is_healthy = response.status_code == 200
                
                result = HealthCheckResult(
                    is_healthy=is_healthy,
                    status_code=response.status_code,
                    response_time=response_time,
                )
                
                if is_healthy:
                    self.logger.info(
                        "Health check successful",
                        url=url,
                        status_code=response.status_code,
                        response_time=f"{response_time:.4f}s",
                    )
                else:
                    self.logger.warning(
                        "Health check returned non-200 status",
                        url=url,
                        status_code=response.status_code,
                        response_time=f"{response_time:.4f}s",
                    )
                
                return result
                
        except httpx.TimeoutException as exc:
            response_time = (datetime.now() - start_time).total_seconds()
            result = HealthCheckResult(
                is_healthy=False,
                response_time=response_time,
                error=f"Request timeout after {self.timeout}s",
            )
            self.logger.error(
                "Health check timeout",
                url=url,
                timeout=self.timeout,
                response_time=f"{response_time:.4f}s",
                exc_info=True,
            )
            return result
            
        except httpx.RequestError as exc:
            response_time = (datetime.now() - start_time).total_seconds()
            result = HealthCheckResult(
                is_healthy=False,
                response_time=response_time,
                error=str(exc),
            )
            self.logger.error(
                "Health check request failed",
                url=url,
                error=str(exc),
                error_type=type(exc).__name__,
                response_time=f"{response_time:.4f}s",
                exc_info=True,
            )
            return result
            
        except Exception as exc:
            response_time = (datetime.now() - start_time).total_seconds()
            result = HealthCheckResult(
                is_healthy=False,
                response_time=response_time,
                error=str(exc),
            )
            self.logger.error(
                "Health check unexpected error",
                url=url,
                error=str(exc),
                error_type=type(exc).__name__,
                response_time=f"{response_time:.4f}s",
                exc_info=True,
            )
            return result

