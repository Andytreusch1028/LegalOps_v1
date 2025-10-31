# Feedback System Documentation

**Phase 7: Smart + Safe Experience Overhaul**  
**Status:** ✅ Complete and Production-Ready

---

## Overview

The Feedback System allows you to collect real-time user feedback throughout the LegalOps platform using the **FeedbackBeacon** component. This helps you identify confusing pages, track customer satisfaction, and continuously improve the user experience.

---

## How It Works

### 1. **FeedbackBeacon Component**

Place this component anywhere on your site to ask users "Was this clear?"

```tsx
import { FeedbackBeacon } from '@/components/phase7';

<FeedbackBeacon
  feedbackId="llc-formation-step-2"
  question="Was this step clear?"
  position="bottom-right"
  autoShowDelay={3000}
/>
```

**Props:**
- `feedbackId` - Unique identifier for this feedback point (e.g., "checkout-payment", "annual-report-form")
- `question` - Custom question to ask (default: "Was this clear?")
- `position` - Where to show the beacon: `bottom-right`, `bottom-left`, `top-right`, `top-left`
- `autoShowDelay` - Milliseconds before auto-showing (default: 3000ms)

### 2. **User Interaction**

When a user clicks the beacon:
1. They see 👍 **Yes** or 👎 **No** buttons
2. If they click **No**, a text box appears asking "What was confusing?"
3. Their feedback is saved to the database with:
   - What page they were on
   - Whether they said Yes or No
   - Their comment (if provided)
   - Timestamp
   - User ID (if logged in) or "Guest"
   - Browser info and IP (for spam detection)

### 3. **Data Storage**

All feedback is saved to the `feedback` table in PostgreSQL:

```prisma
model Feedback {
  id          String   @id @default(cuid())
  feedbackId  String   // e.g., "llc-formation-step-2"
  positive    Boolean  // true = thumbs up, false = thumbs down
  comment     String?  // Optional comment
  url         String   // What page they were on
  userId      String?  // If logged in
  user        User?    @relation(...)
  userAgent   String?  // Browser info
  ipAddress   String?  // For spam detection
  createdAt   DateTime @default(now())
}
```

---

## Admin Dashboard

View all feedback at: **`/admin/feedback`**

### Features:

**📊 Stats Cards:**
- **Total Feedback** - How many responses you've received
- **Positive** - Number of 👍 responses
- **Negative** - Number of 👎 responses
- **Confusion Rate** - Percentage of negative feedback

**🚨 Problem Pages:**
- Shows pages with the most negative feedback
- Sorted by number of complaints
- Helps you prioritize improvements

**📋 Recent Feedback Table:**
- Last 50 feedback entries
- Shows date, page, positive/negative, comment, and user
- Filterable and sortable

---

## API Endpoints

### **GET /api/feedback**

Fetch feedback programmatically.

**Query Parameters:**
- `feedbackId` - Filter by specific page (e.g., `?feedbackId=checkout-payment`)
- `positive` - Filter by sentiment (e.g., `?positive=false` for negative only)
- `limit` - Number of results (default: 50)

**Example:**
```bash
GET /api/feedback?feedbackId=llc-formation-step-2&positive=false&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "feedback": [
    {
      "id": "clx123...",
      "feedbackId": "llc-formation-step-2",
      "positive": false,
      "comment": "I didn't understand what 'authorized shares' means",
      "url": "/services/llc-formation",
      "createdAt": "2025-10-31T23:45:00Z",
      "user": {
        "email": "customer@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

### **POST /api/feedback**

Submit new feedback (called automatically by FeedbackBeacon).

**Request Body:**
```json
{
  "feedbackId": "checkout-payment",
  "positive": false,
  "comment": "The payment form didn't load",
  "timestamp": "2025-10-31T23:45:00Z",
  "url": "/checkout/payment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback received",
  "feedbackId": "clx123..."
}
```

---

## Where to Add FeedbackBeacons

### **Recommended Locations:**

1. **Multi-Step Forms** - After each step
   ```tsx
   <FeedbackBeacon feedbackId="llc-formation-step-1" />
   <FeedbackBeacon feedbackId="llc-formation-step-2" />
   <FeedbackBeacon feedbackId="llc-formation-step-3" />
   ```

2. **Checkout Pages**
   ```tsx
   <FeedbackBeacon feedbackId="checkout-payment" />
   <FeedbackBeacon feedbackId="checkout-review" />
   ```

3. **Service Detail Pages**
   ```tsx
   <FeedbackBeacon feedbackId="service-llc-formation" />
   <FeedbackBeacon feedbackId="service-annual-report" />
   ```

4. **Dashboard Pages**
   ```tsx
   <FeedbackBeacon feedbackId="dashboard-orders" />
   <FeedbackBeacon feedbackId="dashboard-documents" />
   ```

5. **Help/FAQ Pages**
   ```tsx
   <FeedbackBeacon feedbackId="help-registered-agent" />
   <FeedbackBeacon feedbackId="faq-ein-application" />
   ```

---

## Analytics & Insights

### **Key Metrics to Track:**

1. **Confusion Rate by Page**
   - Which pages have the highest % of negative feedback?
   - Prioritize improvements for pages with >20% confusion rate

2. **Common Complaints**
   - Read comments to identify patterns
   - Example: If 10 people say "I don't understand authorized shares", add a tooltip

3. **Improvement Trends**
   - After fixing a confusing page, did the confusion rate drop?
   - Track before/after metrics

4. **User Segment Analysis**
   - Do logged-in users have different confusion rates than guests?
   - Do certain user types struggle more?

---

## Best Practices

### **DO:**
✅ Place beacons on complex pages (multi-step forms, checkout, technical content)  
✅ Use descriptive `feedbackId` values (e.g., "llc-formation-step-2-registered-agent")  
✅ Review feedback weekly and prioritize fixes  
✅ Respond to patterns (if 5+ people complain about the same thing, fix it)  
✅ Test changes and monitor if confusion rate drops  

### **DON'T:**
❌ Add beacons to every single page (too much noise)  
❌ Ignore negative feedback (defeats the purpose)  
❌ Use vague `feedbackId` values (e.g., "page1", "form")  
❌ Ask for feedback on simple pages (e.g., "About Us")  
❌ Spam users with multiple beacons on one page  

---

## Database Migration

The feedback system was added via migration:

```bash
Migration: 20251031235036_add_feedback_system
```

**To apply:**
```bash
cd legalops-platform
npx prisma migrate deploy
npx prisma generate
```

---

## Example: Real-World Usage

**Scenario:** You notice the LLC Formation wizard has a 35% confusion rate on Step 2.

**Steps:**
1. Go to `/admin/feedback`
2. Click on "llc-formation-step-2" in the Problem Pages section
3. Read the comments:
   - "What are authorized shares?"
   - "I don't know how many shares to choose"
   - "Is this the same as ownership percentage?"
4. **Fix:** Add a tooltip explaining authorized shares with an example
5. **Monitor:** Check if confusion rate drops to <15% over the next week

---

## Security & Privacy

- **IP Addresses** are stored for spam detection only (not shown to users)
- **User Agent** helps identify browser-specific issues
- **Guest Feedback** is allowed (no login required)
- **No PII** is collected beyond what's already in the User table
- **GDPR Compliant** - Users can request deletion of their feedback

---

## Future Enhancements

**Potential Additions:**
- 📊 **Export to CSV** - Download feedback for analysis
- 📈 **Trend Charts** - Visualize confusion rate over time
- 🔔 **Slack Notifications** - Alert team when confusion rate spikes
- 🤖 **AI Summarization** - Automatically categorize common complaints
- 📧 **Email Digest** - Weekly summary of top issues

---

## Summary

The Feedback System is **production-ready** and provides:
- ✅ Real-time user feedback collection
- ✅ Admin dashboard with stats and insights
- ✅ API endpoints for programmatic access
- ✅ Database storage with user tracking
- ✅ Spam detection (IP + User Agent)
- ✅ Guest and logged-in user support

**Next Steps:**
1. Add FeedbackBeacon components to key pages
2. Monitor `/admin/feedback` weekly
3. Prioritize fixes for pages with high confusion rates
4. Track improvement trends over time

---

**Questions?** Check the Phase 7 documentation or review the FeedbackBeacon component source code.

