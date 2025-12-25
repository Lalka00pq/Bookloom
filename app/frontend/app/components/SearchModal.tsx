"use client";

import { X, Plus, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import type { BookSearchItem } from "../schemas/books_search";
import { booksSearchApi, ApiError } from "../utils/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  existingBookCodes: Set<string>;
  onAddBook: (book: BookSearchItem) => void;
}


export function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  existingBookCodes,
  onAddBook,
}: SearchModalProps) {
  const [searchResults, setSearchResults] = useState<BookSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Поиск книг при открытии модального окна
  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen, searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await booksSearchApi.search(searchQuery.trim(), 10);
      setSearchResults(response.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.statusCode === 502
            ? "Ошибка подключения к Google Books API"
            : err.message,
        );
      } else {
        setError("Произошла ошибка при поиске книг");
      }
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 font-mono">Поиск книг...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-400 font-mono">{error}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 font-mono">
                {searchQuery.trim()
                  ? `Книги не найдены для "${searchQuery}"`
                  : "Введите название книги для поиска"}
              </p>
            </div>
          ) : (
            searchResults.map((book) => {
              const isAlreadyAdded = existingBookCodes.has(book.code);
              return (
                <div
                  key={book.code}
                  className="bg-black/40 border border-[#00fff7]/30 rounded p-4 hover:border-[#00fff7]/60 hover:bg-black/60 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {book.cover && (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="float-left mr-3 mb-2 w-16 h-24 object-cover rounded"
                        />
                      )}
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mb-2">
                        {book.author}
                        {book.published && ` · ${book.published}`}
                      </p>
                      {book.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {book.description}
                        </p>
                      )}
                      {book.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {book.subjects.slice(0, 5).map((subject) => (
                            <span
                              key={subject}
                              className="text-[10px] px-2 py-0.5 bg-[#00fff7]/10 text-[#00fff7] rounded font-mono border border-[#00fff7]/20"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}
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
                          <span className="hidden sm:inline">Добавлено</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Добавить в граф</span>
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
        {!isLoading && !error && searchResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#00fff7]/20 text-xs text-gray-500 font-mono text-center">
            Найдено книг: {searchResults.length}
          </div>
        )}
      </div>
    </div>
  );
}

