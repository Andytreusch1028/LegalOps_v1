-- AlterTable
ALTER TABLE "form_drafts" ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "emailRemindersEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastReminderSent" TIMESTAMP(3),
ADD COLUMN     "reminderCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSteps" INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE INDEX "form_drafts_updatedAt_idx" ON "form_drafts"("updatedAt");

-- CreateIndex
CREATE INDEX "form_drafts_emailRemindersEnabled_idx" ON "form_drafts"("emailRemindersEnabled");
