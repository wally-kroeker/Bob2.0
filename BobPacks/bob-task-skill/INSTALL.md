# Bob Task Skill - Installation Guide

## Prerequisites

- **Bun runtime**: `curl -fsSL https://bun.sh/install | bash`
- **Claude Code** (or compatible AI agent system)
- **Vikunja instance** with API access
- **Write access** to `$PAI_DIR/` (default: `~/.claude`)

---

## Pre-Installation: System Analysis

### Step 0.1: Check Environment

```bash
# Check if PAI_DIR is set
echo "PAI_DIR: ${PAI_DIR:-'NOT SET - will use ~/.claude'}"

# Set PAI_DIR for this session
export PAI_DIR="${PAI_DIR:-$HOME/.claude}"
echo "Using PAI_DIR: $PAI_DIR"
```

### Step 0.2: Check for Existing Task Skills

```bash
# Check for old taskman skill
if [ -d "$PAI_DIR/skills/taskman" ]; then
  echo "⚠️  Old taskman skill exists at: $PAI_DIR/skills/taskman"
  echo "    Will be replaced by new Task skill"
fi

# Check for old vikunja skill
if [ -d "$PAI_DIR/skills/Vikunja" ]; then
  echo "⚠️  Old Vikunja skill exists at: $PAI_DIR/skills/Vikunja"
  echo "    Can be removed after verifying new Task skill"
fi

# Check for new Task skill
if [ -d "$PAI_DIR/skills/Task" ]; then
  echo "⚠️  Task skill already exists - will be updated"
fi
```

### Step 0.3: Verify Vikunja Access

```bash
# Test Vikunja API (replace with your URL and token)
VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"
VIKUNJA_TOKEN="your_token_here"

curl -s -H "Authorization: Bearer $VIKUNJA_TOKEN" "$VIKUNJA_URL/user" | head -c 200
# Should show user info JSON if successful
```

---

## Installation Steps

### Step 1: Create Directory Structure

```bash
export PAI_DIR="${PAI_DIR:-$HOME/.claude}"

mkdir -p "$PAI_DIR/skills/Task/data"
mkdir -p "$PAI_DIR/skills/Task/tools/lib"
```

### Step 2: Copy Skill Files

From the pack's `src/` directory, copy all files:

```bash
# From the pack directory (adjust path as needed)
PACK_DIR="/path/to/BobPacks/bob-task-skill"

# Copy skill definition
cp "$PACK_DIR/src/skills/Task/SKILL.md" "$PAI_DIR/skills/Task/"

# Copy environment template
cp "$PACK_DIR/src/skills/Task/data/.env.template" "$PAI_DIR/skills/Task/data/"

# Copy tools
cp "$PACK_DIR/src/tools/"*.ts "$PAI_DIR/skills/Task/tools/"
cp "$PACK_DIR/src/tools/package.json" "$PAI_DIR/skills/Task/tools/"
cp -r "$PACK_DIR/src/tools/lib" "$PAI_DIR/skills/Task/tools/"
```

### Step 3: Install Dependencies

```bash
cd "$PAI_DIR/skills/Task/tools"
bun install
```

### Step 4: Configure API Credentials

```bash
# Copy template to .env
cp "$PAI_DIR/skills/Task/data/env.template" "$PAI_DIR/skills/Task/data/.env"

# Edit with your actual token
nano "$PAI_DIR/skills/Task/data/.env"
# Or use your preferred editor
```

Set these values in `.env`:
```bash
VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"
VIKUNJA_API_TOKEN="tk_your_actual_token_here"
```

**To get an API token:**
1. Log into your Vikunja instance
2. Go to Settings → API Tokens
3. Create a new token with appropriate permissions
4. Copy the token to your `.env` file

### Step 5: Verify Installation

```bash
# Test that tools can run
cd "$PAI_DIR/skills/Task/tools"

# Show help
bun run task-list.ts --help

# Test API connection (list 3 tasks)
bun run task-list.ts --limit 3
```

---

## Post-Installation

### Remove Old Skills (Optional)

After verifying the new Task skill works:

```bash
# Backup old skills first
mkdir -p "$PAI_DIR/deprecated"
mv "$PAI_DIR/skills/taskman" "$PAI_DIR/deprecated/" 2>/dev/null
mv "$PAI_DIR/skills/Vikunja" "$PAI_DIR/deprecated/" 2>/dev/null

echo "Old skills moved to $PAI_DIR/deprecated/"
```

### Update CLAUDE.md (If Using)

If you have a CLAUDE.md file that references the old skills, update it to reference the new Task skill:

```markdown
## Task Management

Use the Task skill for all task operations:
- Read: `~/.claude/skills/Task/SKILL.md`
- Tools: `~/.claude/skills/Task/tools/`
```

---

## Troubleshooting

### "Cannot find module" Error

```bash
cd "$PAI_DIR/skills/Task/tools"
bun install
```

### "401 Unauthorized" Error

Your API token is invalid or expired:
1. Generate a new token in Vikunja Settings → API Tokens
2. Update `$PAI_DIR/skills/Task/data/.env`

### "ECONNREFUSED" Error

The Vikunja URL is incorrect or the server is down:
1. Verify `VIKUNJA_URL` in your `.env` file
2. Test the URL in a browser
3. Ensure `/api/v1` is included in the URL

### Environment Variables Not Loading

Ensure `.env` file exists and has correct permissions:
```bash
ls -la "$PAI_DIR/skills/Task/data/.env"
cat "$PAI_DIR/skills/Task/data/.env"
```

