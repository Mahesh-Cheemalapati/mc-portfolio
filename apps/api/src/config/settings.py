from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=('../../.env', '.env'),
        env_file_encoding='utf-8',
        extra='ignore',
    )

    openai_api_key: str
    pinecone_api_key: str
    pinecone_index: str
    pinecone_host: str
    redis_url: str = 'redis://redis:6379'
    rate_limit_max: int = 25
    rate_limit_window_seconds: int = 86400
    ingest_secret: str
    api_port: int = 3001
    environment: str = 'development'
    domain: str = 'yourdomain.com'


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
