"use client";

import { useEffect, useState } from "react"; // 1. Добавляем хуки
import { Library } from "lucide-react";
import type { Book } from "../types";
import { classNames } from "../utils/classNames";

interface LibraryPanelProps {
  books: Book[];
  activeBookId: string | null;
  onBookSelect: (bookId: string) => void;
}

export function LibraryPanel({
  books,
  activeBookId,
  onBookSelect,
}: LibraryPanelProps) {
  // 2. Создаем состояние для проверки, загрузился ли клиент
  const [mounted, setMounted] = useState(false);

  // 3. useEffect сработает только в браузере
  useEffect(() => {
    setMounted(true);
  }, []);

  // 4. Пока мы на сервере, возвращаем пустой контейнер или скелетон,
  // чтобы структура DOM совпала при гидратации
  if (!mounted) {
    return (
      <aside className="panel-cyber rounded-lg p-3 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        <header className="mb-3 sm:mb-4 flex items-center gap-2">
          <Library className="h-4 w-4 sm:h-5 sm:w-5 text-[#00fff7]" />
          <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
            My Library
          </h2>
        </header>
        <div className="flex-1" /> {/* Пустое место вместо списка */}
      </aside>
    );
  }

  return (
    <aside className="panel-cyber rounded-lg p-3 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      <header className="mb-3 sm:mb-4 flex items-center gap-2">
        <Library className="h-4 w-4 sm:h-5 sm:w-5 text-[#00fff7]" />
        <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
          My Library
        </h2>
      </header>
      <div className="panel-scroll flex-1 space-y-2 overflow-y-auto pr-2">
        {books.length === 0 ? (
          <p className="mt-6 text-center text-xs text-gray-500 font-mono">
            No books in library
          </p>
        ) : (
          books.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => onBookSelect(book.id)}
              className={classNames(
                "data-block scanline w-full text-left rounded",
                activeBookId === book.id &&
                  "border-l-cyan-500 bg-black/80 pulse-neon",
              )}
            >
              <div className="mb-1">
                <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                  {book.title}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                  {book.author} · {book.year}
                </p>
              </div>
              <div className="mt-2 h-1 bg-black/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00fff7]"
                  style={{ width: `${book.progress}%` }}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}