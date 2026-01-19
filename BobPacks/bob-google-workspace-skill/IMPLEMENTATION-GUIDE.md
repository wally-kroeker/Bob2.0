# GoogleWorkspace Skill - Implementation Guide

**For:** Mario (implementation), Riker (testing), Howard (docs review), Bob Prime (architecture review)
**Created by:** Bill (Bob-4) - The Architect
**Date:** 2026-01-13

---

## Quick Start

This directory contains the **complete architectural specification** for the `bob-google-workspace-skill` MCP wrapper pack. All design decisions are documented. Implementation is straightforward - follow the specs.

---

## What's Already Done (Architecture Phase)

✓ **ARCHITECTURE.md** - Complete technical specification (21,000+ words)
✓ **DESIGN-SUMMARY.md** - High-level overview for quick reference
✓ **DIAGRAMS.md** - Visual architecture diagrams (10 diagrams)
✓ **Directory structure** - src/skills/GoogleWorkspace/Workflows/ created

---

## What Needs Implementation

### Phase 1: Core Pack Files (Mario)

#### 1.1 README.md
**Template:** `/home/bob/projects/Bob2.0/Tools/PAIPackTemplate.md`
**Reference:** ARCHITECTURE.md sections:
- Overview (lines 1-50)
- What Makes This Different (lines 750-850)
- Key Architecture Points (lines 100-200)

**Required sections:**
```markdown
---
name: Bob Google Workspace Skill
pack-id: bob-google-workspace-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Google Workspace MCP wrapper with natural language routing...
type: skill
platform: claude-code
dependencies: [pai-core-install]
keywords: [gmail, calendar, drive, google-workspace, mcp, email, ...]
---

# Bob Google Workspace Skill

> Natural language access to Gmail, Calendar, and Drive via MCP wrapper

## What's Included
[Component table from ARCHITECTURE.md line 150]

## The Problem
[From ARCHITECTURE.md "What Makes This Different"]

## The Solution
[MCP wrapper architecture explanation]

## What Makes This Different
[vs Direct MCP, vs Custom Implementation - see ARCHITECTURE.md lines 750-850]

## Installation
See INSTALL.md for step-by-step instructions.

## Verification
See VERIFY.md for verification checklist.

## Credits
...
```

**Estimated time:** 2 hours

---

#### 1.2 INSTALL.md
**Template:** Existing BobPacks (bob-telos-skill/INSTALL.md)
**Reference:** ARCHITECTURE.md lines 400-600

**Required sections:**
```markdown
# GoogleWorkspace Skill - Installation

## Prerequisites
- pai-core-install installed
- Google Cloud Console account
- Bun runtime

## Pre-Installation System Check

### Step 0.1: Detect Current Configuration
[Bash script from ARCHITECTURE.md line 450]

### Step 0.2: Check for Conflicts
[Detection scripts]

### Step 0.3: Conflict Resolution Matrix
[Table from ARCHITECTURE.md]

## Step 1: Install Skill Files
```bash
cp -r src/skills/GoogleWorkspace "$PAI_DIR/skills/"
```

## Step 2: Configure MCP Server

### 2.1: Create Google Cloud OAuth App
1. Go to console.cloud.google.com
2. Create project
3. Enable APIs (Gmail, Calendar, Drive)
4. Create OAuth 2.0 credentials
5. Add redirect URI: http://localhost:8080/oauth2callback
6. Copy Client ID and Client Secret

### 2.2: Update settings.json
[JSON template from ARCHITECTURE.md lines 500-550]
[Merge instructions for existing mcpServers]

## Step 3: OAuth Setup
1. Restart Claude Code
2. Run first command: "Check my Gmail inbox"
3. Browser opens for authorization
4. Tokens saved to ~/.config/google-workspace-mcp/

## Step 4: Verification
See VERIFY.md
```

**Estimated time:** 3 hours

---

#### 1.3 VERIFY.md
**Template:** bob-telos-skill/VERIFY.md
**Reference:** ARCHITECTURE.md lines 850-950

**Required sections:**
```markdown
# GoogleWorkspace Skill - Verification

Complete ALL checks before marking installation successful.

## 1. Skill Files Installed
```bash
ls -la $PAI_DIR/skills/GoogleWorkspace/SKILL.md
```
Expected: File exists

## 2. MCP Server Configured
```bash
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]'
```
Expected: JSON object with command, args, env

[Continue for all 10 checks from ARCHITECTURE.md]

## Checklist
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

## Troubleshooting
[From ARCHITECTURE.md lines 900-950]
```

**Estimated time:** 2 hours

---

### Phase 2: Skill Files (Mario)

#### 2.1 SKILL.md
**Location:** `src/skills/GoogleWorkspace/SKILL.md`
**Reference:** ARCHITECTURE.md lines 250-400

**Structure:**
```yaml
---
name: GoogleWorkspace
description: |
  Google Workspace integration via MCP (Gmail, Calendar, Drive).
  USE WHEN user wants to send email, check calendar, manage Google Drive files,
  search inbox, schedule meetings, or work with Google Workspace services.
---

# GoogleWorkspace Skill

## When to Activate This Skill
[Triggers from ARCHITECTURE.md]

## MCP Server Configuration
[Settings template, OAuth setup - from ARCHITECTURE.md lines 300-350]

## Workflow Routing
| User Intent | Route To | MCP Tools Used |
[Table from ARCHITECTURE.md line 380]

## Integration with PAI
[Security, Observability, History - from ARCHITECTURE.md]

## Troubleshooting
[From ARCHITECTURE.md lines 420-450]
```

**Estimated time:** 2 hours

---

#### 2.2 Workflows/Gmail.md
**Location:** `src/skills/GoogleWorkspace/Workflows/Gmail.md`
**Reference:** ARCHITECTURE.md lines 600-700

**Pattern for each operation:**
```markdown
# Gmail Operations

## Send Email

**User request:** "Send an email to bob@example.com about project update"

**Process:**
1. Confirm recipient, subject, body with user
2. Call MCP tool: gmail_send_message
3. Confirm sent, provide message ID

**MCP Tool:**
```json
{
  "name": "gmail_send_message",
  "input": {
    "to": "bob@example.com",
    "subject": "Project Update",
    "body": "Email body here",
    "cc": [],
    "bcc": []
  }
}
```

**Expected Output:**
- messageId: "abc123..."
- threadId: "thread123..."
- sent: true

**Error Handling:**
- Invalid email address → Ask user to verify
- Auth expired → Trigger re-auth (delete credentials.json)
- Network error → Retry or report failure

---

## Read Inbox

[Same pattern for list_messages]

## Search Email

[Same pattern for search_messages]
```

**Operations to document:**
- Send Email (gmail_send_message)
- Read Inbox (gmail_list_messages)
- Search Email (gmail_search_messages)
- Read Specific Message (gmail_get_message)

**Estimated time:** 3 hours

---

#### 2.3 Workflows/Calendar.md
**Location:** `src/skills/GoogleWorkspace/Workflows/Calendar.md`
**Pattern:** Same as Gmail.md

**Operations to document:**
- List Events (calendar_list_events)
- Create Event (calendar_create_event)
- Update Event (calendar_update_event)
- Delete Event (calendar_delete_event)

**Estimated time:** 2 hours

---

#### 2.4 Workflows/Drive.md
**Location:** `src/skills/GoogleWorkspace/Workflows/Drive.md`
**Pattern:** Same as Gmail.md

**Operations to document:**
- List Files (drive_list_files)
- Search Files (drive_search_files)
- Upload File (drive_upload_file)
- Download File (drive_download_file)

**Estimated time:** 2 hours

---

## Phase 3: Testing (Riker)

### Test Scenarios

#### 3.1 Clean Installation Test
**System:** Fresh Ubuntu VM with Claude Code + PAI
**Steps:**
1. No existing MCP configuration
2. Follow INSTALL.md exactly
3. Document any unclear steps
4. Verify all 10 checks in VERIFY.md pass
5. Test each workflow operation

**Expected:** Smooth installation, all operations work

---

#### 3.2 Conflict Test
**System:** Existing Claude Code with other MCP servers
**Steps:**
1. Pre-configure with Vikunja MCP (or similar)
2. Follow INSTALL.md
3. Verify merge instructions work
4. Verify both MCP servers work

**Expected:** No conflicts, both servers operational

---

#### 3.3 OAuth Flow Test
**Scenarios:**
1. First-time OAuth (no credentials)
2. Token expiry (force by editing expiry_date)
3. Account switching (delete credentials, re-auth)
4. Scope changes (update settings.json, re-auth)

**Expected:** OAuth flow works in all scenarios

---

#### 3.4 Skill Routing Test
**Test cases:**
```
User: "Send email to test@example.com"
Expected: Routes to Gmail.md, calls gmail_send_message

User: "What's on my calendar today?"
Expected: Routes to Calendar.md, calls calendar_list_events

User: "Upload this file to Drive"
Expected: Routes to Drive.md, calls drive_upload_file

User: "Search my inbox for emails from bob"
Expected: Routes to Gmail.md, calls gmail_search_messages
```

**Expected:** All routing triggers work correctly

---

#### 3.5 Edge Case Testing
**Test:**
1. Offline usage (disconnect network)
2. Invalid OAuth credentials (wrong Client Secret)
3. MCP server not responding
4. Large email operations (pagination)
5. Multiple rapid requests

**Expected:** Graceful failures with clear error messages

---

### Testing Report Template

```markdown
# GoogleWorkspace Skill - Testing Report

**Tester:** Riker
**Date:** YYYY-MM-DD
**Test Environment:** [OS, Claude Code version]

## Test Results

### Clean Installation
- [ ] PASSED / FAILED
- Issues: [List any issues]
- Notes: [Observations]

### Conflict Handling
- [ ] PASSED / FAILED
- Issues: [List any issues]

[Continue for all test scenarios]

## Recommended Changes
1. [Change 1 with reasoning]
2. [Change 2 with reasoning]

## Approval
- [ ] Ready for production
- [ ] Needs revisions (see above)
```

**Estimated time:** 6 hours (full test suite)

---

## Phase 4: Documentation Review (Howard)

### Review Checklist

#### README.md Review
- [ ] Problem statement is clear and relatable
- [ ] Solution explanation is understandable
- [ ] "What Makes This Different" is compelling
- [ ] Examples are realistic
- [ ] Terminology is consistent

#### INSTALL.md Review
- [ ] Steps are numbered and sequential
- [ ] Each step has clear success criteria
- [ ] Pre-checks catch all conflicts
- [ ] Merge instructions are explicit
- [ ] OAuth flow is foolproof

#### VERIFY.md Review
- [ ] All checks are testable
- [ ] Expected outputs are specific
- [ ] Troubleshooting covers common issues
- [ ] Checklist is comprehensive

#### SKILL.md Review
- [ ] Triggers are comprehensive
- [ ] Routing table is clear
- [ ] MCP config template is correct
- [ ] Troubleshooting is helpful

#### Workflow Files Review
- [ ] Each operation has clear user request example
- [ ] MCP tool JSON is copy-paste ready
- [ ] Expected outputs are documented
- [ ] Error handling is covered

### Deliverable
Document with suggested edits and clarity improvements.

**Estimated time:** 3 hours

---

## Phase 5: Architecture Review (Bob Prime)

### Review Checklist

#### PAI Principles Alignment
- [ ] Modular (doesn't break existing systems)
- [ ] Self-contained (everything needed is included)
- [ ] Progressive loading (token costs are reasonable)
- [ ] Fail-safe (errors don't crash Claude Code)
- [ ] Single source of truth for config (documented exceptions)

#### Security Review
- [ ] Credential locations documented clearly
- [ ] OAuth scopes explained
- [ ] No credentials in code/docs
- [ ] File permissions documented
- [ ] Revocation process documented

#### BobPack Consistency
- [ ] TitleCase naming (GoogleWorkspace/)
- [ ] Same structure as bob-telos-skill
- [ ] INSTALL.md has pre-checks
- [ ] VERIFY.md has 10+ checks
- [ ] README.md follows PAIPackTemplate.md

#### MCP Boundary Clarity
- [ ] User understands MCP server vs skill wrapper
- [ ] Two-config setup is clear (settings.json + skill files)
- [ ] OAuth credential location is explicit
- [ ] Token refresh is documented
- [ ] Troubleshooting covers MCP issues

### Deliverable
Approval or list of required changes.

**Estimated time:** 2 hours

---

## Implementation Order

**Total estimated time:** 30 hours

| Phase | Task | Owner | Time | Dependencies |
|-------|------|-------|------|--------------|
| 1.1 | README.md | Mario | 2h | Architecture docs |
| 1.2 | INSTALL.md | Mario | 3h | Architecture docs |
| 1.3 | VERIFY.md | Mario | 2h | Architecture docs |
| 2.1 | SKILL.md | Mario | 2h | README.md |
| 2.2 | Gmail.md | Mario | 3h | SKILL.md |
| 2.3 | Calendar.md | Mario | 2h | SKILL.md |
| 2.4 | Drive.md | Mario | 2h | SKILL.md |
| 3 | Testing | Riker | 6h | All Mario tasks |
| 4 | Doc review | Howard | 3h | All Mario tasks |
| 5 | Architecture review | Bob Prime | 2h | All tasks |

**Critical path:** Mario → Riker → Howard → Bob Prime (linear dependencies)

---

## Success Criteria

Pack is ready for production when:

1. **Installation works:** User can go from zero to first email sent
2. **Natural language works:** "Send email to bob@example.com" routes correctly
3. **OAuth is clear:** User understands where credentials live
4. **Two-config boundary is clear:** settings.json vs skill files
5. **Token costs are reasonable:** Tier 1 under 50 tokens
6. **Workflows are helpful:** Copy-paste MCP tool examples work
7. **Troubleshooting works:** Common issues have solutions
8. **BobPack consistent:** Follows same patterns as other BobPacks
9. **Tests pass:** All test scenarios work
10. **Reviews pass:** Howard + Bob Prime approve

---

## Quick Reference: Key Decisions

### 1. MCP Wrapper (Not Standalone)
**Why:** Official MCP server exists, reduces maintenance
**Impact:** No code to write, only documentation

### 2. Credentials in 3 Locations
**Why:** MCP manages OAuth, PAI manages API keys
**Impact:** Must document exception to "single .env" principle

### 3. TitleCase Naming MANDATORY
**Why:** PAI skill routing requires exact case match
**Impact:** GoogleWorkspace/ (not google-workspace/)

### 4. No Tools/ Directory
**Why:** MCP server provides tools
**Impact:** Only Workflows/ directory needed

### 5. Settings.json Configuration
**Why:** Claude Code reads mcpServers from standard location
**Impact:** Must document merge strategy for existing configs

---

## Common Pitfalls to Avoid

### Pitfall 1: Simplifying MCP Config
**Don't:** Reduce settings.json template to "configure MCP"
**Do:** Provide exact JSON with all required fields

### Pitfall 2: Vague OAuth Steps
**Don't:** "Set up OAuth in Google Cloud Console"
**Do:** Number every click: "1. Go to console.cloud.google.com, 2. Click 'Create Project'..."

### Pitfall 3: Missing MCP Tool Names
**Don't:** "Call the email send function"
**Do:** "Call MCP tool: gmail_send_message (exact name)"

### Pitfall 4: Inconsistent Credential Locations
**Don't:** Mention credentials in multiple places without context
**Do:** Create one definitive "Credential Locations" section, reference it

### Pitfall 5: Forgetting Restart Requirement
**Don't:** Assume user knows to restart Claude Code
**Do:** Explicitly state "Restart Claude Code to load MCP server"

---

## File Checklist

Before marking complete, verify all files exist:

```bash
BobPacks/bob-google-workspace-skill/
├── README.md                                ← [ ]
├── INSTALL.md                               ← [ ]
├── VERIFY.md                                ← [ ]
├── ARCHITECTURE.md                          ← [✓] (done)
├── DESIGN-SUMMARY.md                        ← [✓] (done)
├── DIAGRAMS.md                              ← [✓] (done)
├── IMPLEMENTATION-GUIDE.md                  ← [✓] (this file)
└── src/
    └── skills/
        └── GoogleWorkspace/                 ← [✓] (created)
            ├── SKILL.md                     ← [ ]
            └── Workflows/                   ← [✓] (created)
                ├── Gmail.md                 ← [ ]
                ├── Calendar.md              ← [ ]
                └── Drive.md                 ← [ ]
```

---

## Questions? Reference Architecture Docs

- **High-level:** DESIGN-SUMMARY.md
- **Technical details:** ARCHITECTURE.md
- **Visual diagrams:** DIAGRAMS.md
- **Implementation:** This file (IMPLEMENTATION-GUIDE.md)

All design decisions are documented. If something is unclear, it's in one of these files.

---

## Next Action

**Mario:** Start with README.md
- Open `/home/bob/projects/Bob2.0/Tools/PAIPackTemplate.md`
- Copy template structure
- Fill in content from ARCHITECTURE.md sections
- Estimated time: 2 hours

**Bob Prime:** Review this implementation guide
- Verify approach is sound
- Approve or suggest changes
- Estimated time: 30 minutes

---

*Implementation guide complete. All architectural work done. Ready for implementation phase.*

*Bill (Bob-4): "The blueprint is complete. Now we build."*
