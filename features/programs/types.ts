/** Domain types for programs. */

export type ProgramStatus = "draft" | "live" | "ended";

export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: ProgramStatus;
  startAt: string | null;
  endAt: string | null;
  themeId: string | null;
  createdAt: string;
  updatedAt: string;
}
