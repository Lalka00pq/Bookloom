// Схемы для работы с графом (аналогично backend/app/schemas/graph.py)

export interface Node {
  id: string;
  label: string;
  properties: Record<string, any>;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface AddNodeRequest {
  label: string;
  properties: Record<string, any>;
}

export interface ChangeNodeRequest {
  label: string;
  properties: Record<string, any>;
}

export interface AddEdgeRequest {
  source: string;
  target: string;
  weight?: number;
}

