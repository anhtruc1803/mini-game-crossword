import Image from "next/image";
import { notFound } from "next/navigation";
import { getViewerSnapshot } from "@/features/viewer/queries";
import { ViewerRealtimeWrapper } from "@/components/viewer/viewer-realtime-wrapper";
import { ViewerFooter } from "@/components/shared/viewer-footer";

interface ViewerPageProps {
  params: Promise<{ programSlug: string }>;
}

/**
 * Viewer page — Server Component.
 * Loads the initial snapshot via SSR, then hands off to the client
 * ViewerRealtimeWrapper for live polling updates.
 */
export default async function ViewerPage({ params }: ViewerPageProps) {
  const { programSlug } = await params;
  const snapshot = await getViewerSnapshot(programSlug);

  if (!snapshot) notFound();

  const { program, theme } = snapshot;

  // Theme-based CSS variables applied at the server-rendered shell
  const themeStyle: React.CSSProperties = theme
    ? ({
        "--primary": theme.primaryColor,
        "--secondary": theme.secondaryColor,
        "--accent": theme.accentColor,
      } as React.CSSProperties)
    : {};

  return (
    <main className="relative min-h-screen" style={themeStyle}>
      {/* Background layer — static, server-rendered */}
      {theme?.desktopBgUrl && (
        <div
          className="fixed inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
          style={{ backgroundImage: `url(${theme.desktopBgUrl})` }}
        />
      )}
      {theme?.mobileBgUrl && (
        <div
          className="fixed inset-0 block bg-cover bg-center bg-no-repeat md:hidden"
          style={{ backgroundImage: `url(${theme.mobileBgUrl})` }}
        />
      )}
      {theme && (
        <div
          className="fixed inset-0 bg-black"
          style={{ opacity: theme.overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-8">
        {/* Header — static, server-rendered */}
        <header className="mb-6 text-center md:mb-8">
          {theme?.logoUrl && (
            <Image
              src={theme.logoUrl}
              alt="Logo"
              width={192}
              height={64}
              className="mx-auto mb-3 h-12 object-contain md:h-16"
            />
          )}
          {theme?.bannerUrl && (
            <Image
              src={theme.bannerUrl}
              alt="Banner"
              width={1200}
              height={400}
              className="mx-auto mb-4 max-h-32 rounded-xl object-contain md:max-h-48"
            />
          )}
          {program.imageUrl && (
            <div className="mx-auto mb-4 max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black/10 shadow-2xl">
              <div className="relative aspect-[21/9] w-full">
                <Image
                  src={program.imageUrl}
                  alt={program.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
          <h1 className="text-2xl font-bold md:text-4xl">{program.title}</h1>
          {program.description && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)] md:text-base">
              {program.description}
            </p>
          )}
        </header>

        {/* Game content — client component with realtime */}
        <ViewerRealtimeWrapper initialSnapshot={snapshot} />

        {/* Footer */}
        <ViewerFooter />
      </div>
    </main>
  );
}
