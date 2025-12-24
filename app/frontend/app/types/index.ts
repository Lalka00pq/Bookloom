export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  tags: string[];
  progress: number; // 0–100
};

export type Recommendation = {
  id: string;
  title: string;
  author: string;
  reason: string;
  matchScore: number; // 0–1
};

export type GraphNode = {
  id: string;
  label: string;
  kind: "book" | "theme";
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

