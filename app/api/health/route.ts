import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const checks = {
    env: Boolean(process.env.DATABASE_URL),
    database: false,
  };

  try {
    // Simple connectivity check
    await prisma.program.count();
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const healthy = checks.env && checks.database;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
