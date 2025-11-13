-- CreateTable
CREATE TABLE "dba_drafts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "formData" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dba_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dba_drafts_token_key" ON "dba_drafts"("token");

-- CreateIndex
CREATE INDEX "dba_drafts_token_idx" ON "dba_drafts"("token");

-- CreateIndex
CREATE INDEX "dba_drafts_email_idx" ON "dba_drafts"("email");

-- CreateIndex
CREATE INDEX "dba_drafts_expiresAt_idx" ON "dba_drafts"("expiresAt");
