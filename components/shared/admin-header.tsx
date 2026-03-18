"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

export function AdminHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(15,23,42,0.72)]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="inet-outline rounded-2xl px-4 py-3">
            <Image
              src="/brands/inet-logo.svg"
              alt="iNET"
              width={126}
              height={36}
              priority
              className="h-7 w-auto sm:h-8"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Admin Console</p>
            <h1 className="text-lg font-semibold text-white">{t.admin.headerTitle}</h1>
          </div>
        </div>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
