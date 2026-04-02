// import { Request, Response } from "express";
// import { success } from "../utils/response";

// export const createCompany = async (req: Request, res: Response) => {
//   try {
//     const { name } = req.body;
//     const prisma = req.tenantPrisma

//     const company = await prisma.company.create({
//       data: { name },
//     });

//     success(res,company);
//   } catch (error) {
//     res.status(500).json({ error: "Error creating company" });
//   }
// };

// export const getCompanies = async (req: Request, res: Response) => {
//   const prisma = req.tenantPrisma
//   const companies = await prisma.company.findMany({
//     select: {
//     id: true,
//     name: true,
//     _count: {
//       select: {
//         jobs: true,
//       },
//     },
//   },
//   });

//   res.json({
//   data: companies,
// });
// };