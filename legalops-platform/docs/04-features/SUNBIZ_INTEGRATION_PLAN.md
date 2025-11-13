# Sunbiz Integration Plan

## Overview
Integration with Florida Department of State Division of Corporations (Sunbiz.org) to enable customers to search, verify, and import existing business entity data without leaving LegalOps platform.

**Timeline:** Month 3-4 implementation  
**Priority:** High (critical for Annual Report UX and business verification)

---

## Business Problem

### Current Pain Points:
1. **Annual Report Flow:** Customers must leave our site to find their Document Number on Sunbiz.org
2. **Data Entry Errors:** Manual entry of business details leads to mistakes
3. **Verification:** No way to verify that business details are accurate
4. **Customer Friction:** Leaving the site increases abandonment risk
5. **Duplicate Data Entry:** Customer has to re-enter business info they already filed with the state

### Solution:
Integrate with Sunbiz API to allow customers to:
- Search for their business by Document Number, Name, or Officer Name
- Auto-populate business details from official state records
- Verify business status before filing annual reports
- Save businesses to "My Businesses" for future filings

---

## Technical Implementation

### Phase 1: Simple Document Number Entry (Month 1-2) ✅
**Status:** Implementing now  
**Scope:** Add manual document number field to Annual Report form

**Implementation:**
- Add "Document Number" field at top of Annual Report form
- Add helper text: "Find your Document Number at Sunbiz.org"
- Add link: "Don't have a business yet? Form an LLC →"
- Store document number in order item data
- No API integration yet

### Phase 2: Sunbiz API Integration (Month 3-4)
**Status:** Planned  
**Scope:** Full integration with Florida Sunbiz search and data retrieval

#### 2.1 Research & API Access
- [ ] Research Sunbiz.org API documentation
- [ ] Determine if official API exists or if we need to use web scraping
- [ ] Check for rate limits, authentication requirements
- [ ] Review legal/terms of service for automated access
- [ ] Identify alternative APIs (e.g., OpenCorporates, state data feeds)

**Known Endpoints (to research):**
- Sunbiz.org search: `http://search.sunbiz.org/Inquiry/CorporationSearch/`
- Document detail: `http://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=EntityName&directionType=Initial&searchNameOrder=...`

#### 2.2 Backend API Routes

**Create `/api/sunbiz/search` endpoint:**
```typescript
// POST /api/sunbiz/search
{
  searchType: 'DOCUMENT_NUMBER' | 'ENTITY_NAME' | 'OFFICER_NAME',
  searchTerm: string,
  entityType?: 'LLC' | 'CORPORATION' | 'ALL'
}

// Response:
{
  results: [
    {
      documentNumber: string,
      entityName: string,
      status: 'ACTIVE' | 'INACTIVE' | 'DISSOLVED',
      filingDate: string,
      entityType: string,
      principalAddress: {
        street: string,
        city: string,
        state: string,
        zipCode: string
      },
      mailingAddress: { ... },
      registeredAgent: {
        name: string,
        address: { ... }
      },
      officers: [
        {
          title: string,
          name: string,
          address: { ... }
        }
      ],
      lastAnnualReportYear: number,
      sunbizUrl: string
    }
  ]
}
```

**Create `/api/sunbiz/details/:documentNumber` endpoint:**
```typescript
// GET /api/sunbiz/details/L12000012345
// Returns full business details from Sunbiz
```

#### 2.3 Frontend Components

**Create `SunbizBusinessSearch` component:**
- Search input with type selector (Document Number / Business Name / Officer Name)
- Real-time search results as user types (debounced)
- Result cards showing:
  - Entity name
  - Document number
  - Status badge (Active/Inactive)
  - Entity type
  - Principal address
  - "Select This Business" button
- Loading states, error handling
- "Can't find your business? Enter manually" fallback

**Create `SunbizBusinessDetails` component:**
- Display full business details from Sunbiz
- Show "Last Annual Report Filed: 2023" status
- "Import This Data" button to auto-fill form
- "View on Sunbiz.org" link
- Editable fields (in case Sunbiz data is outdated)

#### 2.4 Database Schema Updates

**Add `sunbizData` field to Business model:**
```prisma
model Business {
  // ... existing fields ...
  
  sunbizData          Json?              // Store raw Sunbiz response
  sunbizLastSync      DateTime?          // When we last fetched from Sunbiz
  sunbizVerified      Boolean @default(false)  // Whether data matches Sunbiz
  lastAnnualReportYear Int?              // Track last AR filed
}
```

**Add `sunbizSearchLog` table for analytics:**
```prisma
model SunbizSearchLog {
  id              String   @id @default(cuid())
  userId          String?
  searchType      String   // DOCUMENT_NUMBER, ENTITY_NAME, etc.
  searchTerm      String
  resultsFound    Int
  selectedResult  String?  // Document number of selected business
  createdAt       DateTime @default(now())
  
  user            User?    @relation(fields: [userId], references: [id])
}
```

#### 2.5 Integration Points

**Annual Report Form:**
- Replace simple document number field with Sunbiz search
- Auto-populate all business fields from Sunbiz data
- Show "Data verified with Florida Sunbiz" badge
- Allow manual override if Sunbiz data is incorrect

**My Businesses Page:**
- Add "Import from Sunbiz" button
- Search and import businesses customer owns
- Show sync status: "Last verified: 2 days ago"
- "Refresh from Sunbiz" button to re-sync data

**Business Detail Page:**
- Show Sunbiz verification status
- "View on Sunbiz" link with document number
- Display last annual report year
- Alert if annual report is due

**Formation Completion:**
- After LLC/Corp formation is approved, offer to "Track on Sunbiz"
- Auto-search for the business once document number is assigned
- Import and verify the filed data matches what customer submitted

---

## Phase 3: Advanced Features (Month 5-6)

### 3.1 Automatic Annual Report Reminders
- Check Sunbiz for last annual report year
- Send email reminders when annual report is due
- Dashboard notification: "Your annual report is due by May 1st"

### 3.2 Business Status Monitoring
- Periodic background job to check business status
- Alert customer if business becomes inactive/dissolved
- Suggest corrective actions (reinstatement, etc.)

### 3.3 Bulk Import
- Allow customers to import multiple businesses at once
- Useful for attorneys/accountants managing multiple entities
- CSV upload with document numbers

### 3.4 Officer/RA Change Detection
- Compare Sunbiz data with our records
- Alert if registered agent or officers changed
- Suggest updating our records

---

## Technical Considerations

### Rate Limiting & Caching
- Cache Sunbiz search results for 24 hours
- Implement rate limiting to avoid overwhelming Sunbiz servers
- Use Redis for caching search results
- Background job to refresh cached data for active businesses

### Error Handling
- Graceful fallback if Sunbiz API is down
- Allow manual entry if search fails
- Show helpful error messages
- Log all API failures for monitoring

### Data Privacy
- Only fetch data for businesses customer owns/manages
- Don't store sensitive officer personal info unnecessarily
- Comply with public records laws (Sunbiz data is public)

### Performance
- Debounce search input (500ms delay)
- Limit search results to 10-20 businesses
- Lazy load business details on selection
- Use server-side pagination for large result sets

---

## API Research Tasks

### Questions to Answer:
1. **Does Sunbiz have an official API?**
   - If yes: Get API key, review documentation
   - If no: Evaluate web scraping legality and feasibility

2. **What are the rate limits?**
   - Requests per minute/hour/day
   - Do we need to throttle requests?

3. **What data is available?**
   - Entity details, officers, registered agent
   - Annual report history
   - Document images (Articles of Organization, etc.)

4. **Authentication required?**
   - API key, OAuth, or public access?

5. **Alternative data sources?**
   - OpenCorporates API
   - State data feeds/bulk downloads
   - Third-party business data APIs

### Research Resources:
- Sunbiz.org website: http://sunbiz.org
- Florida DOS developer resources (if any)
- OpenCorporates API: https://api.opencorporates.com
- State of Florida open data portal

---

## Success Metrics

### User Experience:
- **Reduced form completion time:** Target 50% faster with auto-fill
- **Lower abandonment rate:** Fewer customers leaving to find document number
- **Higher data accuracy:** Fewer filing errors due to typos

### Business Metrics:
- **Increased conversion rate:** More customers complete annual report purchase
- **Customer satisfaction:** Positive feedback on ease of use
- **Support ticket reduction:** Fewer "I can't find my document number" tickets

### Technical Metrics:
- **API uptime:** 99.9% availability
- **Search response time:** < 2 seconds
- **Cache hit rate:** > 80% for repeat searches

---

## Implementation Checklist

### Phase 1 (Month 1-2): ✅ Implementing Now
- [ ] Add document number field to Annual Report form
- [ ] Add helper text and links
- [ ] Store document number in order data
- [ ] Test with manual entry

### Phase 2 (Month 3-4): Sunbiz Integration
- [ ] Research Sunbiz API/scraping options
- [ ] Create backend API routes
- [ ] Build SunbizBusinessSearch component
- [ ] Build SunbizBusinessDetails component
- [ ] Update database schema
- [ ] Implement caching layer
- [ ] Add error handling
- [ ] Update Annual Report form
- [ ] Update My Businesses page
- [ ] Write integration tests
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

### Phase 3 (Month 5-6): Advanced Features
- [ ] Annual report reminders
- [ ] Business status monitoring
- [ ] Bulk import feature
- [ ] Officer/RA change detection

---

## Notes & Considerations

### Legal Compliance:
- Sunbiz data is public record, but verify terms of service for automated access
- Don't claim to be affiliated with Florida DOS
- Add disclaimer: "Data sourced from Florida Sunbiz. Verify accuracy before filing."

### UX Best Practices:
- Always provide manual entry fallback
- Show data source: "Verified with Florida Sunbiz on [date]"
- Allow customer to override auto-filled data
- Clear visual indication of verified vs. manual data

### Future Enhancements:
- Multi-state support (when expanding beyond Florida)
- Integration with IRS for EIN verification
- Integration with USPS for address validation
- OCR for uploading business documents

---

## Related Documentation
- [Annual Report Form Specification](./ANNUAL_REPORT_FORM.md)
- [My Businesses Feature](./MY_BUSINESSES.md)
- [Database Schema](../03-database/SCHEMA.md)
- [API Documentation](../07-api/README.md)

---

**Last Updated:** 2025-11-12  
**Owner:** Andy Treusch  
**Status:** Phase 1 in progress, Phase 2-3 planned

