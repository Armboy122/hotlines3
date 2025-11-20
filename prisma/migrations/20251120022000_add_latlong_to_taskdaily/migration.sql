-- AlterTable
ALTER TABLE "public"."TaskDaily" ADD COLUMN     "latitude" DECIMAL(9,6),
ADD COLUMN     "longitude" DECIMAL(9,6);

-- CreateIndex
CREATE INDEX "TaskDaily_latitude_longitude_idx" ON "public"."TaskDaily"("latitude", "longitude");
