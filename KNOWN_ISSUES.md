# Known Issues - Bob PAI System

This file tracks known bugs and issues in the Bob PAI system that need investigation.

---

## BUG-001: Identity Incorrectly Set to "Grok" During Session

**Date Reported**: 2026-01-18
**Severity**: Medium
**Status**: Open - Needs Investigation

### Symptom
During the ultimate-tetris project work, all voice output lines (`🗣️`) showed "Grok" instead of "Bob":
```
🗣️ Grok: Dev server terminated as expected. Production live at wallykroeker.com/tetris ready to play.
```

### Details
- **Session ID**: `dec798b7-6a1a-4b3d-9f35-7b09e53dcfb6`
- **Project**: `/home/bob/projects/ultimate-tetris`
- **Date**: January 18, 2026
- **Occurrences**: All 5 voice outputs in that session used "Grok" identity

### Investigation Findings

**What We Ruled Out:**
- ✗ GrokResearcher agent invocation (no Grok agent was spawned)
- ✗ Subagent output (subagents Bill/Homer/Mario use `🎯 COMPLETED:` format, not `🗣️`)
- ✓ Issue was in main AI responses, not delegated work
- ✓ Current configuration is correct (`settings.json` → `daidentity.name = "Bob"`)

**Subagents Spawned** (for reference):
- Session dec798b7: Bill, Homer, Mario
- Session f220d071: Architect, Bill, Homer, Howard, Mario, Riker

**Technical Details:**
- Voice output controlled by: `FormatEnforcer.hook.ts`
- Identity source: `/home/bob/.claude/hooks/lib/identity.ts` → `settings.json`
- Current settings.json correctly shows: `"daidentity": { "name": "Bob" }`

### Possible Causes (Unconfirmed)
1. Temporary environment variable override (`DA=Grok`)
2. PAI system upgrade/merge that temporarily changed config
3. Settings.json was manually edited then reverted
4. Hook or identity library was different during that session
5. Session-specific configuration override mechanism

### To Investigate
- [x] Check git history of `~/.claude/settings.json` if it becomes a git repo
  - Not a git repo, no history available
- [x] Review PAI upgrade logs around Jan 17-18, 2026
  - v2.3 upgrade occurred Jan 17, issue reported Jan 18
  - Likely a transient state during upgrade/migration
- [x] Check if environment variables can override settings.json identity
  - identity.ts fallback chain: `daidentity.name || env.DA || DEFAULT_IDENTITY.name`
  - Current config correct: both daidentity.name and env.DA set to "Bob"
- [x] Review FormatEnforcer and identity.ts for session-specific overrides
  - No session-specific override mechanism found
  - Uses cached settings.json read (single source of truth)
- [ ] Determine if this happens again (monitoring needed)
  - **ACTIVE MONITORING** - report any recurrence

### Investigation Conclusion (2026-01-19)
Most likely cause: Transient configuration state during v2.3 upgrade on Jan 17-18.
The system was likely running with partial/stale configuration during the migration.
Current configuration is correct and verified. No code changes needed.

### Reproduction
Unable to reproduce - current system correctly uses "Bob" identity.

### Workaround
None needed - system is currently working correctly.

### Related Files
- `/home/bob/.claude/settings.json` (identity configuration)
- `/home/bob/.claude/hooks/FormatEnforcer.hook.ts` (voice output injection)
- `/home/bob/.claude/hooks/lib/identity.ts` (identity loader)
- `/home/bob/.claude/projects/-home-bob-projects-ultimate-tetris/dec798b7-6a1a-4b3d-9f35-7b09e53dcfb6.jsonl` (affected session)

---

## Template for New Issues

```
## BUG-XXX: [Short Description]

**Date Reported**: YYYY-MM-DD
**Severity**: Low | Medium | High | Critical
**Status**: Open | Investigating | Fixed | Closed

### Symptom
[What went wrong from user perspective]

### Details
[When, where, how often]

### Investigation Findings
[What we know, what we ruled out]

### To Investigate
- [ ] Investigation steps

### Reproduction
[Steps to reproduce, or "Unable to reproduce"]

### Workaround
[Temporary solution if available]

### Related Files
[Relevant file paths]
```
