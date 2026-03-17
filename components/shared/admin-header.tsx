"use client";

import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

export function AdminHeader() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
      <h1 className="text-lg font-semibold">{t.admin.headerTitle}</h1>
      <LanguageSwitcher />
    </header>
  );
}
