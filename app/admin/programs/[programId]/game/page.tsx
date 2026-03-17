import { notFound } from "next/navigation";
import { getProgramById } from "@/features/programs/queries";
import { getGameByProgramId, getGameRows, getGameEvents } from "@/features/games/queries";
import { GameControlClient } from "@/components/admin/game-control-client";

interface GameControlPageProps {
  params: Promise<{ programId: string }>;
}

export default async function GameControlPage({ params }: GameControlPageProps) {
  const { programId } = await params;
  const program = await getProgramById(programId);
  if (!program) notFound();

  const game = await getGameByProgramId(programId);
  const rows = game ? await getGameRows(game.id) : [];
  const events = game ? await getGameEvents(game.id, 20) : [];

  return <GameControlClient program={program} game={game} rows={rows} events={events} />;
}
