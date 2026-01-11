# Verification Checklist

> **MANDATORY:** Complete ALL checks before marking installation as successful.

## Installation Verification

Run these commands and confirm each passes:

### File Structure

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check 1: Skill directory exists (TitleCase)
[ -d "$PAI_DIR/skills/Telos" ] && echo "✓ Telos directory exists" || echo "✗ FAIL: Telos directory missing"

# Check 2: SKILL.md exists
[ -f "$PAI_DIR/skills/Telos/SKILL.md" ] && echo "✓ SKILL.md exists" || echo "✗ FAIL: SKILL.md missing"

# Check 3: Data directory exists
[ -d "$PAI_DIR/skills/Telos/data" ] && echo "✓ data/ directory exists" || echo "✗ FAIL: data/ directory missing"

# Check 4: SKILL.md has correct name (TitleCase in YAML)
grep -q "^name: Telos" "$PAI_DIR/skills/Telos/SKILL.md" && echo "✓ SKILL.md has correct name" || echo "⚠️  WARN: Check SKILL.md name field"
```

### Checklist

- [ ] `$PAI_DIR/skills/Telos/` directory exists
- [ ] `$PAI_DIR/skills/Telos/SKILL.md` file present and readable
- [ ] `$PAI_DIR/skills/Telos/data/` directory created
- [ ] SKILL.md YAML frontmatter has `name: Telos` (TitleCase)
- [ ] Claude Code has been restarted after installation

---

## Functionality Verification

### Activation Test

After restarting Claude Code, test the skill trigger:

```
User: "Bob, business partner mode"
```

**Expected Response:**
- Bob acknowledges "Business partner mode activated"
- Shows GoodFields priority goals (G1, G2...)
- Shows FabLab status
- Lists active leads or projects
- Suggests priority action

### Alternative Triggers to Test

| Trigger | Expected Behavior |
|---------|-------------------|
| "check my context" | Read and summarize Telos data files |
| "what should I focus on?" | Return G1 priority from Telos |
| "how are my leads?" | Show Active Leads table from goodfields.md |
| "W1" or "wisdom 1" | Reference first wisdom principle |

---

## Data File Verification

**IMPORTANT:** The Telos skill requires your personal data files to function properly.

### Check Data Files Imported

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== Checking Telos data files ==="
for f in goodfields.md personal.md fablab.md; do
  if [ -f "$PAI_DIR/skills/Telos/data/$f" ]; then
    lines=$(wc -l < "$PAI_DIR/skills/Telos/data/$f")
    if [ "$lines" -gt 5 ]; then
      echo "✓ $f exists and has content ($lines lines)"
    else
      echo "⚠️  $f exists but appears empty ($lines lines) - import your data"
    fi
  else
    echo "✗ $f NOT FOUND - import from backup or create manually"
  fi
done
```

### Import From Backup

If you have `TelosData.tar.gz` or similar backup:

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
tar -xzf ~/TelosData.tar.gz -C "$PAI_DIR/skills/Telos/data/"
```

### Data Import Checklist

- [ ] `goodfields.md` imported with Goals (G1-G3), Leads table, Risk Register
- [ ] `personal.md` imported with Wisdom (W1-W15), Challenges, Values
- [ ] `fablab.md` imported with Infrastructure projects, Services, Network topology
- [ ] Files have actual content (not just placeholders)

---

## Troubleshooting

### Skill Doesn't Activate

1. **Check TitleCase**: Directory must be `Telos/` not `telos/`
   ```bash
   ls "$PAI_DIR/skills/" | grep -i telos
   ```

2. **Check YAML name**: Must be `name: Telos` in SKILL.md frontmatter
   ```bash
   head -5 "$PAI_DIR/skills/Telos/SKILL.md"
   ```

3. **Restart Claude Code**: Skills only load on startup

4. **Check permissions**:
   ```bash
   ls -la "$PAI_DIR/skills/Telos/"
   ```

### Data Not Loading

1. **Check file paths**: Data files must be in `$PAI_DIR/skills/Telos/data/`
2. **Check file content**: Files should be valid markdown
3. **Check SKILL.md references**: Paths in SKILL.md should match actual locations

---

## Final Checklist

- [ ] All file structure checks pass
- [ ] Skill activates on "business partner mode"
- [ ] No errors in Claude Code console
- [ ] **Personal data files imported** (goodfields.md, personal.md, fablab.md)
- [ ] Data files have actual content (not empty placeholders)

**Installation is COMPLETE only when ALL checks pass.**

**Reminder:** Your personal data files contain sensitive business information. Keep backups secure and do NOT commit them to git.
