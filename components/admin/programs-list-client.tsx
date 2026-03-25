"use client";

import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { MiniTrafficChart } from "@/components/admin/mini-traffic-chart";
import { ROUTES } from "@/lib/constants/routes";
import { useTranslation } from "@/lib/i18n";
import type { ProgramAnalyticsSummary } from "@/features/analytics/types";
import type { Program } from "@/features/programs/types";

interface ProgramsListClientProps {
  programs: Program[];
  analyticsByProgramId: Record<string, ProgramAnalyticsSummary>;
}

export function ProgramsListClient({
  programs,
  analyticsByProgramId,
}: ProgramsListClientProps) {
  const { t, locale } = useTranslation();

  const statusLabels: Record<string, { label: string; tone: string }> = {
    draft: { label: t.status.draft, tone: "bg-white/8 text-white/72" },
    live: { label: t.status.live, tone: "bg-emerald-400/16 text-emerald-300" },
    ended: { label: t.status.ended, tone: "bg-rose-400/16 text-rose-300" },
  };

  const labels =
    locale === "vi"
      ? {
          headingTag: "Admin",
          subtitle:
            "Qu?n lý chuong trình, hình ?nh, game và theo dõi lu?ng ngu?i xem trên cùng m?t giao di?n.",
          noDescription: "Chua có mô t? cho chuong trình này.",
          online: "Online",
          viewers: "Ngu?i xem",
          pageViews: "Lu?t xem",
          trend: "Xu hu?ng",
        }
      : {
          headingTag: "Admin",
          subtitle:
            "Manage programs, artwork, game flow, and viewer activity from one place.",
          noDescription: "No description for this program yet.",
          online: "Online",
          viewers: "Viewers",
          pageViews: "Pageviews",
          trend: "Trend",
        };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{labels.headingTag}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{t.admin.programsList}</h2>
            <p className="mt-2 text-sm text-white/60">{labels.subtitle}</p>
          </div>

          <Link
            href={ROUTES.admin.newProgram}
            className="inet-button rounded-2xl px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
          >
            {t.admin.createNew}
          </Link>
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-6">
          <EmptyState
            title={t.admin.noProgramsYet}
            description={t.admin.createFirstProgram}
            action={
              <Link
                href={ROUTES.admin.newProgram}
                className="inet-button rounded-2xl px-5 py-3 text-sm font-medium text-white"
              >
                {t.admin.createNew}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => {
            const status = statusLabels[program.status] ?? statusLabels.draft;
            const analytics = analyticsByProgramId[program.id];

            return (
              <Link
                key={program.id}
                href={ROUTES.admin.program(program.id)}
                className="glass-panel soft-hover overflow-hidden rounded-[28px]"
              >
                <div className="relative aspect-[16/10] w-full bg-[var(--muted)]">
                  {program.imageUrl ? (
                    <Image src={program.imageUrl} alt={program.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(12,18,34,0.82))] text-4xl font-black text-white/70">
                      {program.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(4,10,20,0.9))]" />
                  <div className="absolute left-4 top-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{program.title}</h3>
                    <p className="mt-1 text-sm text-white/48">/{program.slug}</p>
                  </div>

                  <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-white/62">
                    {program.description ?? labels.noDescription}
                  </p>

                  <div className="grid grid-cols-3 gap-2 border-t border-white/8 pt-3">
                    <div className="glass-panel-soft rounded-2xl p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                        {labels.online}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-emerald-300">
                        {analytics?.onlineViewers ?? 0}
                      </p>
                    </div>

                    <div className="glass-panel-soft rounded-2xl p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                        {labels.viewers}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {analytics?.totalViewers ?? 0}
                      </p>
                    </div>

                    <div className="glass-panel-soft rounded-2xl p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                        {labels.pageViews}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-sky-300">
                        {analytics?.totalPageViews ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel-soft rounded-2xl p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                        {labels.trend}
                      </p>
                      <span className="text-xs text-white/42">2h</span>
                    </div>
                    <MiniTrafficChart points={analytics?.trafficTrend ?? []} compact />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
