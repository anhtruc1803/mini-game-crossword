import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Game Ô Chữ",
  description: "Mini game ô chữ realtime cho livestream",
};

const themeInitScript = `
  (function () {
    try {
      var theme = localStorage.getItem("mini-game-theme");
      document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
    } catch (error) {
      document.documentElement.dataset.theme = "dark";
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
