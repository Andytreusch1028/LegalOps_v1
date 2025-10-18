-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'PARTNER', 'EMPLOYEE', 'ADMIN', 'SITE_ADMIN');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('ONE_TIME', 'RETURNING', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('PRINCIPAL', 'MAILING', 'REGISTERED_AGENT', 'PERSONAL');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('LLC', 'CORPORATION', 'NONPROFIT_CORPORATION', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('PENDING', 'FILED', 'ACTIVE', 'INACTIVE', 'DISSOLVED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'LEGALOPS');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('MANAGER', 'MEMBER', 'PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'DIRECTOR', 'PARTNER');

-- CreateEnum
CREATE TYPE "FilingType" AS ENUM ('LLC_FORMATION', 'CORP_FORMATION', 'NONPROFIT_FORMATION', 'ANNUAL_REPORT', 'AMENDMENT', 'DISSOLUTION', 'REINSTATEMENT', 'NAME_CHANGE', 'REGISTERED_AGENT_CHANGE', 'ADDRESS_CHANGE', 'EIN_APPLICATION', 'FICTITIOUS_NAME');

-- CreateEnum
CREATE TYPE "FilingStatus" AS ENUM ('DRAFT', 'READY', 'SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ARTICLES_OF_ORGANIZATION', 'ARTICLES_OF_INCORPORATION', 'CERTIFICATE_OF_STATUS', 'ANNUAL_REPORT', 'EIN_LETTER', 'RECEIPT', 'CONFIRMATION', 'OTHER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('LLC_FORMATION', 'CORP_FORMATION', 'ANNUAL_REPORT', 'REGISTERED_AGENT', 'EIN_APPLICATION', 'AMENDMENT', 'DISSOLUTION', 'NAME_RESERVATION', 'EXPEDITED_PROCESSING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FILING_UPDATE', 'DOCUMENT_READY', 'PAYMENT_DUE', 'COMPLIANCE_ALERT', 'SYSTEM_UPDATE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "clientType" "ClientType" NOT NULL DEFAULT 'ONE_TIME',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "addressType" "AddressType" NOT NULL,
    "clientId" TEXT,
    "businessEntityId" TEXT,
    "registeredAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_entities" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "dbaName" TEXT,
    "entityType" "EntityType" NOT NULL,
    "stateOfFormation" TEXT NOT NULL DEFAULT 'FL',
    "documentNumber" TEXT,
    "filingDate" TIMESTAMP(3),
    "feiNumber" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registered_agents" (
    "id" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "serviceStartDate" TIMESTAMP(3),
    "serviceEndDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registered_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managers_officers" (
    "id" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "roleType" "RoleType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "managers_officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filings" (
    "id" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "filingType" "FilingType" NOT NULL,
    "filingStatus" "FilingStatus" NOT NULL DEFAULT 'DRAFT',
    "filingData" JSONB NOT NULL,
    "confirmationNumber" TEXT,
    "trackingNumber" TEXT,
    "filedDate" TIMESTAMP(3),
    "approvedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing_documents" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filing_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registered_agents_businessEntityId_key" ON "registered_agents"("businessEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_registeredAgentId_fkey" FOREIGN KEY ("registeredAgentId") REFERENCES "registered_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_entities" ADD CONSTRAINT "business_entities_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registered_agents" ADD CONSTRAINT "registered_agents_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managers_officers" ADD CONSTRAINT "managers_officers_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filings" ADD CONSTRAINT "filings_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing_documents" ADD CONSTRAINT "filing_documents_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "filings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
