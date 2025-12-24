"use client";

import {
  Search,
  Cpu,
  BookOpen,
  Sparkles,
  Library,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";

// react-force-graph-2d отрисовывается только на клиенте
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  tags: string[];
  progress: number; // 0–100
};

type Recommendation = {
  id: string;
  title: string;
  author: string;
  reason: string;
  matchScore: number; // 0–1
};

type GraphNode = {
  id: string;
  label: string;
  kind: "book" | "theme";
};

type GraphLink = {
  source: string;
  target: string;
  kind: "similar-theme" | "similar-mood" | "shared-motif";
};

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Тень ветра",
    author: "Карлос Руис Сафон",
    year: 2001,
    tags: ["готика", "барселона", "тайна"],
    progress: 100,
  },
  {
    id: "2",
    title: "Имя розы",
    author: "Умберто Эко",
    year: 1980,
    tags: ["средневековье", "детектив", "философия"],
    progress: 78,
  },
  {
    id: "3",
    title: "Сто лет одиночества",
    author: "Габриэль Гарсиа Маркес",
    year: 1967,
    tags: ["магический реализм", "семья", "латинская америка"],
    progress: 42,
  },
  {
    id: "4",
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    year: 1967,
    tags: ["мистика", "сатирa", "классика"],
    progress: 100,
  },
  {
    id: "5",
    title: "Ночь в Лиссабоне",
    author: "Эрих Мария Ремарк",
    year: 1962,
    tags: ["военный роман", "эмиграция", "любовь"],
    progress: 15,
  },
];

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    title: "Дом странных детей",
    author: "Рэнсом Риггз",
    reason:
      "Тебя притягивает мрачная атмосфера и истории о памяти. Эта книга развивает мотивы ухода от реальности и семейных тайн.",
    matchScore: 0.86,
  },
  {
    id: "r2",
    title: "Невыносимая лёгкость бытия",
    author: "Милан Кундера",
    reason:
      "Тебе близки философские романы о свободе и выборе. Мотивы сомнения и исторической травмы перекликаются с твоим чтением.",
    matchScore: 0.79,
  },
  {
    id: "r3",
    title: "Океан в конце дороги",
    author: "Нил Гейман",
    reason:
      "Ты любишь магический реализм и мягкую, почти сказочную мрачность. Этот роман превращает детские воспоминания в мифологию.",
    matchScore: 0.74,
  },
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(
    MOCK_BOOKS[0]?.id ?? null,
  );
  const graphRef = useRef<any>(null);

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return MOCK_BOOKS;
    const q = query.toLowerCase();
    return MOCK_BOOKS.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const handleAnalyze = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2200);
  };

  const activeBook = useMemo(
    () => MOCK_BOOKS.find((b) => b.id === activeBookId) ?? MOCK_BOOKS[0],
    [activeBookId],
  );

  // Простая модель графа: книги + обобщённые темы.
  const graphData = useMemo(() => {
    const themeNodes: GraphNode[] = [
      { id: "t-dark-atmosphere", label: "Мрачная атмосфера", kind: "theme" },
      { id: "t-memory", label: "Память и время", kind: "theme" },
      { id: "t-magic-realism", label: "Магический реализм", kind: "theme" },
      { id: "t-war-exile", label: "Война и изгнание", kind: "theme" },
    ];

    const bookNodes: GraphNode[] = MOCK_BOOKS.map((b) => ({
      id: b.id,
      label: b.title,
      kind: "book",
    }));

    const links: GraphLink[] = [
      { source: "1", target: "t-dark-atmosphere", kind: "similar-theme" },
      { source: "2", target: "t-dark-atmosphere", kind: "similar-theme" },
      { source: "4", target: "t-dark-atmosphere", kind: "similar-theme" },
      { source: "1", target: "t-memory", kind: "shared-motif" },
      { source: "3", target: "t-memory", kind: "shared-motif" },
      { source: "3", target: "t-magic-realism", kind: "similar-mood" },
      { source: "4", target: "t-magic-realism", kind: "similar-mood" },
      { source: "5", target: "t-war-exile", kind: "shared-motif" },
      { source: "2", target: "t-war-exile", kind: "shared-motif" },
    ];

    return {
      nodes: [...bookNodes, ...themeNodes],
      links,
    };
  }, []);

  return (
    <main className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1920px]">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <BookOpen className="h-6 w-6 text-[#00fff7] glow-cyan-text" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-mono tracking-wider">
                BookGraph
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Discover hidden connections in your reading
              </p>
            </div>
          </div>

          {/* Search + Analyze */}
          <div className="flex flex-1 items-center gap-3 md:justify-end">
            <div className="flex flex-1 items-center gap-2 terminal-input rounded px-4 py-2 max-w-md">
              <Search className="h-4 w-4 flex-none text-[#00fff7]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Title..."
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 font-mono focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className={classNames(
                "btn-neon inline-flex items-center gap-2 px-4 py-2 rounded",
                isAnalyzing && "opacity-70 cursor-wait",
              )}
              disabled={isAnalyzing}
            >
              <Search className="h-4 w-4" />
              <span className="font-mono text-xs">Search</span>
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              className={classNames(
                "btn-neon inline-flex items-center gap-2 px-4 py-2 rounded",
                isAnalyzing && "opacity-70 cursor-wait",
              )}
              disabled={isAnalyzing}
            >
              <Cpu className="h-4 w-4" />
              <span className="font-mono text-xs">Analies</span>
            </button>
          </div>
        </header>

        {/* Main layout - 3 columns */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px]">
          {/* Left Column - My Library */}
          <aside className="panel-cyber rounded-lg p-4 flex flex-col min-h-[600px]">
            <header className="mb-4 flex items-center gap-2">
              <Library className="h-5 w-5 text-[#00fff7]" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                My Library
              </h2>
            </header>
            <div className="panel-scroll flex-1 space-y-2 overflow-y-auto pr-2">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setActiveBookId(book.id)}
                  className={classNames(
                    "data-block scanline w-full text-left rounded",
                    activeBookId === book.id &&
                      "border-l-cyan-500 bg-black/80 pulse-neon",
                  )}
                >
                  <div className="mb-1">
                    <p className="text-sm font-semibold text-white line-clamp-1">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {book.author} · {book.year}
                    </p>
                  </div>
                  <div className="mt-2 h-1 bg-black/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00fff7]"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </button>
              ))}
              {filteredBooks.length === 0 && (
                <p className="mt-6 text-center text-xs text-gray-500 font-mono">
                  No results found
                </p>
              )}
            </div>
          </aside>

          {/* Center Column - Graph Field */}
          <section className="panel-cyber rounded-lg p-4 flex flex-col min-h-[600px] bg-black/80">
            <header className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#00fff7]" />
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Graph Field
                </h2>
              </div>
            </header>

            {/* Graph Container */}
            <div className="relative flex-1 rounded bg-black overflow-hidden">
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                width={undefined}
                height={undefined}
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
                nodeRelSize={8}
                cooldownTicks={50}
                onNodeClick={(node: any) => {
                  if (node.kind === "book") {
                    setActiveBookId(node.id as string);
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
                  const fontSize = isBook ? 11 / globalScale : 9 / globalScale;

                  const radius = isBook ? 8 : 5;
                  const mainColor = isBook ? "#00fff7" : "#ff00ff";

                  // Glow effect
                  const gradientRadius = Math.max(
                    isActive ? radius * 6 : radius * 4,
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
                  grd.addColorStop(0, isBook ? "rgba(0,255,247,0.9)" : "rgba(255,0,255,0.9)");
                  grd.addColorStop(1, isBook ? "rgba(0,255,247,0.0)" : "rgba(255,0,255,0.0)");
                  ctx.beginPath();
                  ctx.fillStyle = grd;
                  ctx.arc(node.x, node.y, gradientRadius, 0, 2 * Math.PI, false);
                  ctx.fill();

                  // Node core
                  ctx.beginPath();
                  ctx.fillStyle = mainColor;
                  ctx.strokeStyle = isActive ? "#ffffff" : "#000000";
                  ctx.lineWidth = isActive ? 2 : 1.5;
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  ctx.fill();
                  ctx.stroke();

                  // Label
                  ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";
                  ctx.fillStyle = "#ffffff";
                  const textY = node.y + radius + 4;
                  const maxWidth = 100 / globalScale;
                  const text = label.length > 25 ? `${label.slice(0, 23)}…` : label;
                  ctx.fillText(text, node.x, textY, maxWidth);
                }}
              />
            </div>
          </section>

          {/* Right Column - Recommendations */}
          <aside className="panel-cyber-magenta rounded-lg p-4 flex flex-col min-h-[600px]">
            <header className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#ff00ff]" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Recommendations field
              </h2>
            </header>
            <div className="panel-scroll flex-1 space-y-3 overflow-y-auto pr-2">
              {MOCK_RECOMMENDATIONS.map((rec) => (
                <article
                  key={rec.id}
                  className="bg-black/40 border-l-2 border-[#ff00ff]/50 p-3 rounded hover:bg-black/60 hover:border-[#ff00ff] hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-200 scanline"
                >
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-white line-clamp-1">
                      {rec.title}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {rec.author}
                    </p>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-2">
                    {rec.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#ff00ff] font-mono">
                      Match: {Math.round(rec.matchScore * 100)}%
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </div>

      {/* Loading overlay for analysis */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="panel-cyber p-6 rounded-lg max-w-sm text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Cpu className="h-6 w-6 text-[#00fff7] animate-pulse" />
              <span className="text-sm font-mono text-white uppercase tracking-wider">
                Analyzing...
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Processing connections and generating recommendations
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
