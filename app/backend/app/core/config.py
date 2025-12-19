import os

from pydantic import BaseModel
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
GOOGLE_BOOKS_API_URL = os.getenv("GOOGLE_BOOKS_API_ENDPOINT")

if GOOGLE_BOOKS_API_KEY is None:
    raise ValueError("GOOGLE_BOOKS_API_KEY is not set")
if GOOGLE_BOOKS_API_URL is None:
    raise ValueError("GOOGLE_BOOKS_API_URL is not set")


class Settings(BaseSettings):
    app_name: str = "BookLoop"
    app_version: str = "0.1.0"


class ApiBooksSettings(BaseModel):
    API_BOOKS_URL: str = GOOGLE_BOOKS_API_URL
    API_BOOKS_KEY: str = GOOGLE_BOOKS_API_KEY


class ApiModelSettings(BaseModel):
    API_MODEL_URL: str = "https://api.example.com/model"
    API_MODEL_KEY: str = "your_api"


class API_Settings(BaseModel):
    api_books: "ApiBooksSettings" = ApiBooksSettings()
    api_model: "ApiModelSettings" = ApiModelSettings()
