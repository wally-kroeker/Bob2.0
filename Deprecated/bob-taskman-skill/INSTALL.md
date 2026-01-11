# Installation

## Prerequisites

- **Claude Code** (or compatible AI agent system)
- **PAI Core** installed (`kai-core-install` pack)
- **Write access** to `$PAI_DIR/skills/` (default: `~/.claude/skills/`)
- **Bun** runtime installed (for TypeScript scripts)

### Required External Services

- **Vikunja MCP Server** configured in `~/.claude/settings.json`
- **Vikunja instance** accessible (e.g., taskman.vrexplorers.com)

### Optional

- **bob-vikunja-skill** installed (technical reference documentation)
- **bob-telos-skill** installed (strategic goal alignment)

---

## Pre-Installation: System Analysis

### Step 0.1: Check PAI Directory

```bash
# Verify PAI_DIR is set
echo "PAI_DIR: ${PAI_DIR:-'NOT SET - will use ~/.claude'}"

# Check if skills directory exists
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills" ]; then
  echo "✓ Skills directory exists at: $PAI_CHECK/skills"
else
  echo "⚠️  Skills directory does not exist - install kai-core-install first"
fi
```

### Step 0.2: Check Bun Installation

```bash
# Verify Bun is installed
if command -v bun &> /dev/null; then
  echo "✓ Bun installed: $(bun --version)"
else
  echo "✗ Bun not installed"
  echo "  Install with: curl -fsSL https://bun.sh/install | bash"
fi
```

### Step 0.3: Check for Existing Installation

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills/taskman" ]; then
  echo "⚠️  TaskMan skill already exists - backup before reinstalling"
  ls -la "$PAI_CHECK/skills/taskman/"
else
  echo "✓ TaskMan skill not installed (clean install)"
fi
```

### Step 0.4: Check Vikunja MCP Configuration

```bash
# Check if Vikunja MCP is configured
if grep -q "vikunja" ~/.claude/settings.json 2>/dev/null; then
  echo "✓ Vikunja MCP found in settings"
else
  echo "⚠️  Vikunja MCP not configured in ~/.claude/settings.json"
fi
```

---

## Step 1: Create Skill Directory

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/taskman/scripts"
mkdir -p "$PAI_DIR/skills/taskman/data"
```

---

## Step 2: Copy Skill Files

From the pack's `src/` directory:

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Run from the bob-taskman-skill pack directory
cp -r src/skills/taskman/* "$PAI_DIR/skills/taskman/"
```

Or if installing from absolute path:

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cp -r /home/bob/projects/Bob2.0/BobPacks/bob-taskman-skill/src/skills/taskman/* "$PAI_DIR/skills/taskman/"
```

**Files being copied:**
- `SKILL.md` - Main skill documentation (1100+ lines)
- `DATA_STRUCTURE.md` - Database schema reference
- `QUICK_REFERENCE.md` - Common patterns and queries
- `DIAGRAMS.md` - Visual architecture
- `README.md` - Skill overview
- `scripts/` - TypeScript utilities
- `data/` - Data directory (cache location)

---

## Step 3: Install Script Dependencies

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cd "$PAI_DIR/skills/taskman/scripts"

# Install dependencies with Bun
bun install
```

This installs:
- `better-sqlite3` - SQLite database driver

---

## Step 4: Configure Environment

The scripts read Vikunja credentials from `~/.claude.json` or environment variables.

### Option A: Use existing MCP config (Recommended)

If you have Vikunja MCP configured in `~/.claude.json`:

```json
{
  "mcpServers": {
    "vikunja": {
      "type": "http",
      "url": "http://walub.kroeker.fun:8080/sse",
      "env": {
        "VIKUNJA_URL": "https://taskman.vrexplorers.com/api/v1",
        "VIKUNJA_API_TOKEN": "tk_your_token_here"
      }
    }
  }
}
```

The scripts will automatically read from this config.

### Option B: Environment variables

Export directly:

```bash
export VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"
export VIKUNJA_API_TOKEN="tk_your_token_here"
```

Or add to `~/.bashrc`:

```bash
echo 'export VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"' >> ~/.bashrc
echo 'export VIKUNJA_API_TOKEN="tk_your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

---

## Step 5: Initial Cache Sync

Run the cache sync to populate the local SQLite database:

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cd "$PAI_DIR/skills/taskman/scripts"

# Sync all tasks, projects, labels
bun run sync-cache.ts
```

Expected output:
```
[INFO] TaskMan Cache Sync Starting
[INFO] Fetching projects...
[INFO] Found 14 projects
[INFO] Fetching labels...
[INFO] Found 22 labels
[INFO] Fetching tasks...
[SUCCESS] TaskMan Cache Sync Complete!
[SUCCESS] Duration: 12s
[SUCCESS] Projects: 14
[SUCCESS] Tasks: 208 (125 active)
[SUCCESS] Cache: ~/.claude/skills/taskman/data/taskman.db
```

---

## Step 6: Verify Installation

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check skill directory exists
ls -la "$PAI_DIR/skills/taskman/"

# Check SKILL.md is readable
head -10 "$PAI_DIR/skills/taskman/SKILL.md"

# Check cache was created
ls -la "$PAI_DIR/skills/taskman/data/taskman.db"

# Test query script
cd "$PAI_DIR/skills/taskman/scripts"
bun run query.ts quick
```

---

## Step 7: Restart Claude Code

The skill will be available after restarting Claude Code.

---

## Post-Installation

1. **Verify skill loads** - Ask Bob about tasks
2. **Test MCP integration** - Create a test task
3. **Set up scheduled sync** - Optional cron job for cache freshness

### Optional: Cron Job for Cache Sync

To keep the cache fresh automatically:

```bash
# Edit crontab
crontab -e

# Add line for hourly sync
0 * * * * cd ~/.claude/skills/taskman/scripts && bun run sync-cache.ts >> ~/.claude/skills/taskman/data/sync.log 2>&1
```

---

## Troubleshooting

### Scripts fail with "VIKUNJA_API_TOKEN not found"

Ensure credentials are configured:
```bash
# Check environment
echo $VIKUNJA_API_TOKEN

# Or check ~/.claude.json
cat ~/.claude.json | grep -A5 vikunja
```

### "bun: command not found"

Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### Cache sync fails

1. Check network connectivity to Vikunja
2. Verify API token has read permissions
3. Check logs: `cat ~/.claude/skills/taskman/data/sync.log`

### Skill not activating

1. Verify file exists: `ls ~/.claude/skills/taskman/SKILL.md`
2. Check YAML frontmatter has `name: taskman`
3. Restart Claude Code

---

## Uninstallation

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
rm -rf "$PAI_DIR/skills/taskman"
```
