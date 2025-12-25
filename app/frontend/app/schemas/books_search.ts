// Схемы для поиска книг (аналогично backend/app/schemas/books_search.py)

export interface BookSearchRequest {
  query: string;
  max_results?: number;
}

export interface BookSearchItem {
  author: string;
  title: string;
  code: string;
  published?: string;
  isbn?: string;
  subjects: string[];
  description?: string;
  cover?: string;
}

export interface BookSearchResponse {
  items: BookSearchItem[];
}

