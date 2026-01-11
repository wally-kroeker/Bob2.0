# Bob Task Skill - Verification Checklist

Complete this checklist to verify the pack is installed correctly.

## Directory Structure

- [ ] `$PAI_DIR/skills/Task/` directory exists
- [ ] `$PAI_DIR/skills/Task/SKILL.md` exists
- [ ] `$PAI_DIR/skills/Task/data/.env` exists (copied from env.template)
- [ ] `$PAI_DIR/skills/Task/tools/` directory exists
- [ ] `$PAI_DIR/skills/Task/tools/lib/vikunja-client.ts` exists

**Verification Command:**
```bash
export PAI_DIR="${PAI_DIR:-$HOME/.claude}"
ls -la "$PAI_DIR/skills/Task/"
ls -la "$PAI_DIR/skills/Task/tools/"
ls -la "$PAI_DIR/skills/Task/tools/lib/"
ls -la "$PAI_DIR/skills/Task/data/"
```

## Configuration

- [ ] `.env` file contains `VIKUNJA_URL`
- [ ] `.env` file contains `VIKUNJA_API_TOKEN` (not placeholder)

**Verification Command:**
```bash
grep -E "^VIKUNJA" "$PAI_DIR/skills/Task/data/.env"
# Should show both variables with real values (not "tk_your_token_here")
```

## Dependencies

- [ ] Bun is installed and working
- [ ] Node modules installed in tools directory

**Verification Command:**
```bash
bun --version
ls "$PAI_DIR/skills/Task/tools/node_modules" 2>/dev/null && echo "✓ Dependencies installed" || echo "✗ Run: cd $PAI_DIR/skills/Task/tools && bun install"
```

## API Connection

- [ ] Can connect to Vikunja API
- [ ] Authentication works

**Verification Command:**
```bash
cd "$PAI_DIR/skills/Task/tools"
bun run task-list.ts --limit 1
# Should show at least one task, or "No tasks found" (not an error)
```

## Tool Functionality

### task-list.ts
- [ ] `--help` shows usage information
- [ ] Can list tasks without errors

```bash
cd "$PAI_DIR/skills/Task/tools"
bun run task-list.ts --help
bun run task-list.ts --limit 5
```

### task-create.ts
- [ ] `--help` shows usage information
- [ ] Can create a test task (then delete it)

```bash
bun run task-create.ts --help
# Optional: Create and delete a test task
# bun run task-create.ts "TEST - Delete me" --project 1
```

### task-update.ts
- [ ] `--help` shows usage information

```bash
bun run task-update.ts --help
```

### task-suggest.ts
- [ ] `--help` shows usage information
- [ ] Returns ADHD-optimized suggestions

```bash
bun run task-suggest.ts --help
bun run task-suggest.ts
```

### task-assign.ts
- [ ] `--help` shows usage information

```bash
bun run task-assign.ts --help
```

## SKILL.md Loaded

- [ ] AI agent can read the skill definition

**Test:** Ask your AI agent:
> "Read the Task skill definition at ~/.claude/skills/Task/SKILL.md"

The agent should be able to read and summarize the skill.

---

## Quick Verification Script

Run this script to verify all components:

```bash
#!/bin/bash
export PAI_DIR="${PAI_DIR:-$HOME/.claude}"
SKILL_DIR="$PAI_DIR/skills/Task"

echo "=== Bob Task Skill Verification ==="
echo ""

# Check directories
echo "1. Checking directories..."
[ -d "$SKILL_DIR" ] && echo "   ✓ Task skill directory" || echo "   ✗ Task skill directory MISSING"
[ -d "$SKILL_DIR/tools" ] && echo "   ✓ Tools directory" || echo "   ✗ Tools directory MISSING"
[ -d "$SKILL_DIR/tools/lib" ] && echo "   ✓ Lib directory" || echo "   ✗ Lib directory MISSING"
[ -d "$SKILL_DIR/data" ] && echo "   ✓ Data directory" || echo "   ✗ Data directory MISSING"

# Check files
echo ""
echo "2. Checking files..."
[ -f "$SKILL_DIR/SKILL.md" ] && echo "   ✓ SKILL.md" || echo "   ✗ SKILL.md MISSING"
[ -f "$SKILL_DIR/data/.env" ] && echo "   ✓ .env config" || echo "   ✗ .env MISSING (copy from .env.template)"
[ -f "$SKILL_DIR/tools/lib/vikunja-client.ts" ] && echo "   ✓ vikunja-client.ts" || echo "   ✗ vikunja-client.ts MISSING"
[ -f "$SKILL_DIR/tools/task-list.ts" ] && echo "   ✓ task-list.ts" || echo "   ✗ task-list.ts MISSING"
[ -f "$SKILL_DIR/tools/task-create.ts" ] && echo "   ✓ task-create.ts" || echo "   ✗ task-create.ts MISSING"
[ -f "$SKILL_DIR/tools/task-update.ts" ] && echo "   ✓ task-update.ts" || echo "   ✗ task-update.ts MISSING"
[ -f "$SKILL_DIR/tools/task-suggest.ts" ] && echo "   ✓ task-suggest.ts" || echo "   ✗ task-suggest.ts MISSING"
[ -f "$SKILL_DIR/tools/task-assign.ts" ] && echo "   ✓ task-assign.ts" || echo "   ✗ task-assign.ts MISSING"

# Check config
echo ""
echo "3. Checking configuration..."
if [ -f "$SKILL_DIR/data/.env" ]; then
  grep -q "VIKUNJA_URL=" "$SKILL_DIR/data/.env" && echo "   ✓ VIKUNJA_URL set" || echo "   ✗ VIKUNJA_URL not set"
  grep -q "VIKUNJA_API_TOKEN=" "$SKILL_DIR/data/.env" && echo "   ✓ VIKUNJA_API_TOKEN set" || echo "   ✗ VIKUNJA_API_TOKEN not set"
  grep -q "tk_your" "$SKILL_DIR/data/.env" && echo "   ⚠ Token appears to be placeholder!" || echo "   ✓ Token appears to be real"
fi

# Test API
echo ""
echo "4. Testing API connection..."
cd "$SKILL_DIR/tools" 2>/dev/null
if [ -f "task-list.ts" ]; then
  bun run task-list.ts --limit 1 2>&1 | head -5
else
  echo "   ✗ Cannot test - tools not found"
fi

echo ""
echo "=== Verification Complete ==="
```

---

## Verification Complete Checklist

After running all verifications:

- [ ] All directories exist
- [ ] All files are in place
- [ ] .env is configured with real token
- [ ] Dependencies installed
- [ ] API connection works
- [ ] All tools show help without errors
- [ ] task-list returns tasks (or empty list)
- [ ] task-suggest returns suggestions

**If all checks pass, the Bob Task Skill is ready to use!**

