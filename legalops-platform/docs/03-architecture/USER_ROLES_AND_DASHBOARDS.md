# 👥 USER ROLES & DASHBOARD ARCHITECTURE
## LegalOps v1 - Complete Role System

---

## 📋 **OVERVIEW**

LegalOps serves **5 distinct user types**, each requiring a different dashboard experience:

1. **Individual Customer** - Managing personal businesses
2. **Professional Customer** - Managing client businesses (lawyers, accountants)
3. **Fulfillment Staff** - Processing daily orders
4. **Mid-Level Manager** - Overseeing operations
5. **Executive** - High-level business metrics

---

## 🎯 **USER ROLE DEFINITIONS**

### **EXTERNAL USERS (Customers)**

---

### **1. INDIVIDUAL CUSTOMER** 👤

**Profile:**
- Small business owner
- Entrepreneur with 1-5 businesses
- Real estate investor
- Side hustler

**Use Cases:**
- Form LLC for new business
- File annual reports for existing businesses
- Get EIN for new entity
- Estate planning documents
- Amend business information

**Dashboard Name:** "My Dashboard"

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Welcome back, John! 👋                                  │
├─────────────────────────────────────────────────────────┤
│ 🔔 ALERTS                                               │
│ • Annual Report due May 1 - Sunshine LLC               │
├─────────────────────────────────────────────────────────┤
│ MY BUSINESSES (2)                                       │
│ [Sunshine LLC] [Tech Innovations LLC] [+ Add New]      │
├─────────────────────────────────────────────────────────┤
│ QUICK STATS                                             │
│ [2 Active] [1 Pending] [5 Docs] [0 Tasks]             │
├─────────────────────────────────────────────────────────┤
│ POPULAR SERVICES                                        │
│ [Annual Report] [Form LLC] [Get EIN] [Estate Plan]    │
├─────────────────────────────────────────────────────────┤
│ RECENT ACTIVITY                                         │
│ • LLC Formation filed - Jan 15                         │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Simple, personal language ("My Businesses")
- ✅ Focus on individual's own entities
- ✅ Quick actions for common tasks
- ✅ Deadline reminders
- ✅ Document library

**Navigation:**
- My Businesses
- My Documents
- My Orders
- Services
- Support

---

### **2. PROFESSIONAL CUSTOMER** 👔

**Profile:**
- Attorney managing client businesses
- Accountant filing annual reports for clients
- Business services firm
- Corporate services provider

**Use Cases:**
- Manage 50-500 client businesses
- Bulk annual report filing
- Client billing and invoicing
- White-label services
- Multi-client document management

**Dashboard Name:** "Professional Dashboard"

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Smith & Associates Law Firm                             │
│ Managing 127 Client Businesses                          │
├─────────────────────────────────────────────────────────┤
│ 🔔 ALERTS                                               │
│ • 23 Annual Reports due this month                     │
│ • 5 Clients need attention                             │
├─────────────────────────────────────────────────────────┤
│ CLIENT SELECTOR                                         │
│ [Search clients...] [All Clients ▼]                    │
├─────────────────────────────────────────────────────────┤
│ QUICK STATS                                             │
│ [127 Clients] [342 Businesses] [23 Due] [15 Pending]  │
├─────────────────────────────────────────────────────────┤
│ BULK ACTIONS                                            │
│ [Bulk Annual Reports] [Bulk Amendments] [Export Data] │
├─────────────────────────────────────────────────────────┤
│ UPCOMING DEADLINES (23)                                 │
│ • ABC Corp - Annual Report - May 1                     │
│ • XYZ LLC - Annual Report - May 1                      │
│ • ... [View All]                                       │
├─────────────────────────────────────────────────────────┤
│ RECENT ACTIVITY                                         │
│ • 15 Annual Reports filed today                        │
│ • 3 New LLCs formed                                    │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Client management system
- ✅ Bulk operations (file 50 annual reports at once)
- ✅ Client billing and invoicing
- ✅ White-label options
- ✅ Advanced reporting
- ✅ Team collaboration
- ✅ Client portal access

**Navigation:**
- Clients
- Businesses
- Deadlines
- Billing
- Reports
- Team
- Settings

**Special Features:**
- **Client Switcher** - Dropdown to switch between clients
- **Bulk Filing** - Select multiple businesses, file all at once
- **Deadline Calendar** - See all client deadlines
- **Billing Dashboard** - Track billable work
- **Team Management** - Assign work to team members

---

### **INTERNAL USERS (LegalOps Staff)**

---

### **3. FULFILLMENT STAFF** 👷

**Profile:**
- Filing specialist
- Document processor
- Customer support agent
- Quality control reviewer

**Role:**
- Review AI-filled forms before submission
- Submit approved filings to Sunbiz
- Process documents
- Handle customer questions
- Update order status

**Dashboard Name:** "Fulfillment Queue"

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Fulfillment Queue - Sarah Johnson                      │
│ Today: 12 Pending | 8 Completed | 2 Issues             │
├─────────────────────────────────────────────────────────┤
│ MY QUEUE (12)                                           │
│ ┌─────────────────────────────────────────────────┐   │
│ │ #1234 - LLC Formation - Sunshine Consulting     │   │
│ │ Customer: John Doe                               │   │
│ │ AI Confidence: 95%                               │   │
│ │ Status: Ready for Review                         │   │
│ │ [Review Form] [Approve] [Reject]                │   │
│ └─────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ #1235 - Annual Report - Tech Innovations        │   │
│ │ Customer: John Doe                               │   │
│ │ AI Confidence: 92%                               │   │
│ │ Status: Ready for Review                         │   │
│ │ [Review Form] [Approve] [Reject]                │   │
│ └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ TODAY'S STATS                                           │
│ [8 Completed] [12 Pending] [2 Issues] [0 Overdue]     │
├─────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                           │
│ [Take Next] [View Issues] [My Completed]              │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Task queue (FIFO or priority-based)
- ✅ AI form review interface
- ✅ Screenshot preview
- ✅ Approve/reject workflow
- ✅ Customer communication
- ✅ Time tracking
- ✅ Performance metrics

**Navigation:**
- My Queue
- Completed
- Issues
- Help Docs
- Profile

---

### **4. MID-LEVEL MANAGER** 👨‍💼

**Profile:**
- Operations Manager
- Customer Success Manager
- Team Lead
- Quality Assurance Manager

**Role:**
- Oversee fulfillment team
- Monitor queue health
- Handle escalations
- Quality control
- Customer issue resolution
- Team performance tracking

**Dashboard Name:** "Operations Dashboard"

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Operations Dashboard - Manager View                    │
├─────────────────────────────────────────────────────────┤
│ QUEUE HEALTH                                            │
│ [45 Pending] [12 In Progress] [5 Issues] [2 Overdue]  │
│ Avg Wait Time: 2.3 hours | SLA: ✅ 95%                │
├─────────────────────────────────────────────────────────┤
│ TEAM PERFORMANCE (5 Staff)                             │
│ Sarah: 8 completed, 12 pending                         │
│ Mike: 12 completed, 8 pending                          │
│ Lisa: 10 completed, 10 pending                         │
│ [View Full Team Report]                                │
├─────────────────────────────────────────────────────────┤
│ ISSUES REQUIRING ATTENTION (5)                          │
│ • #1240 - Customer dispute - Needs manager review      │
│ • #1238 - AI confidence low (65%) - Needs review       │
│ [View All Issues]                                      │
├─────────────────────────────────────────────────────────┤
│ QUALITY METRICS                                         │
│ Accuracy: 98.5% | Customer Satisfaction: 4.8/5         │
│ Avg Processing Time: 3.2 hours                         │
├─────────────────────────────────────────────────────────┤
│ TODAY'S ACTIVITY                                        │
│ • 45 Orders received                                   │
│ • 38 Orders completed                                  │
│ • 5 Issues escalated                                   │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Team performance tracking
- ✅ Queue health monitoring
- ✅ Issue escalation management
- ✅ Quality metrics
- ✅ SLA tracking
- ✅ Customer satisfaction scores
- ✅ Staff assignment

**Navigation:**
- Queue Overview
- Team Performance
- Issues
- Quality Reports
- Customer Feedback
- Settings

---

### **5. EXECUTIVE** 👔

**Profile:**
- CEO / Founder
- COO
- CFO
- VP of Operations

**Role:**
- High-level business metrics
- Revenue tracking
- Growth analysis
- Strategic decisions
- Investor reporting

**Dashboard Name:** "Executive Dashboard"

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Executive Dashboard - LegalOps v1                       │
│ Last Updated: Today at 3:45 PM                         │
├─────────────────────────────────────────────────────────┤
│ KEY METRICS (This Month)                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ $125K    │ │ 450      │ │ 342      │ │ 4.8/5    │  │
│ │ Revenue  │ │ Orders   │ │ Customers│ │ CSAT     │  │
│ │ +15% MoM │ │ +22% MoM │ │ +18% MoM │ │ +0.2     │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│ REVENUE BREAKDOWN                                       │
│ LLC Formations: $45K (36%)                             │
│ Annual Reports: $35K (28%)                             │
│ Registered Agent: $25K (20%)                           │
│ Estate Planning: $15K (12%)                            │
│ Other: $5K (4%)                                        │
├─────────────────────────────────────────────────────────┤
│ GROWTH TRENDS (6 Months)                                │
│ [Revenue Chart] [Customer Chart] [Order Chart]         │
├─────────────────────────────────────────────────────────┤
│ OPERATIONAL EFFICIENCY                                  │
│ Avg Processing Time: 3.2 hours (Target: 4 hours) ✅   │
│ AI Success Rate: 95% (Target: 90%) ✅                 │
│ Customer Satisfaction: 4.8/5 (Target: 4.5) ✅         │
├─────────────────────────────────────────────────────────┤
│ TOP CUSTOMERS (By Revenue)                              │
│ 1. Smith & Associates Law - $12K/month                 │
│ 2. ABC Accounting Firm - $8K/month                     │
│ 3. Johnson Business Services - $6K/month               │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✅ Revenue metrics
- ✅ Growth trends
- ✅ Customer acquisition cost
- ✅ Lifetime value
- ✅ Profitability analysis
- ✅ Market share
- ✅ Competitive analysis

**Navigation:**
- Overview
- Revenue
- Customers
- Operations
- Marketing
- Reports

---

## 🗄️ **DATABASE SCHEMA FOR ROLES**

We need to update the User model to support roles:

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  password      String
  
  // Role System
  role          UserRole @default(INDIVIDUAL_CUSTOMER)
  
  // For Professional Customers
  companyName   String?  // "Smith & Associates Law Firm"
  isWhiteLabel  Boolean  @default(false)
  
  // For Internal Staff
  department    String?  // "Fulfillment", "Operations", "Executive"
  managerId     String?  // Reports to this manager
  manager       User?    @relation("ManagerSubordinates", fields: [managerId], references: [id])
  subordinates  User[]   @relation("ManagerSubordinates")
  
  // Relationships
  clients       Client[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum UserRole {
  // External Customers
  INDIVIDUAL_CUSTOMER      // John Doe managing his own businesses
  PROFESSIONAL_CUSTOMER    // Law firm managing client businesses
  
  // Internal Staff
  FULFILLMENT_STAFF       // Daily order processing
  MANAGER                 // Mid-level operations manager
  EXECUTIVE               // C-suite, high-level metrics
  
  // Special
  ADMIN                   // Full system access
}
```

---

## 🎯 **DASHBOARD ROUTING**

Based on user role, redirect to appropriate dashboard:

```typescript
// middleware.ts or dashboard/page.tsx

function getDashboardRoute(user: User): string {
  switch (user.role) {
    case 'INDIVIDUAL_CUSTOMER':
      return '/dashboard/customer';
    
    case 'PROFESSIONAL_CUSTOMER':
      return '/dashboard/professional';
    
    case 'FULFILLMENT_STAFF':
      return '/dashboard/fulfillment';
    
    case 'MANAGER':
      return '/dashboard/operations';
    
    case 'EXECUTIVE':
      return '/dashboard/executive';
    
    case 'ADMIN':
      return '/dashboard/admin';
    
    default:
      return '/dashboard';
  }
}
```

---

## ✅ **RECOMMENDED IMPLEMENTATION ORDER**

### **Phase 1: Individual Customer Dashboard** (Current Priority)
- Most common user type
- Simplest to build
- Foundation for other dashboards

### **Phase 2: Fulfillment Staff Dashboard**
- Critical for operations
- Needed to process orders
- AI form review interface

### **Phase 3: Professional Customer Dashboard**
- High-value customers
- Recurring revenue
- Bulk operations

### **Phase 4: Manager Dashboard**
- Operational oversight
- Team management
- Quality control

### **Phase 5: Executive Dashboard**
- Business metrics
- Strategic decisions
- Investor reporting

---

## 🤔 **QUESTIONS FOR YOU**

1. **Do you agree with these 5 role types?** Or should we add/remove any?

2. **Should we build role system NOW** or start with Individual Customer and add roles later?

3. **Professional Customers** - Do you want to support this from Day 1? (Law firms, accountants managing client businesses)

4. **White-Label** - Should Professional Customers be able to white-label the platform?

5. **Pricing** - Different pricing for different roles? (Individual vs Professional vs Enterprise)

---

**What do you think? Should I adjust anything before we proceed?** 🎯

