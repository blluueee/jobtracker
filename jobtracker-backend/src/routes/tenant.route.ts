import express from "express";
import { createTenant, getTenants } from "../controllers/tenant.controller"
const router = express.Router();

router.get("/", getTenants)
router.post("/", createTenant);

export default router;