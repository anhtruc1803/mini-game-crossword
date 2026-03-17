import { notFound } from "next/navigation";
import { getProgramById } from "@/features/programs/queries";
import { getGameByProgramId, getGameRows } from "@/features/games/queries";
import { RowsPageClient } from "@/components/admin/rows-page-client";

interface RowsPageProps {
  params: Promise<{ programId: string }>;
}

export default async function RowsManagementPage({ params }: RowsPageProps) {
  const { programId } = await params;
  const program = await getProgramById(programId);
  if (!program) notFound();

  const game = await getGameByProgramId(programId);
  const rows = game ? await getGameRows(game.id) : [];

  return <RowsPageClient program={program} game={game} rows={rows} />;
}
