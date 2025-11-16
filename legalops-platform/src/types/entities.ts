/**
 * LegalOps v1 - Entity Type Definitions
 * 
 * These types match the Prisma schema and provide type safety
 * throughout the application.
 */

// ============================================================================
// ENUMS (matching Prisma schema)
// ============================================================================

export enum UserType {
  CUSTOMER = 'CUSTOMER',
  PARTNER = 'PARTNER',
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  SITE_ADMIN = 'SITE_ADMIN',
}

export enum ClientType {
  ONE_TIME = 'ONE_TIME',
  RETURNING = 'RETURNING',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum AddressType {
  PRINCIPAL = 'PRINCIPAL',
  MAILING = 'MAILING',
  REGISTERED_AGENT = 'REGISTERED_AGENT',
  PERSONAL = 'PERSONAL',
}

export enum EntityType {
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
  NONPROFIT_CORPORATION = 'NONPROFIT_CORPORATION',
  PARTNERSHIP = 'PARTNERSHIP',
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
}

export enum EntityStatus {
  PENDING = 'PENDING',
  FILED = 'FILED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISSOLVED = 'DISSOLVED',
}

export enum AgentType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  LEGALOPS = 'LEGALOPS',
}

export enum RoleType {
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  DIRECTOR = 'DIRECTOR',
  PARTNER = 'PARTNER',
}

export enum FilingType {
  LLC_FORMATION = 'LLC_FORMATION',
  CORP_FORMATION = 'CORP_FORMATION',
  NONPROFIT_FORMATION = 'NONPROFIT_FORMATION',
  ANNUAL_REPORT = 'ANNUAL_REPORT',
  AMENDMENT = 'AMENDMENT',
  DISSOLUTION = 'DISSOLUTION',
  REINSTATEMENT = 'REINSTATEMENT',
  NAME_CHANGE = 'NAME_CHANGE',
  REGISTERED_AGENT_CHANGE = 'REGISTERED_AGENT_CHANGE',
  ADDRESS_CHANGE = 'ADDRESS_CHANGE',
  EIN_APPLICATION = 'EIN_APPLICATION',
  FICTITIOUS_NAME = 'FICTITIOUS_NAME',
}

export enum FilingStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DocumentType {
  ARTICLES_OF_ORGANIZATION = 'ARTICLES_OF_ORGANIZATION',
  ARTICLES_OF_INCORPORATION = 'ARTICLES_OF_INCORPORATION',
  CERTIFICATE_OF_STATUS = 'CERTIFICATE_OF_STATUS',
  ANNUAL_REPORT = 'ANNUAL_REPORT',
  EIN_LETTER = 'EIN_LETTER',
  RECEIPT = 'RECEIPT',
  CONFIRMATION = 'CONFIRMATION',
  OTHER = 'OTHER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ServiceType {
  LLC_FORMATION = 'LLC_FORMATION',
  CORP_FORMATION = 'CORP_FORMATION',
  ANNUAL_REPORT = 'ANNUAL_REPORT',
  REGISTERED_AGENT = 'REGISTERED_AGENT',
  EIN_APPLICATION = 'EIN_APPLICATION',
  AMENDMENT = 'AMENDMENT',
  DISSOLUTION = 'DISSOLUTION',
  NAME_RESERVATION = 'NAME_RESERVATION',
  EXPEDITED_PROCESSING = 'EXPEDITED_PROCESSING',
}

export enum NotificationType {
  FILING_UPDATE = 'FILING_UPDATE',
  DOCUMENT_READY = 'DOCUMENT_READY',
  PAYMENT_DUE = 'PAYMENT_DUE',
  COMPLIANCE_ALERT = 'COMPLIANCE_ALERT',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType: UserType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  clientType: ClientType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressType: AddressType;
  clientId?: string;
  businessEntityId?: string;
  registeredAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessEntity {
  id: string;
  clientId: string;
  legalName: string;
  dbaName?: string;
  entityType: EntityType;
  stateOfFormation: string;
  documentNumber?: string;
  filingDate?: Date;
  status: EntityStatus;
  purpose?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisteredAgent {
  id: string;
  businessEntityId: string;
  agentType: AgentType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  serviceStartDate?: Date;
  serviceEndDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagerOfficer {
  id: string;
  businessEntityId: string;
  firstName: string;
  lastName: string;
  title?: string;
  roleType: RoleType;
  email?: string;
  phone?: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Filing {
  id: string;
  businessEntityId: string;
  filingType: FilingType;
  filingStatus: FilingStatus;
  filingData: Record<string, unknown>; // JSON data
  confirmationNumber?: string;
  trackingNumber?: string;
  filedDate?: Date;
  approvedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

export interface FilingDocument {
  id: string;
  filingId: string;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  stripePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceType: ServiceType;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// ============================================================================
// EXTENDED INTERFACES (with relationships)
// ============================================================================

export interface ClientWithRelations extends Client {
  user?: User;
  businessEntities?: BusinessEntity[];
  addresses?: Address[];
}

export interface BusinessEntityWithRelations extends BusinessEntity {
  client?: Client;
  addresses?: Address[];
  registeredAgent?: RegisteredAgent;
  managersOfficers?: ManagerOfficer[];
  filings?: Filing[];
}

export interface FilingWithRelations extends Filing {
  businessEntity?: BusinessEntityWithRelations;
  documents?: FilingDocument[];
}

export interface OrderWithRelations extends Order {
  user?: User;
  orderItems?: OrderItem[];
}

