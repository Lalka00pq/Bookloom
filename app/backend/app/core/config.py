from pydantic import BaseModel
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "BookLoop"
    app_version: str = "0.1.0"


class ApiBooksSettings(BaseModel):
    API_BOOKS_URL: str = "https://api.example.com/books"
    API_BOOKS_KEY: str = "your_api"


class ApiModelSettings(BaseModel):
    API_MODEL_URL: str = "https://api.example.com/model"
    API_MODEL_KEY: str = "your_api"


class API_Settings(BaseModel):
    api_books: "ApiBooksSettings" = ApiBooksSettings()
    api_model: "ApiModelSettings" = ApiModelSettings()
