import { notFound } from "next/navigation";
import { getProgramById } from "@/features/programs/queries";
import { getThemeById } from "@/features/themes/queries";
import { ThemePageClient } from "@/components/admin/theme-page-client";

interface ThemePageProps {
  params: Promise<{ programId: string }>;
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { programId } = await params;
  const program = await getProgramById(programId);
  if (!program) notFound();

  const theme = program.themeId ? await getThemeById(program.themeId) : null;

  return <ThemePageClient program={program} theme={theme} />;
}
