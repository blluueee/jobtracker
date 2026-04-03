import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import applicationRoutes from "./routes/application.route";
import userRoutes from "./routes/user.route";
// import companyRoutes from "./routes/company.route";
import jobRoutes from "./routes/job.route";
import tenantRoutes from "./routes/tenant.route"
import { globalPrisma } from "./prisma";
import { getTenantPrisma } from "./utils/tenantPrisma"
const app = express();

(async () => {
  try {
    await globalPrisma.$connect();
    console.log("✅ Global database connected successfully");

    const tenants = await globalPrisma.tenant.findMany();

    for (const tenant of tenants) {
      console.log(`🚀 Initializing tenant: ${tenant.slug}`);
      await getTenantPrisma(tenant.dbUrl);
    }

  } catch (error) {
    console.error("❌ Global database connection failed:", error);
    process.exit(1);
  }
})();

app.use(cors());
app.use(express.json());

app.use("/tenants", tenantRoutes)
app.use("/users", userRoutes);
// app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});






// EXPLAIN (ANALYZE, BUFFERS)
// SELECT *
// FROM "Application"
// WHERE "createdAt" >= '2026-04-01'
//   AND "createdAt" < '2026-05-01'
//   AND "status" = 'APPLIED';


//   EXPLAIN (ANALYZE, BUFFERS)
// SELECT *
// FROM "Application"
// WHERE "status" = 'APPLIED';




// DO $$
// BEGIN
//   IF EXISTS (
//     SELECT 1 FROM information_schema.tables 
//     WHERE table_name = 'Application'
//   ) THEN
//     ALTER TABLE "Application" RENAME TO "Application_old";
//   END IF;
// END $$;

// -- =========================================
// -- 2️⃣ CREATE PARTITIONED PARENT TABLE
// -- =========================================
// CREATE TABLE "Application" (
//   "id" TEXT NOT NULL,
//   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   "userId" TEXT NOT NULL,
//   "jobId" TEXT NOT NULL,
//   "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',

//   CONSTRAINT "Application_pkey" PRIMARY KEY ("id", "createdAt"),

//   CONSTRAINT "Application_userId_fkey"
//     FOREIGN KEY ("userId") REFERENCES "User"("id")
//     ON DELETE CASCADE ON UPDATE CASCADE,

//   CONSTRAINT "Application_jobId_fkey"
//     FOREIGN KEY ("jobId") REFERENCES "Job"("id")
//     ON DELETE CASCADE ON UPDATE CASCADE
// ) PARTITION BY RANGE ("createdAt");

// -- =========================================
// -- 3️⃣ CREATE REGISTRY TABLE (FOR ID LOOKUP)
// -- =========================================
// CREATE TABLE IF NOT EXISTS "ApplicationKey" (
//   "id" TEXT PRIMARY KEY,
//   "createdAt" TIMESTAMP(3) NOT NULL
// );

// -- =========================================
// -- 4️⃣ CREATE MONTHLY PARTITIONS
// -- =========================================
// CREATE TABLE IF NOT EXISTS "Application_2026_04"
// PARTITION OF "Application"
// FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

// CREATE TABLE IF NOT EXISTS "Application_2026_05"
// PARTITION OF "Application"
// FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

// CREATE TABLE IF NOT EXISTS "Application_2026_06"
// PARTITION OF "Application"
// FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

// -- =========================================
// -- 5️⃣ DEFAULT PARTITION (VERY IMPORTANT)
// -- =========================================
// CREATE TABLE IF NOT EXISTS "Application_default"
// PARTITION OF "Application" DEFAULT;

// -- =========================================
// -- 6️⃣ INDEXES (ON PARENT TABLE)
// -- =========================================
// CREATE INDEX IF NOT EXISTS "Application_createdAt_idx"
// ON "Application" ("createdAt");

// CREATE INDEX IF NOT EXISTS "Application_status_createdAt_idx"
// ON "Application" ("status", "createdAt");

// CREATE INDEX IF NOT EXISTS "Application_jobId_createdAt_idx"
// ON "Application" ("jobId", "createdAt");

// CREATE INDEX IF NOT EXISTS "Application_userId_createdAt_idx"
// ON "Application" ("userId", "createdAt");

// -- =========================================
// -- 7️⃣ MIGRATE EXISTING DATA (IF ANY)
// -- =========================================
// DO $$
// BEGIN
//   IF EXISTS (
//     SELECT 1 FROM information_schema.tables 
//     WHERE table_name = 'Application_old'
//   ) THEN

//     INSERT INTO "Application" ("id", "createdAt", "userId", "jobId", "status")
//     SELECT "id", "createdAt", "userId", "jobId", "status"
//     FROM "Application_old";

//     INSERT INTO "ApplicationKey" ("id", "createdAt")
//     SELECT "id", "createdAt"
//     FROM "Application_old"
//     ON CONFLICT ("id") DO NOTHING;

//     -- =========================================
//     -- 8️⃣ DROP OLD TABLE (ONLY AFTER MIGRATION)
//     -- =========================================
//     DROP TABLE "Application_old";

//   END IF;
// END $$;