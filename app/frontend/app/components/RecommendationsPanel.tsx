"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="panel-cyber-magenta rounded-lg p-3 sm:p-4 flex flex-col h-[400px] sm:h-[500px] lg:h-[calc(100vh-180px)]">
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

  return (
    <aside className="panel-cyber-magenta rounded-lg p-3 sm:p-4 flex flex-col h-[400px] sm:h-[500px] lg:h-[calc(100vh-180px)] sticky top-[80px]">
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
              className="bg-black/40 border-l-2 border-[#ff00ff]/50 p-3 rounded hover:bg-black/60 hover:border-[#ff00ff] hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-200 scanline group"
            >
              <div className="flex gap-3 items-start mb-2">
                {rec.cover && (
                  <div className="relative w-10 h-14 flex-shrink-0">
                    <img
                      src={rec.cover}
                      alt={rec.title}
                      className="w-full h-full object-cover rounded border border-white/10 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-magenta-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-magenta-400 transition-colors">
                    {rec.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-mono truncate">
                    {rec.author}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-[#ff00ff] font-mono font-bold">
                      {Math.round(rec.matchScore * 100)}% Match
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed line-clamp-2 mb-2 italic border-l border-gray-700 pl-2">
                {rec.reason}
              </p>
              <div className="flex flex-col gap-2">
                {rec.genre && (
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">
                    {rec.genre}
                  </p>
                )}
                {rec.tags && rec.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 bg-[#ff00ff]/5 border border-[#ff00ff]/20 rounded text-[#ff00ff]/80 font-mono"
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