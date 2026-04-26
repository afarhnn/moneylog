"""
Centralized application configuration.
All settings are read from environment variables.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MoneyLog API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str

    # AI
    OPENROUTER_API_KEY: str = ""
    AI_MODEL: str = "deepseek/deepseek-r1:free"
    AI_SITE_URL: str = "https://moneylog.app"
    AI_SITE_NAME: str = "MoneyLog"

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
