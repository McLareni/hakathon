-- CreateEnum
CREATE TYPE "public"."DealConditionStatus" AS ENUM (
  'PENDING_PARTICIPANT',
  'PARTICIPANT_JOINED',
  'EXPIRED',
  'CANCELLED'
);

-- CreateTable
CREATE TABLE "public"."DealCondition" (
  "id" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "participantId" TEXT,
  "vehicleId" TEXT NOT NULL,
  "saleCity" TEXT NOT NULL,
  "proposedPrice" DECIMAL(10,2) NOT NULL,
  "note" TEXT,
  "participantNote" TEXT,
  "inviteToken" TEXT NOT NULL,
  "status" "public"."DealConditionStatus" NOT NULL DEFAULT 'PENDING_PARTICIPANT',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DealCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DealCondition_inviteToken_key" ON "public"."DealCondition"("inviteToken");

-- AddForeignKey
ALTER TABLE "public"."DealCondition" ADD CONSTRAINT "DealCondition_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DealCondition" ADD CONSTRAINT "DealCondition_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DealCondition" ADD CONSTRAINT "DealCondition_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
