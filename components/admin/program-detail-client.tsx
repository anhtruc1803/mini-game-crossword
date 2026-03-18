"use client";

import Image from "next/image";
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
          className="text-sm text-white/62 transition hover:text-white"
        >
          &larr; {t.common.back}
        </Link>
        <h2 className="text-xl font-bold text-white">{program.title}</h2>
      </div>

      <section className="glass-panel overflow-hidden rounded-[32px]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4 p-6 sm:p-8">
            <span className="glass-pill inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
              {t.programDetail.overview}
            </span>
            <div>
              <h3 className="text-3xl font-black text-white sm:text-4xl">{program.title}</h3>
              <p className="mt-3 text-sm text-white/56">/{program.slug}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
                {program.description ?? "Chưa có mô tả cho chương trình này."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/8 pt-4">
              <span className="glass-pill rounded-full px-4 py-2 text-sm text-white/74">
                {t.programDetail.statusLabel}: {program.status}
              </span>
              {game && (
                <span className="glass-pill rounded-full px-4 py-2 text-sm text-white/74">
                  {t.programDetail.crosswordGame}: {game.gameStatus}
                </span>
              )}
            </div>
          </div>

          <div className="min-h-[260px] border-t border-white/8 bg-white/[0.03] p-3 lg:min-h-full lg:border-l lg:border-t-0">
            <div className="relative h-full overflow-hidden rounded-[24px] bg-[var(--muted)]">
              {program.imageUrl ? (
                <Image
                  src={program.imageUrl}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(12,18,34,0.82))] text-5xl font-black text-white/70">
                  {program.title.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/8 bg-white/[0.03] p-2">
        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
          {t.programDetail.overview}
        </span>
        <Link
          href={ROUTES.admin.theme(programId)}
          className="rounded-full px-4 py-2 text-sm text-white/62 transition hover:bg-white/6 hover:text-white"
        >
          {t.programDetail.themeTab}
        </Link>
        <Link
          href={ROUTES.admin.rows(programId)}
          className="rounded-full px-4 py-2 text-sm text-white/62 transition hover:bg-white/6 hover:text-white"
        >
          {t.programDetail.questionsTab}
        </Link>
        <Link
          href={ROUTES.admin.game(programId)}
          className="rounded-full px-4 py-2 text-sm text-white/62 transition hover:bg-white/6 hover:text-white"
        >
          {t.programDetail.gameControl}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <SectionCard title={t.programDetail.programInfo}>
          <ProgramForm program={program} />
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title={t.programDetail.statusLabel}>
            <ProgramStatusControl program={program} />
          </SectionCard>

          <SectionCard title={t.programDetail.crosswordGame}>
            {game ? (
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-white">{game.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {t.programDetail.gameStatusInfo
                      .replace("{status}", game.gameStatus)
                      .replace("{count}", String(game.totalRows))}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={ROUTES.admin.rows(programId)}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/82 transition hover:bg-white/6"
                  >
                    {t.programDetail.manageQuestions}
                  </Link>
                  <Link
                    href={ROUTES.admin.game(programId)}
                    className="inet-button rounded-2xl px-4 py-2 text-sm font-medium text-white"
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
            <p className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 font-mono text-sm text-white/80">
              /{program.slug}
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
