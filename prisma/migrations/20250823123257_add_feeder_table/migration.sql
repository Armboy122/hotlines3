-- CreateTable
CREATE TABLE "public"."Feeder" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "stationId" BIGINT NOT NULL,

    CONSTRAINT "Feeder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feeder_code_key" ON "public"."Feeder"("code");

-- CreateIndex
CREATE INDEX "Feeder_stationId_idx" ON "public"."Feeder"("stationId");

-- CreateIndex
CREATE INDEX "TaskDaily_feederId_idx" ON "public"."TaskDaily"("feederId");

-- AddForeignKey
ALTER TABLE "public"."Feeder" ADD CONSTRAINT "Feeder_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "public"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDaily" ADD CONSTRAINT "TaskDaily_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "public"."Feeder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
