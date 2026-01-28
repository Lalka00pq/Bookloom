import { useState, useEffect, useCallback, useRef } from "react";
import type { GraphData } from "../types";
import type { Graph, Node } from "../schemas/graph";
import { graphApi } from "../utils/api";

export function useGraph() {
  const hasLoadedRef = useRef(false);

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading graph");
      setGraphData({ nodes: [], links: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadGraph();
    }
  }, [loadGraph]);

  return {
    graphData,
    isLoading,
    error,
    refreshGraph: loadGraph,
  };
}

