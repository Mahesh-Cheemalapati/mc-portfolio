from __future__ import annotations

from typing import Any

from ..models.rag import RAGChunk


class PineconeRetriever:
    """Implements RetrieveProtocol using Pinecone vector search."""

    def __init__(self, index: Any) -> None:
        self._index = index

    async def retrieve(
        self,
        vector: list[float],
        top_k: int,
    ) -> list[RAGChunk]:
        response = self._index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True,
        )
        return [
            RAGChunk(
                id=match.id,
                text=(match.metadata or {}).get('text', ''),
                score=match.score or 0.0,
                metadata=dict(match.metadata) if match.metadata else {},
            )
            for match in response.matches
        ]


class PineconeUpserter:
    """Implements UpsertProtocol using Pinecone upsert."""

    def __init__(self, index: Any) -> None:
        self._index = index

    async def upsert(
        self,
        vectors: list[dict[str, Any]],
        namespace: str = '',
    ) -> None:
        self._index.upsert(vectors=vectors, namespace=namespace)
