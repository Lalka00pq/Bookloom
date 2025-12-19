from typing import List, Optional

from pydantic import BaseModel


class BookSearchRequest(BaseModel):
    """Схема входящего запроса для поиска книг."""

    query: str
    max_results: int = 10


class BookSearchItem(BaseModel):
    """Элемент результата поиска книги (адаптация ответа Google Books API).

    Поля, необходимые для отрисовки:
    - author: автор(ы) книги
    - title: название книги
    - code: код книги (id в Google Books)
    - published: дата публикации
    - isbn: основной ISBN (10/13)
    - subjects: список категорий / тем
    - description: описание книги
    - cover: URL обложки
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
    """Список найденных книг (упрощённый ответ Google Books API)."""

    items: List[BookSearchItem]
