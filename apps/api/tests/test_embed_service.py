from unittest.mock import AsyncMock

import pytest

from src.services.embed_service import chunk_text, embed_chunks


def test_chunk_text_basic() -> None:
    text = ' '.join([f'word{i}' for i in range(1000)])
    chunks = chunk_text(text, chunk_size=500, overlap=50)
    assert len(chunks) > 1
    assert all(isinstance(c, str) for c in chunks)
    assert all(len(c) > 0 for c in chunks)


def test_chunk_text_overlap() -> None:
    words = [f'word{i}' for i in range(100)]
    text = ' '.join(words)
    chunks = chunk_text(text, chunk_size=60, overlap=10)
    first_words = set(chunks[0].split())
    second_words = set(chunks[1].split())
    overlap_words = first_words & second_words
    assert len(overlap_words) > 0


def test_chunk_text_empty() -> None:
    chunks = chunk_text('')
    assert chunks == []


def test_chunk_text_short_text() -> None:
    text = 'short text here'
    chunks = chunk_text(text, chunk_size=500, overlap=50)
    assert len(chunks) == 1
    assert chunks[0] == text


@pytest.mark.asyncio
async def test_embed_chunks_calls_embed_for_each_chunk() -> None:
    mock_embedder = AsyncMock()
    mock_embedder.embed = AsyncMock(return_value=[0.1] * 1536)
    mock_upserter = AsyncMock()
    mock_upserter.upsert = AsyncMock()

    chunks = ['chunk one text here', 'chunk two text here', 'chunk three']

    result = await embed_chunks(
        chunks=chunks,
        source='test',
        embed=mock_embedder,
        upsert=mock_upserter,
    )

    assert mock_embedder.embed.call_count == 3
    assert mock_upserter.upsert.call_count == 1
    assert result.chunks_processed == 3
    assert result.vectors_upserted == 3
    assert result.source == 'test'
