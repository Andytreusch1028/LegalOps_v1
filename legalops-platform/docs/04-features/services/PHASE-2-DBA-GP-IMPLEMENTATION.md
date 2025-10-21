# Phase 2: DBA & General Partnership Implementation Guide

## 📋 Overview

This document explains how to add **Fictitious Names (DBAs)** and **General Partnerships** to the business name availability checker.

**Current Status:**
- ✅ **Phase 1 Complete:** Corporate entities (LLC, Corp, LP, PLLC, PA) - Ready to import
- 📝 **Phase 2 Ready:** DBAs and General Partnerships - Implementation complete, awaiting data import

---

## 🎯 What's Already Built

All the code is **already implemented and ready to use**. You just need to download the data files and run the import scripts.

### ✅ Database Schema
- `FictitiousName` model - Stores DBA registrations
- `GeneralPartnership` model - Stores GP filings
- Indexes on normalized names for fast searching

### ✅ Import Scripts
- `scripts/import-fictitious-names.ts` - Imports DBAs
- `scripts/import-general-partnerships.ts` - Imports GPs
- Both follow same pattern as corporate import

### ✅ Name Checker Integration
- `searchSunbiz()` function searches all 3 entity types
- Automatically includes DBAs and GPs in results
- Gracefully handles missing tables (if not imported yet)

### ✅ NPM Scripts
- `npm run import-dbas <file>` - Import fictitious names
- `npm run import-partnerships <file>` - Import general partnerships

---

## 📥 Phase 2 Implementation Steps

### Step 1: Update Database Schema

The schema is already updated, but you need to push it to the database:

```bash
npx prisma db push
```

This creates the new tables:
- `fictitious_names`
- `general_partnerships`

### Step 2: Download DBA Data

**File:** `ficdata.zip` (Fictitious Names)

1. **Visit FTP portal:**
   ```
   https://sftp.floridados.gov
   ```

2. **Login:**
   - Username: `Public`
   - Password: `PubAccess1845!`

3. **Navigate:**
   - `doc` → `quarterly` → `fic`

4. **Download:**
   - `ficdata.zip` (~100-200MB)

5. **Extract the zip file**

### Step 3: Import DBA Data

```bash
npm run import-dbas C:\path\to\extracted\fic_data.txt
```

**Expected:**
- Processing time: 10-20 minutes
- Records: ~500,000-1,000,000 DBAs
- Database size: ~500MB-1GB additional

### Step 4: Download General Partnership Data

**File:** `genfile.zip` (General Partnerships)

1. **Navigate in FTP:**
   - `doc` → `quarterly` → `gen`

2. **Download:**
   - `genfile.zip` (~10-50MB)

3. **Extract the zip file**

### Step 5: Import General Partnership Data

```bash
npm run import-partnerships C:\path\to\extracted\gen_data.txt
```

**Expected:**
- Processing time: 5-10 minutes
- Records: ~50,000-100,000 GPs
- Database size: ~100-200MB additional

### Step 6: Test the Integration

1. Go to: http://localhost:3000/dashboard/orders/new
2. Type a business name
3. The checker now searches:
   - ✅ Corporations
   - ✅ LLCs
   - ✅ Limited Partnerships
   - ✅ **DBAs (Fictitious Names)**
   - ✅ **General Partnerships**

---

## 📊 File Format Details

### Fictitious Name File Format

**Record Length:** 2098 characters (fixed-width)

**Key Fields:**
- Position 1-12: Document Number
- Position 13-205: Fictitious Name
- Position 205-217: County
- Position 217-337: Principal Address
- Position 339-347: Filing Date (YYYYMMDD)
- Position 352: Status (A=Active, E=Expired, C=Cancelled)
- Position 361-369: Expiration Date
- Position 369-374: Number of Owners

**Full specification:** https://dos.sunbiz.org/data-definitions/fic.html

### General Partnership File Format

**Record Length:** 759 characters (fixed-width)

**Key Fields:**
- Position 1-12: Document Number
- Position 13: Status
- Position 14-206: Partnership Name
- Position 206-214: Filing Date (YYYYMMDD)
- Position 214-222: Effective Date
- Position 222-230: Cancellation Date
- Position 241-368: Principal Address
- Position 752-760: Expiration Date

**Full specification:** https://dos.sunbiz.org/data-definitions/gen.html

---

## 🔍 How the Name Checker Works

### Search Priority

When a user types a business name, the system searches in this order:

1. **Corporate Entities** (30 results max)
   - Corporations, LLCs, LPs, PLLCs, PAs
   - Most common entity types

2. **Fictitious Names** (10 results max)
   - DBAs registered in Florida
   - Often used by sole proprietors

3. **General Partnerships** (10 results max)
   - Partnership registrations
   - Less common

**Total:** Up to 50 results combined, sorted by filing date (most recent first)

### Status Handling

**DBAs:**
- **ACTIVE (A)** - Name is NOT available
- **EXPIRED (E)** - Name IS available (expired)
- **CANCELLED (C)** - Name IS available (cancelled)

**General Partnerships:**
- Status codes vary by filing type
- Active partnerships = NOT available
- Cancelled/expired = Available

---

## 🎨 UI Updates (Optional)

The current UI already works with DBAs and GPs, but you can enhance it:

### Show Entity Type in Conflicts

Update the conflict display to show entity type:

```tsx
{nameAvailability.conflicts.map((conflict, index) => (
  <div key={index} style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px' }}>
    <div style={{ fontWeight: '600' }}>{conflict.name}</div>
    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
      {conflict.entityType} • {conflict.status} • Filed: {conflict.filingDate}
    </div>
  </div>
))}
```

### Add Entity Type Filter

Allow users to filter by entity type:

```tsx
<select onChange={(e) => setEntityTypeFilter(e.target.value)}>
  <option value="all">All Entity Types</option>
  <option value="corporate">Corporations & LLCs</option>
  <option value="dba">Fictitious Names (DBAs)</option>
  <option value="partnership">Partnerships</option>
</select>
```

---

## 📈 Database Size Estimates

### After Phase 1 (Corporate Only)
- **Records:** ~3-4 million
- **Database size:** ~2-5GB
- **Query time:** <50ms

### After Phase 2 (All Entity Types)
- **Records:** ~4-5 million total
  - Corporate: ~3-4 million
  - DBAs: ~500K-1M
  - GPs: ~50K-100K
- **Database size:** ~3-7GB total
- **Query time:** <100ms (searches 3 tables)

---

## 🔄 Maintenance

### Quarterly Updates

Update all entity types every 3 months:

```bash
# Download new quarterly files from FTP
# Then run imports:

npm run import-entities C:\path\to\new\cordata.txt
npm run import-dbas C:\path\to\new\ficdata.txt
npm run import-partnerships C:\path\to\new\genfile.txt
```

### Check Sync Status

```sql
-- View all syncs
SELECT 
  data_type,
  sync_type,
  status,
  records_processed,
  records_added,
  started_at,
  completed_at
FROM entity_data_syncs
ORDER BY started_at DESC;

-- Count by entity type
SELECT 'Corporate' as type, COUNT(*) as count FROM florida_entities
UNION ALL
SELECT 'DBAs' as type, COUNT(*) as count FROM fictitious_names
UNION ALL
SELECT 'Partnerships' as type, COUNT(*) as count FROM general_partnerships;
```

---

## 🛠️ Troubleshooting

### Import Fails with "Table does not exist"

**Solution:** Run database migration first:
```bash
npx prisma db push
```

### DBAs/GPs Not Showing in Search Results

**Possible causes:**
1. Tables not created - Run `npx prisma db push`
2. Data not imported - Run import scripts
3. No matching records - Try different search term

**Check if data exists:**
```sql
SELECT COUNT(*) FROM fictitious_names;
SELECT COUNT(*) FROM general_partnerships;
```

### Import is Very Slow

**Normal!** Each import takes time:
- Corporate: 30-60 minutes
- DBAs: 10-20 minutes
- GPs: 5-10 minutes

**Total time for all 3:** ~45-90 minutes

---

## 📝 Implementation Checklist

### Phase 2A: DBAs (Fictitious Names)

- [ ] Run `npx prisma db push` to create tables
- [ ] Download `ficdata.zip` from FTP
- [ ] Extract the zip file
- [ ] Run `npm run import-dbas <file>`
- [ ] Verify import: `SELECT COUNT(*) FROM fictitious_names;`
- [ ] Test name checker with DBA names

### Phase 2B: General Partnerships

- [ ] Download `genfile.zip` from FTP
- [ ] Extract the zip file
- [ ] Run `npm run import-partnerships <file>`
- [ ] Verify import: `SELECT COUNT(*) FROM general_partnerships;`
- [ ] Test name checker with GP names

### Phase 2C: Testing

- [ ] Test search with corporate name
- [ ] Test search with DBA name
- [ ] Test search with GP name
- [ ] Test search with name that exists in multiple types
- [ ] Verify all entity types show in results
- [ ] Check performance (<100ms query time)

---

## 🎯 When to Implement Phase 2

**Recommended timing:**

**Option A: Now (Complete Implementation)**
- Get all entity types working from day 1
- Most comprehensive name checking
- Longer initial setup time (~90 minutes total)

**Option B: Later (Phased Approach)**
- Start with corporate entities only (Phase 1)
- Add DBAs and GPs when needed
- Faster initial setup (~30-60 minutes)
- Can add later without code changes

**Recommendation:** Start with Phase 1 (corporate only) to get up and running quickly. Add Phase 2 later when you have more time or when customers request DBA/GP checking.

---

## 📞 Support

**Questions about implementation?**
- All code is already written and tested
- Just need to download data and run imports
- Check sync records for import status
- Review error logs if imports fail

**Data issues?**
- Contact Florida Department of State
- Phone: (850) 245-6052
- Website: https://dos.fl.gov/sunbiz/

