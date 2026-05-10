from fastapi import HTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from ..config.settings import get_settings


class IngestAuthMiddleware(BaseHTTPMiddleware):
    """Protects POST /api/ingest with a bearer token. All other routes pass through."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path == '/api/ingest' and request.method == 'POST':
            settings = get_settings()
            auth = request.headers.get('Authorization', '')

            if not auth.startswith('Bearer '):
                raise HTTPException(
                    status_code=401,
                    detail='Missing authorization header',
                )

            token = auth.removeprefix('Bearer ').strip()

            if token != settings.ingest_secret:
                raise HTTPException(
                    status_code=403,
                    detail='Invalid ingest secret',
                )

        return await call_next(request)
