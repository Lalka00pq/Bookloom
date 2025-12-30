# project
from app.core.config import ApiBooksSettings
from app.core.logging import get_logger
from app.schemas.books_search import (
    BookSearchRequest,
    BookSearchItem,
    BookSearchResponse,
)

# 3rd party
from fastapi import APIRouter, HTTPException
import httpx


router = APIRouter()
logger = get_logger(__name__)

api_books_settings = ApiBooksSettings()


@router.post(
    "/search",
    response_model=BookSearchResponse,
    summary="Search books through Google Books API",
    description="Search books in Google Books and return list of results",
)
async def search_books(request: BookSearchRequest) -> BookSearchResponse:
    """Search books through Google Books API

    Args:
        request (BookSearchRequest): request with query and max results

    Raises:
        HTTPException: if the Google Books API returns an error
        HTTPException: if the Google Books API returns an exception

    Returns:
        BookSearchResponse: list of search results
    """
    logger.info(
        "Searching books",
        query=request.query,
        max_results=request.max_results,
    )

    params = {
        "q": request.query,
        "maxResults": request.max_results,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                api_books_settings.API_BOOKS_URL,
                params=params,
                headers={"X-API-Key": api_books_settings.API_BOOKS_KEY},
            )
    except httpx.RequestError as exc:
        logger.error(
            "Error connecting to Google Books API",
            query=request.query,
            error=str(exc),
            exc_info=True,
        )
        raise HTTPException(
            status_code=502,
            detail=f"Error Google Books API: {exc}",
        ) from exc

    if response.status_code != 200:
        logger.warning(
            "Google Books API returned error",
            query=request.query,
            status_code=response.status_code,
        )
        raise HTTPException(
            status_code=response.status_code,
            detail="Google Books API returned an Exception",
        )

    data = response.json()
    items = []

    for item in data.get("items", []):
        volume_info = item.get("volumeInfo", {}) or {}
        title = volume_info.get("title") or ""
        authors = volume_info.get("authors") or []
        code = item.get("id") or ""

        if not title:
            continue

        author = ", ".join(authors) if authors else ""

        published = volume_info.get("publishedDate")

        isbn = None
        for ident in volume_info.get("industryIdentifiers", []) or []:
            id_type = ident.get("type")
            id_val = ident.get("identifier")
            if id_type == "ISBN_13" and id_val:
                isbn = id_val
                break
            if id_type == "ISBN_10" and id_val and not isbn:
                isbn = id_val

        # Subjects / categories
        subjects = volume_info.get("categories") or []

        # Description
        description = volume_info.get("description")

        # Cover (thumbnail)
        image_links = volume_info.get("imageLinks") or {}
        cover = (
            image_links.get("thumbnail")
            or image_links.get("smallThumbnail")
            or None
        )

        items.append(
            BookSearchItem(
                author=author,
                title=title,
                code=code,
                published=published,
                isbn=isbn,
                subjects=subjects,
                description=description,
                cover=cover,
            )
        )

    logger.info(
        "Books search completed",
        query=request.query,
        items_found=len(items),
    )

    return BookSearchResponse(items=items)
