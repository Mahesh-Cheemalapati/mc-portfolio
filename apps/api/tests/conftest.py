from typing import Any
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.models.rag import RAGChunk
from src.services.rate_limit_service import RateLimitResult


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url='http://test',
    ) as ac:
        yield ac


@pytest.fixture(autouse=True)
def mock_rate_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    """Prevent all tests from requiring a live Redis connection."""

    async def always_allowed(self: Any, ip: str) -> RateLimitResult:
        return RateLimitResult(allowed=True, requests_made=1, limit=25, retry_after=0)

    monkeypatch.setattr(
        'src.services.rate_limit_service.RateLimiter.check',
        always_allowed,
    )


@pytest.fixture
def mock_embedder() -> AsyncMock:
    embedder = AsyncMock()
    embedder.embed = AsyncMock(return_value=[0.1] * 1536)
    return embedder


@pytest.fixture
def mock_retriever() -> AsyncMock:
    retriever = AsyncMock()
    retriever.retrieve = AsyncMock(
        return_value=[
            RAGChunk(
                id='test-chunk-1',
                text='Mahesh has 9+ years of experience in full stack engineering.',
                score=0.92,
                metadata={'source': 'context', 'chunk_index': 0},
            ),
            RAGChunk(
                id='test-chunk-2',
                text='He has worked on healthcare platforms serving millions of users.',
                score=0.88,
                metadata={'source': 'resume', 'chunk_index': 1},
            ),
        ]
    )
    return retriever


@pytest.fixture
def mock_completer() -> AsyncMock:
    completer = AsyncMock()
    completer.complete = AsyncMock(
        return_value='Mahesh has over 9 years of full stack engineering experience.'
    )
    return completer


@pytest.fixture
def ingest_headers() -> dict[str, str]:
    return {'Authorization': 'Bearer test-secret'}
