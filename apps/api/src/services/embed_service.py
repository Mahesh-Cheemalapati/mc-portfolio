from __future__ import annotations

import logging
import uuid
from typing import Any, Protocol, runtime_checkable

from ..models.ingest import IngestResult

logger = logging.getLogger(__name__)


@runtime_checkable
class EmbedProtocol(Protocol):
    async def embed(self, text: str) -> list[float]: ...


@runtime_checkable
class UpsertProtocol(Protocol):
    async def upsert(
        self,
        vectors: list[dict[str, Any]],
        namespace: str = '',
    ) -> None: ...


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = ' '.join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start += chunk_size - overlap

    return chunks


async def embed_chunks(
    chunks: list[str],
    source: str,
    embed: EmbedProtocol,
    upsert: UpsertProtocol,
) -> IngestResult:
    vectors: list[dict[str, Any]] = []

    for i, chunk in enumerate(chunks):
        vector = await embed.embed(chunk)
        vectors.append({
            'id': f'{source}-chunk-{i}-{uuid.uuid4().hex[:8]}',
            'values': vector,
            'metadata': {
                'text': chunk,
                'source': source,
                'chunk_index': i,
            },
        })

    logger.info(
        'embed_chunks: upserting %d vectors for source=%s',
        len(vectors),
        source,
    )
    await upsert.upsert(vectors=vectors)

    return IngestResult(
        chunks_processed=len(chunks),
        vectors_upserted=len(vectors),
        source=source,
    )
