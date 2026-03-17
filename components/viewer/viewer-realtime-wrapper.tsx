"use client";

import { GAME_STATUS } from "@/features/games/constants";
import { useGameRealtime } from "@/features/viewer/hooks";
import type { PublicViewerSnapshot } from "@/features/viewer/view-model";
import { useTranslation } from "@/lib/i18n";
import { AnnouncementPanel } from "./announcement-panel";
import { ClueList } from "./clue-list";
import { CrosswordBoard } from "./crossword-board";
import { FinalKeywordHint } from "./final-keyword-hint";
import { GameStatusBadge } from "./game-status-badge";

interface ViewerRealtimeWrapperProps {
  initialSnapshot: PublicViewerSnapshot;
}

export function ViewerRealtimeWrapper({
  initialSnapshot,
}: ViewerRealtimeWrapperProps) {
  const snapshot = useGameRealtime(initialSnapshot);
  const { game, rows, activeRowIndex, events, finalKeywordHint, finalKeyword } = snapshot;
  const { t } = useTranslation();

  const gameStatus = game?.gameStatus ?? GAME_STATUS.DRAFT;
  const gameEnded = gameStatus === GAME_STATUS.ENDED;

  if (!game) {
    return (
      <div className="mt-16 text-center">
        <p className="text-lg text-[var(--muted-foreground)]">
          {t.viewer.programStartingSoon}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-center gap-3 md:mb-8">
        <GameStatusBadge status={gameStatus} />
        {game.subtitle && (
          <span className="text-sm text-[var(--muted-foreground)]">
            {game.subtitle}
          </span>
        )}
      </div>

      <div className="space-y-6 md:hidden">
        <AnnouncementPanel announcementText={game.announcementText} events={events} />
        <section>
          <CrosswordBoard rows={rows} activeRowIndex={activeRowIndex} />
        </section>
        <section>
          <FinalKeywordHint
            hints={finalKeywordHint}
            finalKeyword={finalKeyword}
            gameEnded={gameEnded}
          />
        </section>
        <section>
          <ClueList rows={rows} activeRowIndex={activeRowIndex} />
        </section>
      </div>

      <div className="hidden md:grid md:grid-cols-12 md:gap-6">
        <div className="col-span-3 space-y-6">
          <ClueList rows={rows} activeRowIndex={activeRowIndex} />
        </div>
        <div className="col-span-6 space-y-6">
          <section className="rounded-2xl border border-[var(--border)]/30 bg-[var(--card)]/40 p-4 backdrop-blur-sm md:p-6">
            <CrosswordBoard rows={rows} activeRowIndex={activeRowIndex} />
          </section>
          <section>
            <FinalKeywordHint
              hints={finalKeywordHint}
              finalKeyword={finalKeyword}
              gameEnded={gameEnded}
            />
          </section>
        </div>
        <div className="col-span-3 space-y-6">
          <AnnouncementPanel announcementText={game.announcementText} events={events} />
        </div>
      </div>
    </>
  );
}
