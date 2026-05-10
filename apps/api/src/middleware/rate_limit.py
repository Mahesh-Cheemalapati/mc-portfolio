from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from ..clients.redis_client import get_redis_client
from ..config.settings import get_settings
from ..services.rate_limit_service import create_rate_limiter


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Applies rate limiting only to POST /api/chat. Other routes are not rate limited."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path == '/api/chat' and request.method == 'POST':
            settings = get_settings()
            if settings.environment == 'development':
                return await call_next(request)
            redis = get_redis_client()
            limiter = create_rate_limiter(
                redis=redis,
                max_requests=settings.rate_limit_max,
                window_seconds=settings.rate_limit_window_seconds,
            )

            ip = (
                request.headers.get('x-forwarded-for', '').split(',')[0].strip()
                or request.headers.get('x-real-ip', '')
                or (request.client.host if request.client else '')
                or 'unknown'
            )

            result = await limiter.check(ip)

            if not result.allowed:
                return JSONResponse(
                    status_code=429,
                    content={
                        'error': 'rate_limit_exceeded',
                        'retry_after': result.retry_after,
                    },
                )

        return await call_next(request)
