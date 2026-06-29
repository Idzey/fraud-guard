from functools import lru_cache
from typing import Annotated

from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _split_origins(value: str | list[str]) -> list[str]:
    if isinstance(value, list):
        return value
    return [origin.strip() for origin in value.split(",") if origin.strip()]


CorsOrigins = Annotated[list[str], BeforeValidator(_split_origins)]


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    app_name: str = "FraudGuard ML API"
    api_prefix: str = ""
    cors_origins: CorsOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="FRAUD_",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

