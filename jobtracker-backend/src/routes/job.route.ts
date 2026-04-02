import express from "express";
import { createJob, getJobs } from "../controllers/job.controller";
import { validate } from "../middlewares/validate";
import { jobSchema } from "../validators";
import { tenantMiddleware } from "../middlewares/tenant.middleware";

const router = express.Router();

// router.use(tenantMiddleware);
router.post("/", validate(jobSchema),tenantMiddleware, createJob);
router.get("/",tenantMiddleware, getJobs);
// GET http://localhost:5000/jobs?page=1&limit=10
// API SUPPORTS FOLLOWING: 
// GET /jobs?page=1&limit=10
// GET /jobs?search=developer
// GET /jobs?companyId=abc-uuid
// GET /jobs?search=react&companyId=xyz&page=2

export default router;