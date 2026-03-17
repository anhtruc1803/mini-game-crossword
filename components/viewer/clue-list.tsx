"use client";

import { ROW_STATUS } from "@/features/games/constants";
import type { PublicCrosswordRow } from "@/features/viewer/view-model";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

interface ClueListProps {
  rows: PublicCrosswordRow[];
  activeRowIndex: number | null;
}

export function ClueList({ rows, activeRowIndex }: ClueListProps) {
  const { t } = useTranslation();

  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {t.viewer.questions}
      </h3>
      <div className="space-y-1.5">
        {rows.map((row, i) => {
          const isActive = i === activeRowIndex;
          const isRevealed = row.rowStatus === ROW_STATUS.ANSWER_REVEALED;
          const isClueVisible = row.rowStatus === ROW_STATUS.CLUE_VISIBLE;
          const showClue = isClueVisible || isRevealed;

          return (
            <div
              key={row.id}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30"
                  : "bg-[var(--card)]/50",
                isRevealed && "opacity-70"
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : isRevealed
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  )}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  {showClue ? (
                    <p className="text-[var(--foreground)]">{row.clueText}</p>
                  ) : (
                    <p className="text-[var(--muted-foreground)]">???</p>
                  )}
                  {isRevealed && (
                    <p className="mt-0.5 font-mono text-xs font-bold text-green-400">
                      {row.answerText ?? ""}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                  {row.answerLength} {t.viewer.chars}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
