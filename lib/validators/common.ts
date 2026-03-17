import { z } from "zod";

/** Common reusable Zod schemas. */

export const uuidSchema = z.string().uuid("ID không hợp lệ");

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
