from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from src.config.clients import get_completer, get_embedder, get_retriever
from src.main import app


@pytest.mark.asyncio
async def test_chat_returns_answer(
    client: AsyncClient,
    mock_embedder: AsyncMock,
    mock_retriever: AsyncMock,
    mock_completer: AsyncMock,
) -> None:
    app.dependency_overrides[get_embedder] = lambda: mock_embedder
    app.dependency_overrides[get_retriever] = lambda: mock_retriever
    app.dependency_overrides[get_completer] = lambda: mock_completer

    try:
        response = await client.post(
            '/api/chat',
            json={'question': 'How long has Mahesh been engineering?'},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert 'answer' in data
    assert 'chunks_used' in data
    assert data['chunks_used'] == 2
    assert len(data['answer']) > 0


@pytest.mark.asyncio
async def test_chat_rejects_empty_question(client: AsyncClient) -> None:
    response = await client.post(
        '/api/chat',
        json={'question': ''},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_rejects_question_too_long(client: AsyncClient) -> None:
    response = await client.post(
        '/api/chat',
        json={'question': 'x' * 501},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_rag_pipeline_error_returns_500(
    client: AsyncClient,
    mock_embedder: AsyncMock,
    mock_retriever: AsyncMock,
    mock_completer: AsyncMock,
) -> None:
    mock_embedder.embed = AsyncMock(side_effect=Exception('OpenAI down'))
    app.dependency_overrides[get_embedder] = lambda: mock_embedder

    try:
        response = await client.post(
            '/api/chat',
            json={'question': 'What has Mahesh built?'},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 500
