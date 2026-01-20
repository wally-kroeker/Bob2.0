# Verification Checklist - bob-project-management-skill

Complete this checklist to verify the pack is installed correctly.

## File Structure Verification

```bash
# Verify main skill file
ls $PAI_DIR/skills/ProjectManagement/SKILL.md
# Expected: File exists

# Verify workflows
ls $PAI_DIR/skills/ProjectManagement/Workflows/AuditProject.md
ls $PAI_DIR/skills/ProjectManagement/Workflows/StandardizeProject.md
# Expected: Both files exist

# Verify all templates exist
ls $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.infrastructure.md
ls $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.application.md
ls $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.creative.md
ls $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.library.md
ls $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.personal.md
ls $PAI_DIR/skills/ProjectManagement/Templates/tasks.md
# Expected: All 6 template files exist
```

## SKILL.md Content Verification

```bash
# Check YAML frontmatter
head -n 5 $PAI_DIR/skills/ProjectManagement/SKILL.md
```

Expected output should include:
```yaml
---
name: ProjectManagement
description: Project documentation standardization and audit system
---
```

## Activation Test

Start a new Claude Code session and test skill activation:

### Test 1: Audit Command

In Claude Code, say:
```
audit project Bob2.0
```

**Expected behavior:**
- Skill activates (no "skill not found" error)
- AuditProject workflow executes
- Returns compliance report for Bob2.0 project

### Test 2: Standardize Command

In Claude Code, say:
```
Show me what would happen if I ran: standardize ultimate-tetris
```

**Expected behavior:**
- Skill activates
- StandardizeProject workflow explains what it would do
- Lists steps: audit, create CLAUDE.md, create tasks.md, archive

## Template Content Verification

```bash
# Verify application template has expected sections
grep "## Stack" $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.application.md
grep "## Development" $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.application.md

# Verify infrastructure template
grep "## Services" $PAI_DIR/skills/ProjectManagement/Templates/CLAUDE.infrastructure.md

# Verify tasks.md template has YAML frontmatter
head -n 5 $PAI_DIR/skills/ProjectManagement/Templates/tasks.md
```

Expected: All grep commands find their target sections.

## Verification Checklist

- [ ] SKILL.md exists at correct path
- [ ] Both workflow files exist (AuditProject.md, StandardizeProject.md)
- [ ] All 6 template files exist
- [ ] SKILL.md has correct YAML frontmatter with `name: ProjectManagement`
- [ ] Application template has Stack, Development, Deployment sections
- [ ] Infrastructure template has Services table
- [ ] tasks.md template has YAML frontmatter
- [ ] "audit project Bob2.0" command activates skill successfully
- [ ] "standardize" command activates skill successfully

## Troubleshooting

**Skill doesn't activate:**
1. Check file path: `echo $PAI_DIR/skills/ProjectManagement/SKILL.md`
2. Verify YAML frontmatter: `head -n 5 $PAI_DIR/skills/ProjectManagement/SKILL.md`
3. Restart Claude Code session
4. Try explicit trigger: "Use the ProjectManagement skill to audit project Bob2.0"

**Workflows fail to load:**
1. Verify workflow files exist: `ls $PAI_DIR/skills/ProjectManagement/Workflows/`
2. Check for syntax errors in workflow markdown
3. Ensure workflows have proper headers

**Templates missing:**
1. Verify all 6 files: `ls $PAI_DIR/skills/ProjectManagement/Templates/`
2. Re-run step 5 from INSTALL.md if files are missing

## Success Criteria

Installation is successful when:
1. All files exist in correct locations
2. "audit project Bob2.0" returns a compliance report
3. "standardize [project]" explains standardization steps
4. No file-not-found errors when skill executes

## Post-Verification

Once verified, test on real projects:
1. Audit a project: `audit project ultimate-tetris`
2. Standardize a project: `standardize GBAIC`
3. Verify archive functionality works correctly

**Installation complete when all checklist items pass.**
