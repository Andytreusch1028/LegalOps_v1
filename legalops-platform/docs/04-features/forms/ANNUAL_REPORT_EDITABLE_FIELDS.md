# Florida Annual Report - Editable vs Static Fields

## Research Summary

Based on official Florida Sunbiz documentation ([efile.sunbiz.org/sbs_ar_instr.html](https://efile.sunbiz.org/sbs_ar_instr.html)), the Annual Report form has specific rules about what can and cannot be changed.

---

## ✅ EDITABLE FIELDS (Can be Updated on Annual Report)

According to Florida Sunbiz: *"The purpose of the annual report is to confirm or update our records."*

### 1. **Principal Office Address**
- **Can Change**: Yes ✅
- **Requirements**: Must be a physical address (no PO Box)
- **Can be**: In-state, out-of-state, or out-of-country
- **Can be**: In care of an individual
- **Implementation**: Edit button toggles editable form fields

### 2. **Mailing Address**
- **Can Change**: Yes ✅
- **Requirements**: PO Box is acceptable
- **Can be**: In-state, out-of-state, or out-of-country
- **Can be**: Same as principal address (checkbox option)
- **Implementation**: Edit button toggles editable form fields

### 3. **Registered Agent**
- **Can Change**: Yes ✅
- **Can Change**: Agent name (individual or company)
- **Can Change**: Registered office address
- **Requirements**: 
  - Registered office must be a Florida street address
  - No PO Box or PO Drawer allowed
  - New agent must "electronically sign" to accept designation
- **Special Case**: Insurance companies with "Chief Financial Officer" as agent cannot change (must contact Division of Insurance Regulation)
- **Implementation**: Edit button toggles full agent replacement form

### 4. **Officers, Directors, Managers, Managing Members**
- **Can Change**: Yes ✅
- **Can Add**: New officers/directors/managers
- **Can Delete**: Existing officers/directors/managers
- **Can Change**: Names and addresses
- **Can Change**: Titles
- **Limit**: Up to 150 principals can be listed
- **Note**: A person may serve in more than one capacity
- **Implementation**: Edit button allows adding/removing/modifying list

### 5. **General Partners (LP/LLLP only)**
- **Can Change**: Addresses only ✅
- **Cannot Change**: Names (requires Certificate of Amendment)
- **Implementation**: Show address edit only, not name change

### 6. **Federal Employer Identification Number (FEI/EIN)**
- **Can Change**: Yes ✅
- **Can Add**: If not previously listed
- **Can Update**: If previously marked "Applied For"
- **Options**: Enter number, "Applied For", or "Not Applicable"
- **Implementation**: Editable text field with radio options

---

## ❌ STATIC FIELDS (Cannot be Changed on Annual Report)

### 1. **Entity Name**
- **Can Change**: NO ❌
- **Reason**: Requires separate Amendment filing
- **Quote**: *"The annual report will not allow you to change the name of the entity. The entity must file an amendment to change its name on our records."*
- **Implementation**: Display only, no edit button

### 2. **Document Number**
- **Can Change**: NO ❌
- **Reason**: Assigned by Florida Department of State
- **Implementation**: Display only, no edit button

### 3. **Entity Type**
- **Can Change**: NO ❌
- **Reason**: Fundamental characteristic of the entity
- **Examples**: LLC, Corporation, LP, LLLP, Nonprofit
- **Implementation**: Display only, no edit button

### 4. **Formation Date**
- **Can Change**: NO ❌
- **Reason**: Historical fact
- **Implementation**: Display only (if shown)

### 5. **State of Formation**
- **Can Change**: NO ❌
- **Reason**: Fundamental characteristic
- **Implementation**: Display only (if shown)

---

## 📋 Annual Report Requirements

### Filing Deadline
- **Due Date**: May 1st of each year
- **Late Fee**: $400 (for profit corps, LLCs, LPs, LLLPs)
- **No Late Fee**: Nonprofit corporations
- **Dissolution**: Failure to file by 3rd Friday of September results in administrative dissolution

### Filing Fees
- **Profit Corporation**: $150 (+ $8.75 for Certificate of Status)
- **Nonprofit Corporation**: $61.25 (+ $8.75 for Certificate of Status)
- **LLC**: $138.75 (+ $5.00 for Certificate of Status)
- **LP/LLLP**: $500.00 (+ $8.75 for Certificate of Status)

### Amended Annual Report
- **When**: After initial annual report is filed but changes needed
- **Fee (Profit/Nonprofit Corp)**: $61.25
- **Fee (LLC)**: $50.00
- **Cannot**: Cancel, remove, or change after submission

---

## 🎯 Implementation Strategy

### User Experience Flow

1. **Initial Display**: All fields show current data from database with ✅ checkmark
2. **Edit Buttons**: Each editable section has "Edit" button
3. **Edit Mode**: 
   - Button changes to "Cancel Edit" (red)
   - Section background changes to yellow (#fef3c7)
   - Form fields appear with current values pre-filled
   - 📝 Icon indicates editing mode
4. **Validation**: Required fields enforced when in edit mode
5. **Confirmation**: User must still check "I confirm..." box even if no changes
6. **Submission**: Only changed fields are sent to API

### Visual Indicators

- **✅ Green Checkmark**: Field is current/unchanged
- **📝 Yellow Background**: Field is being edited
- **Blue "Edit" Button**: Click to modify field
- **Red "Cancel Edit" Button**: Click to discard changes
- **Required Fields**: Marked with asterisk (*)

### Data Flow

1. **Load**: Fetch all current entity data from database
2. **Display**: Show all fields with current values
3. **Edit**: User clicks edit button, form fields appear
4. **Change**: User modifies values
5. **Submit**: Send only changed fields to API
6. **Save**: API updates database and creates Filing record
7. **Confirm**: Success message, redirect to filings list

---

## 🔒 Important Restrictions

### Cannot Be Changed via Annual Report
- Entity name → File Amendment
- Add/remove general partners (LP/LLLP) → File Certificate of Amendment
- Change entity type → Not possible (must dissolve and form new entity)
- Change document number → Not possible (assigned by state)

### Special Cases
- **Insurance Companies**: Cannot change registered agent if "Chief Financial Officer" is listed
- **Nonprofit Soliciting Contributions**: Must also register with Dept of Agriculture and Consumer Services
- **Foreign Entities**: May have additional requirements

---

## 📊 Form Validation Rules

### Principal Address
- ✅ Required: Street, City, State, ZIP
- ✅ Optional: Suite/Unit
- ❌ No PO Box allowed
- ✅ Out-of-state allowed
- ✅ Out-of-country allowed

### Mailing Address
- ✅ Required: Street, City, State, ZIP
- ✅ Optional: Suite/Unit
- ✅ PO Box allowed
- ✅ Out-of-state allowed
- ✅ Can be same as principal

### Registered Agent Address
- ✅ Required: Street, City, State, ZIP
- ❌ Must be Florida address
- ❌ No PO Box or PO Drawer
- ❌ No out-of-state addresses

### Officers/Directors/Managers
- ✅ At least 1 required
- ✅ Up to 150 allowed
- ✅ Can serve in multiple capacities
- ✅ Must have name and title
- ✅ Address can be abbreviated

---

## 🚀 Next Steps for Implementation

### Completed ✅
1. Principal Address - Editable with toggle
2. Mailing Address - Editable with toggle
3. Registered Agent - Editable with full replacement form

### To Complete 🔄
1. Managers/Officers - Add/edit/remove functionality
2. FEI/EIN Number - Editable field
3. API endpoint - Handle all update types
4. Database updates - Apply changes to entity records
5. Filing record - Store what was changed

### Future Enhancements 💡
1. Side-by-side comparison (old vs new)
2. Change summary before submission
3. Email confirmation with changes listed
4. Audit trail of all changes
5. Ability to file Amended Annual Report

---

## 📚 References

- [Florida Sunbiz Annual Report Instructions](https://efile.sunbiz.org/sbs_ar_instr.html)
- [Florida Sunbiz Update Information](https://dos.fl.gov/sunbiz/manage-business/update-information/)
- Florida Statutes §607.193 (Corporations)
- Florida Statutes §605.0212 (LLCs)
- Florida Statutes §817.155 (Fraudulent Filing - 3rd Degree Felony)

---

## ⚠️ Legal Notices

### Fraudulent Filing
**Florida Statute §817.155**: It is a 3rd Degree Felony to knowingly file a false document with the Division of Corporations.

### Electronic Signatures
**Florida Statute §15.16**: Electronic signatures have the same legal effect as original signatures. Typing someone's name/signature without their permission constitutes forgery.

### No Refunds
Once the annual report and fee are submitted, the fee cannot be refunded and the report cannot be cancelled, removed, or changed.

---

**Last Updated**: Based on current Florida Sunbiz requirements as of 2025

