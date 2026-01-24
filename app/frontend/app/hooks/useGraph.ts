import { useState, useEffect, useCallback, useRef } from "react";
import type { GraphData } from "../types";
import type { Graph, Node } from "../schemas/graph";
import { graphApi } from "../utils/api";

export function useGraph() {
  const STORAGE_KEY = "graph_data";
  const hasLoadedFromStorageRef = useRef(false);

  const getInitialGraph = (): GraphData => {
    try {
      if (typeof window === "undefined") return { nodes: [], links: [] };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { nodes: [], links: [] };
      const parsed = JSON.parse(raw) as GraphData;
      // Улучшенная проверка: граф должен быть не пуст
      if (parsed.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        return parsed;
      }
      return { nodes: [], links: [] };
    } catch {
      return { nodes: [], links: [] };
    }
  };

  const [graphData, setGraphData] = useState<GraphData>(getInitialGraph);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const graph: Graph = await graphApi.showGraph();
      
      const nodes = graph.nodes.map((node: Node) => ({
        id: node.id,
        label: node.label,
        kind: node.properties?.code ? ("book" as const) : ("theme" as const),
        properties: node.properties,
      }));

      const links = graph.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        kind: "similar-theme" as const,
      }));

      const newGraphData = { nodes, links };
      setGraphData(newGraphData);
      // Сохранить граф в localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newGraphData));
        }
      } catch {
        
      }
    } catch (err) {
      
      const fallbackData = getInitialGraph();
      if (fallbackData.nodes.length > 0) {
        setGraphData(fallbackData);
      } else {
        setError(err instanceof Error ? err.message : "Error loading graph");
        setGraphData({ nodes: [], links: [] });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorageRef.current) {
      hasLoadedFromStorageRef.current = true;
      
    }
  }, []);

  return {
    graphData,
    isLoading,
    error,
    refreshGraph: loadGraph,
  };
}

