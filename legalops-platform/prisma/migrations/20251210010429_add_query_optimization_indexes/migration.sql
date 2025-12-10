-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderData" JSONB;

-- CreateTable
CREATE TABLE "florida_entities" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "entityType" TEXT,
    "filingDate" TIMESTAMP(3),
    "state" TEXT NOT NULL DEFAULT 'FL',
    "principalAddress" TEXT,
    "mailingAddress" TEXT,
    "registeredAgent" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "florida_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fictitious_names" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "fictitiousName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "county" TEXT,
    "status" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "cancellationDate" TIMESTAMP(3),
    "principalAddress" TEXT,
    "mailingAddress" TEXT,
    "numberOfOwners" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "orderId" TEXT,
    "fein" TEXT,
    "correspondenceEmail" TEXT,
    "advertisementCertified" BOOLEAN NOT NULL DEFAULT false,
    "newspaperName" TEXT,
    "publicationDate" TEXT,
    "signatureName" TEXT,
    "signatureDate" TIMESTAMP(3),
    "signatureIp" TEXT,
    "principalAddressJson" JSONB,
    "mailingAddressJson" JSONB,
    "ownersData" JSONB,

    CONSTRAINT "fictitious_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fictitious_name_owners" (
    "id" TEXT NOT NULL,
    "fictitiousNameId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "entityName" TEXT,
    "floridaDocumentNumber" TEXT,
    "fein" TEXT,
    "street" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'FL',
    "zipCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fictitious_name_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_partnerships" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "cancellationDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "principalAddress" TEXT,
    "mailingAddress" TEXT,
    "numberOfPartners" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_data_syncs" (
    "id" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsAdded" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "entity_data_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "florida_entities_documentNumber_key" ON "florida_entities"("documentNumber");

-- CreateIndex
CREATE INDEX "florida_entities_normalizedName_idx" ON "florida_entities"("normalizedName");

-- CreateIndex
CREATE INDEX "florida_entities_status_idx" ON "florida_entities"("status");

-- CreateIndex
CREATE INDEX "florida_entities_documentNumber_idx" ON "florida_entities"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "fictitious_names_documentNumber_key" ON "fictitious_names"("documentNumber");

-- CreateIndex
CREATE INDEX "fictitious_names_normalizedName_idx" ON "fictitious_names"("normalizedName");

-- CreateIndex
CREATE INDEX "fictitious_names_status_idx" ON "fictitious_names"("status");

-- CreateIndex
CREATE INDEX "fictitious_names_documentNumber_idx" ON "fictitious_names"("documentNumber");

-- CreateIndex
CREATE INDEX "fictitious_names_userId_idx" ON "fictitious_names"("userId");

-- CreateIndex
CREATE INDEX "fictitious_names_orderId_idx" ON "fictitious_names"("orderId");

-- CreateIndex
CREATE INDEX "fictitious_name_owners_fictitiousNameId_idx" ON "fictitious_name_owners"("fictitiousNameId");

-- CreateIndex
CREATE UNIQUE INDEX "general_partnerships_documentNumber_key" ON "general_partnerships"("documentNumber");

-- CreateIndex
CREATE INDEX "general_partnerships_normalizedName_idx" ON "general_partnerships"("normalizedName");

-- CreateIndex
CREATE INDEX "general_partnerships_status_idx" ON "general_partnerships"("status");

-- CreateIndex
CREATE INDEX "general_partnerships_documentNumber_idx" ON "general_partnerships"("documentNumber");

-- CreateIndex
CREATE INDEX "business_entities_clientId_idx" ON "business_entities"("clientId");

-- CreateIndex
CREATE INDEX "business_entities_entityType_idx" ON "business_entities"("entityType");

-- CreateIndex
CREATE INDEX "business_entities_status_idx" ON "business_entities"("status");

-- CreateIndex
CREATE INDEX "business_entities_documentNumber_idx" ON "business_entities"("documentNumber");

-- CreateIndex
CREATE INDEX "business_entities_createdAt_idx" ON "business_entities"("createdAt");

-- CreateIndex
CREATE INDEX "business_entities_clientId_status_idx" ON "business_entities"("clientId", "status");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_serviceType_idx" ON "order_items"("serviceType");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_orderStatus_idx" ON "orders"("orderStatus");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_requiresReview_idx" ON "orders"("requiresReview");

-- CreateIndex
CREATE INDEX "orders_userId_createdAt_idx" ON "orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_orderStatus_createdAt_idx" ON "orders"("orderStatus", "createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_userType_idx" ON "users"("userType");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- AddForeignKey
ALTER TABLE "fictitious_names" ADD CONSTRAINT "fictitious_names_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fictitious_names" ADD CONSTRAINT "fictitious_names_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fictitious_name_owners" ADD CONSTRAINT "fictitious_name_owners_fictitiousNameId_fkey" FOREIGN KEY ("fictitiousNameId") REFERENCES "fictitious_names"("id") ON DELETE CASCADE ON UPDATE CASCADE;
