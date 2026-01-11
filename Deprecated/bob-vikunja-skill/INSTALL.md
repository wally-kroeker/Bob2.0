# Installation

## Prerequisites

- **Claude Code** (or compatible AI agent system)
- **PAI Core** installed (`kai-core-install` pack)
- **Write access** to `$PAI_DIR/skills/` (default: `~/.claude/skills/`)

### Optional (for full functionality)

- **Vikunja MCP Server** configured in `~/.claude/settings.json`
- **SSH access** to taskman host (for database queries)
- **bob-taskman-skill** installed (handles user-facing queries)

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

### Step 0.2: Check for Existing Installation

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills/Vikunja" ]; then
  echo "⚠️  Vikunja skill already exists - backup before reinstalling"
  ls -la "$PAI_CHECK/skills/Vikunja/"
else
  echo "✓ Vikunja skill not installed (clean install)"
fi
```

### Step 0.3: Check Related Skills

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"

# Check if taskman skill exists (recommended companion)
if [ -d "$PAI_CHECK/skills/Taskman" ]; then
  echo "✓ taskman skill installed (recommended)"
else
  echo "○ taskman skill not installed (install bob-taskman-skill for user-facing queries)"
fi
```

---

## Step 1: Create Skill Directory

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/Vikunja"
```

---

## Step 2: Copy Skill Files

From the pack's `src/` directory:

```bash
# Run from the bob-vikunja-skill pack directory
cp -r src/skills/Vikunja/* "$PAI_DIR/skills/Vikunja/"
```

Or if installing from absolute path:

```bash
cp -r /home/bob/projects/Bob2.0/BobPacks/bob-vikunja-skill/src/skills/Vikunja/* "$PAI_DIR/skills/Vikunja/"
```

---

## Step 3: Verify Installation

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check skill directory exists with correct structure
ls -la "$PAI_DIR/skills/Vikunja/"
# Should show: SKILL.md, scripts.deprecated/

# Check SKILL.md is readable and has correct name
head -5 "$PAI_DIR/skills/Vikunja/SKILL.md"
# Should show YAML frontmatter with name: Vikunja
```

---

## Step 4: Restart Claude Code

The skill will be available after restarting Claude Code.

---

## Optional: Verify MCP Integration

If you have Vikunja MCP configured:

```bash
# Check MCP server status
claude mcp list

# Should show vikunja as connected
# vikunja  ✓ Connected
```

---

## Post-Installation

1. **Install bob-taskman-skill** - For user-facing task queries
2. **Configure Vikunja MCP** - If not already set up (see SKILL.md for details)
3. **Verify SSH access** - If using database queries (`ssh taskman`)

**Note:** This is a reference skill. The SKILL.md contains comprehensive documentation (600+ lines) that Bob references when implementing Vikunja operations.
