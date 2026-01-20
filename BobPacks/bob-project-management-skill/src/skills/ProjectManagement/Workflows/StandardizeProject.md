# StandardizeProject Workflow

**Purpose:** All-in-one workflow that creates missing files, consolidates documentation, and archives redundants.

**This workflow does EVERYTHING in one go, with user approval at each step.**

## Input

- Project name (e.g., "ultimate-tetris")
- OR full path (e.g., "/home/bob/projects/ultimate-tetris")

## Overview

This workflow:
1. Runs audit to assess current state
2. Creates or enhances CLAUDE.md
3. Creates tasks.md from existing task files
4. Organizes scattered documentation (if needed)
5. Archives redundant files (with approval)
6. Provides final summary

**Every modification requires user approval.**

## Step 1: Run Audit

Use the AuditProject workflow to assess current state.

Output the audit report to show user what needs fixing.

```markdown
## Audit Results

[Full audit report from AuditProject workflow]
```

## Step 2: CLAUDE.md - Create or Enhance

### If CLAUDE.md is missing:

**2a. Detect project type** (same logic as AuditProject)

**2b. Select appropriate template:**
- infrastructure → CLAUDE.infrastructure.md
- application → CLAUDE.application.md
- creative → CLAUDE.creative.md
- library → CLAUDE.library.md
- personal → CLAUDE.personal.md

**2c. Extract content from existing files:**

Scan for:
- README.md - Project overview, setup instructions
- ARCHITECTURE.md - System design
- API.md - API documentation
- cline_docs/ - AI context files
- Other .md files in root

**2d. Populate template:**

For each template section, extract relevant content:

**Example for application template:**
- **Overview** - From README.md first paragraph
- **Stack** - Detect from package.json, requirements.txt, etc.
- **Development** - Extract setup/run commands from README
- **Project Structure** - Generate from actual directory structure
- **Conventions** - Extract from CONTRIBUTING.md or README sections

**2e. Show draft:**

```markdown
## Step 1: Create CLAUDE.md

I've detected this is an **application** project (has package.json, src/).

I'll create CLAUDE.md by merging:
- README.md (project overview, setup instructions)
- package.json (stack detection)

[Shows complete CLAUDE.md draft with all populated sections]

Approve? (y/n)
```

**2f. Wait for approval:**
- If yes: Write CLAUDE.md
- If no: Ask what to change, regenerate draft

### If CLAUDE.md exists:

**2a. Check for wrong name:**

If file is named CLAUDE_README.md or similar:
```markdown
## Step 1: Rename CLAUDE.md

Found CLAUDE_README.md - should be CLAUDE.md.

Rename CLAUDE_README.md → CLAUDE.md? (y/n)
```

**2b. Check for unique content in other files:**

Read CLAUDE.md and compare with:
- README.md
- Other .md files
- cline_docs/

Identify content that exists in other files but NOT in CLAUDE.md.

**2c. Suggest enhancements:**

```markdown
## Step 1: Enhance CLAUDE.md

CLAUDE.md exists but could be enhanced with:

1. **Deployment section** - Found in README.md:
   [Show specific content to add]

2. **API reference** - Found in API.md:
   [Show specific content to add]

[Show diff of proposed changes]

Approve enhancements? (y/n)
```

**2d. Update if approved:**
- If yes: Update CLAUDE.md
- If no: Skip to next step

### If CLAUDE.md is compliant:

```markdown
## Step 1: CLAUDE.md Status

✅ CLAUDE.md exists and is comprehensive.

No changes needed.
```

## Step 3: tasks.md - Create from Existing Files

### If tasks.md is missing:

**3a. Scan for existing task files:**

Look for:
- TODO.md
- PROJECT_STATUS.md
- TASK_BREAKDOWN.md
- ROADMAP.md
- Any .md files with `- [ ]` or `- [x]` checkboxes

**3b. Parse tasks from all files:**

For each file:
- Extract all task items
- Detect status:
  - `- [ ]` → pending
  - `- [x]` → completed
  - Section headers "In Progress", "Doing", "Active" → in_progress
  - Section headers "Done", "Completed", "Finished" → completed
  - Section headers "Deferred", "Backlog", "Future" → pending with note

**3c. Generate activeForm:**

For each task content, generate present continuous form:
- "Fix login bug" → "Fixing login bug"
- "Add dark mode" → "Adding dark mode"
- "Implement API" → "Implementing API"

**3d. Organize into sections:**

Group tasks by status:
- In Progress (status: in_progress)
- Pending (status: pending)
- Completed (status: completed)

**3e. Show preview:**

```markdown
## Step 2: Create tasks.md

I found 2 task files to convert:
- PROJECT_STATUS.md (15 completed features)
- TASK_BREAKDOWN.md (8 pending tasks across workstreams)

[Shows complete tasks.md with all tasks organized by status]

Total: 23 tasks (8 pending, 0 in progress, 15 completed)

Approve? (y/n)
```

**3f. Write if approved:**
- If yes: Write tasks.md
- If no: Ask what to change

### If tasks.md exists but needs conversion:

```markdown
## Step 2: tasks.md Status

Found tasks.md but it lacks YAML frontmatter and proper structure.

Convert to standard format? (y/n)

[If yes, parse and rewrite with proper format]
```

### If tasks.md is compliant:

```markdown
## Step 2: tasks.md Status

✅ tasks.md exists with proper format.

No changes needed.
```

## Step 4: Documentation Organization (Optional)

### If scattered documentation exists:

**4a. Identify scattered files:**

Look for .md files in project root that should be in docs/:
- ARCHITECTURE.md
- API.md
- DESIGN.md
- CONTRIBUTING.md
- etc.

**Exclude from consideration:**
- README.md (stays in root)
- CLAUDE.md (stays in root)
- tasks.md (stays in root)
- CHANGELOG.md (stays in root)
- LICENSE.md (stays in root)

**4b. Suggest organization:**

```markdown
## Step 3: Organize Documentation

Found scattered documentation files:
- ARCHITECTURE.md
- API.md
- DESIGN.md

Suggested structure:
- Move to docs/ directory
- Create docs/README.md index

Create docs/ and move files? (y/n)
```

**4c. Execute if approved:**
- Create docs/ directory
- Move files
- Create docs/README.md with index

### If documentation is already organized:

```markdown
## Step 3: Documentation Organization

✅ Documentation is well-organized.

No changes needed.
```

### If no additional documentation:

```markdown
## Step 3: Documentation Organization

No additional documentation files found.

Skipping.
```

## Step 5: Archive Redundant Files

**5a. Identify redundant files:**

Files become redundant when:
- Content fully merged into CLAUDE.md
- Task files converted to tasks.md
- Duplicate documentation

**Candidates for archival:**

After CLAUDE.md creation:
- README.md (if 100% merged, but usually keep it)
- cline_docs/ files (if merged)
- Duplicate .md files

After tasks.md creation:
- TODO.md
- PROJECT_STATUS.md
- TASK_BREAKDOWN.md
- ROADMAP.md

**Never archive:**
- README.md (usually has public-facing content)
- LICENSE
- .gitignore
- package.json, requirements.txt, etc.

**5b. Show list:**

```markdown
## Step 4: Archive Redundant Files

Now that information is consolidated, these files can be archived:

- PROJECT_STATUS.md (content merged into tasks.md)
- TASK_BREAKDOWN.md (content merged into tasks.md)
- cline_docs/projectRoadmap.md (content merged into CLAUDE.md)

These files will be moved to .archive/2026-01-20/

Archive these files? (y/n)
```

**5c. Execute if approved:**

- Create .archive/YYYY-MM-DD/ directory
- Move approved files
- Generate archive report (.archive/2026-01-20/ARCHIVE_REPORT.md)

**Archive report format:**

```markdown
# Archive Report - 2026-01-20

## Files Archived

### PROJECT_STATUS.md
- **Reason:** Content merged into tasks.md
- **Original path:** /home/bob/projects/ultimate-tetris/PROJECT_STATUS.md
- **Archived to:** .archive/2026-01-20/PROJECT_STATUS.md
- **Size:** 2.1 KB

### TASK_BREAKDOWN.md
- **Reason:** Content merged into tasks.md
- **Original path:** /home/bob/projects/ultimate-tetris/TASK_BREAKDOWN.md
- **Archived to:** .archive/2026-01-20/TASK_BREAKDOWN.md
- **Size:** 1.8 KB

## Recovery

To restore a file:
\`\`\`bash
cp .archive/2026-01-20/[filename] ./
\`\`\`

To view archived files:
\`\`\`bash
ls -la .archive/2026-01-20/
\`\`\`
```

### If no files to archive:

```markdown
## Step 4: Archive Redundant Files

No redundant files identified.

Skipping.
```

## Step 6: Final Summary

**6a. Summarize all changes:**

```markdown
## Standardization Complete!

### Changes Made

**Created:**
- CLAUDE.md (application template, 3.2 KB)
- tasks.md (23 tasks: 8 pending, 15 completed)

**Enhanced:**
- [List any files enhanced]

**Organized:**
- Created docs/ directory
- Moved 3 files to docs/

**Archived:**
- PROJECT_STATUS.md → .archive/2026-01-20/
- TASK_BREAKDOWN.md → .archive/2026-01-20/

### Compliance Status

| Standard | Before | After |
|----------|--------|-------|
| CLAUDE.md | ❌ Missing | ✅ Present |
| tasks.md | ❌ Missing | ✅ Present |
| Documentation | ⚠️ Scattered | ✅ Organized |

### Next Steps

1. Review CLAUDE.md and tasks.md
2. Commit changes: `git add CLAUDE.md tasks.md && git commit -m "docs: standardize project documentation"`
3. If needed, update .gitignore to include .archive/

**Project now meets documentation standards.**
```

## Example Execution

### Example: ultimate-tetris (complex conversion)

```markdown
User: standardize ultimate-tetris

## Audit Results

**Path:** /home/bob/projects/ultimate-tetris
**Type:** application

- CLAUDE.md: ❌ Missing
- tasks.md: ❌ Missing (found PROJECT_STATUS.md + TASK_BREAKDOWN.md)
- Documentation: ⚠️ Scattered (THEMES.md, README.md)

---

## Step 1: Create CLAUDE.md

I've detected this is an **application** project (has package.json, frontend/, backend/).

I'll create CLAUDE.md by merging:
- README.md (setup instructions, tech stack)
- THEMES.md (design reference)

[Shows full CLAUDE.md draft with all sections populated]

Approve? (y/n)

User: y

✅ CLAUDE.md created successfully.

---

## Step 2: Create tasks.md

I found 2 task files to convert:
- PROJECT_STATUS.md (15 completed features)
- TASK_BREAKDOWN.md (8 pending tasks across 3 workstreams)

[Shows full tasks.md with all 23 tasks organized]

Approve? (y/n)

User: y

✅ tasks.md created successfully.

---

## Step 3: Documentation Organization

All documentation is in root. No organization needed.

Skipping.

---

## Step 4: Archive Redundant Files

Now that information is consolidated, these files can be archived:

- PROJECT_STATUS.md (merged into tasks.md)
- TASK_BREAKDOWN.md (merged into tasks.md)

Move to .archive/2026-01-20/? (y/n)

User: y

✅ Files archived successfully.

---

## Standardization Complete!

### Changes Made

**Created:**
- CLAUDE.md (3.2 KB)
- tasks.md (23 tasks)

**Archived:**
- PROJECT_STATUS.md → .archive/2026-01-20/
- TASK_BREAKDOWN.md → .archive/2026-01-20/

**Project now meets documentation standards.**
```

## Safety Rules

1. **NEVER write files without showing draft first**
2. **NEVER archive without listing files and getting approval**
3. **ALWAYS preserve originals in .archive/**
4. **ALWAYS show diffs when updating existing files**
5. **ALWAYS wait for user approval (y/n) before each step**
6. **Respect .gitignore** - don't process ignored directories

## Edge Cases

**User declines all changes:**
- Respect decision, explain what won't be done
- Provide manual instructions if user wants to do it themselves

**Partial approval:**
- User approves CLAUDE.md but not tasks.md
- Continue with approved changes only

**Conflicting content:**
- If README.md and ARCHITECTURE.md have different info
- Show both versions, ask user which to use

**Empty project:**
- If no files exist at all
- Still offer to create CLAUDE.md + tasks.md with empty templates

**Git conflict:**
- If files are modified but not committed
- Warn user, suggest committing first

## Integration

This workflow is called by SKILL.md when user says:
- "standardize [name]"
- "fix project [name]"
- "create CLAUDE.md for [name]"
