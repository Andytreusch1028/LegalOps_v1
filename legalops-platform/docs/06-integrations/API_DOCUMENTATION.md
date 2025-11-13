# LegalOps Platform - API Documentation

> Status Note (2025-09-30): Only the `/health`, `/health/detailed`, `/auth/register`, and `/auth/login` endpoints are implemented today; the remaining routes in this document describe planned functionality for future increments.

## Overview
The LegalOps Platform provides a comprehensive REST API for business formation, document management, and legal operations. This documentation covers all available endpoints, authentication, and usage examples.

## Table of Contents
1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [API Endpoints](#api-endpoints)
7. [Webhooks](#webhooks)
8. [SDKs](#sdks)

## Authentication

### JWT Token Authentication
All API requests require authentication using JWT tokens.

```bash
# Login to get access token
curl -X POST https://api.legalops.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'

# Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Using Access Tokens
Include the access token in the Authorization header:

```bash
curl -X GET https://api.legalops.com/api/users/profile \
  -H "Authorization: Bearer your_access_token"
```

### Token Refresh
Access tokens expire after 15 minutes. Use the refresh token to get a new access token:

```bash
curl -X POST https://api.legalops.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

## Base URL

- **Production**: `https://api.legalops.com`
- **Staging**: `https://staging-api.legalops.com`
- **Development**: `http://localhost:3000`

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per minute per user
- **Business Formation**: 5 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "organizationName": "Example Co",
  "email": "owner@example.com",
  "password": "Str0ngPass!123",
  "state": "FL",
  "floridaAcknowledged": true,
  "phone": "+15615550123"
}
```

**Success Response (201):**
```json
{
  "status": "created",
  "message": "Registration successful. Check your email to verify the account.",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>",
  "refreshTokenExpiresAt": "2025-10-07T12:00:00.000Z"
}
```

**Validation Errors (400):**
```json
{
  "status": "error",
  "errors": [
    { "field": "password", "message": "Password must be at least 12 characters and include upper, lower, number, and symbol." }
  ]
}
```

**Conflict (409):**
```json
{
  "status": "conflict",
  "message": "Email is already registered."
}
```
#### POST /api/auth/login
Authenticate user and obtain fresh tokens.

**Request Body:**
```json
{
  "email": "owner@example.com",
  "password": "Str0ngPass!123"
}
```

**Success Response (200):**
```json
{
  "status": "ok",
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>",
  "refreshTokenExpiresAt": "2025-10-07T12:00:00.000Z",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "emailVerified": false
}
```

**Invalid Credentials (401):**
```json
{
  "status": "unauthorized",
  "message": "Invalid credentials."
}
```
#### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer your_access_token
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### User Management Endpoints

#### GET /api/users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /api/users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### POST /api/users/change-password
Change user password.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

### Business Formation Endpoints

#### GET /api/business-formation/entities
Get user's business entities.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "entities": [
      {
        "id": "entity_id",
        "name": "My Business LLC",
        "type": "LLC",
        "state": "FL",
        "status": "ACTIVE",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /api/business-formation/entities
Create a new business entity.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Request Body:**
```json
{
  "name": "My Business LLC",
  "type": "LLC",
  "state": "FL",
  "registeredAgent": {
    "name": "John Doe",
    "address": "123 Main St, Miami, FL 33101",
    "phone": "+1234567890"
  },
  "businessAddress": {
    "street": "456 Business Ave",
    "city": "Miami",
    "state": "FL",
    "zipCode": "33101"
  }
}
```

#### GET /api/business-formation/entities/:id
Get specific business entity details.

**Headers:**
```
Authorization: Bearer your_access_token
```

#### PUT /api/business-formation/entities/:id
Update business entity.

**Headers:**
```
Authorization: Bearer your_access_token
```

#### DELETE /api/business-formation/entities/:id
Delete business entity.

**Headers:**
```
Authorization: Bearer your_access_token
```

### Document Management Endpoints

#### GET /api/documents
Get user's documents.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by document type
- `entityId` (optional): Filter by business entity

#### POST /api/documents
Upload a new document.

**Headers:**
```
Authorization: Bearer your_access_token
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Document file
- `name`: Document name
- `type`: Document type
- `entityId` (optional): Associated business entity ID
- `description` (optional): Document description

#### GET /api/documents/:id
Get specific document details.

**Headers:**
```
Authorization: Bearer your_access_token
```

#### PUT /api/documents/:id
Update document metadata.

**Headers:**
```
Authorization: Bearer your_access_token
```

#### DELETE /api/documents/:id
Delete document.

**Headers:**
```
Authorization: Bearer your_access_token
```

#### GET /api/documents/:id/download
Download document file.

**Headers:**
```
Authorization: Bearer your_access_token
```

### AI Assistant Endpoints

#### POST /api/ai-assistant/chat
Send message to AI assistant.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Request Body:**
```json
{
  "message": "How do I form an LLC in Florida?",
  "context": {
    "entityId": "entity_id",
    "documentId": "document_id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "To form an LLC in Florida, you need to...",
    "disclaimer": "This information is for educational purposes only and does not constitute legal advice.",
    "attorneyReferral": {
      "recommended": true,
      "reason": "Complex legal question requiring professional advice"
    }
  }
}
```

#### GET /api/ai-assistant/conversations
Get user's AI conversations.

**Headers:**
```
Authorization: Bearer your_access_token
```

#### GET /api/ai-assistant/conversations/:id
Get specific conversation.

**Headers:**
```
Authorization: Bearer your_access_token
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get analytics dashboard data.

**Headers:**
```
Authorization: Bearer your_access_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userStats": {
      "totalEntities": 5,
      "totalDocuments": 23,
      "aiInteractions": 45
    },
    "recentActivity": [
      {
        "type": "ENTITY_CREATED",
        "description": "Created My Business LLC",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Health Check Endpoints

#### GET /health
Basic readiness probe (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

#### GET /health/detailed
Dependency health probe. When `ADMIN_HEALTH_TOKEN` is configured, requests must include the same value via the `x-health-token` header.

**Headers (optional):**
```
x-health-token: your_admin_token
```

**Success Response (200):**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "checks": {
    "database": {
      "status": "healthy",
      "latencyMs": 12
    }
  },
  "timestamp": "2025-09-30T16:45:00.000Z"
}
```

**Failure Response (503, example):**
```json
{
  "status": "error",
  "version": "0.1.0",
  "checks": {
    "database": {
      "status": "unhealthy",
      "latencyMs": 48,
      "message": "Database connectivity failed"
    }
  },
  "timestamp": "2025-09-30T16:46:00.000Z"
}
```
## Webhooks

### Webhook Events
- `user.registered` - User registration
- `entity.created` - Business entity created
- `entity.updated` - Business entity updated
- `document.uploaded` - Document uploaded
- `document.processed` - Document processing completed
- `payment.completed` - Payment processed
- `payment.failed` - Payment failed

### Webhook Configuration
```json
{
  "url": "https://your-app.com/webhooks/legalops",
  "events": ["user.registered", "entity.created"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload Example
```json
{
  "event": "entity.created",
  "data": {
    "id": "entity_id",
    "name": "My Business LLC",
    "type": "LLC",
    "state": "FL"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDKs

### JavaScript/Node.js
```bash
npm install @legalops/sdk
```

```javascript
const LegalOps = require('@legalops/sdk');

const client = new LegalOps({
  apiKey: 'your_api_key',
  environment: 'production' // or 'staging'
});

// Create business entity
const entity = await client.businessEntities.create({
  name: 'My Business LLC',
  type: 'LLC',
  state: 'FL'
});
```

### Python
```bash
pip install legalops-sdk
```

```python
from legalops import LegalOpsClient

client = LegalOpsClient(
    api_key='your_api_key',
    environment='production'
)

# Create business entity
entity = client.business_entities.create(
    name='My Business LLC',
    type='LLC',
    state='FL'
)
```

### PHP
```bash
composer require legalops/legalops-php
```

```php
use LegalOps\LegalOpsClient;

$client = new LegalOpsClient([
    'api_key' => 'your_api_key',
    'environment' => 'production'
]);

// Create business entity
$entity = $client->businessEntities->create([
    'name' => 'My Business LLC',
    'type' => 'LLC',
    'state' => 'FL'
]);
```

## Support

- **API Documentation**: https://docs.legalops.com/api
- **Support Email**: api-support@legalops.com
- **Status Page**: https://status.legalops.com
- **GitHub**: https://github.com/legalops/api-examples

---

**Last Updated**: 2025-01-17
**API Version**: v1.0.0
**Environment**: Production








