"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  advanceRowAction,
  endGameAction,
  pauseGameAction,
  previousRowAction,
  resetGameAction,
  resumeGameAction,
  revealAnswerAction,
  revealClueAction,
  startGameAction,
  updateAnnouncementAction,
} from "@/features/admin/actions";
import { GAME_STATUS, ROW_STATUS } from "@/features/games/constants";
import type { CrosswordRow, Game } from "@/features/games/types";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

interface ControlPanelProps {
  programId: string;
  game: Game;
  rows: CrosswordRow[];
}

function getActionButtonClass(tone: "primary" | "outline" | "warning" | "danger") {
  if (tone === "primary") return "inet-button text-white";
  if (tone === "warning") {
    return "rounded-2xl border border-[var(--accent)]/28 bg-[var(--accent)]/14 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-[var(--accent)]/22";
  }
  if (tone === "danger") {
    return "rounded-2xl border border-[var(--celebration)]/28 bg-[var(--celebration)]/14 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-[var(--celebration)]/22";
  }

  return "inet-outline rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/84 transition hover:bg-white/[0.08]";
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary" | "outline" | "warning" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        getActionButtonClass(tone),
        "soft-hover disabled:cursor-not-allowed disabled:opacity-45"
      )}
    >
      {children}
    </button>
  );
}

export function ControlPanel({ programId, game, rows }: ControlPanelProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState(game.announcementText ?? "");

  const isLive = game.gameStatus === GAME_STATUS.LIVE;
  const isPaused = game.gameStatus === GAME_STATUS.PAUSED;
  const isDraft = game.gameStatus === GAME_STATUS.DRAFT;
  const isEnded = game.gameStatus === GAME_STATUS.ENDED;
  const currentRow = game.currentRowIndex !== null ? rows[game.currentRowIndex] : null;
  const activeRowNumber = game.currentRowIndex !== null ? game.currentRowIndex + 1 : null;
  const canRewind =
    (isLive || isPaused) &&
    (game.currentRowIndex ?? 0) > 0 &&
    currentRow?.rowStatus === ROW_STATUS.HIDDEN;

  async function exec(action: () => Promise<{ error?: string; success?: boolean }>) {
    setLoading(true);
    setError(null);
    const result = await action();

    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoading(false);
  }

  const statusLabel = isLive
    ? t.status.live
    : isPaused
      ? t.status.paused
      : isEnded
        ? t.status.ended
        : t.status.draft;

  const statusTone = isLive
    ? "bg-emerald-400/16 text-emerald-300 border-emerald-400/24"
    : isPaused
      ? "bg-amber-400/16 text-amber-200 border-amber-400/24"
      : isEnded
        ? "bg-rose-400/16 text-rose-200 border-rose-400/24"
        : "bg-white/8 text-white/72 border-white/10";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-[22px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <div className="glass-panel-soft rounded-[26px] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/42">{t.game.statusLabel}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full border px-4 py-2 text-sm font-semibold", statusTone)}>
              {statusLabel}
            </span>
            {activeRowNumber !== null && (
              <span className="glass-pill rounded-full px-4 py-2 text-sm text-white/76">
                {t.game.currentQuestion}: #{activeRowNumber} / {game.totalRows}
              </span>
            )}
          </div>

          {currentRow && (
            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                {t.game.currentQuestion}
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{currentRow.clueText}</p>
              <p className="mt-2 text-sm text-white/54">
                {currentRow.answerText.length} {t.viewer.chars}
              </p>
            </div>
          )}
        </div>

        <div className="glass-panel-soft rounded-[26px] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/42">{t.game.questionsOverview}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">{t.viewer.questions}</p>
              <p className="mt-2 text-3xl font-bold text-white">{rows.length}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">{t.viewer.keyword}</p>
              <p className="mt-2 text-3xl font-bold text-white">{game.finalKeyword?.length ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isDraft && (
          <ActionButton
            onClick={() => exec(() => startGameAction(game.id, programId))}
            disabled={loading || rows.length === 0}
          >
            {t.game.startGame}
          </ActionButton>
        )}

        {isLive && (
          <>
            <ActionButton
              onClick={() => exec(() => revealClueAction(game.id, programId))}
              disabled={loading || !currentRow || currentRow.rowStatus !== ROW_STATUS.HIDDEN}
            >
              {t.game.openQuestion}
            </ActionButton>
            <ActionButton
              onClick={() => exec(() => revealAnswerAction(game.id, programId))}
              disabled={loading || !currentRow || currentRow.rowStatus !== ROW_STATUS.CLUE_VISIBLE}
              tone="outline"
            >
              {t.game.showAnswer}
            </ActionButton>
            <ActionButton
              onClick={() => exec(() => advanceRowAction(game.id, programId))}
              disabled={loading || (game.currentRowIndex ?? 0) >= game.totalRows - 1}
            >
              {t.game.nextQuestion}
            </ActionButton>
            <ActionButton
              onClick={() => exec(() => previousRowAction(game.id, programId))}
              disabled={loading || !canRewind}
              tone="outline"
            >
              {t.game.previousQuestion}
            </ActionButton>
            <ActionButton
              onClick={() => exec(() => pauseGameAction(game.id, programId))}
              disabled={loading}
              tone="warning"
            >
              {t.game.pause}
            </ActionButton>
            <ActionButton
              onClick={() => exec(() => endGameAction(game.id, programId))}
              disabled={loading}
              tone="danger"
            >
              {t.game.endGame}
            </ActionButton>
          </>
        )}

        {isPaused && (
          <>
            <ActionButton
              onClick={() => exec(() => previousRowAction(game.id, programId))}
              disabled={loading || !canRewind}
              tone="outline"
            >
              {t.game.previousQuestion}
            </ActionButton>
            <ActionButton
              onClick={() => exec(() => resumeGameAction(game.id, programId))}
              disabled={loading}
            >
              {t.game.resume}
            </ActionButton>
            <ActionButton
              onClick={() => exec(() => endGameAction(game.id, programId))}
              disabled={loading}
              tone="danger"
            >
              {t.game.endGame}
            </ActionButton>
          </>
        )}

        {isEnded && (
          <ActionButton
            onClick={() => exec(() => resetGameAction(game.id, programId))}
            disabled={loading}
            tone="outline"
          >
            {t.game.resetGame}
          </ActionButton>
        )}
      </div>

      <div className="glass-panel-soft rounded-[26px] p-5">
        <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-white/48">
          {t.game.announcement}
        </label>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row">
          <input
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="min-h-14 flex-1 rounded-[20px] border border-white/10 bg-[rgba(8,15,29,0.66)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-[var(--primary)]/30 focus:ring-2 focus:ring-[var(--primary)]/20"
            placeholder={t.game.announcementPlaceholder}
          />
          <button
            type="button"
            onClick={() => exec(() => updateAnnouncementAction(game.id, programId, announcement || null))}
            disabled={loading}
            className="inet-button min-h-14 shrink-0 rounded-[20px] px-6 text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t.common.update}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">
          {t.game.questionsOverview}
        </h4>

        <div className="space-y-2">
          {rows.map((row, i) => {
            const isActive = i === game.currentRowIndex;
            const rowLabel =
              row.rowStatus === ROW_STATUS.ANSWER_REVEALED
                ? row.answerText
                : row.rowStatus === ROW_STATUS.CLUE_VISIBLE
                  ? t.game.opened
                  : t.status.hidden;

            return (
              <div
                key={row.id}
                className={cn(
                  "soft-hover flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3",
                  isActive && "border-[var(--primary)]/28 bg-[var(--primary)]/10"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-sm font-semibold text-white/78">
                  #{i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-white/84">{row.clueText}</span>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    row.rowStatus === ROW_STATUS.ANSWER_REVEALED
                      ? "border-emerald-400/24 bg-emerald-400/16 text-emerald-300"
                      : row.rowStatus === ROW_STATUS.CLUE_VISIBLE
                        ? "border-[var(--primary)]/24 bg-[var(--primary)]/14 text-sky-200"
                        : "border-white/10 bg-white/[0.05] text-white/52"
                  )}
                >
                  {rowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
