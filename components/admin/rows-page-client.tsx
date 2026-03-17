"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { SectionCard } from "@/components/shared/section-card";
import { RowsTable } from "@/components/admin/rows-table";
import { RowEditor } from "@/components/admin/row-editor";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "@/lib/i18n";
import type { Program } from "@/features/programs/types";
import type { Game, CrosswordRow } from "@/features/games/types";

interface RowsPageClientProps {
  program: Program;
  game: Game | null;
  rows: CrosswordRow[];
}

export function RowsPageClient({ program, game, rows }: RowsPageClientProps) {
  const { t } = useTranslation();
  const programId = program.id;

  if (!game) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.admin.program(programId)}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            &larr; {t.common.back}
          </Link>
          <h2 className="text-xl font-bold">{t.rows.questionsTitle} — {program.title}</h2>
        </div>
        <EmptyState
          title={t.rows.noGameCreateFirst}
          description={t.game.createFirstGame}
          action={
            <Link
              href={ROUTES.admin.program(programId)}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
            >
              {t.rows.backToOverview}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.admin.program(programId)}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          &larr; {t.common.back}
        </Link>
        <h2 className="text-xl font-bold">{t.rows.questionsTitle} — {program.title}</h2>
      </div>

      {game.finalKeyword && (
        <p className="text-sm text-[var(--muted-foreground)]">
          {t.rows.finalKeyword} <strong className="text-[var(--accent)]">{game.finalKeyword}</strong>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title={`${t.rows.questionsList} (${rows.length})`}>
            {rows.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                {t.rows.noQuestionsAddRight}
              </p>
            ) : (
              <RowsTable rows={rows} />
            )}
          </SectionCard>
        </div>

        <div>
          <SectionCard title={t.rows.addQuestion}>
            <RowEditor gameId={game.id} nextOrder={rows.length} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
