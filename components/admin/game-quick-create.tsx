"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createGameAction } from "@/features/admin/actions";
import { useTranslation } from "@/lib/i18n";

export function GameQuickCreate({ programId }: { programId: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("programId", programId);

    const result = await createGameAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{t.game.noGameYet}</p>
      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
      )}
      <input
        name="title"
        required
        placeholder={t.game.gameNamePlaceholder}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
      <input
        name="finalKeyword"
        placeholder={t.game.finalKeywordOptional}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? t.game.creating : t.game.createGame}
      </button>
    </form>
  );
}
