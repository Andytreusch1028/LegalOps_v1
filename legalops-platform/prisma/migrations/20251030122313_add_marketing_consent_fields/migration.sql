-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "emailRemindersConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailRemindersConsentAt" TIMESTAMP(3),
ADD COLUMN     "smsRemindersConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsRemindersConsentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailRemindersConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailRemindersConsentAt" TIMESTAMP(3),
ADD COLUMN     "smsRemindersConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsRemindersConsentAt" TIMESTAMP(3);
