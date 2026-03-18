"use client";

import Link from "next/link";
import { ProgramForm } from "@/components/admin/program-form";
import { ROUTES } from "@/lib/constants/routes";
import { useTranslation } from "@/lib/i18n";

export function NewProgramClient() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[30px] p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={ROUTES.admin.programs}
            className="glass-pill rounded-full px-4 py-2 text-sm text-white/72 transition hover:text-white"
          >
            &larr; {t.common.back}
          </Link>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">
              {t.admin.programsList}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{t.admin.createNewProgram}</h2>
          </div>
        </div>
      </div>

      <ProgramForm />
    </div>
  );
}
