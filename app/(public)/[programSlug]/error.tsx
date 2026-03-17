"use client";

import { useTranslation } from "@/lib/i18n";

export default function ViewerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-red-400">{t.pages.errorOccurred}</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-white"
      >
        {t.common.tryAgain}
      </button>
    </main>
  );
}
