---
name: bob-project-management-skill
version: 1.0.0
author: Wally Kroeker
description: Project documentation standardization and audit system - ensures all projects have CLAUDE.md and tasks.md
type: skill
dependencies:
  - pai-core-install
---

# bob-project-management-skill

**Project documentation standardization and audit system for Bob's projects.**

## Problem

Bob maintains 15+ active projects with inconsistent documentation:
- 6 projects have CLAUDE.md, 8 don't, 1 has wrong filename (CLAUDE_README.md)
- Task tracking scattered across TODO.md, PROJECT_STATUS.md, TASK_BREAKDOWN.md, ROADMAP.md
- Documentation duplicated between README.md, cline_docs/, scattered .md files
- No systematic way to audit or fix documentation standards

**Result:** Context switching overhead, redundant documentation, unclear task status, wasted tokens loading duplicate content.

## Solution

A skill that:
1. **Audits** projects against documentation standards (CLAUDE.md + tasks.md)
2. **Creates** missing files using project-type-specific templates
3. **Consolidates** scattered documentation into standard locations
4. **Archives** redundant files after consolidation (with user approval)

**Phase 1 scope:** Core standardization only. No PM delegation features (saved for Phase 2).

## Architecture

### Workflow Routing

| Intent | Triggers | Workflow |
|--------|----------|----------|
| Audit project | "audit project [name]", "check project [name]" | AuditProject |
| Standardize project | "standardize [name]", "fix project [name]" | StandardizeProject |

### Templates

**5 CLAUDE.md templates for different project types:**
- **infrastructure** - Networks, services, domains (e.g., fablab)
- **application** - Apps with stack/dev/deploy info (e.g., daemon, wallykroeker.com)
- **creative** - Writing projects with content structure (e.g., StillPoint)
- **library** - NPM packages, Python packages
- **personal** - Thinking spaces, journals (e.g., TSFUR)

**1 tasks.md template:**
- TodoWrite-compatible format (status: pending/in_progress/completed)
- YAML frontmatter + Markdown sections
- Auto-generates activeForm from task content

### Project Type Detection

Automatic detection based on project contents:
- Docker files, network configs → **infrastructure**
- package.json + src/ → **application** or **library**
- novel/, world/, prose content → **creative**
- Personal directory names, journal/ → **personal**

### Standardization Process

1. **Run audit** - Assess current state
2. **Create CLAUDE.md** - If missing, use appropriate template
3. **Enhance CLAUDE.md** - If exists, merge unique content from other docs
4. **Create tasks.md** - Convert existing task files to standard format
5. **Create docs/** - Organize scattered documentation (if needed)
6. **Archive redundants** - Move superseded files to .archive/YYYY-MM-DD/

**Every step requires user approval.**

### Safety Measures

- Never auto-create/modify without showing draft first
- Never auto-archive without listing files and getting confirmation
- Preserve originals in .archive/YYYY-MM-DD/ directory
- Show diffs when updating existing files
- Respect .gitignore (don't process gitignored directories)

## tasks.md Format

**Format:** YAML frontmatter + Markdown sections

```markdown
---
project: project-name
last_updated: 2026-01-20T15:30:00-06:00
---

# Project Tasks

## In Progress

### Task name here
- **Status**: in_progress
- **Active Form**: Doing the task here
- **Started**: 2026-01-18
- **Notes**: Context about the task

## Pending

### Another task
- **Status**: pending
- **Active Form**: Doing another task
- **Priority**: high

## Completed

### Finished task
- **Status**: completed
- **Active Form**: Finishing the task
- **Completed**: 2026-01-15
```

**Conversion from existing formats:**
- `- [ ]` → status: pending
- `- [x]` → status: completed
- Section headers ("In Progress", "Completed", "Deferred") → infer status
- Auto-generate activeForm (present continuous version of content)

## Files Installed

```
~/.claude/skills/ProjectManagement/
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

## Usage Examples

### Audit a project

```
User: "audit project ultimate-tetris"

Bob: [Runs audit, reports compliance status, lists files found, recommends fixes]
```

### Standardize a project

```
User: "standardize ultimate-tetris"

Bob:
## Audit Results
- CLAUDE.md: Missing
- tasks.md: Missing (found PROJECT_STATUS.md + TASK_BREAKDOWN.md)

## Step 1: Create CLAUDE.md
[Shows draft from application template]
Approve? (y/n)

## Step 2: Create tasks.md
[Shows 23 tasks converted from existing files]
Approve? (y/n)

## Step 3: Archive redundant files
Move PROJECT_STATUS.md, TASK_BREAKDOWN.md to .archive/2026-01-20/? (y/n)

## Complete!
ultimate-tetris now meets documentation standards.
```

## What This Does NOT Do (Phase 2 Features)

- Agent assignment or delegation coordination
- "go do it" bulk delegation to agents
- PM features like overdue tracking, agent matching
- Persistent project registry

Phase 1 focuses on **documentation standardization only**.

## Technical Details

- **Language:** Markdown workflows (no code)
- **Detection:** File system analysis for project type
- **Consolidation:** Content extraction and merging from multiple sources
- **Archive:** .archive/YYYY-MM-DD/ timestamped directories

## License

MIT
