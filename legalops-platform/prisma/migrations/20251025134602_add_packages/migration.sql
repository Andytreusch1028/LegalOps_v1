-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "packageId" TEXT;

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "includesRA" BOOLEAN NOT NULL DEFAULT false,
    "raYears" INTEGER NOT NULL DEFAULT 0,
    "includesEIN" BOOLEAN NOT NULL DEFAULT false,
    "includesAI" BOOLEAN NOT NULL DEFAULT false,
    "includesOperatingAgreement" BOOLEAN NOT NULL DEFAULT false,
    "includesComplianceCalendar" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "highlightColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "packages_slug_key" ON "packages"("slug");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
