---
name: Bob Financial System Skill
pack-id: bob-financial-system-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Personal and corporate financial tracking with Firefly III integration. Zero-based budgeting, envelope funds, and runway forecasting.
type: skill
platform: claude-code
dependencies: []
keywords: [finance, budget, runway, expenses, firefly, consulting]
---

# Bob Financial System Skill

> Complete financial tracking for personal, corporate (GoodFields), and cooperative (FabLab) finances with AI-driven analysis and Firefly III integration.

---

## The Problem

Managing finances across multiple entities (personal, corporate, cooperative) creates several challenges:

1. **Financial Chaos** - Scattered transactions across different accounts make it impossible to see the full picture
2. **Budget Blindness** - Without visibility into spending patterns, money leaks through subscriptions and untracked expenses
3. **Runway Uncertainty** - Consulting income is irregular; knowing how long your savings will last is critical for planning
4. **Tax Complexity** - Mixing personal and business expenses leads to missed deductions and tax season stress
5. **Manual Data Entry** - Syncing transactions from Firefly III to AI context requires tedious copy-paste workflows
6. **No Scenario Planning** - "What if I make this purchase?" or "Can GoodFields fund this equipment?" requires mental math

**The core issue:** You need AI-driven financial intelligence that understands your multi-entity structure, tracks runway automatically, and provides actionable insights—without exposing sensitive data beyond your local system.

---

## The Solution

**Bob Financial System Skill** provides a complete financial intelligence layer that:

### Core Capabilities

1. **Multi-Entity Tracking**
   - Separate finances for Personal, GoodFields (consulting), and FabLab (cooperative)
   - Cross-entity intelligence for inter-account transfers and shared expenses
   - Entity-aware categorization and reporting

2. **Firefly III Integration**
   - TypeScript sync script fetches transactions via API
   - Generates markdown summaries for AI context
   - Automatic account discovery and entity mapping
   - Historical sync (6+ months) for trend analysis

3. **AI-Driven Analysis**
   - Natural language queries: "What's my runway?" or "Am I over budget?"
   - Budget variance tracking (planned vs. actual)
   - Spending pattern recognition
   - Subscription optimization suggestions
   - Tax deduction identification

4. **Zero-Based Budgeting**
   - Every dollar allocated with purpose
   - Envelope funds for irregular expenses (car maintenance, equipment, etc.)
   - Monthly budget templates with rollover tracking

5. **Runway Forecasting**
   - Cash flow projections based on historical burn rate
   - Scenario modeling: "What if [event] happens?"
   - Severance depletion tracking (linked to Telos R1 urgency)

6. **Privacy-First Design**
   - All financial data stays local (gitignored)
   - AI reads markdown summaries, not raw bank data
   - Firefly API token in environment variables only
   - Never commits sensitive data to version control

### Workflow Integration

- **Firefly III Quick Reference**: Daily transaction entry, rule creation, reconciliation
- **Monthly Budget Review**: Compare planned vs. actual, adjust envelopes
- **Quarterly Tax Prep**: Aggregate deductible expenses for GoodFields
- **Weekly Reconciliation**: Verify account balances match Firefly

---

## Architecture

### Components

```
bob-financial-system-skill/
├── README.md              # This file - overview and architecture
├── INSTALL.md             # Step-by-step installation instructions
├── VERIFY.md              # Verification checklist
└── src/
    └── skills/
        └── financial-system/
            ├── SKILL.md                      # Skill activation logic
            ├── CLAUDE.md                     # Claude-specific instructions (if needed)
            ├── firefly-quick-reference.md    # Daily operations guide
            ├── fireflyiii_api_guide.md       # API documentation
            ├── scripts/
            │   └── firefly_sync.ts           # TypeScript sync script (Bun)
            ├── templates/
            │   ├── asset-registry-template.md
            │   ├── monthly-budget-template.md
            │   └── subscription-tracking-template.md
            └── workflows/
                ├── daily-transaction-entry.md
                ├── monthly-budget-review.md
                ├── quarterly-tax-prep.md
                └── weekly-reconciliation.md
```

### Data Flow

1. **Transaction Entry** → User enters transactions in Firefly III web interface
2. **API Sync** → `firefly_sync.ts` fetches transactions via Firefly API
3. **Markdown Generation** → Script generates entity-specific markdown summaries in `data/` directory
4. **AI Context Loading** → Bob reads markdown files when financial skill activates
5. **Natural Language Analysis** → Bob provides insights, variance reports, recommendations
6. **Actionable Output** → User receives analysis with next steps

### Integration Points

- **Telos Skill**: Revenue pipeline (R1 urgency), infrastructure goals, mission tracking
- **Publishing Loop**: Financial milestone documentation (revenue targets, cost reductions)
- **TaskMan/Vikunja**: Budget review tasks, maintenance reminders, subscription renewals
- **PAI Core**: Mission shift toward financial sovereignty and parallel society funding

### Data Structure

```
~/.claude/skills/financial-system/
├── data/                          # Gitignored - contains sensitive financial data
│   ├── personal/                  # Personal account transactions
│   │   └── 2025-01-transactions.md
│   ├── goodfields/                # Corporate (consulting) transactions
│   │   └── 2025-01-transactions.md
│   ├── fablab/                    # Cooperative transactions
│   │   └── 2025-01-transactions.md
│   └── cross-entity/              # Inter-entity transfers and shared expenses
│       └── allocation-rules.md
├── scripts/
│   └── firefly_sync.ts            # Bun script for API sync
├── templates/                      # Budget and tracking templates
├── workflows/                      # Step-by-step procedures
└── SKILL.md                        # Activation logic and capabilities
```

### Environment Variables

All API credentials live in the skill's `data/.env` file:

```bash
# Location: ~/.claude/skills/financial-system/data/.env
FIREFLY_III_ACCESS_TOKEN=your-token-here
FIREFLY_III_URL=http://firefly.apps.kroeker.fun:8080
```

This keeps credentials isolated to the skill and gitignored for privacy.

---

## Activation Triggers

Bob activates this skill when you ask:

**Budget & Spending:**
- "What's my budget?" / "Am I over budget?"
- "How much did I spend on [category]?"
- "Show my spending patterns"

**Cash Flow & Runway:**
- "What's my financial runway?"
- "How many months of expenses do I have saved?"
- "Can I afford to [purchase item]?"

**Firefly III Operations:**
- "Update Firefly" / "Sync Firefly data"
- "Show Firefly quick reference"
- "How do I enter a transaction in Firefly?"

**Tax & Business:**
- "What are my tax write-offs?"
- "Show me personal vs. corporate expense breakdown"
- "What's GoodFields' profit/loss?"

**Subscriptions:**
- "What subscriptions do I have?"
- "Which subscriptions should move to GoodFields?"

---

## Features

- **Zero-Based Budgeting**: Every dollar allocated with purpose
- **Envelope Funds**: Sinking funds for irregular expenses
- **Three-Entity Model**: Personal, GoodFields, FabLab separation
- **Firefly III Integration**: API-driven transaction syncing via TypeScript/Bun
- **Runway Forecasting**: Cash flow projections and burn rate analysis
- **Privacy-First**: All data local, gitignored, never leaves your machine
- **AI-Driven Insights**: Natural language financial analysis and recommendations
- **Workflow Automation**: Pre-built workflows for reconciliation, budgeting, tax prep

---

## Requirements

- **Bun**: JavaScript/TypeScript runtime (for sync scripts)
- **Firefly III**: Self-hosted personal finance manager with API access
- **Claude Code** (or compatible AI system with skill support)
- **Environment Variables**: `FIREFLY_III_ACCESS_TOKEN` and `FIREFLY_III_URL`

---

## Installation

See [INSTALL.md](INSTALL.md) for complete step-by-step instructions.

**Quick Start:**

```bash
# Copy skill to Claude directory
cp -r src/skills/financial-system ~/.claude/skills/

# Configure credentials
cd ~/.claude/skills/financial-system/data/
cat > .env << 'EOF'
FIREFLY_III_ACCESS_TOKEN=your-token-here
FIREFLY_III_URL=http://firefly.apps.kroeker.fun:8080
EOF

# Install dependencies and run sync
cd ../scripts/
bun install
bun run firefly_sync.ts
```

---

## Verification

After installation, complete the [VERIFY.md](VERIFY.md) checklist to ensure everything works correctly.

---

## Related Packs

- **pai-core-install**: Provides skill routing and response format standards
- **pai-core-install (MEMORY system)**: Tracks financial decisions and learnings automatically
- **bob-telos-skill**: Integrates revenue pipeline and mission tracking

---

*This pack is battle-tested in Wally Kroeker's production Bob system, managing personal finances, GoodFields consulting revenue, and FabLab cooperative operations.*
