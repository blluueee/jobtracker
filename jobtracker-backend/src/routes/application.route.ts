import express from "express";
import {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} from "../controllers/application.controller";
import { validate } from "../middlewares/validate";
import { applicationSchema, applicationUpdateSchema } from "../validators";
import { tenantMiddleware } from "../middlewares/tenant.middleware";

const router = express.Router();
// router.use(tenantMiddleware);
router.post("/", validate(applicationSchema), tenantMiddleware, createApplication);
router.get("/",tenantMiddleware, getApplications);
router.patch("/:id", validate(applicationUpdateSchema), tenantMiddleware, updateApplication);
router.delete("/:id", tenantMiddleware, deleteApplication);

export default router;
