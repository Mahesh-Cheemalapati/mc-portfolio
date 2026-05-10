from typing import Any, Protocol, runtime_checkable

from pydantic import BaseModel


class RAGChunk(BaseModel):
    id: str
    text: str
    score: float
    metadata: dict[str, Any] = {}


@runtime_checkable
class EmbedProtocol(Protocol):
    async def embed(self, text: str) -> list[float]: ...


@runtime_checkable
class RetrieveProtocol(Protocol):
    async def retrieve(
        self, vector: list[float], top_k: int
    ) -> list[RAGChunk]: ...


@runtime_checkable
class CompleteProtocol(Protocol):
    async def complete(
        self,
        system: str,
        context: str,
        question: str,
    ) -> str: ...
