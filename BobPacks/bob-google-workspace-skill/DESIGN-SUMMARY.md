# GoogleWorkspace Skill - Design Summary

**Architect:** Bill (Bob-4)
**Date:** 2026-01-13
**Type:** MCP Wrapper (Option A)

---

## Overview

The `bob-google-workspace-skill` is an MCP wrapper that provides natural language routing to Google Workspace services (Gmail, Calendar, Drive) through Claude Code's built-in MCP system. This pack contains ZERO executable code - it's pure documentation and routing logic.

---

## Key Architecture Points

### 1. MCP Wrapper Pattern

**What This Pack Contains:**
- SKILL.md (routing + triggers)
- Workflow documentation (Gmail.md, Calendar.md, Drive.md)
- Installation guide (MCP configuration)
- Verification checklist

**What It Does NOT Contain:**
- OAuth implementation
- API request handling
- MCP server code
- Tools/ directory

**Why:** Official Google Workspace MCP server exists - we wrap it, not reimplement it.

---

### 2. Directory Structure

```
bob-google-workspace-skill/
├── README.md                              # Pack overview
├── INSTALL.md                             # MCP config + OAuth setup
├── VERIFY.md                              # 10-step verification
├── ARCHITECTURE.md                        # Full technical spec
├── DESIGN-SUMMARY.md                      # This document
└── src/
    └── skills/
        └── GoogleWorkspace/               # TitleCase MANDATORY
            ├── SKILL.md                   # Routing + config docs
            └── Workflows/
                ├── Gmail.md               # Email operations
                ├── Calendar.md            # Calendar operations
                └── Drive.md               # Drive operations
```

**Critical:** No Tools/ directory (MCP server provides tools).

---

### 3. Configuration Boundary

**Two separate configurations:**

| Config | Location | Purpose |
|--------|----------|---------|
| **MCP Server** | `~/.claude/settings.json` | MCP server command, OAuth credentials |
| **Skill Wrapper** | `$PAI_DIR/skills/GoogleWorkspace/` | Routing, triggers, workflows |

**User must understand:** They're configuring TWO things, not one.

---

### 4. Credential Locations

**Three storage locations:**

```
$PAI_DIR/.env                          ← Most PAI API keys
~/.claude/settings.json                ← MCP config (Client ID/Secret)
~/.config/google-workspace-mcp/        ← OAuth tokens (managed by MCP server)
```

**Exception to PAI principles:**
- PAI philosophy: "All API keys in .env"
- Reality: MCP server manages OAuth tokens separately
- Documentation must explain this clearly

---

### 5. Progressive Loading (Token Costs)

| Tier | What Loads | When | Cost |
|------|-----------|------|------|
| **0** | CORE skill | SessionStart | ~500 tokens |
| **1** | Skill frontmatter | SessionStart | +50 tokens |
| **2** | Full SKILL.md | Trigger match | +800 tokens |
| **3** | Specific workflow | Route selection | +1200 tokens |

**Total for first email:** 2550 tokens
**Subsequent operations:** 0 tokens (cached)

---

### 6. Workflow Routing Logic

```
User: "Send email to bob@example.com"
    ↓
CORE matches "email" in GoogleWorkspace frontmatter
    ↓
Load GoogleWorkspace/SKILL.md (Tier 2)
    ↓
Route to Workflows/Gmail.md (Tier 3)
    ↓
Call MCP tool: gmail_send_message
    ↓
MCP server executes API call
    ↓
Return result to user
```

---

### 7. MCP Integration Flow

```
Claude Code Start
    ↓
Read settings.json → mcpServers section
    ↓
Spawn MCP server process: npx @modelcontextprotocol/server-google-workspace
    ↓
MCP server checks ~/.config/google-workspace-mcp/credentials.json
    ↓
If missing → OAuth flow on first tool call
    ↓
If present → Load tokens, auto-refresh
    ↓
MCP tools available: gmail_*, calendar_*, drive_*
    ↓
User triggers skill → SKILL.md routes → MCP tool executes
```

---

### 8. Installation Flow

**Phase 1: Pre-Checks**
- Detect existing MCP config
- Check for conflicting skill files
- Check for existing OAuth tokens

**Phase 2: Install Skill**
- Copy src/skills/GoogleWorkspace/ to $PAI_DIR/skills/

**Phase 3: Configure MCP**
- Add (or merge) mcpServers config to settings.json
- Provide Client ID/Secret from Google Cloud Console

**Phase 4: OAuth Setup**
- Run first command
- User authorizes in browser
- Tokens saved to ~/.config/google-workspace-mcp/

**Phase 5: Verify**
- Check MCP tools available
- Test skill routing
- Test email/calendar/drive operations

---

### 9. Verification Checklist (10 Steps)

1. Skill files installed ($PAI_DIR/skills/GoogleWorkspace/)
2. MCP configured (settings.json)
3. OAuth credentials present (~/.config/google-workspace-mcp/)
4. Claude Code restarted
5. MCP tools available
6. Skill activation test ("check my Gmail")
7. Send email test
8. Calendar list test
9. Drive search test
10. Observability check (hooks captured events)

---

### 10. What Makes This Different

**vs. Direct MCP Usage:**
- Natural language triggers (no need to remember tool names)
- Workflow documentation (examples + patterns)
- PAI integration (history, observability)

**vs. Custom Implementation:**
- 0 lines of code (vs ~2000)
- No OAuth flow to maintain
- MCP server handles token refresh
- Lower maintenance burden

**vs. Other BobPacks:**
- Telos: Data-driven (files in data/)
- Browser: Code-driven (Tools/ directory)
- GoogleWorkspace: MCP-driven (external server)

---

## Architectural Decisions

### 1. MCP Wrapper vs Standalone
**Choice:** MCP Wrapper
**Reason:** Official server exists, reduces maintenance

### 2. Credential Storage
**Choice:** Document MCP location (~/.config/), NOT in PAI
**Reason:** MCP server manages OAuth, storing elsewhere breaks refresh

### 3. Settings Location
**Choice:** ~/.claude/settings.json (standard MCP config)
**Reason:** Claude Code reads mcpServers from this location

### 4. No Tools/ Directory
**Choice:** Only Workflows/ directory
**Reason:** MCP server provides tools, wrapper only documents usage

### 5. TitleCase Naming
**Choice:** GoogleWorkspace (exact case)
**Reason:** MANDATORY for PAI skill routing

---

## Implementation Checklist

### Core Documentation
- [ ] README.md (problem, solution, architecture)
- [ ] ARCHITECTURE.md (complete technical spec)
- [ ] DESIGN-SUMMARY.md (this document)

### Skill Files
- [ ] SKILL.md (frontmatter + routing table)
- [ ] Workflows/Gmail.md (send, read, search)
- [ ] Workflows/Calendar.md (list, create, update)
- [ ] Workflows/Drive.md (list, upload, download, search)

### Installation
- [ ] INSTALL.md (pre-checks, MCP config, OAuth)
- [ ] VERIFY.md (10-step checklist)
- [ ] Conflict resolution documentation
- [ ] OAuth troubleshooting guide

### Integration Documentation
- [ ] Credential locations (3 different places)
- [ ] Settings.json merge strategy
- [ ] Observability integration (hooks)
- [ ] History integration (captured events)

---

## Edge Cases Documented

1. **Multiple Google Accounts:** Document account switching
2. **OAuth Token Expiry:** Auto-refresh, or delete credentials
3. **Scope Modifications:** Update settings.json, re-auth
4. **MCP Server Updates:** npx -y auto-updates (or pin version)
5. **Offline Usage:** Graceful failure (Google APIs require internet)

---

## Success Criteria

1. Clear installation path (INSTALL.md is foolproof)
2. Natural language routing works ("send email")
3. OAuth setup documented (where credentials live)
4. MCP vs PAI boundary clear (two separate configs)
5. Token cost reasonable (Tier 1 under 50 tokens)
6. Workflows helpful (copy-paste MCP tool examples)
7. Troubleshooting covers common issues
8. Consistent with other BobPacks

---

## Next Actions

### For Mario (Implementation)
Create the actual pack files:
1. README.md (following PAIPackTemplate.md)
2. INSTALL.md (with pre-checks + MCP config)
3. SKILL.md (routing table + triggers)
4. 3 workflow files (Gmail, Calendar, Drive)
5. VERIFY.md (10-step checklist)

### For Riker (Testing)
Test on multiple scenarios:
1. Clean system (no MCP)
2. Existing MCP servers
3. OAuth flow
4. Token expiry handling
5. Skill routing accuracy

### For Howard (Documentation Review)
Polish for clarity:
1. Installation steps are clear
2. Diagrams where helpful
3. Terminology consistent
4. Examples realistic

### For Bob Prime (Architectural Review)
Validate alignment:
1. PAI principles followed
2. Security best practices
3. Credential storage documented
4. Consistency with existing BobPacks

---

## File Dependencies

**ARCHITECTURE.md** → Complete technical specification (this is the blueprint)

**This document (DESIGN-SUMMARY.md)** → High-level overview for quick reference

**All other files** → Implement based on ARCHITECTURE.md

---

## Key References

- **PAI Pack Template:** `/home/bob/projects/Bob2.0/Tools/PAIPackTemplate.md`
- **Existing MCP Wrapper:** `/home/bob/projects/Bob2.0/Deprecated/bob-vikunja-skill/` (reference for MCP config patterns)
- **BobPack Example:** `/home/bob/projects/Bob2.0/BobPacks/bob-telos-skill/` (reference for structure)
- **Browser Skill:** `/home/bob/projects/Bob2.0/Packs/pai-browser-skill/` (reference for "what makes different" section)

---

## Workflow File Pattern

Each workflow file (Gmail.md, Calendar.md, Drive.md) follows this structure:

```markdown
# [Service] Operations

## [Operation Name]

**User request:** "[Natural language example]"

**Process:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**MCP Tool:**
```json
{
  "name": "[tool_name]",
  "input": {
    "param1": "value1"
  }
}
```

**Expected Output:**
- [Output field 1]
- [Output field 2]

**Error Handling:**
- [Common error 1] → [Solution]
```

Pattern ensures consistency and provides copy-paste examples.

---

## Settings.json Merge Strategy

**If user has no mcpServers:**
```json
{
  "mcpServers": {
    "google-workspace": { ... }
  }
}
```

**If user has existing mcpServers:**
```json
{
  "mcpServers": {
    "existing-server": { ... },
    "google-workspace": { ... }  ← Add this
  }
}
```

INSTALL.md must document both scenarios with clear merge instructions.

---

## Token Cost Comparison

| Approach | Session Start | First Email | Maintenance |
|----------|--------------|-------------|-------------|
| **Direct MCP** | 550 | 0 | None (no docs) |
| **MCP Wrapper** | 550 | +2000 | Low (docs only) |
| **Custom Code** | 550 | +5000 | High (code updates) |

Wrapper balances documentation value vs token cost.

---

## OAuth Flow Documentation

**Step 1:** Create OAuth app in Google Cloud Console
- Enable Gmail/Calendar/Drive APIs
- Create OAuth 2.0 credentials
- Add redirect URI: http://localhost:8080/oauth2callback

**Step 2:** Add credentials to settings.json
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_SCOPES (comma-separated)

**Step 3:** Run first command
- Claude Code invokes MCP tool
- MCP server starts OAuth flow
- Browser opens for user authorization
- Tokens saved to ~/.config/google-workspace-mcp/

**Step 4:** Verify
- Tokens persist between sessions
- MCP server auto-refreshes access token
- To reset: delete credentials.json, re-run command

---

## Observability Integration

PAI hooks automatically capture MCP operations:

**PreToolUse hook:**
- Logs tool name (gmail_send_message)
- Logs tool input (to, subject, body)
- Timestamp
- Session ID

**PostToolUse hook:**
- Logs tool output (message ID, success)
- Duration
- Errors (if any)

**Stored in:**
```
$PAI_DIR/history/raw-outputs/YYYY-MM/YYYY-MM-DD_all-events.jsonl
```

User can search history: `grep "gmail_send_message" $PAI_DIR/history/raw-outputs/*/`

---

## Security Considerations

| Item | Location | Protection |
|------|----------|------------|
| Client ID/Secret | settings.json | File permissions (600) |
| OAuth Tokens | ~/.config/google-workspace-mcp/ | MCP server manages |
| Scopes | settings.json (documented) | User controls access level |

**Best practices:**
- Never commit settings.json to repos
- Document where credentials live
- Explain scope implications
- Provide revocation instructions

---

*Design complete. Ready for implementation.*

*Bill (Bob-4): "The architecture is sound. Now we implement."*
