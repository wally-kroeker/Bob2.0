# TaskMan & Vikunja Data Structure Documentation

## Overview

TaskMan is an intelligent task orchestration system that connects natural language task management to Vikunja via MCP (Model Context Protocol), with a local SQLite cache for fast querying.

**Architecture:**
```
User Input (Natural Language)
    ↓
Claude Code (TaskMan Skill)
    ↓
┌─────────────────┬──────────────────┐
│                 │                  │
MCP Tools        SQLite Cache
(Write Ops)      (Read Ops)
│                 │
Vikunja API      ~/.claude/skills/
                  taskman/data/
                  taskman.db
```

---

## 1. Vikunja Data Model

### 1.1 Projects (Hierarchical Organization)

**Structure:**
```
Project {
  id: number,              // Unique identifier
  title: string,           // Display name
  parent_project_id: number | null,  // Parent for hierarchy
  is_archived: boolean,    // Archival status
  description: string,     // Optional details
  created: timestamp,
  updated: timestamp
}
```

**Current Hierarchy:**
```
Root Projects (parent_id = NULL or 0):
├── Inbox (id: 1)              # Temporary/ambiguous tasks
├── Personal (id: 4)           # Personal life management
│   ├── Housework (id: 8)
│   ├── YardWork (id: 9)
│   └── Health & Fitness (id: 10)
├── Work (id: 5)               # Professional work
│   ├── Clients (id: 11)
│   ├── Business Development (id: 12)
│   └── Operations (id: 13)
├── Learning (id: 6)           # Skill development
│   └── Technical Skills (id: 14)
└── Projects (id: 7)           # Major initiatives
    ├── Bob (id: 15)           # PAI/Bob development
    └── wallykroeker.com (id: 16)
```

**Key Principles:**
- **Every task MUST belong to a project** (project_id is required)
- Projects can be nested (parent_project_id creates hierarchy)
- Archive completed projects rather than deleting (preserves history)
- Root projects (id: 1, 4, 5, 6, 7) provide top-level organization

---

### 1.2 Tasks (Work Units)

**Structure:**
```
Task {
  id: number,                   // Unique identifier
  title: string,                // Task description
  project_id: number,           // REQUIRED: Which project
  description: string,          // Extended details
  done: boolean,                // Completion status
  priority: number,             // 0-5 (INVERTED: 5=highest!)
  due_date: timestamp | null,   // ISO 8601 UTC format
  parent_task_id: number | null,// For subtask relationships
  labels: Label[],              // Cross-cutting tags
  created: timestamp,
  updated: timestamp,
  repeat_after: number | null,  // Recurring task interval
  repeat_mode: string | null    // 'day', 'week', 'month', 'year'
}
```

**Priority Scale (INVERTED):**
```
5 = HIGHEST   (Urgent, do now!)
4 = High      (Important)
3 = Medium    (Normal)
2 = Low       (When convenient)
1 = Lowest    (Someday/maybe)
0 = Unset     (No priority assigned)
```

**Due Date Format:**
- ISO 8601 UTC: `"2024-12-31T23:59:59Z"`
- Null/unset: `null` or `"0001-01-01"` (cache representation)
- Time zone: Always UTC, convert from user's local time

**Parent/Subtask Pattern:**
- Parent task: Has `parent_task_id = null`
- Subtask: Has `parent_task_id = <parent-id>`
- Convention: 🎯 emoji for parents, 🤖 for AI-created subtasks
- Note: Current cache shows all tasks with null parent_task_id

---

### 1.3 Labels (Cross-Cutting Tags)

**Structure:**
```
Label {
  id: number,
  title: string,
  description: string,
  hex_color: string    // e.g., "#FF5733"
}
```

**Current Label Usage (Top 14):**
```
ai-subtask (153 tasks)        # AI-generated subtask
Computer (137 tasks)          # Requires computer
Work (115 tasks)              # Work-related
Project (96 tasks)            # Part of larger project
DeepWork (92 tasks)           # Requires focused attention
Important (76 tasks)          # High importance
CreativeWork (54 tasks)       # Creative/design work
AdminWork (43 tasks)          # Administrative tasks
Personal (36 tasks)           # Personal life
ai-parent (22 tasks)          # AI-generated parent task
Housework (13 tasks)          # Home maintenance
Client (9 tasks)              # Client work
YardWork (8 tasks)            # Outdoor work
QuickWin (6 tasks)            # 15 min or less
```

**Label Usage:**
- Labels are many-to-many (task can have multiple labels)
- Used for context (Computer, Phone), type (DeepWork, AdminWork), location
- Complement project hierarchy with cross-cutting concerns

---

## 2. TaskMan Cache (SQLite)

### 2.1 Cache Schema

**Location:** `~/.claude/skills/taskman/data/taskman.db`

**Tables:**

```sql
-- Sync metadata
cache_metadata (
    key TEXT PRIMARY KEY,        -- 'last_sync', 'total_tasks', etc.
    value TEXT,                  -- Stored value
    updated_at TIMESTAMP
)

-- Projects snapshot
projects (
    id INTEGER PRIMARY KEY,      -- Vikunja project ID
    name TEXT NOT NULL,          -- Project title
    parent_id INTEGER,           -- Parent project (hierarchy)
    is_archived BOOLEAN
)

-- Tasks snapshot
tasks (
    id INTEGER PRIMARY KEY,      -- Vikunja task ID
    title TEXT NOT NULL,
    project_id INTEGER,          -- Foreign key to projects
    project_name TEXT,           -- Denormalized for convenience
    due_date TEXT,               -- ISO 8601 or "0001-01-01"
    priority INTEGER,            -- 0-5
    done BOOLEAN,                -- Completion status
    parent_task_id INTEGER,      -- Parent task relationship
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Task-Label relationships
task_labels (
    task_id INTEGER,             -- Foreign key to tasks
    label_name TEXT,             -- Label title (denormalized)
    PRIMARY KEY (task_id, label_name)
)
```

**Indexes for Performance:**
```sql
idx_tasks_project    -- Filter by project
idx_tasks_done       -- Filter completed/active
idx_tasks_due_date   -- Sort by due date
idx_tasks_priority   -- Sort by priority
idx_tasks_parent     -- Find subtasks
idx_task_labels_task -- Find labels for task
idx_task_labels_label -- Find tasks with label
```

---

### 2.2 Cache Statistics (Current)

**As of:** 2025-11-07 13:35 UTC

```
Total Tasks:    208
Active Tasks:   125  (60% of total)
Completed:      83   (40% of total)
Parent Tasks:   208  (no subtask relations in current data)
Subtasks:       0    (parent_task_id all NULL)

Projects:       14   (9 child projects, 5 root projects)
```

**Task Distribution by Project:**
```
Projects               33 tasks  (26%)
Inbox                  23 tasks  (18%)
Housework              23 tasks  (18%)
Business Development   18 tasks  (14%)
Operations             12 tasks  (10%)
YardWork               8 tasks   (6%)
Personal               7 tasks   (6%)
wallykroeker.com       1 task    (1%)
```

**Priority Distribution:**
```
Unset (0):   125 tasks  (100% of active)
```
⚠️ **Note:** Currently NO tasks have priorities set!

**Due Date Status:**
```
No due date: ~125 tasks  (most show "0001-01-01")
```
⚠️ **Note:** Currently NO meaningful due dates set!

---

### 2.3 Cache Refresh Strategy

**When to Refresh:**
- After creating/updating/completing tasks via MCP
- When cache age > 1 hour for critical queries
- User command: `/taskman-refresh`

**Sync Process:**
1. Create temporary database: `taskman.db.tmp`
2. Initialize schema (tables, indexes)
3. Fetch all projects from Vikunja API
4. Fetch all tasks (paginated, 50 per page)
5. Insert into temp database
6. Atomic move: `mv taskman.db.tmp taskman.db`

**Sync Script:** `~/.claude/skills/taskman/scripts/sync-task-cache.sh`

**Last Sync Duration:** 38 seconds (208 tasks, 14 projects)

---

## 3. Data Flow & Operations

### 3.1 Read Operations (Use Cache)

**When to query SQLite cache:**
- ✅ "What should I work on next?"
- ✅ "Show tasks in [project]"
- ✅ "Tasks due this week"
- ✅ "High priority tasks"
- ✅ Filtering, searching, statistics
- ✅ Any query reading > 20 tasks

**Benefits:**
- Fast (local database)
- No API rate limits
- Complex SQL queries
- Aggregations and statistics

**Example Query:**
```sql
-- ADHD-optimized next task suggestion
SELECT
    id, title, project_name, priority, due_date,
    (SELECT GROUP_CONCAT(label_name, ', ')
     FROM task_labels
     WHERE task_id = tasks.id) as labels
FROM tasks
WHERE done = false
  AND parent_task_id IS NULL
ORDER BY
  CASE WHEN due_date IS NOT NULL AND due_date < date('now', '+3 days')
       THEN 0 ELSE 1 END,  -- Urgent first
  priority DESC,            -- Then priority
  due_date ASC              -- Then due date
LIMIT 10;
```

---

### 3.2 Write Operations (Use MCP)

**When to use MCP tools:**
- ✅ Creating new tasks
- ✅ Updating task details (priority, due date, description)
- ✅ Marking tasks complete
- ✅ Creating/updating projects
- ✅ Any operation that modifies data

**MCP Tools Available:**

**vikunja_tasks:**
```
Subcommands:
- create       # Create new task
- get          # Get task details
- update       # Update task fields
- delete       # Delete task
- list         # List tasks (use cache instead!)
- relate       # Create parent/child relation
- unrelate     # Remove relation
- assign       # Assign to user
- apply-label  # Add label to task
- remove-label # Remove label
- add-reminder # Set reminder
```

**vikunja_projects:**
```
Subcommands:
- create       # Create project
- get          # Get project details
- update       # Update project
- delete       # Delete project
- list         # List projects (use cache instead!)
- get-children # Get child projects
- get-tree     # Get project hierarchy
- archive      # Archive project
- move         # Move project in hierarchy
```

**Example - Create Task:**
```javascript
mcp__vikunja__vikunja_tasks({
  subcommand: 'create',
  projectId: 9,  // YardWork
  title: '🤖 Trim front hedges',
  description: 'Use hedge trimmer, 3 feet height',
  dueDate: '2024-11-10T23:59:59Z',
  priority: 3,
  labels: [1, 2, 3]  // Label IDs
})
```

**Example - Update Task:**
```javascript
mcp__vikunja__vikunja_tasks({
  subcommand: 'update',
  id: 82,
  priority: 5,  // Set to highest
  dueDate: '2024-11-08T23:59:59Z'
})
```

---

## 4. Project & Task Separation

### 4.1 Projects vs Tasks

**Projects are:**
- ✅ Containers for tasks
- ✅ Organizational units (can be nested)
- ✅ Long-lived (months to years)
- ✅ Represent areas of responsibility or major initiatives

**Tasks are:**
- ✅ Actionable work items
- ✅ Belong to exactly ONE project
- ✅ Temporary (hours to weeks)
- ✅ Have completion states

**Key Distinction:**
```
Bad:  Task = "Bob Project"
Good: Project = "Bob" (id: 15)
      Task = "Document TaskMan data structure"

Bad:  Project = "Write documentation"
Good: Task = "Write TaskMan documentation"
      Project = "Bob" (ongoing development)
```

---

### 4.2 Project Selection Logic

**Decision Tree:**

1. **Extract context** from user input
   - Keywords (client names, areas, activities)
   - Scope (one-off vs ongoing vs major initiative)
   - Area (Personal/Work/Learning/Projects)

2. **Search existing projects**
   ```javascript
   mcp__vikunja__vikunja_projects({
     subcommand: 'list',
     search: 'keyword'
   })
   ```

3. **Decide:**
   - **Perfect match?** → Use existing project
   - **New client?** → Ask to create `Work/Clients/[ClientName]`
   - **Area match?** → Use appropriate area (Housework, YardWork, etc.)
   - **Major initiative?** → Ask to create dedicated project
   - **Ambiguous?** → Use Inbox (can move later)

**Examples:**

```
Input: "Trim front hedges this weekend"
Context: "hedges" + "yard work"
Decision: YardWork (id: 9) - area match
Result: Single task in existing project

Input: "Prepare strategy deck for TechCorp call"
Context: "TechCorp" (new client) + "strategy" (deliverable)
Decision: Create Work/Clients/TechCorp (parent: 11)
Result: New project, then create task
```

---

### 4.3 Parent Tasks vs Subtasks

**When to break down:**
- Task estimated > 60 minutes → Break into subtasks
- Complex task with multiple steps → Break down
- User explicitly requests breakdown

**Breakdown Principles:**
- 🎯 Parent task = Overall goal (conceptual)
- 🤖 Subtasks = Actionable 15-30 min steps
- Order by difficulty: Easy → Medium → Hard (ADHD momentum)
- Use `parent_task_id` to link subtasks to parent

**Example Breakdown:**
```
🎯 Clean my office (Parent, id: 82)
├── 🤖 Gather obvious trash (id: 84, parent_task_id: 82)
├── 🤖 Clear desk surface (id: 85, parent_task_id: 82)
├── 🤖 Sort papers (id: 86, parent_task_id: 82)
├── 🤖 Process papers (id: 87, parent_task_id: 82)
├── 🤖 Wipe surfaces (id: 88, parent_task_id: 82)
└── 🤖 Vacuum floor (id: 89, parent_task_id: 82)
```

**Current State:**
⚠️ Note: Current cache shows parent_task_id as NULL for all tasks. Parent/child relationships may be conceptual (via emoji naming) rather than formally linked in Vikunja.

---

## 5. ADHD-Optimized Features

### 5.1 Priority Assignment Strategy

**Vikunja Priority (INVERTED):**
```
5 = HIGHEST → Do immediately
3 = MEDIUM  → Normal tasks
1 = LOWEST  → Someday/maybe
0 = Unset   → No priority
```

**ADHD Momentum Principle:**
For task breakdown:
```
Easy subtask   → Priority 5 (Build momentum!)
Medium subtask → Priority 3 (Sustain effort)
Hard subtask   → Priority 1 (Do after momentum)
```

**Exception:** Client urgency overrides difficulty

**Urgency Detection:**
```
High Priority (5):
- Keywords: "urgent", "ASAP", "high priority", "critical"
- Context: "client deadline", "due today", "emergency"

Low Priority (1):
- Keywords: "someday", "when I get to it", "backlog"
- Context: "nice to have", "maybe", "low priority"
```

---

### 5.2 Natural Language Date Parsing

**Process:**
1. User input: "by end of weekend"
2. Parse with Claude's temporal understanding
3. Check current date/time from <env>
4. Confirm interpretation with user
5. Convert to ISO 8601 UTC
6. Pass to MCP: `dueDate: "2024-11-10T23:59:59Z"`

**Common Patterns:**
```
"tomorrow"           → Next day 23:59:59
"next Tuesday"       → Coming Tuesday 23:59:59
"in 3 days"          → Today + 3 days 23:59:59
"end of weekend"     → Sunday 23:59:59
"tomorrow at 2pm"    → Next day 14:00:00 (converted to UTC)
"every Tuesday"      → {repeatAfter: 1, repeatMode: "week"}
```

**Time Defaults:**
```
No time specified → 23:59:59 (end of day)
"morning"         → 09:00:00
"afternoon"       → 14:00:00
"evening"         → 18:00:00
```

---

### 5.3 Context-Aware Suggestions

**Factors Considered:**
1. **Due dates** - Overdue? Due today? Due soon?
2. **Priority** - Priority 5 tasks first
3. **Time of day** - Morning → DeepWork, Afternoon → QuickWins
4. **Energy level** - High focus → Hard tasks, Low → Easy
5. **Balance** - Work/life ratio across root projects

**Time of Day Profiles:**
```
Morning (8am-11am):
- DeepWork, CreativeWork
- Projects/Bob tasks
- Learning tasks

Midday (11am-2pm):
- Client work
- AdminWork

Afternoon (2pm-5pm):
- QuickWins
- Phone tasks
- Easy momentum builders

Evening (5pm+):
- Personal tasks
- Housework, YardWork
- Low cognitive load
```

---

## 6. Integration Points

### 6.1 MCP Configuration

**Location:** `~/.claude.json` (project-level MCP config)

```json
{
  "mcpServers": {
    "vikunja": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@democratize-technology/vikunja-mcp"],
      "env": {
        "VIKUNJA_URL": "https://taskman.vrexplorers.com/api/v1",
        "VIKUNJA_API_TOKEN": "tk_...",
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

**MCP Server:** `@democratize-technology/vikunja-mcp`
**Protocol:** stdio (standard input/output)

---

### 6.2 Sync Dependencies

**Required Tools:**
- `curl` - API requests
- `jq` - JSON parsing
- `sqlite3` - Database operations

**Environment Variables:**
```bash
VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"
VIKUNJA_API_TOKEN="tk_..."
```

---

## 7. Data Insights & Observations

### 7.1 Current State Analysis

**Priority Usage:**
- ⚠️ **100% of active tasks have priority = 0** (unset)
- Recommendation: Start setting priorities for better task management

**Due Date Usage:**
- ⚠️ **Nearly all tasks have no meaningful due dates**
- Recommendation: Set due dates for time-sensitive work

**Project Balance:**
```
Projects (26%)          ← Technical work
Inbox (18%)             ← Needs organization
Housework (18%)         ← Personal maintenance
Business Dev (14%)      ← Growth activities
Operations (10%)        ← Admin work
YardWork (6%)           ← Outdoor work
Personal (6%)           ← Other personal
```

**Label Usage:**
- Heavy use of AI-generated labels (ai-subtask, ai-parent)
- Context labels well-utilized (Computer, DeepWork)
- Good task categorization foundation

---

### 7.2 Improvement Opportunities

1. **Set Priorities:**
   - Add urgency levels to tasks
   - Use ADHD momentum principle for subtasks
   - Client work should default to priority 4-5

2. **Add Due Dates:**
   - Client deadlines
   - Project milestones
   - Personal commitments

3. **Organize Inbox:**
   - 23 tasks in Inbox need project assignment
   - Move to appropriate projects
   - Use project routing logic

4. **Establish Parent/Child Relations:**
   - Current breakdown uses emoji convention
   - Consider using Vikunja's parent_task_id
   - Benefits: Better progress tracking, subtask hiding

5. **Balance Work/Life:**
   - Monitor Personal vs Work task ratio
   - Suggest personal tasks when work-heavy
   - Prevent burnout through balanced task selection

---

## 8. Future Enhancements

### 8.1 Potential Features

1. **Reminder Integration:**
   - Use `add-reminder` for time-sensitive tasks
   - Morning task list notification
   - Due date approaching alerts

2. **Team Collaboration:**
   - Task assignment via `assign` subcommand
   - Shared projects for team work
   - Comments on tasks

3. **Recurring Tasks:**
   - Weekly reviews
   - Routine maintenance
   - Habit tracking

4. **Advanced Analytics:**
   - Completion velocity
   - Time estimates vs actuals
   - Project progress visualization

5. **Smart Suggestions:**
   - ML-based task priority recommendations
   - Optimal task ordering based on history
   - Automatic project routing improvement

---

## Summary

**TaskMan Architecture:**
```
Natural Language Input
    ↓
TaskMan Skill (AI Intelligence)
    ↓
┌─────────────────┬──────────────────┐
│                 │                  │
Vikunja API      SQLite Cache
(via MCP)        (Fast Queries)
│                 │
Write Ops        Read Ops
- Create         - Search
- Update         - Filter
- Complete       - Sort
- Delete         - Aggregate
```

**Key Data Entities:**
1. **Projects** - Hierarchical containers (14 total, 5 roots)
2. **Tasks** - Work items (208 total, 125 active)
3. **Labels** - Cross-cutting tags (14+ in use)
4. **Relations** - Parent/child task links (conceptual currently)

**Core Principles:**
- ✅ Every task belongs to one project
- ✅ Use cache for reading, MCP for writing
- ✅ ADHD-optimized priority ordering
- ✅ Natural language date parsing
- ✅ Work/life balance monitoring
