-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceType" ADD VALUE 'OPERATING_AGREEMENT';
ALTER TYPE "ServiceType" ADD VALUE 'CORPORATE_BYLAWS';
ALTER TYPE "ServiceType" ADD VALUE 'CERTIFICATE_OF_STATUS';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "additionalData" JSONB,
ADD COLUMN     "additionalDataCollected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataCollectionFormType" TEXT,
ADD COLUMN     "requiresAdditionalData" BOOLEAN NOT NULL DEFAULT false;
