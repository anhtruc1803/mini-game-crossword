import { z } from "zod";

export const PROGRAM_STATUSES = ["draft", "live", "ended"] as const;

const isoDatetimeSchema = z.string().datetime();
const programImageSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((value) => value.startsWith("/uploads/programs/") || value.startsWith("/media/programs/"), {
    message: "Program image must come from the local media path",
  });

export const createProgramSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
    description: z.string().trim().max(1000).optional(),
    imageUrl: programImageSchema.optional(),
    startAt: isoDatetimeSchema.optional(),
    endAt: isoDatetimeSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startAt && data.endAt && new Date(data.endAt) <= new Date(data.startAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endAt must be after startAt",
        path: ["endAt"],
      });
    }
  });

export const updateProgramSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().trim().max(1000).optional(),
    imageUrl: programImageSchema.nullable().optional(),
    startAt: isoDatetimeSchema.optional(),
    endAt: isoDatetimeSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startAt && data.endAt && new Date(data.endAt) <= new Date(data.startAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endAt must be after startAt",
        path: ["endAt"],
      });
    }
  });

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
