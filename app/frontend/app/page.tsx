/* eslint-disable react/no-unescaped-entities */
"use client";

import {
  BookOpen,
  Library,
  Sparkles,
  Search,
  Wand2,
  BookOpenCheck,
  ArrowRight,
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
  mood: "cozy" | "dark" | "adventurous" | "scholarly";
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
      "Тебя притягивает мрачная атмосфера и истории о памяти. Эта книга развивает мотивы ухода от реальности и семейных тайн, заметные в твоём чтении.",
    matchScore: 0.86,
    mood: "dark",
  },
  {
    id: "r2",
    title: "Невыносимая лёгкость бытия",
    author: "Милан Кундера",
    reason:
      "Тебе близки философские романы о свободе и выборе. Мотивы сомнения и исторической травмы перекликаются с «Имени розы» и «Сто лет одиночества».",
    matchScore: 0.79,
    mood: "scholarly",
  },
  {
    id: "r3",
    title: "Океан в конце дороги",
    author: "Нил Гейман",
    reason:
      "Ты любишь магический реализм и мягкую, почти сказочную мрачность. Этот роман превращает детские воспоминания в мифологию — как и любимые тобой истории.",
    matchScore: 0.74,
    mood: "cozy",
  },
];

const MOOD_BADGES: Record<
  Recommendation["mood"],
  { label: string; color: string }
> = {
  cozy: { label: "Уютное чтение", color: "bg-amber-100/80 text-amber-900" },
  dark: { label: "Мрачная сказка", color: "bg-stone-900/70 text-amber-100" },
  adventurous: {
    label: "Приключение",
    color: "bg-emerald-900/70 text-emerald-100",
  },
  scholarly: {
    label: "Интеллектуальное",
    color: "bg-amber-900/80 text-amber-50",
  },
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(MOCK_BOOKS[0]?.id ?? null);
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
    // Имитация вызова OpenRouter / бэкенда
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
    <main className="flex flex-1 items-stretch justify-center px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 rounded-[32px] border border-amber-200/40 bg-amber-100/15 bg-clip-padding p-4 shadow-[0_40px_90px_rgba(10,6,2,0.85)] backdrop-blur-xl sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-2 flex flex-col gap-4 md:mb-4 md:flex-row md:items-center md:justify-between">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/70 bg-amber-50/40 shadow-[0_8px_20px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <BookOpen className="h-6 w-6 text-amber-800" strokeWidth={1.6} />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-300/90">
                Bookloom
              </p>
              <h1 className="heading-serif text-lg sm:text-xl md:text-2xl text-amber-50 drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]">
                Личный атлас прочитанных миров
              </h1>
            </div>
          </div>

          {/* Search + Analyse */}
          <div className="flex flex-col gap-3 md:flex-1 md:flex-row md:items-center md:justify-end">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-amber-50/15 px-3 py-1.5 shadow-[0_12px_26px_rgba(0,0,0,0.55)] backdrop-blur-lg border border-amber-200/40">
              <Search className="h-4 w-4 flex-none text-amber-300/90" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ищем по авторам, названиям, настроению..."
                className="h-9 w-full bg-transparent text-sm text-amber-50 placeholder:text-amber-200/60 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className={classNames(
                "group inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium tracking-[0.16em] uppercase",
                "bg-amber-500/90 text-amber-950 border-amber-200/80 shadow-[0_14px_30px_rgba(0,0,0,0.75)]",
                "hover:bg-amber-400 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]",
                "transition-all duration-200",
                isAnalyzing && "cursor-wait opacity-80",
              )}
              disabled={isAnalyzing}
            >
              <span className="flex items-center gap-2">
                <Sparkles
                  className={classNames(
                    "h-4 w-4",
                    isAnalyzing && "animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]",
                  )}
                />
                <span>{isAnalyzing ? "Анализ..." : "Анализ"}</span>
              </span>
            </button>
          </div>
        </header>

        {/* Main layout */}
        <section className="grid flex-1 gap-4 md:gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)_minmax(0,0.95fr)]">
          {/* My Library */}
          <aside className="card-glass flex min-h-[220px] flex-col p-4 sm:p-5">
            <header className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/70 text-amber-900 shadow-sm">
                  <Library className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="heading-serif text-sm tracking-[0.18em] uppercase text-amber-900">
                    Моя библиотека
                  </h2>
                  <p className="text-[11px] text-amber-700/80">
                    {MOCK_BOOKS.length} книг · тёплые, мрачные и вечные истории
                  </p>
                </div>
              </div>
            </header>
            <div className="panel-scroll -mr-2 flex-1 space-y-2 overflow-y-auto pr-1 pt-1">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setActiveBookId(book.id)}
                  className={classNames(
                    "tactile group flex w-full flex-col items-stretch rounded-2xl border px-3.5 py-2.5 text-left text-xs",
                    "bg-amber-50/60 border-amber-200/80 shadow-[0_8px_20px_rgba(0,0,0,0.45)]",
                    activeBookId === book.id &&
                      "border-amber-500 shadow-[0_16px_36px_rgba(245,158,11,0.55)] bg-amber-100/80",
                  )}
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-amber-900 line-clamp-2">
                        {book.title}
                      </p>
                      <p className="text-[11px] text-amber-700/90">
                        {book.author} · {book.year}
                      </p>
                    </div>
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                      <BookOpenCheck className="mr-1 h-3 w-3" />
                      {book.progress}%
                    </span>
                  </div>
                  <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-amber-100/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {book.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-amber-100/90 px-2 py-[2px] text-[10px] text-amber-800 group-hover:bg-amber-200/90"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
              {filteredBooks.length === 0 && (
                <p className="mt-6 text-center text-xs text-amber-800/80">
                  Ничего не найдено. Попробуй другой запрос или убери фильтр.
                </p>
              )}
            </div>
          </aside>

          {/* Graph Field */}
          <section className="relative min-h-[260px] overflow-hidden rounded-[28px] border border-amber-200/40 bg-gradient-to-b from-stone-900/95 via-stone-950/95 to-stone-950/98 shadow-[0_26px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl px-4 py-4 sm:px-6 sm:py-5">
            <header className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-900/90 text-amber-50 shadow-[0_12px_26px_rgba(0,0,0,0.7)]">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="heading-serif text-base tracking-[0.2em] uppercase text-amber-900">
                    Граф чтения
                  </h2>
                  <p className="text-xs text-amber-800/85">
                    Связи между мотивами, эпохами и голосами авторов
                  </p>
                </div>
              </div>
              <span className="hidden items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50/90 px-3 py-1 text-[11px] font-medium text-amber-900/90 shadow-sm sm:inline-flex">
                <span className="relative mr-1 flex h-2 w-6 items-center justify-between">
                  <span className="h-[2px] w-[6px] rounded-full bg-amber-700/90" />
                  <span className="h-[2px] w-[6px] rounded-full bg-amber-500/80" />
                  <span className="h-[2px] w-[6px] rounded-full bg-amber-300/80" />
                </span>
                <span className="uppercase tracking-[0.16em]">AI graph</span>
              </span>
            </header>

            {/* Интерактивный react-force-graph-2d с кастомной отрисовкой в стиле BookGraph */}
            <div className="relative h-[260px] rounded-3xl bg-gradient-to-br from-stone-900/80 via-slate-950/95 to-stone-900/90 p-[1px] sm:h-[320px]">
              <div className="relative flex h-full items-stretch justify-stretch overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-950 to-stone-950">
                <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light">
                  <div className="absolute -left-10 top-6 h-[260%] w-[260%] rotate-6 bg-[radial-gradient(circle_at_10%_0%,rgba(129,140,248,0.28),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(251,191,36,0.18),transparent_55%)]" />
                </div>

                <div className="relative z-10 flex w-full flex-col justify-between p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">
                        КАРТА МОТИВОВ
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-amber-50">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                        Активная книга:{" "}
                        <span className="font-semibold">
                          {activeBook?.title}
                        </span>
                      </p>
                      <p className="mt-1 max-w-md text-xs text-amber-200/85">
                        Потяни, приближай и крути граф — узлы книг и тем
                        подсвечиваются в зависимости от связей.
                      </p>
                    </div>
                    <div className="hidden items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] text-amber-100 ring-1 ring-indigo-400/70 shadow-sm sm:flex">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]" />
                      Живой граф
                    </div>
                  </div>

                  <div className="mt-3 flex-1 rounded-2xl bg-slate-950/70">
                    <ForceGraph2D
                      ref={graphRef}
                      graphData={graphData}
                      width={undefined}
                      height={undefined}
                      backgroundColor="rgba(15,23,42,1)"
                      linkColor={() => "rgba(129,140,248,0.65)"}
                      linkWidth={(link: any) =>
                        link.kind === "similar-theme" ? 2.1 : 1.4
                      }
                      linkDirectionalParticles={1.8}
                      linkDirectionalParticleSpeed={0.007}
                      linkDirectionalParticleWidth={2}
                      nodeRelSize={6}
                      cooldownTicks={50}
                      onNodeClick={(node: any) => {
                        if (node.kind === "book") {
                          setActiveBookId(node.id as string);
                        }
                      }}
                      nodeCanvasObject={(node: any, ctx, globalScale) => {
                        // В начальной фазе раскладки координаты могут быть неопределены
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
                        const fontSize = isBook ? 12 / globalScale : 10 / globalScale;

                        const radius = isBook ? 6 : 4;
                        const mainColor = isBook
                          ? "rgba(196,181,253,1)"
                          : "rgba(251,191,36,1)";

                        // свечение
                        const gradientRadius = Math.max(
                          isActive ? radius * 5 : radius * 3.5,
                          radius + 1,
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
                          isBook
                            ? "rgba(196,181,253,0.9)"
                            : "rgba(251,191,36,0.9)",
                        );
                        grd.addColorStop(
                          1,
                          isBook
                            ? "rgba(129,140,248,0.0)"
                            : "rgba(245,158,11,0.0)",
                        );
                        ctx.beginPath();
                        ctx.fillStyle = grd;
                        ctx.arc(node.x, node.y, gradientRadius, 0, 2 * Math.PI, false);
                        ctx.fill();

                        // ядро узла
                        ctx.beginPath();
                        ctx.fillStyle = mainColor;
                        ctx.strokeStyle = isActive
                          ? "rgba(248,250,252,1)"
                          : "rgba(15,23,42,1)";
                        ctx.lineWidth = isActive ? 1.8 : 1.1;
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                        ctx.fill();
                        ctx.stroke();

                        // подпись
                        ctx.font = `${fontSize}px system-ui`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "top";
                        ctx.fillStyle = "rgba(226,232,240,0.96)";
                        const textY = node.y + radius + 3;
                        const maxWidth = 90 / globalScale;
                        const text = label.length > 24 ? `${label.slice(0, 22)}…` : label;
                        ctx.fillText(text, node.x, textY, maxWidth);
                      }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-200/90">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2 py-1">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        Книги
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Темы
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 opacity-85">
                      <ArrowRight className="h-3 w-3" />
                      Клик по узлу книги меняет фокус анализа
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading state overlay for analysis */}
            {isAnalyzing && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="ink-fade-in inline-flex max-w-xs flex-col items-center gap-2 rounded-2xl bg-amber-50/95 px-4 py-3 text-center shadow-[0_18px_42px_rgba(0,0,0,0.85)] border border-amber-200/90">
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span className="heading-serif text-xs tracking-[0.18em] uppercase text-amber-900">
                      Идёт переплетение сюжетов
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    OpenRouter перебирает твои прочитанные книги, чтобы собрать
                    карту тем, персонажей и настроений. Чернила ещё сохнут...
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Recommendations */}
          <aside className="card-soft flex min-h-[220px] flex-col p-4 sm:p-5">
            <header className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-900/90 text-amber-50 shadow-sm">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="heading-serif text-sm tracking-[0.18em] uppercase text-amber-900">
                    Рекомендации
                  </h2>
                  <p className="text-[11px] text-amber-800/85">
                    Истории, которые продолжают твой маршрут
                  </p>
                </div>
              </div>
              <span className="hidden items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-900 shadow-sm sm:inline-flex">
                <Sparkles className="h-3 w-3" />
                AI curator
              </span>
            </header>

            <div className="panel-scroll -mr-2 flex-1 space-y-3 overflow-y-auto pr-1 pt-1">
              {MOCK_RECOMMENDATIONS.map((rec) => {
                const mood = MOOD_BADGES[rec.mood];
                return (
                  <article
                    key={rec.id}
                    className="tactile relative overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/80 p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.16),transparent_55%),radial-gradient(circle_at_120%_120%,rgba(88,28,135,0.24),transparent_55%)] opacity-80" />
                    <div className="relative space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-semibold text-amber-900">
                            {rec.title}
                          </p>
                          <p className="text-[11px] text-amber-800/85">
                            {rec.author}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={classNames(
                              "rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.14em]",
                              mood.color,
                            )}
                          >
                            {mood.label}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/90 px-2 py-[3px] text-[10px] text-amber-100">
                            <Sparkles className="h-3 w-3" />
                            {Math.round(rec.matchScore * 100)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900/85">
                        {rec.reason}
                      </p>
                    </div>
                  </article>
                );
              })}
              <div className="mt-2 rounded-2xl border border-dashed border-amber-300/80 bg-amber-50/40 px-3 py-2 text-[11px] text-amber-800/80">
                <p className="mb-1 flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-3 w-3" />
                  <span className="uppercase tracking-[0.14em]">
                    Подсказка
                  </span>
                </p>
                <p>
                  Нажми «Анализ», чтобы обновить рекомендации с учётом последних
                  прочитанных книг и их связей в графе.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}


