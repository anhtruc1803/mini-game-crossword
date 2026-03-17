"use client";

import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n";

interface FinalKeywordHintProps {
  hints: (string | null)[];
  finalKeyword: string | null;
  gameEnded: boolean;
}

/**
 * Displays the final keyword built from highlighted characters of revealed rows.
 * Each position shows a character if the corresponding row is revealed, or a blank cell.
 */
export function FinalKeywordHint({
  hints,
  finalKeyword,
  gameEnded,
}: FinalKeywordHintProps) {
  const { t } = useTranslation();

  if (hints.length === 0 && !finalKeyword) return null;

  const allRevealed = hints.every((h) => h !== null);

  return (
    <div className="space-y-3">
      <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {t.viewer.keyword}
      </h3>

      <div className="flex items-center justify-center gap-1 md:gap-1.5">
        {hints.map((hint, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center rounded-lg border text-sm font-bold transition-all md:text-lg",
              "h-9 w-9 md:h-12 md:w-12",
              hint !== null
                ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--muted)]/30 text-[var(--muted-foreground)]"
            )}
          >
            {hint ?? "?"}
          </div>
        ))}
      </div>

      {gameEnded && allRevealed && finalKeyword && (
        <p className="text-center text-lg font-bold text-[var(--accent)]">
          {finalKeyword}
        </p>
      )}
    </div>
  );
}
