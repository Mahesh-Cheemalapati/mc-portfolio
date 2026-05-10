#!/usr/bin/env python3
"""Ingests resume and context markdown into the vector database.

Usage (from repo root):
    make ingest
    # or directly:
    docker compose exec api python /scripts/ingest_resume.py
"""

import os
import sys

CONTENT_PATHS = [
    "/app/content/ai/resume.md",
    "/app/content/ai/context.md",
]


def main() -> None:
    print("ingest_resume.py — RAG ingest script")
    print("--------------------------------------")
    print("This script will be implemented in Pass 2 (RAG pipeline).")
    print()
    for path in CONTENT_PATHS:
        exists = os.path.exists(path)
        status = "found" if exists else "NOT FOUND"
        print(f"  {status}: {path}")
    print()
    print("To run the full ingest, implement services/embed_service.py")
    print("and services/rag_service.py, then re-run this script.")
    sys.exit(0)


if __name__ == "__main__":
    main()
