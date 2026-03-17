"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { SectionCard } from "@/components/shared/section-card";
import { ControlPanel } from "@/components/admin/control-panel";
import { EventLog } from "@/components/admin/event-log";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "@/lib/i18n";
import type { Program } from "@/features/programs/types";
import type { Game, CrosswordRow, GameEvent } from "@/features/games/types";

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
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.admin.program(programId)}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            &larr; {t.common.back}
          </Link>
          <h2 className="text-xl font-bold">{t.programDetail.gameControl} — {program.title}</h2>
        </div>
        <EmptyState
          title={t.pages.noGame}
          description={t.pages.createGameBeforeControl}
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
        <h2 className="text-xl font-bold">{t.programDetail.gameControl} — {program.title}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title={t.game.controlPanel}>
            <ControlPanel programId={programId} game={game} rows={rows} />
          </SectionCard>
        </div>

        <div>
          <SectionCard title={t.game.eventHistory}>
            <EventLog events={events} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
