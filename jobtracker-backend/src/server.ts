import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import applicationRoutes from "./routes/application.route";
import userRoutes from "./routes/user.route";
// import companyRoutes from "./routes/company.route";
import jobRoutes from "./routes/job.route";
import tenantRoutes from "./routes/tenant.route"
import { globalPrisma } from "./prisma";
const app = express();

(async () => {
  try {
    await globalPrisma.$connect();
    console.log("✅ Global database connected successfully");
  } catch (error) {
    console.error("❌ Global database connection failed:", error);
    process.exit(1);
  }
})();

app.use(cors());
app.use(express.json());

app.use("/tenants", tenantRoutes)
app.use("/users", userRoutes);
// app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
