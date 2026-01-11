# Installation

## Prerequisites

- **Claude Code** (or compatible AI agent system)
- **PAI Core** installed (`pai-core-install` pack)
- **Write access** to `$PAI_DIR/skills/` (default: `~/.claude/skills/`)

---

## Pre-Installation: System Analysis

**IMPORTANT:** Before installing, verify your current system state.

### Step 0.1: Check PAI Directory

```bash
# Verify PAI_DIR is set
echo "PAI_DIR: ${PAI_DIR:-'NOT SET - will use ~/.claude'}"

# Check if skills directory exists
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills" ]; then
  echo "✓ Skills directory exists at: $PAI_CHECK/skills"
  ls -la "$PAI_CHECK/skills/"
else
  echo "⚠️  Skills directory does not exist - create it first"
fi
```

### Step 0.2: Check for Existing Installation

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
if [ -d "$PAI_CHECK/skills/Telos" ]; then
  echo "⚠️  Telos skill already exists - backup before reinstalling"
  ls -la "$PAI_CHECK/skills/Telos/"
else
  echo "✓ Telos skill not installed (clean install)"
fi
```

### Step 0.3: Conflict Resolution

| Scenario | Action |
|----------|--------|
| Clean install | Proceed to Step 1 |
| Telos exists | Backup existing, then replace |
| No skills/ directory | Run `pai-core-install` first |

---

## Step 1: Create Skill Directory

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/Telos"
```

---

## Step 2: Copy Skill Files

From the pack's `src/` directory:

```bash
# Run from the bob-telos-skill pack directory
cp -r src/skills/Telos/* "$PAI_DIR/skills/Telos/"
```

Or if installing from absolute path:

```bash
cp -r /home/bob/projects/Bob2.0/BobPacks/bob-telos-skill/src/skills/Telos/* "$PAI_DIR/skills/Telos/"
```

---

## Step 3: Create Data Directory

The Telos skill stores sensitive business data in a `data/` subdirectory (gitignored):

```bash
mkdir -p "$PAI_DIR/skills/Telos/data"
```

Create placeholder files for your contexts:

```bash
touch "$PAI_DIR/skills/Telos/data/goodfields.md"   # GoodFields consulting
touch "$PAI_DIR/skills/Telos/data/personal.md"     # Personal goals
touch "$PAI_DIR/skills/Telos/data/fablab.md"       # FabLab infrastructure
```

---

## Step 4: Verify Installation

```bash
# Check skill directory exists with correct structure
ls -la "$PAI_DIR/skills/Telos/"
# Should show: SKILL.md, data/

# Check SKILL.md is readable
head -20 "$PAI_DIR/skills/Telos/SKILL.md"
# Should show YAML frontmatter with name: Telos
```

---

## Step 5: Test Activation

Restart Claude Code, then test with:

```
"Bob, business partner mode"
```

Expected: Bob should respond with GoodFields/FabLab status, priority goals, and active leads.

---

## Step 6: Import Personal Data Files

**IMPORTANT:** The Telos skill requires your personal business context files to function.

If you have a backup of your Telos data (e.g., `TelosData.tar.gz`):

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Extract your personal data files
tar -xzf ~/TelosData.tar.gz -C "$PAI_DIR/skills/Telos/data/"

# Verify files were extracted
ls -la "$PAI_DIR/skills/Telos/data/"
# Should show: goodfields.md, personal.md, fablab.md (and any others)
```

If starting fresh, create the files manually:
```bash
# Create template files
cat > "$PAI_DIR/skills/Telos/data/goodfields.md" << 'EOF'
# GoodFields Consulting - Telos

## Mission
[Your consulting mission]

## Goals
- G1: [Highest priority goal]
- G2: [Second priority]
- G3: [Third priority]

## Risk Register
- R1: [Top risk]

## Active Leads
| Lead | Status | Next Action | Follow-up Date |
|------|--------|-------------|----------------|

## CURRENT STATE / LOG
[Timestamped entries]
EOF
```

---

## Post-Installation

1. **Import or create data files** - See Step 6 above
2. **Customize triggers** - Edit SKILL.md if you need different activation phrases
3. **Verify SKILL.md** - Ensure YAML frontmatter has correct `name: Telos` (TitleCase)

**Note:** Your data files (`data/*.md`) contain sensitive business information and should NOT be committed to git. The `data/` directory should be in `.gitignore`.
