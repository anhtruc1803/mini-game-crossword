/**
 * Prisma client singleton.
 * In development, stores the client on `globalThis` to prevent
 * multiple instances during HMR. In production, creates a single instance.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaInitialized: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Enable WAL mode and busy timeout for better concurrent read/write on SQLite
if (!globalForPrisma.prismaInitialized) {
  globalForPrisma.prismaInitialized = true;
  prisma
    .$queryRawUnsafe("PRAGMA journal_mode=WAL;")
    .then(() => prisma.$queryRawUnsafe("PRAGMA busy_timeout=5000;"))
    .catch(() => {
      // Silently ignore — pragmas may fail in test environments
    });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
