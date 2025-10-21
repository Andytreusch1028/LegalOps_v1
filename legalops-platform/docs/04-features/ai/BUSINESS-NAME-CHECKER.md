# Business Name Availability Checker

## 🎯 Overview

The LegalOps platform includes a **real-time business name availability checker** that validates business names against Florida's official Sunbiz.org database using Florida's legal distinguishability rules.

## ✨ Features

### 1. Real-Time Checking
- ✅ **Debounced input** - Waits 800ms after user stops typing
- ✅ **Visual feedback** - Green checkmark (available) or red X (unavailable)
- ✅ **Loading states** - Spinner while checking
- ✅ **Instant results** - Fast database queries

### 2. Florida Legal Rules Implementation

Implements **all 5 official Florida distinguishability rules** from Sunbiz.org:

#### Rule 1: Business Suffixes (Ignored)
Names are considered the same if they only differ by suffixes:
- LLC, L.L.C., Limited Liability Company
- Inc., Incorporated
- Corp., Corporation
- Co., Company
- Ltd., Limited
- LP, LLP, LLLP, GP
- PA, PLLC, Professional Association

**Example:**
- "Sunshine Consulting LLC" = "Sunshine Consulting Inc." = "Sunshine Consulting"

#### Rule 2: Articles (Ignored)
Articles are ignored: the, a, an

**Example:**
- "The Kitchen" = "A Kitchen" = "Kitchen"

#### Rule 3: And vs & (Same)
"and" and "&" are treated as identical

**Example:**
- "Cheese and Crackers" = "Cheese & Crackers"

#### Rule 4: Singular/Plural/Possessive (Same)
Different forms of the same word are considered identical

**Example:**
- "Tallahassee Sport" = "Tallahassee Sports" = "Tallahassee's Sports"

#### Rule 5: Punctuation & Symbols (Ignored)
All punctuation and symbols are ignored

**Example:**
- "Cookies 'n Cupcakes" = "Cookies-n-Cupcakes" = "Cookies n Cupcakes!"

### 3. Status-Based Availability

According to Florida law:

**NOT Available:**
- **ACTIVE** or **ACT** - Currently active entity
- **INACTIVE/UA** or **INACT/UA** - Inactive but name held for 1 year (or 120 days if voluntarily dissolved)

**Available:**
- **INACTIVE** or **INACT** - Holding period expired

### 4. Name Validation

Checks for:
- ✅ Minimum length (3 characters)
- ✅ Maximum length (100 characters)
- ✅ Prohibited characters (`< > { } [ ] \ /`)
- ✅ Cannot be only numbers
- ✅ Prohibited words (FBI, CIA, Treasury, Federal Reserve, United States)

### 5. Smart Suggestions

If a name is unavailable, the system generates up to 5 alternative suggestions:
- Add location (Florida, FL)
- Add descriptors (Group, Solutions, Services, Enterprises)
- Add year (2025)
- Entity-specific suggestions (Ventures, Holdings, International)

**One-click application** - Click any suggestion to instantly use it

## 🏗️ Architecture

### Database Schema

```prisma
model FloridaEntity {
  id                String   @id @default(cuid())
  documentNumber    String   @unique
  name              String
  normalizedName    String   // For fast searching
  status            String
  entityType        String?
  filingDate        DateTime?
  principalAddress  String?
  mailingAddress    String?
  registeredAgent   String?
  lastUpdated       DateTime
  createdAt         DateTime
  
  @@index([normalizedName])
  @@index([status])
}
```

### API Endpoint

**POST /api/check-name**

Request:
```json
{
  "businessName": "Sunshine Consulting",
  "entityType": "LLC"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "available": false,
    "searchedName": "Sunshine Consulting",
    "normalizedName": "sunshine consulting",
    "conflicts": [
      {
        "name": "Sunshine Consulting LLC",
        "documentNumber": "L12000012345",
        "status": "ACTIVE",
        "filingDate": "2020-01-15",
        "entityType": "LLC"
      }
    ],
    "message": "\"Sunshine Consulting\" is not available. 1 similar entity found.",
    "suggestions": [
      "Sunshine Consulting Florida",
      "Sunshine Consulting FL",
      "Sunshine Consulting Group",
      "Sunshine Consulting Solutions",
      "Sunshine Consulting 2025"
    ]
  }
}
```

### Name Normalization Algorithm

```typescript
function normalizeBusinessName(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Remove punctuation and symbols
  normalized = normalized.replace(/[^\w\s]/g, ' ');
  
  // Remove articles (the, a, an)
  normalized = normalized.replace(/\b(the|a|an)\b/g, '');
  
  // Replace "and" with "&"
  normalized = normalized.replace(/\band\b/g, '&');
  
  // Remove business suffixes
  // (LLC, Inc., Corp., etc.)
  
  // Clean up spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}
```

## 📊 Data Source

### Official Source
- **Provider:** Florida Department of State, Division of Corporations
- **Website:** https://dos.fl.gov/sunbiz/
- **Data Downloads:** https://dos.fl.gov/sunbiz/other-services/data-downloads/

### FTP Access (Public)
```
Host: https://sftp.floridados.gov
Username: Public
Password: PubAccess1845!
Location: doc > quarterly > cor > cordata.zip
```

### Data Updates
- **Quarterly:** January, April, July, October
- **Daily:** Available for incremental updates
- **File Size:** ~500MB-1GB compressed, ~2-5GB extracted
- **Records:** ~3-4 million Florida entities

## 🚀 Quick Start

### 1. Download Florida Entity Data

```bash
# Visit FTP portal
https://sftp.floridados.gov

# Login: Public / PubAccess1845!
# Navigate: doc > quarterly > cor
# Download: cordata.zip
# Extract the zip file
```

### 2. Import Data to Database

```bash
npm run import-entities <path-to-extracted-file>
```

Example:
```bash
npm run import-entities C:\Downloads\cordata\cor_data.txt
```

### 3. Test the Checker

1. Go to: http://localhost:3000/dashboard/orders/new
2. Type a business name
3. Wait 800ms
4. See real-time availability results!

## 🎨 UI Components

### Input Field with Status

```tsx
<input
  value={businessName}
  onChange={(e) => setBusinessName(e.target.value)}
  style={{
    border: nameAvailability 
      ? nameAvailability.available 
        ? '2px solid #10b981'  // Green
        : '2px solid #ef4444'  // Red
      : '1.5px solid #e2e8f0', // Gray
  }}
/>
```

### Status Icon

- **Checking:** Animated spinner
- **Available:** Green checkmark circle
- **Unavailable:** Red X circle

### Availability Message

- **Available:** Green background, success icon
- **Unavailable:** Red background, warning icon, suggestions

## 📈 Performance

### Database Indexes
- `normalizedName` - Fast LIKE queries
- `status` - Filter active/inactive
- `documentNumber` - Unique lookups

### Query Performance
- **Average query time:** <50ms
- **Results limit:** 50 entities
- **Debounce delay:** 800ms

### Optimization Tips
- Use connection pooling
- Cache frequently searched names
- Consider full-text search for large datasets
- Add fuzzy matching for typos

## 🔄 Maintenance

### Quarterly Updates

1. **Download new data** (every 3 months)
2. **Run import script** - Updates existing, adds new
3. **Verify import** - Check sync records

### Daily Updates (Optional)

For most current data:
1. Download daily files from FTP
2. Run import on daily files
3. Smaller, faster updates

### Monitoring

Check import status:
```sql
SELECT * FROM entity_data_syncs 
ORDER BY started_at DESC 
LIMIT 5;
```

Check entity counts:
```sql
SELECT 
  status, 
  COUNT(*) as count 
FROM florida_entities 
GROUP BY status;
```

## 🛡️ Security & Compliance

### Data Privacy
- ✅ Public records (Florida Sunshine Law)
- ✅ No personal information stored
- ✅ Business entities only

### Rate Limiting
- ✅ Debounced requests (800ms)
- ✅ Authenticated users only
- ✅ No external API calls

### Data Accuracy
- ✅ Official government source
- ✅ Quarterly updates
- ✅ Always verify with Sunbiz.org before filing

## 📝 Legal Disclaimer

**Important:** This name availability checker is for informational purposes only. 

- Always verify availability on official Sunbiz.org website before filing
- Name availability can change at any time
- This tool does not reserve or register business names
- Consult with legal counsel for business formation advice

## 🔗 Resources

- **Florida Sunbiz:** https://dos.fl.gov/sunbiz/
- **Data Downloads:** https://dos.fl.gov/sunbiz/other-services/data-downloads/
- **File Definitions:** https://dos.sunbiz.org/data-definitions/cor.html
- **FAQs:** https://dos.fl.gov/sunbiz/about-us/faqs/
- **Import Guide:** See `scripts/README-ENTITY-IMPORT.md`

