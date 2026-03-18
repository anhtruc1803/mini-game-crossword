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
      <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex min-h-72 items-center justify-center rounded-[24px] border border-dashed border-white/12 bg-white/4 text-center">
          <p className="max-w-md text-sm leading-7 text-white/55">{t.viewer.noQuestionsYet}</p>
        </div>
      </section>
    );
  }

  const maxLength = Math.max(...rows.map((row) => row.answerLength));
  const cellSize = getBoardCellSize(maxLength);
  const cellGap = cellSize >= 48 ? 8 : 6;
  const boardMinWidth = (maxLength + 1) * cellSize + maxLength * cellGap + 72;

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="glass-pill inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/78">
            {t.viewer.boardTitle}
          </span>
          <h3 className="mt-3 text-2xl font-semibold text-white">{t.viewer.boardTitle}</h3>
        </div>

        <p className="max-w-xl text-sm leading-6 text-white/56">{t.viewer.boardSubtitle}</p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,29,0.72),rgba(14,22,40,0.52))] p-3 sm:p-4">
        <div className="grid-paper overflow-x-auto overflow-y-hidden rounded-[20px] border border-white/8 px-3 py-4 [scrollbar-width:thin] sm:px-4">
          <div className="space-y-3" style={{ minWidth: `${boardMinWidth}px` }}>
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
