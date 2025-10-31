-- CreateEnum
CREATE TYPE "InteractionChannel" AS ENUM ('EMAIL', 'CHAT', 'PHONE', 'SMS', 'DASHBOARD_MESSAGE', 'SOCIAL_MEDIA', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "InteractionDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "InteractionCategory" AS ENUM ('GENERAL_INQUIRY', 'ORDER_STATUS', 'TECHNICAL_SUPPORT', 'BILLING_QUESTION', 'REFUND_REQUEST', 'COMPLAINT', 'LEGAL_QUESTION', 'FEATURE_REQUEST', 'COMPLIANCE_ISSUE', 'FOLLOW_UP', 'AMENDMENT_REQUEST', 'DOCUMENT_REQUEST');

-- CreateEnum
CREATE TYPE "InteractionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'WAITING_ON_INTERNAL', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('VERY_NEGATIVE', 'NEGATIVE', 'NEUTRAL', 'POSITIVE', 'VERY_POSITIVE');

-- CreateEnum
CREATE TYPE "AccessAction" AS ENUM ('VIEW', 'EDIT', 'DELETE', 'EXPORT', 'SHARE');

-- CreateEnum
CREATE TYPE "AttachmentFileType" AS ENUM ('AUDIO_RECORDING', 'TRANSCRIPT', 'SCREENSHOT', 'DOCUMENT', 'SCREEN_RECORDING');

-- CreateTable
CREATE TABLE "customer_interactions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "channel" "InteractionChannel" NOT NULL,
    "direction" "InteractionDirection" NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "aiSummary" TEXT,
    "agentId" TEXT,
    "category" "InteractionCategory" NOT NULL,
    "tags" TEXT[],
    "sentiment" "Sentiment",
    "status" "InteractionStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "resolvedAt" TIMESTAMP(3),
    "resolutionTime" INTEGER,
    "uplDisclaimerShown" BOOLEAN NOT NULL DEFAULT false,
    "uplDisclaimerText" TEXT,
    "containsLegalQuestion" BOOLEAN NOT NULL DEFAULT false,
    "parentInteractionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_attachments" (
    "id" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "fileType" "AttachmentFileType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "duration" INTEGER,
    "transcriptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_access_logs" (
    "id" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AccessAction" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_interactions_customerId_idx" ON "customer_interactions"("customerId");

-- CreateIndex
CREATE INDEX "customer_interactions_orderId_idx" ON "customer_interactions"("orderId");

-- CreateIndex
CREATE INDEX "customer_interactions_agentId_idx" ON "customer_interactions"("agentId");

-- CreateIndex
CREATE INDEX "customer_interactions_status_idx" ON "customer_interactions"("status");

-- CreateIndex
CREATE INDEX "customer_interactions_category_idx" ON "customer_interactions"("category");

-- CreateIndex
CREATE INDEX "customer_interactions_createdAt_idx" ON "customer_interactions"("createdAt");

-- CreateIndex
CREATE INDEX "customer_interactions_containsLegalQuestion_idx" ON "customer_interactions"("containsLegalQuestion");

-- CreateIndex
CREATE INDEX "interaction_attachments_interactionId_idx" ON "interaction_attachments"("interactionId");

-- CreateIndex
CREATE INDEX "interaction_access_logs_interactionId_idx" ON "interaction_access_logs"("interactionId");

-- CreateIndex
CREATE INDEX "interaction_access_logs_userId_idx" ON "interaction_access_logs"("userId");

-- CreateIndex
CREATE INDEX "interaction_access_logs_timestamp_idx" ON "interaction_access_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_parentInteractionId_fkey" FOREIGN KEY ("parentInteractionId") REFERENCES "customer_interactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "interaction_attachments" ADD CONSTRAINT "interaction_attachments_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "customer_interactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_access_logs" ADD CONSTRAINT "interaction_access_logs_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "customer_interactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_access_logs" ADD CONSTRAINT "interaction_access_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
