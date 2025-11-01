/*
  Warnings:

  - A unique constraint covering the columns `[userId,formType]` on the table `form_drafts` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `form_drafts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."form_drafts_userId_formType_idx";

-- AlterTable
ALTER TABLE "form_drafts" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "form_drafts_userId_formType_key" ON "form_drafts"("userId", "formType");
