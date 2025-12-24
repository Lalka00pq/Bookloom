"use client";

import { X, Plus, BookOpen } from "lucide-react";
import { useEffect } from "react";
import type { Book } from "../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  searchResults: Book[];
  existingBookIds: Set<string>;
  onAddBook: (book: Book) => void;
}

// Моковые данные для поиска (в реальном приложении это будет API запрос)
const SEARCH_RESULTS_MOCK: Book[] = [
  {
    id: "6",
    title: "1984",
    author: "Джордж Оруэлл",
    year: 1949,
    tags: ["антиутопия", "политика", "классика"],
    progress: 0,
  },
  {
    id: "7",
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    year: 1866,
    tags: ["психология", "философия", "классика"],
    progress: 0,
  },
  {
    id: "8",
    title: "Война и мир",
    author: "Лев Толстой",
    year: 1869,
    tags: ["история", "война", "классика"],
    progress: 0,
  },
  {
    id: "9",
    title: "Гарри Поттер и философский камень",
    author: "Дж. К. Роулинг",
    year: 1997,
    tags: ["фэнтези", "магия", "приключения"],
    progress: 0,
  },
  {
    id: "10",
    title: "Властелин колец",
    author: "Дж. Р. Р. Толкин",
    year: 1954,
    tags: ["фэнтези", "приключения", "эпика"],
    progress: 0,
  },
];

export function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  searchResults,
  existingBookIds,
  onAddBook,
}: SearchModalProps) {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Фильтруем результаты поиска
  const filteredResults = searchQuery.trim()
    ? SEARCH_RESULTS_MOCK.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : SEARCH_RESULTS_MOCK;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="panel-cyber w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-lg p-3 sm:p-4 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#00fff7]" />
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Search Results
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-neon p-2 rounded hover:bg-cyan-500/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Query Display */}
        {searchQuery.trim() && (
          <div className="mb-4 text-sm text-gray-400 font-mono">
            Results for: <span className="text-[#00fff7]">{searchQuery}</span>
          </div>
        )}

        {/* Results List */}
        <div className="panel-scroll flex-1 overflow-y-auto pr-2 space-y-3">
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 font-mono">
                No books found for "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredResults.map((book) => {
              const isAlreadyAdded = existingBookIds.has(book.id);
              return (
                <div
                  key={book.id}
                  className="bg-black/40 border border-[#00fff7]/30 rounded p-4 hover:border-[#00fff7]/60 hover:bg-black/60 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mb-2">
                        {book.author} · {book.year}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {book.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-[#00fff7]/10 text-[#00fff7] rounded font-mono border border-[#00fff7]/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!isAlreadyAdded) {
                          onAddBook(book);
                        }
                      }}
                      disabled={isAlreadyAdded}
                      className={`
                        btn-neon px-3 py-2 rounded flex items-center gap-2 font-mono text-xs
                        ${isAlreadyAdded ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {isAlreadyAdded ? (
                        <>
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline">Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Add to Graph</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[#00fff7]/20 text-xs text-gray-500 font-mono text-center">
          {filteredResults.length} book{filteredResults.length !== 1 ? "s" : ""}{" "}
          found
        </div>
      </div>
    </div>
  );
}

