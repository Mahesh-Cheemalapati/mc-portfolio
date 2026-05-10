from functools import lru_cache

from pinecone import Pinecone

from ..config.settings import get_settings


def create_pinecone_client() -> Pinecone:
    settings = get_settings()
    return Pinecone(api_key=settings.pinecone_api_key)


@lru_cache(maxsize=1)
def get_pinecone_client() -> Pinecone:
    return create_pinecone_client()


def get_pinecone_index() -> object:
    settings = get_settings()
    pc = get_pinecone_client()
    return pc.Index(
        name=settings.pinecone_index,
        host=settings.pinecone_host,
    )
