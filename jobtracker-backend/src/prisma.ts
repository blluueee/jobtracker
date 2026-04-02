import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
//  console.log("DATABASE_URL:", process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// export const connectDatabase = async () => {
//   try {
//     await prisma.$connect();
//     console.log("✅ Database connected successfully");
//   } catch (error) {
//     console.error("❌ Database connection failed:", error);
//     process.exit(1);
//   }
// };
declare global {
  var globalPrisma: PrismaClient | undefined;
}

const globalAdapter = new PrismaPg(
  new Pool({
    connectionString: process.env.GLOBAL_DATABASE_URL!,
  }),
);

export const globalPrisma =
  global.globalPrisma || new PrismaClient({ adapter: globalAdapter });

if (process.env.NODE_ENV !== "development") {
  global.globalPrisma = globalPrisma;
}
