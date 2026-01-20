---
name: ProjectManagement
description: Project documentation standardization and audit system. USE WHEN user wants to audit project documentation, standardize project structure, check CLAUDE.md compliance, or fix project documentation standards.
---

# ProjectManagement Skill

**Purpose:** Ensure all projects have consistent, high-quality documentation (CLAUDE.md + tasks.md).

## Activation Triggers

This skill activates when the user mentions:
- "audit project [name]"
- "check project [name]"
- "standardize [name]"
- "fix project [name]"
- "does [project] have CLAUDE.md"
- "convert TODO to tasks.md"

## Workflow Routing

| Intent | Trigger Patterns | Workflow |
|--------|-----------------|----------|
| **Audit project** | "audit project [name]", "check project [name]", "does [project] have CLAUDE.md" | AuditProject |
| **Standardize project** | "standardize [name]", "fix project [name]", "create CLAUDE.md for [name]" | StandardizeProject |

## Core Workflows

### AuditProject

**Purpose:** Check if a project meets documentation standards.

**Input:** Project name or path

**Output:** Compliance report showing:
- CLAUDE.md status (present/missing/wrong name)
- tasks.md status (present/missing/needs conversion)
- Documentation organization (organized/scattered/missing)
- List of files found
- Recommendation to run standardize if issues found

**Location:** `Workflows/AuditProject.md`

### StandardizeProject

**Purpose:** All-in-one workflow that creates missing files, consolidates documentation, and archives redundants.

**Steps:**
1. Run audit to assess current state
2. Create CLAUDE.md if missing (or enhance if exists)
3. Create tasks.md if missing (convert existing task files)
4. Create docs/ if needed (organize scattered documentation)
5. Archive redundant files (with user approval)
6. Final summary

**Location:** `Workflows/StandardizeProject.md`

## Templates

The skill includes 6 templates:

### CLAUDE.md Templates (5 types)

1. **CLAUDE.infrastructure.md** - Networks, services, domains
   - Services table
   - Common operations
   - Access & credentials

2. **CLAUDE.application.md** - Apps with stack/dev/deploy
   - Stack section
   - Development (setup, running, testing)
   - Deployment
   - Project structure

3. **CLAUDE.creative.md** - Writing projects
   - Content structure
   - Key reference files
   - Content standards

4. **CLAUDE.library.md** - NPM packages, Python packages
   - API reference
   - Installation
   - Usage examples

5. **CLAUDE.personal.md** - Thinking spaces, journals
   - Purpose
   - Structure
   - Conventions

### tasks.md Template

TodoWrite-compatible format with:
- YAML frontmatter (project, last_updated)
- Sections: In Progress, Pending, Completed, Deferred
- Task format: status, activeForm, priority, assignee, notes, dependencies

**Task fields:**
- **status** (required): pending/in_progress/completed/deferred
- **activeForm** (required): Present continuous form for TodoWrite
- **priority** (optional): high/medium/low
- **assignee** (optional): Bob, Wally, or AI agent names (Bill, Mario, etc.)
- **dependencies** (optional): Other tasks that must complete first
- **notes** (optional): Context, blockers, decisions

**Assignee field purpose:**
The assignee field supports delegation to AI agents ("Bob and friends"). When tasks are assigned to named agents (Bill, Mario, Riker, Howard, etc.), this enables parallel execution and clear responsibility tracking.

**Standard maintained across all project types:**
This format is intentionally standardized. All projects use the same structure regardless of complexity, ensuring consistency and TodoWrite tool compatibility.

**Location:** `Templates/*.md`

## Project Type Detection

The skill automatically detects project type:

| Indicators | Type |
|------------|------|
| Docker files, network configs | infrastructure |
| package.json + src/ | application or library |
| novel/, world/, prose content | creative |
| Personal directory names, journal/ | personal |

## Technical Project Detection & Openspec Routing

**When to invoke Openspec skill:**

For highly technical projects that need detailed specifications and multi-phase breakdown, route to the **Openspec skill** instead of (or in addition to) creating tasks.md.

**Detection criteria for technical projects:**

| Indicator | Route to Openspec |
|-----------|-------------------|
| Complex software project with multiple features | ✅ Yes |
| Multi-phase implementation required | ✅ Yes |
| Technical architecture decisions needed | ✅ Yes |
| API design or system integration | ✅ Yes |
| User mentions "spec", "specification", "phases" | ✅ Yes |
| Simple bug fixes or maintenance | ❌ No - use tasks.md |
| Creative/personal projects | ❌ No - use tasks.md |
| Single-phase projects | ❌ No - use tasks.md |

**Workflow:**
1. During audit/standardization, detect if project is highly technical
2. Ask user: "This appears to be a technical project requiring detailed specs. Would you like me to invoke the Openspec skill to create a specification with phases?"
3. If yes: Use Openspec skill for phase breakdown and architecture
4. Then: Create tasks.md from Openspec phases (or defer to implementation phase)

**Integration pattern:**
- Openspec creates: Specification with phases, architecture decisions, technical details
- ProjectManagement creates: tasks.md for tracking implementation
- Openspec phases become high-level milestones in tasks.md
- Detailed per-phase tasks added during implementation

**Primary use case:** Coding projects, technical infrastructure builds, API development

## tasks.md Conversion

Converts existing task files to standard format:

| Source | Conversion |
|--------|------------|
| `- [ ]` checkbox | status: pending |
| `- [x]` checkbox | status: completed |
| Section "In Progress" | status: in_progress |
| Plain text task | Generate activeForm (present continuous) |

**Supported source files:**
- TODO.md
- PROJECT_STATUS.md
- TASK_BREAKDOWN.md
- ROADMAP.md
- Any .md file with task lists

## Archival Strategy

After consolidation, redundant files are moved to `.archive/YYYY-MM-DD/` with user approval:

**Archival candidates:**
- Old task files (after tasks.md creation)
- README.md (if fully merged into CLAUDE.md)
- Duplicate documentation
- Superseded files

**Safety rules:**
- Never auto-archive without listing files first
- Always ask user confirmation
- Preserve originals in timestamped directory
- Generate archive report

## Safety Measures

1. **Never auto-create without approval** - Always show drafts first
2. **Never auto-modify without approval** - Show diffs for updates
3. **Never auto-archive** - List files and get confirmation
4. **Preserve originals** - Archive to .archive/YYYY-MM-DD/
5. **Show changes** - Display diffs when updating existing files
6. **Respect .gitignore** - Don't process gitignored directories

## Usage Examples

### Audit a project

```
User: audit project ultimate-tetris
Bob: [Runs audit, shows compliance report, lists files, recommends fixes]
```

### Standardize a project

```
User: standardize ultimate-tetris
Bob:
## Audit Results
- CLAUDE.md: Missing
- tasks.md: Missing (found PROJECT_STATUS.md + TASK_BREAKDOWN.md)

## Step 1: Create CLAUDE.md
[Shows draft]
Approve? (y/n)

## Step 2: Create tasks.md
[Shows converted tasks]
Approve? (y/n)

## Step 3: Archive redundant files
[Lists files]
Archive? (y/n)

## Complete!
```

## What This Skill Does NOT Do

Phase 1 focuses on **documentation standardization only**. Does NOT include:
- Agent assignment or delegation
- "go do it" bulk delegation
- PM features (overdue tracking, agent matching)
- Persistent project registry

(These are Phase 2 features.)

## Integration Points

- **CORE skill** - Uses project detection patterns
- **TodoWrite** - tasks.md format matches TodoWrite tool
- **Openspec skill** - Routes highly technical projects for detailed specification and phase breakdown
- **BobiverseAgents skill** - Assignee field enables delegation to named AI agents (Bill, Mario, etc.)
- **Git** - Respects .gitignore, doesn't commit changes automatically

**Openspec integration:**
When ProjectManagement detects a highly technical project (complex software, multi-phase, architecture decisions), it suggests invoking the Openspec skill for detailed specifications. Openspec handles phase breakdown and technical architecture; ProjectManagement handles task tracking.

## File Locations

All templates and workflows are stored in:
```
$PAI_DIR/skills/ProjectManagement/
├── SKILL.md                    # This file
├── Workflows/
│   ├── AuditProject.md
│   └── StandardizeProject.md
└── Templates/
    ├── CLAUDE.infrastructure.md
    ├── CLAUDE.application.md
    ├── CLAUDE.creative.md
    ├── CLAUDE.library.md
    ├── CLAUDE.personal.md
    └── tasks.md
```

## Development Notes

**Test projects:**
- ultimate-tetris (has PROJECT_STATUS.md + TASK_BREAKDOWN.md)
- GBAIC (has TODO.md)
- wallykroeker.com (has CLAUDE_README.md - wrong name)

**Expected behavior:**
- Audit shows clear compliance status
- Standardize asks approval at every step
- Archive creates timestamped directories
- No files modified without user consent
