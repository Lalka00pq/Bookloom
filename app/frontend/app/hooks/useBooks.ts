import { useMemo, useState } from "react";
import type { Book } from "../types";

export function useBooks(initialBooks: Book[]) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [activeBookId, setActiveBookId] = useState<string | null>(
    initialBooks[0]?.id ?? null,
  );

  const activeBook = useMemo(
    () => books.find((b) => b.id === activeBookId) ?? books[0],
    [books, activeBookId],
  );

  const addBook = (book: Book) => {
    setBooks((prev) => {
      if (prev.some((b) => b.id === book.id)) {
        return prev;
      }
      return [...prev, book];
    });
  };

  const removeBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (activeBookId === bookId) {
      setActiveBookId(books[0]?.id ?? null);
    }
  };

  const filterBooks = (query: string) => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.tags.some((t) => t.toLowerCase().includes(q)),
    );
  };

  return {
    books,
    activeBook,
    activeBookId,
    setActiveBookId,
    addBook,
    removeBook,
    filterBooks,
  };
}

