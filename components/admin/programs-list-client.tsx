"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "@/lib/i18n";
import type { Program } from "@/features/programs/types";

export function ProgramsListClient({ programs }: { programs: Program[] }) {
  const { t } = useTranslation();

  const statusLabels: Record<string, { label: string; tone: string }> = {
    draft: { label: t.status.draft, tone: "bg-white/8 text-white/72" },
    live: { label: t.status.live, tone: "bg-emerald-400/16 text-emerald-300" },
    ended: { label: t.status.ended, tone: "bg-rose-400/16 text-rose-300" },
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Admin</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{t.admin.programsList}</h2>
            <p className="mt-2 text-sm text-white/60">
              Quản lý các chương trình, hình ảnh, game và luồng điều khiển trên cùng một giao diện.
            </p>
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
            return (
              <Link
                key={program.id}
                href={ROUTES.admin.program(program.id)}
                className="glass-panel soft-hover overflow-hidden rounded-[28px]"
              >
                <div className="relative aspect-[16/10] w-full bg-[var(--muted)]">
                  {program.imageUrl ? (
                    <Image
                      src={program.imageUrl}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
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
                    {program.description ?? "Chưa có mô tả cho chương trình này."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
