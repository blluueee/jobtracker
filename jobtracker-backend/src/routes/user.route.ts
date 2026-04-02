import express from "express";
import { createUser, getUsers } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { userSchema } from "../validators";
import { tenantMiddleware } from "../middlewares/tenant.middleware";

const router = express.Router();

// router.use(tenantMiddleware);
router.post("/", validate(userSchema), tenantMiddleware, createUser);
router.get("/", tenantMiddleware, getUsers);

export default router;