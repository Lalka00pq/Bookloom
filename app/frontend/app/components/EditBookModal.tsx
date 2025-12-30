"use client";

import { X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import type { Node } from "../schemas/graph";

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node | null;
  onSave: (nodeId: string, description: string) => Promise<void>;
}

export function EditBookModal({
  isOpen,
  onClose,
  node,
  onSave,
}: EditBookModalProps) {
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (node) {
      setDescription(node.properties?.description || "");
    }
  }, [node]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!node) return;

    setIsSaving(true);
    try {
      await onSave(node.id, description);
      onClose();
    } catch (error) {
      console.error("Error saving description:", error);
      alert("Error saving description. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !node) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="panel-cyber w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-lg p-3 sm:p-4 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Edit Book Description
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-neon p-2 rounded hover:bg-cyan-500/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Book Info */}
        <div className="mb-4 p-4 bg-black/40 border border-[#00fff7]/30 rounded">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
            {node.label}
          </h3>
          <p className="text-xs text-gray-400 font-mono">
            {node.properties?.author || "Unknown Author"}
          </p>
        </div>

        {/* Description Editor */}
        <div className="flex-1 flex flex-col mb-4">
          <label className="text-xs text-gray-400 font-mono mb-2">
            Description:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 terminal-input rounded p-3 text-sm text-white placeholder:text-gray-500 font-mono focus:outline-none focus:border-[#00fff7] resize-none"
            placeholder="Enter description..."
            rows={10}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#00fff7]/20">
          <button
            onClick={onClose}
            className="btn-neon px-4 py-2 rounded font-mono text-xs"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-neon px-4 py-2 rounded flex items-center gap-2 font-mono text-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

