from typing import List, Any, Dict
from pydantic import BaseModel, Field

class BookPropertySchema(BaseModel):
    code: str
    title: str
    author: str
    published: str
    isbn: str
    subjects: List[str] = Field(default_factory=list)
    description: str
    cover: str

class BookNodeSchema(BaseModel):
    id: str
    label: str
    properties: BookPropertySchema

class BookGraphSchema(BaseModel):
    nodes: List[BookNodeSchema]
    edges: List[Dict[str, Any]] = Field(default_factory=list)

class EmbeddingResponseSchema(BaseModel):
    status: str
    total_processed: int
    
class SearchResultSchema(BaseModel):
    id: str
    score: float
    title: str
    author: str
    description: str
