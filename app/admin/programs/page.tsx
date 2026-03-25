import { listPrograms } from "@/features/programs/queries";
import { listProgramAnalytics } from "@/features/analytics/queries";
import { ProgramsListClient } from "@/components/admin/programs-list-client";

export default async function ProgramsListPage() {
  const programs = await listPrograms();
  const analyticsByProgramId = await listProgramAnalytics(programs.map((program) => program.id));

  return <ProgramsListClient programs={programs} analyticsByProgramId={analyticsByProgramId} />;
}
