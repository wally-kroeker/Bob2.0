# Verification Checklist

Complete this checklist after installing the **Bob Financial System Skill** to ensure everything works correctly.

---

## ✅ Installation Verification

### Files & Directories

- [ ] **All directories from INSTALL.md created**
  - [ ] `~/.claude/skills/financial-system/` exists
  - [ ] `~/.claude/skills/financial-system/data/personal/` exists
  - [ ] `~/.claude/skills/financial-system/data/goodfields/` exists
  - [ ] `~/.claude/skills/financial-system/data/fablab/` exists
  - [ ] `~/.claude/skills/financial-system/scripts/` exists

- [ ] **All files from `src/` copied to target locations**
  - [ ] `SKILL.md` present and readable
  - [ ] `firefly-quick-reference.md` present
  - [ ] `fireflyiii_api_guide.md` present
  - [ ] `scripts/firefly_sync.ts` present
  - [ ] `scripts/package.json` present
  - [ ] `templates/` directory with 3 templates
  - [ ] `workflows/` directory with 4 workflows

- [ ] **Each code file contains COMPLETE implementation**
  - [ ] `firefly_sync.ts` is ~500+ lines (not simplified)
  - [ ] TypeScript file has proper types and error handling
  - [ ] No placeholder comments like "// TODO" or "// Add logic here"

- [ ] **Dependencies installed**
  ```bash
  cd ~/.claude/skills/financial-system/scripts/
  ls node_modules/@types/bun  # Should exist
  ```

### Environment Variables

- [ ] **Firefly III credentials configured**
  ```bash
  echo $FIREFLY_III_ACCESS_TOKEN  # Should output your token (not empty)
  echo $FIREFLY_III_URL           # Should output your Firefly URL or be empty (uses default)
  ```

- [ ] **No Python artifacts remain**
  - [ ] `requirements.txt` removed (Python is NOT used)
  - [ ] `firefly_sync.py` removed (replaced with TypeScript)
  - [ ] No `.pyc` files or `__pycache__` directories

---

## ✅ Firefly III Connection Verification

### API Connectivity

Run the sync script to verify connection:

```bash
cd ~/.claude/skills/financial-system/scripts/
bun run firefly_sync.ts
```

- [ ] **Script discovers accounts successfully**
  - Output shows: "Discovered N accounts:"
  - Each account listed with entity mapping (personal/goodfields/fablab)

- [ ] **Script fetches transactions successfully**
  - Output shows: "Fetching [entity] ([account])... ✓ (N transactions)"
  - No connection errors or timeouts

- [ ] **Markdown files generated**
  ```bash
  ls -la ~/.claude/skills/financial-system/data/personal/
  # Should show: 2025-01-transactions.md (or current month)
  ```

- [ ] **Markdown files contain actual data**
  ```bash
  head -20 ~/.claude/skills/financial-system/data/personal/2025-01-transactions.md
  # Should show summary with balance, transactions, categories
  ```

### Account Mapping Accuracy

- [ ] **Accounts mapped to correct entities**
  - Personal accounts → `personal/` directory
  - GoodFields accounts → `goodfields/` directory
  - FabLab accounts → `fablab/` directory
  - No accounts incorrectly categorized

**If accounts are mapped incorrectly:**
1. Edit `scripts/firefly_sync.ts`
2. Update `discoverAccounts()` method with your account names
3. Re-run sync

---

## ✅ Skill Activation Verification

### Claude Code Integration

- [ ] **Skill loads in Claude Code**
  - Claude Code restarted after installation
  - No errors in console related to `financial-system`

- [ ] **Skill activates on trigger phrases**
  - Try: "Bob, what's my budget?"
  - Expected: Bob mentions loading financial data or activating financial-system skill
  - Try: "Bob, sync Firefly data"
  - Expected: Bob runs sync script or asks for confirmation

- [ ] **Skill has access to markdown data**
  - Try: "Bob, show me my spending this month"
  - Expected: Bob reads from `data/personal/2025-01-transactions.md` and provides analysis
  - Bob should NOT say "I don't have access to financial data"

### Natural Language Queries

Test these queries and verify Bob responds with financial insights:

- [ ] **Budget queries work**
  - "What's my budget variance?"
  - "Am I over budget this month?"

- [ ] **Spending analysis works**
  - "What did I spend on groceries?"
  - "Show my spending patterns"
  - "What were my biggest expenses?"

- [ ] **Runway queries work**
  - "What's my financial runway?"
  - "How many months of expenses do I have saved?"
  - "What's my burn rate?"

- [ ] **Multi-entity queries work**
  - "Show GoodFields profit/loss"
  - "What's my personal vs. business spending split?"
  - "Can GoodFields fund [purchase]?"

- [ ] **Firefly operations work**
  - "Show Firefly quick reference"
  - "How do I enter a transaction in Firefly?"
  - "Sync Firefly data" → Bob runs `bun run firefly_sync.ts`

---

## ✅ Data Privacy Verification

### Gitignore Protection

- [ ] **Financial data is gitignored**
  ```bash
  cd ~/.claude/skills/financial-system/
  cat .gitignore  # Should contain "data/"
  
  git status  # If in a git repo, data/ should NOT appear in untracked files
  ```

- [ ] **No API tokens in code files**
  ```bash
  grep -r "FIREFLY_III_ACCESS_TOKEN" ~/.claude/skills/financial-system/
  # Should only find references in INSTALL.md, README.md (documentation)
  # Should NOT find actual token values
  ```

- [ ] **Environment variables used correctly**
  - API token read from `process.env.FIREFLY_III_ACCESS_TOKEN`
  - Not hardcoded in any `.ts`, `.md`, or `.json` files

---

## ✅ Script Functionality Verification

### Sync Script Commands

Test all script commands work:

- [ ] **Current month sync**
  ```bash
  cd ~/.claude/skills/financial-system/scripts/
  bun run firefly_sync.ts
  # Should sync current month without errors
  ```

- [ ] **Specific month sync**
  ```bash
  bun run firefly_sync.ts --month 2024-12
  # Should sync December 2024
  ```

- [ ] **Historical sync**
  ```bash
  bun run firefly_sync.ts --all --months-back 3
  # Should sync last 3 months
  ```

- [ ] **Help command**
  ```bash
  bun run firefly_sync.ts --help
  # Should display usage instructions
  ```

### Script Output Quality

- [ ] **Markdown is well-formatted**
  - Open a generated markdown file in an editor
  - Tables render correctly
  - Categories sorted by spending amount
  - Transactions sorted by date (newest first)

- [ ] **Numbers are accurate**
  - Compare a few transactions in markdown with Firefly III web interface
  - Verify balances match
  - Verify totals are correct (income, expenses, net)

---

## ✅ Workflow Integration Verification

### Workflow Documents

- [ ] **Workflow files are present and readable**
  ```bash
  ls ~/.claude/skills/financial-system/workflows/
  # Should show: daily-transaction-entry.md, monthly-budget-review.md, etc.
  ```

- [ ] **Templates are present**
  ```bash
  ls ~/.claude/skills/financial-system/templates/
  # Should show: asset-registry-template.md, monthly-budget-template.md, etc.
  ```

- [ ] **Bob can reference workflows**
  - Try: "Bob, show me the monthly budget review workflow"
  - Expected: Bob reads and displays the workflow steps

---

## ✅ Performance & Reliability

### Sync Performance

- [ ] **Sync completes in reasonable time**
  - Current month sync: < 10 seconds
  - 6-month historical sync: < 60 seconds
  - No timeouts or hanging

- [ ] **Error handling works**
  - Try syncing with invalid API token → Should show clear error message
  - Try syncing with wrong API URL → Should show connection error
  - Script should NOT crash or leave partial data

### Data Consistency

- [ ] **Re-running sync doesn't create duplicates**
  - Run sync twice for same month
  - Markdown file should be overwritten (not appended)
  - File size should be similar between runs

---

## ❌ Common Issues & Fixes

### Issue: "bun: command not found"

**Fix:**
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### Issue: "FIREFLY_III_ACCESS_TOKEN not set"

**Fix:**
```bash
echo 'export FIREFLY_III_ACCESS_TOKEN="your-token"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: Bob says "I don't have access to financial data"

**Fix:**
1. Verify markdown files exist in `data/` directories
2. Ensure Bob has read permissions: `chmod -R 644 ~/.claude/skills/financial-system/data/`
3. Restart Claude Code
4. Try explicit: "Bob, read my financial data from ~/.claude/skills/financial-system/data/"

### Issue: Accounts mapped to wrong entity

**Fix:**
1. Edit `scripts/firefly_sync.ts`
2. Find `discoverAccounts()` method
3. Update account name matching logic
4. Re-run: `bun run firefly_sync.ts --all`

### Issue: Sync fails with "API error 401"

**Fix:**
1. Verify token in Firefly III is still valid
2. Regenerate token if expired
3. Update environment variable
4. Restart shell

---

## 🎉 Installation Complete

**If ALL checkboxes above are checked, your installation is VERIFIED and COMPLETE!**

### Next Steps

1. **Set up automated sync** (optional):
   ```bash
   crontab -e
   # Add: 0 6 * * * cd ~/.claude/skills/financial-system/scripts && bun run firefly_sync.ts
   ```

2. **Try financial queries with Bob**:
   - "Bob, what's my budget this month?"
   - "Bob, what's my financial runway?"
   - "Bob, what did I spend on dining out?"

3. **Review workflows**:
   - Read `workflows/monthly-budget-review.md`
   - Set up monthly budget review reminder in TaskMan/Vikunja

4. **Explore templates**:
   - Copy `templates/monthly-budget-template.md` to start budgeting
   - Use `templates/subscription-tracking-template.md` for optimization

5. **Integrate with other skills**:
   - Connect to **Telos Skill** for revenue pipeline tracking
   - Link to **TaskMan Skill** for budget review tasks

---

## Uninstallation

If you need to remove this skill:

```bash
# Remove skill directory
rm -rf ~/.claude/skills/financial-system

# Remove environment variables
# (Edit ~/.bashrc and remove FIREFLY_III_* exports)

# Optional: Remove from Firefly III
# Go to Settings → Profile → Personal Access Tokens → Revoke token
```

---

*If ANY verification step fails, DO NOT consider the installation complete. Review [INSTALL.md](INSTALL.md) and troubleshooting steps above.*
