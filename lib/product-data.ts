import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PRODUCT_KINDS = ["module", "template", "theme"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

/**
 * Field whitelist for the public read API. This is the disclosure boundary —
 * public endpoints must always select through it (never `include: true`).
 */
export const PUBLIC_PRODUCT_SELECT = {
  slug: true,
  name: true,
  tagline: true,
  description: true,
  kind: true,
  priceCents: true,
  currency: true,
  repoUrl: true,
  releaseUrl: true,
  demoUrl: true,
  docsUrl: true,
  coverImage: true,
  authorName: true,
  authorUrl: true,
  license: true,
  latestVersion: true,
  minCmsVersion: true,
  tags: true,
  updatedAt: true,
  category: { select: { name: true, slug: true } },
  screenshots: {
    select: { url: true, caption: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  },
  versions: {
    select: {
      version: true,
      releaseUrl: true,
      changelog: true,
      minCmsVersion: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  },
} satisfies Prisma.ProductSelect;

export type PublicProduct = Prisma.ProductGetPayload<{
  select: typeof PUBLIC_PRODUCT_SELECT;
}>;

export type ProductFilters = {
  kind?: string | null;
  kinds?: string[] | null;
  category?: string | null;
  q?: string | null;
  featured?: boolean;
};

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isPublished: true };

  if (filters.kind && (PRODUCT_KINDS as readonly string[]).includes(filters.kind)) {
    where.kind = filters.kind;
  }
  if (filters.kinds && filters.kinds.length > 0) {
    where.kind = {
      in: filters.kinds.filter((k) => (PRODUCT_KINDS as readonly string[]).includes(k)),
    };
  }
  if (filters.category) {
    where.category = { slug: filters.category };
  }
  if (filters.featured) {
    where.isFeatured = true;
  }
  if (filters.q) {
    const q = filters.q.trim();
    if (q.length > 0) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ];
    }
  }

  return where;
}

export async function listPublicProducts(filters: ProductFilters = {}) {
  return prisma.product.findMany({
    where: buildWhere(filters),
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getPublicProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isPublished: true },
    select: PUBLIC_PRODUCT_SELECT,
  });
}

export async function listProductsForAdmin() {
  return prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { versions: true, screenshots: true } },
    },
  });
}

export async function getProductForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      screenshots: { orderBy: { sortOrder: "asc" } },
      versions: { orderBy: { publishedAt: "desc" } },
    },
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
