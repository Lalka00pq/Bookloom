import json
from typing import List
from app.core.config import settings
from app.schemas.book import BookNodeSchema

class BookService:
    """Service for handling book data retrieval."""
    
    def __init__(self):
        self.file_path = settings.GRAPH_JSON_PATH
        
    def get_all_books(self) -> List[BookNodeSchema]:
        """
        Reads books from the local JSON graph file.
        In the future, this can be swapped with an HTTP client to fetch from a backend API.
        """
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            nodes = data.get('nodes', [])
            return [BookNodeSchema(**node) for node in nodes]
        except FileNotFoundError:
            print(f"Error: File not found at {self.file_path}")
            return []
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON format in {self.file_path}")
            return []
        except Exception as e:
            print(f"Error reading books: {e}")
            return []

# Dependency provider if needed
def get_book_service() -> BookService:
    return BookService()
