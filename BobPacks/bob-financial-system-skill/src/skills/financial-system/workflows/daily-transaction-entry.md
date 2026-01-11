# Daily Transaction Entry Workflow

Your daily routine for staying on top of finances in Firefly III.

---

## Morning Routine (5 minutes)

### Review Yesterday's Spending

1. **Open Firefly III** at http://10.10.10.34:8080
2. **Check Dashboard** → Recent transactions
3. **Verify Yesterday's Entries:**
   - All transactions from yesterday entered?
   - Anything missing from wallet/cards?
   - Any pending transactions to add?

### Quick Entry Best Practices

**Enter as They Happen:**
- Keep Firefly tab open during workday
- Enter transactions immediately after purchase
- Use mobile-friendly web interface on phone
- Takes 30 seconds per transaction when fresh

**Batch Entry (if needed):**
- Review bank/credit card pending transactions
- Cross-reference with receipts or memory
- Enter all at once at end of day
- Takes 5-10 minutes for day's transactions

---

## Transaction Entry Patterns

### Coffee/Small Purchase (30 seconds)

**Scenario:** Grabbed coffee on way to work

**Quick Steps:**
1. New transaction → Withdrawal
2. Account: Personal Checking
3. Amount: $5
4. Description: "Coffee - Starbucks"
5. Category: Dining Out
6. Tags: `personal`
7. Save

### Groceries (1 minute)

**Scenario:** Weekly grocery run at Safeway

**Quick Steps:**
1. New transaction → Withdrawal
2. Account: Personal Checking
3. Amount: $150
4. Description: "Safeway weekly groceries"
5. Category: Groceries
6. Tags: `personal`
7. Notes: "Weekly meal prep"
8. Save

**If Rule Exists:**
- Just enter amount and description
- Rule auto-applies category and tags

### Subscription Payment (1 minute)

**Scenario:** Monthly ChatGPT Plus charge

**Quick Steps:**
1. New transaction → Withdrawal
2. Account: GoodFields Business
3. Amount: $20
4. Description: "ChatGPT Plus"
5. Category: AI Tools
6. Tags: `business`, `tax-deductible`, `recurring`
7. Notes: "Monthly AI research subscription"
8. Save

**Better: Set up recurring transaction**
- Will auto-create each month
- Just verify it appeared correctly

### Equipment Purchase (2 minutes)

**Scenario:** New server for FabLab

**Detailed Steps:**
1. New transaction → Withdrawal
2. Account: FabLab Operations
3. Amount: $1,200
4. Date: Purchase date
5. Description: "Proxmox Server - Dell PowerEdge"
6. Category: Equipment
7. Tags: `cooperative`, `investment`, `equipment`
8. Notes: "R740 8-core, 64GB RAM, 4x2TB SSD RAID10. Installed 2025-11-17. 5-year expected lifecycle."
9. Save

**Also Do:**
- Add to asset registry (separate tracking)
- Note depreciation schedule if needed
- Document in FabLab build log

### Split Transaction - Mixed Receipt (3 minutes)

**Scenario:** Costco run with personal + business items

**Steps:**
1. New transaction → Withdrawal
2. Account: Personal Checking (primary)
3. Click "Add split" button
4. **Split 1:**
   - Amount: $150
   - Category: Groceries
   - Tags: `personal`
   - Description: "Food items"
5. **Split 2:**
   - Amount: $50
   - Category: Office Supplies
   - Tags: `business`, `tax-deductible`
   - Description: "Printer paper, pens"
6. **Split 3:**
   - Amount: $50
   - Category: Household Items
   - Tags: `personal`
   - Description: "Cleaning supplies"
7. Verify total: $250 matches receipt
8. Save

---

## End of Day Checklist

### Evening Review (5 minutes)

**Before Bed or After Dinner:**

1. ✓ **All transactions entered?**
   - Check wallet for receipts
   - Review bank app pending transactions
   - Check email for payment confirmations
   - Verify credit card charges

2. ✓ **Proper categorization?**
   - Scan today's entries
   - Verify categories make sense
   - Check tags applied correctly
   - Fix any mistakes while fresh

3. ✓ **Budget status check**
   - Quick glance at budget page
   - Any categories getting high?
   - Over budget warnings?
   - Note for tomorrow's decisions

4. ✓ **Reconciliation status**
   - Does Firefly balance match bank?
   - Any discrepancies to investigate?
   - Mark transactions as cleared if needed

---

## Tips for Consistency

### Make It Effortless

**1. Keep Firefly Accessible**
- Browser bookmark or pin tab
- Mobile home screen shortcut
- Always one click away

**2. Enter Immediately**
- Right after purchase (while in car, at checkout, etc.)
- Before leaving store/venue
- Muscle memory builds quickly

**3. Use Rules Heavily**
- Create rule for any vendor you visit 2+ times
- Let automation handle categorization
- Just enter amount and description

**4. Batch Similar Transactions**
- All gas station visits together
- All groceries together
- Reduces context switching

### Build the Habit

**Week 1-2: Manual Everything**
- Enter every transaction by hand
- Learn categories and tags
- Understand your spending patterns

**Week 3-4: Add Rules**
- Create rules for common vendors
- Test and refine automation
- Reduce entry time per transaction

**Week 5+: Maintenance Mode**
- Transactions take 30 seconds each
- Rules handle most categorization
- Daily routine becomes automatic

### When You Forget

**Missed a Day?**
1. Don't stress - it happens
2. Review bank pending transactions
3. Cross-reference with calendar (where were you?)
4. Enter what you remember
5. Estimate if needed (mark with `estimated` tag)
6. Get back on track tomorrow

**Batch Entry Tips:**
- Sort bank transactions by date
- Enter newest first (most fresh in memory)
- Add notes about uncertainty if needed
- Better to have approximate data than none

---

## Mobile-Friendly Entry

### On Phone/Tablet

**Optimized Workflow:**
1. Firefly responsive design works on mobile
2. Keep browser tab open all day
3. Quick add: Amount + Description + Category
4. Tags can be added later if needed
5. Desktop review weekly for cleanup

**Voice Entry (Future):**
- "Bob, add $5 coffee to personal"
- "Bob, $150 Safeway groceries personal"
- "Bob, $20 ChatGPT business recurring"
- Bob creates transaction via API

---

## Integration with Bob

### Tell Bob About Transactions

**If Bob Has API Access (Future):**
- "Bob, add transaction: $45 Shell gas personal"
- Bob: "Added $45 to Personal Checking, category Gas, tagged personal"

**Current (Manual Entry):**
- Enter in Firefly web UI
- Tell Bob: "Update Firefly"
- Bob syncs latest data to cache
- Bob can now analyze today's spending

### Ask Bob For Context

**Budget Check:**
- "Bob, how's my budget today?"
- Bob queries Firefly + cache
- Returns variance and spending patterns

**Pattern Recognition:**
- "Bob, what did I spend on dining this week?"
- Bob analyzes recent transactions
- Shows trend vs previous weeks

---

## Troubleshooting

### "I Forgot to Enter Something"

**No Problem:**
- Enter it as soon as you remember
- Use correct date (not today)
- Firefly handles backdated transactions fine
- Add note: "Entered late - from [date]"

### "I Entered Wrong Amount"

**Fix:**
1. Find transaction in list
2. Click to edit
3. Correct amount
4. Add note about correction if significant
5. Save

### "I Categorized Wrong"

**Fix:**
1. Edit transaction
2. Change category
3. Update tags if needed
4. Save
5. Consider creating rule to prevent future mistakes

### "Duplicate Transaction Appeared"

**Cause:**
- Entered manually + auto-imported from bank
- Rule created duplicate

**Fix:**
1. Delete duplicate
2. Keep the one with better categorization
3. Adjust import rules to prevent recurrence

---

**Goal:** Transactions entered daily, categorized correctly, budgets monitored, no surprises.

**Time Investment:** 5-10 minutes daily = 2-3 hours monthly for complete financial clarity.

**Last Updated:** 2025-11-17
