"""
Smart Link Hub - Rate Limiting Utility
Token bucket rate limiter for API protection
"""
import time
from collections import defaultdict
from typing import Tuple, Dict
from threading import Lock

from app.config import settings


class RateLimiter:
    """
    Token bucket rate limiter
    
    Each key (e.g., IP address) gets a bucket of tokens.
    Tokens are consumed on each request and refilled over time.
    """
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        burst_size: int = 10
    ):
        self.rate = requests_per_minute / 60.0  # tokens per second
        self.burst_size = burst_size
        self.tokens: Dict[str, float] = defaultdict(lambda: float(burst_size))
        self.last_update: Dict[str, float] = defaultdict(time.time)
        self._lock = Lock()
    
    def is_allowed(self, key: str) -> Tuple[bool, int]:
        """
        Check if request is allowed for given key
        
        Args:
            key: Identifier (usually IP address or user ID)
            
        Returns:
            Tuple of (allowed: bool, retry_after_seconds: int)
        """
        with self._lock:
            now = time.time()
            
            # Refill tokens based on time elapsed
            elapsed = now - self.last_update[key]
            self.tokens[key] = min(
                self.burst_size,
                self.tokens[key] + elapsed * self.rate
            )
            self.last_update[key] = now
            
            if self.tokens[key] >= 1:
                self.tokens[key] -= 1
                return True, 0
            
            # Calculate retry-after
            retry_after = int((1 - self.tokens[key]) / self.rate) + 1
            return False, retry_after
    
    def cleanup(self, max_age_seconds: int = 600):
        """Remove stale entries to prevent memory growth"""
        with self._lock:
            now = time.time()
            stale_keys = [
                key for key, last in self.last_update.items()
                if now - last > max_age_seconds
            ]
            for key in stale_keys:
                del self.tokens[key]
                del self.last_update[key]


# Rate limiter instances
api_rate_limiter = RateLimiter(
    requests_per_minute=settings.RATE_LIMIT_PER_MINUTE,
    burst_size=20
)

public_rate_limiter = RateLimiter(
    requests_per_minute=settings.PUBLIC_RATE_LIMIT_PER_MINUTE,
    burst_size=50
)


def check_rate_limit(key: str, limiter: RateLimiter = api_rate_limiter) -> Tuple[bool, int]:
    """
    Check if a request is within rate limits
    
    Returns:
        Tuple of (allowed, retry_after_seconds)
    """
    return limiter.is_allowed(key)
