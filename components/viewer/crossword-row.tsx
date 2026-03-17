import { ROW_STATUS } from "@/features/games/constants";
import type { PublicCrosswordRow } from "@/features/viewer/view-model";
import { cn } from "@/lib/utils/cn";

interface CrosswordRowProps {
  row: PublicCrosswordRow;
  rowIndex: number;
  isActive: boolean;
  maxLength: number;
  cellSize: number;
  cellGap: number;
}

export function CrosswordRowView({
  row,
  rowIndex,
  isActive,
  maxLength,
  cellSize,
  cellGap,
}: CrosswordRowProps) {
  const isRevealed = row.rowStatus === ROW_STATUS.ANSWER_REVEALED;
  const isClueVisible = row.rowStatus === ROW_STATUS.CLUE_VISIBLE;
  const isHidden = row.rowStatus === ROW_STATUS.HIDDEN;
  const offset = Math.floor((maxLength - row.answerLength) / 2);

  return (
    <div
      className={cn(
        "rounded-[24px] px-2 py-2 transition-all duration-300 sm:px-3",
        isActive && "bg-white/6 shadow-[0_0_0_1px_rgba(94,234,212,0.18),0_16px_40px_rgba(8,15,29,0.28)]"
      )}
    >
      <div className="flex min-w-max items-center gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
            isActive
              ? "bg-[var(--primary)] text-slate-950 shadow-[0_0_30px_rgba(94,234,212,0.36)]"
              : isRevealed
                ? "bg-emerald-400/18 text-emerald-300"
                : "bg-white/6 text-white/72"
          )}
          style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
        >
          {rowIndex + 1}
        </span>

        <div className="flex min-w-max justify-center" style={{ gap: `${cellGap}px` }}>
          {Array.from({ length: offset }).map((_, index) => (
            <div
              key={`spacer-${index}`}
              aria-hidden="true"
              className="rounded-2xl opacity-0"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            />
          ))}

          {Array.from({ length: row.answerLength }).map((_, i) => {
            const char = row.answerText?.[i] ?? "";
            const isHighlighted = row.highlightedIndexes.includes(i);
            const hiddenMarker = isClueVisible ? "•" : "·";

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-center rounded-2xl border text-sm font-bold uppercase transition-all duration-300 sm:text-base",
                  isHidden && "border-white/10 bg-white/7 text-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
                  isClueVisible && "border-white/16 bg-white/9 text-white/35",
                  isRevealed &&
                    !isHighlighted &&
                    "border-white/14 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                  isRevealed &&
                    isHighlighted &&
                    "border-[var(--accent)]/45 bg-[var(--accent)]/18 text-[var(--accent)] shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                  isActive && !isRevealed && "border-[var(--primary)]/18 bg-[var(--primary)]/8"
                )}
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              >
                {isRevealed ? char : hiddenMarker}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
