import os

from pydantic import BaseModel
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

# --- External APIs configuration ---
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
GOOGLE_BOOKS_API_URL = os.getenv("GOOGLE_BOOKS_API_ENDPOINT")

if GOOGLE_BOOKS_API_KEY is None:
    raise ValueError("GOOGLE_BOOKS_API_KEY is not set")
if GOOGLE_BOOKS_API_URL is None:
    raise ValueError("GOOGLE_BOOKS_API_URL is not set")


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-flash")
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta",
)

if GEMINI_API_KEY is None:
    raise ValueError("GEMINI_API_KEY is not set")


class Settings(BaseSettings):
    app_name: str = "BookLoop"
    app_version: str = "0.1.0"


class ApiBooksSettings(BaseModel):
    API_BOOKS_URL: str = GOOGLE_BOOKS_API_URL
    API_BOOKS_KEY: str = GOOGLE_BOOKS_API_KEY


class GeminiSettings(BaseModel):
    """Настройки для доступа к модели Google Gemini."""

    api_key: str = GEMINI_API_KEY
    model_name: str = GEMINI_MODEL_NAME
    api_url: str = GEMINI_API_URL
    timeout: float = 30.0


class ApiModelSettings(BaseModel):
    API_MODEL_URL: str = "https://api.example.com/model"
    API_MODEL_KEY: str = "your_api"


class HealthMonitorSettings(BaseModel):
    """Settings for health monitoring service."""

    enabled: bool = True
    check_interval: int = 60  # seconds
    base_url: str = "http://localhost:8000"
    health_endpoint: str = "/health/check"
    timeout: float = 5.0


class API_Settings(BaseModel):
    api_books: "ApiBooksSettings" = ApiBooksSettings()
    api_model: "ApiModelSettings" = ApiModelSettings()
