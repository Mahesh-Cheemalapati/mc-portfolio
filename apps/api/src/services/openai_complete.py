from __future__ import annotations

from openai import AsyncOpenAI

COMPLETION_MODEL = 'gpt-4o-mini'


class OpenAICompleter:
    """Implements CompleteProtocol using gpt-4o-mini."""

    def __init__(self, client: AsyncOpenAI) -> None:
        self._client = client

    async def complete(
        self,
        system: str,
        context: str,
        question: str,
    ) -> str:
        user_message = (
            f"Context from Mahesh's resume and background:\n\n"
            f'{context}\n\n'
            f'---\n\n'
            f'Question: {question}'
        )

        response = await self._client.chat.completions.create(
            model=COMPLETION_MODEL,
            messages=[
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user_message},
            ],
            max_tokens=500,
            temperature=0.3,
        )

        return response.choices[0].message.content or ''
