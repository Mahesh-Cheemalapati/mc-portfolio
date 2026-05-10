#!/usr/bin/env python3
"""
Ingest script — reads context.md and resume.md, sends to /api/ingest.
Run from repo root: python apps/api/scripts/ingest_resume.py
Requires API to be running: make dev-api
"""
import asyncio
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

# Load .env from repo root
load_dotenv(Path(__file__).parent.parent.parent.parent / '.env')

API_BASE = os.getenv('API_BASE_URL', 'http://localhost:3001')
INGEST_SECRET = os.getenv('INGEST_SECRET', '')
CONTENT_DIR = Path(__file__).parent.parent.parent.parent / 'content' / 'ai'


async def ingest_file(
    client: httpx.AsyncClient,
    filepath: Path,
    source: str,
) -> None:
    print(f'\nIngesting {source} from {filepath}...')
    text = filepath.read_text(encoding='utf-8')
    print(f'  Text length: {len(text)} chars')

    response = await client.post(
        f'{API_BASE}/api/ingest',
        json={'text': text, 'source': source},
        headers={'Authorization': f'Bearer {INGEST_SECRET}'},
        timeout=120.0,
    )

    if response.status_code == 200:
        data = response.json()
        print(
            f'  Done: {data["chunks_processed"]} chunks, '
            f'{data["vectors_upserted"]} vectors upserted'
        )
    else:
        print(f'  Error {response.status_code}: {response.text}')
        sys.exit(1)


async def main() -> None:
    print('AI-MC Ingest Script')
    print('===================')

    if not INGEST_SECRET:
        print('Error: INGEST_SECRET not set in .env')
        sys.exit(1)

    context_file = CONTENT_DIR / 'context.md'
    resume_file = CONTENT_DIR / 'resume.md'

    for f in [context_file, resume_file]:
        if not f.exists():
            print(f'Error: {f} not found')
            sys.exit(1)

    async with httpx.AsyncClient() as client:
        try:
            health = await client.get(f'{API_BASE}/api/health', timeout=5.0)
            print(f'API health: {health.json()}')
        except Exception:
            print(f'Error: API not reachable at {API_BASE}')
            print('Run: make dev-api')
            sys.exit(1)

        await ingest_file(client, context_file, 'context')
        await ingest_file(client, resume_file, 'resume')

    print('\nIngest complete. Pinecone index is ready.')
    print('You can now test the chatbot.')


if __name__ == '__main__':
    asyncio.run(main())
