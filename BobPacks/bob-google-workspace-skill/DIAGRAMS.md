# GoogleWorkspace Skill - Architecture Diagrams

**Visual reference for the MCP wrapper architecture**

---

## 1. Component Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
│  Natural Language: "Send email to bob@example.com"              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    PAI SKILL ROUTING LAYER                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tier 0: CORE Skill (Auto-loaded)                        │  │
│  │ - Loads all skill frontmatter at SessionStart           │  │
│  │ - Pattern matching: "email" → GoogleWorkspace           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tier 1: Skill Frontmatter (550 tokens at start)        │  │
│  │ - GoogleWorkspace: "USE WHEN email, calendar, drive"   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tier 2: Full SKILL.md (Loaded on trigger)              │  │
│  │ - Routing table: "send email" → Gmail.md                │  │
│  │ - MCP config documentation                              │  │
│  │ - Troubleshooting guide                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tier 3: Workflow (Loaded on route)                     │  │
│  │ - Gmail.md: send, read, search operations              │  │
│  │ - MCP tool examples with JSON                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   CLAUDE CODE MCP LAYER                         │
│                                                                  │
│  Reads: ~/.claude/settings.json → mcpServers section           │
│  Spawns: MCP server process on startup                         │
│  Invokes: MCP tools (gmail_send_message, etc.)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              GOOGLE WORKSPACE MCP SERVER (External)             │
│                                                                  │
│  Package: @modelcontextprotocol/server-google-workspace        │
│  Protocol: stdio (npx command)                                  │
│  Credentials: ~/.config/google-workspace-mcp/credentials.json  │
│  Auth: OAuth 2.0 (auto-refresh)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    GOOGLE WORKSPACE APIs                        │
│  - Gmail API                                                     │
│  - Calendar API                                                  │
│  - Drive API                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow: Send Email Example

```
USER
  │
  │ "Send email to bob@example.com about project update"
  │
  ▼
┌─────────────────────────────────────────┐
│ CORE Skill Routing                     │
│ - Match: "email" in frontmatter        │
│ - Load: GoogleWorkspace/SKILL.md       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ GoogleWorkspace SKILL.md               │
│ - Route: "send email" → Gmail.md       │
│ - Load: Workflows/Gmail.md              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Gmail.md Workflow                       │
│ - Parse: recipient, subject, body      │
│ - Build: MCP tool call JSON            │
└──────────────┬──────────────────────────┘
               │
               │ Tool: gmail_send_message
               │ Input: {to, subject, body}
               │
               ▼
┌─────────────────────────────────────────┐
│ Claude Code MCP System                  │
│ - Invoke: google-workspace MCP server  │
│ - Send: tool request via stdio          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Google Workspace MCP Server             │
│ - Authenticate: OAuth token             │
│ - Call: Gmail API (messages.send)      │
│ - Refresh: token if needed              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Gmail API                               │
│ - Send email                            │
│ - Return: message ID, thread ID         │
└──────────────┬──────────────────────────┘
               │
               │ Response: {messageId: "..."}
               │
               ▼
┌─────────────────────────────────────────┐
│ USER                                    │
│ "Email sent. Message ID: abc123"        │
└─────────────────────────────────────────┘
```

---

## 3. Configuration Files Map

```
File System Layout:

~/.claude/
├── settings.json                    ← MCP server config
│   {
│     "mcpServers": {
│       "google-workspace": {
│         "command": "npx",
│         "args": [...],
│         "env": {
│           "GOOGLE_CLIENT_ID": "...",
│           "GOOGLE_CLIENT_SECRET": "...",
│           "GOOGLE_SCOPES": "..."
│         }
│       }
│     }
│   }
│
├── skills/
│   └── GoogleWorkspace/             ← Skill wrapper
│       ├── SKILL.md                 ← Routing
│       └── Workflows/
│           ├── Gmail.md
│           ├── Calendar.md
│           └── Drive.md
│
├── hooks/
│   ├── capture-all-events.ts       ← Captures MCP calls
│   └── ...
│
└── history/
    └── raw-outputs/                 ← Logged MCP operations
        └── 2026-01/
            └── 2026-01-13_all-events.jsonl


~/.config/google-workspace-mcp/
└── credentials.json                 ← OAuth tokens (MCP managed)
    {
      "access_token": "...",
      "refresh_token": "...",
      "expiry_date": 1234567890
    }


~/.claude/.env                       ← Other PAI API keys
DA="Bob"
PAI_DIR="~/.claude"
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="..."
# NOTE: Google OAuth NOT here (MCP manages)
```

---

## 4. Workflow Routing Decision Tree

```
User Input
    │
    ├─ Contains "email", "gmail", "inbox", "send message"?
    │   │
    │   └─ YES → Load GoogleWorkspace/SKILL.md
    │       │
    │       ├─ "send", "compose", "write"?
    │       │   └─ Route: Workflows/Gmail.md (Send Email)
    │       │       Tool: gmail_send_message
    │       │
    │       ├─ "read", "check", "inbox", "list"?
    │       │   └─ Route: Workflows/Gmail.md (Read Inbox)
    │       │       Tool: gmail_list_messages
    │       │
    │       └─ "search", "find email from"?
    │           └─ Route: Workflows/Gmail.md (Search)
    │               Tool: gmail_search_messages
    │
    ├─ Contains "calendar", "meeting", "schedule"?
    │   │
    │   └─ YES → Load GoogleWorkspace/SKILL.md
    │       │
    │       ├─ "check", "what's on", "list"?
    │       │   └─ Route: Workflows/Calendar.md (List Events)
    │       │       Tool: calendar_list_events
    │       │
    │       ├─ "create", "schedule", "add"?
    │       │   └─ Route: Workflows/Calendar.md (Create Event)
    │       │       Tool: calendar_create_event
    │       │
    │       └─ "update", "change", "move"?
    │           └─ Route: Workflows/Calendar.md (Update Event)
    │               Tool: calendar_update_event
    │
    └─ Contains "drive", "upload", "google drive"?
        │
        └─ YES → Load GoogleWorkspace/SKILL.md
            │
            ├─ "list", "show files", "what's in"?
            │   └─ Route: Workflows/Drive.md (List Files)
            │       Tool: drive_list_files
            │
            ├─ "upload", "save to drive"?
            │   └─ Route: Workflows/Drive.md (Upload)
            │       Tool: drive_upload_file
            │
            └─ "search", "find file"?
                └─ Route: Workflows/Drive.md (Search)
                    Tool: drive_search_files
```

---

## 5. Token Cost Flow

```
Session Start
    │
    ├─ CORE skill loads (Tier 0)           500 tokens
    ├─ All skill frontmatter (Tier 1)      +50 tokens
    │                                       ────────────
    │                                       550 tokens
    │
    └─ User: "Send email to bob@example.com"
        │
        ├─ Load SKILL.md full (Tier 2)     +800 tokens
        ├─ Load Gmail.md workflow (Tier 3)  +1200 tokens
        │                                    ────────────
        │                                    +2000 tokens
        │                                    ════════════
        │                                    2550 tokens total
        │
        └─ User: "Send another email to alice@example.com"
            │
            └─ Already loaded                0 tokens
                                             ════════════
                                             2550 tokens total

Switching Workflows
    │
    └─ User: "Check my calendar"
        │
        ├─ SKILL.md already loaded          0 tokens
        ├─ Load Calendar.md (Tier 3)        +1200 tokens
        │                                    ────────────
        │                                    +1200 tokens
        │                                    ════════════
        │                                    3750 tokens total
```

---

## 6. Installation Flow

```
START
  │
  ├─ Pre-Installation Checks
  │   ├─ MCP config exists?
  │   │   ├─ YES → Warn: merge required
  │   │   └─ NO → Proceed
  │   ├─ Skill exists?
  │   │   ├─ YES → Warn: backup required
  │   │   └─ NO → Proceed
  │   └─ OAuth tokens exist?
  │       ├─ YES → Note: preserve unless re-auth needed
  │       └─ NO → Will need OAuth
  │
  ├─ Install Skill Files
  │   └─ Copy src/skills/GoogleWorkspace/ → $PAI_DIR/skills/
  │
  ├─ Configure MCP Server
  │   ├─ Read ~/.claude/settings.json
  │   ├─ Check for mcpServers section
  │   │   ├─ Exists → Merge google-workspace entry
  │   │   └─ Not exists → Create mcpServers section
  │   ├─ Add Client ID/Secret from Google Cloud Console
  │   └─ Save settings.json
  │
  ├─ OAuth Setup
  │   ├─ Restart Claude Code (loads MCP server)
  │   ├─ Run first command (e.g., "check my inbox")
  │   ├─ MCP server detects no credentials
  │   ├─ Browser opens → User authorizes
  │   ├─ Tokens saved to ~/.config/google-workspace-mcp/
  │   └─ Command completes
  │
  └─ Verification
      ├─ Test: MCP tools available?
      ├─ Test: Skill routes correctly?
      ├─ Test: Send email works?
      ├─ Test: Calendar list works?
      ├─ Test: Drive search works?
      └─ Test: Hooks capturing events?
          │
          └─ All pass? → Installation complete ✓
```

---

## 7. MCP Server Lifecycle

```
Claude Code Startup
    │
    ├─ Read ~/.claude/settings.json
    │
    ├─ Find mcpServers.google-workspace
    │
    ├─ Execute: npx -y @modelcontextprotocol/server-google-workspace
    │   │
    │   ├─ MCP server starts
    │   ├─ Check ~/.config/google-workspace-mcp/credentials.json
    │   │   ├─ Exists → Load tokens
    │   │   │   ├─ Access token valid? → Ready
    │   │   │   └─ Access token expired? → Refresh using refresh_token
    │   │   └─ Not exists → Wait for first tool call
    │   │
    │   └─ Register tools: gmail_*, calendar_*, drive_*
    │
    ├─ Claude Code session active
    │   │
    │   └─ User triggers skill
    │       │
    │       └─ Call MCP tool
    │           │
    │           ├─ No credentials? → OAuth flow
    │           │   ├─ Generate auth URL
    │           │   ├─ User authorizes
    │           │   ├─ Exchange code for tokens
    │           │   └─ Save to credentials.json
    │           │
    │           └─ Has credentials? → Execute API call
    │               │
    │               ├─ Token valid → Call Google API
    │               ├─ Token expired → Refresh, then call API
    │               └─ Refresh failed → Trigger re-auth
    │
    └─ Claude Code Shutdown
        │
        └─ Terminate MCP server process
            │
            └─ Credentials persist on disk (ready for next session)
```

---

## 8. Observability Integration

```
User Action: "Send email to bob@example.com"
    │
    ├─ PreToolUse Hook Fires
    │   │
    │   ├─ Capture:
    │   │   - Tool: gmail_send_message
    │   │   - Input: {to, subject, body}
    │   │   - Session ID
    │   │   - Timestamp
    │   │
    │   └─ Log to: $PAI_DIR/history/raw-outputs/.../all-events.jsonl
    │
    ├─ MCP Tool Executes
    │   │
    │   └─ Gmail API sends email
    │
    ├─ PostToolUse Hook Fires
    │   │
    │   ├─ Capture:
    │   │   - Tool: gmail_send_message
    │   │   - Output: {messageId, threadId}
    │   │   - Duration
    │   │   - Success/Failure
    │   │
    │   └─ Log to: $PAI_DIR/history/raw-outputs/.../all-events.jsonl
    │
    └─ Optional: Observability Server
        │
        └─ If running on localhost:4000
            ├─ Hook sends event via HTTP POST
            └─ Dashboard shows real-time MCP operation

Search History Later:
    └─ grep "gmail_send_message" $PAI_DIR/history/raw-outputs/*/*.jsonl
        │
        └─ Returns: All email send operations with timestamps
```

---

## 9. Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CREDENTIAL STORAGE                          │
│                                                                   │
│  ~/.claude/settings.json (File permissions: 600)                │
│  ├─ GOOGLE_CLIENT_ID (public-ish, identifies app)              │
│  └─ GOOGLE_CLIENT_SECRET (sensitive, proves app identity)      │
│                                                                   │
│  ~/.config/google-workspace-mcp/credentials.json (600)          │
│  ├─ access_token (short-lived, ~1 hour)                        │
│  ├─ refresh_token (long-lived, can generate new access tokens) │
│  └─ expiry_date (when access_token expires)                     │
│                                                                   │
│  ~/.claude/.env                                                  │
│  └─ Other API keys (NOT Google OAuth)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY BOUNDARIES                         │
│                                                                   │
│  User's Google Account                                           │
│      ↕ (OAuth 2.0)                                              │
│  MCP Server (manages tokens, auto-refresh)                      │
│      ↕ (stdio protocol)                                         │
│  Claude Code (invokes MCP, no direct token access)             │
│      ↕ (Skill routing)                                          │
│  GoogleWorkspace Skill (docs only, no token handling)          │
│      ↕ (Natural language)                                       │
│  User                                                            │
└─────────────────────────────────────────────────────────────────┘

SCOPES (documented in settings.json):
  - gmail.send            → Send emails
  - gmail.readonly        → Read emails
  - calendar.events       → Full calendar access
  - drive.file            → Files created/opened by app

User controls: What permissions granted via scope configuration
```

---

## 10. Comparison: MCP Wrapper vs Alternatives

```
┌─────────────────────────────────────────────────────────────────┐
│                   DIRECT MCP (No Wrapper)                        │
│                                                                   │
│  User → "Use gmail_send_message with..."                        │
│      ↓                                                           │
│  Must know exact tool names                                      │
│  No workflow documentation                                       │
│  No natural language routing                                     │
│  Token cost: 550 (session start only)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                MCP WRAPPER (This Design)                         │
│                                                                   │
│  User → "Send email to bob@example.com"                         │
│      ↓                                                           │
│  Natural language triggers                                       │
│  Workflow documentation with examples                            │
│  PAI integration (history, observability)                        │
│  Token cost: 2550 first use, 0 thereafter                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              CUSTOM IMPLEMENTATION (No MCP)                      │
│                                                                   │
│  User → "Send email to bob@example.com"                         │
│      ↓                                                           │
│  Custom OAuth flow (500+ lines)                                  │
│  Gmail API calls (300+ lines)                                    │
│  Calendar API calls (300+ lines)                                 │
│  Drive API calls (300+ lines)                                    │
│  Token refresh logic (200+ lines)                                │
│  Error handling (200+ lines)                                     │
│  Total: ~2000 lines of code to maintain                         │
│  Token cost: 8550+ tokens                                        │
└─────────────────────────────────────────────────────────────────┘

Winner: MCP Wrapper
  ✓ Natural language
  ✓ Documentation
  ✓ No code maintenance
  ✓ Reasonable token cost
```

---

*Architecture diagrams complete.*
*Use these as visual reference during implementation.*

*Bill (Bob-4): "A picture is worth a thousand tokens."*
