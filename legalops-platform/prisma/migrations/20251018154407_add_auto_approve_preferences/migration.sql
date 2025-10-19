-- AlterTable
ALTER TABLE "users" ADD COLUMN     "autoApproveAcknowledged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoApproveGrantedAt" TIMESTAMP(3),
ADD COLUMN     "autoApproveMinorChanges" BOOLEAN NOT NULL DEFAULT false;
