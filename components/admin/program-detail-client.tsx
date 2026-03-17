"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { SectionCard } from "@/components/shared/section-card";
import { ProgramForm } from "@/components/admin/program-form";
import { ProgramStatusControl } from "@/components/admin/program-status-control";
import { GameQuickCreate } from "@/components/admin/game-quick-create";
import { useTranslation } from "@/lib/i18n";
import type { Program } from "@/features/programs/types";
import type { Game } from "@/features/games/types";

interface ProgramDetailClientProps {
  program: Program;
  game: Game | null;
}

export function ProgramDetailClient({ program, game }: ProgramDetailClientProps) {
  const { t } = useTranslation();
  const programId = program.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.admin.programs}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          &larr; {t.common.back}
        </Link>
        <h2 className="text-xl font-bold">{program.title}</h2>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2">
        <span className="border-b-2 border-[var(--primary)] px-3 py-1 text-sm font-medium">
          {t.programDetail.overview}
        </span>
        <Link
          href={ROUTES.admin.theme(programId)}
          className="px-3 py-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          {t.programDetail.themeTab}
        </Link>
        <Link
          href={ROUTES.admin.rows(programId)}
          className="px-3 py-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          {t.programDetail.questionsTab}
        </Link>
        <Link
          href={ROUTES.admin.game(programId)}
          className="px-3 py-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          {t.programDetail.gameControl}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Program info & edit */}
        <SectionCard title={t.programDetail.programInfo}>
          <ProgramForm program={program} />
        </SectionCard>

        {/* Status + quick actions */}
        <div className="space-y-6">
          <SectionCard title={t.programDetail.statusLabel}>
            <ProgramStatusControl program={program} />
          </SectionCard>

          <SectionCard title={t.programDetail.crosswordGame}>
            {game ? (
              <div className="space-y-3">
                <p className="font-medium">{game.title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {t.programDetail.gameStatusInfo
                    .replace("{status}", game.gameStatus)
                    .replace("{count}", String(game.totalRows))}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={ROUTES.admin.rows(programId)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--muted)]"
                  >
                    {t.programDetail.manageQuestions}
                  </Link>
                  <Link
                    href={ROUTES.admin.game(programId)}
                    className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm text-white hover:opacity-90"
                  >
                    {t.programDetail.gameControl}
                  </Link>
                </div>
              </div>
            ) : (
              <GameQuickCreate programId={programId} />
            )}
          </SectionCard>

          <SectionCard title={t.programDetail.viewerLink}>
            <p className="break-all rounded-lg bg-[var(--background)] px-3 py-2 text-sm font-mono">
              /{program.slug}
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
