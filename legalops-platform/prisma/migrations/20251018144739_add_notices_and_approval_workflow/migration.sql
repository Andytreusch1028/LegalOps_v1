/*
  Warnings:

  - The values [READY,PENDING,APPROVED] on the enum `FilingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('APPROVAL_REQUIRED', 'PAYMENT_REQUIRED', 'DOCUMENT_READY', 'FILING_SUBMITTED', 'FILING_COMPLETED', 'FILING_REJECTED', 'DEADLINE_APPROACHING', 'GENERAL_ALERT');

-- CreateEnum
CREATE TYPE "NoticePriority" AS ENUM ('URGENT', 'ATTENTION', 'SUCCESS');

-- AlterEnum
BEGIN;
CREATE TYPE "FilingStatus_new" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'IN_REVIEW', 'PENDING_CUSTOMER_APPROVAL', 'APPROVED_BY_CUSTOMER', 'READY_TO_FILE', 'SUBMITTED', 'COMPLETED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."filings" ALTER COLUMN "filingStatus" DROP DEFAULT;
ALTER TABLE "filings" ALTER COLUMN "filingStatus" TYPE "FilingStatus_new" USING ("filingStatus"::text::"FilingStatus_new");
ALTER TYPE "FilingStatus" RENAME TO "FilingStatus_old";
ALTER TYPE "FilingStatus_new" RENAME TO "FilingStatus";
DROP TYPE "public"."FilingStatus_old";
ALTER TABLE "filings" ALTER COLUMN "filingStatus" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "filings" ADD COLUMN     "customerApprovedAt" TIMESTAMP(3),
ADD COLUMN     "customerApprovedBy" TEXT,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "staffChangeReason" TEXT,
ADD COLUMN     "staffChanges" JSONB;

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL,
    "priority" "NoticePriority" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "filingId" TEXT,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "filings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
