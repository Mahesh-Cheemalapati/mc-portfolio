import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config.settings import get_settings
from .middleware.auth import IngestAuthMiddleware
from .middleware.rate_limit import RateLimitMiddleware
from .routers import chat, health, ingest

settings = get_settings()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
)

app = FastAPI(
    title='AI-MC API',
    description='RAG-powered chatbot API for Mahesh Cheemalapati portfolio',
    version='1.0.0',
    docs_url='/api/docs' if settings.environment == 'development' else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        [
            'http://localhost:3000',
            'http://localhost:4321',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:4321',
        ]
        if settings.environment == 'development'
        else [
            f'https://{settings.domain}',
            f'https://www.{settings.domain}',
        ]
    ),
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(IngestAuthMiddleware)

app.include_router(health.router, prefix='/api')
app.include_router(chat.router, prefix='/api')
app.include_router(ingest.router, prefix='/api')
