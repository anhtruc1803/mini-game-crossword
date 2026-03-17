"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "@/lib/i18n";
import type { Program } from "@/features/programs/types";

export function ProgramsListClient({ programs }: { programs: Program[] }) {
  const { t } = useTranslation();

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: t.status.draft, color: "bg-gray-500" },
    live: { label: t.status.live, color: "bg-green-500" },
    ended: { label: t.status.ended, color: "bg-red-500" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t.admin.programsList}</h2>
        <Link
          href={ROUTES.admin.newProgram}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.admin.createNew}
        </Link>
      </div>

      {programs.length === 0 ? (
        <EmptyState
          title={t.admin.noProgramsYet}
          description={t.admin.createFirstProgram}
          action={
            <Link
              href={ROUTES.admin.newProgram}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
            >
              {t.admin.createNew}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const status = statusLabels[program.status] ?? statusLabels.draft;
            return (
              <Link
                key={program.id}
                href={ROUTES.admin.program(program.id)}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--primary)]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{program.title}</h3>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  /{program.slug}
                </p>
                {program.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                    {program.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
