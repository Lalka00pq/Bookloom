"use client";

import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LibraryPanel } from "./components/LibraryPanel";
import { GraphField } from "./components/GraphField";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { SearchModal } from "./components/SearchModal";
import { useBooks } from "./hooks/useBooks";
import { useGraph } from "./hooks/useGraph";
import { useHealthCheck } from "./hooks/useHealthCheck";
import { booksGraphApi, graphApi, ApiError } from "./utils/api";
import type { Book, Recommendation } from "./types";
import type { BookSearchItem } from "./schemas/books_search";

// Начальный список книг пустой - книги будут добавляться из графа

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    title: "Дом странных детей",
    author: "Рэнсом Риггз",
    reason:
      "Тебя притягивает мрачная атмосфера и истории о памяти. Эта книга развивает мотивы ухода от реальности и семейных тайн.",
    matchScore: 0.86,
  },
  {
    id: "r2",
    title: "Невыносимая лёгкость бытия",
    author: "Милан Кундера",
    reason:
      "Тебе близки философские романы о свободе и выборе. Мотивы сомнения и исторической травмы перекликаются с твоим чтением.",
    matchScore: 0.79,
  },
  {
    id: "r3",
    title: "Океан в конце дороги",
    author: "Нил Гейман",
    reason:
      "Ты любишь магический реализм и мягкую, почти сказочную мрачность. Этот роман превращает детские воспоминания в мифологию.",
    matchScore: 0.74,
  },
];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Проверка здоровья backend
  const { isHealthy, isChecking } = useHealthCheck();

  const {
    books,
    activeBook,
    activeBookId,
    setActiveBookId,
    addBook,
    filterBooks,
  } = useBooks([]);

  const { graphData, refreshGraph } = useGraph();

  // Синхронизация книг из графа с локальным состоянием
  useEffect(() => {
    const booksFromGraph: Book[] = graphData.nodes
      .filter((node) => node.kind === "book" && node.properties?.code)
      .map((node) => ({
        id: node.properties.code as string,
        title: node.label,
        author: (node.properties?.author as string) || "Автор не указан",
        year: node.properties?.published
          ? parseInt(
              (node.properties.published as string).split("-")[0] || "0",
            ) || 0
          : 0,
        tags: (node.properties?.subjects as string[]) || [],
        progress: 0,
      }));

    // Обновляем книги только если они изменились
    const existingBookIds = new Set(books.map((b) => b.id));
    booksFromGraph.forEach((book) => {
      if (!existingBookIds.has(book.id)) {
        addBook(book);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData.nodes.length, graphData.nodes.map((n) => n.id).join(",")]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchModalOpen(true);
    }
  };

  const handleAnalyze = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2200);
  };

  const handleAddBook = async (book: BookSearchItem) => {
    try {
      // Добавляем книгу в граф через backend API
      await booksGraphApi.addToGraph(book);
      
      // Обновляем локальное состояние
      const bookForState: Book = {
        id: book.code,
        title: book.title,
        author: book.author,
        year: book.published ? parseInt(book.published.split("-")[0]) || 0 : 0,
        tags: book.subjects || [],
        progress: 0,
      };
      addBook(bookForState);
      
      // Обновляем граф из backend
      refreshGraph();
      
      setIsSearchModalOpen(false);
      setSearchQuery("");
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Ошибка при добавлении книги в граф:", error.message);
        alert(`Ошибка: ${error.message}`);
      } else {
        console.error("Неизвестная ошибка:", error);
        alert("Произошла ошибка при добавлении книги");
      }
    }
  };

  const filteredBooks = filterBooks(searchQuery);

  return (
    <main className="relative z-10 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1920px]">
        {/* Сообщение о недоступности backend */}
        {!isChecking && isHealthy === false && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300 font-mono">
              ⚠️ Сервис временно недоступен. Пожалуйста, проверьте подключение к backend.
            </p>
          </div>
        )}

        <Header
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />

        {/* Main layout - адаптивная сетка */}
        <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] xl:grid-cols-[minmax(250px,320px)_1fr_minmax(250px,320px)]">
          <LibraryPanel
            books={filteredBooks}
            activeBookId={activeBookId}
            onBookSelect={setActiveBookId}
          />

          <GraphField
            graphData={graphData}
            activeBook={activeBook}
            onNodeClick={(nodeId) => {
              // Находим узел в графе по его ID
              const node = graphData.nodes.find((n) => n.id === nodeId);
              if (node && node.properties?.code) {
                // Используем code из properties для поиска книги
                const book = books.find((b) => b.id === node.properties.code);
                if (book) {
                  setActiveBookId(book.id);
                }
              }
            }}
            onNodeEdit={async (nodeId, newDescription) => {
              try {
                // Находим узел в графе по его ID
                const node = graphData.nodes.find((n) => n.id === nodeId);
                if (!node) {
                  throw new Error("Узел не найден");
                }

                // Обновляем описание через backend API
                await graphApi.changeNode(nodeId, {
                  label: node.label,
                  properties: {
                    ...node.properties,
                    description: newDescription,
                  },
                });

                // Обновляем граф (это также обновит локальное состояние книг через useEffect)
                await refreshGraph();
              } catch (error) {
                if (error instanceof ApiError) {
                  throw new Error(error.message);
                }
                throw error;
              }
            }}
          />

          <RecommendationsPanel recommendations={MOCK_RECOMMENDATIONS} />
        </section>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        existingBookCodes={new Set(books.map((b) => b.id))}
        onAddBook={handleAddBook}
      />

      {/* Loading overlay for analysis */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="panel-cyber p-6 rounded-lg max-w-sm text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="text-sm font-mono text-white uppercase tracking-wider">
                Analyzing...
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Processing connections and generating recommendations
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
