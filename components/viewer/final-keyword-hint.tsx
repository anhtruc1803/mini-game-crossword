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
    <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <span className="glass-pill pill-keyword inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em]">
        {t.viewer.keyword}
      </span>

      <p className="mt-3 text-sm leading-6 text-white/56">
        {gameEnded && allRevealed ? t.viewer.finalKeywordReady : t.viewer.boardSubtitle}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {hints.map((hint, i) => (
          <div
            key={i}
            className={cn(
              "glass-panel-soft flex h-14 w-14 items-center justify-center rounded-[18px] text-xl font-bold uppercase",
              hint !== null
                ? "border-[var(--accent)]/50 bg-[var(--accent)]/18 text-amber-50 shadow-[0_10px_22px_rgba(245,158,11,0.14)]"
                : "text-white/36"
            )}
          >
            {hint ?? "?"}
          </div>
        ))}
      </div>

      {gameEnded && allRevealed && finalKeyword && (
        <div className="mt-5 rounded-[22px] border border-[var(--primary)]/22 bg-[var(--primary)]/10 px-5 py-4">
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
