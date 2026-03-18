"use client";

import { useRef } from "react";
import { ROW_STATUS } from "@/features/games/constants";
import type { PublicCrosswordRow } from "@/features/viewer/view-model";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

interface ClueListProps {
  rows: PublicCrosswordRow[];
  activeRowIndex: number | null;
  onSelectRow: (rowIndex: number) => void;
}

export function ClueList({ rows, activeRowIndex, onSelectRow }: ClueListProps) {
  const { t } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);

  if (rows.length === 0) return null;

  function slide(direction: "prev" | "next") {
    const node = sliderRef.current;
    if (!node) return;

    const amount = Math.max(node.clientWidth * 0.78, 240);
    node.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <span className="glass-pill inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/78">
            {t.viewer.questions}
          </span>
          <h3 className="mt-3 text-2xl font-semibold text-white">{t.viewer.questions}</h3>
          <p className="mt-2 text-sm leading-6 text-white/56">{t.viewer.boardSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => slide("prev")}
            className="inet-outline soft-hover rounded-full border px-3 py-2 text-white/80"
            aria-label={t.common.back}
          >
            &#8249;
          </button>
          <button
            type="button"
            onClick={() => slide("next")}
            className="inet-outline soft-hover rounded-full border px-3 py-2 text-white/80"
            aria-label={t.game.nextQuestion}
          >
            &#8250;
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {rows.map((row, i) => {
          const isActive = i === activeRowIndex;
          const isRevealed = row.rowStatus === ROW_STATUS.ANSWER_REVEALED;
          const isVisible = row.rowStatus === ROW_STATUS.CLUE_VISIBLE || isRevealed;

          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelectRow(i)}
              aria-pressed={isActive}
              className={cn(
                "soft-hover snap-start rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-left shadow-[0_10px_24px_rgba(2,6,23,0.12)] transition",
                "min-w-[18rem] flex-1 basis-[18rem] sm:min-w-[20rem] sm:basis-[20rem] xl:min-w-[22rem] xl:basis-[22rem]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40",
                isActive &&
                  "border-[var(--primary)]/30 bg-[var(--primary)]/10 shadow-[0_16px_30px_rgba(45,140,240,0.14)]"
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold",
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-[0_0_22px_rgba(45,140,240,0.3)]"
                      : isRevealed
                        ? "bg-emerald-400/18 text-emerald-300"
                        : "bg-white/7 text-white/72"
                  )}
                >
                  {i + 1}
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                    {t.viewer.activeQuestion} #{i + 1}
                  </p>
                  <p className="mt-1 text-xs text-white/54">
                    {row.answerLength} {t.viewer.chars}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="min-h-[5.4rem] text-base leading-7 text-white/88">
                  {isVisible ? row.clueText : "..."}
                </p>

                <div className="border-t border-white/8 pt-3">
                  <p
                    className={cn(
                      "font-mono text-sm font-semibold uppercase tracking-[0.28em]",
                      isRevealed ? "text-[var(--mint)]" : "text-white/34"
                    )}
                  >
                    {isRevealed ? row.answerText ?? "" : "..."}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
