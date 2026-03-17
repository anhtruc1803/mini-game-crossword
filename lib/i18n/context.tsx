"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Locale, TranslationKeys } from "./types";
import { vi } from "./locales/vi";
import { en } from "./locales/en";

const translations: Record<Locale, TranslationKeys> = { vi, en };

const LOCALE_COOKIE = "locale";
const DEFAULT_LOCALE: Locale = "vi";

type LocaleContextValue = {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: translations[DEFAULT_LOCALE],
  setLocale: () => {},
});

function getInitialLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  if (value === "en" || value === "vi") return value;
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    document.documentElement.lang = newLocale;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LocaleContext);
}

/** Get translations for a specific locale (useful in server components). */
export function getTranslations(locale: Locale = DEFAULT_LOCALE): TranslationKeys {
  return translations[locale];
}

export { DEFAULT_LOCALE };
