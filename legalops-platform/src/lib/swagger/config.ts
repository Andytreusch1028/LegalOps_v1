/**
 * OpenAPI/Swagger Configuration
 * 
 * Generates API documentation from JSDoc comments and TypeScript types.
 */

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'LegalOps Platform API',
    version: '1.0.0',
    description: 'API documentation for the LegalOps business formation platform',
    contact: {
      name: 'LegalOps Support',
      email: 'support@legalops.com',
    },
  },
  servers: [
    {
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              requestId: { type: 'string' },
            },
          },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          orderNumber: { type: 'string', example: 'ORD-2024-001' },
          orderStatus: { 
            type: 'string', 
            enum: ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'] 
          },
          paymentStatus: { 
            type: 'string', 
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] 
          },
          subtotal: { type: 'number', format: 'decimal' },
          tax: { type: 'number', format: 'decimal' },
          total: { type: 'number', format: 'decimal' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          paidAt: { type: 'string', format: 'date-time', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['id', 'userId', 'orderNumber', 'orderStatus', 'paymentStatus', 'subtotal', 'tax', 'total'],
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Path to API route files
};

export const swaggerSpec = swaggerJSDoc(options);