import { globalPrisma } from "../prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function createTenantPrisma(dbUrl: string) {
  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();
  return prisma;
}

async function migrateTenant(prisma: PrismaClient, tenantSlug: string) {
  console.log(`\n🚀 Migrating tenant: ${tenantSlug}`);

  // 🔍 Step 1 — Check if already partitioned
  const result: any = await prisma.$queryRawUnsafe(`
    SELECT relispartition
    FROM pg_class
    WHERE relname = 'Application'
    LIMIT 1;
  `);

  if (result.length && result[0].relispartition === false) {
    console.log("⚠️ Application exists but not partitioned. Migrating...");

    // Step 2 — Rename old table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Application" RENAME TO "Application_old";
    `);

    // Step 3 — Create partitioned parent
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Application" (
        "id" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        "jobId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        PRIMARY KEY ("id", "createdAt")
      ) PARTITION BY RANGE ("createdAt");
    `);

    // Step 4 — Default partition (IMPORTANT)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Application_default"
      PARTITION OF "Application" DEFAULT;
    `);

    // Step 5 — Detect data range
    const range: any = await prisma.$queryRawUnsafe(`
      SELECT 
        MIN("createdAt") AS min_date,
        MAX("createdAt") AS max_date
      FROM "Application_old";
    `);

    const minDate = new Date(range[0].min_date);
    const maxDate = new Date(range[0].max_date);

    console.log(`📊 Data range: ${minDate} → ${maxDate}`);

    // Step 6 — Create partitions dynamically
    let current = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1));

    while (current <= maxDate) {
      const next = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1));

      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, "0");

      const tableName = `Application_${year}_${month}`;

      console.log(`📦 Creating partition: ${tableName}`);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${tableName}"
        PARTITION OF "Application"
        FOR VALUES FROM ('${current.toISOString()}') TO ('${next.toISOString()}');
      `);

      current = next;
    }

    // Step 7 — Move data
    console.log("📥 Moving data...");

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Application" ("id", "createdAt", "userId", "jobId", "status")
      SELECT "id", "createdAt", "userId", "jobId", "status"
      FROM "Application_old";
    `);

    // Step 8 — Drop old table
    await prisma.$executeRawUnsafe(`
      DROP TABLE "Application_old";
    `);

    console.log(`✅ Migration complete for ${tenantSlug}`);
  } else {
    console.log("✅ Already partitioned, skipping...");
  }
}

async function main() {
  const tenants = await globalPrisma.tenant.findMany();

  for (const tenant of tenants) {
    try {
      const prisma = await createTenantPrisma(tenant.dbUrl);
      await migrateTenant(prisma, tenant.slug);
      await prisma.$disconnect();
    } catch (err) {
      console.error(`❌ Failed for tenant ${tenant.slug}:`, err);
    }
  }

  console.log("\n🎉 All tenants processed!");
  process.exit(0);
}

main();