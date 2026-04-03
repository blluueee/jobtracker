import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { initApplicationPartitionMaintenance } from "../services/applicationPartition.service";

const tenantMap = new Map<string, PrismaClient>();

export async function getTenantPrisma(dbUrl: string) {
  if (tenantMap.has(dbUrl)) {
  const prisma = tenantMap.get(dbUrl)!;

  try {
  await initApplicationPartitionMaintenance(prisma);
} catch (err: any) {
  if (err.message.includes("not partitioned")) {
    console.warn("⚠️ Skipping partition init (not partitioned yet)");
  } else {
    throw err;
  }
}

  return prisma;
}

  const pool = new Pool({
    connectionString: dbUrl,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log("✅ Tenant database connected successfully");
    await initApplicationPartitionMaintenance(prisma);
  } catch (error) {
    console.error("❌ Tenant database connection failed:", error);
    throw error;
  }

  tenantMap.set(dbUrl, prisma);
  return prisma;
}
