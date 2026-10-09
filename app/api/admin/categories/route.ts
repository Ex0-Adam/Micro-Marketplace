import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";
import { listCategoriesForAdmin, slugify } from "@/lib/category-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guardApiSession();
  if (denied) return denied;

  const categories = await listCategoriesForAdmin();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const denied = await guardApiSession();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug =
    typeof raw.slug === "string" && raw.slug.trim() ? slugify(raw.slug) : slugify(name);

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description:
          typeof raw.description === "string" && raw.description.trim()
            ? raw.description.trim()
            : null,
        sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : 0,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
