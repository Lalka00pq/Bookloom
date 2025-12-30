"use client";

import { useEffect, useState } from "react"; // 1. Добавляем хуки
import { Search, Cpu, BookOpen } from "lucide-react";

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isGraphEmpty?: boolean;
}

export function Header({
  query,
  onQueryChange,
  onSearch,
  onAnalyze,
  isAnalyzing,
  isGraphEmpty = true,
}: HeaderProps) {
  // 2. Флаг монтирования
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <header className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center">
          <BookOpen className="h-6 w-6 text-[#00fff7] glow-cyan-text" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white font-mono tracking-wider sm:text-xl">
            BookLoom
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Discover hidden connections in your reading
          </p>
        </div>
      </div>

      {/* Search + Analyze */}
      <div className="flex flex-1 items-center gap-2 md:gap-3 md:justify-end">
        <div className="flex flex-1 items-center gap-2 terminal-input rounded px-3 py-2 sm:px-4 max-w-md">
          <Search className="h-4 w-4 flex-none text-[#00fff7]" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyPress} // Исправлено: onKeyPress устарел, лучше использовать onKeyDown
            placeholder="Search by Title..."
            className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 font-mono focus:outline-none"
          />
        </div>
        
        <button
          type="button"
          onClick={onSearch}
          className="btn-neon inline-flex items-center gap-2 px-3 py-2 rounded sm:px-4"
        >
          <Search className="h-4 w-4" />
          <span className="font-mono text-xs hidden sm:inline">Search</span>
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          // 3. Используем mounted для проверки. 
          // Пока компонент не на клиенте, кнопка всегда в исходном состоянии (как на сервере)
          disabled={!mounted || isAnalyzing || isGraphEmpty}
          className="btn-neon inline-flex items-center gap-2 px-3 py-2 rounded sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title={!mounted || isGraphEmpty ? "Add books to your library first" : "Analyze your reading patterns"}
        >
          <Cpu className="h-4 w-4" />
          <span className="font-mono text-xs hidden sm:inline">
            {mounted && isAnalyzing ? "Analyzing..." : "Analyze"}
          </span>
        </button>
      </div>
    </header>
  );
}