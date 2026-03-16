import os
import chromadb
from typing import List, Dict, Any
from chromadb.utils import embedding_functions
from app.core.config import settings

class ChromaService:
    """Service to interact with ChromaDB vector database."""
    
    def __init__(self):
        # We ensure the persistence directory exists
        os.makedirs(settings.CHROMADB_DIR, exist_ok=True)
        
        self.client = chromadb.PersistentClient(path=settings.CHROMADB_DIR)
        
        # Uses standard sentence-transformers to calculate embedding implicitly
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=settings.EMBEDDING_MODEL_NAME
        )
        
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMADB_COLLECTION_NAME,
            embedding_function=self.embedding_function
        )
        
    def add_books(self, 
                 ids: List[str],
                 documents: List[str], 
                 metadatas: List[Dict[str, Any]]):
        """
        Calculates and stores embeddings for the provided texts.
        Uses upsert, so if an id exists, it will be updated.
        """
        if not ids:
            return
            
        self.collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        
    def query_books(self, query: str, n_results: int = 5) -> Dict[str, Any]:
        """
        Queries the vector database using a semantic text query.
        Returns the top `n_results` matches.
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results

# Dependency provider
def get_chroma_service() -> ChromaService:
    return ChromaService()
