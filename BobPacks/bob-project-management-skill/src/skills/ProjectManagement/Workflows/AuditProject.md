# AuditProject Workflow

**Purpose:** Check if a project meets documentation standards (CLAUDE.md + tasks.md).

## Input

- Project name (e.g., "ultimate-tetris")
- OR full path (e.g., "/home/bob/projects/ultimate-tetris")

## Steps

### 1. Resolve Project Path

If user provides just a name, check common locations:
- `/home/bob/projects/{name}`
- Current working directory

If project doesn't exist, report error and exit.

### 2. Detect Project Type

Analyze project contents to determine type:

**infrastructure** - Look for:
- docker-compose.yml
- Dockerfiles
- Network configuration files
- terraform/, ansible/ directories

**application** - Look for:
- package.json + src/ directory
- Frontend framework indicators (React, Vue, etc.)
- Backend framework indicators (Express, Fastify, Django, etc.)

**library** - Look for:
- package.json with `"main"` or `"exports"`
- No src/app/ or frontend structure
- pyproject.toml with library metadata

**creative** - Look for:
- novel/, world/, prose/ directories
- .fountain files (screenplay format)
- Large markdown files with creative content

**personal** - Look for:
- journal/ directory
- Personal naming patterns (TSFUR, etc.)
- Lack of code structure

### 3. Check CLAUDE.md Status

Scan project root for:
- `CLAUDE.md` - ✅ Present
- `claude.md`, `Claude.md`, `CLAUDE_README.md` - ⚠️ Wrong name
- Not found - ❌ Missing

**If present:** Verify it has expected sections for project type:
- **infrastructure**: Services table, Common operations
- **application**: Stack, Development, Deployment
- **creative**: Content structure, Content standards
- **library**: API reference, Installation, Usage
- **personal**: Purpose, Structure

### 4. Check tasks.md Status

Scan project root for:
- `tasks.md` with YAML frontmatter - ✅ Present
- `tasks.md` without YAML - ⚠️ Needs conversion
- Not found, but other task files exist - ⚠️ Needs conversion
- Not found - ❌ Missing

**Task files to detect:**
- TODO.md
- PROJECT_STATUS.md
- TASK_BREAKDOWN.md
- ROADMAP.md
- .md files with `- [ ]` or `- [x]` checkboxes

### 5. Check Documentation Organization

Scan for scattered documentation:

**Organized** - Look for:
- docs/ directory with multiple .md files
- cline_docs/ directory (common AI context location)
- Clear separation of concerns

**Scattered** - Look for:
- Multiple .md files in project root
- Duplicate information across files
- Unclear organization

**Missing** - No additional documentation beyond README

### 6. List Files Found

Report ALL documentation and task files found:

**Documentation files:**
- README.md
- ARCHITECTURE.md
- API.md
- Any other .md files
- cline_docs/ contents

**Task files:**
- TODO.md
- PROJECT_STATUS.md
- TASK_BREAKDOWN.md
- ROADMAP.md
- Any .md files with task lists

### 7. Generate Report

Output compliance report:

```markdown
## Project Audit: [project-name]

**Path:** /home/bob/projects/[project-name]
**Type:** [detected-type]

### Compliance Status

| Standard | Status | Details |
|----------|--------|---------|
| CLAUDE.md | [✅/❌/⚠️] | [details] |
| tasks.md | [✅/❌/⚠️] | [details] |
| Documentation | [✅ Organized / ⚠️ Scattered / ❌ Missing] | [details] |

### Files Found

**Documentation:**
[List all .md files and their purpose/size]

**Task tracking:**
[List task files and number of tasks found]

### Recommendations

[Based on findings, recommend specific actions]

**Next step:** Run `standardize [project-name]` to fix all issues automatically.
```

## Example Output

### Example 1: Project with no documentation

```markdown
## Project Audit: GBAIC

**Path:** /home/bob/projects/GBAIC
**Type:** application (has package.json + src/)

### Compliance Status

| Standard | Status | Details |
|----------|--------|---------|
| CLAUDE.md | ❌ Missing | No CLAUDE.md found |
| tasks.md | ⚠️ Needs conversion | Found TODO.md with 12 tasks |
| Documentation | ❌ Missing | Only README.md exists (basic setup instructions) |

### Files Found

**Documentation:**
- README.md (845 bytes) - Basic project description and setup

**Task tracking:**
- TODO.md (24 tasks total: 18 pending, 6 completed)

### Recommendations

1. Create CLAUDE.md using **application** template
2. Convert TODO.md to tasks.md format (preserve 24 tasks)
3. Move README.md content into CLAUDE.md

**Next step:** Run `standardize GBAIC` to fix all issues automatically.
```

### Example 2: Project with wrong-named CLAUDE.md

```markdown
## Project Audit: wallykroeker.com

**Path:** /home/bob/projects/wallykroeker.com
**Type:** application (Next.js app)

### Compliance Status

| Standard | Status | Details |
|----------|--------|---------|
| CLAUDE.md | ⚠️ Wrong name | Found CLAUDE_README.md instead |
| tasks.md | ⚠️ Needs conversion | Found TODO_BOB_AUTHORSHIP.md |
| Documentation | ✅ Organized | Has docs/ directory |

### Files Found

**Documentation:**
- CLAUDE_README.md (2.1 KB) - Should be renamed to CLAUDE.md
- README.md (450 bytes) - Basic description
- docs/deployment.md
- docs/content-strategy.md

**Task tracking:**
- TODO_BOB_AUTHORSHIP.md (8 tasks for Bob attribution feature)

### Recommendations

1. Rename CLAUDE_README.md → CLAUDE.md
2. Convert TODO_BOB_AUTHORSHIP.md to tasks.md format
3. Merge README.md into CLAUDE.md (if unique content exists)

**Next step:** Run `standardize wallykroeker.com` to fix all issues automatically.
```

### Example 3: Fully compliant project

```markdown
## Project Audit: Bob2.0

**Path:** /home/bob/projects/Bob2.0
**Type:** infrastructure (PAI system)

### Compliance Status

| Standard | Status | Details |
|----------|--------|---------|
| CLAUDE.md | ✅ Present | 3.2 KB, has proper sections |
| tasks.md | ❌ Missing | No task tracking file found |
| Documentation | ✅ Organized | Well-structured docs/ directory |

### Files Found

**Documentation:**
- CLAUDE.md (3.2 KB) - Comprehensive project overview
- README.md (5.1 KB) - Public-facing documentation
- PACKS.md, SECURITY.md, Tools/

**Task tracking:**
- None found

### Recommendations

No critical issues. Consider creating tasks.md if project has active tasks to track.

**Status:** Project meets documentation standards.
```

## Edge Cases

**Project path doesn't exist:**
Report error with suggestions for common typos or similar project names.

**Multiple project types detected:**
Use primary indicators:
- package.json → application or library
- Dockerfile + no code → infrastructure
- Prioritize most specific type

**No files at all:**
Report as "Empty or uninitialized project" and suggest running standardize to bootstrap.

**Git ignored files:**
Don't scan .gitignore'd directories (node_modules/, .venv/, dist/, etc.)

## Output Format Rules

1. Use exact status symbols: ✅ ❌ ⚠️
2. Always include file sizes in bytes/KB
3. Count tasks in task files (e.g., "24 tasks: 18 pending, 6 completed")
4. Provide specific, actionable recommendations
5. End with clear next step (usually "standardize" command)

## Integration

This workflow is called by SKILL.md when user says:
- "audit project [name]"
- "check project [name]"
- "does [project] have CLAUDE.md"
