import logging

from fastapi import APIRouter, Depends, HTTPException

from ..config.clients import get_completer, get_embedder, get_retriever
from ..models.chat import ChatRequest, ChatResponse
from ..services.rag_service import run_rag_query

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post('/chat', response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    embedder: object = Depends(get_embedder),
    retriever: object = Depends(get_retriever),
    completer: object = Depends(get_completer),
) -> ChatResponse:
    logger.info('Chat request received: "%s"', request.question[:80])

    try:
        answer, chunks_used = await run_rag_query(
            question=request.question,
            embed=embedder,  # type: ignore[arg-type]
            retrieve=retriever,  # type: ignore[arg-type]
            complete=completer,  # type: ignore[arg-type]
        )
    except Exception as e:
        logger.error('RAG pipeline error: %s', e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail='Something went wrong processing your question.',
        )

    return ChatResponse(answer=answer, chunks_used=chunks_used)
