import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const checks = {
    env: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    database: false,
  };

  try {
    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("programs")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    checks.database = !error;
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
