from .settings import get_settings
from ..clients.openai_client import get_openai_client
from ..clients.pinecone_client import get_pinecone_index
from ..clients.redis_client import get_redis_client
from ..services.openai_complete import OpenAICompleter
from ..services.openai_embed import OpenAIEmbedder
from ..services.pinecone_retrieve import PineconeRetriever, PineconeUpserter
from ..services.rate_limit_service import RateLimiter, create_rate_limiter


def get_embedder() -> OpenAIEmbedder:
    return OpenAIEmbedder(client=get_openai_client())


def get_retriever() -> PineconeRetriever:
    return PineconeRetriever(index=get_pinecone_index())


def get_upserter() -> PineconeUpserter:
    return PineconeUpserter(index=get_pinecone_index())


def get_completer() -> OpenAICompleter:
    return OpenAICompleter(client=get_openai_client())


def get_rate_limiter() -> RateLimiter:
    settings = get_settings()
    return create_rate_limiter(
        redis=get_redis_client(),
        max_requests=settings.rate_limit_max,
        window_seconds=settings.rate_limit_window_seconds,
    )
