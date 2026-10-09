import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";
import { getProductForAdmin } from "@/lib/product-data";
import { parseProductInput } from "@/lib/product-input";
import { normalizeScreenshots, normalizeVersions } from "@/lib/product-nested";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guardApiSession();
  if (denied) return denied;

  const { id } = await params;
  const product = await getProductForAdmin(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guardApiSession();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, errors } = parseProductInput(body, { partial: true });
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const replaceScreenshots = Array.isArray(raw.screenshots);
  const replaceVersions = Array.isArray(raw.versions);

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(replaceScreenshots
          ? { screenshots: { deleteMany: {}, create: normalizeScreenshots(raw.screenshots) } }
          : {}),
        ...(replaceVersions
          ? { versions: { deleteMany: {}, create: normalizeVersions(raw.versions) } }
          : {}),
      },
    });
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guardApiSession();
  if (denied) return denied;

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
