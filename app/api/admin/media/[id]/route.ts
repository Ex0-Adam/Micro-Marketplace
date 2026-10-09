import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";
import { getStorageAdapter } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guardApiSession();
  if (denied) return denied;

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const adapter = getStorageAdapter();
    await adapter.remove({ key: media.storageKey, url: media.url });
  } catch {
    // Storage removal is best-effort; the DB row still gets cleaned up.
  }

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
