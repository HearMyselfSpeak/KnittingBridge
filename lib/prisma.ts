// Lazy-loaded Prisma client singleton.
// IMPORTANT: Never import prisma at the top level of API route files.
// All API routes must export: export const dynamic = 'force-dynamic'
// Then import lazily:  const { prisma } = await import('@/lib/prisma')

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  // Pass PoolConfig directly to avoid @types/pg version conflicts
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
