# Database Schema Setup for LegalOps Platform
*Complete Prisma schema for the complete build-first approach*

## Replace your `prisma/schema.prisma` with this:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  documents     Document[]
  aiConversations AIConversation[]

  @@map("users")
}

enum UserRole {
  USER
  PARTNER
  EMPLOYEE
  SITE_ADMIN
}

// NextAuth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}

// Core Business Models
model Order {
  id              String      @id @default(cuid())
  userId          String
  orderNumber     String      @unique
  type            OrderType
  status          OrderStatus @default(PENDING)
  
  // Business Details
  businessName    String
  entityType      EntityType
  state           String      @default("FL")
  
  // Pricing
  basePrice       Float
  addOns          Json?       // Additional services
  totalAmount     Float
  
  // Payment
  stripePaymentId String?
  paymentStatus   PaymentStatus @default(PENDING)
  paidAt          DateTime?
  
  // Fulfillment
  submittedToState DateTime?
  approvedByState  DateTime?
  completedAt      DateTime?
  
  // Metadata
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  user            User        @relation(fields: [userId], references: [id])
  documents       Document[]
  statusUpdates   StatusUpdate[]

  @@map("orders")
}

enum OrderType {
  LLC_FORMATION
  CORP_FORMATION
  REGISTERED_AGENT
  COMPLIANCE_SERVICE
}

enum EntityType {
  LLC
  CORPORATION
  PARTNERSHIP
  SOLE_PROPRIETORSHIP
}

enum OrderStatus {
  PENDING
  PAYMENT_REQUIRED
  PAID
  IN_REVIEW
  SUBMITTED_TO_STATE
  APPROVED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  REFUNDED
}

// Document Management
model Document {
  id          String       @id @default(cuid())
  userId      String
  orderId     String?
  
  // Document Details
  filename    String
  originalName String
  mimeType    String
  size        Int
  category    DocumentCategory
  
  // Storage
  storageUrl  String
  storageKey  String
  
  // AI Processing (for Month 3)
  aiProcessed Boolean      @default(false)
  aiMetadata  Json?
  
  // Access Control
  isPublic    Boolean      @default(false)
  accessToken String?
  
  // Metadata
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // Relations
  user        User         @relation(fields: [userId], references: [id])
  order       Order?       @relation(fields: [orderId], references: [id])

  @@map("documents")
}

enum DocumentCategory {
  FORMATION_DOCUMENT
  IDENTIFICATION
  OPERATING_AGREEMENT
  CERTIFICATE
  CORRESPONDENCE
  TAX_DOCUMENT
  OTHER
}

// Status Updates & Communication
model StatusUpdate {
  id        String   @id @default(cuid())
  orderId   String
  
  // Update Details
  status    OrderStatus
  message   String
  isPublic  Boolean  @default(true)
  
  // AI Generated (for Month 3)
  aiGenerated Boolean @default(false)
  
  // Metadata
  createdAt DateTime @default(now())
  
  // Relations
  order     Order    @relation(fields: [orderId], references: [id])

  @@map("status_updates")
}

// AI Features (Month 3-4 Implementation)
model AIConversation {
  id        String   @id @default(cuid())
  userId    String
  agentType String   // 'onboarding', 'support', 'document', 'workflow'
  messages  Json     // Array of messages
  metadata  Json?    // Context, compliance flags, etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@map("ai_conversations")
}

model AIAnalytics {
  id           String   @id @default(cuid())
  featureName  String   // 'chat', 'document_processing', etc.
  usageCount   Int      @default(0)
  successRate  Float?
  avgResponseTime Int?  // milliseconds
  totalCost    Float?   // USD
  date         DateTime @default(now())
  
  @@index([featureName, date])
  @@map("ai_analytics")
}

// System Configuration
model SystemConfig {
  id    String @id @default(cuid())
  key   String @unique
  value String
  
  @@map("system_config")
}
```

## After creating the schema, run:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

## Database Setup Verification

After running the commands above, you should see:
1. ✅ Prisma client generated
2. ✅ Tables created in your Neon database
3. ✅ Prisma Studio accessible at http://localhost:5555

This schema includes:
- **User management** with NextAuth.js support
- **Order management** for LLC formation services
- **Document storage** with AI preparation
- **Status updates** and communication
- **AI conversation** tracking (for Month 3)
- **AI analytics** (for Month 4)

You're now ready for Step 4: Authentication setup!
