# Weekly Reconciliation Workflow

Ensure Firefly matches your actual bank balances and catch any discrepancies early.

---

## Why Weekly Reconciliation Matters

**Benefits:**
- Catch missing transactions before they're forgotten
- Identify duplicate entries quickly
- Ensure budget accuracy
- Detect fraud or unauthorized charges
- Maintain confidence in financial data

**Cost of Skipping:**
- Budget variance becomes unreliable
- Missing transactions compound
- Month-end reconciliation becomes painful
- Financial analysis loses accuracy

---

## Friday Afternoon Routine (15 minutes)

### Step 1: Gather Current Balances (2 minutes)

**For Each Account:**

1. **Personal Checking**
   - Open bank app/website
   - Note current balance: `$______`
   - Note pending transactions (not yet cleared)
   - Screenshot or write down

2. **GoodFields Business Account**
   - Open business bank/Stripe dashboard
   - Note current balance: `$______`
   - Note pending transactions
   - Screenshot or write down

3. **FabLab Operations** (if separate account)
   - Open account portal
   - Note current balance: `$______`
   - Note pending transactions
   - Screenshot or write down

### Step 2: Check Firefly Balances (1 minute)

**For Each Account in Firefly:**

1. Navigate to Accounts page
2. Click on Personal Checking → Note balance: `$______`
3. Click on GoodFields Business → Note balance: `$______`
4. Click on FabLab Operations → Note balance: `$______`

### Step 3: Compare and Identify Discrepancies (2 minutes)

**Create Comparison Table:**

| Account | Bank Balance | Firefly Balance | Difference | Pending |
|---------|--------------|-----------------|------------|---------|
| Personal | $4,250 | $4,180 | -$70 | $0 |
| GoodFields | $8,500 | $8,500 | $0 | $0 |
| FabLab | $2,100 | $2,100 | $0 | $0 |

**Discrepancy Analysis:**
- **Exact Match (✓):** No action needed
- **Small Difference (<$10):** Likely rounding or pending
- **Large Difference (>$10):** Investigation required

### Step 4: Investigate Discrepancies (5 minutes)

**Common Causes:**

**1. Missing Transactions**
- Check bank statement for unrecorded transactions
- Look for card charges, auto-pay bills, transfers
- Add missing transactions to Firefly with correct dates

**2. Duplicate Entries**
- Search Firefly for same amount on same date
- If duplicate found, delete one
- Note vendor to adjust rules

**3. Pending Transactions**
- Bank shows pending, Firefly shows cleared
- Wait for transaction to clear
- Or adjust Firefly balance for pending

**4. Date Mismatch**
- Transaction entered in Firefly on wrong date
- Bank shows different posting date
- Correct date in Firefly

**5. Wrong Amount**
- Typo in Firefly entry
- Edit transaction to match bank
- Add note about correction

### Step 5: Add Missing Transactions (2 minutes)

**For Each Missing Transaction:**

1. New transaction in Firefly
2. Enter correct date (from bank statement)
3. Enter exact amount (match bank)
4. Add description from bank (even if cryptic)
5. Categorize and tag appropriately
6. Add note: "Missed during daily entry - added during reconciliation"
7. Save

**Run Categorization Rules:**
- After adding missing transactions
- Bulk edit → Apply all rules
- Verify automation worked correctly

### Step 6: Reconcile in Firefly (2 minutes)

**Official Reconciliation:**

1. Navigate to account (e.g., Personal Checking)
2. Click "Reconcile" button
3. Enter **bank balance** from Step 1
4. Enter **reconciliation date** (today's date)
5. Firefly shows difference (should be $0 now)
6. Review transactions since last reconciliation
7. Mark transactions as "Reconciled" (optional)
8. Save reconciliation

**If Still Off:**
- Double-check bank balance entry
- Verify no transactions missed
- Check for pending transactions not yet in bank
- Note discrepancy for Monday investigation

### Step 7: Update Bob's Cache (1 minute)

**Sync Latest Data:**

1. Tell Bob: "Update Firefly"
2. Bob runs `firefly_sync.py`
3. Markdown cache updated with latest transactions
4. Bob confirms sync complete

**Verify Sync:**
- Ask Bob: "What's my budget variance this week?"
- Bob should reference current data
- If stale, re-run sync

---

## Monthly Deep Reconciliation

**Last Friday of Month (30 minutes):**

### Extended Reconciliation Steps

**1. Full Month Review**
- Generate monthly report in Firefly
- Compare to bank statements (all transactions)
- Verify every transaction reconciled
- Check for patterns of missing entries

**2. Budget Variance Analysis**
- Budget → Monthly overview
- Identify categories over/under budget
- Understand why variances occurred
- Plan adjustments for next month

**3. Categorization Audit**
- Scan all transactions for month
- Verify categories make sense
- Look for miscategorizations
- Update rules if patterns found

**4. Tag Audit**
- Check business vs personal allocation
- Verify tax-deductible tags applied
- Ensure entity tags correct
- Cross-entity transfers tagged properly

**5. Asset Registry Update**
- Any equipment purchases this month?
- Update asset registry with new items
- Note depreciation for business assets
- Schedule maintenance if needed

**6. Envelope Fund Check**
- Review piggy banks (sinking funds)
- Are contributions on track?
- Any envelope fund expenses this month?
- Adjust contributions if needed

---

## Troubleshooting Common Reconciliation Issues

### Persistent Discrepancies

**Bank Shows More Than Firefly:**
- Missing transactions (most common)
- Check bank statement line by line
- Look for auto-pay, subscription charges
- Check for returned/bounced transactions

**Firefly Shows More Than Bank:**
- Duplicate entries (check for same amount/date)
- Transaction not yet cleared at bank (pending)
- Wrong account (entered to wrong Firefly account)
- Refund/reversal not recorded

### Pending Transaction Confusion

**How to Handle:**
- Bank shows pending, Firefly shows cleared
- Two options:
  1. **Wait:** Don't enter until bank clears it
  2. **Enter now:** Mark in Firefly, expect difference until cleared

**Recommended:**
- Enter in Firefly when you make purchase (immediate awareness)
- Expect small difference until bank clears
- Reconcile using "cleared balance" not "pending balance"

### Credit Card Reconciliation

**Special Considerations:**
- Credit card balance is **negative** (you owe money)
- Firefly liability account shows balance owed
- Reconcile against credit card statement balance
- Pay attention to statement date vs current date

**Process:**
1. Check credit card statement balance
2. Compare to Firefly liability account
3. Add any missing charges
4. Verify payment transactions recorded
5. Match statement balance exactly

### Multiple Account Complexity

**When You Have Many Accounts:**
- Reconcile one account at a time (don't mix)
- Start with highest activity account (Personal)
- Then business account (GoodFields)
- Finally lowest activity (FabLab)
- Check for inter-account transfers (easy to miss)

---

## Automation Opportunities

### Phase 2: Bank Import (Future)

**When Data Importer Configured:**
- Weekly CSV import from bank
- Categorization rules auto-apply
- Reconciliation becomes verification only
- Time drops from 15min → 5min

### Phase 3: Full Automation (Future)

**When N8N Workflow Active:**
- Daily bank sync (no manual import)
- Automatic categorization
- Weekly reconciliation report emailed
- Alert if discrepancy >$10
- Bob proactive notification

---

## Integration with Bob

### Ask Bob for Reconciliation Help

**Current Status:**
- "Bob, what's my account balance?"
- Bob queries Firefly + cache
- Returns balance and recent activity

**After Reconciliation:**
- "Bob, I just reconciled - update cache"
- Bob syncs latest from Firefly
- Analysis now uses fresh data

**Discrepancy Investigation:**
- "Bob, I'm $70 off on Personal account - help investigate"
- Bob: "Looking at recent transactions... [analysis]"
- Bob suggests likely causes based on patterns

### Weekly Report Request

**Ask Bob:**
- "Bob, weekly financial summary"
- Bob generates:
  - Budget variance by category
  - Spending patterns vs last week
  - Upcoming bills/subscriptions
  - Envelope fund status
  - Runway update

---

## Checklist: Friday Reconciliation

```
Weekly Reconciliation - [Date]

□ Gather bank balances (Personal/GoodFields/FabLab)
□ Note Firefly balances for each account
□ Calculate differences
□ Investigate discrepancies >$10
□ Add missing transactions
□ Run categorization rules on new entries
□ Official reconciliation in Firefly (enter bank balance)
□ Verify balances now match (or note pending)
□ Update Bob's cache: "Update Firefly"
□ Quick budget check (any red flags?)

Notes:
_____________________________________________
_____________________________________________
```

---

## Success Metrics

**Good Reconciliation Health:**
- ✓ Balances match within $5 (pending transactions)
- ✓ All discrepancies explained
- ✓ No missing transactions found
- ✓ Takes <15 minutes weekly
- ✓ Confidence in budget accuracy

**Warning Signs:**
- ✗ Large unexplained differences
- ✗ Multiple missing transactions each week
- ✗ Reconciliation taking >30 minutes
- ✗ Same issues recurring weekly
- ✗ Avoiding reconciliation

**If Warning Signs Present:**
- Review daily entry workflow (entering consistently?)
- Check categorization rules (creating duplicates?)
- Consider bank import (Phase 2) earlier than planned
- Ask Bob for pattern analysis

---

**Goal:** Perfect account reconciliation in <15 minutes weekly, complete confidence in financial data.

**Last Updated:** 2025-11-17
