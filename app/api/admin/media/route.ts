import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guardApiSession();
  if (denied) return denied;

  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ media });
}
