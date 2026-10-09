import { NextResponse } from "next/server";
import { getDatabaseBootstrapStatus } from "@/lib/system/database-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getDatabaseBootstrapStatus();
  return NextResponse.json({ status });
}
