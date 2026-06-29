from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables."""

    app_name: str = "FraudGuard ML API"
    api_prefix: str = ""
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:4173,"
        "http://127.0.0.1:4173"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="FRAUD_",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
