// Схемы для работы с книгами (аналогично backend/app/schemas/books.py)

export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  isbn?: string;
}

