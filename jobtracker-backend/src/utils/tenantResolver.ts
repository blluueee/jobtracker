import { globalPrisma } from "../prisma";
import { getTenantPrisma } from "./tenantPrisma";

export async function resolveTenant(tenantSlug: string) {
  const tenant = await globalPrisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) throw new Error("Tenant not found");
console.log("👉 DB URL:", tenant.dbUrl);
  return await getTenantPrisma(tenant.dbUrl);
}