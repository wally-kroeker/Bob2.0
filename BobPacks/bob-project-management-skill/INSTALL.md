# Installation Guide - bob-project-management-skill

## Pre-Installation System Check

Verify PAI_DIR is set and pai-core-install is installed:

```bash
echo $PAI_DIR
# Should output: /home/bob/.claude (or your custom path)

ls $PAI_DIR/skills/CORE/SKILL.md
# Should exist (confirms pai-core-install is present)
```

If PAI_DIR is not set:
```bash
export PAI_DIR="$HOME/.claude"
```

## Installation Steps

### 1. Verify source files exist

```bash
ls /home/bob/projects/Bob2.0/BobPacks/bob-project-management-skill/src/skills/ProjectManagement/
```

You should see:
- SKILL.md
- Workflows/
- Templates/

### 2. Create skill directory

```bash
mkdir -p $PAI_DIR/skills/ProjectManagement/{Workflows,Templates}
```

### 3. Copy SKILL.md

```bash
cp /home/bob/projects/Bob2.0/BobPacks/bob-project-management-skill/src/skills/ProjectManagement/SKILL.md \
   $PAI_DIR/skills/ProjectManagement/
```

### 4. Copy workflows

```bash
cp /home/bob/projects/Bob2.0/BobPacks/bob-project-management-skill/src/skills/ProjectManagement/Workflows/*.md \
   $PAI_DIR/skills/ProjectManagement/Workflows/
```

### 5. Copy templates

```bash
cp /home/bob/projects/Bob2.0/BobPacks/bob-project-management-skill/src/skills/ProjectManagement/Templates/*.md \
   $PAI_DIR/skills/ProjectManagement/Templates/
```

### 6. Verify installation

See VERIFY.md for the complete verification checklist.

## What Gets Installed

```
$PAI_DIR/skills/ProjectManagement/
├── SKILL.md                           # Skill activation and routing
├── Workflows/
│   ├── AuditProject.md                # Audit single project
│   └── StandardizeProject.md          # Create/consolidate/archive all-in-one
└── Templates/
    ├── CLAUDE.infrastructure.md       # For infrastructure projects
    ├── CLAUDE.application.md          # For application projects
    ├── CLAUDE.creative.md             # For creative/writing projects
    ├── CLAUDE.library.md              # For library/package projects
    ├── CLAUDE.personal.md             # For personal/thinking spaces
    └── tasks.md                       # Standard tasks.md template
```

## Post-Installation

No additional configuration required. The skill activates automatically when you say:
- "audit project [name]"
- "standardize [name]"

## Troubleshooting

**Skill doesn't activate:**
- Verify SKILL.md is in correct location: `$PAI_DIR/skills/ProjectManagement/SKILL.md`
- Check SKILL.md has proper YAML frontmatter with `name: ProjectManagement`
- Restart Claude Code session

**Templates not found:**
- Verify templates exist: `ls $PAI_DIR/skills/ProjectManagement/Templates/`
- All 6 template files should be present (5 CLAUDE templates + tasks.md)

**Workflows fail:**
- Check workflow files: `ls $PAI_DIR/skills/ProjectManagement/Workflows/`
- Ensure both AuditProject.md and StandardizeProject.md exist
