# Bob Google Workspace Skill

---
name: Bob Google Workspace Skill
pack-id: bob-google-workspace-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Natural language access to Gmail, Calendar, and Drive through an MCP wrapper that routes conversational requests to Google Workspace services.
type: skill
platform: claude-code
dependencies: [pai-core-install]
keywords: [gmail, calendar, drive, google-workspace, mcp, email, scheduling, documents, natural-language, wrapper]
---

> Talk to your email, calendar, and files like a human. No API docs required.

## What's Included

This pack gives you conversational access to Google Workspace services. Instead of memorizing tool names or API parameters, you just ask naturally:

- "Send an email to bob@example.com about the project"
- "What's on my calendar today?"
- "Search my Drive for last week's presentation"

The skill handles the translation from natural language to the underlying Google Workspace MCP server, which manages all the OAuth complexity and API communication.

## The Problem

Working with Google Workspace through traditional tools means choosing between extremes:

**Web Interface**
- Context switching breaks flow
- Multiple tabs and windows
- Manual copy-paste between tools
- Interrupts your conversation with your AI assistant

**Direct MCP Tools**
- Requires memorizing exact tool names (`gmail_send_message`, `calendar_list_events`)
- Need to know parameter structures
- No workflow guidance
- No integration with your AI's working memory

**Custom API Implementation**
- 2000+ lines of code to write and maintain
- OAuth flow complexity
- Token refresh logic
- Error handling across three APIs
- Breaks every time Google changes something

## The Solution

This skill is an **MCP wrapper** - a documentation layer that sits between natural language and an external Google Workspace MCP server. You get:

### Natural Language Routing

```
You: "Send email to alice@example.com about tomorrow's meeting"
  ↓
Skill recognizes "email" trigger
  ↓
Routes to Gmail workflow
  ↓
Calls gmail_send_message MCP tool
  ↓
Google Workspace MCP server handles OAuth + API
  ↓
Email sent, confirmation returned
```

### Zero Code Maintenance

This pack contains **zero executable code**. It's pure documentation:
- Routing logic (what triggers what workflow)
- Workflow patterns (how to accomplish common tasks)
- MCP tool examples (copy-paste ready JSON)
- Troubleshooting guides

The Google Workspace MCP server (maintained by the MCP team) handles all the heavy lifting:
- OAuth 2.0 flow
- Token refresh
- API requests and responses
- Error handling

### Progressive Context Loading

Follows PAI's efficient token management:

| When | What Loads | Cost |
|------|-----------|------|
| **Session starts** | Skill frontmatter (triggers only) | 50 tokens |
| **You say "email"** | Full skill + Gmail workflow | +2000 tokens |
| **You send another email** | Already loaded | 0 tokens |
| **You switch to calendar** | Calendar workflow only | +1200 tokens |

Compare to loading all Google API documentation: 8000+ tokens, whether you use it or not.

## What Makes This Different

### vs. Using MCP Tools Directly

**Direct MCP:**
```
You: "Use the gmail_send_message tool with to: bob@example.com, subject: Hello, body: Test"
```
- Must know exact tool names
- Must know parameter structures
- No workflow guidance
- No history integration

**With This Skill:**
```
You: "Send an email to bob@example.com saying hello"
```
- Natural language
- Skill suggests parameters you might have forgotten
- Workflow documentation helps with complex operations
- PAI hooks capture everything to your history

### vs. Custom Implementation

Building your own Google Workspace integration means:

**Code you'd write:**
- OAuth flow implementation (500 lines)
- Gmail API wrapper (300 lines)
- Calendar API wrapper (300 lines)
- Drive API wrapper (300 lines)
- Token refresh logic (200 lines)
- Error handling (200 lines)
- Test suite (500 lines)

**Total:** ~2300 lines of code to maintain forever

**With MCP wrapper:**
- SKILL.md (routing) - 80 lines
- Workflow docs - 300 lines
- Installation guide - 150 lines
- **Zero code to maintain**

When Google updates their APIs? The MCP server team handles it. You keep using natural language.

### vs. Web Interface

**Traditional flow:**
1. Ask AI for help drafting email
2. Copy AI's response
3. Open Gmail in browser
4. Compose new message
5. Paste content
6. Send
7. Come back to AI conversation

**With this skill:**
1. "Send this to bob@example.com: [your message]"
2. Done. AI confirms sent.

Stay in flow. Your AI remembers what you sent because it sent it.

## Architecture Overview

### Components

```
┌────────────────────────────────────────────────────────────┐
│ YOU: "Send email to bob@example.com"                       │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│ PAI SKILL ROUTING (this pack)                              │
│ - Recognizes "email" trigger                               │
│ - Loads Gmail workflow documentation                       │
│ - Provides examples and patterns                           │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│ GOOGLE WORKSPACE MCP SERVER (external)                     │
│ - Handles OAuth authentication                             │
│ - Manages token refresh automatically                      │
│ - Calls Gmail/Calendar/Drive APIs                          │
│ - Returns structured responses                             │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│ GOOGLE WORKSPACE APIS                                      │
│ - Gmail API (send, read, search)                           │
│ - Calendar API (list, create, update events)              │
│ - Drive API (list, upload, download, search files)        │
└────────────────────────────────────────────────────────────┘
```

### What You Configure

**Two separate pieces:**

1. **MCP Server** (in `~/.claude/settings.json`)
   - Command to run the MCP server
   - OAuth credentials (Client ID/Secret)
   - Which Google services to access (scopes)

2. **Skill Wrapper** (in `$PAI_DIR/skills/GoogleWorkspace/`)
   - Natural language triggers
   - Workflow routing logic
   - Usage examples and patterns

### Where Credentials Live

Understanding credential storage helps you troubleshoot:

```
~/.claude/settings.json
  → OAuth Client ID/Secret (identifies your app to Google)

~/.config/google-workspace-mcp/credentials.json
  → OAuth access/refresh tokens (managed by MCP server)

~/.claude/.env
  → Other PAI API keys (NOT Google OAuth - that's managed by MCP)
```

**Why separate?** The MCP server needs to manage token refresh automatically. Storing OAuth tokens in PAI's `.env` would break the MCP server's ability to refresh them when they expire.

## Use Cases

### Email Operations

**Send emails:**
- "Send an email to the team about tomorrow's standup"
- "Email bob@example.com and cc alice@example.com with the project update"

**Read emails:**
- "Check my inbox"
- "Show me emails from the last 2 hours"
- "What did Alice say about the proposal?"

**Search emails:**
- "Find emails from bob sent last week"
- "Search for emails about 'budget review'"
- "Show me unread messages from the design team"

### Calendar Operations

**View schedule:**
- "What's on my calendar today?"
- "Show me next week's meetings"
- "Do I have anything scheduled for Friday afternoon?"

**Schedule events:**
- "Schedule a meeting with bob@example.com tomorrow at 2pm"
- "Create a calendar event called 'Team Standup' every Monday at 9am"
- "Block off Friday afternoon for deep work"

**Manage events:**
- "Move my 2pm meeting to 3pm"
- "Cancel tomorrow's 1:1 with Alice"
- "Update the project review meeting to include bob@example.com"

### Drive Operations

**Browse files:**
- "List my recent Drive files"
- "Show me what's in the 'Projects' folder"

**Search files:**
- "Find the presentation I worked on last week"
- "Search Drive for 'Q4 budget'"

**Upload/download:**
- "Upload this document to my Drive"
- "Download the latest version of the team roadmap"

## How It Works

### First Time Setup

1. **Create OAuth app in Google Cloud Console**
   - Enable Gmail, Calendar, Drive APIs
   - Get Client ID and Secret
   - Configure redirect URI

2. **Configure MCP server in settings.json**
   - Add server configuration
   - Provide OAuth credentials
   - Specify which services to access

3. **Authorize access**
   - Run your first command
   - Browser opens for authorization
   - Tokens saved automatically
   - Never need to auth again (auto-refresh)

4. **Start using natural language**
   - No more OAuth flows
   - No manual token refresh
   - Just talk to your email/calendar/files

### Ongoing Usage

Every time you:
- Send an email
- Check your calendar
- Search Drive

The skill:
1. Recognizes your intent from natural language
2. Routes to the appropriate workflow
3. Calls the correct MCP tool
4. Formats the response naturally
5. Logs everything to your PAI history

You stay in conversation. The AI remembers what happened because it did it.

## Installation

Detailed step-by-step installation instructions are in `INSTALL.md`.

**Quick overview:**
1. Install skill files to `$PAI_DIR/skills/GoogleWorkspace/`
2. Create OAuth app in Google Cloud Console
3. Add MCP server config to `~/.claude/settings.json`
4. Restart Claude Code
5. Run first command to trigger OAuth flow
6. Complete verification checklist

**Prerequisites:**
- PAI installed (specifically `pai-core-install`)
- Google Cloud Console account
- Bun runtime

## Verification

After installation, complete the verification checklist in `VERIFY.md` to ensure:
- Skill files are installed correctly
- MCP server is configured
- OAuth authentication works
- All three services (Gmail, Calendar, Drive) are accessible
- PAI hooks are capturing operations to history

## Integration with PAI

### History & Memory

Every Google Workspace operation is automatically captured to your PAI history:

```bash
# See all email operations
grep "gmail_send_message" $PAI_DIR/history/raw-outputs/*/*.jsonl

# See all calendar operations
grep "calendar_create_event" $PAI_DIR/history/raw-outputs/*/*.jsonl

# See all Drive operations
grep "drive_upload_file" $PAI_DIR/history/raw-outputs/*/*.jsonl
```

Your AI can reference what emails you sent, what meetings you scheduled, what files you uploaded - because it did those things and logged them.

### Observability

If you're running the PAI observability server, you'll see real-time events for:
- PreToolUse: What tool is being called with what parameters
- PostToolUse: What the result was, how long it took
- Any errors or auth issues

### Security

PAI's security hooks validate every command before execution:
- Checks for prompt injection patterns
- Validates tool parameters
- Logs all operations
- Blocks dangerous patterns (though Google Workspace operations are generally safe)

## Troubleshooting

### "MCP tools not available"

The MCP server isn't running. Check:
1. Is `google-workspace` in your `~/.claude/settings.json` under `mcpServers`?
2. Did you restart Claude Code after adding the config?
3. Check Claude Code logs for MCP server errors

### "OAuth authorization failed"

OAuth setup didn't complete. Try:
1. Verify Client ID/Secret are correct in `settings.json`
2. Check redirect URI matches: `http://localhost:8080/oauth2callback`
3. Delete `~/.config/google-workspace-mcp/credentials.json` and re-auth

### "Skill not routing"

The skill isn't triggering. Check:
1. Is `GoogleWorkspace/SKILL.md` in `$PAI_DIR/skills/`?
2. Did PAI's CORE skill load at session start?
3. Try more explicit language: "Check my Gmail inbox" instead of just "check email"

### "Token expired"

OAuth tokens need refresh. This should be automatic, but if it fails:
1. Delete `~/.config/google-workspace-mcp/credentials.json`
2. Restart Claude Code
3. Run any Gmail/Calendar/Drive command to re-trigger OAuth
4. Re-authorize in browser

### "Access denied" or scope errors

You need additional permissions:
1. Update `GOOGLE_SCOPES` in `settings.json` to include the needed scope
2. Delete `~/.config/google-workspace-mcp/credentials.json`
3. Restart Claude Code and re-authorize (new scopes require re-auth)

## Limitations

### Internet Required

Google Workspace APIs are cloud services. You need an internet connection. Offline mode isn't possible.

### One Google Account at a Time

The MCP server authenticates to one Google account. To switch accounts:
1. Delete `~/.config/google-workspace-mcp/credentials.json`
2. Restart Claude Code
3. Run a command to trigger OAuth with different account

For persistent multi-account support, you'd need multiple MCP server configurations (advanced setup).

### Rate Limits

Google's APIs have rate limits. If you make many rapid requests, you might hit limits. The MCP server should handle this gracefully with retry logic, but extreme usage might require throttling.

### Scope Limitations

You control what permissions the app has via OAuth scopes. More restrictive scopes mean some operations might fail. The default configuration includes:
- Gmail: send, read
- Calendar: full access
- Drive: files created/opened by this app

Adjust scopes in `settings.json` based on your needs.

## Security Considerations

### What You're Granting Access To

When you authorize the OAuth app, you're giving the MCP server permission to:
- Send and read your Gmail
- View and modify your Google Calendar
- Access Google Drive files (scope-dependent)

**This is significant access.** Only proceed if you:
- Trust the Google Workspace MCP server (maintained by MCP team)
- Understand Claude Code will have these permissions
- Are comfortable with AI accessing these services on your behalf

### Credential Storage

OAuth credentials are stored:
- **Client ID/Secret:** In `~/.claude/settings.json` (file permissions: 600)
- **Access/refresh tokens:** In `~/.config/google-workspace-mcp/credentials.json` (managed by MCP server)

**Never commit these files to version control.** Add to `.gitignore`:
```
.claude/settings.json
.config/google-workspace-mcp/
```

### Revoking Access

To revoke access:
1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find your OAuth app
3. Click "Remove Access"
4. Delete `~/.config/google-workspace-mcp/credentials.json`

The app can no longer access your Google Workspace data.

## Why This Approach

### Philosophy: Wrapper, Not Reimplementation

PAI's power comes from composition. When a solid implementation exists, wrap it rather than rebuild it.

**The MCP ecosystem provides:**
- Google Workspace MCP server (OAuth + API handling)
- Maintained by MCP team
- Updates when Google's APIs change
- Battle-tested across many users

**This skill provides:**
- Natural language triggers
- Workflow documentation
- PAI integration (history, observability)
- Troubleshooting guidance

**Together:** Full-featured Google Workspace access with minimal maintenance burden.

### Design Principles

**Zero Code**
- Documentation-only pack
- No OAuth implementation
- No API wrappers
- Nothing to debug when Google changes things

**Progressive Loading**
- Minimal tokens at session start (50)
- Full documentation loads only when needed
- Cached after first use
- Efficient for long sessions

**Explicit Boundaries**
- Clear separation: MCP server vs skill wrapper
- Two configuration files with different purposes
- Documented credential locations
- No confusion about what lives where

**Human-Centered**
- Natural language, not API parameters
- Workflow guidance, not just tool names
- Examples for common tasks
- Troubleshooting for real problems

## Credits

**Architecture:** Bill (Bob-4) - The Architect
**Documentation:** Howard (Bob-7) - The Designer
**Pack System:** PAI by danielmiessler
**MCP Server:** Model Context Protocol team
**Google APIs:** Google Cloud Platform

## Contributing

This is a personal BobPack in Wally Kroeker's fork of PAI. If you find it useful and want to adapt it:

1. **For personal use:** Fork and modify freely
2. **For upstream contribution:** Follow PAI's pack template and contribution guidelines
3. **For improvements:** Submit PR to [wally-kroeker/Bob2.0](https://github.com/wally-kroeker/Bob2.0)

## License

MIT License - See repository root for details.

## Links

- [PAI Project](https://github.com/danielmiessler/Personal_AI_Infrastructure)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Workspace APIs](https://developers.google.com/workspace)

---

Ready to talk to your email instead of clicking through web interfaces?

See `INSTALL.md` to get started.
