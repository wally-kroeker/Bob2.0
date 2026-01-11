# PAI v2.1 Migration Plan for Bob 2.0

**Created:** 2026-01-10
**Author:** Bob Prime (with Riker exploration + Bill review + Planning agent analysis)
**Target:** Migrate Bob 2.0 from current state to upstream PAI v2.1

> **MIGRATION COMPLETED:** 2026-01-10
>
> All phases executed successfully. Orphan hooks identified and removed.
> System aligned with upstream PAI v2.1.

---

## Executive Summary

Bob 2.0 (a personal fork of danielmiessler/PAI) needs to migrate from the current `kai-*` naming convention to the upstream `pai-*` convention, adopt the new MEMORY system replacing the retired `pai-history-system`, and integrate new upstream packs.

| Metric | Value |
|--------|-------|
| Upstream commits to merge | 49 |
| Breaking changes | 2 (rebrand + history retirement) |
| BobPacks requiring updates | 4 |
| New packs available | 2 (pai-algorithm-skill, pai-upgrades-skill) |
| Estimated time | ~1.5 hours |

---

## Decision Points

> **WALLY:** Please mark your decisions below before we proceed.

### Decision 1: Merge Strategy

- [x] **Option A: Standard Merge** (Recommended) - Preserves commit history, shows merge point
- [ ] **Option B: Rebase** - Cleaner linear history, rewrites commits

### Decision 2: CORE Skill Reinstall

- [x] **Option A: Full Reinstall** (Recommended) - Clean slate, copy new structure, restore customizations
- [ ] **Option B: Incremental Update** - Add new directories, preserve existing files (higher risk of missing files)

### Decision 3: pai-algorithm-skill

- [ ] **Option A: Install Now** - v0.5.0 (early release), complex 7-phase execution engine
- [x] **Option B: Wait** (Recommended) - Let it mature, install in future update

### Decision 4: pai-upgrades-skill

- [x] **Option A: Install Now** (Recommended) - Per Riker/Bill analysis, high value for Bob
- [ ] **Option B: Later** - Defer to separate task

### Decision 5: Old history/ Directory

- [x] **Option A: Keep as Deprecated** (Recommended) - Rename to `history-deprecated-YYYYMMDD`
- [ ] **Option B: Delete** - Remove after verifying MEMORY works
- [ ] **Option C: Keep Both** - Maintain both directories indefinitely

---

## Phase 1: Pre-Migration Backup

### 1.1 Create Full Backup

```bash
# Create timestamped backup directory
BACKUP_DIR="$HOME/.pai-backup/pre-v2.1-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup installed PAI infrastructure
cp -r ~/.claude "$BACKUP_DIR/claude-backup"

# Backup repository state
cd /home/bob/projects/Bob2.0
git stash push -m "Pre-v2.1 migration stash" 2>/dev/null || echo "Nothing to stash"

# Record current state
git log -1 --oneline > "$BACKUP_DIR/git-state.txt"
echo "" >> "$BACKUP_DIR/git-state.txt"
echo "PAI_DIR structure at backup time:" >> "$BACKUP_DIR/git-state.txt"
ls -la ~/.claude >> "$BACKUP_DIR/git-state.txt"

echo "✅ Backup created at: $BACKUP_DIR"
```

### 1.2 Verify Backup

```bash
# Verify backup contents
ls -la "$BACKUP_DIR"
# Expected: claude-backup/, git-state.txt

ls "$BACKUP_DIR/claude-backup/"
# Expected: hooks/, skills/, history/, settings.json, .env, etc.
```

---

## Phase 2: Repository Merge

### 2.1 Fetch Upstream

```bash
cd /home/bob/projects/Bob2.0
git fetch upstream
```

### 2.2 Merge Upstream (Based on Decision 1)

**If Standard Merge (Option A):**
```bash
git merge upstream/main -m "feat: Merge upstream PAI v2.1 (kai-* to pai-* rebrand)"
```

**If Rebase (Option B):**
```bash
git rebase upstream/main
```

### 2.3 Resolve Expected Conflicts

**CLAUDE.md Conflict Resolution:**

The merge will likely conflict on `CLAUDE.md`. Resolution strategy:

1. Keep Bob-specific sections:
   - Fork Documentation
   - Git Remotes table
   - BobPacks Directory section
   - Personal Packs Available table
   - Creating a New BobPack section
   - BobPack Quality Checklist

2. Accept upstream changes:
   - Core Architecture section updates
   - Critical File Locations (update paths)
   - Development Commands
   - Common Tasks

3. Update all references:
   - `kai-*` → `pai-*`
   - `Bundles/Kai/` → `Bundles/Official/`
   - Version references to v2.1

**After resolving:**
```bash
git add CLAUDE.md
git commit -m "fix: Resolve CLAUDE.md merge conflict, preserve Bob customizations"
```

---

## Phase 3: BobPacks Updates

### 3.1 Update bob-external-agents-skill

```bash
cd /home/bob/projects/Bob2.0/BobPacks/bob-external-agents-skill

# Files to update (5 files):
# - src/skills/ExternalAgents/personas.yaml
# - src/skills/ExternalAgents/Tools/spawn-agent.sh
# - src/skills/ExternalAgents/SKILL.md
# - INSTALL.md
# - README.md

# Replace kai-agents-skill with pai-agents-skill
sed -i 's/kai-agents-skill/pai-agents-skill/g' README.md INSTALL.md
sed -i 's/kai-agents-skill/pai-agents-skill/g' src/skills/ExternalAgents/SKILL.md
sed -i 's/kai-agents-skill/pai-agents-skill/g' src/skills/ExternalAgents/personas.yaml
sed -i 's/kai-agents-skill/pai-agents-skill/g' src/skills/ExternalAgents/Tools/spawn-agent.sh
```

### 3.2 Update bob-scratchpad-skill

```bash
cd /home/bob/projects/Bob2.0/BobPacks/bob-scratchpad-skill

# Update README.md - change kai-history-system reference to MEMORY system
sed -i 's/kai-history-system/pai-core-install (MEMORY system)/g' README.md
```

### 3.3 Update bob-financial-system-skill

```bash
cd /home/bob/projects/Bob2.0/BobPacks/bob-financial-system-skill

# Update README.md
sed -i 's/kai-core-install/pai-core-install/g' README.md
sed -i 's/kai-history-system/pai-core-install (MEMORY system)/g' README.md
```

### 3.4 Update bob-telos-skill

```bash
cd /home/bob/projects/Bob2.0/BobPacks/bob-telos-skill

# Update INSTALL.md and README.md
sed -i 's/kai-core-install/pai-core-install/g' INSTALL.md README.md
```

### 3.5 Verify BobPacks Updates

```bash
cd /home/bob/projects/Bob2.0

# Check for any remaining kai-* references
grep -r "kai-" BobPacks/ --include="*.md" --include="*.yaml" --include="*.sh" --include="*.ts"

# Expected: No results (or only historical changelog entries)
```

### 3.6 Commit BobPacks Updates

```bash
git add BobPacks/
git commit -m "chore: Update BobPacks references from kai-* to pai-*"
```

---

## Phase 4: Installed Infrastructure Migration

### 4.1 Create MEMORY Directory Structure

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Create new MEMORY structure
mkdir -p "$PAI_DIR/MEMORY"/{research,sessions,learnings,decisions,execution,security,recovery,raw-outputs,backups,State}

# Copy MEMORY README from upstream
cp /home/bob/projects/Bob2.0/Packs/pai-core-install/src/MEMORY/README.md "$PAI_DIR/MEMORY/"

echo "✅ MEMORY directory structure created"
```

### 4.2 Migrate History Data to MEMORY

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Migrate existing history data
cp -r "$PAI_DIR/history/learnings/"* "$PAI_DIR/MEMORY/learnings/" 2>/dev/null || echo "No learnings to migrate"
cp -r "$PAI_DIR/history/sessions/"* "$PAI_DIR/MEMORY/sessions/" 2>/dev/null || echo "No sessions to migrate"
cp -r "$PAI_DIR/history/decisions/"* "$PAI_DIR/MEMORY/decisions/" 2>/dev/null || echo "No decisions to migrate"
cp -r "$PAI_DIR/history/execution/"* "$PAI_DIR/MEMORY/execution/" 2>/dev/null || echo "No execution to migrate"
cp -r "$PAI_DIR/history/research/"* "$PAI_DIR/MEMORY/research/" 2>/dev/null || echo "No research to migrate"
cp -r "$PAI_DIR/history/raw-outputs/"* "$PAI_DIR/MEMORY/raw-outputs/" 2>/dev/null || echo "No raw-outputs to migrate"

echo "✅ History data migrated to MEMORY"
```

### 4.3 Update Hooks

The hooks need to reference MEMORY/ instead of history/. Two options:

**Option A: Reinstall hooks from upstream (Recommended)**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Backup current hooks
cp -r "$PAI_DIR/hooks" "$BACKUP_DIR/hooks-backup"

# Copy updated hooks from upstream pack
cp /home/bob/projects/Bob2.0/Packs/pai-hook-system/src/*.ts "$PAI_DIR/hooks/"

echo "✅ Hooks reinstalled from upstream"
```

**Option B: Manual update (if customizations exist)**
```bash
# Edit each hook file that references 'history/'
# Change: const historyDir = join(paiDir, 'history');
# To:     const memoryDir = join(paiDir, 'MEMORY');

# Files to check:
# - stop-hook.ts
# - capture-session-summary.ts
# - Any other hooks writing to history/
```

### 4.4 Reinstall CORE Skill (Based on Decision 2)

**If Full Reinstall (Option A):**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Backup existing CORE (already in main backup, but belt-and-suspenders)
cp -r "$PAI_DIR/skills/CORE" "$BACKUP_DIR/CORE-skill-backup"

# Save Bob's customizations
cp "$PAI_DIR/skills/CORE/Contacts.md" /tmp/bob-contacts.md 2>/dev/null || echo "No Contacts.md"
cp "$PAI_DIR/skills/CORE/CoreStack.md" /tmp/bob-corestack.md 2>/dev/null || echo "No CoreStack.md"

# Remove old CORE
rm -rf "$PAI_DIR/skills/CORE"

# Install new CORE structure
cp -r /home/bob/projects/Bob2.0/Packs/pai-core-install/src/skills/CORE "$PAI_DIR/skills/"

# Restore Bob's customizations to new locations
cp /tmp/bob-contacts.md "$PAI_DIR/skills/CORE/USER/CONTACTS.md" 2>/dev/null || echo "No contacts to restore"
cp /tmp/bob-corestack.md "$PAI_DIR/skills/CORE/USER/TECHSTACKPREFERENCES.md" 2>/dev/null || echo "No stack prefs to restore"

echo "✅ CORE skill reinstalled with Bob customizations preserved"
```

**If Incremental Update (Option B):**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Add new directories
mkdir -p "$PAI_DIR/skills/CORE/USER"
mkdir -p "$PAI_DIR/skills/CORE/SYSTEM"
mkdir -p "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM"

# Copy new files (preserving existing)
cp -n /home/bob/projects/Bob2.0/Packs/pai-core-install/src/skills/CORE/USER/* "$PAI_DIR/skills/CORE/USER/"
cp -n /home/bob/projects/Bob2.0/Packs/pai-core-install/src/skills/CORE/SYSTEM/* "$PAI_DIR/skills/CORE/SYSTEM/"
cp -rn /home/bob/projects/Bob2.0/Packs/pai-core-install/src/skills/CORE/USER/PAISECURITYSYSTEM/* "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM/"

# Update SKILL.md
cp /home/bob/projects/Bob2.0/Packs/pai-core-install/src/skills/CORE/SKILL.md "$PAI_DIR/skills/CORE/"

echo "✅ CORE skill incrementally updated"
```

### 4.5 Handle Old history/ Directory (Based on Decision 5)

**If Keep as Deprecated (Option A):**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mv "$PAI_DIR/history" "$PAI_DIR/history-deprecated-$(date +%Y%m%d)"
echo "✅ Old history/ renamed to history-deprecated-*"
```

**If Delete (Option B):**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
rm -rf "$PAI_DIR/history"
echo "✅ Old history/ directory removed"
```

**If Keep Both (Option C):**
```bash
echo "✅ Keeping both history/ and MEMORY/ directories"
```

---

## Phase 5: New Pack Integration (Based on Decisions 3 & 4)

### 5.1 pai-upgrades-skill (If Decision 4 = Install Now)

**Pre-requisites:**
```bash
# Check for VideoTranscript skill (required for YouTube workflow)
ls ~/.claude/skills/VideoTranscript 2>/dev/null || echo "⚠️ VideoTranscript skill not found"

# If missing, create stub:
mkdir -p ~/.claude/skills/VideoTranscript/Tools
cat > ~/.claude/skills/VideoTranscript/Tools/GetTranscript.ts << 'EOF'
#!/usr/bin/env bun
console.error("VideoTranscript skill not implemented - YouTube transcript extraction unavailable");
process.exit(1);
EOF
chmod +x ~/.claude/skills/VideoTranscript/Tools/GetTranscript.ts

# Add GITHUB_TOKEN to .env if not present
grep -q "GITHUB_TOKEN" ~/.claude/.env || echo "# GITHUB_TOKEN=ghp_your_token_here" >> ~/.claude/.env
```

**Installation:**
Give Bob this instruction:
> Install the pack from /home/bob/projects/Bob2.0/Packs/pai-upgrades-skill/

Or manually:
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cp -r /home/bob/projects/Bob2.0/Packs/pai-upgrades-skill/src/skills/Upgrades "$PAI_DIR/skills/"
echo "✅ pai-upgrades-skill installed"
```

### 5.2 pai-algorithm-skill (If Decision 3 = Install Now)

**Note:** v0.5.0 is an early release. Recommended to wait for maturity.

If installing now:
> Install the pack from /home/bob/projects/Bob2.0/Packs/pai-algorithm-skill/

---

## Phase 6: Verification

### 6.1 Repository Verification

```bash
cd /home/bob/projects/Bob2.0

# Verify merge succeeded
echo "=== Git Status ==="
git log -3 --oneline

# Verify pack structure
echo ""
echo "=== Packs Directory ==="
ls Packs/ | head -15
# Should show pai-* directories

# Verify no kai-* packs remain
echo ""
echo "=== Checking for old kai-* packs ==="
ls Packs/ | grep "^kai-" || echo "✅ No kai-* packs found"

# Verify Bundles
echo ""
echo "=== Bundles Directory ==="
ls Bundles/
# Should show Official/, not Kai/
```

### 6.2 Installed Infrastructure Verification

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== MEMORY Structure ==="
ls "$PAI_DIR/MEMORY/"
# Expected: 10 directories + README.md

echo ""
echo "=== CORE Skill Structure ==="
ls "$PAI_DIR/skills/CORE/"
# Expected: SKILL.md, USER/, SYSTEM/, Workflows/, Tools/

echo ""
echo "=== CORE/USER Contents ==="
ls "$PAI_DIR/skills/CORE/USER/"
# Expected: Multiple .md files + PAISECURITYSYSTEM/

echo ""
echo "=== CORE/SYSTEM Contents ==="
ls "$PAI_DIR/skills/CORE/SYSTEM/"
# Expected: Multiple .md files
```

### 6.3 Hook Test

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test initialize-session hook
echo '{"session_id":"migration-test"}' | bun run "$PAI_DIR/hooks/initialize-session.ts"
# Should run without errors

# Test security-validator hook
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | bun run "$PAI_DIR/hooks/security-validator.ts"
# Should return 0 (allowed)
```

### 6.4 Skill Search Test

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test skill search tool
bun run "$PAI_DIR/Tools/SkillSearch.ts" --list 2>/dev/null || echo "SkillSearch not available (ok if not installed)"
```

### 6.5 BobPacks Verification

```bash
cd /home/bob/projects/Bob2.0

# Final check for kai-* references
echo "=== Checking BobPacks for kai-* references ==="
grep -r "kai-" BobPacks/ --include="*.md" --include="*.yaml" --include="*.sh" --include="*.ts" 2>/dev/null || echo "✅ No kai-* references found"
```

---

## Phase 7: Post-Migration Cleanup

### 7.1 Update Project CLAUDE.md

Ensure `/home/bob/projects/Bob2.0/CLAUDE.md` has:
- [ ] All `kai-*` → `pai-*` references updated
- [ ] Version updated to v2.1
- [ ] Bundle path updated to `Bundles/Official/`
- [ ] New packs added to documentation table

### 7.2 Regenerate Skill Index

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
bun run "$PAI_DIR/Tools/GenerateSkillIndex.ts" 2>/dev/null || echo "GenerateSkillIndex not available"
```

### 7.3 Commit Final State

```bash
cd /home/bob/projects/Bob2.0
git add -A
git status

# If changes exist:
git commit -m "chore: Complete PAI v2.1 migration

- Updated all kai-* references to pai-*
- Migrated history system to MEMORY
- Reinstalled CORE skill with new structure
- Updated BobPacks dependencies
- Integrated pai-upgrades-skill (if applicable)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin main
```

---

## Rollback Procedure

If migration fails at any point:

### Full Rollback

```bash
# Find your backup directory
BACKUP_DIR=$(ls -td ~/.pai-backup/pre-v2.1-* | head -1)
echo "Rolling back from: $BACKUP_DIR"

# Restore installed infrastructure
rm -rf ~/.claude
cp -r "$BACKUP_DIR/claude-backup" ~/.claude

# Restore repository
cd /home/bob/projects/Bob2.0
git reset --hard HEAD~1  # Undo last commit (adjust number as needed)
git stash pop 2>/dev/null || echo "No stash to restore"

echo "✅ Rollback complete"
```

### Partial Rollback (Infrastructure Only)

```bash
BACKUP_DIR=$(ls -td ~/.pai-backup/pre-v2.1-* | head -1)

# Restore just hooks
rm -rf ~/.claude/hooks
cp -r "$BACKUP_DIR/claude-backup/hooks" ~/.claude/

# Or restore just CORE skill
rm -rf ~/.claude/skills/CORE
cp -r "$BACKUP_DIR/claude-backup/skills/CORE" ~/.claude/skills/
```

---

## Risk Assessment

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Merge conflicts in CLAUDE.md | Medium | High | Manual resolution, backup exists |
| Hooks break during migration | High | Medium | Test before removing backups, reinstall from upstream |
| History data loss | High | Low | Full backup before migration |
| BobPacks stop working | Medium | Low | Update references before testing |
| settings.json corruption | Low | Very Low | Backup preserved, easy to restore |
| CORE skill misconfiguration | Medium | Medium | Full reinstall option, backup of customizations |

---

## Post-Migration Checklist

- [x] All verification steps pass
- [x] Claude Code starts without errors
- [x] SessionStart hook fires correctly
- [x] CORE skill loads at startup
- [x] Skills can be invoked (test: "check for updates" if Upgrades installed)
- [x] BobPacks work correctly
- [x] History/MEMORY data accessible
- [x] No kai-* references remain in active code
- [x] Backup directory preserved for 1 week minimum
- [x] Orphan hooks removed (stop-hook.ts, subagent-stop-hook.ts, capture-session-summary.ts)

---

## Timeline Summary

| Phase | Estimated Duration |
|-------|-------------------|
| Phase 1: Backup | 5 minutes |
| Phase 2: Repository Merge | 10-20 minutes |
| Phase 3: BobPacks Updates | 15 minutes |
| Phase 4: Infrastructure Migration | 30 minutes |
| Phase 5: New Pack Integration | 20 minutes (if applicable) |
| Phase 6: Verification | 15 minutes |
| Phase 7: Cleanup | 10 minutes |
| **Total** | **~1.5-2 hours** |

---

## Notes

- This plan was developed by parallel agent analysis (Riker exploration, Bill architectural review, Planning agent synthesis)
- pai-upgrades-skill is recommended for installation based on Riker's 9.1/10 score and Bill's "ADOPT with modifications" recommendation
- The VideoTranscript stub is a workaround; full YouTube monitoring requires the actual skill
- Consider setting up weekly "check for updates" routine after migration

---

*Generated by Bob Prime - 2026-01-10*
