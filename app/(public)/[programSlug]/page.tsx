import Image from "next/image";
import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ResilientImage } from "@/components/shared/resilient-image";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ViewerFooter } from "@/components/shared/viewer-footer";
import { BirthdayEffects } from "@/components/viewer/birthday-effects";
import { ViewerRealtimeWrapper } from "@/components/viewer/viewer-realtime-wrapper";
import { getViewerSnapshot } from "@/features/viewer/queries";
import { vi } from "@/lib/i18n/locales/vi";

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
  const normalizedBirthdaySignal = birthdaySignal.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const isBirthdayProgram =
    normalizedBirthdaySignal.includes("sinh nhat") || birthdaySignal.includes("birthday");

  const themeStyle: React.CSSProperties = theme
    ? ({
        "--primary": theme.primaryColor,
        "--secondary": theme.secondaryColor,
        "--accent": theme.accentColor,
      } as React.CSSProperties)
    : {};

  return (
    <main className="relative min-h-screen overflow-hidden" style={themeStyle}>
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

      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.62),rgba(11,18,32,0.9))]" />
      <div className="pointer-events-none fixed inset-0 grid-paper opacity-[0.05]" />
      <div className="pointer-events-none fixed -left-32 top-12 h-80 w-80 rounded-full bg-[var(--celebration)]/18 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-0 h-96 w-96 rounded-full bg-[var(--accent)]/12 blur-3xl" />
      <div className="pointer-events-none fixed right-[12%] top-[20%] h-72 w-72 rounded-full bg-[var(--secondary)]/14 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header className="glass-panel relative mb-8 overflow-hidden rounded-[32px] p-5 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),linear-gradient(135deg,rgba(251,191,36,0.06),transparent_55%)]" />

          <div className="relative flex justify-end gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          <div className="relative grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="glass-pill inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
                  {t.common.appName}
                </span>
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

              <p className="max-w-2xl text-sm leading-7 text-white/64 sm:text-base">
                {snapshot.game?.subtitle ?? t.viewer.boardSubtitle}
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[var(--accent)]/16 bg-[linear-gradient(180deg,rgba(251,191,36,0.06),rgba(251,113,133,0.04))] p-3 shadow-[0_0_0_1px_rgba(251,113,133,0.06),0_24px_50px_rgba(2,6,23,0.24)]">
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
