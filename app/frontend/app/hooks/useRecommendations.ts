import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Recommendation } from "../types";
import { recommendationsApi, ApiError } from "../utils/api";
import type { RecommendationsResponse } from "../schemas/recommendations";
import {
  DefaultRecommendationTransformer,
  ScoreSorter,
  RecommendationPipeline,
  type RecommendationFilter,
} from "../services/recommendationService";

interface UseRecommendationsOptions {
  userId?: string;
  limit?: number;
  filters?: RecommendationFilter[];
  enableSorting?: boolean;
}

export function useRecommendations(
  options: UseRecommendationsOptions = {}
) {
  const {
    userId = "default_user",
    limit = 3,
    filters = [],
    enableSorting = true,
  } = options;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const hasLoadedFromServerRef = useRef(false);

  // Load saved recommendations from server on mount
  useEffect(() => {
    const loadSavedRecommendations = async () => {
      try {
        if (hasLoadedFromServerRef.current) return;
        hasLoadedFromServerRef.current = true;

        const response: RecommendationsResponse =
          await recommendationsApi.getSavedRecommendations();

        if (response.recommendations && response.recommendations.length > 0) {
          setRawData(response);
          const transformed = pipeline.process(response.recommendations);
          setRecommendations(transformed);
        }
      } catch (err) {
        // Silently fail - server might not have saved recommendations yet
        console.debug("No saved recommendations found on server");
      }
    };

    loadSavedRecommendations();
  }, []);

  const pipeline = useMemo(() => {
    return new RecommendationPipeline(
      new DefaultRecommendationTransformer(),
      filters,
      enableSorting ? new ScoreSorter() : undefined
    );
  }, [filters, enableSorting]);

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RecommendationsResponse =
        await recommendationsApi.getRecommendations({
          user_id: userId,
          limit,
        });

      setRawData(response);

      const transformed = pipeline.process(response.recommendations);
      setRecommendations(transformed);
    } catch (err) {
      let errorMessage = "Error fetching recommendations";

      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit, pipeline]);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setRawData(null);
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    clearRecommendations,
    rawData, 
  };
}
