/*
  Warnings:

  - You are about to drop the column `active` on the `JobDetail` table. All the data in the column will be lost.
  - You are about to drop the column `jobTypeId` on the `JobDetail` table. All the data in the column will be lost.
  - You are about to drop the column `distanceKm` on the `TaskDaily` table. All the data in the column will be lost.
  - You are about to drop the column `planAbsItemId` on the `TaskDaily` table. All the data in the column will be lost.
  - You are about to drop the column `planLineItemId` on the `TaskDaily` table. All the data in the column will be lost.
  - You are about to drop the column `planStationItemId` on the `TaskDaily` table. All the data in the column will be lost.
  - You are about to drop the column `team` on the `TaskDaily` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `JobDetail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamId` to the `TaskDaily` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."JobDetail" DROP CONSTRAINT "JobDetail_jobTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaskDaily" DROP CONSTRAINT "TaskDaily_planAbsItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaskDaily" DROP CONSTRAINT "TaskDaily_planLineItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaskDaily" DROP CONSTRAINT "TaskDaily_planStationItemId_fkey";

-- DropIndex
DROP INDEX "public"."JobDetail_jobTypeId_name_key";

-- DropIndex
DROP INDEX "public"."TaskDaily_planAbsItemId_idx";

-- DropIndex
DROP INDEX "public"."TaskDaily_planLineItemId_idx";

-- DropIndex
DROP INDEX "public"."TaskDaily_planStationItemId_idx";

-- DropIndex
DROP INDEX "public"."TaskDaily_team_idx";

-- AlterTable
ALTER TABLE "public"."JobDetail" DROP COLUMN "active",
DROP COLUMN "jobTypeId";

-- AlterTable
ALTER TABLE "public"."TaskDaily" DROP COLUMN "distanceKm",
DROP COLUMN "planAbsItemId",
DROP COLUMN "planLineItemId",
DROP COLUMN "planStationItemId",
DROP COLUMN "team",
ADD COLUMN     "detail" TEXT,
ADD COLUMN     "teamId" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobDetail_name_key" ON "public"."JobDetail"("name");

-- AddForeignKey
ALTER TABLE "public"."TaskDaily" ADD CONSTRAINT "TaskDaily_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
