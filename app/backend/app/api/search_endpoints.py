from fastapi import APIRouter, HTTPException
import httpx

from app.core.config import ApiBooksSettings
from app.schemas.books_search import (
    BookSearchRequest,
    BookSearchItem,
    BookSearchResponse,
)

router = APIRouter()

api_books_settings = ApiBooksSettings()


@router.post(
    "/search",
    response_model=BookSearchResponse,
    summary="Поиск книг через Google Books API",
    description="Выполняет поиск книг в Google Books и возвращает список результатов",
)
async def search_books(request: BookSearchRequest) -> BookSearchResponse:
    params = {
        "q": request.query,
        "maxResults": request.max_results,
        "key": api_books_settings.API_BOOKS_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(api_books_settings.API_BOOKS_URL, params=params)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ошибка при обращении к Google Books API: {exc}",
        ) from exc

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail="Google Books API вернул ошибку",
        )

    data = response.json()
    items = []

    for item in data.get("items", []):
        volume_info = item.get("volumeInfo", {}) or {}
        title = volume_info.get("title") or ""
        authors = volume_info.get("authors") or []
        code = item.get("id") or ""

        if not title:
            # пропускаем записи без названия
            continue

        author = ", ".join(authors) if authors else ""

        # Published date
        published = volume_info.get("publishedDate")

        # ISBN: берём сначала ISBN_13, потом ISBN_10, если есть
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

    return BookSearchResponse(items=items)
