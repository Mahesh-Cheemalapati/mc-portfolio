from functools import lru_cache

from openai import AsyncOpenAI

from ..config.settings import get_settings


def create_openai_client() -> AsyncOpenAI:
    settings = get_settings()
    return AsyncOpenAI(api_key=settings.openai_api_key)


@lru_cache(maxsize=1)
def get_openai_client() -> AsyncOpenAI:
    return create_openai_client()
