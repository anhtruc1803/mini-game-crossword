import { notFound } from "next/navigation";
import { getViewerSnapshot } from "@/features/viewer/queries";
import { ViewerRealtimeWrapper } from "@/components/viewer/viewer-realtime-wrapper";
import { ViewerFooter } from "@/components/shared/viewer-footer";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ResilientImage } from "@/components/shared/resilient-image";
import { vi } from "@/lib/i18n/locales/vi";
import { BirthdayEffects } from "@/components/viewer/birthday-effects";
import { PointerGlow } from "@/components/viewer/pointer-glow";

interface ViewerPageProps {
  params: Promise<{ programSlug: string }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { programSlug } = await params;
  const snapshot = await getViewerSnapshot(programSlug);
  const t = vi;

  if (!snapshot) notFound();

  const { program, theme } = snapshot;
  const birthdaySignal = `${program.title} ${program.slug} ${program.description ?? ""}`.toLowerCase();
  const isBirthdayProgram =
    birthdaySignal.includes("sinh nhật") ||
    birthdaySignal.includes("sinh nhat") ||
    birthdaySignal.includes("birthday");

  const themeStyle: React.CSSProperties = theme
    ? ({
        "--primary": theme.primaryColor,
        "--secondary": theme.secondaryColor,
        "--accent": theme.accentColor,
      } as React.CSSProperties)
    : {};

  return (
    <main className="relative min-h-screen overflow-hidden" style={themeStyle}>
      <PointerGlow />
      <BirthdayEffects enabled={isBirthdayProgram} />
      {theme?.desktopBgUrl && (
        <div
          className="fixed inset-0 hidden bg-cover bg-center bg-no-repeat opacity-35 md:block"
          style={{ backgroundImage: `url(${theme.desktopBgUrl})` }}
        />
      )}
      {theme?.mobileBgUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30 md:hidden"
          style={{ backgroundImage: `url(${theme.mobileBgUrl})` }}
        />
      )}

      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.68),rgba(7,17,31,0.88))]" />
      <div className="pointer-events-none fixed inset-0 broadcast-grid opacity-[0.08]" />
      <div className="pointer-events-none fixed -left-32 top-12 h-80 w-80 rounded-full bg-[var(--primary)]/20 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-0 h-96 w-96 rounded-full bg-[var(--secondary)]/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header className="glass-panel relative mb-8 overflow-hidden rounded-[32px] p-5 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_55%)]" />

          <div className="relative flex justify-end">
            <LanguageSwitcher />
          </div>

          <div className="relative grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="glass-pill inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
                  {t.common.appName}
                </span>
                {theme?.logoUrl && (
                  <div className="glass-pill h-12 w-28 overflow-hidden rounded-2xl p-2">
                    <ResilientImage
                      src={theme.logoUrl}
                      alt="Logo chương trình"
                      fallbackLabel={program.title}
                      loading="eager"
                      imgClassName="object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {program.title}
                </h1>
                {program.description && (
                  <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                    {program.description}
                  </p>
                )}
              </div>

              {theme?.bannerUrl && (
                <div className="glass-panel-soft max-w-3xl overflow-hidden rounded-3xl p-2">
                  <div className="h-24 overflow-hidden rounded-[20px] sm:h-28">
                    <ResilientImage
                      src={theme.bannerUrl}
                      alt={`${program.title} banner`}
                      fallbackLabel={program.title}
                      loading="eager"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel-soft overflow-hidden rounded-[28px] p-3">
              <div className="relative h-[260px] overflow-hidden rounded-[22px] sm:h-[320px] lg:h-[380px]">
                <ResilientImage
                  src={program.imageUrl}
                  alt={program.title}
                  fallbackLabel={program.title}
                  loading="eager"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(4,10,20,0.88))]" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-sm uppercase tracking-[0.26em] text-white/55">
                    {t.viewer.boardTitle}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                    {program.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <ViewerRealtimeWrapper initialSnapshot={snapshot} />
        <ViewerFooter />
      </div>
    </main>
  );
}
