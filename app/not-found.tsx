"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold text-[var(--muted-foreground)]">{t.pages.notFoundTitle}</h1>
      <p className="text-lg text-[var(--muted-foreground)]">
        {t.pages.notFoundMessage}
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-[var(--primary)] px-6 py-2.5 font-medium text-white hover:opacity-90"
      >
        {t.pages.backToHome}
      </Link>
    </main>
  );
}
