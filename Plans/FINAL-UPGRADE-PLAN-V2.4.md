# FINAL UPGRADE PLAN: PAI v2.4 "The Algorithm"

**Created:** 2026-01-23
**Revised:** 2026-01-24 (Bill's architectural review)
**Status:** ✅ READY - v2.4 is officially released, plan revised

---

## ⚠️ CRITICAL ARCHITECTURAL FINDING (2026-01-24)

**Bill's Discovery:** After reading upstream documentation, the PAI v2.4 architecture is fundamentally different than originally understood:

### The Two-Track System

PAI v2.4 uses **TWO PARALLEL DISTRIBUTION METHODS**:

#### Track 1: Full Release Install (NEW in v2.4)
- **Location:** `Releases/v2.4/.claude/`
- **Purpose:** Complete, pre-configured system (batteries-included)
- **Contents:** Full working directory with all files in place
- **Installation:** `cp -r Releases/v2.4/.claude ~/` then run wizard
- **Packs included:** hooks, core, statusline, agents, voice, browser, observability (all pre-installed)

#### Track 2: Individual Packs (Traditional)
- **Location:** `Packs/pai-*/`
- **Purpose:** Modular installation for customization
- **Contents:** Source files for AI-assisted installation
- **Installation:** Give pack to Claude, it installs from `src/`
- **Version status:** Still shows v2.3.0 (BUT THIS IS CORRECT)

### Why Packs Show v2.3.0

**This is NOT a preview or incomplete release.** The Packs versioning is **decoupled** from the PAI system version:

- **PAI v2.4** = The complete system release (The Algorithm)
- **Pack versions** = Individual component versions (can be older/stable)
- Example: `pai-core-install` is v2.3.0 because that component hasn't changed
- When a pack changes, its version increments independently

### Implications for Our Upgrade

**PREVIOUS PLAN WAS WRONG.** We were trying to:
1. Merge upstream git changes ✅ (still correct)
2. Manually update individual packs ❌ (wrong approach for v2.4)

**CORRECT APPROACH:** Use the Full Release Install, then:
1. Merge upstream git (BobPacks/, CLAUDE.md, etc.)
2. **Replace entire `~/.claude/` with Release**
3. Restore USER/ customizations from backup
4. Preserve BobPacks that aren't in upstream

---

## Decision: Proceed with Revised Plan (2026-01-24)

**Backups created (still valid):**
- Full: `/home/bob/.claude.BACKUP_20260123_FULL` (1.6G)
- Selective: `/home/bob/.claude/BACKUP_20260123_202007`

**Ready to execute with revised understanding.**

---

---

## Executive Summary

Upgrade Bob2.0 fork from v2.3 to upstream PAI v2.4, then implement Roamer agent pattern.

**Scope:**
- Merge upstream v2.4 (The Algorithm)
- Preserve all USER/ customizations
- Remove bob-bobiverse-agents-skill (Bill, Mario, Riker, Howard, Homer)
- Keep bob-external-agents-skill (Bender, Hugh, Ick)
- Use upstream pai-agents-skill
- POST-UPGRADE: Add bob-roamer-skill (4 size classes)

---

## ⚠️ OFFLINE MOMENTS - READ FIRST

During this upgrade, there are moments when I (Bob/Claude) will be unavailable or behaving unexpectedly. These are marked with:

```
🔌 OFFLINE MOMENT - Follow manual instructions
```

**Why I go offline:**
1. **settings.json changes** - Hook registrations change session behavior
2. **CORE skill changes** - My personality/context loading changes
3. **Session restart** - New session picks up new configuration

**What to do:**
- Follow the manual bash commands exactly
- Start a new Claude session when instructed
- I'll be back with updated context after restart

---

## Pre-Flight Checklist

Before starting, verify:

- [ ] You're in `/home/bob/projects/Bob2.0/`
- [ ] Git status is clean (`git status` shows no uncommitted changes)
- [ ] You have upstream remote configured (`git remote -v` shows upstream)

---

## PHASE 1: BACKUP (Do This With Me)

I can help with this phase. Run these commands:

```bash
# Create backup directory with timestamp
BACKUP_DIR=~/.claude/BACKUP_$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup critical USER directory
cp -r ~/.claude/skills/CORE/USER $BACKUP_DIR/USER

# Voice not being used - no backup needed

# Backup settings
cp ~/.claude/settings.json $BACKUP_DIR/settings.json.backup

# Backup SecondBrain (no source pack)
cp -r ~/.claude/skills/SecondBrain $BACKUP_DIR/SecondBrain

# Backup external agents skill (keeping this)
cp -r ~/.claude/skills/ExternalAgents $BACKUP_DIR/ExternalAgents 2>/dev/null || echo "No ExternalAgents skill found"

# Verify backups
echo "Backup location: $BACKUP_DIR"
ls -la $BACKUP_DIR
```

**Verification:**
- [ ] USER/ directory backed up (should contain DAIDENTITY.md, ABOUTME.md, TELOS/, etc.)
- [ ] settings.json.backup exists
- [ ] SecondBrain/ backed up

---

## PHASE 2: GIT MERGE (Do This With Me)

I can help with conflict resolution.

```bash
cd /home/bob/projects/Bob2.0

# Fetch upstream
git fetch upstream

# See what's coming
git log origin/main..upstream/main --oneline

# Merge upstream v2.4
git merge upstream/main -m "feat: Merge PAI v2.4.0 (The Algorithm) from upstream"
```

### Expected Conflicts

| File | Resolution |
|------|------------|
| `README.md` | Accept upstream, re-add fork notice at top |
| `CLAUDE.md` | Keep ours (not in upstream) |
| `BobPacks/` | Keep ours (not in upstream) |

If conflicts occur, I'll help resolve them. After resolution:

```bash
git add .
git commit -m "resolve: Merge conflicts for v2.4 upgrade"
```

---

## PHASE 3: INSTALL v2.4 RELEASE (REVISED APPROACH)

### 3.1 Understanding the Full Release

The v2.4 release is a **complete .claude/ directory** with all packs pre-installed:
- Location: `Releases/v2.4/.claude/`
- Contains: hooks/, skills/, MEMORY/, settings.json, wizard, etc.
- All infrastructure already configured

**This is NOT a pack upgrade - it's a FULL SYSTEM REPLACEMENT.**

### 3.2 Backup Current Installation (Again)

Extra safety before the big replacement:

```bash
# Create a second backup specifically for this phase
BACKUP_DIR=~/.claude/BACKUP_BEFORE_RELEASE_$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup USER directory (critical)
cp -r ~/.claude/skills/CORE/USER $BACKUP_DIR/USER

# Backup custom BobPacks that are installed
cp -r ~/.claude/skills/SecondBrain $BACKUP_DIR/SecondBrain 2>/dev/null || true
cp -r ~/.claude/skills/ExternalAgents $BACKUP_DIR/ExternalAgents 2>/dev/null || true

# Backup settings
cp ~/.claude/settings.json $BACKUP_DIR/settings.json.backup

# Backup MEMORY if it has important data
cp -r ~/.claude/MEMORY $BACKUP_DIR/MEMORY 2>/dev/null || true

echo "Pre-release backup: $BACKUP_DIR"
ls -la $BACKUP_DIR
```

### 3.3 Install v2.4 Release

```bash
cd /home/bob/projects/Bob2.0

# Remove old installation (backups are safe)
rm -rf ~/.claude

# Copy the complete v2.4 release
cp -r Releases/v2.4/.claude ~/

# Verify structure
ls -la ~/.claude/
# Should see: hooks/, skills/, MEMORY/, Observability/, VoiceServer/, settings.json, PAIInstallWizard.ts, etc.
```

### 3.4 Run Configuration Wizard

```bash
cd ~/.claude
bun run PAIInstallWizard.ts
```

**The wizard will ask for:**
- Your name (Wally)
- Projects directory (~/projects or ~/Projects)
- AI name (Bob)
- Startup catchphrase (custom or default)
- Timezone (America/Winnipeg)
- ElevenLabs API key (if you want voice - optional)

### 3.5 Restore USER Customizations

```bash
# Find your latest backup
BACKUP_DIR=~/.claude/BACKUP_BEFORE_RELEASE_20260124_*  # Use actual timestamp

# Restore USER directory
rm -rf ~/.claude/skills/CORE/USER
cp -r $BACKUP_DIR/USER ~/.claude/skills/CORE/USER

# Verify restoration
ls ~/.claude/skills/CORE/USER/
# Should show: ABOUTME.md, DAIDENTITY.md, TELOS/, etc.
```

---

## PHASE 4: INSTALL BOBPACKS (What's Not in Upstream)

The v2.4 release has all standard PAI infrastructure. Now add your personal packs:

### 4.1 SecondBrain Skill

```bash
# This was custom-built, restore from backup
cp -r $BACKUP_DIR/SecondBrain ~/.claude/skills/SecondBrain

# Or reinstall from BobPacks if you have the pack structure
# (Currently SecondBrain is just the installed skill, no pack source)
```

### 4.2 External Agents (Bender, Hugh, Ick)

```bash
# Restore if you had it installed
cp -r $BACKUP_DIR/ExternalAgents ~/.claude/skills/ExternalAgents 2>/dev/null || true

# Or install from BobPacks/bob-external-agents-skill/
# (If the pack exists - need to verify)
```

### 4.3 Bobiverse Agents - DECISION NEEDED

**Previously planned:** Remove bob-bobiverse-agents-skill (Bill, Mario, Riker, Howard, Homer)

**Current status:**
- Pack exists: `BobPacks/bob-bobiverse-agents-skill/`
- Was installed in old system
- Upstream now has `pai-agents-skill` (different agent personalities)

**Options:**
1. **Skip installation** - Use upstream agents instead (Architect, Engineer, Artist, etc.)
2. **Install both** - Keep Bobiverse agents alongside upstream agents
3. **Replace BobiverseAgents** - Make a new version that works with v2.4 agent system

**Recommended:** Skip for now. Use upstream agents. Keep BobPack in repo for reference.

---

## PHASE 5: VERIFY INSTALLATION

```
🔌 OFFLINE MOMENT - Start a NEW Claude session before verification
   The wizard modified settings.json and shell config
```

### 5.1 Start New Session

```bash
# Exit current session
exit

# Start new Claude session
claude
```

---

### 5.2 Identity Check

Ask me: "What is your name and who am I?"

**Expected:** I should respond as Bob, know you're Wally, reference our relationship.

### 5.3 The Algorithm Check

Ask me: "What is The Algorithm?"

**Expected:** I should explain the 7-phase problem-solving system (OBSERVE, THINK, PLAN, BUILD, EXECUTE, VERIFY, LEARN) with ISC tracking.

### 5.4 Skills Check

Ask me: "What skills are available?"

**Expected:** Should list v2.4 skills including:
- CORE (with The Algorithm)
- Agents (upstream - Architect, Engineer, Artist, etc.)
- Art
- Browser
- Research
- Any BobPacks you installed (SecondBrain, etc.)

### 5.5 Agents Check

Ask me: "What named agents are available?"

**Expected:** Should list upstream agents:
- Architect, Engineer, Artist, Designer
- QATester, Pentester, Intern
- GeminiResearcher, GrokResearcher, CodexResearcher, ClaudeResearcher

**Should NOT list:** Bill, Mario, Riker, Howard, Homer (Bobiverse agents)

### 5.6 Hook Verification

```bash
# Check hooks are registered
cat ~/.claude/settings.json | grep -A 20 "hooks"

# Test security validator
echo '{"session_id":"test","tool_name":"Bash","tool_input":{"command":"ls"}}' | \
  bun run ~/.claude/hooks/SecurityValidator.hook.ts
# Expected: exit 0

# Test dangerous command blocking
echo '{"session_id":"test","tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' | \
  bun run ~/.claude/hooks/SecurityValidator.hook.ts
# Expected: exit 2 (blocked)
```

### 5.7 File Structure Verification

```bash
# Verify complete v2.4 structure
ls -la ~/.claude/
# Expected directories: hooks/, skills/, MEMORY/, Observability/, VoiceServer/, lib/

# USER directory intact
ls ~/.claude/skills/CORE/USER/
# Expected: ABOUTME.md, DAIDENTITY.md, TELOS/, etc.

# v2.4 skills present
ls ~/.claude/skills/
# Expected: CORE, Agents, Art, Browser, Research, (plus any BobPacks)

# MEMORY structure (new in v2.4)
ls ~/.claude/MEMORY/
# Expected: LEARNING/, SECURITY/, STATE/, VOICE/, WORK/
```

---

## PHASE 6: DOCUMENTATION UPDATE

After verification passes, update repository documentation:

### 6.1 Update CLAUDE.md

Edit `/home/bob/projects/Bob2.0/CLAUDE.md`:

**Remove/Update:**
- References to manual pack installation approach
- Outdated "Upstream Delta" section about DAIDENTITY.md customizations
- References to bob-bobiverse-agents-skill as "installed"

**Add:**
- v2.4 Release Install approach
- The Algorithm system overview
- New MEMORY structure (LEARNING/, SECURITY/, STATE/)
- Updated upgrade path for future versions

### 6.2 Update Personal Packs Table

Current status after v2.4:

| Pack | Status | Notes |
|------|--------|-------|
| bob-bobiverse-agents-skill | 📦 Archived | In repo, not installed - using upstream agents |
| bob-cognitive-loop-skill | Status? | Need to verify compatibility |
| bob-external-agents-skill | Status? | Check if installed/working |
| bob-notion-skill | Status? | Check if installed/working |
| bob-telos-skill | Status? | Check if installed/working |
| (others) | Status? | Audit after upgrade |

### 6.3 Create Upgrade Documentation

Create `/home/bob/projects/Bob2.0/UPGRADES.md`:

```markdown
# PAI Upgrade History

## v2.4.0 (2026-01-24)

**Method:** Full Release Install (not pack-by-pack upgrade)
**Changed:** Complete system replacement using Releases/v2.4/.claude/
**Preserved:** USER/, BobPacks that were reinstalled
**Removed:** bob-bobiverse-agents-skill (using upstream agents instead)

### Key Changes
- The Algorithm: 7-phase problem-solving with ISC tracking
- 29 skills (up from 20)
- New MEMORY structure (LEARNING/, SECURITY/, STATE/)
- PAIInstallWizard.ts for interactive setup
- Upstream agents (Architect, Engineer, Artist, etc.)

### BobPacks Status
- SecondBrain: Restored from backup
- ExternalAgents: [Status after verification]
- (Document others after Phase 7)
```

### 6.4 Commit All Changes

```bash
cd /home/bob/projects/Bob2.0

git add CLAUDE.md UPGRADES.md Plans/FINAL-UPGRADE-PLAN-V2.4.md
git commit -m "docs: Complete v2.4 upgrade documentation

- Update CLAUDE.md for Full Release Install approach
- Create UPGRADES.md tracking upgrade history
- Document removal of bob-bobiverse-agents-skill
- Document new The Algorithm system
- Record BobPacks status post-upgrade"
```

---

## PHASE 7: PUSH TO ORIGIN

```bash
cd /home/bob/projects/Bob2.0
git push origin main
```

---

## PHASE 8: POST-UPGRADE TASKS (FUTURE)

These are saved for after v2.4 is stable and verified:

### 8.1 Audit BobPacks Compatibility

**Check each BobPack for v2.4 compatibility:**

| Pack | v2.3 Location | v2.4 Status | Action Needed |
|------|--------------|-------------|---------------|
| bob-cognitive-loop-skill | ~/.claude/skills/CognitiveLoop | Unknown | Test or reinstall |
| bob-notion-skill | ~/.claude/skills/Notion | Unknown | Test or reinstall |
| bob-telos-skill | ~/.claude/skills/Telos | Unknown | Test or reinstall |
| bob-opnsense-dns-skill | ~/.claude/skills/OpnsenseDns | Unknown | Test or reinstall |
| bob-pandoc-skill | ~/.claude/skills/Pandoc | Unknown | Test or reinstall |
| bob-taskman-skill | ~/.claude/skills/TaskMan | Unknown | Test or reinstall |
| bob-scratchpad-skill | ~/.claude/skills/Scratchpad | Unknown | Test or reinstall |
| bob-financial-system-skill | Status? | Unknown | Test or reinstall |

**Process:**
1. Check if pack was previously installed (`ls ~/.claude.BACKUP*/skills/`)
2. Test compatibility with v2.4 CORE system
3. Reinstall from BobPacks/ source if needed
4. Update BobPacks table in CLAUDE.md

### 8.2 Algorithm Integration Study

**Evaluate The Algorithm for specific workflows:**
- Project planning (spec-driven development)
- System upgrades (like this one)
- Complex debugging
- Research synthesis

**Create test cases:**
- Use The Algorithm on a real task
- Compare to non-Algorithm approach
- Measure verification quality
- Document ISC pattern benefits

### 8.3 Roamer Skill (bob-roamer-skill) - FUTURE

Create new BobPack with 4 size classes:
- Nano (haiku) - 10+ parallel, quick tasks
- Micro (haiku) - 5-10 parallel, small focused work
- Standard (sonnet) - 3-5 parallel, normal complexity
- Heavy (opus) - 1-2 parallel, deep analysis

**Design considerations:**
- How does this integrate with The Algorithm?
- Do Roamers use ISC tracking?
- Coordination with upstream Agents skill

### 8.4 Voice System Activation - OPTIONAL

If you decide to use voice notifications:

```bash
# Get ElevenLabs API key from their website
# Run wizard again to configure voice
cd ~/.claude
bun run PAIInstallWizard.ts
```

**Custom pronunciations:**
- Create `~/.claude/skills/CORE/USER/pronunciations.json`
- Define word replacements for TTS
- Test with VoiceServer notifications

---

## Quick Reference: Offline Moments

| Phase | What Changes | Why Offline | Recovery |
|-------|--------------|-------------|----------|
| Phase 6 | settings.json | Session hooks reload | Start new session |

**Note:** Phase 5 (Voice) is skipped - voice not being used.

---

## Rollback Plan

If anything goes wrong:

```bash
# OPTION 1: Surgical restore from selective backup
BACKUP_DIR=~/.claude/BACKUP_20260123_202007

# Restore USER directory
rm -rf ~/.claude/skills/CORE/USER
cp -r $BACKUP_DIR/USER ~/.claude/skills/CORE/USER

# Restore settings
cp $BACKUP_DIR/settings.json.backup ~/.claude/settings.json

# OPTION 2: Nuclear restore from full backup (if everything is broken)
rm -rf ~/.claude
cp -r ~/.claude.BACKUP_20260123_FULL ~/.claude

# Git rollback (if needed)
cd /home/bob/projects/Bob2.0
git reset --hard HEAD~1
```

---

## Checklist Summary

**Phase 1: Backup** ✅ COMPLETE (2026-01-23 20:20)
- [x] BACKUP_DIR created → `/home/bob/.claude/BACKUP_20260123_202007`
- [x] USER/ backed up (120K - DAIDENTITY, ABOUTME, TELOS/, etc.)
- [x] settings.json backed up (127 lines)
- [x] SecondBrain backed up (528K)
- [x] FULL ~/.claude backup → `/home/bob/.claude.BACKUP_20260123_FULL` (1.6G)

**Phase 2: Git Merge**
- [ ] Upstream fetched
- [ ] Changelog reviewed (`git log origin/main..upstream/main`)
- [ ] Merge completed (conflicts resolved if any)
- [ ] Merge commit created

**Phase 3: Install v2.4 Release** (REVISED APPROACH)
- [ ] Pre-release backup created (extra safety)
- [ ] Old ~/.claude removed
- [ ] v2.4 release copied (`cp -r Releases/v2.4/.claude ~/`)
- [ ] Directory structure verified
- [ ] PAIInstallWizard.ts run successfully
- [ ] USER/ directory restored from backup
- [ ] USER files verified intact

**Phase 4: Install BobPacks**
- [ ] SecondBrain restored/reinstalled
- [ ] ExternalAgents status determined
- [ ] Decision made on Bobiverse agents (skip for now)
- [ ] Other BobPacks status documented

**Phase 5: Verification**
- [ ] New Claude session started
- [ ] Identity check passed (knows Bob/Wally)
- [ ] The Algorithm check passed (can explain it)
- [ ] Skills check passed (v2.4 skills present)
- [ ] Agents check passed (upstream agents, no Bobiverse)
- [ ] Hook verification passed (security validator working)
- [ ] File structure verified (MEMORY/, etc.)

**Phase 6: Documentation**
- [ ] CLAUDE.md updated
- [ ] UPGRADES.md created
- [ ] BobPacks table status updated
- [ ] Documentation committed

**Phase 7: Push**
- [ ] Pushed to origin

**Phase 8: Post-Upgrade** (FUTURE)
- [ ] BobPacks compatibility audit
- [ ] The Algorithm integration study
- [ ] (Optional) Roamer skill design
- [ ] (Optional) Voice system activation

---

## Ready to Execute

**REVISED PLAN IS READY.**

Key changes from original plan:
1. Using Full Release Install (not pack-by-pack upgrade)
2. Complete system replacement (safer, cleaner)
3. Packs showing v2.3.0 is CORRECT (they're stable components)
4. The Algorithm is the new v2.4 centerpiece

When ready, say "Let's start Phase 2" (Phase 1 backup already complete).
