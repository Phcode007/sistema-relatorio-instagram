-- CreateEnum
CREATE TYPE "UserCompanyRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompany" (
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "UserCompanyRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("userId", "companyId")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Report_month_check" CHECK ("month" BETWEEN 1 AND 12),
    CONSTRAINT "Report_year_check" CHECK ("year" BETWEEN 2000 AND 9999)
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "budgets" INTEGER NOT NULL DEFAULT 0,
    "reservations" INTEGER NOT NULL DEFAULT 0,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AttendanceRecord_metrics_non_negative_check" CHECK (
      "messages" >= 0 AND
      "replies" >= 0 AND
      "budgets" >= 0 AND
      "reservations" >= 0
    )
);

-- CreateTable
CREATE TABLE "ContentRecord" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "stories" INTEGER NOT NULL DEFAULT 0,
    "storyViews" INTEGER NOT NULL DEFAULT 0,
    "reels" INTEGER NOT NULL DEFAULT 0,
    "reelViews" INTEGER NOT NULL DEFAULT 0,
    "engagement" DECIMAL(5, 2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentRecord_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContentRecord_metrics_check" CHECK (
      "stories" >= 0 AND
      "storyViews" >= 0 AND
      "reels" >= 0 AND
      "reelViews" >= 0 AND
      "engagement" BETWEEN 0 AND 100
    )
);

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "bestStory" VARCHAR(200),
    "bestReel" VARCHAR(200),
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserCompany_companyId_idx" ON "UserCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_companyId_year_month_key" ON "Report"("companyId", "year", "month");

-- CreateIndex
CREATE INDEX "AttendanceRecord_reportId_date_idx" ON "AttendanceRecord"("reportId", "date");

-- CreateIndex
CREATE INDEX "ContentRecord_reportId_date_idx" ON "ContentRecord"("reportId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Highlight_reportId_key" ON "Highlight"("reportId");

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRecord" ADD CONSTRAINT "ContentRecord_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
