# Installation Guide

Complete step-by-step installation for the **Bob Financial System Skill**.

---

## Prerequisites

Before installing this pack, ensure you have:

1. **Bun installed** (JavaScript/TypeScript runtime)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Firefly III instance** with API access
   - Self-hosted or cloud-hosted Firefly III
   - API token generated (Settings → Profile → Personal Access Tokens)
   - API URL accessible from your machine

3. **Claude Code** (or compatible AI system with skill support)

4. **Environment variables configured**
   - `PAI_DIR` or `~/.claude` directory exists
   - `FIREFLY_III_ACCESS_TOKEN` available
   - `FIREFLY_III_URL` (optional, defaults to `http://10.10.10.34:8080`)

---

## Installation Steps

### Step 1: Copy Skill Files

Copy the skill directory to your Claude skills directory:

```bash
# Set target directory
SKILLS_DIR=~/.claude/skills

# Create skills directory if it doesn't exist
mkdir -p $SKILLS_DIR

# Copy the financial-system skill
cp -r src/skills/financial-system $SKILLS_DIR/
```

### Step 2: Configure Firefly III Credentials

Create a `.env` file in the skill's `data/` directory with your Firefly III credentials:

```bash
cd $SKILLS_DIR/financial-system/data/

# Create .env file
cat > .env << 'EOF'
FIREFLY_III_ACCESS_TOKEN=your-token-here
FIREFLY_III_URL=http://firefly.apps.kroeker.fun:8080
EOF
```

**Important:** Replace `your-token-here` with your actual Firefly III API token.

**To generate a token in Firefly III:**
1. Navigate to **Settings → Profile → Personal Access Tokens**
2. Click **Create New Token**
3. Give it a name (e.g., "Bob Financial Sync")
4. Copy the token immediately (you won't see it again)
5. Paste it into the `.env` file

**Note:** The `.env` file is automatically gitignored for privacy.

### Step 3: Install Script Dependencies

Navigate to the scripts directory and install dependencies:

```bash
cd $SKILLS_DIR/financial-system/scripts/

# Install dependencies with Bun
bun install
```

This will install `@types/bun` for TypeScript support.

### Step 4: Test Firefly III Connection

Test that the sync script can connect to Firefly III:

```bash
cd $SKILLS_DIR/financial-system/scripts/

# Run sync for current month (test)
bun run firefly_sync.ts
```

**Expected output:**
```
Discovering accounts...
Discovered 3 accounts:
  - Personal Checking (personal)
  - GoodFields Business (goodfields)
  - FabLab Operations (fablab)

Syncing 2025-01...
  Fetching personal (Personal Checking)... ✓ (42 transactions)
  Fetching goodfields (GoodFields Business)... ✓ (18 transactions)
  Fetching fablab (FabLab Operations)... ✓ (7 transactions)

Sync complete!
```

If you see errors:
- **"FIREFLY_III_ACCESS_TOKEN not set"** → Verify the token is in `data/.env`
- **"API error: Connection refused"** → Check `FIREFLY_III_URL` and network connectivity
- **"HTTP 401: Unauthorized"** → Verify your API token is valid

### Step 5: Perform Initial Historical Sync

Sync the last 6 months of transactions:

```bash
cd $SKILLS_DIR/financial-system/scripts/

# Sync all months (6 months back)
bun run firefly_sync.ts --all

# Or customize number of months
bun run firefly_sync.ts --all --months-back 12
```

### Step 6: Update Skill Configuration (Optional)

If your account names don't match the default patterns (`personal`, `goodfields`, `fablab`), you may need to update the account mapping logic in `firefly_sync.ts`.

The script maps accounts based on keywords in account names:
- `personal`, `checking` → Personal entity
- `goodfields`, `business` → GoodFields entity
- `fablab`, `operations` → FabLab entity
- Default: Personal (if ambiguous)

To customize, edit the `discoverAccounts()` method in `scripts/firefly_sync.ts`.

### Step 7: Restart Claude Code

If using Claude Code, restart it to load the new skill:

```bash
# Find Claude Code process
ps aux | grep -i claude

# Kill and restart (or use your system's restart method)
pkill -f claude-code
# Then relaunch Claude Code from your applications menu
```

### Step 8: Configure Automated Sync (Optional)

Set up a cron job to sync transactions automatically:

```bash
# Edit crontab
crontab -e

# Add daily sync at 6 AM
0 6 * * * cd ~/.claude/skills/financial-system/scripts && /usr/local/bin/bun run firefly_sync.ts >> /tmp/firefly-sync.log 2>&1
```

This ensures your financial data is always up-to-date when you ask Bob for insights.

---

## Directory Structure After Installation

```
~/.claude/skills/financial-system/
├── data/                          # Gitignored - financial transaction cache
│   ├── personal/
│   │   ├── 2024-08-transactions.md
│   │   ├── ...
│   │   └── 2025-01-transactions.md
│   ├── goodfields/
│   │   └── 2025-01-transactions.md
│   ├── fablab/
│   │   └── 2025-01-transactions.md
│   └── cross-entity/              # (manually created)
│       └── allocation-rules.md
├── scripts/
│   ├── firefly_sync.ts            # TypeScript sync script
│   ├── package.json               # Bun dependencies
│   └── node_modules/              # (after bun install)
├── templates/
│   ├── asset-registry-template.md
│   ├── monthly-budget-template.md
│   └── subscription-tracking-template.md
├── workflows/
│   ├── daily-transaction-entry.md
│   ├── monthly-budget-review.md
│   ├── quarterly-tax-prep.md
│   └── weekly-reconciliation.md
├── SKILL.md                        # Skill activation logic
├── CLAUDE.md                       # Claude-specific instructions (if any)
├── firefly-quick-reference.md      # Daily operations guide
└── fireflyiii_api_guide.md         # API documentation
```

---

## Troubleshooting

### Issue: "bun: command not found"

**Solution:** Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### Issue: "FIREFLY_III_ACCESS_TOKEN not set"

**Solution:** Create the `.env` file in the data directory:
```bash
cd ~/.claude/skills/financial-system/data/
cat > .env << 'EOF'
FIREFLY_III_ACCESS_TOKEN=your-actual-token-here
FIREFLY_III_URL=http://firefly.apps.kroeker.fun:8080
EOF
```

### Issue: "No accounts found in Firefly"

**Solution:** 
1. Verify your Firefly III instance is running
2. Check that you have at least one **Asset Account** (not Expense/Revenue accounts)
3. Verify API token has correct permissions

### Issue: Account mapped incorrectly (e.g., business account showing as personal)

**Solution:** Edit `scripts/firefly_sync.ts` and update the account name mapping logic in `discoverAccounts()`.

### Issue: Skill doesn't activate in Claude Code

**Solution:**
1. Ensure `SKILL.md` exists in `~/.claude/skills/financial-system/`
2. Restart Claude Code
3. Check `~/.claude/settings.json` has `Skill(*)` in permissions
4. Try explicit activation: "Bob, activate financial system skill"

---

## Next Steps

After successful installation, proceed to [VERIFY.md](VERIFY.md) to complete the verification checklist.

Once verified, try these commands:
- "Bob, what's my budget?"
- "Bob, sync Firefly data"
- "Bob, what's my financial runway?"
- "Bob, show me spending patterns this month"

---

## Uninstallation

To remove this skill:

```bash
# Remove skill directory
rm -rf ~/.claude/skills/financial-system

# Optional: Remove synced data
rm -rf ~/.claude/skills/financial-system/data

# Note: .env file in data/ will be removed with the skill directory
```

**Note:** Removing the skill does NOT delete data in your Firefly III instance—only the local markdown cache.
