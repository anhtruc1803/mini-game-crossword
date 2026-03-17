"use client";

import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n";

interface FinalKeywordHintProps {
  hints: (string | null)[];
  finalKeyword: string | null;
  gameEnded: boolean;
}

export function FinalKeywordHint({
  hints,
  finalKeyword,
  gameEnded,
}: FinalKeywordHintProps) {
  const { t } = useTranslation();

  if (hints.length === 0 && !finalKeyword) return null;

  const allRevealed = hints.every((hint) => hint !== null);

  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/42">
            {t.viewer.keyword}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{t.viewer.keyword}</h3>
        </div>
        <p className="text-sm text-white/56">
          {gameEnded && allRevealed ? t.viewer.finalKeywordReady : t.viewer.boardSubtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {hints.map((hint, i) => (
          <div
            key={i}
            className={cn(
              "glass-panel-soft flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold uppercase sm:h-14 sm:w-14 sm:text-xl",
              hint !== null
                ? "border-[var(--accent)]/45 bg-[var(--accent)]/18 text-[var(--accent)] shadow-[0_0_24px_rgba(245,158,11,0.18)]"
                : "text-white/36"
            )}
          >
            {hint ?? "?"}
          </div>
        ))}
      </div>

      {gameEnded && allRevealed && finalKeyword && (
        <div className="mt-5 rounded-[24px] border border-[var(--primary)]/22 bg-[var(--primary)]/10 px-5 py-4 text-center shadow-[0_20px_40px_rgba(6,12,24,0.24)]">
          <p className="text-xs uppercase tracking-[0.28em] text-white/54">
            {t.viewer.finalKeywordReady}
          </p>
          <p className="mt-2 text-2xl font-black uppercase tracking-[0.3em] text-[var(--primary)]">
            {finalKeyword}
          </p>
        </div>
      )}
    </section>
  );
}
