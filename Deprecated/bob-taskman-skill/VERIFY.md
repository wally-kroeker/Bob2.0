# Verification Checklist

> **MANDATORY:** Complete ALL checks before marking installation as successful.

## Installation Verification

Run these commands and confirm each passes:

### File Structure Checks

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check 1: Skill directory exists
[ -d "$PAI_DIR/skills/taskman" ] && echo "✓ taskman directory exists" || echo "✗ FAIL: taskman directory missing"

# Check 2: SKILL.md exists
[ -f "$PAI_DIR/skills/taskman/SKILL.md" ] && echo "✓ SKILL.md exists" || echo "✗ FAIL: SKILL.md missing"

# Check 3: SKILL.md has correct name
grep -q "^name: taskman" "$PAI_DIR/skills/taskman/SKILL.md" && echo "✓ SKILL.md has correct name" || echo "⚠️  WARN: Check SKILL.md name field"

# Check 4: SKILL.md has substantial content
lines=$(wc -l < "$PAI_DIR/skills/taskman/SKILL.md")
[ "$lines" -gt 500 ] && echo "✓ SKILL.md has content ($lines lines)" || echo "⚠️  WARN: SKILL.md seems too short ($lines lines)"

# Check 5: DATA_STRUCTURE.md exists
[ -f "$PAI_DIR/skills/taskman/DATA_STRUCTURE.md" ] && echo "✓ DATA_STRUCTURE.md exists" || echo "✗ FAIL: DATA_STRUCTURE.md missing"

# Check 6: Scripts directory exists
[ -d "$PAI_DIR/skills/taskman/scripts" ] && echo "✓ scripts directory exists" || echo "✗ FAIL: scripts directory missing"

# Check 7: Data directory exists
[ -d "$PAI_DIR/skills/taskman/data" ] && echo "✓ data directory exists" || echo "✗ FAIL: data directory missing"
```

### Script File Checks

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
SCRIPTS_DIR="$PAI_DIR/skills/taskman/scripts"

# Check 8: TypeScript scripts exist
[ -f "$SCRIPTS_DIR/sync-cache.ts" ] && echo "✓ sync-cache.ts exists" || echo "✗ FAIL: sync-cache.ts missing"
[ -f "$SCRIPTS_DIR/sync-projects.ts" ] && echo "✓ sync-projects.ts exists" || echo "✗ FAIL: sync-projects.ts missing"
[ -f "$SCRIPTS_DIR/query.ts" ] && echo "✓ query.ts exists" || echo "✗ FAIL: query.ts missing"
[ -f "$SCRIPTS_DIR/cleanup.ts" ] && echo "✓ cleanup.ts exists" || echo "✗ FAIL: cleanup.ts missing"

# Check 9: package.json exists
[ -f "$SCRIPTS_DIR/package.json" ] && echo "✓ package.json exists" || echo "✗ FAIL: package.json missing"

# Check 10: Dependencies installed
[ -d "$SCRIPTS_DIR/node_modules" ] && echo "✓ node_modules exists" || echo "✗ FAIL: Run 'bun install' in scripts directory"
```

### Mandatory Checklist

- [ ] `$PAI_DIR/skills/taskman/` directory exists
- [ ] `$PAI_DIR/skills/taskman/SKILL.md` file present (1100+ lines expected)
- [ ] `$PAI_DIR/skills/taskman/DATA_STRUCTURE.md` file present
- [ ] `$PAI_DIR/skills/taskman/QUICK_REFERENCE.md` file present
- [ ] `$PAI_DIR/skills/taskman/scripts/` directory exists
- [ ] `$PAI_DIR/skills/taskman/scripts/package.json` file present
- [ ] `$PAI_DIR/skills/taskman/scripts/sync-cache.ts` file present
- [ ] `$PAI_DIR/skills/taskman/scripts/sync-projects.ts` file present
- [ ] `$PAI_DIR/skills/taskman/scripts/query.ts` file present
- [ ] `$PAI_DIR/skills/taskman/scripts/cleanup.ts` file present
- [ ] `$PAI_DIR/skills/taskman/data/` directory exists
- [ ] Dependencies installed (`bun install` completed)
- [ ] Claude Code has been restarted after installation

---

## Runtime Verification

### Check 1: Bun Available

```bash
bun --version
# Expected: 1.x.x or higher
```

### Check 2: Environment Configuration

```bash
# Check for VIKUNJA_API_TOKEN (either in env or ~/.claude.json)
if [ -n "$VIKUNJA_API_TOKEN" ]; then
  echo "✓ VIKUNJA_API_TOKEN set in environment"
elif grep -q "VIKUNJA_API_TOKEN" ~/.claude.json 2>/dev/null; then
  echo "✓ VIKUNJA_API_TOKEN found in ~/.claude.json"
else
  echo "✗ FAIL: VIKUNJA_API_TOKEN not configured"
fi

# Check for VIKUNJA_URL
if [ -n "$VIKUNJA_URL" ]; then
  echo "✓ VIKUNJA_URL set in environment"
elif grep -q "VIKUNJA_URL" ~/.claude.json 2>/dev/null; then
  echo "✓ VIKUNJA_URL found in ~/.claude.json"
else
  echo "✗ FAIL: VIKUNJA_URL not configured"
fi
```

---

## Functionality Verification

### Test 1: Cache Sync

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cd "$PAI_DIR/skills/taskman/scripts"

# Run cache sync
bun run sync-cache.ts

# Expected output:
# [INFO] TaskMan Cache Sync Starting
# [SUCCESS] TaskMan Cache Sync Complete!
# [SUCCESS] Cache: ~/.claude/skills/taskman/data/taskman.db
```

**Checklist:**
- [ ] sync-cache.ts runs without errors
- [ ] SQLite database created at `data/taskman.db`
- [ ] Tasks, projects, and labels synced

### Test 2: Project Sync

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cd "$PAI_DIR/skills/taskman/scripts"

# Run project sync
bun run sync-projects.ts

# Expected: Creates/updates project-hierarchy.md
```

**Checklist:**
- [ ] sync-projects.ts runs without errors
- [ ] `data/project-hierarchy.md` created or updated

### Test 3: Query Tasks

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cd "$PAI_DIR/skills/taskman/scripts"

# Test quick query
bun run query.ts quick

# Expected: List of 5-15 minute tasks (or "No matching tasks")
```

**Checklist:**
- [ ] query.ts runs without errors
- [ ] Returns task list or appropriate message

### Test 4: Cleanup Utilities

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cd "$PAI_DIR/skills/taskman/scripts"

# Test stats command
bun run cleanup.ts stats

# Expected: Project count, task count, label information
```

**Checklist:**
- [ ] cleanup.ts runs without errors
- [ ] Stats command returns valid data

---

## Skill Activation Test

After restarting Claude Code, test these prompts:

### Test 1: Task Query

```
User: "What should I work on?"
Expected: Bob queries cache and suggests tasks based on priority/due date
```

### Test 2: Task Creation

```
User: "Add task to trim hedges by Sunday"
Expected: Bob creates task with correct project, due date, and labels
```

### Test 3: Time-Constrained Query

```
User: "I have 10 minutes, what can I do?"
Expected: Bob filters tasks by TimeEstimate labels (5min, 15min)
```

**Checklist:**
- [ ] Task queries return meaningful results
- [ ] Task creation works with natural language dates
- [ ] Time-constrained queries filter correctly

---

## Cache Database Verification

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
DB_PATH="$PAI_DIR/skills/taskman/data/taskman.db"

# Check database exists
[ -f "$DB_PATH" ] && echo "✓ Database exists" || echo "✗ FAIL: Database missing"

# Check tables exist
sqlite3 "$DB_PATH" ".tables"
# Expected: cache_metadata  labels  projects  task_labels  tasks

# Check task count
sqlite3 "$DB_PATH" "SELECT COUNT(*) as total_tasks FROM tasks;"

# Check last sync time
sqlite3 "$DB_PATH" "SELECT value FROM cache_metadata WHERE key='last_sync';"
```

**Checklist:**
- [ ] Database file exists
- [ ] All tables present (tasks, projects, labels, task_labels, cache_metadata)
- [ ] Tasks synced (count > 0)
- [ ] Last sync timestamp recorded

---

## Troubleshooting

### Scripts fail to run

1. **Check Bun installation:**
   ```bash
   which bun
   bun --version
   ```

2. **Check dependencies:**
   ```bash
   cd ~/.claude/skills/taskman/scripts
   bun install
   ```

### API connection fails

1. **Check credentials:**
   ```bash
   echo $VIKUNJA_API_TOKEN
   cat ~/.claude.json | grep -A10 vikunja
   ```

2. **Test API manually:**
   ```bash
   curl -s -H "Authorization: Bearer $VIKUNJA_API_TOKEN" \
     "${VIKUNJA_URL}/projects" | head -100
   ```

### Cache queries return empty

1. **Check cache was synced:**
   ```bash
   sqlite3 ~/.claude/skills/taskman/data/taskman.db "SELECT COUNT(*) FROM tasks;"
   ```

2. **Re-run sync:**
   ```bash
   cd ~/.claude/skills/taskman/scripts
   bun run sync-cache.ts
   ```

### Skill not activating

1. **Check file permissions:**
   ```bash
   ls -la ~/.claude/skills/taskman/SKILL.md
   ```

2. **Check YAML frontmatter:**
   ```bash
   head -10 ~/.claude/skills/taskman/SKILL.md
   ```

3. **Restart Claude Code**

---

## Final Checklist

### Required (All must pass)

- [ ] All file structure checks pass
- [ ] All script files present
- [ ] Dependencies installed (`bun install`)
- [ ] Cache sync successful
- [ ] Database contains tasks
- [ ] Claude Code restarted

### Optional (For full functionality)

- [ ] Project hierarchy synced
- [ ] Query commands working
- [ ] Cleanup utilities functional
- [ ] Skill activates on task queries
- [ ] Cron job set up for automatic sync

---

**Installation is COMPLETE when all REQUIRED checks pass.**

**Installation is FULLY FUNCTIONAL when all checks (required + optional) pass.**
