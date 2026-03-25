import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getProgramById } from "@/features/programs/queries";
import { getGameByProgramId } from "@/features/games/queries";
import { getProgramAnalytics } from "@/features/analytics/queries";
import { ProgramDetailClient } from "@/components/admin/program-detail-client";

interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { programId } = await params;
  const program = await getProgramById(programId);
  if (!program) notFound();

  const [game, analytics] = await Promise.all([
    getGameByProgramId(programId),
    getProgramAnalytics(programId),
  ]);
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = (forwardedHost ?? requestHeaders.get("host") ?? "").split(",")[0]?.trim();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol = (forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http"))
    .split(",")[0]
    ?.trim();
  const viewerOrigin = host ? `${protocol}://${host}` : null;

  return (
    <ProgramDetailClient
      program={program}
      game={game}
      analytics={analytics}
      viewerOrigin={viewerOrigin}
    />
  );
}
