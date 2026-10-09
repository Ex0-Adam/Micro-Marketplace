import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";
import { getSiteConfig } from "@/lib/site-config-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guardApiSession();
  if (denied) return denied;

  const config = await getSiteConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  const denied = await guardApiSession();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if ("siteName" in raw && typeof raw.siteName === "string" && raw.siteName.trim()) {
    data.siteName = raw.siteName.trim();
  }
  if ("siteDescription" in raw) {
    data.siteDescription =
      typeof raw.siteDescription === "string" && raw.siteDescription.trim()
        ? raw.siteDescription.trim()
        : null;
  }
  if ("logoUrl" in raw) {
    data.logoUrl =
      typeof raw.logoUrl === "string" && raw.logoUrl.trim() ? raw.logoUrl.trim() : null;
  }
  if ("supportEmail" in raw) {
    data.supportEmail =
      typeof raw.supportEmail === "string" && raw.supportEmail.trim()
        ? raw.supportEmail.trim()
        : null;
  }

  const config = await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return NextResponse.json({ config });
}
