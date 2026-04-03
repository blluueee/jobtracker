import { Request, Response } from "express";
import { globalPrisma } from "../prisma";
import { execSync } from "child_process";

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const dbName = `jobtracker_${slug}`;

    const dbUrl = `postgresql://postgres:post39@localhost:5432/${dbName}`;

    const existing = await globalPrisma.tenant.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({ error: "Tenant already exists" });
    }
    console.log("🚀 Creating tenant:", slug);

    // 1️⃣ Create database
    await globalPrisma.$executeRawUnsafe(`CREATE DATABASE "${dbName}";`);

    console.log("✅ Database created:", dbName);

    // 2️⃣ Run migration
    execSync(`npx prisma migrate deploy`, {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
      },
    });

    console.log("✅ Migration applied");

    // 3️⃣ Save tenant
    const tenant = await globalPrisma.tenant.create({
      data: {
        name,
        slug,
        dbUrl,
      },
    });

    res.json({
      success: true,
      data: tenant,
    });
  } catch (error: any) {
    console.error("❌ Tenant creation failed:", error);

    res.status(500).json({
      error: "Tenant creation failed",
      details: error.message,
    });
  }
};

export const getTenants = async (_req: Request, res: Response) => {
  try {
    const tenants = await globalPrisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    res.json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
};
