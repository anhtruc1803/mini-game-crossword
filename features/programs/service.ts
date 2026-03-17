/**
 * Programs — business logic / orchestration.
 * Service layer sits between UI and data access.
 */

import { createProgramSchema, updateProgramSchema } from "./schemas";
import type { CreateProgramInput, UpdateProgramInput } from "./schemas";
import type { Program, ProgramStatus } from "./types";
import { getProgramById } from "./queries";
import { AppError } from "@/lib/security/errors";
import {
  insertProgram,
  updateProgramById,
  updateProgramStatus,
  updateProgramTheme,
  deleteProgramById,
} from "./mutations";

const VALID_PROGRAM_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
  draft: ["live"],
  live: ["ended"],
  ended: ["draft"],
};

export async function createProgram(input: CreateProgramInput): Promise<Program> {
  const validated = createProgramSchema.parse(input);
  return insertProgram(validated);
}

export async function updateProgram(
  id: string,
  input: UpdateProgramInput
): Promise<Program> {
  const validated = updateProgramSchema.parse(input);
  return updateProgramById(id, validated);
}

export async function changeProgramStatus(
  id: string,
  newStatus: ProgramStatus
): Promise<Program> {
  const program = await getProgramById(id);
  if (!program) throw new AppError("Program not found", "program_not_found", 404);

  const allowed = VALID_PROGRAM_TRANSITIONS[program.status];
  if (!allowed?.includes(newStatus)) {
    throw new AppError(
      `Cannot transition program from "${program.status}" to "${newStatus}"`
    );
  }

  return updateProgramStatus(id, newStatus);
}

export async function setProgramTheme(
  id: string,
  themeId: string | null
): Promise<Program> {
  return updateProgramTheme(id, themeId);
}

export async function deleteProgram(id: string): Promise<void> {
  const program = await getProgramById(id);
  if (!program) throw new AppError("Program not found", "program_not_found", 404);

  // Business rule: cannot delete a live program
  if (program.status === "live") {
    throw new AppError("Cannot delete a live program. End it first.");
  }

  return deleteProgramById(id);
}
