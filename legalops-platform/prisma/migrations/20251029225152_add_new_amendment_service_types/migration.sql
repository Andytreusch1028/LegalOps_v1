-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceType" ADD VALUE 'ENTITY_INFORMATION_UPDATE';
ALTER TYPE "ServiceType" ADD VALUE 'OFFICER_ADDRESS_UPDATE';
ALTER TYPE "ServiceType" ADD VALUE 'REGISTERED_AGENT_CHANGE';
ALTER TYPE "ServiceType" ADD VALUE 'BUSINESS_AMENDMENT';
