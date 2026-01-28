"use client";

import { Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import type { GraphData, Book } from "../types";
import { EditBookModal } from "./EditBookModal";
import type { Node } from "../schemas/graph";
import { graphApi } from "../utils/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphFieldProps {
  graphData: GraphData;
  activeBook: Book | null;
  onNodeClick: (nodeId: string) => void;
  onNodeEdit?: (nodeId: string, newDescription: string) => Promise<void>;
}

export function GraphField({
  graphData,
  activeBook,
  onNodeClick,
  onNodeEdit,
}: GraphFieldProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };

    // Use ResizeObserver for more reliable size tracking
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial measurement
    updateDimensions();

    const timeoutId = setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.zoom(0.7);
      }
    }, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="panel-cyber rounded-lg p-3 sm:p-4 flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-black/80">
      <header className="mb-3 sm:mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#00fff7]" />
          <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
            Books Graph
          </h2>
        </div>
        {onNodeEdit && (
          <p className="text-[10px] text-gray-500 font-mono hidden sm:block">
            Right-click a book node to edit its description
          </p>
        )}
      </header>

      {/* Graph Container */}
      <div
        ref={containerRef}
        className="relative flex-1 rounded bg-black overflow-hidden min-h-[400px]"
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(5, 5, 5, 1)"
          linkColor={(link: any) => {
            if (link.kind === "similar-theme") return "#ff00ff";
            if (link.kind === "similar-mood") return "#00fff7";
            return "#00fff7";
          }}
          linkWidth={1.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.008}
          linkDirectionalParticleWidth={2}
          nodeRelSize={5}
          cooldownTicks={50}
          minZoom={0.2}
          maxZoom={2.5}
          onNodeClick={(node: any) => {
            if (node.kind === "book") {
              onNodeClick(node.id as string);
            }
          }}
          onNodeRightClick={(node: any) => {
            if (node.kind === "book" && onNodeEdit) {
              const graphNode = graphData.nodes.find((n) => n.id === node.id);
              if (graphNode) {
                const nodeForEdit: Node = {
                  id: graphNode.id,
                  label: graphNode.label,
                  properties: graphNode.properties || {},
                };
                setSelectedNode(nodeForEdit);
                setSelectedNodeId(node.id as string);
              }
            }
          }}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            if (
              typeof node.x !== "number" ||
              typeof node.y !== "number" ||
              !Number.isFinite(node.x) ||
              !Number.isFinite(node.y)
            ) {
              return;
            }

            const isBook = node.kind === "book";
            const isActive = node.id === activeBook?.id;
            const label = node.label as string;
            const fontSize = isBook ? 10 / globalScale : 8 / globalScale;

            const radius = isBook ? 7 : 4;
            const mainColor = isBook ? "#00fff7" : "#ff00ff";

            const gradientRadius = Math.max(
              isActive ? radius * 5 : radius * 3.5,
              radius + 2,
            );
            const grd = ctx.createRadialGradient(
              node.x,
              node.y,
              0,
              node.x,
              node.y,
              gradientRadius,
            );
            grd.addColorStop(
              0,
              isBook ? "rgba(0,255,247,0.9)" : "rgba(255,0,255,0.9)",
            );
            grd.addColorStop(
              1,
              isBook ? "rgba(0,255,247,0.0)" : "rgba(255,0,255,0.0)",
            );
            ctx.beginPath();
            ctx.fillStyle = grd;
            ctx.arc(node.x, node.y, gradientRadius, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = mainColor;
            ctx.strokeStyle = isActive ? "#ffffff" : "#000000";
            ctx.lineWidth = isActive ? 2 : 1.5;
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();

            ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#ffffff";
            const textY = node.y + radius + 4;
            const maxWidth = 90 / globalScale;
            const text = label.length > 22 ? `${label.slice(0, 20)}…` : label;
            ctx.fillText(text, node.x, textY, maxWidth);
          }}
        />
      </div>

      {selectedNode && onNodeEdit && (
        <EditBookModal
          isOpen={selectedNodeId !== null}
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedNode(null);
          }}
          node={selectedNode}
          onSave={async (nodeId, description) => {
            await onNodeEdit(nodeId, description);
            setSelectedNodeId(null);
            setSelectedNode(null);
          }}
        />
      )}
    </section>
  );
}