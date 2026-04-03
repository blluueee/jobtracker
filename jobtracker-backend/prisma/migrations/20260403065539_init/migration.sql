-- DropIndex
DROP INDEX "Application_jobId_idx";

-- DropIndex
DROP INDEX "Application_status_idx";

-- DropIndex
DROP INDEX "Application_userId_idx";

-- DropIndex
DROP INDEX "Application_userId_jobId_key";

-- DropIndex
DROP INDEX "Job_createdAt_idx";

-- DropIndex
DROP INDEX "Job_title_idx";

-- CreateTable
CREATE TABLE "ApplicationKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Application_jobId_createdAt_idx" ON "Application"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_userId_createdAt_idx" ON "Application"("userId", "createdAt");
