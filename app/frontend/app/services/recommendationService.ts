

import type { Recommendation } from "../types";
import type { BookRecommendation } from "../schemas/recommendations";

export interface RecommendationTransformer {
  transform(items: BookRecommendation[]): Recommendation[];
}

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
      cover: rec.metadata?.cover,
    }));
  }
}

export interface RecommendationFilter {
  apply(recommendations: Recommendation[]): Recommendation[];
}

export class MinScoreFilter implements RecommendationFilter {
  constructor(private minScore: number = 0.5) {}

  apply(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.filter((rec) => rec.matchScore >= this.minScore);
  }
}

export class GenreFilter implements RecommendationFilter {
  constructor(private genre: string) {}

  apply(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.filter((rec) => rec.genre === this.genre);
  }
}

export interface RecommendationSorter {
  sort(recommendations: Recommendation[]): Recommendation[];
}

export class ScoreSorter implements RecommendationSorter {
  sort(recommendations: Recommendation[]): Recommendation[] {
    return [...recommendations].sort(
      (a, b) => b.matchScore - a.matchScore
    );
  }
}

export class RecommendationPipeline {
  constructor(
    private transformer: RecommendationTransformer,
    private filters: RecommendationFilter[] = [],
    private sorter?: RecommendationSorter
  ) {}

  process(items: BookRecommendation[]): Recommendation[] {
    
    let results = this.transformer.transform(items);

    
    for (const filter of this.filters) {
      results = filter.apply(results);
    }

    
    if (this.sorter) {
      results = this.sorter.sort(results);
    }

    return results;
  }
}
