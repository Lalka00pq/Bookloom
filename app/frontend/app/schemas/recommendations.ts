/**
 * Схемы для рекомендаций книг
 * Соответствует backend/app/schemas/recommendations.py
 */

/**
 * Метаданные рекомендуемой книги
 */
export interface RecommendationMetadata {
  genre?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * Одна рекомендуемая книга
 */
export interface BookRecommendation {
  book_id: string | null;
  title: string;
  author: string | null;
  reason: string;
  score: number; // 0.0-1.0
  metadata?: RecommendationMetadata;
}

/**
 * Ответ от endpoint рекомендаций
 */
export interface RecommendationsResponse {
  user_id: string;
  recommendations: BookRecommendation[];
}

/**
 * Запрос для получения рекомендаций
 */
export interface UserRecommendationsRequest {
  user_id: string;
  limit?: number;
}
