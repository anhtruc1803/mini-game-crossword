import { ROW_STATUS } from "@/features/games/constants";
import type { PublicCrosswordRow } from "@/features/viewer/view-model";
import { cn } from "@/lib/utils/cn";

interface CrosswordRowProps {
  row: PublicCrosswordRow;
  rowIndex: number;
  isActive: boolean;
  maxLength: number;
}

export function CrosswordRowView({
  row,
  rowIndex,
  isActive,
  maxLength,
}: CrosswordRowProps) {
  const isRevealed = row.rowStatus === ROW_STATUS.ANSWER_REVEALED;
  const isClueVisible = row.rowStatus === ROW_STATUS.CLUE_VISIBLE;
  const isHidden = row.rowStatus === ROW_STATUS.HIDDEN;
  const offset = Math.floor((maxLength - row.answerLength) / 2);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all md:gap-3 md:px-3 md:py-2",
        isActive && "bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/30"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold md:h-8 md:w-8 md:text-sm",
          isActive
            ? "bg-[var(--primary)] text-white"
            : isRevealed
              ? "bg-green-500/20 text-green-400"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
        )}
      >
        {rowIndex + 1}
      </span>

      <div className="flex gap-0.5 md:gap-1" style={{ paddingLeft: `${offset * 2}px` }}>
        {Array.from({ length: row.answerLength }).map((_, i) => {
          const char = row.answerText?.[i] ?? "";
          const isHighlighted = row.highlightedIndexes.includes(i);

          return (
            <div
              key={i}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded border text-xs font-bold transition-all md:h-9 md:w-9 md:text-sm",
                isHidden && "border-[var(--border)]/40 bg-[var(--muted)]/30",
                isClueVisible && "border-[var(--border)] bg-[var(--card)]",
                isRevealed &&
                  !isHighlighted &&
                  "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]",
                isRevealed &&
                  isHighlighted &&
                  "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
              )}
            >
              {isRevealed ? char : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
