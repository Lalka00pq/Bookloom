"use client";

import { Search, Cpu, BookOpen } from "lucide-react";

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function Header({
  query,
  onQueryChange,
  onSearch,
  onAnalyze,
  isAnalyzing,
}: HeaderProps) {
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
            BookGraph
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
            onKeyPress={handleKeyPress}
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
          disabled={isAnalyzing}
          className="btn-neon inline-flex items-center gap-2 px-3 py-2 rounded sm:px-4 disabled:opacity-70 disabled:cursor-wait"
        >
          <Cpu className="h-4 w-4" />
          <span className="font-mono text-xs hidden sm:inline">Analies</span>
        </button>
      </div>
    </header>
  );
}

