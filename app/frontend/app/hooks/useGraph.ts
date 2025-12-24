import { useMemo } from "react";
import type { Book, GraphData } from "../types";

const THEME_NODES = [
  { id: "t-dark-atmosphere", label: "Мрачная атмосфера", kind: "theme" as const },
  { id: "t-memory", label: "Память и время", kind: "theme" as const },
  { id: "t-magic-realism", label: "Магический реализм", kind: "theme" as const },
  { id: "t-war-exile", label: "Война и изгнание", kind: "theme" as const },
];

export function useGraph(books: Book[]) {
  const graphData = useMemo<GraphData>(() => {
    const bookNodes = books.map((b) => ({
      id: b.id,
      label: b.title,
      kind: "book" as const,
    }));

    // Генерируем связи на основе тегов книг
    const links: GraphData["links"] = [];
    
    books.forEach((book) => {
      // Связь с темами на основе тегов
      if (book.tags.some((t) => t.includes("готика") || t.includes("мрач"))) {
        links.push({
          source: book.id,
          target: "t-dark-atmosphere",
          kind: "similar-theme",
        });
      }
      if (book.tags.some((t) => t.includes("память") || t.includes("время"))) {
        links.push({
          source: book.id,
          target: "t-memory",
          kind: "shared-motif",
        });
      }
      if (book.tags.some((t) => t.includes("магический") || t.includes("реализм"))) {
        links.push({
          source: book.id,
          target: "t-magic-realism",
          kind: "similar-mood",
        });
      }
      if (book.tags.some((t) => t.includes("война") || t.includes("эмиграция"))) {
        links.push({
          source: book.id,
          target: "t-war-exile",
          kind: "shared-motif",
        });
      }
    });

    return {
      nodes: [...bookNodes, ...THEME_NODES],
      links,
    };
  }, [books]);

  return graphData;
}

