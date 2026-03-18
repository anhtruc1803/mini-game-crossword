import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const LOCAL_PATH_PREFIXES = ["/media/", "/uploads/"];
const ALLOWED_EXTERNAL_HOSTS = ["localhost", "127.0.0.1", "images.unsplash.com"];

const trustedAssetUrlSchema = z.string().refine((value) => {
  // Allow local media/upload paths
  if (LOCAL_PATH_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return true;
  }

  // Validate external URLs against approved hosts
  try {
    const hostname = new URL(value).hostname;
    return ALLOWED_EXTERNAL_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}, "Asset URL must be from an approved domain or a local upload path");

export const createThemeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  logoUrl: trustedAssetUrlSchema.optional(),
  bannerUrl: trustedAssetUrlSchema.optional(),
  desktopBgUrl: trustedAssetUrlSchema.optional(),
  mobileBgUrl: trustedAssetUrlSchema.optional(),
  primaryColor: hexColor.default("#6366f1"),
  secondaryColor: hexColor.default("#8b5cf6"),
  accentColor: hexColor.default("#f59e0b"),
  overlayOpacity: z.number().min(0).max(1).default(0.5),
  fontHeading: z.string().trim().max(100).optional(),
  fontBody: z.string().trim().max(100).optional(),
});

export const updateThemeSchema = createThemeSchema.partial();

export type CreateThemeInput = z.infer<typeof createThemeSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
