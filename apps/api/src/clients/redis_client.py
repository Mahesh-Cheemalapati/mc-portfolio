from functools import lru_cache
from typing import Any

import redis.asyncio as aioredis

from ..config.settings import get_settings


def create_redis_client() -> Any:
    settings = get_settings()
    return aioredis.from_url(  # type: ignore[no-untyped-call]
        settings.redis_url,
        encoding='utf-8',
        decode_responses=True,
    )


@lru_cache(maxsize=1)
def get_redis_client() -> Any:
    return create_redis_client()
