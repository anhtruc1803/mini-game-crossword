"use client";

import { useTranslation } from "@/lib/i18n";
import type { TranslationKeys } from "@/lib/i18n";

type NestedKeyOf<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${NestedKeyOf<T[K]>}`;
    }[keyof T & string];

type TranslationPath = NestedKeyOf<TranslationKeys>;

/**
 * Client component that renders a translated string.
 * Use this in server components that need translated text.
 */
export function T({
  k,
  className,
  as: Tag = "span",
}: {
  k: TranslationPath;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
}) {
  const { t } = useTranslation();

  // Navigate the translation object by path
  const parts = k.split(".");
  let value: unknown = t;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }

  if (typeof value !== "string") return null;

  const Element = Tag as React.ElementType;
  return <Element className={className}>{value}</Element>;
}
