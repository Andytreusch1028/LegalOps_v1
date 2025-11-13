-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "includesRegisteredAgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "raAutoRenew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "raRenewalDate" TIMESTAMP(3),
ADD COLUMN     "raRenewalNotificationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "raRenewalPrice" DECIMAL(10,2);
