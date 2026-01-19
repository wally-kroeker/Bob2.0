# GoogleWorkspace Skill - Installation

This guide walks you through setting up natural language access to Gmail, Calendar, and Google Drive. By the end, you'll be able to say "Send an email to bob@example.com" and have it work seamlessly.

---

## Prerequisites

Before starting, ensure you have:

### System Requirements
- **Claude Code** installed and working
- **PAI Core** (`pai-core-install` pack) installed
- **Bun runtime** (for TypeScript execution)
- **Internet connection** (required for Google Workspace APIs)
- **Write access** to `$PAI_DIR/skills/` (default: `~/.claude/skills/`)

### Knowledge Requirements
- Basic command line familiarity
- Ability to navigate Google Cloud Console
- Understanding of OAuth (we'll guide you through it)
- Text editor for JSON editing (we recommend `jq` or VS Code)

### Account Requirements
- **Google Account** with access to Gmail, Calendar, and Drive
- **Google Cloud Console** account (free tier is sufficient)
  - Go to [console.cloud.google.com](https://console.cloud.google.com)
  - Sign in with your Google account
  - No billing required for this integration

---

## Pre-Installation: System Analysis

**IMPORTANT:** Run these checks before proceeding. They detect conflicts and save you troubleshooting time later.

### Step 0.1: Check PAI Installation

```bash
# Verify PAI_DIR is set
echo "PAI_DIR: ${PAI_DIR:-'NOT SET - will use ~/.claude'}"

# Check if skills directory exists
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills" ]; then
  echo "✓ Skills directory exists at: $PAI_CHECK/skills"
  ls -la "$PAI_CHECK/skills/" | grep -E "(CORE|^d)"
else
  echo "✗ FAIL: Skills directory does not exist"
  echo "ACTION REQUIRED: Install pai-core-install pack first"
fi
```

**Expected output:**
```
PAI_DIR: /home/bob/.claude
✓ Skills directory exists at: /home/bob/.claude/skills
drwxrwxr-x  2 bob bob 4096 Jan 13 12:00 CORE
```

### Step 0.2: Check for Existing GoogleWorkspace Skill

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills/GoogleWorkspace" ]; then
  echo "⚠️  GoogleWorkspace skill already exists"
  echo "Location: $PAI_CHECK/skills/GoogleWorkspace/"
  ls -la "$PAI_CHECK/skills/GoogleWorkspace/"
  echo "ACTION REQUIRED: Backup before reinstalling"
else
  echo "✓ GoogleWorkspace skill not installed (clean install)"
fi
```

### Step 0.3: Check for Existing MCP Configuration

```bash
# Check if settings.json exists
if [ -f ~/.claude/settings.json ]; then
  echo "✓ settings.json exists"

  # Check for existing google-workspace MCP server
  if grep -q '"google-workspace"' ~/.claude/settings.json 2>/dev/null; then
    echo "⚠️  google-workspace MCP server already configured"
    echo "Current configuration:"
    cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]'
    echo "ACTION REQUIRED: Review and merge configurations"
  else
    echo "✓ No google-workspace MCP configured (clean install)"
  fi

  # Check for other MCP servers
  echo ""
  echo "Existing MCP servers:"
  cat ~/.claude/settings.json | jq '.mcpServers | keys'
else
  echo "✓ No settings.json found (will create new)"
fi
```

### Step 0.4: Check for Existing OAuth Credentials

```bash
# Check for OAuth credential directory
if [ -d ~/.config/google-workspace-mcp ]; then
  echo "⚠️  OAuth credentials directory exists"
  ls -la ~/.config/google-workspace-mcp/
  echo ""
  echo "If credentials are stale or for different account:"
  echo "  rm -rf ~/.config/google-workspace-mcp/"
else
  echo "✓ No OAuth credentials (will create on first use)"
fi
```

### Step 0.5: Conflict Resolution Matrix

Based on the checks above, determine your installation path:

| Scenario | Detected By | Action |
|----------|-------------|--------|
| **Clean install** | All checks pass | Proceed to Part 1 |
| **No PAI_DIR/skills/** | Step 0.1 fails | **STOP:** Install `pai-core-install` first |
| **GoogleWorkspace exists** | Step 0.2 warns | Backup existing, then proceed (will overwrite) |
| **MCP already configured** | Step 0.3 warns | Follow "Merge MCP Configuration" in Part 4 |
| **OAuth exists** | Step 0.4 warns | Keep existing (unless switching accounts) |

**Decision point:** Are you ready to proceed?
- [ ] PAI_DIR/skills/ directory exists
- [ ] No blocking conflicts OR conflicts resolved
- [ ] Google Cloud Console account ready

---

## Part 1: Google Cloud Platform Setup

This section creates the OAuth application that allows Claude Code to access your Google Workspace data.

### Step 1.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the **project dropdown** at the top (says "Select a project")
4. Click **"NEW PROJECT"** button (top right)
5. Enter project name: `Claude Code - Google Workspace`
6. Click **"CREATE"**
7. Wait 10-20 seconds for project creation
8. Click **"SELECT PROJECT"** when notification appears

**Success check:** Top bar shows your new project name

### Step 1.2: Enable Required APIs

**Enable Gmail API:**
1. In left sidebar, go to **APIs & Services** → **Library**
2. Search for `Gmail API`
3. Click **Gmail API** card
4. Click **"ENABLE"** button
5. Wait for confirmation message

**Enable Calendar API:**
1. Click **"Go to APIs overview"** or return to **Library**
2. Search for `Google Calendar API`
3. Click **Google Calendar API** card
4. Click **"ENABLE"** button

**Enable Drive API:**
1. Return to **Library**
2. Search for `Google Drive API`
3. Click **Google Drive API** card
4. Click **"ENABLE"** button

**Success check:** All three APIs show "Enabled" status in **APIs & Services** → **Enabled APIs**

### Step 1.3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen** (left sidebar)
2. Select **External** user type
3. Click **"CREATE"**

**App information:**
- **App name:** `Claude Code`
- **User support email:** [your email]
- **App logo:** (optional, skip)
- **Application home page:** (optional, skip)
- **Application privacy policy:** (optional, skip)
- **Application terms of service:** (optional, skip)
- **Authorized domains:** (leave empty)
- **Developer contact email:** [your email]
4. Click **"SAVE AND CONTINUE"**

**Scopes (Step 2):**
5. Click **"ADD OR REMOVE SCOPES"**
6. Filter or search for these scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/drive.file`
7. Check the boxes for all four scopes
8. Click **"UPDATE"** at bottom
9. Verify all four scopes appear in table
10. Click **"SAVE AND CONTINUE"**

**Test users (Step 3):**
11. Click **"ADD USERS"**
12. Enter your Google email address
13. Click **"ADD"**
14. Click **"SAVE AND CONTINUE"**

**Summary (Step 4):**
15. Review settings
16. Click **"BACK TO DASHBOARD"**

**Success check:** OAuth consent screen shows "External" with your email as test user

### Step 1.4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **"+ CREATE CREDENTIALS"** at top
3. Select **"OAuth client ID"**
4. **Application type:** Desktop app
5. **Name:** `Claude Code Desktop`
6. Click **"CREATE"**

**Important:** A dialog appears with your credentials.

7. **COPY THESE VALUES** (you'll need them in Part 4):
   - **Client ID:** `abc123.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-xyz789`
8. Click **"DOWNLOAD JSON"** (optional backup)
9. Click **"OK"** to close dialog

**Success check:** Credentials page shows "Claude Code Desktop" OAuth 2.0 Client ID

**Store these securely:** You'll add them to `settings.json` in Part 4.

---

## Part 2: Install MCP Server

The Model Context Protocol (MCP) server handles all the OAuth complexity and API communication. You'll install it, then configure it in Part 4.

### Step 2.1: Check Installation Method

The Google Workspace MCP server can be installed via:
- **uvx** (Python-based, recommended by MCP team)
- **npm/npx** (Node-based, alternative)

We'll use `uvx` (simpler, fewer dependencies).

### Step 2.2: Install via uvx (Recommended)

**Check if uvx is installed:**
```bash
which uvx
```

**If uvx not found, install it:**
```bash
# Option 1: Via pip (if you have Python)
pip install uvx

# Option 2: Via pipx (if you have pipx)
pipx install uvx

# Option 3: Via package manager
# Ubuntu/Debian:
sudo apt install uvx
# macOS:
brew install uvx
```

**Verify uvx works:**
```bash
uvx --version
```

**Test MCP server installation:**
```bash
# This will auto-install on first run (no manual install needed)
uvx google-workspace-mcp --help
```

**Expected output:**
```
usage: google-workspace-mcp [-h] [--port PORT]

Google Workspace MCP Server

options:
  -h, --help   show this help message and exit
  --port PORT  Port to listen on (default: 8080)
```

**Success check:** Command runs without errors. The MCP server is ready to be configured.

### Step 2.3: Alternative - Install via npm (If Needed)

If `uvx` doesn't work on your system:

```bash
# Check npm is installed
npm --version

# Install MCP server globally
npm install -g google-workspace-mcp

# Verify installation
google-workspace-mcp --help
```

**Note for Part 4:** If you used npm, your command in `settings.json` will be different:
- uvx: `"command": "uvx"`
- npm: `"command": "google-workspace-mcp"`

---

## Part 3: Install Skill Files

Now we install the skill files that provide natural language routing to the MCP server.

### Step 3.1: Create Skill Directory

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/GoogleWorkspace"
```

### Step 3.2: Copy Skill Files

From the pack's `src/` directory:

```bash
# If you're in the bob-google-workspace-skill directory:
cp -r src/skills/GoogleWorkspace/* "$PAI_DIR/skills/GoogleWorkspace/"

# Or from absolute path:
cp -r /home/bob/projects/Bob2.0/BobPacks/bob-google-workspace-skill/src/skills/GoogleWorkspace/* "$PAI_DIR/skills/GoogleWorkspace/"
```

### Step 3.3: Verify File Structure

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
tree "$PAI_DIR/skills/GoogleWorkspace/" -L 2
```

**Expected structure:**
```
/home/bob/.claude/skills/GoogleWorkspace/
├── SKILL.md
└── Workflows/
    ├── Gmail.md
    ├── Calendar.md
    └── Drive.md
```

**Success check:**
```bash
[ -f "$PAI_DIR/skills/GoogleWorkspace/SKILL.md" ] && echo "✓ SKILL.md installed" || echo "✗ FAIL: SKILL.md missing"
[ -d "$PAI_DIR/skills/GoogleWorkspace/Workflows" ] && echo "✓ Workflows/ directory exists" || echo "✗ FAIL: Workflows/ missing"
```

---

## Part 4: Configure MCP in Claude Code settings.json

This is where you connect the MCP server to Claude Code and provide your OAuth credentials.

### Step 4.1: Locate settings.json

```bash
# Check if settings.json exists
if [ -f ~/.claude/settings.json ]; then
  echo "✓ settings.json exists"
  echo "Backup before editing:"
  cp ~/.claude/settings.json ~/.claude/settings.json.backup.$(date +%Y%m%d-%H%M%S)
else
  echo "Creating new settings.json"
  echo '{}' > ~/.claude/settings.json
fi
```

### Step 4.2: Configuration Template

You'll add this configuration to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "uvx",
      "args": ["google-workspace-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "YOUR_CLIENT_ID_FROM_STEP_1.4.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "GOCSPX-YOUR_CLIENT_SECRET_FROM_STEP_1.4",
        "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
        "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file"
      }
    }
  }
}
```

**Replace placeholders:**
- `YOUR_CLIENT_ID_FROM_STEP_1.4` → Your Client ID from Part 1, Step 1.4
- `GOCSPX-YOUR_CLIENT_SECRET_FROM_STEP_1.4` → Your Client Secret from Part 1, Step 1.4

### Step 4.3: Merge or Create Configuration

**Scenario A: Clean install (no existing settings.json or empty file)**

```bash
cat > ~/.claude/settings.json << 'EOF'
{
  "mcpServers": {
    "google-workspace": {
      "command": "uvx",
      "args": ["google-workspace-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "GOCSPX-YOUR_CLIENT_SECRET_HERE",
        "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
        "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file"
      }
    }
  }
}
EOF

# Then manually edit to replace YOUR_CLIENT_ID_HERE and YOUR_CLIENT_SECRET_HERE
nano ~/.claude/settings.json  # or: code ~/.claude/settings.json
```

**Scenario B: Existing MCP servers (merge required)**

```bash
# View current mcpServers
cat ~/.claude/settings.json | jq '.mcpServers'

# Use jq to merge (safer than manual editing)
jq '.mcpServers["google-workspace"] = {
  "command": "uvx",
  "args": ["google-workspace-mcp"],
  "env": {
    "GOOGLE_CLIENT_ID": "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",
    "GOOGLE_CLIENT_SECRET": "GOCSPX-YOUR_CLIENT_SECRET_HERE",
    "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
    "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file"
  }
}' ~/.claude/settings.json > ~/.claude/settings.json.tmp && mv ~/.claude/settings.json.tmp ~/.claude/settings.json

# Then manually edit to replace YOUR_CLIENT_ID_HERE and YOUR_CLIENT_SECRET_HERE
nano ~/.claude/settings.json
```

**Important notes:**
- `settings.json` must be **valid JSON** (no trailing commas, proper quotes)
- Keep existing MCP servers (like `vikunja`, etc.) unchanged
- Only add/update the `google-workspace` entry

### Step 4.4: Verify Configuration

```bash
# Check JSON is valid
jq . ~/.claude/settings.json > /dev/null && echo "✓ Valid JSON" || echo "✗ FAIL: Invalid JSON"

# Check google-workspace MCP exists
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]'
```

**Expected output:**
```json
{
  "command": "uvx",
  "args": [
    "google-workspace-mcp"
  ],
  "env": {
    "GOOGLE_CLIENT_ID": "123456789.apps.googleusercontent.com",
    "GOOGLE_CLIENT_SECRET": "GOCSPX-abcdefg123",
    "GOOGLE_REDIRECT_URI": "http://localhost:8080/oauth2callback",
    "GOOGLE_SCOPES": "https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file"
  }
}
```

**Success check:**
- [ ] JSON is valid (jq parses without errors)
- [ ] `google-workspace` key exists in `mcpServers`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are **your actual values** (not placeholders)
- [ ] Other MCP servers (if any) remain intact

---

## Part 5: First-Time OAuth Authentication

Now you'll authorize Claude Code to access your Google Workspace data.

### Step 5.1: Restart Claude Code

**Critical:** MCP servers only load on startup.

```bash
# If running in terminal, exit and restart:
exit  # Then run: claude

# If running in VS Code, close terminal and reopen
```

### Step 5.2: Trigger OAuth Flow

In your new Claude Code session, run your first command:

```
User: Check my Gmail inbox
```

**What happens:**
1. Claude Code calls `gmail_list_messages` MCP tool
2. MCP server detects no OAuth tokens
3. Server starts local web server on port 8080
4. **Your browser opens automatically** (or URL prints to console)
5. You see Google's authorization page

### Step 5.3: Authorize Access

In the browser:

1. **Sign in** to your Google account (if not already signed in)
2. You see: "Claude Code wants to access your Google Account"
3. Review requested permissions:
   - Read, compose, and send emails from Gmail
   - See, edit, create, and delete events on all your calendars
   - See, create, and delete its own files in Google Drive
4. Click **"Allow"**
5. Browser shows: "Authorization successful! You may close this window."
6. **Return to Claude Code** - command should now complete

### Step 5.4: Verify Token Storage

```bash
# Check credentials were saved
ls -la ~/.config/google-workspace-mcp/credentials.json

# View token metadata (DO NOT share this output)
cat ~/.config/google-workspace-mcp/credentials.json | jq '{expiry_date, token_type}'
```

**Expected output:**
```json
{
  "expiry_date": 1737144800000,
  "token_type": "Bearer"
}
```

**Success check:**
- [ ] Browser authorization completed
- [ ] `credentials.json` file created
- [ ] Claude Code command completed (showed your inbox)
- [ ] No error messages in console

### Step 5.5: OAuth Troubleshooting

**Issue: Browser doesn't open automatically**

Solution:
```bash
# Look for URL in Claude Code output:
# "Please visit: http://localhost:8080/oauth?code=..."
# Copy and paste into browser manually
```

**Issue: "Redirect URI mismatch" error**

Solution:
```bash
# Verify GOOGLE_REDIRECT_URI in settings.json matches Google Cloud Console
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"].env.GOOGLE_REDIRECT_URI'

# Should be exactly: http://localhost:8080/oauth2callback
# If different, update settings.json and restart Claude Code
```

**Issue: "Access blocked: This app's request is invalid"**

Solution:
- Check you added your email as a test user in OAuth consent screen (Part 1, Step 1.3)
- Verify Client ID and Secret are correct in `settings.json`

**Issue: Token expires (weeks later)**

Solution:
```bash
# Delete expired credentials
rm -rf ~/.config/google-workspace-mcp/credentials.json

# Restart Claude Code
# Run any Gmail/Calendar/Drive command
# Re-authorize in browser (same as Step 5.3)
```

---

## Part 6: Verify Installation

Final checks to ensure everything works.

### Step 6.1: Quick Verification

```bash
# Check skill files
[ -f "$PAI_DIR/skills/GoogleWorkspace/SKILL.md" ] && echo "✓ Skill installed" || echo "✗ FAIL"

# Check MCP config
cat ~/.claude/settings.json | jq '.mcpServers["google-workspace"]' > /dev/null 2>&1 && echo "✓ MCP configured" || echo "✗ FAIL"

# Check OAuth completed
[ -f ~/.config/google-workspace-mcp/credentials.json ] && echo "✓ OAuth completed" || echo "✗ FAIL"
```

### Step 6.2: Test Natural Language Routing

In Claude Code, try these commands:

**Test 1: Gmail**
```
User: Send a test email to myself with subject "Testing GoogleWorkspace skill"
```

**Expected:** Claude confirms details, sends email, returns message ID

**Test 2: Calendar**
```
User: What's on my calendar today?
```

**Expected:** Claude returns list of today's events (or "No events")

**Test 3: Drive**
```
User: List my recent Drive files
```

**Expected:** Claude returns list of files with names and modification dates

### Step 6.3: Complete Verification Checklist

Now run the full verification checklist:

```bash
# Link to detailed verification
cat $PAI_DIR/skills/GoogleWorkspace/../../VERIFY.md  # If VERIFY.md is in pack root
```

Or see the **VERIFY.md** file in this pack for 10 detailed verification checks.

---

## Installation Complete

If all checks passed, you now have:

- ✓ Google Cloud OAuth app configured
- ✓ MCP server installed and configured
- ✓ GoogleWorkspace skill installed
- ✓ OAuth authorization completed
- ✓ Natural language commands working

**Next steps:**
1. Review `VERIFY.md` for detailed verification (10 checks)
2. Explore workflow examples in `$PAI_DIR/skills/GoogleWorkspace/Workflows/`
3. Start using natural language: "Send email...", "Check calendar...", "Search Drive..."

---

## Common Issues & Solutions

### "MCP tools not available"

**Symptoms:** Claude says "I don't have access to Gmail/Calendar tools"

**Solutions:**
1. Restart Claude Code (MCP servers only load on startup)
2. Check `settings.json` syntax (must be valid JSON)
3. Check MCP server command runs manually:
   ```bash
   uvx google-workspace-mcp --help
   ```
4. Check Claude Code logs for MCP server errors

### "Skill doesn't route"

**Symptoms:** Claude doesn't recognize "send email" or "check calendar"

**Solutions:**
1. Check TitleCase: Directory must be `GoogleWorkspace/` not `google-workspace/`
   ```bash
   ls $PAI_DIR/skills/ | grep -i google
   ```
2. Check SKILL.md exists and has correct name:
   ```bash
   grep "^name: GoogleWorkspace" "$PAI_DIR/skills/GoogleWorkspace/SKILL.md"
   ```
3. Restart Claude Code (skills load on session start)
4. Use more explicit language: "Check my Gmail inbox" vs "check email"

### "OAuth keeps expiring"

**Symptoms:** Frequently asked to re-authorize

**Causes:**
- Access tokens expire after 1 hour (normal)
- Refresh tokens should auto-renew (MCP server handles this)
- If refresh token invalid, need re-auth

**Solutions:**
1. Check MCP server logs for refresh errors
2. Verify scopes haven't changed in `settings.json`
3. For persistent issues, regenerate OAuth credentials in Google Cloud Console

### "Cannot read property of undefined (settings.json)"

**Symptoms:** Claude Code fails to start after editing `settings.json`

**Solution:**
1. Validate JSON syntax:
   ```bash
   jq . ~/.claude/settings.json
   ```
2. Check for common errors:
   - Trailing commas
   - Missing quotes around keys/values
   - Unescaped characters in strings
3. Restore backup:
   ```bash
   ls ~/.claude/settings.json.backup.*
   cp ~/.claude/settings.json.backup.YYYYMMDD-HHMMSS ~/.claude/settings.json
   ```

### "Port 8080 already in use"

**Symptoms:** OAuth flow fails with "address already in use"

**Solutions:**
1. Check what's using port 8080:
   ```bash
   lsof -i :8080
   ```
2. Stop conflicting process or change MCP server port:
   ```json
   {
     "args": ["google-workspace-mcp", "--port", "8081"]
   }
   ```
3. Update `GOOGLE_REDIRECT_URI` to match new port (and update in Google Cloud Console)

---

## Security Reminders

### Credential Locations

| What | Where | Why |
|------|-------|-----|
| OAuth Client ID/Secret | `~/.claude/settings.json` | MCP server needs these to authenticate |
| OAuth Access/Refresh Tokens | `~/.config/google-workspace-mcp/credentials.json` | MCP server manages token lifecycle |
| Other PAI API Keys | `$PAI_DIR/.env` | PAI's single source of truth (but NOT Google OAuth) |

**Important:**
- `settings.json` contains secrets - set permissions: `chmod 600 ~/.claude/settings.json`
- Never commit these files to version control
- Add to `.gitignore`: `settings.json`, `.config/google-workspace-mcp/`

### Revoking Access

To revoke Claude Code's access to your Google Workspace:

1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find "Claude Code" or your OAuth app name
3. Click **"Remove Access"**
4. Delete local credentials:
   ```bash
   rm -rf ~/.config/google-workspace-mcp/
   ```
5. (Optional) Delete OAuth credentials from Google Cloud Console → Credentials

---

## Getting Help

If you're stuck:

1. **Check VERIFY.md** - Detailed troubleshooting for each verification step
2. **Check Claude Code logs** - May show MCP server connection errors
3. **Check MCP server logs** - Run manually to see OAuth/API errors:
   ```bash
   uvx google-workspace-mcp
   ```
4. **Review this INSTALL.md** - Ensure you followed each step exactly
5. **Check Google Cloud Console** - Verify APIs are enabled, OAuth app is configured

---

*Installation guide complete. Proceed to VERIFY.md for detailed verification checklist.*
