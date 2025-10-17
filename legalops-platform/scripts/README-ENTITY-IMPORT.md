# Florida Entity Data Import Guide

This guide explains how to download and import Florida business entity data from Sunbiz.org into your local database for real-time name availability checking.

## 📋 Overview

The LegalOps platform uses a local database of Florida business entities to check name availability in real-time. This provides:

- ✅ **Fast performance** - No external API calls needed
- ✅ **Reliability** - Works offline, no rate limits
- ✅ **Accuracy** - Official data from Florida Department of State
- ✅ **Cost-effective** - Free data downloads from Sunbiz.org

## 🔄 Data Source

**Official Source:** Florida Department of State, Division of Corporations  
**Website:** https://dos.fl.gov/sunbiz/other-services/data-downloads/

**Data Updates:** Quarterly (January, April, July, October)  
**File Format:** Fixed-width ASCII text files (1440 characters per record)

## 📥 Step 1: Download the Data

### Option A: Web Browser Download

1. **Visit the FTP portal:**
   ```
   https://sftp.floridados.gov
   ```

2. **Login with public credentials:**
   - Username: `Public`
   - Password: `PubAccess1845!`

3. **Navigate to the corporate data:**
   - Click: `doc` folder
   - Click: `quarterly` folder
   - Click: `cor` folder

4. **Download the file:**
   - Download: `cordata.zip` (contains all corporate entities)
   - File size: ~500MB-1GB (compressed)

5. **Extract the zip file:**
   - Extract to a location you can access
   - The extracted file will be much larger (~2-5GB)

### Option B: Command Line Download (Advanced)

Using `curl` or `wget`:

```bash
# Using curl
curl -u Public:PubAccess1845! https://sftp.floridados.gov/doc/quarterly/cor/cordata.zip -o cordata.zip

# Using wget
wget --user=Public --password=PubAccess1845! https://sftp.floridados.gov/doc/quarterly/cor/cordata.zip
```

## 🚀 Step 2: Import the Data

### Prerequisites

1. **Install tsx** (TypeScript executor):
   ```bash
   npm install -D tsx
   ```

2. **Ensure database is running:**
   - Your PostgreSQL database should be accessible
   - Check your `.env` file has correct `DATABASE_URL`

### Run the Import

```bash
npm run import-entities <path-to-extracted-file>
```

**Example:**
```bash
npm run import-entities C:\Downloads\cordata\cor_data.txt
```

### What Happens During Import

1. **Creates sync record** - Tracks the import progress
2. **Reads file line by line** - Processes each 1440-character record
3. **Parses entity data:**
   - Document number (unique ID)
   - Business name
   - Status (Active/Inactive)
   - Entity type (LLC, Corp, LP, etc.)
   - Filing date
   - Addresses
   - Registered agent
4. **Normalizes names** - Applies Florida's distinguishability rules
5. **Upserts to database** - Creates or updates each entity
6. **Progress updates** - Shows progress every 1,000 records

### Expected Results

- **Processing time:** 30-60 minutes (depending on your computer)
- **Total records:** ~3-4 million Florida entities
- **Database size:** ~2-5GB additional storage
- **Success rate:** 99%+ (some records may have parsing errors)

## 📊 Step 3: Verify the Import

### Check Import Status

```sql
-- View sync history
SELECT * FROM entity_data_syncs ORDER BY started_at DESC LIMIT 5;

-- Count total entities
SELECT COUNT(*) FROM florida_entities;

-- Count by status
SELECT status, COUNT(*) FROM florida_entities GROUP BY status;

-- Count by entity type
SELECT entity_type, COUNT(*) FROM florida_entities GROUP BY entity_type ORDER BY COUNT(*) DESC;
```

### Test Name Availability

Try searching for a business name in your app:
1. Go to: http://localhost:3000/dashboard/orders/new
2. Type a business name (e.g., "Sunshine Consulting")
3. Wait 800ms for the check to complete
4. See real results from your local database!

## 🔄 Step 4: Keep Data Updated

### Quarterly Updates

Florida releases new quarterly data files every 3 months:
- **January** - Q4 data from previous year
- **April** - Q1 data
- **July** - Q2 data
- **October** - Q3 data

**Recommended schedule:**
- Download new quarterly file
- Run import script again
- The script will update existing entities and add new ones

### Daily Updates (Optional)

For the most current data, you can also import daily files:

1. Navigate to: `doc > daily > cor`
2. Download daily files (much smaller)
3. Run import script on daily files

### Automated Updates (Future Enhancement)

You can set up a cron job or scheduled task to:
1. Download latest quarterly/daily files
2. Run import automatically
3. Send notification when complete

## 📁 File Structure

### Corporate Data File Format

**Record Length:** 1440 characters (fixed-width)

**Key Fields:**
- Position 1-12: Document Number
- Position 13-205: Corporation Name
- Position 205: Status (A=Active, I=Inactive)
- Position 206-220: Filing Type (FLAL=LLC, DOMP=Corp, etc.)
- Position 221-344: Principal Address
- Position 473-480: File Date (YYYYMMDD)
- Position 545-586: Registered Agent

**Full specification:** https://dos.sunbiz.org/data-definitions/cor.html

## 🛠️ Troubleshooting

### Import Fails with "File not found"

- Check the file path is correct
- Use absolute path (e.g., `C:\Downloads\cordata.txt`)
- Make sure file is extracted from zip

### Import is Very Slow

- Normal! Processing millions of records takes time
- Expected: 30-60 minutes for full import
- Progress updates every 1,000 records

### Database Connection Errors

- Check `.env` file has correct `DATABASE_URL`
- Ensure PostgreSQL is running
- Test connection: `npx prisma db push`

### Out of Memory Errors

- The script processes line-by-line to avoid memory issues
- If still occurring, increase Node.js memory:
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096" npm run import-entities <file>
  ```

### Parsing Errors

- Some records may fail to parse (expected)
- Script continues processing
- Errors are logged (first 10 shown)
- Check sync record for error count

## 📈 Performance Optimization

### Database Indexes

The schema includes indexes on:
- `normalizedName` - Fast name searches
- `status` - Filter by active/inactive
- `documentNumber` - Unique lookups

### Query Optimization

The name checker uses:
- `LIKE` queries on normalized names
- Limit to 50 results
- Order by last updated

### Future Enhancements

- Full-text search for better matching
- Fuzzy matching for similar names
- Caching frequently searched names
- Background sync process

## 📞 Support

**Questions or issues?**
- Check Sunbiz.org documentation
- Review import logs
- Check database sync records

**Data issues?**
- Contact Florida Department of State
- Phone: (850) 245-6052
- Website: https://dos.fl.gov/sunbiz/

## 📝 License & Terms

**Data Source:** Florida Department of State
**License:** Public domain (Florida public records)
**Terms:** Data provided "as is" for informational purposes
**Updates:** May be changed, replaced, or deleted at any time

**Important:** This data is for name availability checking only. Always verify with official Sunbiz.org search before filing.

---

## 🚀 Phase 2: DBAs and General Partnerships

The implementation for **Fictitious Names (DBAs)** and **General Partnerships** is complete and ready to use!

### What's Included

**✅ Database Schema:**
- `FictitiousName` model for DBAs
- `GeneralPartnership` model for GPs
- Already pushed to database

**✅ Import Scripts:**
- `scripts/import-fictitious-names.ts`
- `scripts/import-general-partnerships.ts`

**✅ Name Checker Integration:**
- Automatically searches all entity types
- No code changes needed

### Quick Start

**1. Import DBAs (Fictitious Names):**
```bash
# Download ficdata.zip from: doc > quarterly > fic
npm run import-dbas C:\path\to\extracted\fic_data.txt
```

**2. Import General Partnerships:**
```bash
# Download genfile.zip from: doc > quarterly > gen
npm run import-partnerships C:\path\to\extracted\gen_data.txt
```

### Detailed Guide

See **`docs/PHASE-2-DBA-GP-IMPLEMENTATION.md`** for:
- Complete step-by-step instructions
- File format specifications
- Troubleshooting guide
- Testing procedures
- Maintenance schedule

### When to Implement

**Option A:** Start with corporate entities only (faster setup)
**Option B:** Import all entity types now (most comprehensive)

**Recommendation:** Start with Phase 1 (corporate), add Phase 2 later when needed.

