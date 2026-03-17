import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const trustedAssetUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const hostname = new URL(value).hostname;
    const allowedHosts = [
      "localhost",
      "127.0.0.1",
      "images.unsplash.com",
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
        : null,
    ].filter(Boolean) as string[];

    return allowedHosts.includes(hostname);
  }, "Asset URL must be hosted on an approved domain");

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
