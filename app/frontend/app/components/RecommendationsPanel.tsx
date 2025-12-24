"use client";

import { TrendingUp } from "lucide-react";
import type { Recommendation } from "../types";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({
  recommendations,
}: RecommendationsPanelProps) {
  return (
    <aside className="panel-cyber-magenta rounded-lg p-3 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      <header className="mb-3 sm:mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff00ff]" />
        <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
          Recommendations field
        </h2>
      </header>
      <div className="panel-scroll flex-1 space-y-3 overflow-y-auto pr-2">
        {recommendations.length === 0 ? (
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs text-[#ff00ff] font-mono">
                  Match: {Math.round(rec.matchScore * 100)}%
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

