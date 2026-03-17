"use client";

import { useTranslation } from "@/lib/i18n";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold text-red-400">{t.pages.adminError}</h2>
      <p className="max-w-md text-sm text-[var(--muted-foreground)]">
        {error.message || t.pages.adminErrorMessage}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        {t.common.tryAgain}
      </button>
    </div>
  );
}
