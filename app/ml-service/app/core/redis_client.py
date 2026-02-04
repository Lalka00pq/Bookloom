# python
from typing import Optional, Any
from abc import ABC, abstractmethod
import json
import hashlib

# 3rd party
import redis.asyncio as redis_async

# project
from app.core.config import redis_settings
from app.core.logging import get_logger


logger = get_logger(__name__)


class ICacheClient(ABC):
    """Interface for cache client."""
    
    @abstractmethod
    async def get(self, key: str) -> Optional[str]:
        """Get value by key."""
        pass
    
    @abstractmethod
    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """Set value with optional TTL."""
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete key."""
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        pass


class RedisClient(ICacheClient):
    """Redis cache client implementation."""
    
    def __init__(self):
        """Initialize Redis client."""
        self._client: Optional[redis_async.Redis] = None
        self.settings = redis_settings
        logger.info("Redis client initialized", settings=self.settings.model_dump())
    
    async def connect(self) -> None:
        """Establish Redis connection."""
        try:
            self._client = redis_async.Redis(
                host=self.settings.host,
                port=self.settings.port,
                db=self.settings.db,
                password=self.settings.password,
                decode_responses=self.settings.decode_responses,
            )
            # Test connection
            await self._client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error("Failed to connect to Redis", error=str(e), exc_info=True)
            raise
    
    async def disconnect(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            logger.info("Redis connection closed")
    
    async def get(self, key: str) -> Optional[str]:
        """Get value by key from Redis."""
        try:
            value = await self._client.get(key)
            if value:
                logger.debug("Cache HIT", key=key)
            else:
                logger.debug("Cache MISS", key=key)
            return value
        except Exception as e:
            logger.error("Redis GET error", key=key, error=str(e))
            return None
    
    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """Set value in Redis with optional TTL."""
        try:
            if ttl:
                await self._client.setex(key, ttl, value)
            else:
                await self._client.set(key, value)
            logger.debug("Cache SET", key=key, ttl=ttl)
            return True
        except Exception as e:
            logger.error("Redis SET error", key=key, error=str(e))
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from Redis."""
        try:
            result = await self._client.delete(key)
            logger.debug("Cache DELETE", key=key, deleted=bool(result))
            return bool(result)
        except Exception as e:
            logger.error("Redis DELETE error", key=key, error=str(e))
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis."""
        try:
            result = await self._client.exists(key)
            return bool(result)
        except Exception as e:
            logger.error("Redis EXISTS error", key=key, error=str(e))
            return False
    
    async def health_check(self) -> bool:
        """Check Redis health."""
        try:
            await self._client.ping()
            return True
        except Exception:
            return False


def generate_cache_key(prefix: str, *args: Any) -> str:
    """Generate deterministic cache key.
    
    Args:
        prefix: Key prefix (e.g., 'profile', 'rec')
        *args: Variable arguments to include in key
    
    Returns:
        Generated cache key
    """
    # Serialize arguments to JSON for consistent hashing
    serialized = json.dumps(args, sort_keys=True)
    hash_suffix = hashlib.md5(serialized.encode()).hexdigest()[:8]
    return f"{prefix}:{hash_suffix}"


# Singleton instance
redis_client = RedisClient()
