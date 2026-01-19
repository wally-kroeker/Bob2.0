---
name: GoogleWorkspace
description: |
  Google Workspace integration via MCP (Gmail, Calendar, Drive).
  USE WHEN user wants to send email, check calendar, manage Google Drive files,
  search inbox, schedule meetings, or work with Google Workspace services.
---

# GoogleWorkspace Skill

Natural language access to Gmail, Calendar, and Google Drive through the Google Workspace MCP server.

## When to Activate This Skill

This skill activates when the user mentions:

**Gmail operations:**
- "send email", "email to", "compose message"
- "check inbox", "read email", "what emails"
- "search for email", "find message from"
- "draft email", "save draft"

**Calendar operations:**
- "check my calendar", "what's on my calendar"
- "schedule meeting", "create event", "book time"
- "update meeting", "move event", "reschedule"
- "cancel meeting", "delete event"
- "what meetings", "when is"

**Drive operations:**
- "upload to Drive", "save to Drive"
- "search Drive", "find in Drive"
- "list Drive files", "what's in Drive"
- "download from Drive", "get file from Drive"
- "share Drive file", "Drive permissions"

## MCP Server Configuration

**Type:** stdio MCP Server (external)
**Package:** `@modelcontextprotocol/server-google-workspace` or `google-workspace-mcp`
**Config Location:** `~/.claude/settings.json` (mcpServers section)
**Credentials Location:** `~/.config/google-workspace-mcp/credentials.json`

### Settings Template

Add this to `~/.claude/settings.json` under the `mcpServers` key:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "uvx",
      "args": ["google-workspace-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "your-client-secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
        "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file"
      }
    }
  }
}
```

**Important:** Restart Claude Code after adding MCP server configuration.

### OAuth Setup

OAuth authentication happens automatically on first use:

1. Install the skill files (see INSTALL.md)
2. Configure MCP server in settings.json (see above)
3. Restart Claude Code
4. Run any Gmail/Calendar/Drive command
5. Browser opens for Google authorization
6. Approve the requested permissions
7. Tokens saved automatically to `~/.config/google-workspace-mcp/credentials.json`
8. Future operations use stored tokens (auto-refresh)

**To re-authorize:** Delete `~/.config/google-workspace-mcp/credentials.json` and run any command.

## Workflow Routing

| User Intent | Route To | MCP Tools Used |
|------------|----------|---------------|
| Send email | Workflows/Gmail.md | gmail_send_message |
| Read inbox | Workflows/Gmail.md | gmail_list_messages |
| Search email | Workflows/Gmail.md | gmail_search_messages |
| Read specific message | Workflows/Gmail.md | gmail_get_message |
| Create draft | Workflows/Gmail.md | gmail_create_draft |
| List events | Workflows/Calendar.md | calendar_list_events |
| Create event | Workflows/Calendar.md | calendar_create_event |
| Update event | Workflows/Calendar.md | calendar_update_event |
| Delete event | Workflows/Calendar.md | calendar_delete_event |
| List Drive files | Workflows/Drive.md | drive_list_files |
| Search Drive | Workflows/Drive.md | drive_search_files |
| Upload file | Workflows/Drive.md | drive_upload_file |
| Download file | Workflows/Drive.md | drive_download_file |
| Share file | Workflows/Drive.md | drive_update_permissions |

## MCP Tool Reference

The Google Workspace MCP server provides these tools:

### Gmail Tools
- `gmail_send_message` - Send an email
- `gmail_list_messages` - List messages in inbox
- `gmail_search_messages` - Search for specific messages
- `gmail_get_message` - Get full message content
- `gmail_create_draft` - Create draft email

### Calendar Tools
- `calendar_list_events` - List calendar events
- `calendar_create_event` - Create new calendar event
- `calendar_update_event` - Update existing event
- `calendar_delete_event` - Delete calendar event

### Drive Tools
- `drive_list_files` - List files in Drive
- `drive_search_files` - Search Drive for files
- `drive_upload_file` - Upload file to Drive
- `drive_download_file` - Download file from Drive
- `drive_update_permissions` - Manage file sharing/permissions

## Integration with PAI

### Credential Management

**CRITICAL:** OAuth credentials for Google Workspace are NOT stored in `$PAI_DIR/.env`.

The MCP server manages OAuth tokens separately:

| What | Where | Managed By |
|------|-------|-----------|
| OAuth Client ID/Secret | `~/.claude/settings.json` | You (manual config) |
| OAuth Access/Refresh Tokens | `~/.config/google-workspace-mcp/credentials.json` | MCP server (automatic) |
| Other PAI API Keys | `$PAI_DIR/.env` | PAI (standard location) |

**Why separate?** The MCP server needs full control of OAuth token lifecycle (refresh, expiry) which requires managing its own credential storage.

### Security Notes

- OAuth credentials grant full access to Gmail, Calendar, and Drive within approved scopes
- Credentials stored with file permissions 600 (user read/write only)
- Never commit `settings.json` or `~/.config/google-workspace-mcp/` to version control
- Revoke access at: https://myaccount.google.com/permissions

### Observability

MCP tool calls are captured by PAI's hook system:

- **PreToolUse hook:** Logs tool name and input parameters
- **PostToolUse hook:** Logs tool output and execution time
- **Storage:** `$PAI_DIR/history/raw-outputs/YYYY-MM/YYYY-MM-DD_all-events.jsonl`

Example log entry:
```json
{
  "event": "PreToolUse",
  "tool": "gmail_send_message",
  "input": {"to": "bob@example.com", "subject": "Test"},
  "timestamp": "2026-01-13T15:30:00Z"
}
```

### Memory/History

Google Workspace operations are automatically captured:

- Emails sent → Logged with recipients and subject
- Calendar events created → Logged with title and time
- Drive operations → Logged with file names and paths

Your AI assistant remembers what it sent/scheduled/uploaded because it performed those operations and logged them.

## Troubleshooting

### MCP Server Not Connected

**Symptoms:** Claude Code says "I don't have access to Gmail/Calendar tools"

**Solutions:**
1. Verify MCP server is configured in `settings.json`:
   ```bash
   cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]'
   ```
2. Restart Claude Code (MCP servers load at startup)
3. Check JSON syntax is valid:
   ```bash
   jq . ~/.claude/settings.json
   ```
4. Test MCP server command manually:
   ```bash
   uvx google-workspace-mcp --help
   ```

### OAuth Authorization Failed

**Symptoms:** Browser shows "Authorization failed" or "Invalid credentials"

**Solutions:**
1. Verify Client ID and Secret are correct in `settings.json`
2. Check redirect URI matches exactly: `http://localhost:8080/oauth2callback`
3. Verify you added your email as test user in Google Cloud Console
4. Delete stale credentials and re-auth:
   ```bash
   rm -rf ~/.config/google-workspace-mcp/credentials.json
   ```
5. Restart Claude Code and run any Gmail/Calendar/Drive command

### Token Expired

**Symptoms:** Operations fail with "Invalid credentials" after working previously

**Solutions:**
- MCP server should auto-refresh tokens (refresh token valid for months/years)
- If auto-refresh fails:
  ```bash
  rm -rf ~/.config/google-workspace-mcp/credentials.json
  # Restart Claude Code
  # Run any command to re-trigger OAuth flow
  ```

### Skill Not Routing

**Symptoms:** Natural language triggers don't activate the skill

**Solutions:**
1. Verify skill is installed:
   ```bash
   ls -la $PAI_DIR/skills/GoogleWorkspace/SKILL.md
   ```
2. Check TitleCase naming (must be `GoogleWorkspace/`, not `google-workspace/`)
3. Restart Claude Code (skills load at session start)
4. Use more explicit language:
   - Instead of "check email" → "Check my Gmail inbox"
   - Instead of "schedule" → "Schedule a meeting on my calendar"

### Scope/Permission Errors

**Symptoms:** Operations fail with "Insufficient permissions" or "Access denied"

**Solutions:**
1. Check required scope is in `GOOGLE_SCOPES` in settings.json
2. Update scopes in settings.json
3. Delete credentials (forces re-auth with new scopes):
   ```bash
   rm -rf ~/.config/google-workspace-mcp/credentials.json
   ```
4. Restart Claude Code and re-authorize

### Port 8080 Already in Use

**Symptoms:** OAuth flow fails with "Address already in use"

**Solutions:**
1. Check what's using port 8080:
   ```bash
   lsof -i :8080
   ```
2. Stop the conflicting process or change MCP server port:
   ```json
   {
     "args": ["google-workspace-mcp", "--port", "8081"]
   }
   ```
3. Update `GOOGLE_REDIRECT_URI` to match new port
4. Update redirect URI in Google Cloud Console OAuth config

## Usage Examples

### Quick Examples

**Send email:**
```
User: Send an email to bob@example.com about tomorrow's meeting
```

**Check calendar:**
```
User: What's on my calendar today?
```

**Upload to Drive:**
```
User: Upload this document to my Google Drive
```

**Search inbox:**
```
User: Search my inbox for emails from alice sent last week
```

For detailed examples and MCP tool schemas, see the workflow files:
- `Workflows/Gmail.md` - Email operations
- `Workflows/Calendar.md` - Calendar operations
- `Workflows/Drive.md` - Drive operations

## Limitations

**Internet Required:**
- Google Workspace APIs are cloud services
- No offline mode available

**One Google Account at a Time:**
- MCP server authenticates to one Google account
- To switch accounts: delete credentials and re-auth
- Multi-account usage requires multiple MCP server configurations (advanced)

**Rate Limits:**
- Google APIs have rate limits
- Excessive rapid requests may be throttled
- MCP server should handle retries gracefully

**Scope-Based Access:**
- Only operations within approved OAuth scopes work
- Default scopes: Gmail send/read, Calendar full, Drive files created by app
- Modify scopes in settings.json as needed (requires re-auth)

## Further Reading

- **Installation:** See `INSTALL.md` for complete setup instructions
- **Verification:** See `VERIFY.md` for post-install checklist
- **Pack Overview:** See `README.md` for architecture and design philosophy
- **Google Cloud Setup:** https://console.cloud.google.com
- **OAuth Permissions:** https://myaccount.google.com/permissions
