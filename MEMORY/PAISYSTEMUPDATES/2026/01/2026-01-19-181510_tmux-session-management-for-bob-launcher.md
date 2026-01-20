---
id: "2026-01-19-181510_tmux-session-management-for-bob-launcher"
timestamp: "2026-01-19T18:15:10Z"
title: "Tmux Session Management for Bob-Launcher"
significance: "moderate"
change_type: "tool_update"
files_affected:
  - "BobPacks/bob-launcher/src/tools/claude-launcher.sh"
  - "BobPacks/bob-launcher/README.md"
  - "BobPacks/bob-launcher/VERIFY.md"
inference_confidence: "high"
---

# Tmux Session Management for Bob-Launcher

**Timestamp:** 2026-01-19T18:15:10Z  |  **Significance:** 🟡 Moderate  |  **Type:** Tool Update

---

## The Story

**Background:** The Bob-Launcher (cc command) provides an interactive menu for launching Claude Code with different models and providers. However, sessions ran in regular terminals without persistence - if the terminal closed or disconnected, the session was lost.

**The Problem:** Three issues needed addressing: (1) No session persistence - closing terminal killed Claude sessions, (2) No way to track or restore existing sessions across projects, (3) No quick toggle for dangerous mode which requires typing a long flag.

**The Resolution:** Implemented comprehensive tmux integration following the plan from plan mode. Added 10 new functions for session management, modified the main menu and launch functions to create tmux sessions instead of using exec directly.

---

## How It Used To Work

Previously, the launcher used 'exec claude' which replaced the shell process.

This approach had these characteristics:
- Sessions died when terminal closed
- No visibility into active Claude sessions
- Had to manually type --dangerously-skip-permissions flag
- Script was 401 lines with basic menu functionality

## How It Works Now

Now all Claude sessions run inside tmux with project-based naming and full session management.

Key improvements:
- Sessions named cc_<project> (e.g., cc_Bob2.0) with duplicate handling (_2, _3)
- Restore menu (r) lists all cc_* sessions with attach/kill options
- Dangerous mode toggle (d) with visual indicator and warning banner
- Smart tmux handling: switch-client inside tmux, attach-session outside
- LiteLLM env vars baked into tmux command string
- Script now 680 lines (+279 lines of tmux functionality)

---

## Changes Made

### Files Modified
- `BobPacks/bob-launcher/src/tools/claude-launcher.sh`
- `BobPacks/bob-launcher/README.md`
- `BobPacks/bob-launcher/VERIFY.md`

---

## Going Forward

Session persistence means Claude work survives disconnects and can be resumed later.

- Can detach (Ctrl-B d) and reattach to sessions
- Multiple Claude sessions across different projects visible at once
- Quick dangerous mode for trusted workflows
- Foundation for potential session logging/history features

---

## Verification

**Tests Performed:**
- bash -n validation passed - no syntax errors
- Script installed to ~/.local/bin/cc
- tmux 3.4 confirmed available on system

---

**Confidence:** High
**Auto-generated:** Yes
