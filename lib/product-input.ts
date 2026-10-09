import { PRODUCT_KINDS, slugify } from "@/lib/product-data";

export type ProductInput = {
  name?: string;
  slug?: string;
  tagline?: string | null;
  description?: string | null;
  kind?: string;
  priceCents?: number;
  currency?: string;
  repoUrl?: string | null;
  releaseUrl?: string | null;
  demoUrl?: string | null;
  docsUrl?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  authorUrl?: string | null;
  license?: string | null;
  latestVersion?: string | null;
  minCmsVersion?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  categoryId?: string | null;
  tags?: string[];
};

function str(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseProductInput(
  body: unknown,
  { partial }: { partial: boolean }
): { data: ProductInput; errors: string[] } {
  const errors: string[] = [];
  if (!body || typeof body !== "object") {
    return { data: {}, errors: ["Invalid request body"] };
  }
  const raw = body as Record<string, unknown>;
  const data: ProductInput = {};

  const name = str(raw.name);
  if (name !== undefined) {
    if (name === null) {
      if (!partial) errors.push("name is required");
    } else {
      data.name = name;
    }
  } else if (!partial) {
    errors.push("name is required");
  }

  const slug = str(raw.slug);
  if (slug !== undefined) {
    data.slug = slug ? slugify(slug) : slug ?? undefined;
  }
  if (!partial && !slug && name) {
    data.slug = slugify(name);
  }
  if (!partial && !data.slug) {
    errors.push("slug could not be derived — provide a name or slug");
  }

  if ("tagline" in raw) data.tagline = str(raw.tagline) ?? null;
  if ("description" in raw) data.description = str(raw.description) ?? null;
  if ("repoUrl" in raw) data.repoUrl = str(raw.repoUrl) ?? null;
  if ("releaseUrl" in raw) data.releaseUrl = str(raw.releaseUrl) ?? null;
  if ("demoUrl" in raw) data.demoUrl = str(raw.demoUrl) ?? null;
  if ("docsUrl" in raw) data.docsUrl = str(raw.docsUrl) ?? null;
  if ("coverImage" in raw) data.coverImage = str(raw.coverImage) ?? null;
  if ("authorName" in raw) data.authorName = str(raw.authorName) ?? null;
  if ("authorUrl" in raw) data.authorUrl = str(raw.authorUrl) ?? null;
  if ("license" in raw) data.license = str(raw.license) ?? null;
  if ("latestVersion" in raw) data.latestVersion = str(raw.latestVersion) ?? null;
  if ("minCmsVersion" in raw) data.minCmsVersion = str(raw.minCmsVersion) ?? null;

  const kind = str(raw.kind);
  if (kind !== undefined && kind !== null) {
    if (!(PRODUCT_KINDS as readonly string[]).includes(kind)) {
      errors.push(`kind must be one of ${PRODUCT_KINDS.join(", ")}`);
    } else {
      data.kind = kind;
    }
  }

  if ("priceCents" in raw) {
    const n = Number(raw.priceCents);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      errors.push("priceCents must be a non-negative integer");
    } else {
      data.priceCents = n;
    }
  }

  const currency = str(raw.currency);
  if (currency !== undefined) data.currency = currency ?? undefined;

  if ("isPublished" in raw) data.isPublished = bool(raw.isPublished, false);
  if ("isFeatured" in raw) data.isFeatured = bool(raw.isFeatured, false);
  if ("categoryId" in raw) data.categoryId = str(raw.categoryId) ?? null;

  if ("tags" in raw) {
    if (Array.isArray(raw.tags)) {
      data.tags = raw.tags
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0);
    } else if (typeof raw.tags === "string") {
      data.tags = raw.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
  }

  return { data, errors };
}
