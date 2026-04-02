import { Request, Response } from "express";
import { success, error } from "../utils/response";
// import { prisma } from "../prisma"
// CREATE
export const createApplication = async (req: Request, res: Response) => {
  try {
    const { userId, jobId } = req.body;
    const prisma = req.tenantPrisma;
console.log("📌 Applying:", { userId, jobId });
console.log("📌 Tenant:", req.tenantSlug);
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
      data: {
        userId,
        jobId,
        status: "APPLIED",
      },
    });

    //  await tx.job.update({
    //     where: { id: jobId },
    //     data: {
    //       applicationCount: {
    //         increment: 1,
    //       },
    //     },
    //   });

      return application
    })
    success(res, result);
  } catch (err: any) {
  console.error("🔥 FULL BACKEND ERROR:", err);

  if (err.code === "P2002") {
    return res.status(400).json({
      error: "You have already applied to this job",
    });
  }

  return res.status(500).json({
    error: "Transaction failed",
    details: err.message,
  });
}

    res.status(500).json({ error: "Transaction failed" });
  };

export const getApplications = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const { status, userId, jobId } = req.query;
    const prisma = req.tenantPrisma

    const where: any = {};
    if (status) where.status = String(status);
    if (userId) where.userId = String(userId);
    if (jobId) where.jobId = String(jobId);

    const applications = await prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        jobId: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            // company: {
            //   select: {
            //     id: true,
            //     name: true,
            //   },
            // },
          },
        },
      },
    });

    const total = await prisma.application.count({ where });

    return success(res, applications, {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Fetch failed" });
  }
};

// UPDATE
export const updateApplication = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const prisma = req.tenantPrisma

    console.log("📌 UPDATE REQUEST:", { id, status });
    console.log("📌 Tenant:", req.tenantSlug);

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });

    success(res,updated);
  } catch (error: any) {
  console.error("❌ UPDATE APPLICATION ERROR:", error);

  res.status(500).json({
    message: "Update failed",
    error: error.message,
  });
}
};

// DELETE
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const prisma = req.tenantPrisma

    await prisma.application.delete({
      where: { id },
    });

    success(res, null, { message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};