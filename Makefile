.PHONY: dev dev-full build up down test test-web test-api lint ingest ingest-local logs shell-api deploy dev-api dev-web install-api clean

dev:
	docker compose up

build:
	docker compose build

up:
	docker compose -f docker-compose.prod.yml up -d

down:
	docker compose down

test: test-web test-api

test-web:
	cd apps/web && pnpm test

test-api:
	cd apps/api && python -m pytest tests/ -v --cov=src --cov-report=term-missing

lint:
	cd apps/api && ruff check src/ && .venv/bin/mypy --config-file pyproject.toml src/
	cd apps/web && pnpm tsc --noEmit

ingest:
	docker compose exec api python /scripts/ingest_resume.py

logs:
	docker compose logs -f

shell-api:
	docker compose exec api /bin/sh

deploy:
	git pull
	make build
	make up
	@echo "Deployed successfully"

dev-api:
	cd apps/api && uvicorn src.main:app --reload --port 3001

dev-web:
	cd apps/web && pnpm dev

install-api:
	cd apps/api && pip3 install -r requirements.txt -r requirements.dev.txt

ingest-local:
	apps/api/.venv/bin/python3 apps/api/scripts/ingest_resume.py

dev-full:
	@echo "Starting API on :3001 and Web on :4321"
	@make dev-api &
	@make dev-web

clean:
	docker compose down -v
	rm -rf apps/web/dist
	rm -rf apps/web/node_modules
	find apps/api -name "__pycache__" -type d -exec rm -rf {} +
	find apps/api -name "*.pyc" -delete
