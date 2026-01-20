---
project: [project-name]
last_updated: [YYYY-MM-DDTHH:mm:ss-06:00]
---

# Project Tasks

This file tracks tasks for [project-name] in a format compatible with PAI's TodoWrite tool.

## In Progress

(Tasks currently being worked on - status: in_progress)

### [Task name]
- **Status**: in_progress
- **Active Form**: [Present continuous form - e.g., "Implementing feature"]
- **Started**: [YYYY-MM-DD]
- **Assignee**: [Name or "Bob" or "Wally"]
- **Notes**: [Any context, blockers, or important information]

---

## Pending

(Tasks not yet started - status: pending)

### [Task name]
- **Status**: pending
- **Active Form**: [Present continuous form]
- **Priority**: [high/medium/low]
- **Dependencies**: [Other tasks that must complete first, if any]
- **Notes**: [Context or requirements]

### [Another task]
- **Status**: pending
- **Active Form**: [Present continuous form]
- **Priority**: [high/medium/low]

---

## Completed

(Finished tasks - status: completed)

### [Task name]
- **Status**: completed
- **Active Form**: [Present continuous form]
- **Completed**: [YYYY-MM-DD]
- **Notes**: [Any relevant outcomes or lessons learned]

---

## Deferred

(Tasks postponed or on hold)

### [Task name]
- **Status**: deferred
- **Active Form**: [Present continuous form]
- **Reason**: [Why deferred]
- **Review Date**: [When to reconsider]

---

## Notes

**Task Format Guidelines:**
- **Content**: Imperative form ("Fix bug", "Add feature")
- **Active Form**: Present continuous ("Fixing bug", "Adding feature")
- **Status**: Must be one of: pending, in_progress, completed, deferred
- Always include active form - this is used by TodoWrite tool

**Priority Levels:**
- **high**: Blocking or urgent
- **medium**: Important but not blocking
- **low**: Nice to have, can wait

**Best Practices:**
- Keep tasks specific and actionable
- Break large tasks into smaller subtasks
- Update status and notes regularly
- Archive completed tasks when project reaches milestones

**Integration with PAI:**
This file format is compatible with PAI's TodoWrite tool. The tool expects:
- YAML frontmatter with project name and timestamp
- Task sections organized by status
- Each task with status and activeForm fields
