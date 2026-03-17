/** Domain types for themes. */

export interface Theme {
  id: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  desktopBgUrl: string | null;
  mobileBgUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  overlayOpacity: number;
  fontHeading: string | null;
  fontBody: string | null;
  customCssJson: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}
