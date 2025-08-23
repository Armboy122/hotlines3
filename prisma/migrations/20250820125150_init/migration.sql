-- CreateEnum
CREATE TYPE "public"."VoltageLevel" AS ENUM ('MID', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."CableCarEfficiency" AS ENUM ('PASSED', 'FAILED', 'NEEDS_MAINTENANCE');

-- CreateTable
CREATE TABLE "public"."OperationCenter" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OperationCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pea" (
    "id" BIGSERIAL NOT NULL,
    "shortname" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "operationId" BIGINT NOT NULL,

    CONSTRAINT "Pea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Station" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "codeName" TEXT NOT NULL,
    "operationId" BIGINT NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobType" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "JobType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobDetail" (
    "id" BIGSERIAL NOT NULL,
    "jobTypeId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "JobDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanStationItem" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "stationId" BIGINT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneOn" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PlanStationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanLineItem" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "feederId" BIGINT NOT NULL,
    "level" "public"."VoltageLevel" NOT NULL,
    "planDistanceKm" DECIMAL(8,2) NOT NULL,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PlanLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanAbsItem" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "deviceLabel" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneOn" TIMESTAMP(3),
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PlanAbsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanConductorItem" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "peaId" BIGINT NOT NULL,
    "description" TEXT,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneOn" TIMESTAMP(3),
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PlanConductorItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanCableCarItem" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "peaId" BIGINT NOT NULL,
    "description" TEXT,
    "efficiencyStatus" "public"."CableCarEfficiency",
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneOn" TIMESTAMP(3),
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PlanCableCarItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskDaily" (
    "id" BIGSERIAL NOT NULL,
    "workDate" DATE NOT NULL,
    "team" INTEGER NOT NULL,
    "jobTypeId" BIGINT NOT NULL,
    "jobDetailId" BIGINT NOT NULL,
    "planStationItemId" BIGINT,
    "planLineItemId" BIGINT,
    "planAbsItemId" BIGINT,
    "feederId" BIGINT,
    "numPole" TEXT,
    "deviceCode" TEXT,
    "distanceKm" DECIMAL(8,2),
    "urlsBefore" TEXT[],
    "urlsAfter" TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "TaskDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Station_codeName_key" ON "public"."Station"("codeName");

-- CreateIndex
CREATE UNIQUE INDEX "JobType_name_key" ON "public"."JobType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobDetail_jobTypeId_name_key" ON "public"."JobDetail"("jobTypeId", "name");

-- CreateIndex
CREATE INDEX "PlanStationItem_year_idx" ON "public"."PlanStationItem"("year");

-- CreateIndex
CREATE UNIQUE INDEX "PlanStationItem_stationId_key" ON "public"."PlanStationItem"("stationId");

-- CreateIndex
CREATE INDEX "PlanLineItem_year_isCancelled_idx" ON "public"."PlanLineItem"("year", "isCancelled");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLineItem_feederId_level_key" ON "public"."PlanLineItem"("feederId", "level");

-- CreateIndex
CREATE INDEX "PlanAbsItem_year_isDone_isCancelled_idx" ON "public"."PlanAbsItem"("year", "isDone", "isCancelled");

-- CreateIndex
CREATE UNIQUE INDEX "PlanAbsItem_deviceLabel_key" ON "public"."PlanAbsItem"("deviceLabel");

-- CreateIndex
CREATE INDEX "PlanConductorItem_year_isDone_isCancelled_idx" ON "public"."PlanConductorItem"("year", "isDone", "isCancelled");

-- CreateIndex
CREATE INDEX "PlanCableCarItem_year_efficiencyStatus_isCancelled_idx" ON "public"."PlanCableCarItem"("year", "efficiencyStatus", "isCancelled");

-- CreateIndex
CREATE INDEX "TaskDaily_workDate_idx" ON "public"."TaskDaily"("workDate");

-- CreateIndex
CREATE INDEX "TaskDaily_team_idx" ON "public"."TaskDaily"("team");

-- CreateIndex
CREATE INDEX "TaskDaily_jobTypeId_jobDetailId_idx" ON "public"."TaskDaily"("jobTypeId", "jobDetailId");

-- CreateIndex
CREATE INDEX "TaskDaily_planStationItemId_idx" ON "public"."TaskDaily"("planStationItemId");

-- CreateIndex
CREATE INDEX "TaskDaily_planLineItemId_idx" ON "public"."TaskDaily"("planLineItemId");

-- CreateIndex
CREATE INDEX "TaskDaily_planAbsItemId_idx" ON "public"."TaskDaily"("planAbsItemId");

-- AddForeignKey
ALTER TABLE "public"."Pea" ADD CONSTRAINT "Pea_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "public"."OperationCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Station" ADD CONSTRAINT "Station_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "public"."OperationCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobDetail" ADD CONSTRAINT "JobDetail_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "public"."JobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanStationItem" ADD CONSTRAINT "PlanStationItem_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "public"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanConductorItem" ADD CONSTRAINT "PlanConductorItem_peaId_fkey" FOREIGN KEY ("peaId") REFERENCES "public"."Pea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanCableCarItem" ADD CONSTRAINT "PlanCableCarItem_peaId_fkey" FOREIGN KEY ("peaId") REFERENCES "public"."Pea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDaily" ADD CONSTRAINT "TaskDaily_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "public"."JobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDaily" ADD CONSTRAINT "TaskDaily_jobDetailId_fkey" FOREIGN KEY ("jobDetailId") REFERENCES "public"."JobDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDaily" ADD CONSTRAINT "TaskDaily_planStationItemId_fkey" FOREIGN KEY ("planStationItemId") REFERENCES "public"."PlanStationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDaily" ADD CONSTRAINT "TaskDaily_planLineItemId_fkey" FOREIGN KEY ("planLineItemId") REFERENCES "public"."PlanLineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDaily" ADD CONSTRAINT "TaskDaily_planAbsItemId_fkey" FOREIGN KEY ("planAbsItemId") REFERENCES "public"."PlanAbsItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
