/**
 * Assets — storage path helpers.
 * Centralized path generation for local filesystem storage.
 */

export const STORAGE_BUCKETS = {
  THEMES: "themes",
  PROGRAMS: "programs",
} as const;

export function programImagePath(programId: string, ext: string) {
  return `${programId}/cover.${ext}`;
}

export function themeBannerPath(themeId: string, ext: string) {
  return `${themeId}/banner.${ext}`;
}

export function themeLogoPath(themeId: string, ext: string) {
  return `${themeId}/logo.${ext}`;
}

export function themeBgDesktopPath(themeId: string, ext: string) {
  return `${themeId}/bg-desktop.${ext}`;
}

export function themeBgMobilePath(themeId: string, ext: string) {
  return `${themeId}/bg-mobile.${ext}`;
}
