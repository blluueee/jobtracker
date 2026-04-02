import dotenv from "dotenv";
dotenv.config();

import { execSync } from "child_process";
import { globalPrisma } from "../prisma";

async function migrateAllTenants() {
  try {
    console.log("🔍 Fetching all tenants from global database...");
    const tenants = await globalPrisma.tenant.findMany();

    if (tenants.length === 0) {
      console.log("⚠️  No tenants found in global database");
      return;
    }

    console.log(
      `\n📊 Found ${tenants.length} tenant(s). Starting migrations...\n`,
    );

    let successCount = 0;
    let failureCount = 0;

    for (const tenant of tenants) {
      console.log(`\n🔄 Migrating tenant: ${tenant.slug} (${tenant.id})`);
      console.log(`   Database: ${tenant.dbUrl}`);

      try {
        execSync("npx prisma migrate deploy", {
          stdio: "inherit",
          env: {
            ...process.env,
            DATABASE_URL: tenant.dbUrl,
          }, 
        });
        console.log(`✅ ${tenant.slug} migrated successfully`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Failed to migrate ${tenant.slug}:`, error.message);
        failureCount++;
      }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`📈 Migration Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📊 Total: ${tenants.length}`);
    console.log(`${"=".repeat(50)}\n`);

    if (failureCount > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Fatal error during migration:", error);
    process.exit(1);
  } finally {
    await globalPrisma.$disconnect();
  }
}

migrateAllTenants();
