# Stripe Payment Integration Tutorial for VBA Developers

## Overview for VBA Background
Think of Stripe like a VBA function that handles money - you send it payment details, it processes the payment, and returns success/failure. But instead of `MsgBox "Payment Complete"`, you get webhooks and detailed transaction data.

---

## Step 1: Stripe Account Setup (15 minutes)

### Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete business verification (you'll need your business info)
3. Get your API keys from Dashboard → Developers → API keys
4. **Important:** Start with test keys (they begin with `pk_test_` and `sk_test_`)

### Environment Variables
Add to your `.env.local` file:
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Step 2: Install Stripe SDK (5 minutes)

```bash
npm install stripe @stripe/stripe-js
npm install @types/stripe --save-dev  # TypeScript types
```

---

## Step 3: Basic Payment Setup (30 minutes)

### Create Stripe Client (lib/stripe.ts)
```typescript
import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Client-side Stripe instance
import { loadStripe } from '@stripe/stripe-js';
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

### Payment Intent API Route (pages/api/create-payment-intent.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../lib/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', metadata } = req.body;

    // Create payment intent (like preparing a VBA transaction)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency,
      metadata, // Store order info here
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
}
```

---

## Step 4: Payment Form Component (45 minutes)

### Payment Form (components/PaymentForm.tsx)
```typescript
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ amount, description, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe hasn't loaded yet
    }

    setLoading(true);

    try {
      // Create payment intent on server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          metadata: {
            description,
            // Add any other order details
          },
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment (like clicking "OK" in VBA dialog)
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        onError(result.error.message || 'Payment failed');
      } else {
        onSuccess(result.paymentIntent);
      }
    } catch (error) {
      onError('Payment processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
```

---

## Step 5: Business-Specific Payment Flows (30 minutes)

### LLC Formation Payment
```typescript
// pages/llc-formation/payment.tsx
import PaymentForm from '../../components/PaymentForm';

export default function LLCFormationPayment() {
  const handlePaymentSuccess = async (paymentIntent: any) => {
    // Create order in database
    const order = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'llc_formation',
        state: 'florida',
        paymentIntentId: paymentIntent.id,
        amount: 299,
        status: 'paid',
      }),
    });

    // Redirect to order confirmation
    window.location.href = '/orders/confirmation';
  };

  return (
    <div className="max-w-md mx-auto">
      <h1>Complete Your LLC Formation</h1>
      <div className="mb-4">
        <p>Florida LLC Formation: $299</p>
        <p>Includes: Articles of Organization, Registered Agent (1 year)</p>
      </div>
      
      <PaymentForm
        amount={299}
        description="Florida LLC Formation"
        onSuccess={handlePaymentSuccess}
        onError={(error) => alert(error)}
      />
    </div>
  );
}
```

### Registered Agent Annual Payment
```typescript
// components/RASubscriptionPayment.tsx
import { useState } from 'react';

export default function RASubscriptionPayment({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async () => {
    setLoading(true);
    
    try {
      // Create subscription for annual RA service
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          priceId: 'price_ra_annual_199', // Stripe price ID
          description: 'Registered Agent Service - Annual',
        }),
      });

      const { subscriptionId } = await response.json();
      
      // Redirect to success page
      window.location.href = `/subscriptions/${subscriptionId}/success`;
    } catch (error) {
      alert('Subscription creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscription}
      disabled={loading}
      className="bg-green-600 text-white py-2 px-4 rounded"
    >
      {loading ? 'Setting up...' : 'Subscribe to RA Service ($199/year)'}
    </button>
  );
}
```

---

## Step 6: Webhook Handling (30 minutes)

### Webhook Endpoint (pages/api/webhooks/stripe.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';
import Stripe from 'stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handleSubscriptionPayment(invoice);
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      await handleNewSubscription(subscription);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // Update order status in database
  // Send confirmation email
  // Trigger document generation
  console.log('Payment succeeded:', paymentIntent.id);
}

async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  // Extend RA service for another year
  // Send receipt email
  console.log('Subscription payment:', invoice.id);
}

async function handleNewSubscription(subscription: Stripe.Subscription) {
  // Set up new RA service
  // Send welcome email
  console.log('New subscription:', subscription.id);
}

// Important: Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
```

---

## Step 7: Testing Your Integration (20 minutes)

### Test Card Numbers
```typescript
// Use these in development
const testCards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  requiresAuth: '4000002500003155',
};
```

### Testing Checklist
- [ ] Successful payment flow
- [ ] Failed payment handling
- [ ] Webhook event processing
- [ ] Order creation in database
- [ ] Email notifications
- [ ] Subscription billing

---

## Common VBA Developer Gotchas

### 1. Amounts in Cents
```typescript
// VBA thinking: amount = 299
// Stripe reality: amount = 29900 (cents)
const amount = 299 * 100; // Always multiply by 100
```

### 2. Async Operations
```typescript
// VBA: Immediate response
// Web: Everything is async
await stripe.paymentIntents.create(...);
```

### 3. Error Handling
```typescript
// VBA: On Error GoTo
// Web: try/catch blocks
try {
  const payment = await stripe.paymentIntents.create(...);
} catch (error) {
  console.error('Payment failed:', error);
}
```

---

## Next Steps

1. **Week 1:** Set up Stripe account and basic payment form
2. **Week 2:** Implement LLC formation payment flow
3. **Week 3:** Add subscription billing for RA services
4. **Week 4:** Set up webhooks and order management

This integration will handle all your payment needs for the LegalOps platform!
