import { prisma } from "@/lib/prisma";

export async function getAdminDashboardData() {
  const [productCount, publishedCount, categoryCount, mediaCount, latestProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.category.count(),
      prisma.media.count(),
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          kind: true,
          isPublished: true,
          updatedAt: true,
        },
      }),
    ]);

  return { productCount, publishedCount, categoryCount, mediaCount, latestProducts };
}
