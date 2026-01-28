"use client";

import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LibraryPanel } from "./components/LibraryPanel";
import { GraphField } from "./components/GraphField";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { SearchModal } from "./components/SearchModal";
import { EditBookModal } from "./components/EditBookModal";
import { RecommendationModal } from "./components/RecommendationModal";
import { useBooks } from "./hooks/useBooks";
import { useGraph } from "./hooks/useGraph";
import { useHealthCheck } from "./hooks/useHealthCheck";
import { useRecommendations } from "./hooks/useRecommendations";
import { booksGraphApi, graphApi, ApiError } from "./utils/api";
import type { Book, Recommendation } from "./types";
import type { BookSearchItem } from "./schemas/books_search";
import type { Node } from "./schemas/graph";


export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  const { isHealthy, isChecking } = useHealthCheck();

  const {
    books,
    activeBook,
    activeBookId,
    setActiveBookId,
    addBook,
    filterBooks,
  } = useBooks([]);

  const { graphData, refreshGraph } = useGraph();
  const { recommendations, isLoading: isLoadingRecs, error: recsError, fetchRecommendations, clearRecommendations } = useRecommendations({
    limit: 10,
  });

  useEffect(() => {
    const booksFromGraph: Book[] = graphData.nodes
      .filter((node) => node.kind === "book" && node.properties?.code)
      .map((node) => ({
        id: (node.properties?.code as string) || "",
        title: node.label,
        author: (node.properties?.author as string) || "Unknown",
        year: node.properties?.published
          ? parseInt(
              (node.properties.published as string).split("-")[0] || "0",
            ) || 0
          : 0,
        tags: (node.properties?.subjects as string[]) || [],
        progress: 0,
        cover: (node.properties?.cover as string) || undefined,
      }));

    const existingBookIds = new Set(books.map((b) => b.id));
    booksFromGraph.forEach((book) => {
      if (!existingBookIds.has(book.id)) {
        addBook(book);
      }
    });
  }, [graphData.nodes.length, graphData.nodes.map((n) => n.id).join(",")]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchModalOpen(true);
    }
  };
  
  const handleRequestEdit = (nodeId: string) => {
    const node = graphData.nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditingNode({
        id: node.id,
        label: node.label,
        properties: node.properties || {},
      });
    }
  };

  const handleAnalyze = async () => {
    if (graphData.nodes.length === 0) return;
    await fetchRecommendations();
  };

  const handleAddBook = async (book: BookSearchItem) => {
    try {
      
      await booksGraphApi.addToGraph(book);
      

      const bookForState: Book = {
        id: book.code,
        title: book.title,
        author: book.author,
        year: book.published ? parseInt(book.published.split("-")[0]) || 0 : 0,
        tags: book.subjects || [],
        progress: 0,
        cover: book.cover,
      };
      addBook(bookForState);
      

      refreshGraph();
      
      setIsSearchModalOpen(false);
      setSearchQuery("");
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Error adding book:", error.message);
        alert(`Error: ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        alert("Error adding book. Please try again.");
      }
    }
  };

  const filteredBooks = filterBooks(searchQuery);

  return (
    <main className="relative z-10 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1920px]">
        {!isChecking && isHealthy === false && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300 font-mono">
              ⚠️ Service is temporarily unavailable. Please try again later.
            </p>
          </div>
        )}

        <Header
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onAnalyze={handleAnalyze}
          isAnalyzing={isLoadingRecs}
          isGraphEmpty={graphData.nodes.length === 0}
        />

        <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] xl:grid-cols-[minmax(250px,320px)_1fr_minmax(250px,320px)]">
          <LibraryPanel
            books={filteredBooks}
            activeBookId={activeBookId}
            onBookSelect={(bookId) => {
              setActiveBookId(bookId);
              const node = graphData.nodes.find(
                (n) => n.properties?.code === bookId,
              );
              if (node) {
                handleRequestEdit(node.id);
              }
            }}
          />

          <GraphField
            graphData={graphData}
            activeBook={activeBook}
            onRequestEdit={handleRequestEdit}
            onNodeClick={(nodeId) => {

              const node = graphData.nodes.find((n) => n.id === nodeId);
              if (node && node.properties?.code) {

                const book = books.find((b) => b.id === node.properties?.code);
                if (book) {
                  setActiveBookId(book.id);
                }
              }
            }}
            onNodeEdit={async (nodeId, newDescription) => {
              try {
                
                const node = graphData.nodes.find((n) => n.id === nodeId);
                if (!node) {
                  throw new Error("Node not found");
                }


                await graphApi.changeNode(nodeId, {
                  label: node.label,
                  properties: {
                    ...node.properties,
                    description: newDescription,
                  },
                });

                
                await refreshGraph();
              } catch (error) {
                if (error instanceof ApiError) {
                  throw new Error(error.message);
                }
                throw error;
              }
            }}
          />

          <RecommendationsPanel
            recommendations={recommendations}
            isLoading={isLoadingRecs}
            error={recsError}
            isEmpty={graphData.nodes.length === 0}
            onRecommendationClick={(rec) => setSelectedRecommendation(rec)}
          />
        </section>
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        existingBookCodes={new Set(books.map((b) => b.id))}
        onAddBook={handleAddBook}
      />

      {editingNode && (
        <EditBookModal
          isOpen={editingNode !== null}
          onClose={() => setEditingNode(null)}
          node={editingNode}
          onSave={async (nodeId, newDescription) => {
            try {
              const node = graphData.nodes.find((n) => n.id === nodeId);
              if (!node) throw new Error("Node not found");

              await graphApi.changeNode(nodeId, {
                label: node.label,
                properties: {
                  ...node.properties,
                  description: newDescription,
                },
              });

              await refreshGraph();
              setEditingNode(null);
            } catch (error) {
              if (error instanceof ApiError) {
                throw new Error(error.message);
              }
              throw error;
            }
          }}
        />
      )}

      {selectedRecommendation && (
        <RecommendationModal
          isOpen={selectedRecommendation !== null}
          onClose={() => setSelectedRecommendation(null)}
          recommendation={selectedRecommendation}
        />
      )}
    </main>
  );
}
