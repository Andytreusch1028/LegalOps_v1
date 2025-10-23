-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskRecommendation" AS ENUM ('APPROVE', 'REVIEW', 'VERIFY', 'DECLINE');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'DECLINED', 'VERIFIED', 'MONITORING');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PAID';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_FAILED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isRushOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "riskLevel" "RiskLevel",
ADD COLUMN     "riskScore" INTEGER,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "recommendation" "RiskRecommendation" NOT NULL,
    "aiReasoning" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4-turbo',
    "riskFactors" JSONB NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "accountAge" INTEGER,
    "previousOrders" INTEGER NOT NULL DEFAULT 0,
    "previousChargebacks" INTEGER NOT NULL DEFAULT 0,
    "orderAmount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "isRushOrder" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "billingAddress" JSONB,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "reviewDecision" "ReviewDecision",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "serviceFee" DECIMAL(10,2) NOT NULL,
    "stateFee" DECIMAL(10,2) NOT NULL,
    "registeredAgentFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "rushFeeAvailable" BOOLEAN NOT NULL DEFAULT false,
    "rushFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "entityTypes" TEXT[],
    "processingTime" TEXT,
    "filingMethod" TEXT NOT NULL DEFAULT 'online',
    "requirements" JSONB,
    "formFields" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "risk_assessments_orderId_key" ON "risk_assessments"("orderId");

-- CreateIndex
CREATE INDEX "risk_assessments_riskLevel_idx" ON "risk_assessments"("riskLevel");

-- CreateIndex
CREATE INDEX "risk_assessments_createdAt_idx" ON "risk_assessments"("createdAt");

-- CreateIndex
CREATE INDEX "risk_assessments_requiresReview_idx" ON "risk_assessments"("requiresReview");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category");

-- CreateIndex
CREATE INDEX "services_slug_idx" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_isActive_idx" ON "services"("isActive");

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
