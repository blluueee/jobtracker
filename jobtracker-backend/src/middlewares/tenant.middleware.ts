import { Request, Response, NextFunction } from "express";
import { resolveTenant } from "../utils/tenantResolver";

declare global {
  namespace Express {
    interface Request {
      tenantPrisma?: any;
      tenantSlug?: string;
    }
  }
}

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantSlug = req.header("x-tenant-slug");
    console.log("🔍 Tenant header received:", tenantSlug);

    if (!tenantSlug) {
      console.error("❌ No tenant slug provided");
      return res.status(400).json({
        success: false,
        error: "Missing x-tenant-slug header",
      });
    }

    const prisma = await resolveTenant(tenantSlug);

    req.tenantPrisma = prisma;
    req.tenantSlug = tenantSlug;

    console.log("✅ Tenant resolved successfully:", tenantSlug);
    next();
  } catch (err: any) {
    console.error("❌ Tenant resolution error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to resolve tenant",
    });
  }
};
