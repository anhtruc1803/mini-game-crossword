"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteRowAction } from "@/features/admin/actions";
import { ROW_STATUS } from "@/features/games/constants";
import type { CrosswordRow } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";

export function RowsTable({ rows }: { rows: CrosswordRow[] }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    [ROW_STATUS.HIDDEN]: t.status.hidden,
    [ROW_STATUS.CLUE_VISIBLE]: t.status.clueVisible,
    [ROW_STATUS.ANSWER_REVEALED]: t.status.answerRevealed,
  };

  async function handleDelete(id: string) {
    if (!confirm(t.rows.deleteQuestion)) return;
    setDeletingId(id);
    setError(null);

    const result = await deleteRowAction(id);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setDeletingId(null);
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs font-mono">
                  #{row.rowOrder + 1}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {statusLabels[row.rowStatus]}
                </span>
              </div>
              <p className="text-sm font-medium">{row.clueText}</p>
            </div>
            <button
              onClick={() => handleDelete(row.id)}
              disabled={deletingId === row.id}
              className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              {t.common.delete}
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {row.answerText.split("").map((char, i) => {
              const isHighlighted = row.highlightedIndexes.includes(i);
              return (
                <span
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-bold ${
                    isHighlighted
                      ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--foreground)]"
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {row.noteText && (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {t.rows.note} {row.noteText}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
