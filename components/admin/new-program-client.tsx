"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { ProgramForm } from "@/components/admin/program-form";
import { useTranslation } from "@/lib/i18n";

export function NewProgramClient() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.admin.programs}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          &larr; {t.common.back}
        </Link>
        <h2 className="text-xl font-bold">{t.admin.createNewProgram}</h2>
      </div>
      <ProgramForm />
    </div>
  );
}
