import { Request, Response } from "express";
import { success } from "../utils/response";
// import { prisma } from "../prisma"

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log("📝 Creating user with email:", email);
    console.log("📝 Tenant slug:", req.tenantSlug);

    const prisma = req.tenantPrisma;

    if (!prisma) {
      console.error("❌ Tenant Prisma not found");
      return res.status(500).json({
        success: false,
        error: "Tenant database connection failed",
      });
    }

    const user = await prisma.user.create({
      data: { email },
    });
    console.log("✅ User created:", user);

    success(res, user);
  } catch (error: any) {
    console.error("❌ FULL ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create user",
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    console.log("📖 Fetching users");
    console.log("📖 Tenant slug:", req.tenantSlug);

    const prisma = req.tenantPrisma;

    if (!prisma) {
      console.error("❌ Tenant Prisma not found");
      return res.status(500).json({
        success: false,
        error: "Tenant database connection failed",
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    console.log("✅ Users fetched:", users.length);
    success(res, users);
  } catch (error: any) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch users",
    });
  }
};
