"use client";

import { useEffect, useState } from "react";
import { GAME_STATUS } from "@/features/games/constants";
import { useViewerAnalytics } from "@/features/viewer/analytics";
import { useGameRealtime } from "@/features/viewer/hooks";
import type { PublicViewerSnapshot } from "@/features/viewer/view-model";
import { useTranslation } from "@/lib/i18n";
import { AnnouncementPanel } from "./announcement-panel";
import { ClueList } from "./clue-list";
import { CrosswordBoard } from "./crossword-board";
import { FinalKeywordHint } from "./final-keyword-hint";

interface ViewerRealtimeWrapperProps {
  initialSnapshot: PublicViewerSnapshot;
}

export function ViewerRealtimeWrapper({
  initialSnapshot,
}: ViewerRealtimeWrapperProps) {
  const snapshot = useGameRealtime(initialSnapshot);
  useViewerAnalytics(snapshot.program.slug);
  const { game, rows, activeRowIndex, events, finalKeywordHint, finalKeyword } = snapshot;
  const { t } = useTranslation();
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(activeRowIndex);

  const gameStatus = game?.gameStatus ?? GAME_STATUS.DRAFT;
  const gameEnded = gameStatus === GAME_STATUS.ENDED;
  const highlightedRowIndex = selectedRowIndex ?? activeRowIndex;
  const activeQuestionNumber =
    highlightedRowIndex !== null && highlightedRowIndex >= 0 ? highlightedRowIndex + 1 : null;

  useEffect(() => {
    setSelectedRowIndex(activeRowIndex);
  }, [activeRowIndex]);

  if (!game) {
    return (
      <section className="glass-panel rounded-[28px] p-6 text-center sm:p-8">
        <div className="mx-auto max-w-2xl space-y-3">
          <span className="glass-pill inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
            {t.viewer.aboutToStart}
          </span>
          <p className="text-lg text-white/78">{t.viewer.programStartingSoon}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
        <div className="glass-panel rounded-[30px] p-4 sm:p-5">
          <ClueList
            rows={rows}
            activeRowIndex={highlightedRowIndex}
            onSelectRow={setSelectedRowIndex}
            boardTitle={t.viewer.boardTitle}
            boardSubtitle={game.subtitle || t.viewer.boardSubtitle}
            gameStatus={gameStatus}
            activeQuestionNumber={activeQuestionNumber}
            questionCount={rows.length}
            updateCount={events.length}
          />
          <div className="mt-5">
            <CrosswordBoard rows={rows} activeRowIndex={highlightedRowIndex} />
          </div>
          <div className="mt-5">
            <FinalKeywordHint
              hints={finalKeywordHint}
              finalKeyword={finalKeyword}
              gameEnded={gameEnded}
            />
          </div>
        </div>

        <AnnouncementPanel announcementText={game.announcementText} events={events} />
      </div>
    </div>
  );
}
