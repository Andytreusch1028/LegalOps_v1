# Error Tracking with Sentry Tutorial for VBA Developers

## Overview for VBA Background
Think of Sentry like having an automatic error handler that emails you whenever something goes wrong in your application. Instead of `On Error GoTo ErrorHandler`, Sentry catches all errors and tells you exactly what happened, when, and for which user.

---

## Why Error Tracking is Essential for LegalOps

### Business Impact:
- **Payment Failures:** Know immediately when customers can't pay for LLC formations
- **Document Upload Issues:** Alert when RA documents fail to upload
- **Form Submission Problems:** Catch invalid legal form submissions
- **User Experience:** Fix problems before customers complain

### Legal Compliance:
- **Audit Trail:** Track all system errors for compliance
- **Data Protection:** Know if sensitive data access fails
- **Service Reliability:** Ensure legal services are always available

---

## Step 1: Sentry Setup (15 minutes)

### Install Sentry
```bash
npm install @sentry/nextjs
```

### Initialize Sentry
```bash
npx @sentry/wizard -i nextjs
```

This wizard will:
1. Create a Sentry account (free)
2. Configure your project
3. Add necessary files to your project

---

## Step 2: Basic Configuration (10 minutes)

### Environment Variables (.env.local)
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Sentry Configuration (sentry.client.config.js)
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set sample rate for performance monitoring
  tracesSampleRate: 1.0,
  
  // Capture 100% of errors in development
  // Reduce in production to manage quota
  environment: process.env.NODE_ENV,
  
  // Don't send errors in development (optional)
  enabled: process.env.NODE_ENV === 'production',
});
```

---

## Step 3: Error Tracking for LegalOps Features (30 minutes)

### Payment Error Tracking
```typescript
// pages/api/create-payment-intent.ts
import * as Sentry from '@sentry/nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: {
        service: 'llc_formation',
        customer_id: userId,
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // Capture payment errors with context
    Sentry.captureException(error, {
      tags: {
        section: 'payment_processing',
        service: 'llc_formation',
      },
      user: {
        id: userId,
        email: userEmail,
      },
      extra: {
        amount: amount,
        payment_method: req.body.payment_method,
      },
    });

    console.error('Payment intent creation failed:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
}
```

### Document Upload Error Tracking
```typescript
// pages/api/upload-document.ts
import * as Sentry from '@sentry/nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const uploadResult = await uploadToS3(file, folder);
    
    // Log successful upload for audit
    await auditLog.create({
      action: 'document_uploaded',
      userId,
      details: { filename: file.name, size: file.size },
    });

    res.status(200).json(uploadResult);
  } catch (error) {
    // Capture upload errors with file details
    Sentry.captureException(error, {
      tags: {
        section: 'document_management',
        operation: 'upload',
      },
      user: { id: userId },
      extra: {
        filename: file?.name,
        fileSize: file?.size,
        folder: folder,
      },
    });

    res.status(500).json({ error: 'Document upload failed' });
  }
}
```

### Form Submission Error Tracking
```typescript
// pages/api/submit-llc-formation.ts
import * as Sentry from '@sentry/nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate form data
    const validatedData = llcFormSchema.parse(req.body);
    
    // Submit to state system
    const filingResult = await submitToFloridaState(validatedData);
    
    res.status(200).json(filingResult);
  } catch (error) {
    if (error instanceof ZodError) {
      // Capture validation errors
      Sentry.captureException(error, {
        tags: {
          section: 'form_validation',
          form_type: 'llc_formation',
        },
        user: { id: userId },
        extra: {
          validation_errors: error.errors,
          submitted_data: req.body,
        },
      });
    } else {
      // Capture state filing errors
      Sentry.captureException(error, {
        tags: {
          section: 'state_filing',
          state: 'florida',
        },
        user: { id: userId },
        extra: {
          form_data: validatedData,
        },
      });
    }

    res.status(500).json({ error: 'LLC formation submission failed' });
  }
}
```

---

## Step 4: Frontend Error Tracking (20 minutes)

### React Component Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import * as Sentry from '@sentry/nextjs';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
}

export default function ErrorBoundary({ children, fallback }: Props) {
  return (
    <SentryErrorBoundary
      fallback={fallback || ErrorFallback}
      beforeCapture={(scope) => {
        scope.setTag('errorBoundary', true);
      }}
    >
      {children}
    </SentryErrorBoundary>
  );
}

function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          We've been notified and are working to fix this issue.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
```

### Manual Error Capture in Components
```typescript
// components/PaymentForm.tsx
import * as Sentry from '@sentry/nextjs';

export default function PaymentForm() {
  const handlePayment = async (paymentData) => {
    try {
      const result = await processPayment(paymentData);
      // Handle success
    } catch (error) {
      // Capture client-side payment errors
      Sentry.captureException(error, {
        tags: {
          section: 'payment_form',
          component: 'PaymentForm',
        },
        extra: {
          payment_amount: paymentData.amount,
          payment_method: paymentData.method,
        },
      });

      // Show user-friendly error
      setError('Payment processing failed. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      {/* Payment form JSX */}
    </ErrorBoundary>
  );
}
```

---

## Step 5: Performance Monitoring (15 minutes)

### Track Business-Critical Operations
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function trackLLCFormationTime() {
  return Sentry.startTransaction({
    name: 'LLC Formation Process',
    op: 'business_process',
  });
}

export function trackDocumentDelivery() {
  return Sentry.startTransaction({
    name: 'Document Delivery',
    op: 'document_process',
  });
}

// Usage in API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const transaction = trackLLCFormationTime();
  
  try {
    // Process LLC formation
    const result = await processLLCFormation(req.body);
    
    transaction.setStatus('ok');
    res.status(200).json(result);
  } catch (error) {
    transaction.setStatus('internal_error');
    Sentry.captureException(error);
    res.status(500).json({ error: 'Formation failed' });
  } finally {
    transaction.finish();
  }
}
```

---

## Step 6: Custom Alerts for Legal Operations (10 minutes)

### Set Up Alerts in Sentry Dashboard
1. **Go to Sentry Dashboard** → Alerts
2. **Create Alert Rules:**

**Payment Failure Alert:**
- **Condition:** Error rate > 5% for payment_processing tag
- **Action:** Email immediately
- **Message:** "Payment processing errors detected"

**Document Upload Alert:**
- **Condition:** Any error with document_management tag
- **Action:** Email within 5 minutes
- **Message:** "Document upload issues detected"

**Form Validation Alert:**
- **Condition:** Error rate > 10% for form_validation tag
- **Action:** Email daily digest
- **Message:** "High form validation error rate"

---

## Step 7: Error Analysis and Response (10 minutes)

### Daily Error Review Process
1. **Check Sentry Dashboard** every morning
2. **Prioritize by business impact:**
   - Payment errors = Immediate fix
   - Document errors = Same day fix
   - Form errors = Weekly fix
3. **Track error trends** over time

### Error Response Workflow
```typescript
// When you receive a Sentry alert:

// 1. Assess impact
const errorImpact = {
  payment_errors: 'CRITICAL - Revenue impact',
  document_errors: 'HIGH - Customer service impact', 
  form_errors: 'MEDIUM - User experience impact',
};

// 2. Quick fix or workaround
// 3. Permanent solution
// 4. Update monitoring to prevent recurrence
```

---

## Step 8: Testing Your Error Tracking (10 minutes)

### Test Error Capture
```typescript
// Add temporary test endpoint
// pages/api/test-error.ts
import * as Sentry from '@sentry/nextjs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Test different error types
  if (req.query.type === 'payment') {
    Sentry.captureException(new Error('Test payment error'), {
      tags: { section: 'payment_processing' },
    });
  }
  
  if (req.query.type === 'document') {
    Sentry.captureException(new Error('Test document error'), {
      tags: { section: 'document_management' },
    });
  }

  res.status(500).json({ error: 'Test error sent to Sentry' });
}
```

### Verify in Sentry Dashboard
1. Visit `/api/test-error?type=payment`
2. Check Sentry dashboard for the error
3. Verify alert emails are sent
4. Remove test endpoint before production

---

## VBA Developer Benefits

### Compared to VBA Error Handling:
```vba
' VBA Error Handling
On Error GoTo ErrorHandler
' Your code here
Exit Sub

ErrorHandler:
    MsgBox "Error: " & Err.Description
    ' Error is only visible to current user
```

```typescript
// Sentry Error Handling
try {
  // Your code here
} catch (error) {
  Sentry.captureException(error);
  // Error is captured, analyzed, and you're notified
  // Includes user context, stack trace, and environment
}
```

### Advantages:
- **Automatic capture** - No manual error handling needed
- **Rich context** - User info, request details, stack traces
- **Centralized monitoring** - All errors in one dashboard
- **Alerting** - Get notified immediately of critical issues
- **Trends** - See error patterns over time

---

## Success Criteria

After implementing Sentry, you should have:
- [ ] All API endpoints wrapped with error capture
- [ ] Frontend components protected with error boundaries
- [ ] Custom alerts for business-critical errors
- [ ] Daily error review process established
- [ ] Performance monitoring for key operations

**Business Impact:** You'll know about problems before your customers do, ensuring reliable legal services and protecting your revenue.
