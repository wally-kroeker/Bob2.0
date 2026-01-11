# Verification Checklist

> **MANDATORY:** Complete ALL checks before marking installation as successful.

## Installation Verification

Run these commands and confirm each passes:

### File Structure

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check 1: Skill directory exists (TitleCase)
[ -d "$PAI_DIR/skills/Vikunja" ] && echo "✓ Vikunja directory exists" || echo "✗ FAIL: Vikunja directory missing"

# Check 2: SKILL.md exists
[ -f "$PAI_DIR/skills/Vikunja/SKILL.md" ] && echo "✓ SKILL.md exists" || echo "✗ FAIL: SKILL.md missing"

# Check 3: SKILL.md has correct name (TitleCase in YAML)
grep -q "^name: Vikunja" "$PAI_DIR/skills/Vikunja/SKILL.md" && echo "✓ SKILL.md has correct name" || echo "⚠️  WARN: Check SKILL.md name field"

# Check 4: SKILL.md has substantial content (reference documentation)
lines=$(wc -l < "$PAI_DIR/skills/Vikunja/SKILL.md")
[ "$lines" -gt 100 ] && echo "✓ SKILL.md has content ($lines lines)" || echo "⚠️  WARN: SKILL.md seems too short ($lines lines)"
```

### Checklist

- [ ] `$PAI_DIR/skills/Vikunja/` directory exists (TitleCase)
- [ ] `$PAI_DIR/skills/Vikunja/SKILL.md` file present and readable
- [ ] SKILL.md YAML frontmatter has `name: Vikunja` (TitleCase)
- [ ] SKILL.md contains comprehensive documentation (600+ lines expected)
- [ ] Claude Code has been restarted after installation

---

## Optional: MCP Integration Verification

If Vikunja MCP is configured:

```bash
# Check MCP server connected
claude mcp list | grep -i vikunja
# Expected: vikunja  ✓ Connected

# Test MCP tool (if connected)
# This verifies the MCP integration documented in SKILL.md works
```

---

## Optional: Database Query Verification

If database queries are configured:

```bash
# Check script exists
if [ -f ~/.claude/scripts/vikunja-db-query.sh ]; then
  echo "✓ Database query script exists"
  
  # Test connection (requires SSH access to taskman)
  ~/.claude/scripts/vikunja-db-query.sh stats 2>/dev/null && echo "✓ Database connection works" || echo "○ Database not accessible (optional)"
else
  echo "○ Database query script not installed (optional)"
fi
```

---

## Functionality Verification

### Reference Skill Test

This is a **reference skill** - it provides documentation, not direct user triggers.

To verify it's working:

1. **Check skill is loaded** (after Claude Code restart):
   ```
   User: "What MCP tools are available for Vikunja?"
   Expected: Bob references the Vikunja skill documentation
   ```

2. **Verify documentation accessible**:
   ```
   User: "How do I query parent tasks in Vikunja?"
   Expected: Bob explains the database query method from SKILL.md
   ```

### Companion Skill Check

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check if taskman skill is installed (handles user queries)
if [ -d "$PAI_DIR/skills/Taskman" ]; then
  echo "✓ taskman skill installed - user queries will work"
else
  echo "⚠️  taskman skill not installed"
  echo "   Install bob-taskman-skill for user-facing task management"
fi
```

---

## Troubleshooting

### Skill Not Found

1. **Check TitleCase**: Directory must be `Vikunja/` not `vikunja/`
   ```bash
   ls "$PAI_DIR/skills/" | grep -i vikunja
   ```

2. **Check YAML name**: Must be `name: Vikunja` in SKILL.md frontmatter
   ```bash
   head -5 "$PAI_DIR/skills/Vikunja/SKILL.md"
   ```

3. **Restart Claude Code**: Skills only load on startup

### MCP Not Connected

See SKILL.md "Troubleshooting" section for MCP connection issues:
- Verify `~/.claude/settings.json` configuration (mcpServers.vikunja section)
- Check Vikunja instance is accessible
- Confirm API token has permissions

### Database Queries Failing

See SKILL.md for database query troubleshooting:
- Verify SSH access: `ssh taskman`
- Check script permissions: `chmod 700 ~/.claude/scripts/vikunja-db-query.sh`

---

## Final Checklist

- [ ] All file structure checks pass
- [ ] SKILL.md has TitleCase name (`name: Vikunja`)
- [ ] Claude Code has been restarted
- [ ] Reference documentation is accessible

**Optional (for full functionality):**
- [ ] MCP server connected (if configured)
- [ ] Database queries working (if configured)
- [ ] bob-taskman-skill installed (for user queries)

**Installation is COMPLETE when all required checks pass.**
