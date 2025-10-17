# Sunbiz Filing Integration Research

## 🔍 Research Summary: How to Submit Filings to Sunbiz

**Date:** 2025-10-16  
**Purpose:** Understand how to collect customer data and electronically submit filings to Florida's Sunbiz system

---

## ⚠️ **CRITICAL FINDING: NO PUBLIC API EXISTS**

After extensive research, **Florida's Sunbiz.org does NOT provide a public API** for third-party service providers to submit filings electronically.

### **Current Sunbiz Filing Methods:**

1. **Direct Online Filing (Public)** - Individual customers file directly at efile.sunbiz.org
2. **Mail Filing** - Paper forms mailed to Division of Corporations
3. **Prepaid E-File Account** - For high-volume filers (appears to be web-based, not API)

**There is NO documented API, webhook, or batch submission system for service providers.**

---

## 🏢 **How Registered Agent Companies Handle This**

Major registered agent service providers (CSC, Harbor Compliance, RASi, etc.) likely use one of these approaches:

### **Option 1: Manual Filing (Most Common)**
- Collect customer data through their platform
- Staff manually enters data into Sunbiz online forms
- Staff completes payment using company credit card or prepaid account
- Staff downloads confirmation and stores in customer record

### **Option 2: Prepaid Sunbiz E-File Account**
- Set up prepaid account with Division of Corporations
- Still requires manual web form entry
- Faster processing, no per-transaction payment entry
- Account is debited automatically

### **Option 3: Become a Registered Agent Entity**
- Register as a business entity that provides registered agent services
- May get access to bulk filing tools (unconfirmed)
- Still likely web-based, not API-based

### **Option 4: Screen Automation (Not Recommended)**
- Use browser automation (Puppeteer, Selenium) to fill forms
- **RISKY:** Violates terms of service, unreliable, could get blocked
- **NOT RECOMMENDED**

---

## 📋 **Required Data Collection by Filing Type**

Based on Sunbiz filing instructions, here's what data we need to collect:

### **LLC Formation**

**Required Fields:**
- ✅ Business Name (must be distinguishable)
- ✅ Principal Place of Business Address (street address, no PO Box)
- ✅ Mailing Address (optional, PO Box allowed)
- ✅ Registered Agent Name (person or entity)
- ✅ Registered Agent Florida Street Address (no PO Box)
- ✅ Registered Agent Signature (electronic signature accepted)
- ✅ Purpose (Professional LLC only - specific purpose required)
- ✅ Authorized Representative Signature
- ✅ Correspondence Email Address

**Optional Fields:**
- Manager/Authorized Representative Names and Addresses
- Effective Date (up to 5 days prior or 90 days after filing)

**Fees:**
- Articles of Organization: $100
- Registered Agent Designation: $25
- **Total: $125**
- Optional: Certified Copy (+$30), Certificate of Status (+$5)

---

### **Corporation Formation**

**Required Fields:**
- ✅ Corporation Name (must be distinguishable)
- ✅ Number of Authorized Shares (minimum 1)
- ✅ Registered Agent Name (person or entity)
- ✅ Registered Agent Florida Street Address
- ✅ Registered Agent Signature
- ✅ Incorporator Name and Signature
- ✅ Corporate Purpose (specific for Professional Corp, or "any lawful business")
- ✅ Correspondence Email Address

**Optional Fields:**
- Officer/Director Names and Addresses
- Effective Date (5 days prior to 90 days after filing)

**Fees:**
- Articles of Incorporation: $35
- Registered Agent Designation: $35
- **Total: $70**
- Optional: Certified Copy (+$8.75), Certificate of Status (+$8.75)

---

### **Annual Report (LLC)**

**Required Fields:**
- ✅ Document Number (from original filing)
- ✅ Current Business Name
- ✅ Principal Address
- ✅ Mailing Address
- ✅ Registered Agent Name
- ✅ Registered Agent Address
- ✅ Registered Agent Signature (electronic acceptance)
- ✅ Member/Manager Information (if changed)

**Fees:**
- Annual Report: $138.75

---

### **Annual Report (Corporation)**

**Required Fields:**
- ✅ Document Number
- ✅ Current Corporation Name
- ✅ Principal Address
- ✅ Mailing Address
- ✅ Registered Agent Name and Address
- ✅ Registered Agent Signature
- ✅ Officer/Director Information

**Fees:**
- Annual Report: $150

---

### **Fictitious Name (DBA)**

**Required Fields:**
- ✅ Fictitious Name
- ✅ Owner Name(s) and Address(es)
- ✅ Business Address
- ✅ County where business operates
- ✅ FEI/EIN Number
- ✅ Owner Signature(s)

**Fees:**
- Fictitious Name Registration: $50

---

## 💳 **Payment Processing**

### **Sunbiz Accepts:**
- Credit/Debit Cards (online filing)
- Checks/Money Orders (mail filing)
- Prepaid E-File Account (for high-volume filers)

### **For LegalOps:**
We need to:
1. Collect payment from customer (via Stripe)
2. Pay Sunbiz using company credit card or prepaid account
3. Track both transactions for accounting

---

## 🎯 **RECOMMENDED APPROACH FOR LEGALOPS**

### **Phase 1: Manual Processing (MVP)**

**Workflow:**
1. **Customer places order** → Pays via Stripe
2. **System collects all required data** → Stores in database
3. **System generates pre-filled form** → PDF or web form data
4. **Staff manually submits to Sunbiz** → Using company credit card
5. **Staff uploads confirmation** → Attaches to order
6. **System notifies customer** → Email with status update

**Pros:**
- ✅ Simple to implement
- ✅ No API integration needed
- ✅ Full control over quality
- ✅ Compliant with Sunbiz terms

**Cons:**
- ❌ Requires manual labor
- ❌ Not scalable to high volume
- ❌ Slower processing time

---

### **Phase 2: Semi-Automated (Growth)**

**Workflow:**
1. **Customer places order** → Pays via Stripe
2. **System collects all required data** → Validates completeness
3. **System generates filing package** → Pre-filled forms, instructions
4. **Staff reviews and submits** → One-click to Sunbiz (browser extension?)
5. **System tracks status** → Automated reminders for staff
6. **System notifies customer** → Automated status updates

**Enhancements:**
- ✅ Browser extension to auto-fill Sunbiz forms
- ✅ Prepaid Sunbiz account for faster payment
- ✅ Automated data validation
- ✅ Staff dashboard for pending filings
- ✅ Automated customer notifications

---

### **Phase 3: Explore Partnerships (Scale)**

**Options:**
1. **Partner with existing registered agent company** → White-label their filing service
2. **Become a registered agent entity** → May unlock bulk filing tools
3. **Lobby for API access** → Work with Florida Division of Corporations
4. **Build proprietary automation** → Browser automation (risky)

---

## 📊 **Data Collection System Design**

### **Customer Profile Data (Reusable)**

Store in `User` or `Customer` model:
- Full Legal Name
- Email Address
- Phone Number
- Physical Address
- Mailing Address (if different)
- SSN/EIN (encrypted)
- Date of Birth (for individuals)

### **Entity-Specific Data (Per Order)**

Store in `Order.orderData` JSON field:
- Business Name
- Entity Type
- Principal Address
- Registered Agent Info
- Member/Manager/Officer/Director Info
- Stock Information (corporations)
- Purpose Statement
- Effective Date (if requested)

### **Smart Data Collection Flow**

```typescript
// Pseudocode
function collectFilingData(userId, serviceType) {
  // 1. Load existing customer data
  const customer = getCustomer(userId);
  
  // 2. Determine required fields for service
  const requiredFields = getRequiredFields(serviceType);
  
  // 3. Check what we already have
  const missingFields = requiredFields.filter(field => 
    !customer[field] || isExpired(customer[field])
  );
  
  // 4. Only ask for missing data
  if (missingFields.length > 0) {
    return showForm(missingFields);
  }
  
  // 5. Pre-fill form with existing data
  return showReviewForm(customer, requiredFields);
}
```

---

## 🔐 **Data Security Considerations**

**Sensitive Data:**
- SSN/EIN → Encrypt at rest, PCI compliance
- Signatures → Store as encrypted images or typed names
- Payment Info → Never store (use Stripe tokens)
- Personal Addresses → Secure storage, access controls

**Compliance:**
- GDPR/CCPA → Right to deletion, data portability
- Florida Public Records Law → Some filed data becomes public
- Attorney-Client Privilege → May not apply to formation services

---

## ✅ **Next Steps for Implementation**

### **Immediate (Phase 1 - MVP):**
1. ✅ Expand database schema to store all required filing data
2. ✅ Create data collection forms for each service type
3. ✅ Build "smart form" that only asks for missing data
4. ✅ Generate pre-filled PDF forms for staff
5. ✅ Create staff dashboard for manual filing
6. ✅ Implement order status tracking
7. ✅ Set up Stripe payment processing
8. ✅ Build customer notification system

### **Short-term (Phase 2 - Growth):**
1. ⏳ Apply for Prepaid Sunbiz E-File Account
2. ⏳ Build browser extension for auto-fill
3. ⏳ Implement automated data validation
4. ⏳ Create filing queue management system
5. ⏳ Add document generation (Articles, etc.)

### **Long-term (Phase 3 - Scale):**
1. ⏳ Explore registered agent entity registration
2. ⏳ Research partnership opportunities
3. ⏳ Investigate API access possibilities
4. ⏳ Consider building proprietary automation

---

## 📚 **References**

- **Sunbiz E-Filing:** https://dos.fl.gov/sunbiz/start-business/efile/
- **LLC Filing Instructions:** https://efile.sunbiz.org/llc_filing_help.html
- **Corporation Filing Instructions:** https://efile.sunbiz.org/profit_filing_help.html
- **Annual Report Instructions:** https://efile.sunbiz.org/sbs_ar_instr.html
- **Florida Statutes Chapter 605 (LLC):** http://www.leg.state.fl.us/statutes/
- **Florida Statutes Chapter 607 (Corp):** http://www.leg.state.fl.us/statutes/

---

## 💡 **Key Takeaways**

1. **No API exists** - Manual or semi-automated filing is required
2. **Data collection is key** - Smart forms that remember customer data
3. **Start simple** - Manual processing for MVP, automate later
4. **Payment is two-step** - Customer pays us, we pay Sunbiz
5. **Staff workflow is critical** - Build tools to make manual filing efficient
6. **Compliance matters** - Secure storage, proper signatures, accurate data


