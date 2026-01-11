# Monthly Budget Review Workflow

Comprehensive monthly financial analysis to understand spending patterns, adjust budgets, and plan for the month ahead.

---

## When to Run This Workflow

**Timing:** Last weekend of the month (or first weekend of new month)

**Duration:** 45-60 minutes for thorough review

**Prerequisites:**
- All transactions entered and reconciled
- Bank accounts balanced
- Bob's cache updated with latest Firefly data

---

## Part 1: Budget Variance Analysis (15 minutes)

### Step 1: Generate Budget Report in Firefly

**Navigate:** Reports → Default Financial Report

**Settings:**
- Date range: Current month (Nov 1 - Nov 30)
- Accounts: All (Personal, GoodFields, FabLab)
- Include: Budgets, Categories, Tags

**Generate and Download:**
- Click "Generate Report"
- Review in Firefly web UI
- Export as CSV (optional, for detailed analysis)

### Step 2: Review Budget Variance by Category

**For Each Budget Category:**

| Category | Budgeted | Actual | Variance | % |
|----------|----------|--------|----------|---|
| Groceries | $400 | $450 | +$50 | +12.5% |
| Dining Out | $150 | $200 | +$50 | +33% |
| Gas | $200 | $180 | -$20 | -10% |
| Utilities | $250 | $250 | $0 | 0% |

**Flag for Attention:**
- 🔴 **Over by >20%:** Spending problem or budget too low?
- 🟡 **Over by 10-20%:** Monitor next month, potential issue
- 🟢 **Within ±10%:** Good tracking
- 🔵 **Under by >20%:** Budget too high or unusual month?

### Step 3: Analyze Overspending Categories

**For Each Red Flag Category:**

1. **Identify Specific Transactions**
   - Filter Firefly by category + current month
   - Sort by amount (largest first)
   - Look for patterns or anomalies

2. **Categorize Overspending Type:**
   - **One-Time Event:** Unusual expense, won't repeat
   - **Lifestyle Change:** Permanent increase (new habit)
   - **Seasonal:** Predictable but irregular (holidays, etc.)
   - **Budget Too Low:** Consistently over every month

3. **Decision:**
   - **One-Time:** No action, accept this month's variance
   - **Lifestyle Change:** Increase budget next month
   - **Seasonal:** Create envelope fund for next occurrence
   - **Budget Too Low:** Adjust budget to realistic level

**Example Analysis:**

**Dining Out: +33% Over ($50 extra)**
- Transactions:
  - Nov 5: $30 team lunch (GoodFields, miscategorized)
  - Nov 12: $25 date night
  - Nov 18: $15 coffee shop work session
  - Nov 22: $20 family dinner
  - Nov 27: $110 total vs $150 budget... wait, that's under?

**Realization:** Miscategorization! Team lunch should be GoodFields business expense.

**Action:**
1. Recategorize Nov 5 transaction
2. Add rule: "Team lunch → Professional Services, business"
3. Re-run budget report
4. Dining now: $180 vs $150 = +$30 (20% over, acceptable variance)

### Step 4: Analyze Underspending Categories

**For Each Blue Flag Category:**

1. **Verify Not Missing Transactions**
   - Check bank statement
   - Usual expenses present?
   - Reconciliation complete?

2. **Understand Why Under:**
   - **Budget Too High:** Set unrealistic target
   - **Unusual Month:** Travel, illness, schedule change
   - **Behavior Change:** Successfully reduced spending
   - **Seasonal:** Lower need this time of year

3. **Decision:**
   - **Budget Too High:** Lower next month's budget
   - **Unusual Month:** No action, will normalize
   - **Behavior Change:** Celebrate! Keep new habit
   - **Seasonal:** Adjust budget seasonally

### Step 5: Overall Budget Summary

**Calculate Entity Totals:**

**Personal:**
- Budgeted: $4,000
- Actual: $4,140
- Variance: +$140 (3.5% over)
- **Assessment:** Acceptable, minor over budget

**GoodFields:**
- Budgeted: $1,500
- Actual: $1,200
- Variance: -$300 (20% under)
- **Assessment:** Low client activity this month

**FabLab:**
- Budgeted: $500
- Actual: $480
- Variance: -$20 (4% under)
- **Assessment:** On track

**Combined:**
- Total Budgeted: $6,000
- Total Actual: $5,820
- Total Variance: -$180 (3% under)
- **Overall Assessment:** Good month, under budget overall

---

## Part 2: Spending Pattern Analysis (10 minutes)

### Compare to Previous Months

**Ask Bob:**
- "Bob, compare my November spending to October"
- "Bob, what are my spending trends over last 3 months?"

**Bob's Analysis:**
- Category-by-category comparison
- Trend identification (increasing/decreasing)
- Seasonal pattern recognition
- Anomaly detection

**Manual Analysis (Firefly Reports):**

**3-Month Spending Comparison:**

| Category | Sep | Oct | Nov | Trend |
|----------|-----|-----|-----|-------|
| Groceries | $380 | $420 | $450 | ↑ Increasing |
| Dining Out | $160 | $180 | $200 | ↑ Increasing |
| Gas | $190 | $200 | $180 | → Stable |
| Subscriptions | $250 | $250 | $250 | → Fixed |

**Insights:**
- Food costs trending up (groceries + dining)
- Gas stable (commute pattern consistent)
- Subscriptions fixed (as expected)

**Actions:**
- Investigate food cost increase (inflation? more eating out?)
- Consider meal prep to reduce both categories
- Set alert if dining >$200 next month

### Identify Largest Expenses

**Top 10 Transactions This Month:**

1. Rent: $1,200 (Housing)
2. Car Payment: $400 (Transportation)
3. Server Purchase: $200 (FabLab Equipment)
4. Insurance: $150 (Transportation)
5. Utilities: $120 (Housing)
6. ChatGPT: $99 (GoodFields AI Tools)
7. Phone Bill: $90 (Communications)
8. Netflix: $85 (Entertainment)
9. Safeway: $85 (Groceries)
10. GitHub: $70 (GoodFields Development)

**Analysis:**
- Fixed expenses: $2,055 (77% of personal budget)
- Variable expenses: $600 (23% of personal budget)
- Business expenses: $169 (tools/subscriptions)
- FabLab: $200 (one-time equipment purchase)

**Insights:**
- High fixed expense ratio (good: predictable, bad: inflexible)
- Low variable spending gives budget cushion
- Business spending minimal (low client activity)

---

## Part 3: Runway and Cash Flow Review (10 minutes)

### Emergency Fund Status

**Ask Bob:**
- "Bob, what's my current runway?"
- "Bob, emergency fund progress?"

**Manual Calculation:**

**Personal Emergency Fund:**
- Current Balance: $15,600
- Target: 6 months expenses = $24,000
- Progress: 65% of target
- Remaining: $8,400 needed

**Monthly Contribution:**
- Goal: $500/month to emergency fund
- Actual this month: $460 (close!)
- Estimated completion: 18 months at current rate

### Runway Analysis

**Personal Runway:**
- Emergency fund: $15,600
- Monthly burn: $4,140 (this month's actual)
- Runway: 3.8 months
- **Status:** Below 6-month target, but trending up

**GoodFields Runway:**
- Business savings: $8,500
- Monthly burn: $1,200
- Runway: 7.1 months
- **Status:** Healthy, low burn rate

**Combined Runway:**
- Total liquid: $24,100
- Combined burn: $5,340/month
- Runway: 4.5 months
- **Status:** Needs improvement, target 6+ months

### Cash Flow Forecast

**Next Month Income (December):**
- Consulting revenue: $0 (no active contracts)
- Severance/unemployment: $X,XXX
- Other income: $0
- **Total:** $X,XXX

**Next Month Planned Expenses:**
- Personal: $4,000 (regular budget)
- GoodFields: $1,500 (regular budget)
- FabLab: $500 (regular budget)
- **Total:** $6,000

**Net Cash Flow:**
- Income - Expenses = $X,XXX - $6,000
- **Result:** Positive / Negative / Break-even

**Actions Based on Forecast:**
- **Positive:** Continue building emergency fund
- **Break-even:** Maintain current spending
- **Negative:** Reduce discretionary, focus on revenue generation

---

## Part 4: Tax and Business Finance Review (10 minutes)

### Tax-Deductible Expense Tracking

**Filter Firefly:**
- Tag: `tax-deductible`
- Account: GoodFields Business
- Date: Current month

**November Tax-Deductible Expenses:**
- ChatGPT Plus: $20
- GitHub Pro: $70
- Internet (70% business): $56
- Professional Development: $99
- **Total:** $245 business write-offs

**YTD Tax-Deductible Total:**
- Run same filter for Jan 1 - Nov 30
- Export for tax prep
- **YTD Total:** $X,XXX

**Actions:**
- Save CSV export to tax folder
- Note any missing receipts
- Verify categorization accurate for CRA

### Personal vs Business Allocation Review

**Shared Expenses This Month:**
- Home Internet: $80 → 70% business ($56) / 30% personal ($24)
- Cell Phone: $90 → 60% business ($54) / 36% personal ($36)
- Vehicle (mileage): 200km business / 400km personal = 33% business

**Verify Allocation:**
- Percentages still accurate?
- Business use increased/decreased?
- Document changes for CRA compliance

### Subscription Optimization

**Current Business Subscriptions:**
- ChatGPT Plus: $20/month
- GitHub Pro: $70/month
- AWS: $30/month
- Other: $X/month
- **Total:** $XXX/month

**Personal Subscriptions:**
- Netflix: $15/month
- Spotify: $10/month
- Other: $X/month
- **Total:** $XXX/month

**Optimization Questions:**
- Any subscriptions not being used?
- Can any personal subscriptions move to business? (if business use)
- Better pricing available? (annual vs monthly)
- Redundant services? (e.g., multiple cloud storage)

**Actions:**
- Cancel unused subscriptions
- Migrate eligible subscriptions to GoodFields (tax benefit)
- Consider annual payments for frequently-used services (discount)

---

## Part 5: Next Month Planning (5 minutes)

### Set December Budgets

**Based on November Analysis:**

**Categories to Adjust:**
- Groceries: Increase from $400 → $450 (consistent trend)
- Dining Out: Keep at $150 (monitor closely)
- Entertainment: Increase $50 (holiday season)
- Gifts: Add $200 (seasonal, one-time)

**Envelope Funds to Review:**
- Car Maintenance: On track, no changes
- Emergency Fund: Continue $500/month
- Christmas/Gifts: Increase contribution for December

**New Budget Totals:**
- Personal: $4,250/month (from $4,000)
- GoodFields: $1,500/month (unchanged)
- FabLab: $500/month (unchanged)
- **Total:** $6,250/month

### Identify Upcoming Large Expenses

**December Known Expenses:**
- Annual subscriptions renewing?
- Holiday gifts ($200 budgeted)
- Travel plans? (flights, hotels)
- Vehicle maintenance? (winter tire swap)
- Insurance renewals?

**Plan Envelope Fund Usage:**
- Christmas gifts: Use holiday envelope fund
- Winter tires: Use car maintenance envelope
- Annual subscriptions: Use subscription envelope

### Set Financial Goals for December

**Personal Goals:**
- 🎯 Stay within adjusted $4,250 budget
- 🎯 Add $460+ to emergency fund
- 🎯 Complete holiday shopping within $200 budget

**GoodFields Goals:**
- 🎯 Land new consulting contract (revenue!)
- 🎯 Update website/portfolio
- 🎯 Reduce AWS costs (optimization project)

**FabLab Goals:**
- 🎯 Complete server setup (Nov equipment purchase)
- 🎯 Document infrastructure for community
- 🎯 Plan Q1 2025 equipment roadmap

---

## Part 6: Documentation and Follow-Up (5 minutes)

### Update Financial Notes

**Document Key Findings:**

```markdown
# November 2025 Budget Review

## Summary
- Overall: $180 under budget (3% variance)
- Personal: $140 over (dining/groceries up)
- GoodFields: $300 under (low activity)
- FabLab: $20 under (on track)

## Actions Taken
1. Increased December grocery budget to $450
2. Recategorized team lunch (was dining, now business)
3. Migrated 2 subscriptions to GoodFields (tax benefit)
4. Canceled unused streaming service

## December Adjustments
- Grocery budget: $400 → $450
- Added holiday gift budget: $200
- Total personal: $4,000 → $4,250

## Runway Status
- Personal: 3.8 months (target: 6)
- GoodFields: 7.1 months (healthy)
- Combined: 4.5 months (improving)

## Focus Areas December
- Revenue generation (consulting outreach)
- Maintain food costs (meal prep)
- Holiday spending discipline
```

### Create TaskMan/Vikunja Tasks

**December Tasks:**
- [ ] Week 1: Review food spending (ensure within new budget)
- [ ] Week 2: Complete holiday shopping (stay within $200)
- [ ] Week 3: Send consulting proposals (revenue focus)
- [ ] Week 4: Prepare for January budget review

### Update Bob's Knowledge

**Tell Bob:**
- "Bob, update Firefly cache"
- "Bob, December budget set at $6,250"
- "Bob, emergency fund target is $24,000"

**Bob's New Context:**
- Updated spending patterns
- New budget targets
- December focus areas
- Runway goals

---

## Integration with Other Systems

### Update Telos (Business Strategy)

**If Revenue/Runway Changed:**
- Update R1 urgency level
- Adjust consulting pipeline priority
- Update FabLab funding timeline

### Publishing Loop

**Document Milestone (if significant):**
- Major budget optimization achieved
- Runway milestone reached (e.g., 6 months)
- System improvement implemented

**Example Commit:**
```bash
feat(project/bob): November budget review - optimized subscriptions, adjusted targets #build-log !milestone
```

### Monthly Financial Report Email (Optional)

**Send to Accountability Partner/Spouse:**
- Budget summary (high level, no specific amounts)
- Runway status
- Next month goals
- Any concerns or wins

---

## Checklist: Monthly Budget Review

```
Monthly Budget Review - [Month/Year]

Part 1: Budget Variance Analysis
□ Generate budget report in Firefly
□ Review variance by category (flag red/blue)
□ Analyze overspending categories (identify causes)
□ Analyze underspending categories (verify accuracy)
□ Calculate entity totals (Personal/GoodFields/FabLab)

Part 2: Spending Pattern Analysis
□ Compare to previous months (trends)
□ Identify largest expenses (top 10)
□ Ask Bob for pattern insights

Part 3: Runway and Cash Flow Review
□ Check emergency fund progress
□ Calculate current runway (personal/business/combined)
□ Forecast next month cash flow
□ Adjust strategy based on forecast

Part 4: Tax and Business Finance Review
□ Export tax-deductible expenses (YTD)
□ Review personal vs business allocation
□ Optimize subscriptions (cancel/migrate)
□ Update tax folder with receipts

Part 5: Next Month Planning
□ Adjust budgets based on analysis
□ Identify upcoming large expenses
□ Plan envelope fund usage
□ Set specific financial goals

Part 6: Documentation and Follow-Up
□ Document key findings in notes
□ Create TaskMan tasks for focus areas
□ Update Bob's cache and context
□ Update Telos if needed
□ Publish milestone if significant

Notes:
_________________________________________________
_________________________________________________
```

---

## Success Criteria

**Excellent Monthly Review:**
- ✓ All variances explained and addressed
- ✓ Budgets adjusted to realistic levels
- ✓ Spending patterns understood
- ✓ Runway trending toward target
- ✓ Tax documentation current
- ✓ Clear goals for next month
- ✓ Review completed in <60 minutes

**Warning Signs:**
- ✗ Large unexplained variances
- ✗ Runway declining month-over-month
- ✗ Same categories over budget repeatedly
- ✗ Tax documentation behind
- ✗ Review taking >90 minutes (too complex?)

---

**Goal:** Complete financial understanding, optimized budgets, clear path forward.

**Last Updated:** 2025-11-17
