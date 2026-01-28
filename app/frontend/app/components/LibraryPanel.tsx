"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="panel-cyber rounded-lg p-3 sm:p-4 flex flex-col h-[400px] sm:h-[500px] lg:h-[calc(100vh-180px)]">
        <header className="mb-3 sm:mb-4 flex items-center gap-2">
          <Library className="h-4 w-4 sm:h-5 sm:w-5 text-[#00fff7]" />
          <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
            My Library
          </h2>
        </header>
        <div className="flex-1" />
      </aside>
    );
  }

  return (
    <aside className="panel-cyber rounded-lg p-3 sm:p-4 flex flex-col h-[400px] sm:h-[500px] lg:h-[calc(100vh-180px)] sticky top-[80px]">
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
                "data-block scanline w-full text-left rounded group",
                activeBookId === book.id &&
                  "border-l-cyan-500 bg-black/80 pulse-neon",
              )}
            >
              <div className="flex gap-3 items-start">
                {book.cover && (
                  <div className="relative w-10 h-14 sm:w-12 sm:h-16 flex-shrink-0 group">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover rounded border border-white/10 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {book.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-mono truncate">
                    {book.author}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-mono">
                    {book.year}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1 bg-black/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00fff7] shadow-[0_0_8px_rgba(0,255,247,0.6)]"
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