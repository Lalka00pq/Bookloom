"""Endpoints for managing books in the user's graph."""
from fastapi import APIRouter, HTTPException

from app.core.graph import graph_instance
from app.schemas.books_search import BookSearchItem
from app.schemas.graph import Node

router = APIRouter()

BOOK_LABEL = "book"
CODE_PROPERTY_KEY = "code"


@router.post(
    "/add_to_graph",
    response_model=Node,
    summary="Add book to user's graph",
    description="Adds a book to the user's graph using book data from search results. "
    "If the book already exists, returns the existing node.",
)
async def add_book_to_graph(book: BookSearchItem) -> Node:
    """Add a book to the user's graph using book data from search results.

    The function:
    1. Checks if the book already exists in the graph (by code)
    2. Adds the book as a node if it doesn't exist
    3. Returns the book node

    This endpoint expects book data from the search endpoint response,
    avoiding duplicate API calls to Google Books API.

    Args:
        book (BookSearchItem): Book data from search endpoint response

    Raises:
        HTTPException: If the book data is invalid (422)

    Returns:
        Node: The book node added to or found in the graph
    """
    # Validate required fields
    if not book.code:
        raise HTTPException(
            status_code=422,
            detail="Book code is required",
        )

    if not book.title:
        raise HTTPException(
            status_code=422,
            detail="Book title is required",
        )

    # Check if book already exists in graph
    existing_node = graph_instance.find_node_by_property(
        CODE_PROPERTY_KEY, book.code
    )
    if existing_node:
        return existing_node

    # Create book properties for the graph node
    book_properties = {
        CODE_PROPERTY_KEY: book.code,
        "title": book.title,
        "author": book.author,
        "published": book.published,
        "isbn": book.isbn,
        "subjects": book.subjects,
        "description": book.description,
        "cover": book.cover,
    }

    # Add node to graph
    new_node = graph_instance.add_node(
        label=BOOK_LABEL, properties=book_properties)
    return new_node
