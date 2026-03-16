from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Profile Service"
    
    # File Paths
    GRAPH_JSON_PATH: str = "graph.json"
    
    # ChromaDB Settings
    CHROMADB_DIR: str = "./chroma_data"
    CHROMADB_COLLECTION_NAME: str = "books"
    
    # Embeddings Model
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
