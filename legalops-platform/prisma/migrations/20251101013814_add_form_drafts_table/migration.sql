-- CreateTable
CREATE TABLE "form_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "formType" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_drafts_userId_formType_idx" ON "form_drafts"("userId", "formType");

-- CreateIndex
CREATE INDEX "form_drafts_createdAt_idx" ON "form_drafts"("createdAt");

-- AddForeignKey
ALTER TABLE "form_drafts" ADD CONSTRAINT "form_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
