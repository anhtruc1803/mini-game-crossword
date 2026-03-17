import { listPrograms } from "@/features/programs/queries";
import { ProgramsListClient } from "@/components/admin/programs-list-client";

export default async function ProgramsListPage() {
  const programs = await listPrograms();

  return <ProgramsListClient programs={programs} />;
}
