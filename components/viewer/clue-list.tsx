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
    <section className="glass-panel rounded-[28px] p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            {t.viewer.questions}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {rows.length} {t.viewer.questions.toLowerCase()}
          </h3>
        </div>
        <div className="glass-pill rounded-full px-3 py-1.5 text-xs text-white/65">
          #{activeRowIndex !== null && activeRowIndex >= 0 ? activeRowIndex + 1 : 1}
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, i) => {
          const isActive = i === activeRowIndex;
          const isRevealed = row.rowStatus === ROW_STATUS.ANSWER_REVEALED;
          const isClueVisible = row.rowStatus === ROW_STATUS.CLUE_VISIBLE;
          const showClue = isClueVisible || isRevealed;

          return (
            <div
              key={row.id}
              className={cn(
                "glass-panel-soft rounded-3xl p-4 transition-all duration-300",
                isActive && "border-white/20 bg-white/10 shadow-[0_0_0_1px_rgba(94,234,212,0.16),0_24px_40px_rgba(8,15,29,0.35)]",
                isRevealed && "opacity-85"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                    isActive
                      ? "bg-[var(--primary)] text-slate-950 shadow-[0_0_24px_rgba(94,234,212,0.34)]"
                      : isRevealed
                        ? "bg-emerald-400/18 text-emerald-300"
                        : "bg-white/6 text-white/70"
                  )}
                >
                  {i + 1}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                      {t.viewer.activeQuestion} #{i + 1}
                    </p>
                    <span className="text-xs text-white/48">
                      {row.answerLength} {t.viewer.chars}
                    </span>
                  </div>

                  {showClue ? (
                    <p className="text-sm leading-6 text-white/88">{row.clueText}</p>
                  ) : (
                    <p className="text-sm leading-6 text-white/38">•••</p>
                  )}

                  {isRevealed && (
                    <p className="font-mono text-sm font-semibold tracking-[0.28em] text-[var(--primary)]">
                      {row.answerText ?? ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
