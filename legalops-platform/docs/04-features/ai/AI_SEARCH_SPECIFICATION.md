# AI-Powered Natural Language Search System
## Technical Specification for LegalOps v1

**Version:** 1.0  
**Target Implementation:** Month 4-5 (Advanced Features Phase)  
**Priority:** High (Major productivity enhancement)  
**Estimated Development Time:** 3-4 weeks

---

## 1. Executive Summary

This specification outlines an AI-powered natural language search system that allows administrators to query the LegalOps database using plain English. Instead of writing SQL queries or navigating complex admin interfaces, users can ask questions like "Show me all customers with pending annual reports" and receive instant, formatted results.

### Key Benefits
- **10x faster data retrieval** - No need to navigate multiple pages or write queries
- **Reduced training time** - New staff can find data without learning complex systems
- **Better insights** - AI can suggest related queries and identify patterns
- **Legal compliance** - Easy access to disclaimer logs and audit trails
- **Customer service** - Quickly find customer information during support calls

---

## 2. User Stories

### Admin User Stories
1. **As an admin**, I want to find all customers who accepted address disclaimers in the last 30 days, so I can review potential liability issues.
2. **As an admin**, I want to search for customers with upcoming annual report deadlines, so I can send proactive reminders.
3. **As an admin**, I want to find all unverified addresses in a specific city, so I can follow up with customers.
4. **As a support agent**, I want to quickly pull up a customer's complete filing history, so I can answer their questions.
5. **As a manager**, I want to see monthly revenue trends by service type, so I can make business decisions.

### Example Queries
```
"Show me all customers who accepted address disclaimers in the last 30 days"
"Find customers with unverified addresses in Miami"
"List all annual report filings pending approval"
"Which customers have overdue payments?"
"Show me all LLC formations filed in December 2024"
"Find customers who haven't logged in for 60+ days"
"What are the most common address validation issues?"
"Show me customers with upcoming annual report deadlines in the next 14 days"
"List all customers who used the registered agent service"
"Find all filings that were rejected by the state"
"Show me revenue by service type for Q4 2024"
"Which customers have the highest lifetime value?"
```

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────┐
│  Admin Dashboard│
│   (React UI)    │
└────────┬────────┘
         │
         │ Natural Language Query
         ▼
┌─────────────────┐
│  AI Search API  │
│  (Next.js API)  │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│   OpenAI/Claude │  │  Query Cache │  │  Audit Log   │
│   Text-to-SQL   │  │   (Redis)    │  │ (Database)   │
└────────┬────────┘  └──────────────┘  └──────────────┘
         │
         │ Generated SQL
         ▼
┌─────────────────┐
│  Query Validator│
│  & Sanitizer    │
└────────┬────────┘
         │
         │ Safe SQL
         ▼
┌─────────────────┐
│    Database     │
│  (PostgreSQL)   │
└────────┬────────┘
         │
         │ Results
         ▼
┌─────────────────┐
│  Result Formatter│
│  & Exporter     │
└─────────────────┘
```

### 3.2 Technology Stack

**Frontend:**
- React 18+ with TypeScript
- TailwindCSS for styling
- React Query for data fetching
- Recharts for data visualization
- Export libraries: jsPDF, xlsx

**Backend:**
- Next.js 15 API Routes
- OpenAI GPT-4 API or Anthropic Claude API
- PostgreSQL database
- Redis for query caching
- Zod for validation

**Security:**
- Role-based access control (RBAC)
- SQL injection prevention
- Query allowlist/blocklist
- Rate limiting
- Audit logging

---

## 4. Database Schema

### 4.1 New Tables Required

```sql
-- AI Search Query Log
CREATE TABLE ai_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  natural_language_query TEXT NOT NULL,
  generated_sql TEXT NOT NULL,
  execution_time_ms INTEGER,
  result_count INTEGER,
  was_successful BOOLEAN DEFAULT true,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_user_queries (user_id, created_at DESC),
  INDEX idx_query_timestamp (created_at DESC)
);

-- Saved Search Templates
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- NULL = global template
  name VARCHAR(255) NOT NULL,
  description TEXT,
  natural_language_query TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_user_saved_searches (user_id),
  INDEX idx_public_searches (is_public, usage_count DESC)
);

-- Query Favorites (for quick access)
CREATE TABLE query_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  saved_search_id UUID REFERENCES saved_searches(id),
  custom_query TEXT, -- If not using saved search
  display_name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, saved_search_id),
  INDEX idx_user_favorites (user_id, sort_order)
);

-- Scheduled Reports (run queries automatically)
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  natural_language_query TEXT NOT NULL,
  schedule_cron VARCHAR(100) NOT NULL, -- e.g., "0 9 * * 1" (every Monday at 9am)
  email_recipients TEXT[], -- Array of email addresses
  export_format VARCHAR(20) DEFAULT 'csv', -- csv, pdf, xlsx
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_active_schedules (is_active, next_run_at)
);
```

---

## 5. API Endpoints

### 5.1 POST /api/ai-search/query

Execute a natural language search query.

**Request:**
```typescript
{
  query: string;              // Natural language query
  maxResults?: number;        // Default: 100, Max: 1000
  exportFormat?: 'json' | 'csv' | 'pdf' | 'xlsx';
}
```

**Response:**
```typescript
{
  success: boolean;
  query: {
    original: string;         // Original natural language query
    interpreted: string;      // How AI interpreted it
    sql: string;              // Generated SQL (for transparency)
    executionTimeMs: number;
  };
  results: {
    columns: string[];        // Column names
    rows: any[][];            // Data rows
    totalCount: number;
    hasMore: boolean;
  };
  suggestions?: string[];     // Related queries AI suggests
  warnings?: string[];        // Any warnings (e.g., "Large result set")
}
```

**Example:**
```typescript
// Request
POST /api/ai-search/query
{
  "query": "Show me all customers with pending annual reports",
  "maxResults": 50
}

// Response
{
  "success": true,
  "query": {
    "original": "Show me all customers with pending annual reports",
    "interpreted": "Find customers who have annual report filings with status 'pending'",
    "sql": "SELECT c.id, c.name, c.email, f.filing_type, f.status, f.created_at FROM customers c JOIN filings f ON c.id = f.customer_id WHERE f.filing_type = 'ANNUAL_REPORT' AND f.status = 'pending' ORDER BY f.created_at DESC LIMIT 50",
    "executionTimeMs": 234
  },
  "results": {
    "columns": ["id", "name", "email", "filing_type", "status", "created_at"],
    "rows": [
      ["uuid-123", "John Doe", "john@example.com", "ANNUAL_REPORT", "pending", "2024-01-15T10:30:00Z"],
      // ... more rows
    ],
    "totalCount": 47,
    "hasMore": false
  },
  "suggestions": [
    "Show me pending annual reports older than 30 days",
    "Find customers with multiple pending filings"
  ]
}
```

### 5.2 GET /api/ai-search/templates

Get pre-built query templates.

**Response:**
```typescript
{
  categories: {
    name: string;
    templates: {
      id: string;
      name: string;
      description: string;
      query: string;
      usageCount: number;
    }[];
  }[];
}
```

### 5.3 POST /api/ai-search/save

Save a query as a template or favorite.

### 5.4 GET /api/ai-search/history

Get user's query history.

### 5.5 POST /api/ai-search/schedule

Create a scheduled report.

---

## 6. AI Integration

### 6.1 Text-to-SQL Conversion

**Approach:** Use OpenAI GPT-4 or Anthropic Claude with function calling to convert natural language to SQL.

**System Prompt:**
```
You are a SQL query generator for the LegalOps legal services platform.

DATABASE SCHEMA:
- customers (id, name, email, phone, created_at, status)
- filings (id, customer_id, filing_type, status, state, created_at, updated_at)
- disclaimer_acceptances (id, customer_id, timestamp, issue_type, address_used)
- payments (id, customer_id, amount, status, created_at)
- addresses (id, customer_id, address_type, street, city, state, zip, is_verified)

RULES:
1. Only generate SELECT queries (no INSERT, UPDATE, DELETE)
2. Always include LIMIT clause (max 1000)
3. Use parameterized queries to prevent SQL injection
4. Join tables when needed for complete information
5. Use proper date filtering with timezone awareness
6. Return user-friendly column aliases

Convert the following natural language query to SQL:
```

**Example Conversion:**
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userQuery }
  ],
  functions: [{
    name: "generate_sql",
    parameters: {
      type: "object",
      properties: {
        sql: { type: "string", description: "The generated SQL query" },
        interpretation: { type: "string", description: "How you interpreted the query" },
        tables_used: { type: "array", items: { type: "string" } }
      }
    }
  }],
  function_call: { name: "generate_sql" }
});
```

### 6.2 Query Validation & Security

**Validation Rules:**
```typescript
const ALLOWED_OPERATIONS = ['SELECT'];
const BLOCKED_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'TRUNCATE', 'ALTER'];
const MAX_JOINS = 5;
const MAX_LIMIT = 1000;

function validateSQL(sql: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for blocked keywords
  const upperSQL = sql.toUpperCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (upperSQL.includes(keyword)) {
      errors.push(`Blocked keyword: ${keyword}`);
    }
  }
  
  // Ensure it's a SELECT query
  if (!upperSQL.trim().startsWith('SELECT')) {
    errors.push('Only SELECT queries are allowed');
  }
  
  // Check for LIMIT clause
  if (!upperSQL.includes('LIMIT')) {
    errors.push('Query must include LIMIT clause');
  }
  
  // Count JOINs
  const joinCount = (upperSQL.match(/JOIN/g) || []).length;
  if (joinCount > MAX_JOINS) {
    errors.push(`Too many joins (${joinCount}), max is ${MAX_JOINS}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 7. User Interface Design

### 7.1 Search Interface

**Location:** Admin Dashboard → AI Search (new top-level menu item)

**Components:**

1. **Search Bar**
   - Large, prominent search input
   - Placeholder: "Ask anything about your data..."
   - Auto-suggestions as user types
   - Voice input option (future enhancement)

2. **Quick Templates**
   - Grid of common query cards
   - Categories: Customers, Filings, Disclaimers, Payments, Reports
   - One-click to run template

3. **Results Display**
   - Data table with sorting/filtering
   - Column visibility toggles
   - Pagination
   - Export buttons (CSV, PDF, Excel)
   - "Refine Query" button to modify

4. **Query History Sidebar**
   - Recent queries (last 10)
   - Saved favorites
   - Click to re-run

5. **AI Insights Panel**
   - "You might also want to..."
   - Related queries
   - Data quality warnings

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│  LegalOps Admin Dashboard                    [User Menu]    │
├─────────────────────────────────────────────────────────────┤
│  Dashboard | Customers | Filings | [AI Search] | Settings  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔍  Ask anything about your data...          [🎤]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Quick Templates:                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 📋 Pending   │ │ ⚠️ Unverified│ │ 💰 Revenue   │        │
│  │ Filings      │ │ Addresses    │ │ This Month   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  Results (47 found):                    [CSV] [PDF] [Excel] │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Name          │ Email           │ Status  │ Date    │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ John Doe      │ john@ex.com     │ Pending │ 1/15/24 │    │
│  │ Jane Smith    │ jane@ex.com     │ Pending │ 1/14/24 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  💡 You might also want to:                                  │
│  • Show pending filings older than 30 days                   │
│  • Find customers with multiple pending filings              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Set up database schema for query logging
- [ ] Create basic API endpoint structure
- [ ] Integrate OpenAI/Claude API
- [ ] Build query validator and sanitizer
- [ ] Implement basic text-to-SQL conversion

### Phase 2: Core Features (Week 2-3)
- [ ] Build React UI components
- [ ] Implement result display and export
- [ ] Add query templates system
- [ ] Create query history functionality
- [ ] Add caching layer (Redis)

### Phase 3: Advanced Features (Week 3-4)
- [ ] Implement saved searches
- [ ] Add scheduled reports
- [ ] Build AI suggestions engine
- [ ] Add data visualization options
- [ ] Implement role-based access control

### Phase 4: Polish & Testing (Week 4)
- [ ] Security audit and penetration testing
- [ ] Performance optimization
- [ ] User acceptance testing
- [ ] Documentation and training materials
- [ ] Deploy to production

---

## 9. Security Considerations

### 9.1 Access Control
- Only admin users can access AI search
- Role-based permissions for sensitive data
- Audit log of all queries

### 9.2 SQL Injection Prevention
- Parameterized queries only
- Query validation before execution
- Allowlist of safe SQL operations
- Blocklist of dangerous keywords

### 9.3 Data Privacy
- Mask sensitive data in results (SSN, credit cards)
- Respect customer privacy settings
- GDPR compliance for data exports

### 9.4 Rate Limiting
- Max 100 queries per user per hour
- Max 10 queries per minute
- Prevent abuse and API cost overruns

---

## 10. Cost Estimation

### AI API Costs (Monthly)
- OpenAI GPT-4: ~$0.03 per query (1000 tokens avg)
- Estimated 1000 queries/month = **$30/month**
- Claude: Similar pricing

### Infrastructure
- Redis caching: **$10/month** (reduces repeat queries)
- Additional database storage: **$5/month**

**Total Estimated Cost: $45/month**

**ROI:** Saves 10+ hours/week of manual data searching = **$400+/week value**

---

## 11. Success Metrics

- **Adoption Rate:** 80%+ of admin users use AI search weekly
- **Query Success Rate:** 95%+ of queries return useful results
- **Time Savings:** 80% reduction in time to find data
- **User Satisfaction:** 4.5+ stars in feedback surveys
- **Query Accuracy:** 90%+ of generated SQL is correct on first try

---

## 12. Future Enhancements

### Phase 2 Features (Month 6+)
- Voice input for queries
- Natural language report generation
- Predictive analytics ("Customers likely to churn")
- Integration with customer dashboard (customers can query their own data)
- Mobile app support
- Multi-language support
- Custom data visualizations
- AI-powered anomaly detection

---

## 13. Appendix

### A. Sample Query Templates

**Customer Management:**
- "Show me all customers who signed up in the last 7 days"
- "Find customers who haven't logged in for 90+ days"
- "List customers with incomplete profiles"

**Filing Management:**
- "Show me all pending annual reports"
- "Find filings rejected by the state"
- "List all LLC formations filed this month"

**Disclaimer Tracking:**
- "Show me all address disclaimer acceptances in the last 30 days"
- "Find customers with unverified addresses"
- "List all disclaimer acceptances by type"

**Financial:**
- "Show me revenue by service type for Q4 2024"
- "Find customers with overdue payments"
- "List all refunds issued this month"

**Compliance:**
- "Show me all filings with upcoming deadlines"
- "Find customers missing required documents"
- "List all state rejections and reasons"

---

### B. Code Examples

#### Example 1: Basic AI Search API Route

```typescript
// src/app/api/ai-search/query/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  query: z.string().min(3).max(500),
  maxResults: z.number().min(1).max(1000).default(100),
  exportFormat: z.enum(['json', 'csv', 'pdf', 'xlsx']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication & Authorization
    const session = await getServerSession();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Validate Input
    const body = await request.json();
    const { query, maxResults, exportFormat } = querySchema.parse(body);

    // 3. Convert Natural Language to SQL using AI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a SQL query generator for LegalOps platform.

DATABASE SCHEMA:
- customers (id, name, email, phone, created_at, status)
- filings (id, customer_id, filing_type, status, state, created_at)
- disclaimer_acceptances (id, customer_id, timestamp, issue_type)

RULES:
1. Only SELECT queries
2. Always include LIMIT
3. Use proper JOINs
4. Return safe, parameterized SQL`
        },
        { role: 'user', content: query }
      ],
      functions: [{
        name: 'generate_sql',
        parameters: {
          type: 'object',
          properties: {
            sql: { type: 'string' },
            interpretation: { type: 'string' },
            tables_used: { type: 'array', items: { type: 'string' } }
          },
          required: ['sql', 'interpretation']
        }
      }],
      function_call: { name: 'generate_sql' }
    });

    const functionCall = completion.choices[0].message.function_call;
    const { sql, interpretation } = JSON.parse(functionCall?.arguments || '{}');

    // 4. Validate SQL
    const validation = validateSQL(sql);
    if (!validation.valid) {
      throw new Error(`Invalid SQL: ${validation.errors.join(', ')}`);
    }

    // 5. Execute Query
    const startTime = Date.now();
    const results = await prisma.$queryRawUnsafe(sql);
    const executionTimeMs = Date.now() - startTime;

    // 6. Log Query
    await prisma.aiSearchQuery.create({
      data: {
        userId: session.user.id,
        naturalLanguageQuery: query,
        generatedSql: sql,
        executionTimeMs,
        resultCount: results.length,
        wasSuccessful: true,
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      }
    });

    // 7. Return Results
    return NextResponse.json({
      success: true,
      query: {
        original: query,
        interpreted: interpretation,
        sql,
        executionTimeMs
      },
      results: {
        columns: results.length > 0 ? Object.keys(results[0]) : [],
        rows: results,
        totalCount: results.length,
        hasMore: results.length >= maxResults
      }
    });

  } catch (error) {
    console.error('AI Search Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function validateSQL(sql: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const upperSQL = sql.toUpperCase();

  const BLOCKED = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'TRUNCATE', 'ALTER'];
  for (const keyword of BLOCKED) {
    if (upperSQL.includes(keyword)) {
      errors.push(`Blocked keyword: ${keyword}`);
    }
  }

  if (!upperSQL.trim().startsWith('SELECT')) {
    errors.push('Only SELECT queries allowed');
  }

  if (!upperSQL.includes('LIMIT')) {
    errors.push('Must include LIMIT');
  }

  return { valid: errors.length === 0, errors };
}
```

#### Example 2: React Search Component

```typescript
// src/components/AISearch.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    const response = await fetch('/api/ai-search/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    setResults(data);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask anything about your data..."
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <TemplateCard
          title="Pending Filings"
          query="Show me all pending annual reports"
          onClick={setQuery}
        />
        <TemplateCard
          title="Unverified Addresses"
          query="Find customers with unverified addresses"
          onClick={setQuery}
        />
        <TemplateCard
          title="Revenue This Month"
          query="Show me revenue by service type this month"
          onClick={setQuery}
        />
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                Results ({results.results.totalCount})
              </h3>
              <p className="text-sm text-gray-600">
                {results.query.interpreted}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Export PDF
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {results.results.columns.map((col) => (
                    <th key={col} className="px-4 py-2 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.results.rows.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {results.results.columns.map((col) => (
                      <td key={col} className="px-4 py-2">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ title, query, onClick }) {
  return (
    <button
      onClick={() => onClick(query)}
      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
    >
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{query}</p>
    </button>
  );
}
```

---

**Document Control:**
- Version: 1.0
- Last Updated: 2024-01-18
- Author: LegalOps Development Team
- Status: Draft - Pending Approval

