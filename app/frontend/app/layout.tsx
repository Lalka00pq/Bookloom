import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookloom – Магическая карта чтения",
  description:
    "Интерактивный сервис рекомендаций книг в стиле dark academia с визуализацией графа знаний.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-page text-foreground antialiased">
        <div className="relative min-h-screen bg-book-texture bg-cover bg-center bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-amber-900/40 mix-blend-multiply pointer-events-none" />
          <div className="relative flex min-h-screen flex-col items-stretch justify-stretch">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}


