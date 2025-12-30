
import type { Recommendation } from "../types";

export interface CacheEntry {
  recommendations: Recommendation[];
  timestamp: number;
  graphHash: string;
}

export interface RecommendationCache {
  get(key: string): CacheEntry | null;
  set(key: string, value: CacheEntry): void;
  clear(): void;
  isExpired(entry: CacheEntry, ttlMs: number): boolean;
}


export class InMemoryRecommendationCache implements RecommendationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;

  constructor(maxSize: number = 20) {
    this.maxSize = maxSize;
  }

  get(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }

  set(key: string, value: CacheEntry): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      )[0]?.[0];

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  isExpired(entry: CacheEntry, ttlMs: number): boolean {
    return Date.now() - entry.timestamp > ttlMs;
  }
}


export function generateGraphHash(nodes: any[]): string {
  const ids = nodes.map((n) => n.id).sort().join(",");
  // Простой хеш на основе длины и первого/последнего элемента
  return `graph_${nodes.length}_${ids.length}`;
}
