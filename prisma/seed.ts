// Seed script — run via: npx prisma db seed
// Upserts baseline PlatformConfig records.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  await prisma.platformConfig.upsert({
    where: { key: "platformFeePercent" },
    update: {},
    create: { key: "platformFeePercent", value: "18" },
  });

  console.log("Seeded PlatformConfig: platformFeePercent = 18");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
