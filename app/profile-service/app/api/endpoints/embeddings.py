from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.book import EmbeddingResponseSchema, SearchResultSchema
from app.agents.orchestrator import orchestrator
from app.services.chroma_service import get_chroma_service, ChromaService

router = APIRouter()

@router.post("/sync", response_model=EmbeddingResponseSchema)
async def sync_embeddings():
    """
    Triggers the LangGraph orchestrator to run the embedding agent.
    This reads books from the source, generates embeddings, and saves them to ChromaDB.
    """
    try:
        # Initial state for the LangGraph
        initial_state = {"action": "sync_embeddings"}
        
        # Invoke the orchestrator graph
        result = orchestrator.invoke(initial_state)
        
        status = result.get("embedding_status", "unknown")
        processed = result.get("processed_count", 0)
        error_msg = result.get("error_message")
        
        if status == "error":
            raise HTTPException(status_code=500, detail=f"Failed to sync embeddings: {error_msg}")
            
        return EmbeddingResponseSchema(status=status, total_processed=processed)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=List[SearchResultSchema])
async def search_books(query: str, limit: int = 5, chroma_service: ChromaService = Depends(get_chroma_service)):
    """
    Searches the vector database for books matching the semantic query.
    """
    try:
        results = chroma_service.query_books(query=query, n_results=limit)
        
        response_data = []
        if results and "ids" in results and results["ids"]:
            # ChromaDB returns a list of lists for ids, distances, metadatas, documents
            ids_list = results["ids"][0]
            distances_list = results["distances"][0] if "distances" in results else [0.0] * len(ids_list)
            metadatas_list = results["metadatas"][0] if "metadatas" in results else [{}] * len(ids_list)
            
            for i in range(len(ids_list)):
                meta = metadatas_list[i]
                response_data.append(
                    SearchResultSchema(
                        id=ids_list[i],
                        score=distances_list[i],
                        title=meta.get("title", ""),
                        author=meta.get("author", ""),
                        description=meta.get("description", "")
                    )
                )
                
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
