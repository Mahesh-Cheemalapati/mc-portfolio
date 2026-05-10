from unittest.mock import AsyncMock

import pytest

from src.models.rag import RAGChunk
from src.services.rag_service import run_rag_query


@pytest.mark.asyncio
async def test_run_rag_query_returns_answer(
    mock_embedder: AsyncMock,
    mock_retriever: AsyncMock,
    mock_completer: AsyncMock,
) -> None:
    answer, chunks_used = await run_rag_query(
        question='What has Mahesh built?',
        embed=mock_embedder,
        retrieve=mock_retriever,
        complete=mock_completer,
    )

    assert isinstance(answer, str)
    assert len(answer) > 0
    assert chunks_used == 2
    mock_embedder.embed.assert_called_once_with('What has Mahesh built?')
    mock_retriever.retrieve.assert_called_once()
    mock_completer.complete.assert_called_once()


@pytest.mark.asyncio
async def test_run_rag_query_handles_empty_chunks(
    mock_embedder: AsyncMock,
    mock_retriever: AsyncMock,
    mock_completer: AsyncMock,
) -> None:
    mock_retriever.retrieve.return_value = []

    answer, chunks_used = await run_rag_query(
        question='What has Mahesh built?',
        embed=mock_embedder,
        retrieve=mock_retriever,
        complete=mock_completer,
    )

    assert chunks_used == 0
    assert 'resume' in answer.lower() or "don't have" in answer.lower()
    mock_completer.complete.assert_not_called()


@pytest.mark.asyncio
async def test_run_rag_query_calls_steps_in_order(
    mock_embedder: AsyncMock,
    mock_retriever: AsyncMock,
    mock_completer: AsyncMock,
) -> None:
    call_order: list[str] = []

    async def track_embed(text: str) -> list[float]:
        call_order.append('embed')
        return [0.1] * 1536

    async def track_retrieve(vector: list[float], top_k: int) -> list[RAGChunk]:
        call_order.append('retrieve')
        return [
            RAGChunk(
                id='x',
                text='test',
                score=0.9,
                metadata={'source': 'test'},
            )
        ]

    async def track_complete(system: str, context: str, question: str) -> str:
        call_order.append('complete')
        return 'test answer'

    mock_embedder.embed = track_embed
    mock_retriever.retrieve = track_retrieve
    mock_completer.complete = track_complete

    await run_rag_query(
        question='test',
        embed=mock_embedder,
        retrieve=mock_retriever,
        complete=mock_completer,
    )

    assert call_order == ['embed', 'retrieve', 'complete']
