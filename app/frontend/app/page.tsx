"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { LibraryPanel } from "./components/LibraryPanel";
import { GraphField } from "./components/GraphField";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { SearchModal } from "./components/SearchModal";
import { useBooks } from "./hooks/useBooks";
import { useGraph } from "./hooks/useGraph";
import type { Book, Recommendation } from "./types";

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Тень ветра",
    author: "Карлос Руис Сафон",
    year: 2001,
    tags: ["готика", "барселона", "тайна"],
    progress: 100,
  },
  {
    id: "2",
    title: "Имя розы",
    author: "Умберто Эко",
    year: 1980,
    tags: ["средневековье", "детектив", "философия"],
    progress: 78,
  },
  {
    id: "3",
    title: "Сто лет одиночества",
    author: "Габриэль Гарсиа Маркес",
    year: 1967,
    tags: ["магический реализм", "семья", "латинская америка"],
    progress: 42,
  },
  {
    id: "4",
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    year: 1967,
    tags: ["мистика", "сатирa", "классика"],
    progress: 100,
  },
  {
    id: "5",
    title: "Ночь в Лиссабоне",
    author: "Эрих Мария Ремарк",
    year: 1962,
    tags: ["военный роман", "эмиграция", "любовь"],
    progress: 15,
  },
  {
    id: "6",
    title: "На западном фронте без перемен",
    author: "Эрих Мария Ремарк",
    year: 1929,
    tags: ["военный роман", "трагика", "классика"],
    progress: 100,
  },
];

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

  const {
    books,
    activeBook,
    activeBookId,
    setActiveBookId,
    addBook,
    filterBooks,
  } = useBooks(MOCK_BOOKS);

  const graphData = useGraph(books);

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

  const handleAddBook = (book: Book) => {
    addBook(book);
    setIsSearchModalOpen(false);
    setSearchQuery("");
  };

  const filteredBooks = filterBooks(searchQuery);

  return (
    <main className="relative z-10 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1920px]">
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
            onNodeClick={setActiveBookId}
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
        searchResults={[]}
        existingBookIds={new Set(books.map((b) => b.id))}
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
