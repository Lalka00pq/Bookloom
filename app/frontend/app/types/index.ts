export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  tags: string[];
  progress: number; // 0–100
  cover?: string;
};

export type Recommendation = {
  id: string;
  title: string;
  author: string | null;
  reason: string;
  matchScore: number; // 0–1
  genre?: string;
  tags?: string[];
  cover?: string;
};

export type GraphNode = {
  id: string;
  label: string;
  kind: "book" | "theme";
  properties?: Record<string, any>;
};

export type GraphLink = {
  source: string;
  target: string;
  kind: "similar-theme" | "similar-mood" | "shared-motif";
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

