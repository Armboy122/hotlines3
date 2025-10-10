-- AlterTable
ALTER TABLE "public"."JobDetail" ADD COLUMN     "jobTypeId" BIGINT;

-- CreateIndex
CREATE INDEX "JobDetail_jobTypeId_idx" ON "public"."JobDetail"("jobTypeId");

-- AddForeignKey
ALTER TABLE "public"."JobDetail" ADD CONSTRAINT "JobDetail_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "public"."JobType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
