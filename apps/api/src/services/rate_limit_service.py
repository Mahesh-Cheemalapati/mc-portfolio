from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


@dataclass
class RateLimitResult:
    allowed: bool
    requests_made: int
    limit: int
    retry_after: int


class RateLimiter:
    def __init__(
        self,
        redis: Any,
        max_requests: int,
        window_seconds: int,
    ) -> None:
        self._redis = redis
        self._max = max_requests
        self._window = window_seconds

    async def check(self, ip: str) -> RateLimitResult:
        key = f'rate_limit:{ip}'

        async with self._redis.pipeline(transaction=True) as pipe:
            pipe.incr(key)
            pipe.ttl(key)
            results = await pipe.execute()

        count: int = results[0]
        ttl: int = results[1]

        if count == 1:
            await self._redis.expire(key, self._window)
            ttl = self._window

        allowed = count <= self._max
        retry_after = max(ttl, 0) if not allowed else 0

        return RateLimitResult(
            allowed=allowed,
            requests_made=count,
            limit=self._max,
            retry_after=retry_after,
        )


def create_rate_limiter(
    redis: Any,
    max_requests: int,
    window_seconds: int,
) -> RateLimiter:
    return RateLimiter(
        redis=redis,
        max_requests=max_requests,
        window_seconds=window_seconds,
    )
