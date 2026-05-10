import logging

from fastapi import APIRouter, HTTPException

from ..config.clients import get_embedder, get_upserter
from ..models.ingest import IngestRequest, IngestResult
from ..services.embed_service import chunk_text, embed_chunks

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post('/ingest', response_model=IngestResult)
async def ingest(request: IngestRequest) -> IngestResult:
    logger.info(
        'Ingest request: source=%s text_length=%d chars',
        request.source,
        len(request.text),
    )

    try:
        chunks = chunk_text(request.text)
        logger.info('Ingest: %d chunks created from source=%s', len(chunks), request.source)

        result = await embed_chunks(
            chunks=chunks,
            source=request.source,
            embed=get_embedder(),
            upsert=get_upserter(),
        )
    except Exception as e:
        logger.error('Ingest error: %s', e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f'Ingest failed: {e}',
        )

    logger.info(
        'Ingest complete: %d chunks, %d vectors upserted',
        result.chunks_processed,
        result.vectors_upserted,
    )
    return result
