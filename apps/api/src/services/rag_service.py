from __future__ import annotations

import logging
from typing import Protocol, runtime_checkable

from ..models.rag import RAGChunk

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are AI-MC, a cheerful and friendly digital assistant \
for Mahesh Cheemalapati's portfolio.

Your knowledge is strictly limited to the context provided below. This context \
comes from Mahesh's resume and a detailed background document he wrote himself.

Rules you must follow without exception:
1. Answer ONLY from the provided context. If the answer is not clearly in the \
context say: "I don't have that information in what I've been trained on — feel \
free to download Mahesh's resume for the full picture."
2. If someone asks how to contact Mahesh or reach out, say: "Great question! \
You can connect with Mahesh through the links in the Contact section of this portfolio."
3. If someone asks for the resume say: "You can download Mahesh's resume directly \
from the Contact section — there's a download button right there."
4. If someone asks about salary, compensation, or availability say: "That's best \
discussed directly with Mahesh — head to the Contact section to reach out."
5. If a question is off-topic but harmless say: "Ha, I wish I could help with \
that! I'm only trained on Mahesh's experience though. Ask me about his work or \
skills instead!"
6. If a question is vulgar, inappropriate, or hostile say: "That's not something \
I'm going to engage with. Feel free to ask me about Mahesh's engineering \
background instead."
7. Never invent, infer, or extrapolate beyond what the context explicitly states.
8. Be warm, conversational, and a little playful — not corporate, not robotic.
9. Refer to Mahesh in third person always — you are his assistant, not him.
"""


@runtime_checkable
class EmbedProtocol(Protocol):
    async def embed(self, text: str) -> list[float]: ...


@runtime_checkable
class RetrieveProtocol(Protocol):
    async def retrieve(
        self,
        vector: list[float],
        top_k: int,
    ) -> list[RAGChunk]: ...


@runtime_checkable
class CompleteProtocol(Protocol):
    async def complete(
        self,
        system: str,
        context: str,
        question: str,
    ) -> str: ...


async def run_rag_query(
    question: str,
    embed: EmbedProtocol,
    retrieve: RetrieveProtocol,
    complete: CompleteProtocol,
) -> tuple[str, int]:
    # ── STEP 1: EMBED THE QUESTION ──────────────────────────────────────
    logger.info('RAG Step 1 — Embedding question: "%s..."', question[:80])
    question_vector = await embed.embed(question)

    # ── STEP 2: RETRIEVE RELEVANT CHUNKS ────────────────────────────────
    logger.info('RAG Step 2 — Querying Pinecone for top 5 chunks')
    chunks = await retrieve.retrieve(question_vector, top_k=5)
    logger.info('RAG Step 2 — Retrieved %d chunks', len(chunks))

    if not chunks:
        logger.warning('RAG Step 2 — No chunks retrieved. Returning fallback.')
        return (
            "I don't have enough information to answer that. "
            "Feel free to download Mahesh's resume from the Contact section.",
            0,
        )

    # ── STEP 3: GENERATE RESPONSE ────────────────────────────────────────
    context = '\n\n---\n\n'.join(
        f'[Source: {chunk.metadata.get("source", "unknown")}]\n{chunk.text}'
        for chunk in chunks
    )

    logger.info(
        'RAG Step 3 — Sending to LLM. Context: %d chars across %d chunks',
        len(context),
        len(chunks),
    )

    answer = await complete.complete(
        system=SYSTEM_PROMPT,
        context=context,
        question=question,
    )

    logger.info('RAG Step 3 — Got answer (%d chars): "%s..."', len(answer), answer[:100])

    return answer, len(chunks)
