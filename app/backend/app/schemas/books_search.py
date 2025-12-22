from typing import List, Optional

from pydantic import BaseModel


class BookSearchRequest(BaseModel):
    """Schema of the incoming request for searching books."""

    query: str
    max_results: int = 10


class BookSearchItem(BaseModel):
    """Item of the search result of a book (adaptation of the response from Google Books API).

    Fields required for rendering:
    - author: author(s) of the book
    - title: title of the book
    - code: code of the book (id in Google Books)
    - published: publication date
    - isbn: main ISBN (10/13)
    - subjects: list of categories / topics
    - description: description of the book
    - cover: URL of the cover
    """

    author: str
    title: str
    code: str
    published: Optional[str] = None
    isbn: Optional[str] = None
    subjects: List[str] = []
    description: Optional[str] = None
    cover: Optional[str] = None


class BookSearchResponse(BaseModel):
    """List of found books (simplified response from Google Books API)."""

    items: List[BookSearchItem]
