import { notFound } from "next/navigation";
import { getProgramById } from "@/features/programs/queries";
import { getGameByProgramId } from "@/features/games/queries";
import { ProgramDetailClient } from "@/components/admin/program-detail-client";

interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { programId } = await params;
  const program = await getProgramById(programId);
  if (!program) notFound();

  const game = await getGameByProgramId(programId);

  return <ProgramDetailClient program={program} game={game} />;
}
