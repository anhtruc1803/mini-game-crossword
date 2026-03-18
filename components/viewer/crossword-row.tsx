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
        "rounded-[22px] px-2 py-2 transition-all duration-200 sm:px-3",
        isActive && "bg-[var(--primary)]/[0.08] shadow-[0_0_0_1px_rgba(45,140,240,0.16)]"
      )}
    >
      <div className="flex min-w-max items-center gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
            isActive
              ? "bg-[var(--primary)] text-white shadow-[0_0_24px_rgba(45,140,240,0.34)]"
              : "bg-white/8 text-white/78"
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

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-center rounded-2xl border text-sm font-bold uppercase transition-all duration-200 sm:text-base",
                  isHidden &&
                    "border border-dashed border-white/18 bg-white/[0.018] text-white/42",
                  isClueVisible &&
                    "border border-dashed border-white/18 bg-white/[0.02] text-white/42",
                  isRevealed &&
                    !isHighlighted &&
                    "border-[rgba(45,140,240,0.65)] bg-[rgba(45,140,240,0.28)] text-white shadow-[0_0_20px_rgba(45,140,240,0.16)]",
                  isRevealed &&
                    isHighlighted &&
                    "border-[rgba(251,191,36,0.72)] bg-[rgba(251,191,36,0.24)] text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.12)]",
                  isActive && !isRevealed && "border-white/22 bg-white/[0.035]"
                )}
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              >
                {isRevealed ? char : "·"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
