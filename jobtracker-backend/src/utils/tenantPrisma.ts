import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const tenantMap = new Map<string, PrismaClient>();

export async function getTenantPrisma(dbUrl: string) {
  if (tenantMap.has(dbUrl)) {
    return tenantMap.get(dbUrl)!;
  }

  const pool = new Pool({
    connectionString: dbUrl,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log("✅ Tenant database connected successfully");
  } catch (error) {
    console.error("❌ Tenant database connection failed:", error);
    throw error;
  }

  tenantMap.set(dbUrl, prisma);
  return prisma;
}
