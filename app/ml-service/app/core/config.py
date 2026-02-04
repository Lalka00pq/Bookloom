# python
import os
from typing import Optional

# 3rd party
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv


load_dotenv()


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    # Application
    app_name: str = "BookLoom ML Service"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8080
    

class GeminiSettings(BaseSettings):
    """Google Gemini API settings."""
    
    model_config = SettingsConfigDict(env_prefix="GEMINI_")
    
    api_key: str = Field(..., description="Google Gemini API key")
    model_name: str = Field(default="gemini-1.5-flash", description="Gemini model name")
    embedding_model: str = Field(
        default="models/embedding-001", 
        description="Gemini embedding model"
    )
    api_url: str = Field(
        default="https://generativelanguage.googleapis.com/v1beta",
        description="Gemini API base URL"
    )
    timeout: float = Field(default=30.0, description="API request timeout in seconds")


class RedisSettings(BaseSettings):
    """Redis cache settings."""
    
    model_config = SettingsConfigDict(env_prefix="REDIS_")
    
    url: str = Field(default="redis://redis:6379", description="Redis connection URL")
    host: str = Field(default="redis", description="Redis host")
    port: int = Field(default=6379, description="Redis port")
    db: int = Field(default=0, description="Redis database number")
    password: Optional[str] = Field(default=None, description="Redis password")
    decode_responses: bool = Field(default=True, description="Decode Redis responses to strings")
    
    # Cache TTL settings (in seconds)
    ttl_profile: int = Field(default=2592000, description="Profile cache TTL (30 days)")
    ttl_recommendations: int = Field(default=86400, description="Recommendations cache TTL (24 hours)")
    ttl_graph: int = Field(default=43200, description="Graph cache TTL (12 hours)")
    ttl_user_profile: int = Field(default=21600, description="User profile cache TTL (6 hours)")


class ChromaDBSettings(BaseSettings):
    """ChromaDB vector database settings."""
    
    model_config = SettingsConfigDict(env_prefix="CHROMA_")
    
    db_path: str = Field(
        default="./storage/chroma", 
        description="ChromaDB persistence directory"
    )
    collection_name: str = Field(
        default="book_embeddings",
        description="ChromaDB collection name"
    )
    embedding_dimension: int = Field(
        default=768,
        description="Embedding vector dimension"
    )


# Singleton instances
settings = Settings()
gemini_settings = GeminiSettings()
redis_settings = RedisSettings()
chroma_settings = ChromaDBSettings()
