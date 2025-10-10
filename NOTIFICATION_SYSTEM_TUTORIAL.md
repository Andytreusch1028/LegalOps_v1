# Notification System Tutorial for VBA Developers

## Overview for VBA Background
Think of notifications like VBA's `MsgBox` function, but instead of showing a popup on one computer, you're sending messages to users wherever they are - email, SMS, or in-app notifications. It's like having a `MsgBox` that can reach users on their phone!

---

## Step 1: Email Notifications with Resend (20 minutes)

### Why Resend?
- **Simple API** (like VBA functions)
- **Great deliverability** (emails actually reach inbox)
- **Generous free tier** (3,000 emails/month)
- **Built for developers** (easy to integrate)

### Setup Resend
```bash
npm install resend
```

### Environment Variables (.env.local)
```bash
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

### Email Service (lib/email.ts)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent:', result.id);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false, error: error.message };
  }
}

// Pre-built email templates (like VBA UserForms)
export const emailTemplates = {
  documentReady: (customerName: string, documentType: string) => ({
    subject: 'New Document Available - LegalOps',
    html: `
      <h2>Hello ${customerName},</h2>
      <p>A new document is ready for download in your LegalOps portal:</p>
      <p><strong>Document Type:</strong> ${documentType}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents" 
         style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
         View Document
      </a></p>
      <p>Best regards,<br>LegalOps Team</p>
    `,
  }),

  orderComplete: (customerName: string, orderType: string) => ({
    subject: 'Order Complete - LegalOps',
    html: `
      <h2>Hello ${customerName},</h2>
      <p>Great news! Your ${orderType} order has been completed.</p>
      <p>All documents are now available in your dashboard.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" 
         style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
         View Order Details
      </a></p>
      <p>Best regards,<br>LegalOps Team</p>
    `,
  }),

  paymentReceived: (customerName: string, amount: number, service: string) => ({
    subject: 'Payment Received - LegalOps',
    html: `
      <h2>Hello ${customerName},</h2>
      <p>We've received your payment of $${amount} for ${service}.</p>
      <p>Your order is now being processed and you'll receive updates as we progress.</p>
      <p>Thank you for choosing LegalOps!</p>
      <p>Best regards,<br>LegalOps Team</p>
    `,
  }),
};
```

---

## Step 2: SMS Notifications with Twilio (25 minutes)

### Setup Twilio
```bash
npm install twilio
```

### Environment Variables
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### SMS Service (lib/sms.ts)
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SMSOptions) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log('SMS sent:', result.sid);
    return { success: true, id: result.sid };
  } catch (error) {
    console.error('SMS failed:', error);
    return { success: false, error: error.message };
  }
}

// SMS templates (keep them short!)
export const smsTemplates = {
  urgentDocument: (documentType: string) => 
    `🚨 URGENT: New ${documentType} document ready for download. Check your LegalOps dashboard immediately.`,

  orderComplete: (orderType: string) => 
    `✅ Your ${orderType} order is complete! Documents available in your LegalOps dashboard.`,

  paymentReminder: (amount: number, service: string) => 
    `💳 Reminder: $${amount} payment due for ${service}. Pay now to avoid service interruption.`,
};
```

---

## Step 3: In-App Notifications with Real-time Updates (35 minutes)

### Setup Pusher (Real-time service)
```bash
npm install pusher pusher-js
```

### Environment Variables
```bash
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2
```

### Pusher Service (lib/pusher.ts)
```typescript
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher (for sending notifications)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher (for receiving notifications)
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// Send real-time notification
export async function sendRealtimeNotification(userId: string, notification: any) {
  try {
    await pusherServer.trigger(`user-${userId}`, 'notification', notification);
    return { success: true };
  } catch (error) {
    console.error('Real-time notification failed:', error);
    return { success: false, error: error.message };
  }
}
```

### In-App Notification Component (components/NotificationCenter.tsx)
```typescript
import { useState, useEffect } from 'react';
import { pusherClient } from '../lib/pusher';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export default function NotificationCenter() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Subscribe to real-time notifications
    const channel = pusherClient.subscribe(`user-${session.user.id}`);
    
    channel.bind('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification (like VBA MsgBox)
      showToast(notification);
    });

    // Load existing notifications
    loadNotifications();

    return () => {
      pusherClient.unsubscribe(`user-${session.user.id}`);
    };
  }, [session]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const showToast = (notification: Notification) => {
    // Create toast notification (like VBA MsgBox but non-blocking)
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 bg-white border-l-4 ${
      notification.type === 'success' ? 'border-green-500' : 
      notification.type === 'error' ? 'border-red-500' : 
      notification.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
    } p-4 shadow-lg rounded z-50 max-w-sm`;
    
    toast.innerHTML = `
      <div class="flex">
        <div class="flex-1">
          <h4 class="font-semibold">${notification.title}</h4>
          <p class="text-sm text-gray-600">${notification.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-gray-400 hover:text-gray-600">×</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Step 4: Unified Notification System (30 minutes)

### Master Notification Service (lib/notifications.ts)
```typescript
import { sendEmail, emailTemplates } from './email';
import { sendSMS, smsTemplates } from './sms';
import { sendRealtimeNotification } from './pusher';

interface NotificationOptions {
  userId: string;
  type: 'document_ready' | 'order_complete' | 'payment_received' | 'urgent_alert';
  channels: ('email' | 'sms' | 'in_app')[];
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export async function sendNotification({
  userId,
  type,
  channels,
  data,
  priority
}: NotificationOptions) {
  const results = [];

  try {
    // Get user preferences and contact info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { notificationPreferences: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Send email notification
    if (channels.includes('email') && user.email) {
      const emailResult = await sendEmailNotification(user, type, data);
      results.push({ channel: 'email', ...emailResult });
    }

    // Send SMS notification (only for high/urgent priority)
    if (channels.includes('sms') && user.phone && ['high', 'urgent'].includes(priority)) {
      const smsResult = await sendSMSNotification(user, type, data);
      results.push({ channel: 'sms', ...smsResult });
    }

    // Send in-app notification
    if (channels.includes('in_app')) {
      const inAppResult = await sendInAppNotification(user, type, data);
      results.push({ channel: 'in_app', ...inAppResult });
    }

    // Log notification in database
    await prisma.notification.create({
      data: {
        userId,
        type,
        channels: channels.join(','),
        priority,
        data: JSON.stringify(data),
        sentAt: new Date(),
      },
    });

    return { success: true, results };
  } catch (error) {
    console.error('Notification failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmailNotification(user: any, type: string, data: any) {
  const templates = {
    document_ready: () => emailTemplates.documentReady(user.name, data.documentType),
    order_complete: () => emailTemplates.orderComplete(user.name, data.orderType),
    payment_received: () => emailTemplates.paymentReceived(user.name, data.amount, data.service),
  };

  const template = templates[type]?.();
  if (!template) {
    throw new Error(`No email template for type: ${type}`);
  }

  return await sendEmail({
    to: user.email,
    ...template,
  });
}

async function sendSMSNotification(user: any, type: string, data: any) {
  const templates = {
    document_ready: () => smsTemplates.urgentDocument(data.documentType),
    order_complete: () => smsTemplates.orderComplete(data.orderType),
    urgent_alert: () => data.message,
  };

  const message = templates[type]?.();
  if (!message) {
    throw new Error(`No SMS template for type: ${type}`);
  }

  return await sendSMS({
    to: user.phone,
    message,
  });
}

async function sendInAppNotification(user: any, type: string, data: any) {
  const notification = {
    id: `notif_${Date.now()}`,
    title: getNotificationTitle(type, data),
    message: getNotificationMessage(type, data),
    type: getNotificationType(type),
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  return await sendRealtimeNotification(user.id, notification);
}

function getNotificationTitle(type: string, data: any): string {
  const titles = {
    document_ready: 'New Document Available',
    order_complete: 'Order Complete',
    payment_received: 'Payment Received',
    urgent_alert: 'Urgent Alert',
  };
  return titles[type] || 'Notification';
}

function getNotificationMessage(type: string, data: any): string {
  const messages = {
    document_ready: `Your ${data.documentType} document is ready for download`,
    order_complete: `Your ${data.orderType} order has been completed`,
    payment_received: `Payment of $${data.amount} received for ${data.service}`,
    urgent_alert: data.message,
  };
  return messages[type] || 'You have a new notification';
}

function getNotificationType(type: string): 'info' | 'success' | 'warning' | 'error' {
  const types = {
    document_ready: 'info',
    order_complete: 'success',
    payment_received: 'success',
    urgent_alert: 'warning',
  };
  return types[type] || 'info';
}
```

---

## Step 5: Usage Examples (15 minutes)

### When RA Document is Uploaded
```typescript
// In your RA document upload handler
await sendNotification({
  userId: customerId,
  type: 'document_ready',
  channels: ['email', 'in_app', 'sms'], // SMS only if urgent
  data: {
    documentType: 'Legal Notice',
    description: 'Court summons received',
  },
  priority: 'high', // Will trigger SMS
});
```

### When Order is Complete
```typescript
// In your order completion handler
await sendNotification({
  userId: customerId,
  type: 'order_complete',
  channels: ['email', 'in_app'],
  data: {
    orderType: 'Florida LLC Formation',
    orderId: 'ORD-12345',
  },
  priority: 'medium',
});
```

### When Payment is Received
```typescript
// In your Stripe webhook handler
await sendNotification({
  userId: customerId,
  type: 'payment_received',
  channels: ['email', 'in_app'],
  data: {
    amount: 299,
    service: 'LLC Formation',
    paymentId: paymentIntent.id,
  },
  priority: 'low',
});
```

---

## Step 6: Testing Your Notification System (10 minutes)

### Testing Checklist
- [ ] Email notifications arrive in inbox (not spam)
- [ ] SMS notifications work on real phone numbers
- [ ] In-app notifications appear in real-time
- [ ] Notification preferences are respected
- [ ] Urgent notifications trigger SMS
- [ ] All notifications are logged in database

### Common VBA Developer Gotchas

1. **Async Nature**: Unlike VBA MsgBox, notifications are async
2. **Delivery Delays**: Email/SMS may take seconds to arrive
3. **Rate Limits**: Don't spam users with notifications
4. **User Preferences**: Always respect opt-out preferences

This notification system ensures your users never miss important RA documents or order updates!
