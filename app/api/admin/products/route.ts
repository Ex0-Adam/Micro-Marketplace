import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardApiSession } from "@/lib/security/api-policy";
import { listProductsForAdmin } from "@/lib/product-data";
import { parseProductInput } from "@/lib/product-input";
import { normalizeScreenshots, normalizeVersions } from "@/lib/product-nested";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guardApiSession();
  if (denied) return denied;

  const products = await listProductsForAdmin();
  return NextResponse.json({ products });
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

  const { data, errors } = parseProductInput(body, { partial: false });
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  try {
    const product = await prisma.product.create({
      data: {
        slug: data.slug as string,
        name: data.name as string,
        tagline: data.tagline ?? null,
        description: data.description ?? null,
        kind: data.kind ?? "module",
        priceCents: data.priceCents ?? 0,
        currency: data.currency ?? "THB",
        repoUrl: data.repoUrl ?? null,
        releaseUrl: data.releaseUrl ?? null,
        demoUrl: data.demoUrl ?? null,
        docsUrl: data.docsUrl ?? null,
        coverImage: data.coverImage ?? null,
        authorName: data.authorName ?? null,
        authorUrl: data.authorUrl ?? null,
        license: data.license ?? null,
        latestVersion: data.latestVersion ?? null,
        minCmsVersion: data.minCmsVersion ?? null,
        isPublished: data.isPublished ?? false,
        isFeatured: data.isFeatured ?? false,
        categoryId: data.categoryId ?? null,
        tags: data.tags ?? [],
        screenshots: { create: normalizeScreenshots(raw.screenshots) },
        versions: { create: normalizeVersions(raw.versions) },
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
