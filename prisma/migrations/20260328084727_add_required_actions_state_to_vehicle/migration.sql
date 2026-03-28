/*
  Warnings:

  - You are about to drop the `DealCondition` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `DocumentInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DocumentTemplate` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `DocumentTemplate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."DocumentTemplateSource" AS ENUM ('SYSTEM', 'USER_SCAN');

-- CreateEnum
CREATE TYPE "public"."DocumentProcessType" AS ENUM ('CAR_SALE', 'UMOWA_ZLECENIE', 'APLIKACJA_POBYT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentProcessStatus" AS ENUM ('DRAFT', 'WAITING_PARTICIPANT', 'PARTICIPANT_JOINED', 'IN_REVIEW', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."DocumentInstanceStatus" AS ENUM ('DRAFT', 'READY', 'SIGNED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "public"."DealCondition" DROP CONSTRAINT "DealCondition_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DealCondition" DROP CONSTRAINT "DealCondition_participantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DealCondition" DROP CONSTRAINT "DealCondition_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentInstance" DROP CONSTRAINT "DocumentInstance_contractId_fkey";

-- AlterTable
ALTER TABLE "public"."DocumentInstance" ADD COLUMN     "payload" JSONB,
ADD COLUMN     "processId" TEXT,
ADD COLUMN     "status" "public"."DocumentInstanceStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "contractId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."DocumentTemplate" ADD COLUMN     "analysisSchema" JSONB,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "originalFileName" TEXT,
ADD COLUMN     "originalMimeType" TEXT,
ADD COLUMN     "originalScanText" TEXT,
ADD COLUMN     "source" "public"."DocumentTemplateSource" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."DocumentProcessType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "requiredActionsState" JSONB;

-- DropTable
DROP TABLE "public"."DealCondition";

-- DropEnum
DROP TYPE "public"."DealConditionStatus";

-- CreateTable
CREATE TABLE "public"."DocumentProcess" (
    "id" TEXT NOT NULL,
    "type" "public"."DocumentProcessType" NOT NULL,
    "status" "public"."DocumentProcessStatus" NOT NULL DEFAULT 'DRAFT',
    "creatorId" TEXT NOT NULL,
    "participantId" TEXT,
    "vehicleId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sharedToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentProcess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentProcess_sharedToken_key" ON "public"."DocumentProcess"("sharedToken");

-- CreateIndex
CREATE INDEX "DocumentProcess_creatorId_idx" ON "public"."DocumentProcess"("creatorId");

-- CreateIndex
CREATE INDEX "DocumentProcess_participantId_idx" ON "public"."DocumentProcess"("participantId");

-- CreateIndex
CREATE INDEX "DocumentProcess_vehicleId_idx" ON "public"."DocumentProcess"("vehicleId");

-- CreateIndex
CREATE INDEX "DocumentProcess_status_idx" ON "public"."DocumentProcess"("status");

-- CreateIndex
CREATE INDEX "DocumentTemplate_creatorId_idx" ON "public"."DocumentTemplate"("creatorId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_type_idx" ON "public"."DocumentTemplate"("type");

-- CreateIndex
CREATE INDEX "DocumentTemplate_source_idx" ON "public"."DocumentTemplate"("source");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "public"."User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "public"."DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentInstance" ADD CONSTRAINT "DocumentInstance_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentInstance" ADD CONSTRAINT "DocumentInstance_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."DocumentProcess"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentProcess" ADD CONSTRAINT "DocumentProcess_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentProcess" ADD CONSTRAINT "DocumentProcess_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentProcess" ADD CONSTRAINT "DocumentProcess_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
