"use client";

import Link from "next/link";
import { ControlPanel } from "@/components/admin/control-panel";
import { EventLog } from "@/components/admin/event-log";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import type { CrosswordRow, Game, GameEvent } from "@/features/games/types";
import type { Program } from "@/features/programs/types";
import { ROUTES } from "@/lib/constants/routes";
import { useTranslation } from "@/lib/i18n";

interface GameControlClientProps {
  program: Program;
  game: Game | null;
  rows: CrosswordRow[];
  events: GameEvent[];
}

export function GameControlClient({ program, game, rows, events }: GameControlClientProps) {
  const { t } = useTranslation();
  const programId = program.id;

  if (!game) {
    return (
      <div className="space-y-6">
        <div className="glass-panel rounded-[30px] p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.admin.program(programId)}
              className="glass-pill rounded-full px-4 py-2 text-sm text-white/72 transition hover:text-white"
            >
              &larr; {t.common.back}
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                {t.programDetail.gameControl}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{program.title}</h2>
            </div>
          </div>
        </div>

        <EmptyState title={t.pages.noGame} description={t.pages.createGameBeforeControl} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[30px] p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Link
              href={ROUTES.admin.program(programId)}
              className="glass-pill inline-flex rounded-full px-4 py-2 text-sm text-white/72 transition hover:text-white"
            >
              &larr; {t.common.back}
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                {t.programDetail.gameControl}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{program.title}</h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-panel-soft rounded-[24px] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                {t.viewer.questions}
              </p>
              <p className="mt-2 text-3xl font-bold text-white">{rows.length}</p>
            </div>
            <div className="glass-panel-soft rounded-[24px] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                {t.viewer.updates}
              </p>
              <p className="mt-2 text-3xl font-bold text-white">{events.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <SectionCard title={t.game.controlPanel} className="p-5 sm:p-6">
          <ControlPanel programId={programId} game={game} rows={rows} />
        </SectionCard>

        <SectionCard title={t.game.eventHistory} className="p-5 sm:p-6">
          <EventLog events={events} />
        </SectionCard>
      </div>
    </div>
  );
}
