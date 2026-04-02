import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
});

export const companySchema = z.object({
  name: z.string().min(2),
});

export const jobSchema = z.object({
  title: z.string().min(2),
  // companyId: z.string().uuid(),
});

export const applicationSchema = z.object({
  userId: z.string().uuid(),
  jobId: z.string().uuid(),
});

export const applicationUpdateSchema = z.object({
  status: z.enum(["APPLIED", "INTERVIEW", "HIRED", "REJECTED"]),
});