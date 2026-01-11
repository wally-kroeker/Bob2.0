# Firefly III Quick Reference

Your daily operations guide for managing finances in Firefly III at http://10.10.10.34:8080

---

## Quick Transaction Entry

### Basic Transaction Entry

**Navigate:** Transactions → New transaction

**Required Fields:**
- **Type:** Withdrawal (spending) / Deposit (income) / Transfer (between accounts)
- **Account:** Select Personal/GoodFields/FabLab
- **Destination:** Expense category (for withdrawals) or Revenue source (for deposits)
- **Amount:** Dollar amount
- **Date:** Transaction date
- **Description:** What you bought or received

**Recommended Fields:**
- **Category:** What type of expense (Groceries, Gas, Software, etc.)
- **Tags:** Entity tag (`personal`, `business`, `cooperative`) + purpose tags
- **Notes:** Additional context (optional)

### Quick Entry Patterns

Common transactions with category and tag conventions:

**Personal Expenses:**
```
Coffee Shop: $5
  Category: Dining Out
  Tags: personal

Safeway Groceries: $85
  Category: Groceries
  Tags: personal

Gas Station: $45
  Category: Gas
  Tags: personal

Utilities Bill: $120
  Category: Utilities
  Tags: personal
```

**GoodFields (Business) Expenses:**
```
GitHub Pro: $99
  Category: Development Tools
  Tags: business, tax-deductible, recurring

ChatGPT Plus: $20
  Category: AI Tools
  Tags: business, tax-deductible, recurring

Conference Registration: $500
  Category: Professional Development
  Tags: business, tax-deductible

Home Office Internet: $80
  Category: Internet
  Tags: business, tax-deductible, shared
  Note: 70% business, 30% personal allocation
```

**FabLab (Cooperative) Expenses:**
```
Server Upgrade: $200
  Category: Equipment
  Tags: cooperative, investment

Network Switch: $150
  Category: Infrastructure
  Tags: cooperative, equipment

Electricity: $90
  Category: Utilities
  Tags: cooperative, operations
```

### Split Transactions

For receipts with multiple categories:

**Example: Costco Trip**
```
Total: $250
Split 1: Groceries $150 | personal
Split 2: Office Supplies $50 | business, tax-deductible
Split 3: Household Items $50 | personal
```

**Steps:**
1. Create new transaction → Withdrawal
2. Click "Add split" button
3. Enter each split with category and amount
4. Tag each split appropriately
5. Verify total matches receipt

---

## Budget Monitoring

### Check Current Month Budget Status

**Web UI:** Budgets → Current month overview

**What to Look For:**
- 🟢 Green: Under budget
- 🟡 Yellow: Near budget limit
- 🔴 Red: Over budget

### Weekly Budget Review (Recommended)

**Every Monday:**
1. Check budget variance (% over/under)
2. Review large transactions (any surprises?)
3. Verify categorization (all tagged correctly?)
4. Check envelope funds (on track?)

### Budget Alerts

**When to Adjust Spending:**
- Any category >80% spent before month-end
- Multiple categories trending over
- Large unexpected expense depleted envelope fund

**When to Adjust Budget:**
- Consistent overspending in same category (lifestyle change)
- Underspending by >20% for 3 months (unrealistic target)
- Income change requires budget rebalancing

---

## Rule Creation for Automation

Rules automatically categorize and tag transactions based on patterns.

### Create New Rule

**Navigate:** Administration → Rules → Create new rule

**Rule Structure:**
1. **Trigger:** When to activate rule
2. **Actions:** What to do when triggered

### Common Rule Patterns

**Safeway → Groceries, Personal**
```
Trigger: Description contains "SAFEWAY"
Actions:
  - Set category to "Groceries"
  - Add tag "personal"
  - Set budget to "Personal Groceries"
```

**GitHub Subscription → Development Tools, Business**
```
Trigger: Description contains "GITHUB"
Actions:
  - Set category to "Development Tools"
  - Add tag "business"
  - Add tag "tax-deductible"
  - Add tag "recurring"
  - Set notes to "GitHub Pro subscription"
```

**Shell Gas Station → Gas, Personal**
```
Trigger: Description contains "SHELL"
Actions:
  - Set category to "Gas"
  - Add tag "personal"
```

**Hydro Bill → Utilities, Personal**
```
Trigger: Description contains "MANITOBA HYDRO"
Actions:
  - Set category to "Utilities"
  - Add tag "personal"
  - Add tag "recurring"
```

### Rule Testing

**Before Enabling:**
1. Create rule
2. Find sample transaction that should match
3. Click "Test rule" button
4. Verify actions applied correctly
5. Enable rule

**After Creating:**
- Run rules manually on existing transactions: Transactions → Bulk edit → Apply rules
- Verify categorization worked as expected

---

## Account Reconciliation

Regular reconciliation ensures Firefly matches your actual bank balance.

### Weekly Reconciliation Process

**Every Friday:**

1. **Check Balance**
   - Navigate to account (Personal/GoodFields/FabLab)
   - Note Firefly balance
   - Check bank statement balance

2. **Identify Discrepancies**
   - If mismatch: Missing transactions or duplicates?
   - Check pending transactions (not yet cleared)
   - Verify recent entries were saved

3. **Add Missing Transactions**
   - Enter any transactions missed during the week
   - Double-check dates and amounts
   - Run categorization rules

4. **Reconcile in Firefly**
   - Click "Reconcile" button on account page
   - Enter bank statement balance
   - Firefly will show difference
   - Mark transactions as reconciled
   - Save reconciliation

5. **Update Bob's Cache**
   - Tell Bob: "Update Firefly"
   - Bob runs sync script
   - Markdown cache updated with latest data

---

## Category and Tag Conventions

### Category Structure

**Personal Categories:**
- Housing (rent, mortgage, utilities, internet)
- Groceries
- Dining Out
- Gas
- Transportation (car payment, insurance, maintenance)
- Entertainment
- Healthcare
- Personal Subscriptions

**GoodFields (Business) Categories:**
- Software/SaaS (ChatGPT, GitHub, dev tools)
- Development Tools
- AI Tools
- Professional Development
- Hardware (computers, equipment)
- Professional Services (accountant, lawyer)
- Office Supplies
- Marketing
- Insurance (liability, E&O)

**FabLab (Cooperative) Categories:**
- Equipment
- Infrastructure
- Utilities (lab electricity, cooling)
- Maintenance
- Community Projects
- Documentation

### Tag Conventions

**Entity Tags (Always Include):**
- `personal` - Personal/household expenses
- `business` - GoodFields corporate expenses
- `cooperative` - FabLab infrastructure

**Purpose Tags:**
- `tax-deductible` - Business write-offs for CRA
- `recurring` - Subscriptions, monthly bills
- `investment` - Long-term asset purchases
- `shared` - Split between entities (document allocation)
- `equipment` - Hardware, tools, fixed assets
- `operations` - Day-to-day operational expenses
- `emergency` - Unexpected/unplanned expenses

**Example Transaction with Tags:**
```
ChatGPT Plus Subscription: $20
  Category: AI Tools
  Tags: business, tax-deductible, recurring
  Account: GoodFields Business
```

---

## Common Questions & Troubleshooting

### "How do I track recurring transactions?"

**Option 1: Piggy Bank (Sinking Fund)**
- Navigate to Piggy Banks → Create new
- Set target amount and account
- Add regular deposits to fund
- Example: "Car Maintenance Fund" - $200/month

**Option 2: Recurring Transaction**
- Navigate to Recurring Transactions → Create new
- Set frequency (weekly, monthly, quarterly, yearly)
- Firefly auto-creates transaction on schedule
- Example: Netflix $15/month automatically entered

### "How do I handle split expenses (shared costs)?"

**Same-Transaction Split:**
- Use split transaction feature (see above)
- Tag each split with entity
- Example: Internet $80 → $56 business + $24 personal

**Separate Transactions:**
- Enter full amount to primary entity
- Create transfer transaction to allocate
- Example: Costco receipt → split into separate entries

### "How do I track envelope funds?"

**Use Piggy Banks:**
1. Create piggy bank per envelope (Car Maintenance, Emergency Fund, etc.)
2. Link to asset account (Personal Checking)
3. Add regular deposits (monthly contribution)
4. Withdraw when expense occurs
5. Track progress toward goal

### "How do I see what I spent last month?"

**Reports:**
- Navigate to Reports → Default Financial Report
- Select date range (last month)
- Select accounts (Personal/GoodFields/FabLab)
- Generate report
- View by category, budget, or tag

**Bob Query:**
- Ask Bob: "What did I spend last month?"
- Bob queries Firefly API + markdown cache
- Returns summary with patterns

### "API token invalid error"

**Fix:**
1. Navigate to Profile → OAuth → Personal Access Tokens
2. Revoke old token
3. Create new token
4. Update `.env.importer` file in Firefly directory
5. Update Bob's sync script configuration
6. Restart Data Importer container

### "Transactions not appearing in budget"

**Check:**
1. **Category Match:** Does transaction category match budget definition?
2. **Date Range:** Is transaction date within budget period?
3. **Account Match:** Is account included in budget scope?
4. **Currency Match:** Does transaction currency match budget currency?

**Fix:**
- Edit transaction → verify category
- Verify budget configuration → Administration → Budgets
- Re-run rules if auto-categorization failed

### "Sync script fails"

**Troubleshooting Steps:**
1. Verify Firefly API is running: `curl http://10.10.10.34:8080/api/v1/health`
2. Check API token in environment: `echo $FIREFLY_III_ACCESS_TOKEN`
3. Test authentication: `curl -H "Authorization: Bearer $TOKEN" http://10.10.10.34:8080/api/v1/accounts`
4. Check Python dependencies: `cd scripts && pip install -r requirements.txt`
5. Run script with verbose output: `python firefly_sync.py --verbose`

---

## Keyboard Shortcuts

**Transaction Entry:**
- `Alt+T` - New transaction
- `Alt+S` - Save transaction
- `Esc` - Cancel/close

**Navigation:**
- `Alt+D` - Dashboard
- `Alt+B` - Budgets
- `Alt+A` - Accounts
- `Alt+R` - Reports

**Search:**
- `Alt+F` - Search transactions
- `/` - Focus search bar

---

## API Integration Quick Reference

For automation and Bob integration.

### Authentication

**Generate Token:**
1. Profile → Preferences → OAuth → Personal Access Tokens
2. Create new token → name it descriptively
3. Copy token (shown only once)
4. Store in `.env.importer` or environment variable

**Usage:**
```bash
export FIREFLY_III_ACCESS_TOKEN="your-token-here"

curl -H "Authorization: Bearer $FIREFLY_III_ACCESS_TOKEN" \
  http://10.10.10.34:8080/api/v1/accounts
```

### Common API Endpoints

**List Accounts:**
```bash
GET http://10.10.10.34:8080/api/v1/accounts
```

**Get Account Transactions:**
```bash
GET http://10.10.10.34:8080/api/v1/accounts/{id}/transactions?start=2025-11-01&end=2025-11-30
```

**List Budgets:**
```bash
GET http://10.10.10.34:8080/api/v1/budgets?start=2025-11-01&end=2025-11-30
```

**Get Transaction Details:**
```bash
GET http://10.10.10.34:8080/api/v1/transactions/{id}
```

**Create Transaction (Future Automation):**
```bash
POST http://10.10.10.34:8080/api/v1/transactions
Content-Type: application/json

{
  "error_if_duplicate_hash": true,
  "transactions": [
    {
      "type": "withdrawal",
      "date": "2025-11-17",
      "amount": "15.00",
      "description": "Coffee",
      "source_name": "Personal Checking",
      "destination_name": "Starbucks",
      "category_name": "Dining Out",
      "tags": ["personal"]
    }
  ]
}
```

---

## Bob Integration Commands

Tell Bob these phrases to activate Firefly operations:

**Data Sync:**
- "Update Firefly" - Run sync script to cache latest data
- "Reload financial data" - Fresh sync from Firefly API
- "Did you get my transactions?" - Check if recent entries synced

**Budget Queries:**
- "What's my budget variance?" - Current month over/under by category
- "Am I over budget?" - Quick status check
- "Show my spending patterns" - Historical analysis

**Quick Reference:**
- "Show Firefly quick reference" - Display this guide
- "How do I enter a transaction?" - Transaction entry steps
- "How do I reconcile?" - Reconciliation workflow

**Rule Creation:**
- "Create a Firefly rule for Safeway" - Show rule creation steps
- "What are common Firefly rules?" - List rule patterns

---

**Last Updated:** 2025-11-17
**Firefly III Version:** 6.x
**Deployment:** http://10.10.10.34:8080 (internal LAN only)

**Need More Help?** Consult `CLAUDE.md` for comprehensive Firefly integration documentation or ask Bob for specific workflow guidance.
