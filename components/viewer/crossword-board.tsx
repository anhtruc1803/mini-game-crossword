"use client";

import type { PublicCrosswordRow } from "@/features/viewer/view-model";
import { useTranslation } from "@/lib/i18n";
import { CrosswordRowView } from "./crossword-row";

interface CrosswordBoardProps {
  rows: PublicCrosswordRow[];
  activeRowIndex: number | null;
}

export function CrosswordBoard({ rows, activeRowIndex }: CrosswordBoardProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--border)] py-16">
        <p className="text-[var(--muted-foreground)]">{t.viewer.noQuestionsYet}</p>
      </div>
    );
  }

  const maxLength = Math.max(...rows.map((r) => r.answerLength));

  return (
    <div className="space-y-1 md:space-y-2">
      {rows.map((row, i) => (
        <CrosswordRowView
          key={row.id}
          row={row}
          rowIndex={i}
          isActive={i === activeRowIndex}
          maxLength={maxLength}
        />
      ))}
    </div>
  );
}
