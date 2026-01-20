---
id: "2026-01-20-003757_fixed-identity-substitution-bug-in-core-skill"
timestamp: "2026-01-20T00:37:57Z"
title: "Fixed Identity Substitution Bug in CORE Skill"
significance: "moderate"
change_type: "multi_area"
files_affected:
  - "/home/bob/.claude/skills/CORE/SKILL.md"
  - "/home/bob/.claude/skills/CORE/SYSTEM/RESPONSEFORMAT.md"
  - "/home/bob/.claude/skills/CORE/SYSTEM/THEHOOKSYSTEM.md"
  - "/home/bob/.claude/skills/System/SKILL.md"
  - "/home/bob/.claude/skills/Agents/AgentPersonalities.md"
  - "/home/bob/.claude/skills/System/Workflows/WorkContextRecall.md"
  - "/home/bob/.claude/agents/Bill.md"
  - "/home/bob/.claude/agents/Mario.md"
  - "/home/bob/.claude/agents/Riker.md"
  - "/home/bob/.claude/agents/Howard.md"
  - "/home/bob/.claude/agents/Homer.md"
  - "/home/bob/.claude/agents/Hugh.md"
  - "/home/bob/.claude/agents/Bender.md"
  - "/home/bob/.claude/agents/Ick.md"
  - "/home/bob/.claude/agents/Guppy.md"
  - "/home/bob/.claude/agents/Marvin.md"
  - "/home/bob/.claude/agents/Bridget.md"
inference_confidence: "high"
---

# Fixed Identity Substitution Bug in CORE Skill

**Timestamp:** 2026-01-20T00:37:57Z  |  **Significance:** 🟡 Moderate  |  **Type:** Multi-Area

---

## The Story

**Background:** After completing work on the Notion skill Files property integration and creating N8N handoff documentation, Wally asked what I thought his name was. I had incorrectly called him 'Daniel' in a response. Upon correction, Wally reported that another Bob session had also called him 'Daniel' instead of 'Wally', indicating a systemic issue rather than an isolated mistake. This was concerning because the configuration was known to be correct - settings.json had 'principal': 'Wally' and USER/DAIDENTITY.md line 142 explicitly stated 'By first name: Wally'.

**The Problem:** Despite proper identity configuration in settings.json and USER/DAIDENTITY.md, documentation examples throughout the CORE skill files contained hardcoded 'Daniel' references (the upstream PAI developer's name from danielmiessler's original repository). Since the CORE skill auto-loads at SessionStart via load-core-context.ts, these documentation examples were being injected verbatim into every session's context. When AI models process context, they sometimes latch onto example text that matches patterns they're looking for. Seeing 'Daniel' in examples like 'WRONG: Done, Daniel.' or 'const userName = getPrincipalName(); // Daniel' caused the model to occasionally use 'Daniel' instead of the correctly configured 'Wally' from settings.json. This created a subtle but persistent identity substitution bug where configuration was correct but documentation examples were contaminating the context.

**The Resolution:** Spawned Mario agent to investigate the identity loading mechanism and trace the root cause. Mario examined how LoadContext.hook.ts injects CORE/SKILL.md verbatim into session context and found that documentation examples throughout CORE, System, and Agents skills contained hardcoded 'Daniel' references that were bleeding into AI context. Fixed the issue by systematically removing all 'Daniel' references from documentation examples across 17 files. Changed examples to use generic 'user' or 'principal' terms, or where appropriate (agent personality files), replaced with the correct 'Wally'. Left legitimate uses untouched (ElevenLabs voice names containing 'Daniel', node_modules author credits). This ensures both configuration AND documentation examples are now consistent, eliminating the conflicting identity references that were causing the substitution bug.

---

## How It Used To Work

The identity system had split configuration - correct in settings but wrong in documentation:

This approach had these characteristics:
- settings.json correctly configured with 'principal': { 'name': 'Wally' }
- USER/DAIDENTITY.md correctly stated 'By first name: Wally'
- SYSTEM documentation files had hardcoded 'Daniel' in examples
- CORE skill auto-loads these files at SessionStart via load-core-context.ts
- Documentation examples injected verbatim into every session context
- AI model occasionally latched onto 'Daniel' from examples instead of configured 'Wally'
- Bug was intermittent because model sometimes used config, sometimes used examples
- Difficult to diagnose because configuration appeared correct when checked

## How It Works Now

Identity references are now consistent across both configuration and documentation:

Key improvements:
- All documentation examples use generic 'user' or 'principal' instead of hardcoded names
- Agent personality files correctly reference 'Wally' where principal name is needed
- CORE/SKILL.md no longer contains 'Done, Daniel' or similar examples
- RESPONSEFORMAT.md examples changed to generic user references
- THEHOOKSYSTEM.md removed '// Daniel' comment from code examples
- 11 agent personality files updated to reference 'Wally' consistently
- No conflicting identity references remain in auto-loaded context
- Configuration (settings.json) and documentation now tell the same story

---

## Changes Made

### Files Modified
- `/home/bob/.claude/skills/CORE/SKILL.md`
- `/home/bob/.claude/skills/CORE/SYSTEM/RESPONSEFORMAT.md`
- `/home/bob/.claude/skills/CORE/SYSTEM/THEHOOKSYSTEM.md`
- `/home/bob/.claude/skills/System/SKILL.md`
- `/home/bob/.claude/skills/Agents/AgentPersonalities.md`
- `/home/bob/.claude/skills/System/Workflows/WorkContextRecall.md`
- `/home/bob/.claude/agents/Bill.md`
- `/home/bob/.claude/agents/Mario.md`
- `/home/bob/.claude/agents/Riker.md`
- `/home/bob/.claude/agents/Howard.md`
- `/home/bob/.claude/agents/Homer.md`
- `/home/bob/.claude/agents/Hugh.md`
- `/home/bob/.claude/agents/Bender.md`
- `/home/bob/.claude/agents/Ick.md`
- `/home/bob/.claude/agents/Guppy.md`
- `/home/bob/.claude/agents/Marvin.md`
- `/home/bob/.claude/agents/Bridget.md`

---

## Going Forward

This fix ensures consistent identity handling across all future sessions. Upstream PAI repository updates that introduce new 'Daniel' references in examples will need to be caught during merge and changed to generic terms or correct local configuration. The lesson is that documentation examples in auto-loaded skills must not contain hardcoded values that conflict with user configuration, even in 'WRONG' examples meant to show what not to do. When forking and customizing upstream repositories, documentation examples require the same attention as code - they become part of the AI's context and influence behavior.

- All future Bob sessions will consistently use 'Wally' as principal name
- No more intermittent identity substitution bugs
- When merging upstream PAI updates, check documentation examples for 'Daniel'
- Established pattern: documentation examples use generic terms, not upstream developer names
- This pattern should apply to other configuration values beyond identity
- AUTO-LOADED context (CORE skill) requires extra scrutiny for hardcoded values
- Examples in documentation are just as important as code when they enter AI context

---

## Verification

**Tests Performed:**
- Mario searched all CORE skill files and removed hardcoded 'Daniel' references
- Verified settings.json still has correct 'principal': 'Wally' configuration
- Confirmed USER/DAIDENTITY.md unchanged (was already correct)
- Checked that legitimate uses (ElevenLabs voice names, author credits) were preserved
- Verified 17 files total were updated across CORE, System, Agents, and agent personalities
- Documentation examples now use 'user' or 'Wally' instead of 'Daniel'

---

**Confidence:** High
**Auto-generated:** Yes
