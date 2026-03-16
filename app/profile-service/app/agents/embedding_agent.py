import logging
from typing import Dict, Any
from app.services.book_service import get_book_service
from app.services.chroma_service import get_chroma_service

logger = logging.getLogger(__name__)

class EmbeddingAgent:
    """Agent responsible for preparing texts and creating embeddings."""
    
    def __init__(self):
        self.book_service = get_book_service()
        self.chroma_service = get_chroma_service()
        
    def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Node process.
        Retrieves books, forms embeddings, and stores them in ChromaDB.
        """
        logger.info("EmbeddingAgent: Starting processing")
        
        books = self.book_service.get_all_books()
        if not books:
            logger.warning("EmbeddingAgent: No books found to process.")
            return {"status": "no_books_found", "processed_count": 0}
            
        ids = []
        documents = []
        metadatas = []
        
        for book in books:
            book_id = book.id
            props = book.properties
            
            # Form the text to be vectorized. 
            subjects_str = ", ".join(props.subjects) if props.subjects else "Unknown"
            text_to_embed = f"Title: {props.title}\nAuthor: {props.author}\nSubjects: {subjects_str}\nDescription: {props.description}"
            
            # Form metadata
            metadata = {
                "title": props.title,
                "author": props.author,
                "published": props.published,
                "subjects": props.subjects,
                "description": props.description
            }
            
            ids.append(book_id)
            documents.append(text_to_embed)
            metadatas.append(metadata)
            
        logger.info(f"EmbeddingAgent: Prepared {len(ids)} books for embedding. Saving to vector DB (this may take a bit as embeddings are generated locally)...")
        
        try:
            self.chroma_service.add_books(ids=ids, documents=documents, metadatas=metadatas)
            logger.info("EmbeddingAgent: Successfully saved embeddings.")
            return {"status": "success", "processed_count": len(ids)}
        except Exception as e:
            logger.error(f"EmbeddingAgent: Error while saving to ChromaDB: {e}")
            return {"status": "error", "error_message": str(e), "processed_count": 0}

def embedding_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Helper function to serve as a node in LangGraph"""
    agent = EmbeddingAgent()
    result = agent.process(state)
    
    # Return updated state elements
    return {
        "embedding_status": result["status"],
        "processed_count": result.get("processed_count", 0),
        "error_message": result.get("error_message")
    }
