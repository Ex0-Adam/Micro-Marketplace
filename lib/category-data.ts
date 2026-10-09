import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/product-data";

export const PUBLIC_CATEGORY_SELECT = {
  name: true,
  slug: true,
  description: true,
} as const;

export async function listPublicCategories() {
  return prisma.category.findMany({
    select: {
      ...PUBLIC_CATEGORY_SELECT,
      _count: { select: { products: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

export { slugify };
