import os
import json
import logging

try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL")
        self.client = None
        self._local_cache = {} # Fallback for dev/testing without Redis
        
        if self.redis_url and redis:
            try:
                self.client = redis.from_url(self.redis_url, decode_responses=True)
                # Test connection
                self.client.ping()
                logger.info("Connected to Redis cache.")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis, falling back to in-memory: {e}")
                self.client = None
        else:
            logger.info("REDIS_URL not set or redis lib missing. Using in-memory cache.")

    def get(self, key: str):
        if self.client:
            try:
                val = self.client.get(key)
                if val:
                    return json.loads(val)
                return None
            except Exception as e:
                logger.error(f"Redis get error: {e}")
                return None
        return self._local_cache.get(key)

    def set(self, key: str, value: any, expire_seconds: int = 3600):
        if self.client:
            try:
                self.client.setex(key, expire_seconds, json.dumps(value))
            except Exception as e:
                logger.error(f"Redis set error: {e}")
        else:
            self._local_cache[key] = value

    def delete(self, key: str):
        if self.client:
            try:
                self.client.delete(key)
            except Exception as e:
                logger.error(f"Redis delete error: {e}")
        else:
            if key in self._local_cache:
                del self._local_cache[key]

# Singleton instance
cache = CacheService()
