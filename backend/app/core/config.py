"""Application configuration settings."""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:admin@localhost:5432/test"
    )
    
    # Security
    secret_key: str = os.getenv(
        "SECRET_KEY", 
        "change-this-secret-key-in-production-use-env-variable"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    # File Upload
    max_file_size_mb: int = 50
    allowed_file_extensions: List[str] = [".csv"]
    upload_directory: str = "uploads"
    
    # Application
    app_name: str = "CSV Manager API"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

