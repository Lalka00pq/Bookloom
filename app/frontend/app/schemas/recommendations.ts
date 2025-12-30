
export interface RecommendationMetadata {
  genre?: string;
  tags?: string[];
  [key: string]: any;
}


export interface BookRecommendation {
  book_id: string | null;
  title: string;
  author: string | null;
  reason: string;
  score: number; // 0.0-1.0
  metadata?: RecommendationMetadata;
}


export interface RecommendationsResponse {
  user_id: string;
  recommendations: BookRecommendation[];
}


export interface UserRecommendationsRequest {
  user_id: string;
  limit?: number;
}
