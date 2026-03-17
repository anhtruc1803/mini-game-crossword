"use client";

import type { PublicCrosswordRow } from "@/features/viewer/view-model";
import { useTranslation } from "@/lib/i18n";
import { CrosswordRowView } from "./crossword-row";

interface CrosswordBoardProps {
  rows: PublicCrosswordRow[];
  activeRowIndex: number | null;
}

function getBoardCellSize(maxLength: number) {
  if (maxLength >= 20) return 34;
  if (maxLength >= 16) return 38;
  if (maxLength >= 13) return 42;
  return 48;
}

export function CrosswordBoard({ rows, activeRowIndex }: CrosswordBoardProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <section className="glass-panel rounded-[28px] p-6 sm:p-7">
        <div className="flex min-h-72 items-center justify-center rounded-[24px] border border-dashed border-white/12 bg-white/4 text-center">
          <p className="max-w-md text-sm leading-7 text-white/55">{t.viewer.noQuestionsYet}</p>
        </div>
      </section>
    );
  }

  const maxLength = Math.max(...rows.map((row) => row.answerLength));
  const cellSize = getBoardCellSize(maxLength);
  const cellGap = cellSize >= 48 ? 8 : 6;
  const boardMinWidth = (maxLength + 1) * cellSize + maxLength * cellGap + 64;

  return (
    <section className="glass-panel rounded-[28px] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-white/42">
            {t.viewer.activeQuestion}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{t.viewer.boardTitle}</h3>
        </div>
        <p className="text-sm text-white/56">{t.viewer.boardSubtitle}</p>
      </div>

      <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,12,24,0.84),rgba(9,18,34,0.62))]">
        <div className="overflow-x-auto overflow-y-hidden rounded-[26px] px-3 py-4 sm:px-4 sm:py-5">
          <div
            className="broadcast-grid space-y-2.5 rounded-[22px] sm:space-y-3"
            style={{ minWidth: `${boardMinWidth}px` }}
          >
          {rows.map((row, i) => (
            <CrosswordRowView
              key={row.id}
              row={row}
              rowIndex={i}
              isActive={i === activeRowIndex}
              maxLength={maxLength}
              cellSize={cellSize}
              cellGap={cellGap}
            />
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
