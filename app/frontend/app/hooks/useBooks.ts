import { useMemo, useState, useEffect } from "react";
import type { Book } from "../types";

export function useBooks(initialBooks: Book[]) {
  const STORAGE_KEY = "user_books";

  const getInitialBooks = (): Book[] => {
    try {
      if (typeof window === "undefined") return initialBooks;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialBooks;
      const parsed = JSON.parse(raw) as Book[];
      return Array.isArray(parsed) ? parsed : initialBooks;
    } catch {
      return initialBooks;
    }
  };

  const [books, setBooks] = useState<Book[]>(getInitialBooks);

  const getInitialActiveId = (): string | null => {
    const b = getInitialBooks();
    return b[0]?.id ?? null;
  };

  const [activeBookId, setActiveBookId] = useState<string | null>(
    getInitialActiveId(),
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

  // Persist books to localStorage on change (guarded for SSR)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch {
      // ignore storage errors
    }
  }, [books]);

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

