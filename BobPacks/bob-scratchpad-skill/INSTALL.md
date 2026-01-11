# Installation Instructions - Bob Scratchpad Skill

This document provides step-by-step instructions for installing the Bob Scratchpad Skill pack.

---

## Prerequisites

- **Bun runtime**: `curl -fsSL https://bun.sh/install | bash`
- **Claude Code** (or compatible agent system with skill support)
- **Write access** to `$PAI_DIR/` (default: `~/.claude`)
- **PAI Core installed** (CORE skill, hook system recommended but not required)

---

## Pre-Installation: System Analysis

**IMPORTANT:** Before installing, analyze the current system state to detect conflicts and ensure proper integration.

### Step 0.1: Detect Current Configuration

Run these commands to understand your current system:

```bash
# 1. Check if scratchpad directory already exists
SCRATCHPAD_DIR="${PAI_DIR:-$HOME/.claude}/scratchpad"
if [ -d "$SCRATCHPAD_DIR" ]; then
  echo "⚠️  Scratchpad directory EXISTS at: $SCRATCHPAD_DIR"
  echo "Contents:"
  ls -la "$SCRATCHPAD_DIR" | head -20
  echo ""
  echo "Total items: $(find "$SCRATCHPAD_DIR" -maxdepth 1 -type d | wc -l)"
else
  echo "✓ Scratchpad directory does not exist (clean install)"
fi

# 2. Check for existing index file
if [ -f "$SCRATCHPAD_DIR/.scratchpad-index.json" ]; then
  echo "⚠️  Existing index file found"
  echo "    (will be backed up and rebuilt)"
else
  echo "✓ No existing index (will be created)"
fi

# 3. Check if Scratchpad skill already installed
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills/Scratchpad" ]; then
  echo "⚠️  Scratchpad skill already exists"
  echo "    This may be an upgrade or reinstall"
  echo "    Version: $(grep 'version:' "$PAI_CHECK/skills/Scratchpad/SKILL.md" 2>/dev/null || echo 'unknown')"
else
  echo "✓ Scratchpad skill not installed"
fi

# 4. Check Claude settings for scratchpad hooks
CLAUDE_SETTINGS="$HOME/.claude/settings.json"
if [ -f "$CLAUDE_SETTINGS" ]; then
  echo ""
  echo "Claude settings.json EXISTS"
  if grep -q 'capture-untargeted-output' "$CLAUDE_SETTINGS" 2>/dev/null; then
    echo "⚠️  Scratchpad hook already registered"
    echo "    (may need to update hook path)"
  else
    echo "✓ No scratchpad hooks in settings.json"
  fi
else
  echo "✓ No Claude settings.json (will be created if using auto-save hook)"
fi

# 5. Check environment variables
echo ""
echo "Environment variables:"
echo "  PAI_DIR: ${PAI_DIR:-'NOT SET (will use ~/.claude)'}"
echo "  SCRATCHPAD_DIR: ${SCRATCHPAD_DIR:-'NOT SET (will use $PAI_DIR/scratchpad)'}"
echo "  SCRATCHPAD_ARCHIVE_DAYS: ${SCRATCHPAD_ARCHIVE_DAYS:-'NOT SET (will default to 90)'}"
```

### Step 0.2: Conflict Resolution Matrix

Based on the detection above, follow the appropriate path:

| Scenario | Existing State | Action |
|----------|---------------|--------|
| **Clean Install** | No scratchpad directory, no skill | Proceed normally with Step 1 |
| **Data Exists** | Scratchpad directory with content | **PRESERVE DATA** - skill will index existing content automatically |
| **Skill Exists** | Scratchpad skill already installed | Backup old skill files (Step 0.3), then replace with new version |
| **Hook Exists** | capture-untargeted-output.ts present | Compare versions, update if this version is newer |
| **Index Exists** | .scratchpad-index.json present | Backup old index (Step 0.3), rebuild fresh from filesystem |

**Critical:** The scratchpad directory content will **NEVER** be modified or deleted. The skill works with existing content in place.

### Step 0.3: Backup Existing Configuration (If Needed)

**Only run this if you're upgrading an existing installation (detected in Step 0.1):**

```bash
# Create timestamped backup
BACKUP_DIR="$HOME/.pai-backup/$(date +%Y%m%d-%H%M%S)-scratchpad-upgrade"
mkdir -p "$BACKUP_DIR"
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"

echo "Creating backup at: $BACKUP_DIR"

# Backup existing skill if present
if [ -d "$PAI_CHECK/skills/Scratchpad" ]; then
  cp -r "$PAI_CHECK/skills/Scratchpad" "$BACKUP_DIR/skills-Scratchpad"
  echo "✓ Backed up existing Scratchpad skill"
fi

# Backup existing tools if present
if [ -d "$PAI_CHECK/tools" ]; then
  if ls "$PAI_CHECK/tools/ScratchpadManager.ts" 2>/dev/null; then
    mkdir -p "$BACKUP_DIR/tools"
    cp "$PAI_CHECK/tools/ScratchpadManager.ts" "$BACKUP_DIR/tools/" 2>/dev/null || true
    cp -r "$PAI_CHECK/tools/lib" "$BACKUP_DIR/tools/" 2>/dev/null || true
    echo "✓ Backed up existing Scratchpad tools"
  fi
fi

# Backup existing hook if present
if [ -f "$PAI_CHECK/hooks/capture-untargeted-output.ts" ]; then
  mkdir -p "$BACKUP_DIR/hooks"
  cp "$PAI_CHECK/hooks/capture-untargeted-output.ts" "$BACKUP_DIR/hooks/"
  echo "✓ Backed up existing hook"
fi

# Backup existing index (will be rebuilt)
if [ -f "$PAI_CHECK/scratchpad/.scratchpad-index.json" ]; then
  cp "$PAI_CHECK/scratchpad/.scratchpad-index.json" "$BACKUP_DIR/scratchpad-index.json"
  echo "✓ Backed up scratchpad index"
fi

echo ""
echo "Backup location: $BACKUP_DIR"
echo "You can restore from this backup if needed."
```

**After completing system analysis, proceed to Step 1.**

---

## Installation Steps

### Step 1: Copy Skill Files

Copy the skill definition and workflows to your PAI directory.

```bash
# Set PAI directory (adjust if needed)
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Create skill directory
mkdir -p "$PAI_DIR/skills/Scratchpad/Workflows"

# Copy skill definition
cp src/skills/Scratchpad/SKILL.md "$PAI_DIR/skills/Scratchpad/"

# Copy workflows
cp src/skills/Scratchpad/Workflows/Save.md "$PAI_DIR/skills/Scratchpad/Workflows/"
cp src/skills/Scratchpad/Workflows/Search.md "$PAI_DIR/skills/Scratchpad/Workflows/"
cp src/skills/Scratchpad/Workflows/List.md "$PAI_DIR/skills/Scratchpad/Workflows/"
cp src/skills/Scratchpad/Workflows/Archive.md "$PAI_DIR/skills/Scratchpad/Workflows/"

# Verify
ls -la "$PAI_DIR/skills/Scratchpad/"
ls -la "$PAI_DIR/skills/Scratchpad/Workflows/"
```

**Expected output:**
- `SKILL.md` in skills/Scratchpad/
- 4 workflow files in skills/Scratchpad/Workflows/

---

### Step 2: Copy Tools

Copy the core tools and libraries.

```bash
# Create tools directory
mkdir -p "$PAI_DIR/tools/lib"

# Copy tools
cp src/tools/ScratchpadManager.ts "$PAI_DIR/tools/"
cp src/tools/lib/indexer.ts "$PAI_DIR/tools/lib/"
cp src/tools/lib/archiver.ts "$PAI_DIR/tools/lib/"

# Verify
ls -la "$PAI_DIR/tools/ScratchpadManager.ts"
ls -la "$PAI_DIR/tools/lib/indexer.ts"
ls -la "$PAI_DIR/tools/lib/archiver.ts"
```

**Expected output:**
- `ScratchpadManager.ts` in tools/
- `indexer.ts` and `archiver.ts` in tools/lib/

---

### Step 3: Copy Hook (Optional)

**Only install this if you want automatic saving of untargeted outputs.**

```bash
# Create hooks directory if needed
mkdir -p "$PAI_DIR/hooks"

# Copy hook
cp src/hooks/capture-untargeted-output.ts "$PAI_DIR/hooks/"

# Make hook executable (recommended)
chmod +x "$PAI_DIR/hooks/capture-untargeted-output.ts"

# Verify
ls -la "$PAI_DIR/hooks/capture-untargeted-output.ts"
```

**Note:** The hook is DISABLED by default. See Step 5 to enable it.

---

### Step 4: Create Scratchpad Directory Structure

Create the scratchpad directory (if it doesn't already exist).

```bash
# Create scratchpad directory
mkdir -p "$PAI_DIR/scratchpad/archive"

# Create archive subdirectories for current and previous year
CURRENT_YEAR=$(date +%Y)
PREV_YEAR=$((CURRENT_YEAR - 1))
mkdir -p "$PAI_DIR/scratchpad/archive/${CURRENT_YEAR}-01"
mkdir -p "$PAI_DIR/scratchpad/archive/${PREV_YEAR}-12"

# Verify
ls -la "$PAI_DIR/scratchpad/"
```

**Expected output:**
- `scratchpad/` directory exists
- `archive/` subdirectory exists
- Archive organized by YYYY-MM

---

### Step 5: Configure Environment Variables

Add environment variables to your shell profile or .env file.

**Option A: Using .env file (recommended):**

```bash
# Add to $PAI_DIR/.env
cat >> "$PAI_DIR/.env" <<EOF

# Scratchpad Configuration
SCRATCHPAD_DIR="$PAI_DIR/scratchpad"
SCRATCHPAD_ARCHIVE_DAYS="90"
SCRATCHPAD_AUTO_SAVE="false"  # Set to "true" to enable auto-save hook
EOF

# Verify
grep "SCRATCHPAD" "$PAI_DIR/.env"
```

**Option B: Using shell profile:**

```bash
# Add to ~/.zshrc or ~/.bashrc
cat >> ~/.zshrc <<EOF

# Scratchpad Configuration
export SCRATCHPAD_DIR="\$PAI_DIR/scratchpad"
export SCRATCHPAD_ARCHIVE_DAYS="90"
export SCRATCHPAD_AUTO_SAVE="false"
EOF

# Reload shell
source ~/.zshrc
```

---

### Step 6: Register Hook (Optional - Only if Using Auto-Save)

**Skip this step if you don't want auto-save functionality.**

To enable automatic saving of untargeted outputs, add the hook to settings.json:

```bash
CLAUDE_SETTINGS="$HOME/.claude/settings.json"

# Check if settings.json exists
if [ ! -f "$CLAUDE_SETTINGS" ]; then
  echo "Creating new settings.json..."
  cat > "$CLAUDE_SETTINGS" <<'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bun run $PAI_DIR/hooks/capture-untargeted-output.ts"
          }
        ]
      }
    ]
  },
  "environment": {
    "SCRATCHPAD_AUTO_SAVE": "true"
  }
}
EOF
else
  echo "⚠️  settings.json already exists"
  echo "   Add the following hook manually to the 'PostToolUse' array:"
  echo ""
  cat <<'EOF'
{
  "matcher": "*",
  "hooks": [
    {
      "type": "command",
      "command": "bun run $PAI_DIR/hooks/capture-untargeted-output.ts"
    }
  ]
}
EOF
  echo ""
  echo "   And set: \"SCRATCHPAD_AUTO_SAVE\": \"true\" in environment"
fi
```

**Important:** If you have existing hooks, **MERGE** the new hook into the existing array. Don't replace the entire hooks configuration.

---

### Step 7: Build Index from Existing Content (If Applicable)

If you have existing scratchpad content, rebuild the index:

```bash
# Run index rebuild (this will be implemented in the tool)
bun run "$PAI_DIR/tools/ScratchpadManager.ts" rebuild-index

# Verify index was created
ls -la "$PAI_DIR/scratchpad/.scratchpad-index.json"
```

**Note:** This step is automatic on first use if index doesn't exist.

---

## Verification

Proceed to [VERIFY.md](VERIFY.md) to complete the mandatory verification checklist.

Quick verification:

```bash
# 1. Check skill files exist
ls "$PAI_DIR/skills/Scratchpad/SKILL.md"
ls "$PAI_DIR/skills/Scratchpad/Workflows/"*.md

# 2. Check tools exist
ls "$PAI_DIR/tools/ScratchpadManager.ts"
ls "$PAI_DIR/tools/lib/"*.ts

# 3. Check scratchpad directory
ls -la "$PAI_DIR/scratchpad/"

# 4. Check environment variables
echo "SCRATCHPAD_DIR: $SCRATCHPAD_DIR"
echo "SCRATCHPAD_ARCHIVE_DAYS: $SCRATCHPAD_ARCHIVE_DAYS"

# 5. Test save (manual)
# In Claude Code session: "save this test to scratchpad"
```

---

## Troubleshooting

### Issue: "Scratchpad skill not found"

**Cause:** Skill files not copied to correct location or CORE skill not loading Scratchpad.

**Fix:**
```bash
# Verify skill location
ls -la "$PAI_DIR/skills/Scratchpad/SKILL.md"

# Check skill frontmatter has correct name
grep "name:" "$PAI_DIR/skills/Scratchpad/SKILL.md"
```

### Issue: "Auto-save not working"

**Cause:** Hook not enabled or environment variable not set.

**Fix:**
```bash
# Check hook is registered
grep "capture-untargeted-output" "$HOME/.claude/settings.json"

# Check environment variable
echo "SCRATCHPAD_AUTO_SAVE: $SCRATCHPAD_AUTO_SAVE"

# Enable auto-save
export SCRATCHPAD_AUTO_SAVE="true"
```

### Issue: "Cannot find scratchpad directory"

**Cause:** SCRATCHPAD_DIR environment variable not set or directory not created.

**Fix:**
```bash
# Set environment variable
export SCRATCHPAD_DIR="$PAI_DIR/scratchpad"

# Create directory
mkdir -p "$SCRATCHPAD_DIR/archive"
```

### Issue: "Search returns no results"

**Cause:** Index not built or corrupted.

**Fix:**
```bash
# Rebuild index
bun run "$PAI_DIR/tools/ScratchpadManager.ts" rebuild-index

# Verify index exists
cat "$PAI_DIR/scratchpad/.scratchpad-index.json"
```

---

## Uninstallation

To remove the Scratchpad skill:

```bash
# Remove skill files
rm -rf "$PAI_DIR/skills/Scratchpad"

# Remove tools
rm "$PAI_DIR/tools/ScratchpadManager.ts"
rm "$PAI_DIR/tools/lib/indexer.ts"
rm "$PAI_DIR/tools/lib/archiver.ts"

# Remove hook (if installed)
rm "$PAI_DIR/hooks/capture-untargeted-output.ts"

# Remove hook from settings.json (manual - edit file)
# Edit ~/.claude/settings.json and remove capture-untargeted-output entry

# OPTIONAL: Remove scratchpad data (CAUTION!)
# rm -rf "$PAI_DIR/scratchpad"  # This deletes all your scratchpad content!
```

**Note:** Scratchpad data is NOT removed automatically. If you want to keep your data, don't delete the `scratchpad/` directory.

---

## Next Steps

After successful installation:

1. Complete [VERIFY.md](VERIFY.md) checklist
2. Test save workflow: "save this to scratchpad"
3. Test search: "search scratchpad for [topic]"
4. Test list: "show recent scratchpad items"
5. Review customization options in [README.md](README.md#customization)
6. Decide if you want to enable auto-save hook (Step 6)

---

**Installation complete!** The Scratchpad skill is ready to use.
