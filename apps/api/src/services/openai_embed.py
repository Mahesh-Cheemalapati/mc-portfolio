from __future__ import annotations

from openai import AsyncOpenAI

EMBEDDING_MODEL = 'text-embedding-3-small'


class OpenAIEmbedder:
    """Implements EmbedProtocol using OpenAI text-embedding-3-small."""

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client

    async def embed(self, text: str) -> list[float]:
        response = await self._client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text,
        )
        return response.data[0].embedding
