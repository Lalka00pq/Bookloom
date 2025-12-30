"use client";

import { useEffect, useState } from "react"; // 1. Добавляем хуки
import { TrendingUp, AlertCircle, Loader } from "lucide-react";
import type { Recommendation } from "../types";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
}

export function RecommendationsPanel({
  recommendations,
  isLoading = false,
  error = null,
  isEmpty = false,
}: RecommendationsPanelProps) {
  // 2. Добавляем проверку монтирования
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Пока компонент не "ожил" в браузере, возвращаем структуру, 
  // максимально близкую к серверной, либо просто пустую панель.
  if (!mounted) {
    return (
      <aside className="panel-cyber-magenta rounded-lg p-3 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        <header className="mb-3 sm:mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff00ff]" />
          <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
            Recommendations
          </h2>
        </header>
        <div className="flex-1" />
      </aside>
    );
  }

  // 4. Основная логика теперь работает только после того, как mounted === true
  return (
    <aside className="panel-cyber-magenta rounded-lg p-3 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      <header className="mb-3 sm:mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff00ff]" />
        <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
          Recommendations
        </h2>
      </header>
      <div className="panel-scroll flex-1 space-y-3 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <Loader className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff00ff] animate-spin" />
            <p className="text-xs text-gray-400 font-mono">
              Analyzing your library...
            </p>
          </div>
        ) : error ? (
          <div className="mt-6 flex flex-col items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            <p className="text-xs text-red-300 font-mono text-center">
              {error}
            </p>
          </div>
        ) : isEmpty ? (
          <p className="mt-6 text-center text-xs text-gray-500 font-mono">
            Add books to analyze
          </p>
        ) : recommendations.length === 0 ? (
          <p className="mt-6 text-center text-xs text-gray-500 font-mono">
            No recommendations yet
          </p>
        ) : (
          recommendations.map((rec) => (
            <article
              key={rec.id}
              className="bg-black/40 border-l-2 border-[#ff00ff]/50 p-3 rounded hover:bg-black/60 hover:border-[#ff00ff] hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-200 scanline"
            >
              <div className="mb-2">
                <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                  {rec.title}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                  {rec.author}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed line-clamp-3 mb-2">
                {rec.reason}
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-[#ff00ff] font-mono">
                    Match: {Math.round(rec.matchScore * 100)}%
                  </span>
                </div>
                {rec.genre && (
                  <p className="text-[10px] text-gray-500 font-mono">
                    {rec.genre}
                  </p>
                )}
                {rec.tags && rec.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-2 py-0.5 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded text-[#ff00ff] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}