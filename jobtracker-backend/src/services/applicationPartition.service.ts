import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

function startOfMonthUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

function addMonthsUTC(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, 0, 0, 0));
}

function partitionName(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `Application_${y}_${m}`;
}

async function createPartition(prisma: PrismaClient, start: Date) {
  const end = addMonthsUTC(start, 1);
  const name = partitionName(start);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${name}"
    PARTITION OF "Application"
    FOR VALUES FROM ('${start.toISOString()}') TO ('${end.toISOString()}');
  `);
}

async function ensureRollingPartitions(prisma: PrismaClient, monthsAhead = 3, monthsBehind = 2) {
  const current = startOfMonthUTC(new Date());

  for (let i = -monthsBehind; i <= monthsAhead; i++) {
    const monthStart = addMonthsUTC(current, i);
    await createPartition(prisma, monthStart);
  }
}

async function dropOldPartitions(prisma: PrismaClient, retainMonths = 12) {
  const current = startOfMonthUTC(new Date());
  const cutoff = addMonthsUTC(current, -retainMonths);

  const rows = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename ~ '^Application_[0-9]{4}_[0-9]{2}$'
  `);

  for (const row of rows) {
    const match = row.tablename.match(/^Application_(\d{4})_(\d{2})$/);
    if (!match) continue;

    const [, year, month] = match;
    const monthStart = new Date(Date.UTC(Number(year), Number(month) - 1, 1, 0, 0, 0));

    if (monthStart < cutoff) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE;`);
    }
  }
}

export async function initApplicationPartitionMaintenance(prisma: PrismaClient) {
  await ensureRollingPartitions(prisma);
  console.log("🔥 Running partition creation...");

  cron.schedule("* * * * *", async () => {
    try {
      await ensureRollingPartitions(prisma);
      await dropOldPartitions(prisma, 12);
      console.log("Application partition maintenance complete");
    } catch (err) {
      console.error("Application partition maintenance failed:", err);
    }
  });
}