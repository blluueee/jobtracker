import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function randomDateInMonth(year: number, monthZeroBased: number) {
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(Date.UTC(year, monthZeroBased, day, 12, 0, 0));
}

async function main() {
  const user = await prisma.user.findFirst();
  const job = await prisma.job.findFirst();

  if (!user || !job) throw new Error("Need at least one user and one job");

  for (let i = 0; i < 10000; i++) {
    const id = randomUUID();
    const createdAt = randomDateInMonth(2026, i % 6);

    await prisma.$transaction(async (tx) => {
      await tx.applicationKey.create({
        data: { id, createdAt },
      });

      await tx.application.create({
        data: {
          id,
          createdAt,
          userId: user.id,
          jobId: job.id,
          status: "APPLIED",
        },
      });
    });
  }
}

main().finally(() => prisma.$disconnect());