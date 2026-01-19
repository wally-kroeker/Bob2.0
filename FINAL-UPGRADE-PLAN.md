# Bob 2.0 → PAI v2.3 Upgrade Plan (FINAL)

**Date:** 2026-01-17
**Current State:** PAI v2.1 + partial v2.3 components (mixed/unstable)
**Target State:** Clean PAI v2.3 installation + selective BobPacks
**Strategy:** Fresh install with selective restoration
**Estimated Time:** 2-3 hours

---

## Why Fresh Install?

**Evidence for fresh install:**
1. ✅ Current state is mixed (v2.1 + partial v2.3 hooks)
2. ✅ Hook customizations are fragile (past upgrade problems)
3. ✅ v2.3 is major (39 commits, continuous learning, rewritten CORE)
4. ✅ Upstream provides tested wizard path
5. ✅ BobPacks are safe in git repo (not in ~/.claude)
6. ✅ Real migration guide confirms this approach works

**Key insights from [Discussion #435](https://github.com/danielmiessler/Personal_AI_Infrastructure/discussions/435):**
- API keys go in `~/.claude/.env` (we have this ✓)
- Linux compatibility: Check for `/Users/` hardcoding (none found ✓)
- SKILLCUSTOMIZATIONS need chain-loading via PREFERENCES.md
- Skip raw-outputs and hook-captured session summaries
- Personal skills use `_ALLCAPS` naming

---

## Pre-Flight Checklist

**System checks:**
- [ ] Bun installed: `bun --version`
- [ ] Git clean: `git status` shows no critical uncommitted work
- [ ] Disk space: At least 2GB free for backups
- [ ] Time available: 2-3 hours uninterrupted

---

## Phase 1: Backup Everything (15 minutes)

### 1.1 Create Timestamped Backups

```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Backup current ~/.claude installation (17MB MEMORY + all config)
tar -czf ~/pai-backup-pre-v23-${TIMESTAMP}.tar.gz ~/.claude/

# Backup Bob2.0 repo state
cd /home/bob/projects/Bob2.0
tar -czf ~/bob2.0-repo-backup-${TIMESTAMP}.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  .

# Verify backups exist
ls -lh ~/pai-backup-pre-v23-${TIMESTAMP}.tar.gz
ls -lh ~/bob2.0-repo-backup-${TIMESTAMP}.tar.gz
```

### 1.2 Extract Critical Data (DO THIS BEFORE WIPING)

```bash
# Create extraction staging area
mkdir -p ~/pai-v23-migration/preserve

# 1. API keys and environment
cp ~/.claude/.env ~/pai-v23-migration/preserve/

# 2. MEMORY system (17MB - all learnings/history)
cp -r ~/.claude/MEMORY ~/pai-v23-migration/preserve/

# 3. Telos data (from bob-telos-skill)
cp -r ~/.claude/skills/Telos/data ~/pai-v23-migration/preserve/telos-journals/

# 4. Any other custom data in USER
cp -r ~/.claude/skills/CORE/USER ~/pai-v23-migration/preserve/USER-old/

# 5. List of currently installed skills (for reference)
ls ~/.claude/skills/ > ~/pai-v23-migration/preserve/skills-before.txt

# Verify extraction
du -sh ~/pai-v23-migration/preserve/
```

**Expected output:** ~20MB of preserved data

---

## Phase 2: Inventory BobPacks (10 minutes)

### 2.1 List All BobPacks

```bash
cd /home/bob/projects/Bob2.0
ls -d BobPacks/bob-*/ > ~/pai-v23-migration/bobpacks-inventory.txt
cat ~/pai-v23-migration/bobpacks-inventory.txt
```

### 2.2 Decision Matrix for Each BobPack

| BobPack | Keep? | Reason | Replacement |
|---------|-------|--------|-------------|
| **bob-bobiverse-agents-skill** | ✅ YES | Unique personas (Bill, Mario, Riker, etc.) | None |
| **bob-google-workspace-skill** | ✅ YES | Gmail, Calendar, Drive integration | None in upstream |
| **bob-openspec-skill** | ✅ YES | Spec-driven development | None in upstream |
| **bob-opnsense-dns-skill** | ✅ YES | FabLab DNS management | None in upstream |
| **bob-scratchpad-skill** | ✅ YES | Universal scratchpad system | None in upstream |
| **bob-task-skill** | ✅ YES | Vikunja task orchestration | None in upstream |
| **bob-telos-skill** | ⚠️ EVALUATE | Goal tracking | `pai-telos-skill` exists in v2.3 |
| **bob-cognitive-loop-skill** | ⚠️ EVALUATE | Daily writing + Substack | Check if still used |
| **bob-external-agents-skill** | ⚠️ EVALUATE | Spawn Codex/Gemini agents | Check if still needed |
| **bob-financial-system-skill** | ⚠️ EVALUATE | Firefly III integration | Check if actively used |
| **bob-pandoc-skill** | ⚠️ EVALUATE | Markdown to PDF | Simple utility, maybe skip |
| **bob-launcher** | ⚠️ MAYBE DELETE | Custom launcher | Replaced by `pai-statusline` in v2.3 |

**Decision needed on bob-telos-skill:**
- **Option A**: Use upstream `pai-telos-skill` + populate CORE/USER/TELOS.md from your journals
- **Option B**: Keep bob-telos-skill + integrate with v2.3
- **Recommendation**: Option A (less redundancy, cleaner architecture)

---

## Phase 3: Merge Upstream Repository (10 minutes)

### 3.1 Merge Upstream v2.3

```bash
cd /home/bob/projects/Bob2.0

# Verify upstream remote
git remote -v | grep upstream

# Fetch latest (already done)
git fetch upstream

# Stash any uncommitted work
git stash

# Merge upstream (39 commits)
git merge upstream/main -m "feat: Merge upstream PAI v2.3

- Fresh install preparation
- 39 commits behind, now synchronized
- See FINAL-UPGRADE-PLAN.md for migration strategy
"

# Expected conflicts: CLAUDE.md, possibly others
# Strategy for conflicts:
#   - CLAUDE.md: Keep Bob sections, accept upstream arch updates
#   - BobPacks/: Keep all (git won't touch these)
#   - UPGRADE docs: Keep Bob versions
```

### 3.2 Resolve Conflicts (If Any)

```bash
# Check for conflicts
git status

# Common conflicts and resolutions:
# - CLAUDE.md: Keep "Fork Documentation" and "BobPacks Directory", accept upstream updates
# - README.md: Accept upstream (we have CLAUDE.md for customizations)
# - Other Bob-specific files: Keep ours

# After resolving
git add .
git merge --continue

# Verify merge
git log --oneline -3
```

### 3.3 Push to Origin

```bash
git push origin main
```

---

## Phase 4: Fresh Install PAI v2.3 (30 minutes)

### 4.1 Remove Old Installation

```bash
# ONLY after backups confirmed!
rm -rf ~/.claude

# Verify it's gone
ls ~/.claude 2>&1 | grep "No such file"
```

### 4.2 Run Fresh Install Wizard

```bash
cd /home/bob/projects/Bob2.0/Bundles/Official
bun run install.ts
```

**Wizard Prompts - Answer:**
- **Assistant Name:** `Bob`
- **Your Name:** `Wally Kroeker`
- **Timezone:** `America/Winnipeg` (or your timezone)
- **Voice Preference:** `Yes` (if using ElevenLabs)

**Wizard will:**
- Create `~/.claude/` directory structure
- Install base configuration
- Set environment variables in `~/.zshrc`
- Configure `settings.json`

### 4.3 Verify Base Installation

```bash
# Check directory structure
ls -la ~/.claude/

# Expected:
# hooks/       - Base hooks directory (empty until packs installed)
# skills/      - CORE skill directory
# MEMORY/      - Memory system directories
# .env.example - Template (we'll replace with our backup)

# Check settings.json
cat ~/.claude/settings.json | head -20
```

---

## Phase 5: Install Core PAI Packs (40 minutes)

**Installation order matters!** Dependencies must be installed first.

### 5.1 Install pai-hook-system

```bash
# In Claude Code, give the AI:
"Install the pai-hook-system pack from /home/bob/projects/Bob2.0/Packs/pai-hook-system/"
```

**Verify:**
```bash
ls ~/.claude/hooks/*.ts | wc -l  # Should have multiple hooks
cat ~/.claude/settings.json | grep -A 5 "hooks"  # Should show hook registrations
```

### 5.2 Install pai-core-install

```bash
# In Claude Code:
"Install the pai-core-install pack from /home/bob/projects/Bob2.0/Packs/pai-core-install/"
```

**Verify:**
```bash
ls ~/.claude/skills/CORE/SKILL.md
wc -l ~/.claude/skills/CORE/SKILL.md  # Should be ~482 lines (v2.3)
ls ~/.claude/skills/CORE/SYSTEM/  # Should have MEMORY, architecture docs
```

### 5.3 Install pai-voice-system (if using)

```bash
# In Claude Code:
"Install the pai-voice-system pack from /home/bob/projects/Bob2.0/Packs/pai-voice-system/"
```

**Note:** Requires ElevenLabs API key in .env

### 5.4 Install Optional Upstream Packs

**Recommended:**
```bash
# In Claude Code (install each one-by-one):
"Install pai-prompting-skill from /home/bob/projects/Bob2.0/Packs/pai-prompting-skill/"
"Install pai-agents-skill from /home/bob/projects/Bob2.0/Packs/pai-agents-skill/"
"Install pai-statusline from /home/bob/projects/Bob2.0/Packs/pai-statusline/"
```

**Consider (evaluate need):**
- pai-art-skill - Visual content generation
- pai-browser-skill - Browser automation
- pai-upgrades-skill - Track system upgrades
- pai-observability-server - Real-time monitoring dashboard

---

## Phase 6: Restore Preserved Data (20 minutes)

### 6.1 Restore API Keys

```bash
# Replace example .env with our real one
cp ~/pai-v23-migration/preserve/.env ~/.claude/.env

# Verify keys are present
grep "API_KEY\|TOKEN" ~/.claude/.env | wc -l
```

### 6.2 Restore MEMORY System

```bash
# Restore full MEMORY directory
# v2.3 uses same structure, so this should be safe
cp -r ~/pai-v23-migration/preserve/MEMORY/* ~/.claude/MEMORY/

# Verify restoration
du -sh ~/.claude/MEMORY/  # Should be ~17MB
```

### 6.3 Populate CORE/USER Files

**Option A: Manual population from Telos journals**

```bash
# We have the journals preserved:
ls ~/pai-v23-migration/preserve/telos-journals/

# Extract key data into v2.3 CORE/USER structure:
# - TELOS.md: Extract G1-G3 goals from goodfields.md, fablab.md, personal.md
# - ABOUTME.md: Extract background from personal.md History section
# - CONTACTS.md: Extract from goodfields.md Active Leads table
```

**Option B: Use existing populated files (if they have data)**

```bash
# Check if old USER files have content
cat ~/pai-v23-migration/preserve/USER-old/TELOS.md

# If populated, copy selectively
cp ~/pai-v23-migration/preserve/USER-old/CONTACTS.md ~/.claude/skills/CORE/USER/
# etc.
```

**Recommendation:** Extract fresh from Telos journals to ensure alignment with current reality.

---

## Phase 7: Install BobPacks (30 minutes)

### 7.1 Install Core BobPacks

**Definitely install:**

```bash
# In Claude Code (one by one):
"Install bob-bobiverse-agents-skill from /home/bob/projects/Bob2.0/BobPacks/bob-bobiverse-agents-skill/"
"Install bob-google-workspace-skill from /home/bob/projects/Bob2.0/BobPacks/bob-google-workspace-skill/"
"Install bob-task-skill from /home/bob/projects/Bob2.0/BobPacks/bob-task-skill/"
"Install bob-scratchpad-skill from /home/bob/projects/Bob2.0/BobPacks/bob-scratchpad-skill/"
```

### 7.2 Evaluate Optional BobPacks

**Test individually:**

```bash
# Install one at a time and verify it works before moving to next
"Install bob-openspec-skill from /home/bob/projects/Bob2.0/BobPacks/bob-openspec-skill/"
# Test: "Use the Openspec skill to..."

"Install bob-opnsense-dns-skill from /home/bob/projects/Bob2.0/BobPacks/bob-opnsense-dns-skill/"
# Test: "List DNS records using OpnsenseDns skill"
```

### 7.3 Handle bob-telos-skill Decision

**If using upstream pai-telos-skill:**
- Install upstream: `"Install pai-telos-skill from Packs/pai-telos-skill/"`
- Populate CORE/USER/TELOS.md with your data
- Keep journals in a separate archive location

**If keeping bob-telos-skill:**
- Install: `"Install bob-telos-skill from BobPacks/bob-telos-skill/"`
- Restore journals: `cp -r ~/pai-v23-migration/preserve/telos-journals/* ~/.claude/skills/Telos/data/`

**My recommendation:** Use upstream pai-telos-skill + populated CORE/USER/TELOS.md for cleaner v2.3 integration.

---

## Phase 8: Configuration & Customization (20 minutes)

### 8.1 Update DAIDENTITY.md

The wizard creates a generic DAIDENTITY.md. Update it with Bob's personality:

```bash
# Edit ~/.claude/skills/CORE/USER/DAIDENTITY.md
# Add:
# - Name: Bob Prime
# - Color: #10B981
# - Origin: Bobiverse Bob-1
# - Personality traits from CLAUDE.md
# - Voice ID (if using ElevenLabs)
```

### 8.2 Configure StatusLine (if installed)

```bash
# Test statusline
bash ~/.claude/statusline-command.sh

# Should show: Bob Prime + session info
```

### 8.3 Set Up Chain-Loading for SKILLCUSTOMIZATIONS

If you have custom workflows/configs for skills, use the chain-loading pattern from Discussion #435:

```bash
# In ~/.claude/skills/CORE/USER/SKILLCUSTOMIZATIONS/{SkillName}/PREFERENCES.md
# Add:
## Additional Customizations

**Also load these files from this directory:**
- `CustomWorkflow.md` - Description
- `Workflows/` - Custom workflows

## Custom Workflow Routing
- Trigger phrase → `Workflows/MyWorkflow.md`
```

---

## Phase 9: Verification & Testing (20 minutes)

### 9.1 Basic System Checks

```bash
# 1. Check hook execution
bun run ~/.claude/hooks/initialize-session.ts
# Should run without errors

# 2. Check CORE skill loads
bun run ~/.claude/hooks/load-core-context.ts
# Should output CORE skill content

# 3. Check MEMORY structure
ls ~/.claude/MEMORY/
# Should show: LEARNING, RESEARCH, WORK, SIGNALS directories

# 4. Verify continuous learning hook
ls ~/.claude/hooks/capture-all-events.ts
# Should exist
```

### 9.2 Start Claude Code and Test

```bash
# Restart Claude Code
claude
```

**Test checklist:**

```markdown
## PAI v2.3 Fresh Install Verification

### Core Functionality
- [ ] SessionStart hooks fire (check terminal output)
- [ ] CORE skill auto-loads (Bob identity present)
- [ ] Response format includes 🗣️ voice line
- [ ] Security validator blocks dangerous commands (test: `rm -rf /tmp/test`)
- [ ] Voice notifications work (if installed)

### Skills
- [ ] List available skills: "What skills do I have?"
- [ ] Test Bobiverse agents: "Spawn Bill to analyze this plan"
- [ ] Test Google Workspace (if installed): "Check my email"
- [ ] Test Task skill (if installed): "Show my active tasks"

### MEMORY System
- [ ] Session capture: ls ~/.claude/MEMORY/SESSIONS/ (should have new session)
- [ ] Learnings preserved: ls ~/.claude/MEMORY/LEARNING/
- [ ] Signals tracking: ls ~/.claude/MEMORY/SIGNALS/

### BobPacks
- [ ] Each installed BobPack loads correctly
- [ ] No errors in skill loading
- [ ] Custom workflows accessible
```

### 9.3 Performance Check

```bash
# Check for Linux path issues (from Discussion #435)
grep -rn "/Users/" ~/.claude/skills/*/Tools/*.ts
# Should return nothing (or you'll need to fix these)

# Check settings.json is valid
cat ~/.claude/settings.json | jq . > /dev/null
echo $?  # Should be 0 (valid JSON)

# Check hook registrations
cat ~/.claude/settings.json | jq '.hooks | keys'
# Should show: PreToolUse, PostToolUse, SessionStart, Stop, etc.
```

---

## Phase 10: Post-Migration Cleanup (10 minutes)

### 10.1 Document Changes

```bash
cd /home/bob/projects/Bob2.0

# Create migration completion record
cat > MIGRATION-COMPLETE-v2.3.md <<'EOF'
# PAI v2.3 Migration - Completed

**Date:** $(date)
**Strategy:** Fresh install with selective restoration

## What Was Done
- Full backup of v2.1+partial installation
- Fresh install of PAI v2.3 via wizard
- Restored MEMORY (17MB learnings/history)
- Restored API keys from .env
- Installed core packs: hook-system, core-install, voice-system
- Installed BobPacks: [list installed packs]

## What Changed
- CORE/SKILL.md: 96 lines → 482 lines (v2.3 rewrite)
- Hook system: Clean v2.3 implementation
- MEMORY system: Full v2.3 structure
- Continuous learning: capture-all-events.ts active

## BobPacks Status
- Installed: [list]
- Evaluated and skipped: [list]
- Replaced by upstream: [list]

## Verification
- [x] All hooks execute successfully
- [x] CORE skill loads with Bob identity
- [x] MEMORY preserved
- [x] BobPacks functional
- [x] No regressions detected

## Next Steps
1. Monitor system for 1 week
2. Evaluate remaining optional packs
3. Populate CORE/USER files from Telos journals
4. Test continuous learning capture
EOF

# Commit the completion record
git add MIGRATION-COMPLETE-v2.3.md
git commit -m "docs: Complete PAI v2.3 migration"
git push origin main
```

### 10.2 Archive Backups

```bash
# Move migration staging to archive
mkdir -p ~/Archives/pai-migrations/
mv ~/pai-v23-migration ~/Archives/pai-migrations/v23-migration-$(date +%Y%m%d)/
mv ~/pai-backup-pre-v23-*.tar.gz ~/Archives/pai-migrations/
mv ~/bob2.0-repo-backup-*.tar.gz ~/Archives/pai-migrations/

# Keep backups for 30 days, then delete
# (Set a reminder)
```

---

## Rollback Plan (If Needed)

If something goes catastrophically wrong:

```bash
# 1. Stop and assess
# Don't panic, backups exist

# 2. Remove broken installation
rm -rf ~/.claude

# 3. Restore from backup
BACKUP_FILE=$(ls -t ~/Archives/pai-migrations/pai-backup-pre-v23-*.tar.gz | head -1)
tar -xzf $BACKUP_FILE -C ~/

# 4. Verify restoration
ls ~/.claude/
claude  # Test

# 5. Debug what went wrong before trying again
```

---

## Success Criteria

**Migration is complete when:**
- ✅ Claude Code starts without errors
- ✅ All hooks execute successfully
- ✅ CORE skill shows v2.3 architecture (482-line SKILL.md)
- ✅ Bob's identity intact (name, color, personality)
- ✅ MEMORY system preserved (17MB data accessible)
- ✅ Core BobPacks functional
- ✅ Continuous learning capturing sessions
- ✅ No regressions in daily workflows
- ✅ Voice notifications work (if installed)

**You should have:**
- Clean PAI v2.3 foundation
- All valuable data preserved
- BobPacks integrated with v2.3
- Tested, verified, documented system

---

## Key Lessons from Discussion #435

1. **API keys in .env** - Not in settings.json (we have this ✓)
2. **Linux paths** - Check for `/Users/` hardcoding (none found ✓)
3. **SKILLCUSTOMIZATIONS** - Use chain-loading from PREFERENCES.md
4. **Personal skills** - Use `_ALLCAPS` naming if keeping private
5. **What to skip** - raw-outputs/, hook-captured summaries, node_modules/
6. **SessionHarvester** - Run after migration to extract learnings from old sessions

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Backup & preserve data | 15 min |
| 2 | Inventory BobPacks | 10 min |
| 3 | Merge upstream repo | 10 min |
| 4 | Fresh install wizard | 30 min |
| 5 | Install core PAI packs | 40 min |
| 6 | Restore preserved data | 20 min |
| 7 | Install BobPacks | 30 min |
| 8 | Configuration & customization | 20 min |
| 9 | Verification & testing | 20 min |
| 10 | Post-migration cleanup | 10 min |
| **Total** | | **~3 hours** |

**Best Practice:** Do this in 2 sessions:
- **Session 1 (90 min):** Phases 1-5 (backup through core pack installation)
- **Session 2 (90 min):** Phases 6-10 (restoration through cleanup)

---

## Emergency Contacts

**If you get stuck:**
- PAI GitHub Discussions: https://github.com/danielmiessler/Personal_AI_Infrastructure/discussions
- Discussion #435: https://github.com/danielmiessler/Personal_AI_Infrastructure/discussions/435
- This plan: /home/bob/projects/Bob2.0/FINAL-UPGRADE-PLAN.md

**Before starting, verify:**
- ✅ Backups completed
- ✅ 2-3 hours available
- ✅ No critical work depending on current PAI installation
- ✅ Calm, focused mindset (don't rush this)

---

**Ready? Let's build Bob 2.0 on a solid PAI v2.3 foundation.**

---

*Document created: 2026-01-17*
*Based on: Bill's UPGRADE-PLAN-v2.3.md, Official Bundle README, Discussion #435*
*Strategy: Fresh install wins - proven, tested, clean*
