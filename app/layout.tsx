import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Game Ô Chữ",
  description: "Mini game ô chữ realtime cho livestream",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
