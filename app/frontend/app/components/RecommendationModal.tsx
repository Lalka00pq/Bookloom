"use client";

import { X, Sparkles } from "lucide-react";
import { useEffect } from "react";
import type { Recommendation } from "../types";

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
}

export function RecommendationModal({
  isOpen,
  onClose,
  recommendation,
}: RecommendationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !recommendation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="panel-cyber-magenta w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-lg p-3 sm:p-4 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ff00ff]" />
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Recommendation Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-neon-magenta p-2 rounded hover:bg-magenta-500/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="panel-scroll flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {recommendation.cover && (
              <div className="w-32 h-48 sm:w-40 sm:h-60 flex-shrink-0 mx-auto md:mx-0">
                <img
                  src={recommendation.cover}
                  alt={recommendation.title}
                  className="w-full h-full object-cover rounded border border-magenta-500/30 shadow-[0_0_15px_rgba(255,0,255,0.2)]"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {recommendation.title}
              </h3>
              <p className="text-sm sm:text-base text-[#ff00ff] font-mono mb-4">
                {recommendation.author}
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="px-3 py-1 bg-magenta-500/10 border border-magenta-500/30 rounded text-xs font-mono text-[#ff00ff]">
                  {Math.round(recommendation.matchScore * 100)}% Match
                </div>
                {recommendation.genre && (
                  <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                    {recommendation.genre}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">
                    Why this book?
                  </h4>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed italic">
                    "{recommendation.reason}"
                  </p>
                </div>

                {recommendation.tags && recommendation.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2 pb-1">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] sm:text-xs px-2 py-1 bg-[#ff00ff]/5 border border-[#ff00ff]/20 rounded text-[#ff00ff]/80 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-neon-magenta px-6 py-2 rounded font-mono text-xs uppercase tracking-widest"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
