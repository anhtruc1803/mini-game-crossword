"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-4xl font-bold">{t.common.appName}</h1>
      <p className="text-[var(--muted-foreground)]">
        {t.pages.homeSubtitle}
      </p>
      <div className="flex gap-4">
        <Link
          href="/admin/login"
          className="rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          {t.common.admin}
        </Link>
      </div>
    </main>
  );
}
