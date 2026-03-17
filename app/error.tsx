"use client";

import { useTranslation } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-red-400">{t.pages.errorOccurred}</h1>
      <p className="max-w-md text-sm text-[var(--muted-foreground)]">
        {error.message || t.pages.unexpectedError}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 font-medium text-white hover:opacity-90"
      >
        {t.common.tryAgain}
      </button>
    </main>
  );
}
