import { Request, Response } from "express";
import { success } from "../utils/response";
// import { prisma } from "../prisma"

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    // const { title, companyId } = req.body;
    const prisma = req.tenantPrisma;

    if (!prisma) {
      console.error("❌ No tenant prisma found");
      return res.status(500).json({
        error: "Tenant DB not resolved",
      });
    }
console.log("📌 Prisma exists?", !!prisma);
console.log("📌 Tenant:", req.tenantSlug);
console.log("📥 Incoming body:", req.body);
    const job = await prisma.job.create({
      data: {
        title,
        // companyId,
      },
    });

    success(res, job);
  } catch (error: any) {
    console.error("❌ CREATE JOB ERROR:", error); // 🔥 MUST ADD
    res.status(500).json({
      message: "Failed to create job",
      error: error.message,
    });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const prisma = req.tenantPrisma;

    const { search } = req.query;
    // const { search, companyId } = req.query;

    // const where: any = {
    //   title: search
    //     ? { contains: String(search), mode: "insensitive" }
    //     : undefined,
    //   companyId: companyId ? String(companyId) : undefined,
    // };

    const where: any = {};
    // if (companyId) {
    //   where.companyId = String(companyId);
    // }

    // ✅ Search by title OR company name
    if (search) {
      where.OR = [
        {
          title: {
            contains: String(search),
            mode: "insensitive",
          },
        },
        {
          // company: {
          //   name: {
          //     contains: String(search),
          //     mode: "insensitive",
          //   },
          // },
        },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },

      select: {
        id: true,
        title: true,
        createdAt: true,
        // company: {
        //   select: {
        //     id: true,
        //     name: true,
        //   },
        // },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const total = await prisma.job.count({ where });

    return success(res, jobs, {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const getDeveloperJobs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const prisma = req.tenantPrisma;

    const jobs = await prisma.job.findMany({
      where: {
        title: req.query.search
          ? { contains: String(req.query.search), mode: "insensitive" }
          : undefined,
      },
      skip,
      take: limit,
    });

    const total = await prisma.job.count({
      where: {
        title: {
          contains: "developer",
          mode: "insensitive",
        },
      },
    });

    success(res, {
      data: jobs,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch developer jobs" });
  }
};
