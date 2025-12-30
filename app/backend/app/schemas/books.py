# python
from typing import Optional

# 3rd party
from pydantic import BaseModel


class Book(BaseModel):
    """Book model."""
    id: Optional[int] = None
    title: str
    author: str
    description: Optional[str] = None
    isbn: Optional[str] = None
