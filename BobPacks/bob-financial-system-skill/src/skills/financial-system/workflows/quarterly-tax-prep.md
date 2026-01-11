# Quarterly Tax Preparation Workflow

Organize tax-deductible expenses, prepare documentation for accountant, and ensure CRA compliance.

---

## When to Run This Workflow

**Timing:** Last week of each quarter
- Q1: End of March
- Q2: End of June
- Q3: End of September
- Q4: End of December (before year-end)

**Duration:** 60-90 minutes for thorough review

**Prerequisites:**
- All transactions entered and categorized
- Firefly reconciled and current
- Receipts organized (digital or physical)

---

## Part 1: Export Tax-Deductible Expenses (15 minutes)

### Step 1: Filter Firefly for Business Expenses

**Navigate:** Transactions → Search/Filter

**Filter Settings:**
- **Account:** GoodFields Business
- **Tags:** `tax-deductible`
- **Date Range:** Current quarter (e.g., Oct 1 - Dec 31)
- **Sort:** By category, then by date

### Step 2: Export Transaction Data

**Export Options:**
1. **CSV Export** (preferred for spreadsheet analysis)
   - Click "Export" button
   - Select "CSV format"
   - Save as: `GoodFields_Q4_2025_TaxDeductible.csv`

2. **PDF Report** (for visual review)
   - Generate report
   - Print to PDF
   - Save as: `GoodFields_Q4_2025_Report.pdf`

### Step 3: Organize by CRA Category

**Canadian CRA Expense Categories:**

**Office Expenses:**
- Office supplies
- Software subscriptions
- Computer equipment (under $500, immediate deduction)
- Printer, scanner, peripherals

**Professional Services:**
- Accounting fees
- Legal fees
- Consulting services
- Professional memberships

**Advertising and Promotion:**
- Website hosting
- Domain registrations
- Marketing materials
- Social media advertising

**Business Tax, Fees, Licenses:**
- Business registration fees
- Professional licenses
- Municipal business tax

**Meals and Entertainment (50% deductible):**
- Client meals
- Team lunches
- Networking events
- Conference meals

**Home Office Expenses:**
- Rent (percentage of home used for business)
- Utilities (percentage)
- Internet (business use percentage)
- Property insurance (percentage)

**Motor Vehicle Expenses:**
- Business mileage (track with log)
- Gas (business portion)
- Insurance (business portion)
- Maintenance (business portion)

**Telephone and Utilities:**
- Cell phone (business use percentage)
- Internet (business use percentage)
- Office landline (if separate)

**Capital Cost Allowance (CCA):**
- Computer equipment (over $500, depreciated)
- Furniture (depreciated)
- Vehicles (depreciated)
- Tools and equipment (depreciated)

### Step 4: Create Quarterly Summary

**Spreadsheet Template:**

| CRA Category | Q4 2025 | YTD 2025 | Notes |
|--------------|---------|----------|-------|
| Office Expenses | $450 | $1,800 | Software, supplies |
| Professional Services | $500 | $2,000 | Accounting, legal |
| Advertising | $150 | $600 | Domain, hosting |
| Meals & Entertainment (50%) | $100 | $400 | Client meetings |
| Home Office | $800 | $3,200 | 30% of rent, utilities |
| Motor Vehicle | $300 | $1,200 | Business mileage log |
| Telephone & Utilities | $270 | $1,080 | 70% business use |
| **Total** | **$2,570** | **$10,280** | |

---

## Part 2: Receipt and Documentation Review (20 minutes)

### Step 1: Verify Receipt Availability

**For Each Business Expense:**

1. **Digital Receipts:**
   - Email confirmations (subscriptions, online purchases)
   - PDF invoices (saved to receipts folder)
   - Screenshots (if necessary)

2. **Physical Receipts:**
   - Scanned to PDF
   - Organized by month
   - Original stored in file folder

3. **Missing Receipts:**
   - Request duplicate from vendor
   - Bank/credit card statement as backup
   - Note in expense documentation

### Step 2: Organize Receipt Files

**Folder Structure:**
```
GoodFields/
├── Tax_2025/
│   ├── Q1/
│   │   ├── Receipts/
│   │   │   ├── 2025-01-15_ChatGPT.pdf
│   │   │   ├── 2025-02-10_GitHub.pdf
│   │   │   └── ...
│   │   ├── Q1_Summary.xlsx
│   │   └── Q1_Export.csv
│   ├── Q2/
│   ├── Q3/
│   ├── Q4/
│   │   ├── Receipts/
│   │   ├── Q4_Summary.xlsx
│   │   └── Q4_Export.csv
│   └── YearEnd/
│       └── 2025_Annual_Summary.xlsx
```

**File Naming Convention:**
- Format: `YYYY-MM-DD_Vendor_Amount.pdf`
- Example: `2025-11-15_GitHub_Pro_70.pdf`
- Consistent naming enables easy search

### Step 3: Document Business Purpose

**CRA Requirement:** Business purpose for each expense

**Add to Spreadsheet:**

| Date | Vendor | Amount | Category | Purpose |
|------|--------|--------|----------|---------|
| 2025-11-15 | GitHub | $70 | Software | Version control for client projects |
| 2025-11-10 | ChatGPT | $20 | AI Tools | Research and consulting assistance |
| 2025-11-08 | Safeway | $30 | Meals (50%) | Client lunch meeting re: Hydro project |

**Business Purpose Guidelines:**
- Specific and clear
- Related to income-earning activities
- Reasonable and necessary
- Documented contemporaneously (at time of expense)

---

## Part 3: Home Office and Mileage Calculations (15 minutes)

### Home Office Expense Calculation

**Eligible if:**
- Workspace used regularly and exclusively for business
- Principal place of business OR used regularly to meet clients

**Calculate Business Use Percentage:**

**Method 1: Square Footage**
```
Office space: 150 sq ft
Total home: 1,500 sq ft
Business %: 150 / 1,500 = 10%
```

**Method 2: Number of Rooms**
```
Office: 1 room
Total home: 8 rooms
Business %: 1 / 8 = 12.5%
```

**Apply Percentage to Home Expenses:**

| Expense | Annual Cost | Business % | Deductible |
|---------|-------------|------------|------------|
| Rent | $18,000 | 10% | $1,800 |
| Utilities (heat, electric) | $2,400 | 10% | $240 |
| Home Insurance | $1,200 | 10% | $120 |
| Internet | $960 | 70% | $672 |
| Property Tax | $3,600 | 10% | $360 |
| **Total** | | | **$3,192** |

**Quarterly Deduction:** $3,192 / 4 = $798

### Motor Vehicle Mileage Tracking

**CRA Requirement:** Detailed mileage log

**Mileage Log Format:**

| Date | Start Location | End Location | Purpose | KM | Personal/Business |
|------|----------------|--------------|---------|-----|-------------------|
| 2025-11-15 | Home | Client Site | Hydro meeting | 45 | Business |
| 2025-11-15 | Client Site | Home | Return from meeting | 45 | Business |
| 2025-11-16 | Home | Grocery Store | Personal errand | 10 | Personal |

**Calculate Business Use:**
```
Total KM driven Q4: 2,500 km
Business KM Q4: 800 km
Business %: 800 / 2,500 = 32%
```

**Apply to Vehicle Expenses:**

| Expense | Q4 Cost | Business % | Deductible |
|---------|---------|------------|------------|
| Gas | $400 | 32% | $128 |
| Insurance | $300 | 32% | $96 |
| Maintenance | $200 | 32% | $64 |
| **Total** | **$900** | | **$288** |

**Alternative:** CRA per-km rate (simplified)
- $0.68/km (first 5,000 km) in 2025
- Business km: 800 km
- Deduction: 800 × $0.68 = $544

**Choose Method:**
- Actual expenses (if high) vs per-km rate
- Use higher deduction method

---

## Part 4: Shared Expense Allocation Review (10 minutes)

### Document Personal vs Business Split

**Shared Expenses Requiring Allocation:**

**Internet:**
- Total monthly cost: $80
- Business use: 70% (work-from-home, client calls, research)
- Personal use: 30% (streaming, personal browsing)
- Monthly business deduction: $56
- Quarterly business deduction: $168

**Cell Phone:**
- Total monthly cost: $90
- Business use: 60% (client calls, business texts, work apps)
- Personal use: 40% (personal calls, social media)
- Monthly business deduction: $54
- Quarterly business deduction: $162

**Verify Allocation Percentages:**
- Review call logs (business vs personal calls)
- Check data usage (work apps vs personal apps)
- Adjust if usage patterns changed
- Document reasoning for percentages

### CRA Compliance Check

**Red Flags to Avoid:**
- 100% business allocation (unrealistic for shared services)
- No documentation of split method
- Changing percentages dramatically quarter-to-quarter
- Round numbers without justification (e.g., exactly 50%)

**Best Practices:**
- Consistent allocation method year-over-year
- Documented calculation (time log, usage log)
- Reasonable percentages (60-80% business typical)
- Conservative estimates (when in doubt, lower %)

---

## Part 5: Personal vs Business Transaction Audit (10 minutes)

### Review Potential Miscategorizations

**Common Mistakes:**

**Personal Expenses Claimed as Business:**
- Personal meals claimed as business (no client present)
- Personal entertainment claimed as business (no business purpose)
- Personal portions of split purchases claimed 100% business

**Business Expenses Not Claimed:**
- Business meals entered as personal
- Professional development courses not tagged `tax-deductible`
- Equipment purchases not categorized correctly

### Run Audit Queries in Firefly

**Query 1: Personal Account with `tax-deductible` Tag**
- Should be ZERO results (if GoodFields account exists)
- If any results: miscategorized, should be GoodFields account

**Query 2: GoodFields Account without `tax-deductible` Tag**
- Review results: should these be deductible?
- If yes: add `tax-deductible` tag, include in quarterly export

**Query 3: Large Personal Expenses (>$100)**
- Review list: any business-related?
- Example: "Conference registration" paid from personal account
- If business: recategorize to GoodFields, add `tax-deductible` tag

### Correct Miscategorizations

**For Each Miscategorization Found:**

1. Edit transaction in Firefly
2. Change account (Personal → GoodFields or vice versa)
3. Update category if needed
4. Add or remove `tax-deductible` tag
5. Add note: "Corrected Q4 tax prep - was miscategorized"
6. Save

**Re-Export After Corrections:**
- Re-run tax-deductible filter
- Export fresh CSV
- Update quarterly summary spreadsheet

---

## Part 6: Prepare Documents for Accountant (10 minutes)

### Compile Tax Package

**Q4 Tax Package Contents:**

1. **Transaction Export**
   - `GoodFields_Q4_2025_TaxDeductible.csv`
   - All business transactions, categorized

2. **Quarterly Summary**
   - `Q4_2025_Summary.xlsx`
   - Organized by CRA category
   - Totals and year-to-date

3. **Receipt Package**
   - `Q4_Receipts.zip` (all receipts as PDFs)
   - Organized by month or category
   - File names match transaction descriptions

4. **Home Office Calculation**
   - `HomeOffice_2025.xlsx`
   - Square footage calculation
   - Percentage applied to expenses
   - Supporting documentation (lease, utility bills)

5. **Mileage Log**
   - `Mileage_Q4_2025.xlsx`
   - Detailed trip log (date, purpose, km)
   - Business km calculation
   - Vehicle expense receipts

6. **Shared Expense Documentation**
   - `SharedExpenses_2025.xlsx`
   - Internet, phone allocation percentages
   - Usage logs or calculation method
   - Rationale documented

### Create Cover Letter for Accountant

**Template:**

```
To: [Accountant Name]
From: Wally Kroeker, GoodFields Inc.
Date: [Quarter End Date]
Re: Q4 2025 Tax Documentation

Dear [Accountant],

Attached is the Q4 2025 tax documentation for GoodFields Inc.:

Summary:
- Total business expenses: $X,XXX
- Tax-deductible expenses: $X,XXX
- Home office deduction: $XXX
- Vehicle expenses (business use): $XXX

Notable Items This Quarter:
- [Any large expenses, equipment purchases, etc.]
- [Any changes to home office or mileage allocation]
- [Any questions or concerns]

All receipts are organized in the Receipts folder and match the transaction export.

Please let me know if you need any additional documentation or clarification.

Best regards,
Wally Kroeker
GoodFields Inc.
```

---

## Part 7: Year-End Tax Planning (Q4 Only - 15 minutes)

**Run in December Only (Q4 Review):**

### Calculate Annual Totals

**Year-to-Date Summary:**

| CRA Category | YTD 2025 | Notes |
|--------------|----------|-------|
| Office Expenses | $X,XXX | |
| Professional Services | $X,XXX | |
| Advertising | $X,XXX | |
| Meals & Entertainment (50%) | $X,XXX | |
| Home Office | $X,XXX | |
| Motor Vehicle | $X,XXX | |
| Telephone & Utilities | $X,XXX | |
| **Total Deductions** | **$XX,XXX** | |

### Identify Tax Optimization Opportunities

**Last-Minute Deductions (Before Dec 31):**

1. **Equipment Purchases:**
   - Any needed equipment? Buy before year-end for immediate deduction (if <$500)
   - Larger equipment (>$500) depreciated via CCA

2. **Prepay Subscriptions:**
   - Annual subscriptions renewing in Q1? Pay in December for current year deduction
   - Example: Pay GitHub annual plan in Dec instead of monthly in Jan

3. **Professional Development:**
   - Any courses, conferences, memberships to purchase?
   - Deductible if business-related

4. **Charitable Donations:**
   - Personal tax credit available
   - Consider end-of-year donation for current year

5. **RRSP Contributions:**
   - Deadline: 60 days after year-end (March 1, 2026)
   - Reduces taxable income
   - Calculate optimal contribution

### Estimate Tax Liability

**Simplified Calculation:**

**Business Income (GoodFields):**
- Total revenue: $XX,XXX
- Total expenses: $XX,XXX
- Net income: $XX,XXX

**Personal Income:**
- GoodFields distribution: $XX,XXX
- Other income: $X,XXX
- Total personal income: $XX,XXX

**Estimated Tax:**
- Use CRA tax brackets
- Rough estimate: 30-40% of net income (varies by province)
- Example: $50K net income → ~$15K tax liability

**Quarterly Tax Payment Check:**
- Did you make quarterly installments?
- Owing at year-end vs refund?
- Adjust Q1 installments for next year

---

## Integration with Financial System

### Update Bob's Knowledge

**After Tax Prep:**
- Tell Bob: "Update Firefly"
- "Bob, Q4 tax prep complete, $X,XXX deductions documented"

**Bob's New Context:**
- Quarterly tax deductions total
- Year-to-date deduction total
- Tax optimization opportunities identified

### Update Telos (Business Strategy)

**If Tax Findings Impact Business:**
- Large tax liability → increase revenue focus
- Significant deductions → reduces effective cost of business expenses
- Home office percentage → informs workspace decisions

### Document in Publishing Loop (Optional)

**If Significant Tax Milestone:**
- First year tax filing as consultant
- Significant tax savings achieved
- System optimization breakthrough

**Example Commit:**
```bash
feat(project/bob): Q4 tax prep workflow - $XX,XXX deductions documented #build-log #tax !milestone
```

---

## Checklist: Quarterly Tax Prep

```
Quarterly Tax Prep - Q[1-4] [Year]

Part 1: Export Tax-Deductible Expenses
□ Filter Firefly for business expenses (GoodFields, tax-deductible tag)
□ Export CSV and PDF reports
□ Organize by CRA category
□ Create quarterly summary spreadsheet

Part 2: Receipt and Documentation Review
□ Verify receipt availability for all expenses
□ Organize receipt files (digital folder structure)
□ Document business purpose for each expense
□ Note any missing receipts (request or use statement)

Part 3: Home Office and Mileage Calculations
□ Calculate home office business use percentage
□ Apply percentage to home expenses (rent, utilities, etc.)
□ Review mileage log (business vs personal km)
□ Calculate vehicle expense deduction (actual vs per-km)

Part 4: Shared Expense Allocation Review
□ Document internet, phone business use percentages
□ Verify allocation method reasonable and consistent
□ Calculate quarterly shared expense deductions
□ Check CRA compliance (no red flags)

Part 5: Personal vs Business Transaction Audit
□ Query personal account for tax-deductible tags (should be zero)
□ Query GoodFields for missing tax-deductible tags
□ Review large personal expenses (any business-related?)
□ Correct miscategorizations and re-export

Part 6: Prepare Documents for Accountant
□ Compile transaction export (CSV)
□ Include quarterly summary (Excel/PDF)
□ Package receipts (ZIP folder)
□ Add home office calculation docs
□ Include mileage log and vehicle expenses
□ Document shared expense allocation method
□ Write cover letter summarizing quarter

Part 7: Year-End Tax Planning (Q4 Only)
□ Calculate annual totals (all categories)
□ Identify last-minute deduction opportunities
□ Make strategic year-end purchases if beneficial
□ Estimate total tax liability
□ Plan Q1 quarterly tax installments

Follow-Up
□ Update Bob's cache and context
□ Update Telos if tax findings impact strategy
□ Document milestone if significant (publishing loop)
□ Schedule Q1 tax prep (3 months from now)

Notes:
_________________________________________________
_________________________________________________
```

---

## Success Criteria

**Excellent Tax Prep:**
- ✓ All business expenses documented with receipts
- ✓ Organized by CRA category
- ✓ Business purpose clearly stated
- ✓ Home office and mileage calculated accurately
- ✓ Shared expenses allocated reasonably
- ✓ No personal/business miscategorizations
- ✓ Complete package ready for accountant
- ✓ Completed in <90 minutes

**Warning Signs:**
- ✗ Missing receipts for significant expenses
- ✗ Unclear business purpose documentation
- ✗ Personal expenses claimed as business
- ✗ Home office or mileage calculations unsupported
- ✗ Inconsistent allocation percentages
- ✗ Tax prep taking >2 hours (process too complex)

---

**Goal:** CRA-compliant documentation, maximized deductions, accountant-ready package, no tax surprises.

**Last Updated:** 2025-11-17
