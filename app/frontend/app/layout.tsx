import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookLoom – Your reading journey, visualized",
  description:
    "Minimalistic cyberpunk interface for visualizing book connections and recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}


