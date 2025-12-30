/**
 * Сервис для трансформации рекомендаций
 * Отделяет бизнес-логику преобразования данных от компонентов
 * Принцип SOLID: Single Responsibility, Dependency Inversion
 */

import type { Recommendation } from "../types";
import type { BookRecommendation } from "../schemas/recommendations";

export interface RecommendationTransformer {
  transform(items: BookRecommendation[]): Recommendation[];
}

/**
 * Стандартный трансформер рекомендаций из backend формата в UI формат
 */
export class DefaultRecommendationTransformer
  implements RecommendationTransformer
{
  transform(items: BookRecommendation[]): Recommendation[] {
    return items.map((rec, index) => ({
      id: rec.book_id || `rec-${index}`,
      title: rec.title,
      author: rec.author || "Author not specified",
      reason: rec.reason,
      matchScore: rec.score,
      genre: rec.metadata?.genre,
      tags: rec.metadata?.tags,
    }));
  }
}

/**
 * Фильтр для рекомендаций
 * Позволяет фильтровать рекомендации по различным критериям
 */
export interface RecommendationFilter {
  apply(recommendations: Recommendation[]): Recommendation[];
}

/**
 * Фильтр по минимальному score
 */
export class MinScoreFilter implements RecommendationFilter {
  constructor(private minScore: number = 0.5) {}

  apply(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.filter((rec) => rec.matchScore >= this.minScore);
  }
}

/**
 * Фильтр по жанру
 */
export class GenreFilter implements RecommendationFilter {
  constructor(private genre: string) {}

  apply(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.filter((rec) => rec.genre === this.genre);
  }
}

/**
 * Сортировщик рекомендаций
 */
export interface RecommendationSorter {
  sort(recommendations: Recommendation[]): Recommendation[];
}

/**
 * Сортировка по score в убывающем порядке
 */
export class ScoreSorter implements RecommendationSorter {
  sort(recommendations: Recommendation[]): Recommendation[] {
    return [...recommendations].sort(
      (a, b) => b.matchScore - a.matchScore
    );
  }
}

/**
 * Конвейер обработки рекомендаций
 * Применяет трансформацию, фильтрацию и сортировку
 */
export class RecommendationPipeline {
  constructor(
    private transformer: RecommendationTransformer,
    private filters: RecommendationFilter[] = [],
    private sorter?: RecommendationSorter
  ) {}

  process(items: BookRecommendation[]): Recommendation[] {
    // 1. Трансформируем данные
    let results = this.transformer.transform(items);

    // 2. Применяем фильтры
    for (const filter of this.filters) {
      results = filter.apply(results);
    }

    // 3. Сортируем
    if (this.sorter) {
      results = this.sorter.sort(results);
    }

    return results;
  }
}
