# mc-portfolio

A manga-themed personal portfolio with a RAG-powered AI chatbot. The site renders as a flip-book of chapters; a floating chat widget lets visitors ask the **AI-MC** bot questions about Mahesh's background, answered only from his own documents.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Astro 4 (static), React islands, nanostores, Tailwind |
| Backend | FastAPI (Python 3.11), Uvicorn |
| AI | OpenAI `text-embedding-3-small` + `gpt-4o-mini` |
| Vector DB | Pinecone (serverless) |
| Rate limiting | Redis (sliding window via pipeline) |
| Infra | Docker Compose, Nginx Proxy Manager, Raspberry Pi |

---

## Monorepo layout

```
mc-portfolio/
├── apps/
│   ├── web/                  # Astro frontend
│   │   └── src/
│   │       ├── components/   # Book, chapters, ChatWidget
│   │       ├── hooks/        # usePageNavigation, useChat
│   │       ├── stores/       # bookStore, chatStore (nanostores)
│   │       └── pages/        # index.astro
│   └── api/                  # FastAPI backend
│       └── src/
│           ├── clients/      # openai, pinecone, redis (lru_cache singletons)
│           ├── config/       # settings.py (pydantic), clients.py (DI factories)
│           ├── middleware/   # auth.py, rate_limit.py
│           ├── models/       # chat, ingest, rag (pydantic)
│           ├── routers/      # chat, ingest, health
│           └── services/     # embed, rag, rate_limit + protocol implementations
├── content/
│   ├── ai/                   # context.md, resume.md  ← AI-MC's knowledge base
│   ├── chapters/             # ch00–ch04.md  ← book chapter content
│   └── data/                 # chapters.ts, projects.ts, skills.ts, contact.ts
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── nginx/NPM_SETUP.md
├── docker-compose.yml        # dev (all services + Redis)
├── docker-compose.prod.yml   # production (no exposed ports, NPM handles routing)
└── Makefile
```

---

## How AI-MC works

AI-MC is a **Retrieval-Augmented Generation (RAG)** bot that answers questions strictly from Mahesh's own documents.

### Ingest (one-time setup)

```
content/ai/context.md   ─┐
content/ai/resume.md    ─┴─► chunk (512 tokens, 50-token overlap)
                              ► embed (OpenAI text-embedding-3-small → 1536-dim vectors)
                              ► upsert to Pinecone with {source, text} metadata
```

Run locally with `make ingest-local` (requires API running) or inside Docker with `make ingest`.

### Chat request flow

```
Browser
  │  POST /api/chat  { question }
  ▼
RateLimitMiddleware
  │  Redis pipeline: INCR + TTL per IP
  │  25 req / day limit (skipped in development)
  ▼
AuthMiddleware          ← /api/ingest only, Bearer token
  ▼
chat router
  │
  ├─ 1. Embed question
  │     OpenAIEmbedder.embed(question)
  │     → text-embedding-3-small → float[1536]
  │
  ├─ 2. Retrieve context
  │     PineconeRetriever.retrieve(vector, top_k=5)
  │     → top-5 nearest chunks by cosine similarity
  │
  ├─ 3. Build prompt
  │     SYSTEM_PROMPT (AI-MC persona + strict rules)
  │     + joined chunk texts with [Source: ...] labels
  │     + user question
  │
  └─ 4. Generate answer
        OpenAICompleter.complete(system, context, question)
        → gpt-4o-mini → answer string
  ▼
{ answer, chunks_used }  →  ChatWidget renders in book UI
```

### Key constraint

The system prompt explicitly forbids the model from answering outside the retrieved context. If no relevant chunks are found it returns a canned fallback pointing to the Contact section.

---

## Environment variables

Copy `.env.example` to `.env` at the repo root:

```
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=mc-portfolio
PINECONE_HOST=https://your-index-host.pinecone.io
REDIS_URL=redis://redis:6379
INGEST_SECRET=change-me-to-a-random-secret
ENVIRONMENT=development
API_PORT=3001
DOMAIN=yourdomain.com
```

---

## Local development

```bash
# Both apps in one command (API background, web foreground)
make dev-full

# Or separately
make dev-api    # FastAPI on :3001  (hot-reload)
make dev-web    # Astro on :4321

# All services via Docker (includes Redis)
make dev
```

First-time setup:
```bash
cd apps/api && python3 -m venv .venv && source .venv/bin/activate
make install-api
cd apps/web && pnpm install
```

After changing the AI docs, re-run ingest:
```bash
make ingest-local   # requires make dev-api running
```

---

## Testing & linting

```bash
make test       # pytest (API) + vitest (web)
make lint       # mypy --strict + ruff (API), tsc --noEmit (web)
```

---

## Production deployment (Raspberry Pi)

1. Copy repo to Pi, create `.env` with production values
2. `make build && make up` — starts web, api, redis containers
3. Configure Nginx Proxy Manager per `docker/nginx/NPM_SETUP.md`
4. Point DNS to Pi's IP (or Tailscale address)
5. `make ingest` — indexes documents into Pinecone
