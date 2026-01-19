# CORE/USER Population & v2.3 Upgrade Plan

**Created:** 2026-01-16
**Status:** IN PROGRESS
**Authors:** Bob Prime (coordination), Riker (upstream research), Bill (architecture), Bender (critical review), Homer (Telos analysis)

---

## Executive Summary

This document outlines the two-phase upgrade plan for Bob2.0:

1. **Phase A: CORE/USER Population** (Before v2.3 upgrade)
   - Populate empty template files with real context
   - Enable "top of mind" context loading at session start
   - Evaluate if bob-telos-skill can be deprecated/simplified

2. **Phase B: PAI v2.3 Upgrade** (After Phase A validation)
   - Merge upstream (16 commits behind)
   - Install continuous learning system
   - Address Bender's critical findings

**Priority:** Phase A first - GBAIC meeting prep needs immediate context availability.

---

## Current State Analysis

### CORE/USER Directory Status

| File | Current State | Target State | Priority |
|------|---------------|--------------|----------|
| `TELOS.md` | Empty template | Extracted G1-G3 from Telos data | **HIGH** |
| `CONTACTS.md` | Empty template | Key relationships table | **HIGH** |
| `ABOUTME.md` | Template placeholders | Background + philosophy | **HIGH** |
| `DAIDENTITY.md` | Populated (Bob identity) | No change needed | Done |
| `TECHSTACKPREFERENCES.md` | Minimal | Review/expand | MEDIUM |
| `REMINDERS.md` | Template | Time-sensitive items | LOW |
| `RESUME.md` | Template | Professional background | LOW |
| `DEFINITIONS.md` | Template | Canonical definitions | LOW |
| `CORECONTENT.md` | Template | Content registry | LOW |

### Telos Skill Data (Source of Truth)

| File | Size | Content | Use For |
|------|------|---------|---------|
| `goodfields.md` | 120KB | Full corporate Telos (Mission/Goals/Risks/Leads/Activity Log) | TELOS.md GoodFields section, CONTACTS.md leads |
| `personal.md` | 92KB | Full personal Telos (History/Problems/Mission/Challenges/Wisdom) | ABOUTME.md, TELOS.md Personal section |
| `fablab.md` | 37KB | Full infrastructure Telos (Mission/Goals/Network/Services/Activity Log) | TELOS.md FabLab section |

### Architecture Decision (Homer's Analysis)

**Two-Tier Context Architecture:**
- **Tier 1 (CORE/USER):** Lightweight dashboard for quick AI reference
- **Tier 2 (Telos/data):** Deep context for strategic conversations

**Key Insight:** Not replacing Telos skill - creating synthesis layer that other skills can reference.

---

## Phase A: CORE/USER Population

### Task A1: Populate TELOS.md

**Source Files:**
- `~/.claude/skills/Telos/data/goodfields.md`
- `~/.claude/skills/Telos/data/fablab.md`
- `~/.claude/skills/Telos/data/personal.md`

**Target Structure:**
```markdown
# TELOS - Life Operating System

## Life Areas

### GoodFields Consulting
**Vision:** [From goodfields.md Mission]
**Current Focus:** G1-G3 extracted
**Projects:** Active Leads table (top 5)

### FabLab Infrastructure
**Vision:** [From fablab.md Mission]
**Current Focus:** G1-G3 extracted
**Projects:** Active infrastructure projects

### Personal/StillPoint
**Vision:** [From personal.md Mission]
**Current Focus:** G1-G3 extracted

## Active Projects (Cross-cutting)
[Combined table from all three areas]

## Dependencies
[Blocked-by tracking]
```

**Estimated Time:** 30 minutes
**Can Delegate To:** Riker (research/extraction) or manual

---

### Task A2: Populate CONTACTS.md

**Source:**
- `goodfields.md` Active Leads table
- `personal.md` History section (relationships)

**Target Structure:**
```markdown
# Contact Directory

## Key Relationships

| Name | Role | Email | Context |
|------|------|-------|---------|
| [Key contacts with relationship context] |

## Active Leads (GoodFields)

| Name | Company | Status | Next Action |
|------|---------|--------|-------------|
| [From goodfields.md Active Leads] |
```

**Estimated Time:** 15 minutes
**Can Delegate To:** Riker or manual

---

### Task A3: Populate ABOUTME.md

**Source:** `personal.md` sections:
- History
- Values/Decision Filters
- Wisdom
- Narratives

**Target Structure:**
```markdown
# About Wally Kroeker

## Background
[2-3 paragraph summary from History]

## Professional Experience
[Key roles: Qualico, CAA, etc.]

## Core Values
[From Values section]

## Decision Filters
[Questions for evaluating opportunities]

## Philosophy
[Key wisdom/insights]

## Communication Style
[How to represent Wally]
```

**Estimated Time:** 15 minutes
**Can Delegate To:** Howard (designer/writer) or manual

---

### Task A4: Review Other USER Files

**Files to review:**
- `TECHSTACKPREFERENCES.md` - Add current preferences
- `REMINDERS.md` - Add time-sensitive items (GBAIC meeting!)
- Others as needed

**Estimated Time:** 15 minutes

---

### Phase A Verification

After populating files:

1. **Restart Claude Code session**
2. **Test context availability:**
   - "What are my current GoodFields priorities?"
   - "Who should I follow up with this week?"
   - "What's my FabLab G1?"
3. **Evaluate Telos skill redundancy:**
   - Does CORE/USER provide enough context?
   - Is Telos skill still needed for deep dives?

---

## Phase B: PAI v2.3 Upgrade

### Pre-Requisites
- [ ] Phase A complete and validated
- [ ] Backup created
- [ ] Bender's critical fixes addressed

### Bender's Critical Findings (Must Fix)

| Issue | Severity | Fix Required |
|-------|----------|--------------|
| `$PAI_DIR` variable expansion | CRITICAL | Wrap commands in `bash -c` |
| `jq` defensive coding | HIGH | Add null checks to all operations |
| Disk bomb (no log rotation) | MEDIUM | Add cleanup cron job |
| Time estimate (3.75h fantasy) | MEDIUM | Plan for full day |
| Identity backward compatibility | MEDIUM | Test before merge |

### Updated Time Estimate

| Phase | Bill's Estimate | Bender's Reality Check |
|-------|-----------------|------------------------|
| Pre-Migration | 15 min | 30 min |
| Repository Merge | 20 min | 60 min (conflict resolution) |
| CORE Reinstallation | 25 min | 45 min |
| Continuous Learning | 30 min | 60 min (jq debugging) |
| Pack Installation | 40 min | 60 min |
| Verification | 30 min | 60 min |
| Runtime Testing | 20 min | 45 min |
| **Total** | **3.75 hours** | **6-8 hours** |

### Recommended Schedule

**Session 1 (2-3 hours):** Phases 0-2 (backup, merge, CORE)
**Session 2 (2-3 hours):** Phases 3-5 (continuous learning, packs, verification)
**Session 3 (1-2 hours):** Phase 6 + post-migration tasks

---

## Task Assignment Matrix

| Task | Recommended Agent | Model | Priority | Status |
|------|-------------------|-------|----------|--------|
| A1: TELOS.md | Riker or Manual | - | HIGH | Pending |
| A2: CONTACTS.md | Riker or Manual | - | HIGH | Pending |
| A3: ABOUTME.md | Howard or Manual | - | HIGH | Pending |
| A4: Review others | Manual | - | MEDIUM | Pending |
| B: v2.3 Merge | Mario | sonnet | HIGH | Pending |
| B: Fix jq issues | Bender | gemini | CRITICAL | Pending |
| B: Log rotation | Mario | sonnet | MEDIUM | Pending |

---

## Related Documents

- `UPGRADE-PLAN-v2.3.md` - Bill's detailed v2.3 migration plan
- `UPGRADE-SUMMARY-v2.3.md` - Executive briefing
- `UPGRADE-COMPARISON-v2.3.md` - Before/after comparison
- `CONTINUOUS-LEARNING-ARCHITECTURE.md` - Technical deep-dive

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-16 | Populate CORE/USER before v2.3 upgrade | V2.3 preserves USER files; get immediate GBAIC benefit |
| 2026-01-16 | Two-tier architecture (CORE/USER + Telos) | Homer's analysis - dashboard + deep context |
| 2026-01-16 | Fix Bender's issues before merge | Critical bugs would cause cascade failures |

---

## Next Actions

1. **Immediate:** Execute Task A1 (TELOS.md population)
2. **Then:** Tasks A2-A4 in sequence
3. **Validate:** Test context loading in new session
4. **Then:** Address Bender's v2.3 fixes
5. **Then:** Execute v2.3 upgrade

---

*Document maintained by Bob Prime. Last updated: 2026-01-16*
