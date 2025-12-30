import { useState, useEffect, useCallback } from "react";
import type { GraphData } from "../types";
import type { Graph, Node } from "../schemas/graph";
import { graphApi } from "../utils/api";

export function useGraph() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [isLoading, setIsLoading] = useState(true);
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

      setGraphData({ nodes, links });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading graph");
      setGraphData({ nodes: [], links: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
    
    const interval = setInterval(loadGraph, 5000);
    return () => clearInterval(interval);
  }, [loadGraph]);

  return {
    graphData,
    isLoading,
    error,
    refreshGraph: loadGraph,
  };
}

