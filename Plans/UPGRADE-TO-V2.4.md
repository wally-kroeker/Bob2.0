# PAI v2.4 Upgrade Plan for Bob2.0

**Created:** 2026-01-23
**Current State:** Fork at commit b659227 (v2.3 level)
**Target State:** Upstream v2.4.0 "The Algorithm" (commit 914c884)

---

## Executive Summary

PAI v2.4 introduces "The Algorithm" - a 7-phase universal problem-solving methodology. The upgrade is **LOW RISK** due to:
- BobPacks are properly isolated (bob-* vs pai-* namespaces)
- Hook customizations are minimal (1 modified file + 1 unregistered BobPack hook)
- CORE/USER/ directory is completely custom and must be preserved (not replaced)

**Estimated Effort:** 1-2 hours with careful execution

---

## Phase 1: Pre-Merge Backup (CRITICAL)

Execute these backups BEFORE any merge operations:

```bash
# Backup USER directory (irreplaceable custom content)
cp -r ~/.claude/skills/CORE/USER ~/.claude/skills/CORE/USER.backup.$(date +%Y%m%d)

# Backup modified hook file
cp ~/.claude/hooks/handlers/voice.ts ~/.claude/hooks/handlers/voice.ts.backup

# Backup BobPack hook (not in upstream)
cp ~/.claude/hooks/enforce-persona-factory.ts ~/.claude/hooks/enforce-persona-factory.ts.backup

# Backup settings.json
cp ~/.claude/settings.json ~/.claude/settings.json.backup

# Backup SecondBrain skill (no source pack exists)
cp -r ~/.claude/skills/SecondBrain ~/.claude/skills/SecondBrain.backup
```

### Files to Preserve (Cannot Be Regenerated)

| File | Reason |
|------|--------|
| `CORE/USER/DAIDENTITY.md` | 159-line Bob personality definition |
| `CORE/USER/ABOUTME.md` | Wally's background/expertise |
| `CORE/USER/BASICINFO.md` | Business entities, key sites |
| `CORE/USER/CONTACTS.md` | Contact directory |
| `CORE/USER/DEFINITIONS.md` | Personal glossary |
| `CORE/USER/REMINDERS.md` | ADHD support triggers |
| `CORE/USER/TECHSTACKPREFERENCES.md` | Tech stack preferences |
| `CORE/USER/TELOS/` | Complete Telos framework |
| `skills/SecondBrain/` | Manually created skill (no pack) |
| `hooks/handlers/voice.ts` | Voice disable functionality |
| `hooks/enforce-persona-factory.ts` | BobPack hook |

---

## Phase 2: Git Merge

### 2.1 Fetch and Review Changes

```bash
cd /home/bob/projects/Bob2.0
git fetch upstream

# Review what's coming
git log origin/main..upstream/main --oneline

# Check for conflicts in critical files
git diff upstream/main -- README.md
git diff upstream/main -- Packs/pai-core-install/
git diff upstream/main -- Packs/pai-hook-system/
```

### 2.2 Execute Merge

```bash
# Merge upstream (will require conflict resolution)
git merge upstream/main -m "feat: Merge PAI v2.4.0 (The Algorithm) from upstream"
```

### 2.3 Expected Conflicts

| File | Resolution Strategy |
|------|---------------------|
| `README.md` | Keep upstream content, add Bob2.0 fork notice at top |
| `CLAUDE.md` | Ours (not in upstream - no conflict) |
| `BobPacks/` | Ours (not in upstream - no conflict) |

---

## Phase 3: Reinstall Updated Packs

### 3.1 pai-hook-system Updates

**Changes in v2.4:**
- Minor refinements (no breaking changes)
- New hooks may be added

**Action:** Compare and selectively update

```bash
# Compare installed vs upstream
diff -r ~/.claude/hooks Packs/pai-hook-system/src/hooks/ --exclude="*.backup" --exclude="enforce-persona-factory.ts"
```

**Manual Steps:**
1. Copy any new hooks from `Packs/pai-hook-system/src/hooks/` to `~/.claude/hooks/`
2. Update `~/.claude/hooks/lib/` files (safe to replace)
3. **RE-APPLY** voice.ts modification:

```typescript
// In ~/.claude/hooks/handlers/voice.ts - add after imports
import { getIdentity, getSettings } from '../lib/identity';

function isVoiceEnabled(): boolean {
  const settings = getSettings();
  if (settings.voice && typeof settings.voice === 'object' && 'enabled' in settings.voice) {
    return Boolean(settings.voice.enabled);
  }
  return true;
}

// Add at start of handleVoice function:
if (!isVoiceEnabled()) {
  console.error('[Voice] Disabled in settings.json - skipping');
  return;
}
```

### 3.2 pai-core-install Updates

**CRITICAL:** Preserve USER/ directory during update

**Changes in v2.4:**
- Algorithm integration in routing
- New workflows/tools
- SYSTEM/ documentation updates

**Action:**

```bash
# Update SYSTEM/ directory (safe to replace)
rm -rf ~/.claude/skills/CORE/SYSTEM/
cp -r Packs/pai-core-install/src/skills/CORE/SYSTEM/ ~/.claude/skills/CORE/SYSTEM/

# Update Tools/ and Workflows/ (safe to replace)
rm -rf ~/.claude/skills/CORE/Tools/
cp -r Packs/pai-core-install/src/skills/CORE/Tools/ ~/.claude/skills/CORE/Tools/

rm -rf ~/.claude/skills/CORE/Workflows/
cp -r Packs/pai-core-install/src/skills/CORE/Workflows/ ~/.claude/skills/CORE/Workflows/

# Review and update SKILL.md (check for structural changes)
diff ~/.claude/skills/CORE/SKILL.md Packs/pai-core-install/src/skills/CORE/SKILL.md
```

**Re-apply SKILL.md customization:**
- Line 63: Change example from "Done, Daniel." to "Done."

### 3.3 pai-browser-skill v2.3.1

**Changes:** Notification formatting (`PAI Browser Action:` prefix)

```bash
# Safe to fully replace
rm -rf ~/.claude/skills/Browser/
cp -r Packs/pai-browser-skill/src/skills/Browser/ ~/.claude/skills/Browser/
```

### 3.4 pai-voice-system (New Feature: Pronunciations)

**New Feature:** Custom pronunciation support via `pronunciations.json`

```bash
# Update voice system
cp Packs/pai-voice-system/src/hooks/handlers/voice.ts ~/.claude/hooks/handlers/voice.ts.upstream

# Manually merge: take upstream + re-apply isVoiceEnabled() check
```

**Optional:** Create pronunciations file for Bob-specific terms:

```bash
cat > ~/.claude/skills/CORE/USER/pronunciations.json << 'EOF'
{
  "PAI": "pie",
  "Telos": "tee-loss",
  "GoodFields": "good fields",
  "FabLab": "fab lab"
}
EOF
```

---

## Phase 4: Fix Outstanding Issues

### 4.1 Register enforce-persona-factory.ts Hook

**Issue:** BobPack hook installed but NOT registered in settings.json

**Fix:** Add to PreToolUse section in `~/.claude/settings.json`:

```json
"PreToolUse": [
  {
    "matcher": "Task",
    "hooks": [
      {
        "type": "command",
        "command": "bun run $PAI_DIR/hooks/enforce-persona-factory.ts"
      }
    ]
  },
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "bun run $PAI_DIR/hooks/SecurityValidator.hook.ts"
      }
    ]
  }
]
```

### 4.2 Clean Up Debug File

```bash
rm ~/.claude/hooks/subagent-stop-debug.log
```

### 4.3 Update CLAUDE.md Documentation

The CLAUDE.md section "Customized Core Files (UPSTREAM DELTA)" needs corrections:

**Changes needed:**
1. Change SKILL.md risk from "LOW" to "TRIVIAL - 1 line example text"
2. Change USER/DAIDENTITY.md risk from "MEDIUM" to "CRITICAL - complete custom file"
3. Remove reference to `~/.claude/CLAUDE.md` (file doesn't exist)
4. Add USER/TELOS/ directory to preservation list
5. Document SecondBrain skill as manually installed
6. Add all USER/ files to preservation list

---

## Phase 5: Verification

### 5.1 Functional Tests

```bash
# Test CORE skill loads
claude --print "What is your name?"
# Expected: Bob responds with personality

# Test hook system
echo '{"session_id":"test","tool_name":"Bash","tool_input":{"command":"ls"}}' | \
  bun run ~/.claude/hooks/SecurityValidator.hook.ts
# Expected: exit 0 (allowed)

# Test voice system (if enabled)
# Start session and check for voice output
```

### 5.2 Verification Checklist

- [ ] CORE skill loads at session start (Bob personality active)
- [ ] USER/ directory intact (all 8+ files present)
- [ ] TELOS/ framework accessible
- [ ] Hooks fire correctly (check SessionStart greeting)
- [ ] Voice disable setting works (if using)
- [ ] BobPacks skills still functional
- [ ] Security validator blocks dangerous commands
- [ ] Browser skill has new notification format

### 5.3 Post-Merge Cleanup

```bash
# Push merged changes to origin
git push origin main

# Remove backups after verification (or keep for 1 week)
# rm ~/.claude/skills/CORE/USER.backup.*
```

---

## Risk Assessment

| Component | Risk Level | Mitigation |
|-----------|------------|------------|
| CORE/USER/ | LOW (with backup) | Full backup before merge |
| hooks/handlers/voice.ts | LOW | 10-line re-apply after merge |
| enforce-persona-factory.ts | LOW | BobPack file, not touched by upstream |
| BobPacks/ | NONE | Separate namespace |
| SecondBrain skill | MEDIUM | Backup (no source pack) |

---

## Rollback Plan

If upgrade fails:

```bash
# Restore backups
cp -r ~/.claude/skills/CORE/USER.backup.* ~/.claude/skills/CORE/USER
cp ~/.claude/settings.json.backup ~/.claude/settings.json
cp ~/.claude/hooks/handlers/voice.ts.backup ~/.claude/hooks/handlers/voice.ts

# Git rollback
git reset --hard HEAD~1
git push origin main --force  # Only if pushed
```

---

## New Features Available After Upgrade

### The Algorithm (v2.4 Headline)
7-phase universal problem-solving:
1. **OBSERVE** - Understand request + context
2. **THINK** - Ensure nothing missing
3. **PLAN** - Sequence and assign capabilities
4. **BUILD** - Make criteria testable
5. **EXECUTE** - Do the work
6. **VERIFY** - Test each condition
7. **LEARN** - Output for rating/feedback

### ISC (Ideal State Criteria)
Binary-testable, 8-word conditions that define success.

### Pronunciation Customizations
Custom TTS word replacements via `pronunciations.json`.

### Effort Classification
Tasks classified as TRIVIAL → QUICK → STANDARD → THOROUGH → DETERMINED.

### Observability Dashboard
Complete Vue.js dashboard with agent swim lanes and event timeline.

---

## Summary

**Go/No-Go:** GO - Low risk upgrade with clear backup/rollback path

**Critical Success Factors:**
1. Backup USER/ directory BEFORE merge
2. Re-apply voice.ts modification AFTER merge
3. Register enforce-persona-factory.ts hook
4. Verify CORE skill loads with Bob personality

**Post-Upgrade:**
- Update CLAUDE.md documentation
- Test all BobPacks skills
- Consider adopting Algorithm methodology
