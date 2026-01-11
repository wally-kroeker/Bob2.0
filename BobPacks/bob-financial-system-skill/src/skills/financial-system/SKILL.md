# Financial System Skill

## When to Activate This Skill

Bob activates the **financial-system** skill when Wally asks financial questions or needs financial analysis. This skill provides comprehensive personal, corporate (GoodFields), and cooperative (FabLab) financial tracking.

## Activation Triggers

**Firefly III Operations:**
- "Update Firefly" / "Sync Firefly data" → Bob runs firefly_sync.py script
- "Did you get my transactions?" → Bob queries Firefly API
- "Reload financial data" → Bob syncs latest from Firefly
- "How do I enter a transaction in Firefly?" → Bob provides quick entry guide
- "Create a Firefly rule for [vendor]" → Bob shows rule creation steps
- "How do I reconcile my account?" → Bob provides reconciliation workflow
- "What are my Firefly budget categories?" → Bob lists configured categories
- "Show Firefly quick reference" → Bob displays daily operations guide

**Budget & Spending Questions:**
- "What's my budget?"
- "How much did I spend on [category]?"
- "What's my budget variance this month?"
- "Am I over budget?"
- "Show my spending patterns"
- "What were my expenses last month?"
- "What did I spend on [date]?" → Bob queries Firefly API for that period

**Cash Flow & Runway:**
- "What's my financial runway?"
- "How many months of expenses do I have saved?"
- "What's my burn rate?"
- "Can I afford to [purchase item]?"
- "When will my severance run out?" (linked to Telos R1)

**Subscription & Optimization:**
- "What subscriptions do I have?"
- "What subscriptions should move to GoodFields?"
- "How much can I save by migrating subscriptions?"
- "What are my recurring charges?"

**Tax & Business Finance:**
- "What are my tax write-offs?"
- "What are GoodFields' deductible expenses?"
- "Show me personal vs. corporate expense breakdown"
- "What's my GoodFields profit/loss?"

**Asset & Maintenance:**
- "When is my next car maintenance due?"
- "What's my vehicle maintenance history?"
- "Track this equipment purchase"
- "Show FabLab equipment depreciation"

**Cross-Entity & Forecasting:**
- "Financial overview" or "Give me a financial summary"
- "Can GoodFields fund this FabLab equipment?"
- "Show me inter-entity transfers"
- "What if [scenario] - how does that change my runway?"

**General Activation:**
- "Bob, financial advisor mode"
- "Bob, show my finances"
- "Financial system activate"
- "Check my financial health"

## Core Capabilities

### Data Access
- Reads personal finances (`data/personal/*.md`)
- Reads corporate finances (`data/goodfields/*.md`)
- Reads cooperative finances (`data/fablab/*.md`)
- Reads cross-entity intelligence (`data/cross-entity/*.md`)
- Accesses Python scripts for analysis
- Queries Firefly III API (http://10.10.10.34:8080/api/v1) for live data
- References Firefly quick-reference guide for daily operations

### Analysis Features
- Budget variance tracking (planned vs. actual)
- Spending pattern recognition
- Subscription optimization suggestions
- Tax deduction identification
- Runway forecasting
- Asset lifecycle tracking
- Scenario modeling

### Integration Points
- **Telos Skill:** Revenue pipeline, R1 urgency, infrastructure goals
- **Publishing Loop:** Financial milestone documentation
- **TaskMan/Vikunja:** Budget review tasks, maintenance reminders
- **PAI Core:** Mission shift toward financial sovereignty

## Usage Pattern

**Activation Flow:**
1. User asks financial question or says activation phrase
2. Bob loads financial-system skill
3. Skill reads entity-specific data files
4. Bob provides natural language analysis
5. Suggestions include actionable next steps

**Example Conversation:**
```
User: "What's my budget variance this month?"
Bob: [Loads financial-system]
Bob: "Your personal spending is up 12% this month - primarily dining out.
      You're $340 over your Groceries envelope but $200 under on subscriptions.
      Overall variance: +$140.
      Recommendation: Monitor dining expenses next week, you have buffer."
```

## Integration with Bob's Identity

**How This Skill Reflects Bob's Purpose:**
- Supports Wally's mission shift: financial sovereignty → parallel society funding
- Removes financial chaos → enables strategic focus
- Enables data-driven decisions → aligns with Wally's analytical strength
- Tracks "cooperative" finances → reflects shared values
- Privacy-first approach → respects Wally's values

## Technical Notes

- **Language:** Python 3 (scripts), Markdown (data)
- **Scripts Location:** `scripts/` directory
- **Data Storage:** `data/` (gitignored for privacy)
- **Dependencies:** pandas, python-dateutil, requests
- **Output Format:** Markdown (human-readable for Bob)
- **Firefly III:** Deployed at 10.10.10.34:8080, API v1
- **Documentation:** See `firefly-quick-reference.md` for daily operations
- **Workflows:** See `workflows/` directory for detailed procedures

## Privacy & Security

**What This Skill Does:**
- Reads gitignored financial data (never leaves local machine)
- Summarizes trends and patterns in natural language
- Never exposes raw account numbers, transaction details
- Provides context-aware analysis without broadcasting amounts

**What This Skill Doesn't Do:**
- Commit financial data to git (protected by .gitignore)
- Store sensitive info in conversation logs
- Make financial decisions (advisory only)
- Expose Firefly API tokens or credentials
- Modify Firefly data without explicit user request

---

**Activation:** This skill loads automatically when Bob detects financial context in user queries. It can also be manually activated with "financial advisor mode" or similar phrases.
