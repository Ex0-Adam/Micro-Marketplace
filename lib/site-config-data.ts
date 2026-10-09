import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

export async function getSiteConfig() {
  return prisma.siteConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}
