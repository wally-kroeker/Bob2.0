# Google Workspace Skill - Architecture Specification

**Version:** 1.0.0
**Type:** MCP Wrapper (Option A)
**Author:** Bill (Bob-4) - The Architect
**Date:** 2026-01-13

---

## Executive Summary

The `bob-google-workspace-skill` is an **MCP wrapper pack** that provides PAI-integrated access to Google Workspace services (Gmail, Calendar, Drive) through the official Google Workspace MCP server. This is NOT a standalone implementation - it's a structured skill layer that routes Claude Code operations through an externally-configured MCP server.

**Critical Distinction:** This pack provides SKILL.md routing and documentation. The actual MCP server configuration lives in `~/.claude/settings.json` (or `$PAI_DIR/settings.json`) and is managed by the user during installation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code Session                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ CORE Skill Routing (Tier 0 - Auto-loaded)              │  │
│  │ - Reads all skill frontmatter at SessionStart          │  │
│  │ - Matches user intent to triggers                      │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│                 │ Trigger: "email", "calendar", "drive"         │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ GoogleWorkspace Skill (Tier 2 - Loaded on trigger)     │  │
│  │                                                          │  │
│  │ SKILL.md:                                               │  │
│  │  - USE WHEN triggers                                    │  │
│  │  - Workflow routing table                               │  │
│  │  - MCP integration docs                                 │  │
│  │  - OAuth credential location                            │  │
│  │                                                          │  │
│  │ Workflows/:                                              │  │
│  │  ├── Gmail.md      (send, read, search)                 │  │
│  │  ├── Calendar.md   (create, list, update events)        │  │
│  │  └── Drive.md      (list, upload, download, search)     │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│                 │ Routes to MCP tool calls                       │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Claude Code MCP System (Built-in)                      │  │
│  │ - Reads mcpServers config from settings.json           │  │
│  │ - Invokes google-workspace MCP server                   │  │
│  └──────────────┬───────────────────────────────────────────┘  │
└─────────────────┼────────────────────────────────────────────┘
                  │
                  │ MCP Protocol (stdio or SSE)
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│           Google Workspace MCP Server (External)                │
│                                                                   │
│  Configuration: ~/.claude/settings.json                         │
│                                                                   │
│  {                                                               │
│    "mcpServers": {                                               │
│      "google-workspace": {                                       │
│        "command": "npx",                                         │
│        "args": ["-y", "@modelcontextprotocol/..."],             │
│        "env": {                                                  │
│          "GOOGLE_CLIENT_ID": "...",                             │
│          "GOOGLE_CLIENT_SECRET": "...",                         │
│          "GOOGLE_REDIRECT_URI": "...",                          │
│          "GOOGLE_SCOPES": "gmail.send,calendar.events,..."      │
│        }                                                         │
│      }                                                           │
│    }                                                             │
│  }                                                               │
│                                                                   │
│  Credentials: ~/.config/google-workspace-mcp/credentials.json  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Google OAuth 2.0
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Google Workspace APIs                       │
│  - Gmail API                                                     │
│  - Calendar API                                                  │
│  - Drive API                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. **MCP Wrapper Pattern**

This pack does NOT implement Google Workspace integration - it wraps an existing MCP server:

| What This Pack Provides | What It Does NOT Provide |
|------------------------|-------------------------|
| SKILL.md routing triggers | OAuth flow implementation |
| Workflow documentation | API request/response handling |
| Installation checklist | MCP server code |
| Usage examples | Credential storage logic |
| Troubleshooting guide | Network communication |

**Why this matters:** Users must understand they're configuring TWO things:
1. **The MCP server** (in `settings.json`, managed by Claude Code)
2. **The skill wrapper** (in `$PAI_DIR/skills/`, managed by PAI)

### 2. **Credential Location Documentation**

Critical distinction from other packs:

```
$PAI_DIR/.env                    ← Most PAI API keys live here
~/.claude/settings.json          ← MCP server config lives here
~/.config/google-workspace-mcp/  ← OAuth tokens live here (MCP server manages)
```

**Installation must document:**
- Where OAuth credentials are stored (NOT in PAI)
- How to run OAuth flow (MCP server's responsibility)
- When to refresh tokens (automatic if MCP server is well-implemented)

### 3. **Progressive Context Loading**

Follows PAI's 4-tier system:

| Tier | What Loads | When | Token Cost |
|------|-----------|------|-----------|
| **Tier 0** | CORE skill | SessionStart | ~500 tokens |
| **Tier 1** | Skill frontmatter only | SessionStart | ~50 tokens |
| **Tier 2** | Full SKILL.md | User says "email" / "calendar" | ~800 tokens |
| **Tier 3** | Specific workflow (Gmail.md) | Skill routes to workflow | ~1200 tokens |

**Total cost:**
- Session start: 550 tokens (CORE + all skill frontmatter)
- First email operation: +2000 tokens (SKILL.md + Gmail.md workflow)
- Subsequent operations: 0 tokens (skill already loaded)

Compare to browser MCP (~13,700 tokens at startup).

### 4. **No Code Implementation**

This pack contains ZERO executable code beyond documentation:

```
bob-google-workspace-skill/
├── README.md                    # Pack overview
├── INSTALL.md                   # Step-by-step with MCP config
├── VERIFY.md                    # Test MCP connection + skill routing
└── src/
    └── skills/
        └── GoogleWorkspace/     # TitleCase MANDATORY
            ├── SKILL.md         # Routing + triggers
            └── Workflows/
                ├── Gmail.md
                ├── Calendar.md
                └── Drive.md
```

**No Tools/ directory** - MCP server provides the tools.

---

## Directory Structure

### Full Layout

```
BobPacks/bob-google-workspace-skill/
├── README.md                              # Frontmatter, problem/solution, architecture
├── INSTALL.md                             # Pre-checks, MCP config, OAuth setup
├── VERIFY.md                              # 10-step verification checklist
├── ARCHITECTURE.md                        # This document
└── src/
    └── skills/
        └── GoogleWorkspace/               # TitleCase MANDATORY
            ├── SKILL.md                   # Routing + config docs
            └── Workflows/
                ├── Gmail.md               # Email operations
                ├── Calendar.md            # Calendar operations
                └── Drive.md               # Drive operations
```

### File Purposes

| File | Purpose | Key Sections |
|------|---------|-------------|
| **README.md** | Pack overview for humans | Problem, Solution, "What Makes This Different" |
| **INSTALL.md** | Installation wizard for AI | Pre-checks, MCP config template, OAuth flow |
| **VERIFY.md** | Post-install checklist | MCP connection test, skill activation test |
| **SKILL.md** | Skill routing for Claude | Frontmatter triggers, workflow routing, MCP docs |
| **Gmail.md** | Email workflow | Send, read, search, filter examples |
| **Calendar.md** | Calendar workflow | Create, list, update, delete events |
| **Drive.md** | Drive workflow | List, upload, download, search files |

---

## SKILL.md Structure

### Frontmatter (Tier 1 - Loaded at SessionStart)

```yaml
---
name: GoogleWorkspace
description: |
  Google Workspace integration via MCP (Gmail, Calendar, Drive).
  USE WHEN user wants to send email, check calendar, manage Google Drive files,
  search inbox, schedule meetings, or work with Google Workspace services.
---
```

**Critical fields:**
- `name:` Must be TitleCase (`GoogleWorkspace` not `google-workspace`)
- `description:` Must include **"USE WHEN"** triggers for CORE routing
- Keep under 128 words to minimize Tier 1 token cost

### Body Structure (Tier 2 - Loaded on trigger)

```markdown
# GoogleWorkspace Skill

## When to Activate This Skill

User mentions:
- Gmail: "send email", "check inbox", "search for email from"
- Calendar: "check my calendar", "schedule meeting", "what's on my calendar"
- Drive: "upload to Drive", "search Drive for", "download from Drive"

## MCP Server Configuration

**Type:** stdio MCP Server (external)
**Package:** `@modelcontextprotocol/server-google-workspace`
**Config Location:** `~/.claude/settings.json` (mcpServers section)
**Credentials Location:** `~/.config/google-workspace-mcp/credentials.json`

### Settings Template

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-workspace"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
        "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive"
      }
    }
  }
}
```

### OAuth Setup

See INSTALL.md for complete OAuth setup steps.

Quick reference:
1. Create OAuth app in Google Cloud Console
2. Add credentials to settings.json
3. Run first command to trigger OAuth flow
4. Tokens stored automatically in ~/.config/google-workspace-mcp/

## Workflow Routing

| User Intent | Route To | MCP Tools Used |
|------------|----------|---------------|
| Send email | Workflows/Gmail.md | gmail_send_message |
| Read inbox | Workflows/Gmail.md | gmail_list_messages |
| Search email | Workflows/Gmail.md | gmail_search_messages |
| Check calendar | Workflows/Calendar.md | calendar_list_events |
| Schedule meeting | Workflows/Calendar.md | calendar_create_event |
| Upload to Drive | Workflows/Drive.md | drive_upload_file |
| Search Drive | Workflows/Drive.md | drive_search_files |

## Integration with PAI

### Security Notes

- **OAuth credentials NOT in $PAI_DIR/.env** - MCP manages credentials separately
- **No API keys to manage** - OAuth tokens refresh automatically
- **Scopes documented** in settings.json for transparency

### Observability

MCP tool calls captured by pai-hook-system:
- PreToolUse hook logs tool name + input
- PostToolUse hook logs tool output
- Captured in $PAI_DIR/history/raw-outputs/

### Memory/History

Email operations captured automatically:
- Email sent → logged to history/execution/features/
- Calendar event created → logged to history/sessions/
- Drive operations → standard tool output capture

## Troubleshooting

### MCP Not Connected

Check MCP server status in Claude Code:
- Look for "google-workspace" in available tools
- Restart Claude Code after settings.json changes

Verify configuration:
```bash
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]'
```

### OAuth Expired

MCP server should auto-refresh. If not:
1. Delete ~/.config/google-workspace-mcp/credentials.json
2. Restart Claude Code
3. Run any Google Workspace command to re-trigger OAuth

### Skill Not Routing

Check skill is installed:
```bash
ls -la $PAI_DIR/skills/GoogleWorkspace/SKILL.md
```

Verify CORE skill loaded (check session start messages).
```

---

## Workflow File Structure

### Gmail.md (Example)

```markdown
# Gmail Operations

## Send Email

**User request:** "Send an email to user@example.com"

**Process:**
1. Confirm recipient, subject, body
2. Call MCP tool: `gmail_send_message`
3. Confirm sent, provide message ID

**MCP Tool:**
```json
{
  "name": "gmail_send_message",
  "input": {
    "to": "user@example.com",
    "subject": "Subject line",
    "body": "Email body",
    "cc": [],
    "bcc": []
  }
}
```

**Expected Output:**
- Message ID
- Sent timestamp
- Thread ID

## Read Inbox

**User request:** "What's in my inbox?"

**Process:**
1. Call MCP tool: `gmail_list_messages` with maxResults: 10
2. Format output as readable list
3. Offer to read specific messages

**MCP Tool:**
```json
{
  "name": "gmail_list_messages",
  "input": {
    "maxResults": 10,
    "query": ""
  }
}
```

[Continue for Search, Filter, etc.]
```

**Pattern for all workflows:**
- User-centric language ("User requests", not "Function does")
- MCP tool JSON examples (copy-paste ready)
- Expected outputs documented
- Error handling noted

---

## Installation Integration Points

### Pre-Installation System Check

Before installing, detect:

```bash
# 1. Check if MCP already configured
if grep -q '"google-workspace"' ~/.claude/settings.json 2>/dev/null; then
  echo "⚠️  google-workspace MCP already configured"
  echo "Action: Merge or replace"
fi

# 2. Check for OAuth credentials
if [ -d ~/.config/google-workspace-mcp ]; then
  echo "⚠️  OAuth credentials exist"
  echo "Action: Backup before re-auth"
fi

# 3. Check for conflicting skill names
if [ -f "$PAI_DIR/skills/GoogleWorkspace/SKILL.md" ]; then
  echo "⚠️  GoogleWorkspace skill already exists"
  echo "Action: Backup and replace"
fi
```

### Conflict Resolution Matrix

| Scenario | Existing State | Action |
|----------|---------------|--------|
| **Clean install** | No MCP, no skill | Proceed with full installation |
| **MCP exists** | settings.json has google-workspace | Compare configs, merge if different |
| **Skill exists** | $PAI_DIR/skills/GoogleWorkspace/ present | Backup, compare versions, replace |
| **OAuth exists** | ~/.config/google-workspace-mcp/ present | Preserve unless re-auth needed |

### Installation Steps (High-Level)

1. **Pre-Installation Checks** (detect existing config)
2. **Install Skill Files** (copy to $PAI_DIR/skills/GoogleWorkspace/)
3. **Configure MCP Server** (add to settings.json, may require merge)
4. **OAuth Setup** (interactive - user must authorize in browser)
5. **Verify Installation** (test MCP connection + skill routing)

---

## Verification Checklist Structure

### 10-Step Verification (VERIFY.md)

```markdown
# GoogleWorkspace Skill - Verification

Complete ALL checks before marking installation successful.

## 1. Skill Files Installed

```bash
ls -la $PAI_DIR/skills/GoogleWorkspace/SKILL.md
ls -la $PAI_DIR/skills/GoogleWorkspace/Workflows/
```

Expected: SKILL.md exists, Workflows/ contains Gmail.md, Calendar.md, Drive.md

## 2. MCP Server Configured

```bash
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]'
```

Expected: JSON object with command, args, env

## 3. OAuth Credentials Present

```bash
ls -la ~/.config/google-workspace-mcp/credentials.json
```

Expected: File exists (created after first OAuth flow)

## 4. Restart Claude Code

Close and reopen Claude Code to load MCP server.

## 5. MCP Tools Available

In new Claude Code session, check available tools include:
- gmail_send_message
- gmail_list_messages
- calendar_list_events
- drive_search_files

## 6. Skill Activation Test

User prompt: "Check my Gmail inbox"

Expected: Skill routes to Gmail.md workflow, calls gmail_list_messages

## 7. Send Test Email

User prompt: "Send a test email to myself"

Expected: Confirms details, sends email, returns message ID

## 8. Calendar List Test

User prompt: "What's on my calendar today?"

Expected: Calls calendar_list_events, returns formatted list

## 9. Drive Search Test

User prompt: "Search my Drive for recent documents"

Expected: Calls drive_search_files, returns results

## 10. Observability Check

Verify hooks captured operations:

```bash
tail -20 $PAI_DIR/history/raw-outputs/$(date +%Y-%m)/$(date +%Y-%m-%d)_all-events.jsonl
```

Expected: See PreToolUse/PostToolUse events for gmail_*, calendar_*, drive_* tools

---

## All checks passed?

- [ ] Skill files installed
- [ ] MCP configured
- [ ] OAuth completed
- [ ] Claude Code restarted
- [ ] MCP tools available
- [ ] Skill routes correctly
- [ ] Email operations work
- [ ] Calendar operations work
- [ ] Drive operations work
- [ ] Hooks capturing events

**If all checked:** Installation complete ✓
```

---

## OAuth Credential Documentation Strategy

### Where Credentials Live

```
~/.config/google-workspace-mcp/
├── credentials.json         # OAuth tokens (access + refresh)
└── .gitignore               # Prevent accidental commit
```

**Critical documentation:**

1. **In INSTALL.md:**
   - Step-by-step OAuth flow (user clicks link, authorizes, tokens saved)
   - Where tokens are stored (NOT in PAI directories)
   - How to revoke/refresh (delete file, re-run command)

2. **In SKILL.md:**
   - Quick reference: "Credentials managed by MCP server at ~/.config/google-workspace-mcp/"
   - Troubleshooting: "Delete credentials.json to force re-auth"

3. **In README.md:**
   - High-level: "OAuth handled by MCP server, tokens stored outside PAI"
   - Security note: "Credentials NOT in $PAI_DIR/.env"

### Security Considerations

| Credential Type | Storage Location | Access Control |
|----------------|------------------|----------------|
| OAuth Client ID/Secret | ~/.claude/settings.json | File permissions (600) |
| OAuth Access/Refresh Tokens | ~/.config/google-workspace-mcp/ | MCP server manages |
| PAI API Keys | $PAI_DIR/.env | Single source of truth |

**Why this matters:**
- PAI's philosophy: "All API keys in .env"
- MCP reality: "OAuth tokens managed by MCP server"
- **Solution:** Document the exception clearly, explain why

---

## MCP Integration Architecture

### Settings.json Structure

```json
{
  "env": {
    "DA": "Bob",
    "PAI_DIR": "/home/bob/.claude"
  },
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...]
  },
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-workspace"],
      "env": {
        "GOOGLE_CLIENT_ID": "...",
        "GOOGLE_CLIENT_SECRET": "...",
        "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
        "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,..."
      }
    }
  }
}
```

**Key points:**
- MCP config is PARALLEL to hooks, not nested
- Merge carefully if user has existing mcpServers
- npx ensures MCP server auto-updates (or pin version with @x.y.z)

### MCP Server Lifecycle

```
Claude Code Start
    ↓
Read settings.json
    ↓
Spawn MCP server process (npx command)
    ↓
MCP server checks for credentials
    ↓
If missing → OAuth flow on first tool call
    ↓
If present → Load tokens, refresh if needed
    ↓
MCP tools available in Claude Code session
    ↓
User invokes tool → MCP server executes → Returns result
    ↓
Claude Code Stop → MCP server process terminates
```

**Documentation must clarify:**
- MCP server is **not a daemon** (starts/stops with Claude Code)
- OAuth only happens ONCE (tokens persist between sessions)
- Restart Claude Code after settings.json changes

---

## Workflow Routing Logic

### Trigger Matching (Tier 1 → Tier 2)

```
User: "Send an email to john@example.com"
    ↓
CORE skill reads all skill frontmatter
    ↓
Matches "email" trigger in GoogleWorkspace description
    ↓
Loads $PAI_DIR/skills/GoogleWorkspace/SKILL.md (Tier 2)
    ↓
Routes to Gmail workflow
```

### Workflow Selection (Tier 2 → Tier 3)

```
SKILL.md routing table:
| User Intent | Route To |
| "send email" | Workflows/Gmail.md |
| "check calendar" | Workflows/Calendar.md |
| "search drive" | Workflows/Drive.md |
    ↓
Loads Workflows/Gmail.md (Tier 3)
    ↓
Executes MCP tool: gmail_send_message
```

### Example Decision Tree

```
User intent: Email-related?
├─ Yes → Load GoogleWorkspace skill
│   ├─ Send? → Gmail.md (send_message)
│   ├─ Read? → Gmail.md (list_messages)
│   └─ Search? → Gmail.md (search_messages)
└─ No → Check other skills

User intent: Calendar-related?
├─ Yes → Load GoogleWorkspace skill
│   ├─ List? → Calendar.md (list_events)
│   ├─ Create? → Calendar.md (create_event)
│   └─ Update? → Calendar.md (update_event)
└─ No → Check other skills
```

---

## What Makes This Different

### vs. Direct MCP Usage

**Without this skill pack:**
- User configures MCP in settings.json
- Tools available but no routing/documentation
- Must remember exact tool names
- No workflow patterns

**With this skill pack:**
- Natural language triggers ("send email")
- Workflow documentation (how to compose email)
- Integration with PAI systems (history, observability)
- Troubleshooting guide

### vs. Custom Implementation

**Custom implementation would require:**
- OAuth flow code
- Gmail API request/response handling
- Calendar API integration
- Drive API integration
- Token refresh logic
- Error handling
- ~2000 lines of code

**MCP wrapper requires:**
- SKILL.md routing (80 lines)
- Workflow docs (200 lines total)
- Installation guide
- 0 lines of executable code

**Token cost comparison:**

| Approach | Session Start | First Use | Maintenance |
|----------|--------------|-----------|-------------|
| Custom implementation | ~500 tokens | +5000 tokens | High (code updates) |
| MCP wrapper | ~550 tokens | +2000 tokens | Low (docs only) |

### vs. Other BobPacks

**Telos skill (data-driven):**
- Data files in data/ directory
- SKILL.md reads files, formats output
- No external dependencies

**Google Workspace skill (MCP wrapper):**
- No data files
- SKILL.md routes to MCP server
- External dependency (MCP server + OAuth)

**Browser skill (code-driven):**
- Tools/ directory with TypeScript
- SKILL.md invokes CLI tools
- Self-contained (no external servers)

---

## Edge Cases & Considerations

### 1. Multiple Google Accounts

**Problem:** User has multiple Google accounts (personal + work)

**Solution (document in INSTALL.md):**
- MCP server OAuth flow selects ONE account
- To switch accounts: delete credentials, re-auth
- For multi-account: consider separate MCP server configs (advanced)

### 2. OAuth Token Expiry

**Problem:** Access token expires (short-lived)

**Solution:**
- MCP server should auto-refresh using refresh token
- If fails: delete credentials.json, re-auth
- Document in troubleshooting section

### 3. Scope Modifications

**Problem:** User wants additional Gmail scopes (e.g., gmail.modify)

**Solution:**
- Update GOOGLE_SCOPES in settings.json
- Delete credentials.json (forces re-auth with new scopes)
- Restart Claude Code

### 4. MCP Server Updates

**Problem:** @modelcontextprotocol/server-google-workspace releases new version

**Solution (using npx -y):**
- npx downloads latest version automatically
- Pro: Always up-to-date
- Con: Breaking changes possible
- Alternative: Pin version with @x.y.z

### 5. Offline Usage

**Problem:** User has no internet connection

**Solution:**
- MCP server requires internet (Google APIs are cloud-based)
- Skill gracefully fails with "MCP server unavailable"
- Document limitation in README.md

---

## Implementation Checklist

### Phase 1: Core Documentation
- [ ] README.md (problem, solution, architecture, "What Makes This Different")
- [ ] ARCHITECTURE.md (this document)
- [ ] SKILL.md frontmatter (triggers)
- [ ] SKILL.md body (MCP config, routing table)

### Phase 2: Workflows
- [ ] Workflows/Gmail.md (send, read, search)
- [ ] Workflows/Calendar.md (list, create, update, delete)
- [ ] Workflows/Drive.md (list, upload, download, search)

### Phase 3: Installation & Verification
- [ ] INSTALL.md (pre-checks, MCP config, OAuth flow)
- [ ] VERIFY.md (10-step checklist)
- [ ] Conflict resolution scripts
- [ ] OAuth troubleshooting guide

### Phase 4: Integration
- [ ] Document credential locations (settings.json vs .env)
- [ ] Document observability integration (hooks capture MCP calls)
- [ ] Document history integration (email ops logged)

### Phase 5: Quality Assurance
- [ ] TitleCase verification (GoogleWorkspace/ not google-workspace/)
- [ ] Token cost estimation (Tier 1/2/3 documented)
- [ ] Edge case documentation (multi-account, token expiry, etc.)
- [ ] Compare to existing BobPacks for consistency

---

## Token Cost Analysis

### Progressive Loading Breakdown

**SessionStart (Tier 0 + Tier 1):**
```
CORE skill: ~500 tokens
All skill frontmatter (including GoogleWorkspace): ~50 tokens
Total: 550 tokens
```

**First Gmail Operation (Tier 2 + Tier 3):**
```
SKILL.md full body: ~800 tokens
Workflows/Gmail.md: ~1200 tokens
Total: +2000 tokens
```

**Subsequent Gmail Operations:**
```
Skill already loaded: 0 tokens
Workflow already loaded: 0 tokens
Total: 0 tokens
```

**Switching to Calendar (Tier 3 only):**
```
SKILL.md already loaded: 0 tokens
Workflows/Calendar.md: ~1200 tokens
Total: +1200 tokens
```

### Comparison to Alternatives

| Approach | Initial | First Email | First Calendar | Total (Email + Calendar) |
|----------|---------|-------------|----------------|-------------------------|
| **MCP Wrapper (this)** | 550 | +2000 | +1200 | 3750 tokens |
| **Direct MCP** | 550 | 0 | 0 | 550 tokens (no docs) |
| **Custom Code in Context** | 550 | +5000 | +3000 | 8550 tokens |

**Trade-offs:**
- Direct MCP: Minimal tokens but no routing/docs
- MCP Wrapper: Moderate tokens, natural language + docs
- Custom Code: High tokens, full control but maintenance burden

---

## Success Criteria

This pack is successful if:

1. **Installation is clear:** User can go from "no Google Workspace" to "sent first email" following INSTALL.md
2. **Natural language works:** "Send an email to bob@example.com" routes correctly
3. **OAuth is documented:** User understands where credentials live and how to refresh
4. **MCP vs PAI boundary is clear:** User knows what's MCP config vs skill config
5. **Token cost is reasonable:** Tier 1 frontmatter stays under 50 tokens
6. **Workflows are helpful:** Examples in Gmail.md/Calendar.md/Drive.md are copy-paste ready
7. **Troubleshooting works:** Common issues (MCP not connected, OAuth expired) have solutions
8. **Consistent with BobPacks:** Follows same structure as bob-telos-skill, bob-financial-system-skill

---

## Next Steps

### For Implementation (Mario)

1. Use this ARCHITECTURE.md as blueprint
2. Create README.md following PAIPackTemplate.md
3. Create INSTALL.md with pre-checks and MCP config steps
4. Create SKILL.md with routing table and MCP docs
5. Create 3 workflow files (Gmail.md, Calendar.md, Drive.md)
6. Create VERIFY.md with 10-step checklist

### For Testing (Riker)

1. Test installation on clean system (no MCP configured)
2. Test installation on system with existing MCP servers
3. Verify OAuth flow works
4. Verify skill routing triggers correctly
5. Verify workflows have correct MCP tool names
6. Test edge cases (token expiry, account switching)

### For Documentation (Howard)

1. Review for clarity (INSTALL.md must be foolproof)
2. Add diagrams if helpful (OAuth flow, routing flow)
3. Ensure terminology is consistent
4. Check examples are realistic

### For Review (Bob Prime)

1. Verify architecture aligns with PAI principles
2. Check credential storage follows security best practices
3. Ensure MCP boundary is clearly documented
4. Validate against existing BobPacks for consistency

---

## Architectural Decisions

### Decision 1: MCP Wrapper vs Standalone

**Choice:** MCP Wrapper (Option A)

**Rationale:**
- Google Workspace APIs are complex (OAuth, pagination, error handling)
- Official MCP server exists and is maintained
- Reduces maintenance burden (no API code to update)
- Token cost comparable to standalone once loaded

**Trade-off:** External dependency on MCP server package

---

### Decision 2: Credential Storage Location

**Choice:** Document MCP server's storage (~/.config/google-workspace-mcp/), NOT in PAI

**Rationale:**
- MCP server manages OAuth flow and token refresh
- Storing tokens in $PAI_DIR/.env would break MCP server's refresh logic
- Clear separation: PAI keys in .env, OAuth tokens in MCP location

**Trade-off:** Exception to PAI's "single source of truth" principle

---

### Decision 3: Settings.json vs PAI Config

**Choice:** MCP config lives in ~/.claude/settings.json

**Rationale:**
- Claude Code reads mcpServers from settings.json (built-in behavior)
- Moving to PAI config would require custom integration
- Keep MCP configuration in standard location

**Trade-off:** Two config files to manage (settings.json + .env)

---

### Decision 4: TitleCase Naming

**Choice:** GoogleWorkspace (not google-workspace or Google-Workspace)

**Rationale:**
- PAI skill routing requires exact TitleCase match
- Consistent with upstream packs (CreateSkill, not create-skill)
- MANDATORY for skill system to work

**Trade-off:** None (hard requirement)

---

### Decision 5: No Tools/ Directory

**Choice:** Only Workflows/, no Tools/ directory

**Rationale:**
- MCP server provides the tools (gmail_send_message, etc.)
- No CLI tools needed (unlike Browser skill)
- Workflows document HOW to use MCP tools

**Trade-off:** None (wrapper pattern doesn't need Tools/)

---

## Appendix: MCP Server Research

### Official Google Workspace MCP Server

**Package:** `@modelcontextprotocol/server-google-workspace` (or similar - verify actual package name)

**Features (expected):**
- OAuth 2.0 flow
- Gmail: send, list, search, read messages
- Calendar: list, create, update, delete events
- Drive: list, search, upload, download files
- Token refresh handling

**Installation:**
```bash
npx -y @modelcontextprotocol/server-google-workspace
```

**Configuration (example):**
```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-workspace"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
        "GOOGLE_SCOPES": "gmail.send,calendar.events,drive.file"
      }
    }
  }
}
```

**Notes:**
- Verify actual package name before implementation
- Check MCP server docs for latest OAuth flow
- Test token refresh behavior
- Confirm supported scopes

---

## End of Architecture Specification

**Status:** Ready for implementation
**Next Action:** Mario to implement pack files based on this spec
**Review Required:** Bob Prime for architectural alignment

---

*Generated by Bill (Bob-4) - The Architect*
*"Before we write a single line, let's diagram the component dependencies."*
