# Audit Logging Tutorial for VBA Developers

## Overview for VBA Background
Think of audit logging like keeping a detailed logbook of everything that happens in your application. Instead of manually writing notes like "User John accessed Document X at 2:30 PM," the system automatically records every important action with timestamps, user details, and context. It's like having a perfect memory of every business transaction.

---

## Why Audit Logging is Essential for Legal Operations

### Legal Compliance Requirements:
- **Document Access Tracking:** Who accessed which legal documents and when
- **Payment Records:** Complete trail of all financial transactions
- **Form Submissions:** Record of all LLC formations and state filings
- **Data Changes:** Track modifications to customer information

### Business Protection:
- **Liability Protection:** Prove compliance with legal requirements
- **Dispute Resolution:** Evidence for customer service issues
- **Security Monitoring:** Detect unauthorized access attempts
- **Performance Analysis:** Understand user behavior and system usage

### Regulatory Requirements:
- **UPL Compliance:** Demonstrate proper legal service delivery
- **Financial Audits:** Complete payment and refund history
- **Data Protection:** GDPR/CCPA compliance for data access
- **State Requirements:** Florida may require filing activity records

---

## Step 1: Audit Log Database Schema (20 minutes)

### Create Audit Log Table (schema.prisma)
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  
  // Who performed the action
  userId      String?
  userEmail   String?
  userRole    String?
  
  // What action was performed
  action      String   // e.g., "document_downloaded", "payment_processed"
  resource    String   // e.g., "llc_formation", "ra_document"
  resourceId  String?  // ID of the specific resource
  
  // When and where
  timestamp   DateTime @default(now())
  ipAddress   String?
  userAgent   String?
  
  // Additional context
  details     Json?    // Flexible field for action-specific data
  status      String   @default("success") // success, failure, pending
  
  // Categorization
  category    String   // payment, document, form, auth, system
  severity    String   @default("info") // info, warning, error, critical
  
  @@map("audit_logs")
  @@index([userId])
  @@index([action])
  @@index([timestamp])
  @@index([category])
}
```

### Run Database Migration
```bash
npx prisma db push
```

---

## Step 2: Audit Logging Service (30 minutes)

### Create Audit Logger (lib/audit.ts)
```typescript
import { prisma } from './prisma';

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  status?: 'success' | 'failure' | 'pending';
  category: 'payment' | 'document' | 'form' | 'auth' | 'system';
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export class AuditLogger {
  static async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          userRole: data.userRole,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          details: data.details,
          status: data.status || 'success',
          category: data.category,
          severity: data.severity || 'info',
          timestamp: new Date(),
        },
      });
    } catch (error) {
      // Never let audit logging break the main application
      console.error('Audit logging failed:', error);
      
      // Optionally send to external logging service
      // await sendToExternalLogger(data, error);
    }
  }

  // Convenience methods for common actions
  static async logPayment(data: {
    userId: string;
    userEmail: string;
    action: 'payment_initiated' | 'payment_completed' | 'payment_failed';
    amount: number;
    service: string;
    paymentId?: string;
    ipAddress?: string;
  }) {
    await this.log({
      userId: data.userId,
      userEmail: data.userEmail,
      action: data.action,
      resource: 'payment',
      resourceId: data.paymentId,
      ipAddress: data.ipAddress,
      category: 'payment',
      severity: data.action === 'payment_failed' ? 'error' : 'info',
      details: {
        amount: data.amount,
        service: data.service,
      },
    });
  }

  static async logDocumentAccess(data: {
    userId: string;
    userEmail: string;
    action: 'document_uploaded' | 'document_downloaded' | 'document_viewed';
    documentId: string;
    documentType: string;
    fileName?: string;
    ipAddress?: string;
  }) {
    await this.log({
      userId: data.userId,
      userEmail: data.userEmail,
      action: data.action,
      resource: 'document',
      resourceId: data.documentId,
      ipAddress: data.ipAddress,
      category: 'document',
      severity: 'info',
      details: {
        documentType: data.documentType,
        fileName: data.fileName,
      },
    });
  }

  static async logFormSubmission(data: {
    userId: string;
    userEmail: string;
    action: 'form_submitted' | 'form_validated' | 'form_rejected';
    formType: string;
    formId?: string;
    ipAddress?: string;
    validationErrors?: any[];
  }) {
    await this.log({
      userId: data.userId,
      userEmail: data.userEmail,
      action: data.action,
      resource: 'form',
      resourceId: data.formId,
      ipAddress: data.ipAddress,
      category: 'form',
      severity: data.action === 'form_rejected' ? 'warning' : 'info',
      details: {
        formType: data.formType,
        validationErrors: data.validationErrors,
      },
    });
  }

  static async logAuthentication(data: {
    userId?: string;
    userEmail: string;
    action: 'login_attempt' | 'login_success' | 'login_failed' | 'logout' | 'registration';
    ipAddress?: string;
    userAgent?: string;
    failureReason?: string;
  }) {
    await this.log({
      userId: data.userId,
      userEmail: data.userEmail,
      action: data.action,
      resource: 'authentication',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      category: 'auth',
      severity: data.action === 'login_failed' ? 'warning' : 'info',
      details: {
        failureReason: data.failureReason,
      },
    });
  }
}
```

---

## Step 3: Middleware for Automatic Logging (25 minutes)

### Request Logging Middleware (lib/middleware/audit.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { AuditLogger } from '../audit';

export function withAuditLogging(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const session = await getSession({ req });
    
    // Extract request info
    const ipAddress = req.headers['x-forwarded-for'] as string || 
                     req.connection.remoteAddress || 
                     'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    try {
      // Call the original handler
      const result = await handler(req, res);
      
      // Log successful API calls for sensitive endpoints
      if (shouldLogEndpoint(req.url)) {
        await AuditLogger.log({
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          action: `api_${req.method?.toLowerCase()}_success`,
          resource: 'api_endpoint',
          resourceId: req.url,
          ipAddress,
          userAgent,
          category: 'system',
          details: {
            endpoint: req.url,
            method: req.method,
            responseTime: Date.now() - startTime,
            statusCode: res.statusCode,
          },
        });
      }
      
      return result;
    } catch (error) {
      // Log API errors
      await AuditLogger.log({
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        action: `api_${req.method?.toLowerCase()}_error`,
        resource: 'api_endpoint',
        resourceId: req.url,
        ipAddress,
        userAgent,
        category: 'system',
        severity: 'error',
        status: 'failure',
        details: {
          endpoint: req.url,
          method: req.method,
          error: error.message,
          responseTime: Date.now() - startTime,
        },
      });
      
      throw error;
    }
  };
}

function shouldLogEndpoint(url?: string): boolean {
  if (!url) return false;
  
  // Log these sensitive endpoints
  const sensitiveEndpoints = [
    '/api/payments',
    '/api/documents',
    '/api/llc-formation',
    '/api/user',
    '/api/auth',
  ];
  
  return sensitiveEndpoints.some(endpoint => url.startsWith(endpoint));
}
```

---

## Step 4: Implement Audit Logging in Business Logic (40 minutes)

### Payment Processing with Audit Logging
```typescript
// pages/api/create-payment-intent.ts
import { withAuditLogging } from '../../lib/middleware/audit';
import { AuditLogger } from '../../lib/audit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { amount, service, userId } = req.body;
  const session = await getSession({ req });
  
  // Log payment initiation
  await AuditLogger.logPayment({
    userId: session.user.id,
    userEmail: session.user.email,
    action: 'payment_initiated',
    amount,
    service,
    ipAddress: req.headers['x-forwarded-for'] as string,
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: {
        userId: session.user.id,
        service,
      },
    });

    // Log successful payment intent creation
    await AuditLogger.logPayment({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'payment_completed',
      amount,
      service,
      paymentId: paymentIntent.id,
      ipAddress: req.headers['x-forwarded-for'] as string,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // Log payment failure
    await AuditLogger.logPayment({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'payment_failed',
      amount,
      service,
      ipAddress: req.headers['x-forwarded-for'] as string,
    });

    res.status(500).json({ error: 'Payment processing failed' });
  }
}

export default withAuditLogging(handler);
```

### Document Access with Audit Logging
```typescript
// pages/api/documents/[id]/download.ts
import { withAuditLogging } from '../../../lib/middleware/audit';
import { AuditLogger } from '../../../lib/audit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  try {
    // Verify user has access to document
    const document = await prisma.document.findFirst({
      where: {
        id: id as string,
        customerId: session.user.id,
      },
    });

    if (!document) {
      // Log unauthorized access attempt
      await AuditLogger.log({
        userId: session.user.id,
        userEmail: session.user.email,
        action: 'document_access_denied',
        resource: 'document',
        resourceId: id as string,
        ipAddress: req.headers['x-forwarded-for'] as string,
        category: 'document',
        severity: 'warning',
        status: 'failure',
        details: {
          reason: 'document_not_found_or_unauthorized',
        },
      });

      return res.status(404).json({ error: 'Document not found' });
    }

    // Log successful document access
    await AuditLogger.logDocumentAccess({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'document_downloaded',
      documentId: document.id,
      documentType: document.type,
      fileName: document.fileName,
      ipAddress: req.headers['x-forwarded-for'] as string,
    });

    // Return secure download URL
    res.status(200).json({
      downloadUrl: document.fileUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

  } catch (error) {
    await AuditLogger.log({
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      action: 'document_access_error',
      resource: 'document',
      resourceId: id as string,
      category: 'document',
      severity: 'error',
      status: 'failure',
      details: {
        error: error.message,
      },
    });

    res.status(500).json({ error: 'Document access failed' });
  }
}

export default withAuditLogging(handler);
```

### LLC Formation with Audit Logging
```typescript
// pages/api/submit-llc-formation.ts
import { withAuditLogging } from '../../lib/middleware/audit';
import { AuditLogger } from '../../lib/audit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  try {
    // Validate form data
    const validatedData = floridaLLCSchema.parse(req.body);
    
    // Log form validation success
    await AuditLogger.logFormSubmission({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'form_validated',
      formType: 'llc_formation',
      ipAddress: req.headers['x-forwarded-for'] as string,
    });

    // Process LLC formation
    const result = await processLLCFormation(validatedData);
    
    // Log successful submission
    await AuditLogger.logFormSubmission({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'form_submitted',
      formType: 'llc_formation',
      formId: result.id,
      ipAddress: req.headers['x-forwarded-for'] as string,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation errors
      await AuditLogger.logFormSubmission({
        userId: session.user.id,
        userEmail: session.user.email,
        action: 'form_rejected',
        formType: 'llc_formation',
        ipAddress: req.headers['x-forwarded-for'] as string,
        validationErrors: error.errors,
      });
    }

    res.status(500).json({ error: 'LLC formation submission failed' });
  }
}

export default withAuditLogging(handler);
```

---

## Step 5: Audit Log Viewing and Analysis (30 minutes)

### Admin Audit Log Viewer
```typescript
// pages/admin/audit-logs.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  timestamp: string;
  category: string;
  severity: string;
  status: string;
  details?: any;
}

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    dateFrom: '',
    dateTo: '',
    userEmail: '',
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/admin/audit-logs?${params}`);
    const data = await response.json();
    setLogs(data.logs);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      
      {/* Filters */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="payment">Payment</option>
          <option value="document">Document</option>
          <option value="form">Form</option>
          <option value="auth">Authentication</option>
          <option value="system">System</option>
        </select>
        
        <select
          value={filters.severity}
          onChange={(e) => setFilters({...filters, severity: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
        
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          className="border rounded px-3 py-2"
        />
        
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          className="border rounded px-3 py-2"
        />
        
        <input
          type="email"
          placeholder="User email"
          value={filters.userEmail}
          onChange={(e) => setFilters({...filters, userEmail: e.target.value})}
          className="border rounded px-3 py-2"
        />
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Resource</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Severity</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-2 text-sm">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm">{log.userEmail}</td>
                <td className="px-4 py-2 text-sm font-medium">{log.action}</td>
                <td className="px-4 py-2 text-sm">{log.resource}</td>
                <td className="px-4 py-2 text-sm">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {log.category}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {log.details && (
                    <details className="cursor-pointer">
                      <summary>View</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Step 6: Compliance Reports (20 minutes)

### Generate Compliance Reports
```typescript
// pages/api/admin/compliance-report.ts
import { withAuditLogging } from '../../../lib/middleware/audit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { startDate, endDate, reportType } = req.query;
  
  try {
    let report;
    
    switch (reportType) {
      case 'document_access':
        report = await generateDocumentAccessReport(startDate, endDate);
        break;
      case 'payment_activity':
        report = await generatePaymentActivityReport(startDate, endDate);
        break;
      case 'form_submissions':
        report = await generateFormSubmissionReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Report generation failed' });
  }
}

async function generateDocumentAccessReport(startDate: string, endDate: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      category: 'document',
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: { timestamp: 'desc' },
  });

  return {
    reportType: 'Document Access Report',
    period: { startDate, endDate },
    totalAccesses: logs.length,
    uniqueUsers: new Set(logs.map(log => log.userId)).size,
    accessesByType: logs.reduce((acc, log) => {
      const action = log.action;
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {}),
    logs,
  };
}

export default withAuditLogging(handler);
```

---

## VBA Developer Benefits

### Compared to Manual Logging:
```vba
' VBA Manual Logging (error-prone and incomplete)
Sub LogUserAction()
    Dim logFile As String
    logFile = "C:\Logs\user_actions.txt"
    
    Open logFile For Append As #1
    Print #1, Now() & " - User accessed document"
    Close #1
End Sub
```

```typescript
// Automatic Audit Logging (comprehensive and reliable)
await AuditLogger.logDocumentAccess({
  userId: user.id,
  userEmail: user.email,
  action: 'document_downloaded',
  documentId: doc.id,
  documentType: doc.type,
  ipAddress: req.ip,
});
```

### Advantages:
- **Automatic:** No manual logging required
- **Comprehensive:** Captures all relevant context
- **Searchable:** Query logs by user, action, date, etc.
- **Secure:** Tamper-proof database storage
- **Compliant:** Meets legal and regulatory requirements

---

## Success Criteria

After implementing audit logging, you should have:
- [ ] All business actions automatically logged
- [ ] Comprehensive payment transaction history
- [ ] Complete document access tracking
- [ ] Form submission and validation logging
- [ ] Authentication and security event logging
- [ ] Admin interface for viewing audit logs
- [ ] Compliance reporting capabilities
- [ ] Automated log retention and archival

**Business Impact:** Full legal compliance, dispute resolution capability, security monitoring, and regulatory audit readiness for your legal operations platform.
