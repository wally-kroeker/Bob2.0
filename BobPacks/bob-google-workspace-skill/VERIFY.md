# GoogleWorkspace Skill - Verification Checklist

> **MANDATORY:** Complete ALL checks before marking installation as successful.

This verification ensures your GoogleWorkspace skill is properly integrated with Claude Code and the MCP server. Each check has clear pass/fail criteria and troubleshooting steps.

---

## Overview

You'll verify:
1. Skill files are installed correctly
2. MCP server is configured in `settings.json`
3. MCP server launches successfully
4. OAuth authentication is complete
5. Gmail operations work
6. Calendar operations work
7. Drive operations work
8. Skill routing triggers correctly
9. Error handling works gracefully
10. PAI hooks capture events to history

**Time required:** 15-20 minutes

---

## Check 1: Skill File Structure

Verify all skill files are in the correct locations with proper TitleCase naming.

### Commands

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== File Structure Verification ==="

# Check directory exists (TitleCase)
[ -d "$PAI_DIR/skills/GoogleWorkspace" ] && echo "✓ GoogleWorkspace directory exists" || echo "✗ FAIL: GoogleWorkspace directory missing"

# Check SKILL.md exists
[ -f "$PAI_DIR/skills/GoogleWorkspace/SKILL.md" ] && echo "✓ SKILL.md exists" || echo "✗ FAIL: SKILL.md missing"

# Check Workflows directory exists
[ -d "$PAI_DIR/skills/GoogleWorkspace/Workflows" ] && echo "✓ Workflows/ directory exists" || echo "✗ FAIL: Workflows/ directory missing"

# Check workflow files exist
for workflow in Gmail Calendar Drive; do
  if [ -f "$PAI_DIR/skills/GoogleWorkspace/Workflows/${workflow}.md" ]; then
    echo "✓ Workflows/${workflow}.md exists"
  else
    echo "✗ FAIL: Workflows/${workflow}.md missing"
  fi
done

# Check SKILL.md has correct name (TitleCase in YAML)
if grep -q "^name: GoogleWorkspace" "$PAI_DIR/skills/GoogleWorkspace/SKILL.md"; then
  echo "✓ SKILL.md has correct name (GoogleWorkspace)"
else
  echo "⚠️  WARN: Check SKILL.md name field"
fi
```

### Expected Output

```
=== File Structure Verification ===
✓ GoogleWorkspace directory exists
✓ SKILL.md exists
✓ Workflows/ directory exists
✓ Workflows/Gmail.md exists
✓ Workflows/Calendar.md exists
✓ Workflows/Drive.md exists
✓ SKILL.md has correct name (GoogleWorkspace)
```

### Pass Criteria

- [ ] All files and directories exist
- [ ] Directory is named `GoogleWorkspace` (TitleCase, not `google-workspace`)
- [ ] SKILL.md YAML frontmatter has `name: GoogleWorkspace`

### Troubleshooting

**Issue:** Directory is lowercase (`google-workspace/`)

**Solution:**
```bash
# Rename to TitleCase
mv "$PAI_DIR/skills/google-workspace" "$PAI_DIR/skills/GoogleWorkspace"
```

**Issue:** Files missing

**Solution:**
```bash
# Re-copy from pack source
cp -r /home/bob/projects/Bob2.0/BobPacks/bob-google-workspace-skill/src/skills/GoogleWorkspace/* "$PAI_DIR/skills/GoogleWorkspace/"
```

---

## Check 2: MCP Server Configuration

Verify the MCP server is correctly configured in Claude Code's `settings.json`.

### Commands

```bash
echo "=== MCP Configuration Verification ==="

# Check settings.json exists
if [ -f ~/.claude/settings.json ]; then
  echo "✓ settings.json exists"
else
  echo "✗ FAIL: settings.json not found"
  exit 1
fi

# Validate JSON syntax
if jq . ~/.claude/settings.json > /dev/null 2>&1; then
  echo "✓ settings.json is valid JSON"
else
  echo "✗ FAIL: settings.json has invalid JSON syntax"
  exit 1
fi

# Check google-workspace MCP server exists
if cat ~/.claude/settings.json | jq -e '.mcpServers["google-workspace"]' > /dev/null 2>&1; then
  echo "✓ google-workspace MCP server configured"
  echo ""
  echo "Configuration:"
  cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]'
else
  echo "✗ FAIL: google-workspace MCP server not configured"
  exit 1
fi

# Check required fields
echo ""
echo "=== Required Fields Check ==="
jq -r '.mcpServers["google-workspace"] |
  if .command then "✓ command: \(.command)" else "✗ FAIL: command missing" end,
  if .args then "✓ args: \(.args | tostring)" else "✗ FAIL: args missing" end,
  if .env.GOOGLE_CLIENT_ID then "✓ GOOGLE_CLIENT_ID set" else "✗ FAIL: GOOGLE_CLIENT_ID missing" end,
  if .env.GOOGLE_CLIENT_SECRET then "✓ GOOGLE_CLIENT_SECRET set" else "✗ FAIL: GOOGLE_CLIENT_SECRET missing" end,
  if .env.GOOGLE_REDIRECT_URI then "✓ GOOGLE_REDIRECT_URI: \(.env.GOOGLE_REDIRECT_URI)" else "✗ FAIL: GOOGLE_REDIRECT_URI missing" end,
  if .env.GOOGLE_SCOPES then "✓ GOOGLE_SCOPES set (\(.env.GOOGLE_SCOPES | split(",") | length) scopes)" else "✗ FAIL: GOOGLE_SCOPES missing" end
' ~/.claude/settings.json
```

### Expected Output

```
=== MCP Configuration Verification ===
✓ settings.json exists
✓ settings.json is valid JSON
✓ google-workspace MCP server configured

Configuration:
{
  "command": "uvx",
  "args": [
    "google-workspace-mcp"
  ],
  "env": {
    "GOOGLE_CLIENT_ID": "123456789.apps.googleusercontent.com",
    "GOOGLE_CLIENT_SECRET": "GOCSPX-abcdefg123",
    "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
    "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,..."
  }
}

=== Required Fields Check ===
✓ command: uvx
✓ args: ["google-workspace-mcp"]
✓ GOOGLE_CLIENT_ID set
✓ GOOGLE_CLIENT_SECRET set
✓ GOOGLE_REDIRECT_URI: http://localhost:8080/oauth2callback
✓ GOOGLE_SCOPES set (4 scopes)
```

### Pass Criteria

- [ ] `settings.json` exists and is valid JSON
- [ ] `mcpServers["google-workspace"]` key exists
- [ ] `command` is `uvx` or `google-workspace-mcp`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are **real values** (not placeholders)
- [ ] `GOOGLE_REDIRECT_URI` is `http://localhost:8080/oauth2callback`
- [ ] `GOOGLE_SCOPES` includes all 4 required scopes

### Troubleshooting

**Issue:** Invalid JSON syntax

**Solution:**
```bash
# Find syntax error
jq . ~/.claude/settings.json

# Common issues:
# - Trailing comma: {"key": "value",}  → remove comma
# - Missing quotes: {key: "value"}     → add quotes around "key"
# - Unescaped quotes in strings        → escape with \"

# Restore backup if needed
ls ~/.claude/settings.json.backup.*
cp ~/.claude/settings.json.backup.YYYYMMDD-HHMMSS ~/.claude/settings.json
```

**Issue:** Client ID/Secret are placeholders

**Solution:**
```bash
# Edit settings.json and replace with actual values from Google Cloud Console
nano ~/.claude/settings.json

# Values should look like:
# CLIENT_ID: "123456789012-abc123xyz789.apps.googleusercontent.com"
# CLIENT_SECRET: "GOCSPX-abc123xyz789def456"
```

---

## Check 3: MCP Server Launches Successfully

Verify the MCP server command works independently of Claude Code.

### Commands

```bash
echo "=== MCP Server Launch Test ==="

# Test if uvx is installed
if which uvx > /dev/null 2>&1; then
  echo "✓ uvx is installed"
  uvx --version
else
  echo "✗ FAIL: uvx not found"
  echo "Install: pip install uvx"
  exit 1
fi

# Test MCP server help command
echo ""
echo "Testing MCP server command:"
if uvx google-workspace-mcp --help > /dev/null 2>&1; then
  echo "✓ MCP server command works"
  uvx google-workspace-mcp --help | head -5
else
  echo "✗ FAIL: MCP server command failed"
  exit 1
fi
```

### Expected Output

```
=== MCP Server Launch Test ===
✓ uvx is installed
uvx, version 1.2.3

Testing MCP server command:
✓ MCP server command works
usage: google-workspace-mcp [-h] [--port PORT]

Google Workspace MCP Server
```

### Pass Criteria

- [ ] `uvx` command is available
- [ ] `uvx google-workspace-mcp --help` runs without errors

### Troubleshooting

**Issue:** `uvx: command not found`

**Solution:**
```bash
# Install uvx
pip install uvx

# Or via pipx
pipx install uvx

# Verify installation
which uvx
```

**Issue:** `google-workspace-mcp: No module named ...`

**Solution:**
```bash
# Force reinstall
uvx --force google-workspace-mcp --help

# Or install via npm as alternative
npm install -g google-workspace-mcp

# Update settings.json command to "google-workspace-mcp" instead of "uvx"
```

---

## Check 4: OAuth Authentication Complete

Verify OAuth credentials exist and are valid.

### Commands

```bash
echo "=== OAuth Credential Verification ==="

# Check credential directory exists
if [ -d ~/.config/google-workspace-mcp ]; then
  echo "✓ OAuth credential directory exists"
else
  echo "⚠️  WARN: OAuth credential directory not found"
  echo "This is normal if you haven't run your first command yet"
  echo "ACTION: Run a Gmail/Calendar/Drive command in Claude Code to trigger OAuth"
  exit 0
fi

# Check credentials.json exists
if [ -f ~/.config/google-workspace-mcp/credentials.json ]; then
  echo "✓ credentials.json exists"

  # Show token metadata (NOT the actual token)
  echo ""
  echo "Token metadata:"
  cat ~/.config/google-workspace-mcp/credentials.json | jq '{
    token_type,
    expiry_date,
    scopes: (.scope | split(" ") | length)
  }'

  # Check if token is expired
  expiry=$(jq -r '.expiry_date' ~/.config/google-workspace-mcp/credentials.json)
  current=$(date +%s000)
  if [ "$expiry" -gt "$current" ]; then
    echo "✓ Token is valid (not expired)"
  else
    echo "⚠️  WARN: Token is expired (will auto-refresh on next use)"
  fi
else
  echo "⚠️  WARN: credentials.json not found"
  echo "ACTION: Run a Gmail/Calendar/Drive command to trigger OAuth"
fi
```

### Expected Output

```
=== OAuth Credential Verification ===
✓ OAuth credential directory exists
✓ credentials.json exists

Token metadata:
{
  "token_type": "Bearer",
  "expiry_date": 1737144800000,
  "scopes": 4
}
✓ Token is valid (not expired)
```

### Pass Criteria

- [ ] `~/.config/google-workspace-mcp/` directory exists
- [ ] `credentials.json` file exists
- [ ] Token metadata shows `token_type: "Bearer"` and valid `expiry_date`

### Troubleshooting

**Issue:** Directory/file doesn't exist

**Solution:**
```bash
# This is normal before first use. Trigger OAuth flow:
# 1. Restart Claude Code
# 2. Run command: "Check my Gmail inbox"
# 3. Browser opens for authorization
# 4. Complete authorization
# 5. Return here and re-run Check 4
```

**Issue:** Token expired and not auto-refreshing

**Solution:**
```bash
# Delete expired credentials
rm -rf ~/.config/google-workspace-mcp/credentials.json

# Restart Claude Code
# Run any Gmail/Calendar/Drive command
# Complete OAuth authorization again
```

---

## Check 5: Gmail Operations Work

Test Gmail functionality through the MCP server.

### Commands

**In Claude Code session, run:**

```
User: List my most recent Gmail messages (last 5)
```

### Expected Behavior

1. Claude recognizes "Gmail" trigger
2. Routes to `GoogleWorkspace` skill
3. Calls `gmail_list_messages` MCP tool
4. Returns formatted list of messages with:
   - From (sender)
   - Subject
   - Date
   - Snippet (preview)

### Expected Output Format

```
Here are your 5 most recent Gmail messages:

1. From: alice@example.com
   Subject: Project Update
   Date: 2026-01-13 14:30
   Preview: "Hi, here's the status update on..."

2. From: notifications@github.com
   Subject: [Repo] New PR opened
   Date: 2026-01-13 12:15
   Preview: "User123 opened a new pull request..."

[3 more messages...]
```

### Pass Criteria

- [ ] Command completes without errors
- [ ] Returns actual messages from your inbox
- [ ] Shows sender, subject, date for each message
- [ ] No "MCP tools not available" error

### Troubleshooting

**Issue:** "MCP tools not available"

**Solution:**
```bash
# 1. Restart Claude Code (MCP servers only load on startup)
# 2. Check settings.json is correct (Check 2)
# 3. Check MCP server launches (Check 3)
```

**Issue:** "OAuth authorization required"

**Solution:**
```bash
# Browser should open automatically for authorization
# If not, look for URL in output and open manually
# Complete authorization, then retry command
```

**Issue:** "Insufficient permissions"

**Solution:**
```bash
# Check GOOGLE_SCOPES in settings.json includes:
# https://www.googleapis.com/auth/gmail.readonly

cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"].env.GOOGLE_SCOPES'

# If scope missing, add it and re-authorize:
# 1. Update settings.json
# 2. Delete credentials: rm -rf ~/.config/google-workspace-mcp/
# 3. Restart Claude Code
# 4. Re-run command (triggers re-auth with new scopes)
```

---

## Check 6: Calendar Operations Work

Test Google Calendar functionality.

### Commands

**In Claude Code session, run:**

```
User: What events do I have on my calendar this week?
```

### Expected Behavior

1. Claude recognizes "calendar" trigger
2. Routes to `GoogleWorkspace` skill
3. Calls `calendar_list_events` MCP tool
4. Returns formatted list of events with:
   - Event title
   - Start date/time
   - End date/time
   - Attendees (if any)

### Expected Output Format

```
Here are your calendar events this week:

Monday, Jan 13:
- 9:00 AM - 10:00 AM: Team Standup
  Attendees: alice@example.com, bob@example.com

- 2:00 PM - 3:00 PM: Project Review
  Attendees: manager@example.com

Tuesday, Jan 14:
- 1:00 PM - 2:00 PM: 1-on-1 with Alice
  [No other attendees]

[Rest of week...]
```

Or if no events:
```
You have no events scheduled this week.
```

### Pass Criteria

- [ ] Command completes without errors
- [ ] Returns actual events from your calendar (or "no events" if empty)
- [ ] Shows event titles, times, and attendees
- [ ] No permission errors

### Troubleshooting

**Issue:** "Insufficient permissions" or scope errors

**Solution:**
```bash
# Verify GOOGLE_SCOPES includes calendar scope:
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"].env.GOOGLE_SCOPES' | grep calendar

# Should include: https://www.googleapis.com/auth/calendar

# If missing, add scope and re-authorize (see Check 5 troubleshooting)
```

---

## Check 7: Drive Operations Work

Test Google Drive functionality.

### Commands

**In Claude Code session, run:**

```
User: List my recent files in Google Drive (last 10)
```

### Expected Behavior

1. Claude recognizes "Drive" trigger
2. Routes to `GoogleWorkspace` skill
3. Calls `drive_list_files` or `drive_search_files` MCP tool
4. Returns formatted list of files with:
   - File name
   - File type (doc, sheet, pdf, etc.)
   - Last modified date
   - Owner

### Expected Output Format

```
Here are your 10 most recent Google Drive files:

1. Project Proposal.docx
   Type: Google Doc
   Modified: 2026-01-13 at 3:45 PM
   Owner: you@example.com

2. Budget Q1 2026.xlsx
   Type: Google Sheet
   Modified: 2026-01-12 at 10:20 AM
   Owner: you@example.com

[8 more files...]
```

### Pass Criteria

- [ ] Command completes without errors
- [ ] Returns actual files from your Drive
- [ ] Shows file names, types, and modification dates
- [ ] No permission errors

### Troubleshooting

**Issue:** "Insufficient permissions"

**Solution:**
```bash
# Verify GOOGLE_SCOPES includes drive scope:
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"].env.GOOGLE_SCOPES' | grep drive

# Should include: https://www.googleapis.com/auth/drive.file

# If missing, add scope and re-authorize
```

---

## Check 8: Skill Routing Works

Verify the skill triggers correctly on natural language commands.

### Commands

Test these trigger phrases in Claude Code:

**Gmail triggers:**
- "Send an email to test@example.com"
- "Check my Gmail inbox"
- "Search my email for messages from alice"

**Calendar triggers:**
- "What's on my calendar today?"
- "Schedule a meeting tomorrow at 2pm"
- "Show me next week's events"

**Drive triggers:**
- "List my Drive files"
- "Search Drive for presentation"
- "Upload this file to Drive"

### Expected Behavior

For each trigger:
1. Claude **acknowledges the request**
2. **Does NOT say** "I don't have access to that" or "MCP tools not available"
3. **Calls the appropriate MCP tool** (gmail_*, calendar_*, drive_*)
4. **Returns relevant results** or asks for clarification

### Pass Criteria

- [ ] At least 2 Gmail triggers work
- [ ] At least 2 Calendar triggers work
- [ ] At least 2 Drive triggers work
- [ ] Skill routes without explicit "use GoogleWorkspace skill" instruction

### Troubleshooting

**Issue:** Skill doesn't trigger (Claude says "I can't do that")

**Solutions:**

1. **Check TitleCase:**
   ```bash
   # Directory MUST be TitleCase
   ls $PAI_DIR/skills/ | grep Google
   # Should show: GoogleWorkspace
   # NOT: google-workspace or googleworkspace
   ```

2. **Check SKILL.md name:**
   ```bash
   grep "^name:" "$PAI_DIR/skills/GoogleWorkspace/SKILL.md"
   # Should be: name: GoogleWorkspace
   ```

3. **Check CORE skill loaded:**
   ```bash
   # At Claude Code session start, you should see CORE skill load
   # If not, verify pai-core-install is installed
   [ -f "$PAI_DIR/skills/CORE/SKILL.md" ] && echo "✓ CORE installed" || echo "✗ FAIL: CORE missing"
   ```

4. **Restart Claude Code:**
   ```bash
   # Skills only load on session start
   exit  # Then restart: claude
   ```

5. **Try more explicit language:**
   - Instead of: "check email"
   - Try: "Check my Gmail inbox"
   - Instead of: "calendar"
   - Try: "What's on my Google Calendar today?"

---

## Check 9: Error Handling Works Gracefully

Verify the skill handles errors without crashing.

### Test Scenarios

**Test 1: Invalid email address**

```
User: Send an email to invalid-email-address
```

**Expected:** Claude asks for valid email, doesn't crash

**Test 2: Network disconnection**

```bash
# Disconnect network (or block Google APIs in firewall)
# Then in Claude Code:
User: Check my Gmail inbox
```

**Expected:** Error message about network/MCP server, not a crash

**Test 3: Missing credentials**

```bash
# Delete OAuth credentials
rm -rf ~/.config/google-workspace-mcp/credentials.json

# In Claude Code:
User: List my calendar events
```

**Expected:** Browser opens for re-authorization, process recovers

### Pass Criteria

- [ ] Invalid inputs produce helpful error messages (not crashes)
- [ ] Network errors are reported clearly
- [ ] Missing OAuth triggers re-authorization (not crash)
- [ ] Claude Code remains responsive after errors

### Troubleshooting

**Issue:** Claude Code crashes on error

**Solution:**
```bash
# Check Claude Code logs for stack trace
# Report issue to PAI maintainers or MCP server team
# Workaround: Restart Claude Code after each error
```

---

## Check 10: PAI Hooks Capture Events

Verify PAI's observability system logs MCP operations.

### Commands

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
TODAY=$(date +%Y-%m-%d)
MONTH=$(date +%Y-%m)

echo "=== PAI Hook Verification ==="

# Check history directory exists
if [ -d "$PAI_DIR/history/raw-outputs/$MONTH" ]; then
  echo "✓ History directory exists"
else
  echo "⚠️  WARN: History directory not found"
  echo "Location: $PAI_DIR/history/raw-outputs/$MONTH"
  exit 0
fi

# Search for Google Workspace MCP tool calls
echo ""
echo "Recent Google Workspace operations:"
grep -h "gmail_\|calendar_\|drive_" "$PAI_DIR/history/raw-outputs/$MONTH/"*".jsonl" 2>/dev/null | tail -5 | jq -r '
  if .tool_name then
    "\(.timestamp // "N/A") | \(.tool_name) | \(.event_type)"
  else
    empty
  end
' 2>/dev/null

# Count operations
echo ""
echo "Operation counts:"
for tool in gmail calendar drive; do
  count=$(grep -ch "${tool}_" "$PAI_DIR/history/raw-outputs/$MONTH/"*".jsonl" 2>/dev/null | awk '{s+=$1} END {print s}')
  echo "  ${tool}: ${count:-0} operations"
done
```

### Expected Output

```
=== PAI Hook Verification ===
✓ History directory exists

Recent Google Workspace operations:
2026-01-13T15:30:00 | gmail_list_messages | PreToolUse
2026-01-13T15:30:02 | gmail_list_messages | PostToolUse
2026-01-13T15:32:10 | calendar_list_events | PreToolUse
2026-01-13T15:32:11 | calendar_list_events | PostToolUse
2026-01-13T15:35:00 | drive_list_files | PreToolUse

Operation counts:
  gmail: 12 operations
  calendar: 6 operations
  drive: 4 operations
```

### Pass Criteria

- [ ] History directory exists (`$PAI_DIR/history/raw-outputs/YYYY-MM/`)
- [ ] JSONL files contain `gmail_*`, `calendar_*`, or `drive_*` tool calls
- [ ] Both `PreToolUse` and `PostToolUse` events are logged
- [ ] Timestamps are recent (match your testing time)

### Troubleshooting

**Issue:** No history directory

**Solution:**
```bash
# Verify pai-core-install hooks are installed
ls -la "$PAI_DIR/hooks/"

# Should see: PreToolUse, PostToolUse hooks
# If missing, reinstall pai-core-install pack
```

**Issue:** No Google Workspace operations logged

**Solution:**
```bash
# 1. Run a test command in Claude Code:
#    "Check my Gmail inbox"
# 2. Wait 5-10 seconds
# 3. Re-run Check 10 commands
# 4. If still empty, check hooks are registered in settings.json:
cat ~/.claude/settings.json | jq '.hooks'
```

---

## Final Checklist

Mark each check as complete:

- [ ] **Check 1:** Skill files installed with correct TitleCase structure
- [ ] **Check 2:** MCP server configured in `settings.json` with real credentials
- [ ] **Check 3:** MCP server command (`uvx google-workspace-mcp`) works
- [ ] **Check 4:** OAuth authentication complete (credentials.json exists)
- [ ] **Check 5:** Gmail operations work (list messages)
- [ ] **Check 6:** Calendar operations work (list events)
- [ ] **Check 7:** Drive operations work (list files)
- [ ] **Check 8:** Skill routes on natural language (no explicit skill invocation needed)
- [ ] **Check 9:** Error handling is graceful (no crashes)
- [ ] **Check 10:** PAI hooks capture MCP operations to history

---

## Success Criteria

**Installation is COMPLETE when ALL 10 checks pass.**

If any check fails, see the troubleshooting section for that check before proceeding.

---

## Common Issues Summary

### MCP Server Won't Start

**Symptoms:** Claude Code can't connect to MCP server

**Solutions:**
1. Check `uvx` is installed: `which uvx`
2. Verify `settings.json` syntax: `jq . ~/.claude/settings.json`
3. Test MCP server manually: `uvx google-workspace-mcp --help`
4. Restart Claude Code

### Skill Won't Route

**Symptoms:** Claude doesn't recognize Gmail/Calendar/Drive commands

**Solutions:**
1. Verify TitleCase: `ls $PAI_DIR/skills/ | grep Google`
2. Check SKILL.md name: `grep "^name:" "$PAI_DIR/skills/GoogleWorkspace/SKILL.md"`
3. Restart Claude Code (skills load at session start)
4. Use explicit language: "Check my Gmail inbox" vs "check email"

### OAuth Keeps Failing

**Symptoms:** Authorization loop, tokens invalid

**Solutions:**
1. Verify Client ID/Secret are correct in `settings.json`
2. Check redirect URI: `http://localhost:8080/oauth2callback`
3. Verify email is added as test user in Google Cloud Console
4. Delete stale credentials: `rm -rf ~/.config/google-workspace-mcp/`
5. Restart Claude Code and re-authorize

### Operations Fail with "Insufficient Permissions"

**Symptoms:** Error about missing scopes

**Solutions:**
1. Check scopes in `settings.json`:
   ```bash
   cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"].env.GOOGLE_SCOPES'
   ```
2. Should include all 4 required scopes:
   - `gmail.send`
   - `gmail.readonly`
   - `calendar`
   - `drive.file`
3. If scopes changed, re-authorize:
   - Delete credentials: `rm -rf ~/.config/google-workspace-mcp/`
   - Restart Claude Code
   - Run command (triggers OAuth with new scopes)

---

## Next Steps

Once all checks pass:

1. **Explore workflows:**
   ```bash
   cat "$PAI_DIR/skills/GoogleWorkspace/Workflows/Gmail.md"
   cat "$PAI_DIR/skills/GoogleWorkspace/Workflows/Calendar.md"
   cat "$PAI_DIR/skills/GoogleWorkspace/Workflows/Drive.md"
   ```

2. **Test advanced operations:**
   - Send emails with attachments
   - Create recurring calendar events
   - Search Drive with filters

3. **Review history:**
   ```bash
   # See all Google Workspace operations
   grep "gmail_\|calendar_\|drive_" "$PAI_DIR/history/raw-outputs/$(date +%Y-%m)/"*".jsonl" | jq .
   ```

4. **Set up observability (optional):**
   - If using `pai-observability-server`, you'll see real-time events for all Google Workspace operations

---

## Getting Help

If verification fails and troubleshooting doesn't resolve it:

1. **Check INSTALL.md** - Review each installation step
2. **Check Claude Code logs** - Look for MCP server connection errors
3. **Run MCP server manually** - See detailed error output:
   ```bash
   uvx google-workspace-mcp
   ```
4. **Verify Google Cloud Console** - Ensure APIs enabled, OAuth configured
5. **Check PAI status:**
   ```bash
   bun run "$PAI_DIR/tools/PaiCheck.ts" check
   ```

---

**Verification complete! Your GoogleWorkspace skill is ready for production use.**

Start with: `"Check my Gmail inbox"` or `"What's on my calendar today?"`
