import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";
import { slugify } from "@/lib/category-data";

export const dynamic = "force-dynamic";

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

  const raw = (body ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if ("name" in raw) {
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if ("slug" in raw && typeof raw.slug === "string" && raw.slug.trim()) {
    data.slug = slugify(raw.slug);
  }
  if ("description" in raw) {
    data.description =
      typeof raw.description === "string" && raw.description.trim()
        ? raw.description.trim()
        : null;
  }
  if ("sortOrder" in raw && typeof raw.sortOrder === "number") {
    data.sortOrder = raw.sortOrder;
  }

  try {
    const category = await prisma.category.update({ where: { id }, data });
    return NextResponse.json({ category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
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
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
