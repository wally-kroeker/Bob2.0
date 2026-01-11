---
name: Task
description: |
  Unified task management with Vikunja integration. Handles task creation, updates,
  ADHD-optimized suggestions, and multi-agent assignment.
  ACTIVATE when user mentions tasks, todos, projects, or asks "what should I work on".
---

# Task Management Skill

> Unified Vikunja task management with ADHD-optimized suggestions and multi-agent support

## When to Activate This Skill

**ACTIVATE IMMEDIATELY when user mentions:**

### Task Operations
- "add task", "create task", "new task", "todo"
- "what should I work on", "next task", "suggest tasks"
- "show my tasks", "list tasks", "what's due"
- "complete task", "mark done", "finish task"
- "update task", "change priority", "set due date"

### Time-Based Queries
- "I have 10 minutes", "quick task", "easy win"
- "what's due today", "overdue tasks", "urgent"
- "deep work", "focus time", "phone tasks"

### Agent Assignment
- "assign to Mario", "have Bill design", "Riker research"
- "who's working on", "agent workload"

### Project Queries
- "tasks in [project]", "YardWork tasks", "client work"
- "work/life balance", "how many tasks"

---

## CLI Tools

All tools are located at: `$PAI_DIR/skills/Task/tools/`

Run with: `bun run <tool>.ts [options]`

### task-list.ts
List and filter tasks from Vikunja.

```bash
bun run task-list.ts                    # All active tasks
bun run task-list.ts --project 9        # Tasks in YardWork project
bun run task-list.ts --label Computer   # Tasks with Computer label
bun run task-list.ts --due today        # Tasks due today
bun run task-list.ts --limit 10         # Limit results
bun run task-list.ts --search "hedge"   # Search by title
bun run task-list.ts --done             # Show completed tasks
bun run task-list.ts --details          # Show labels
bun run task-list.ts --json             # Output as JSON
```

### task-create.ts
Create new tasks.

```bash
bun run task-create.ts "Task title" --project <id>
bun run task-create.ts "Trim hedges" --project 9 --due "next saturday"
bun run task-create.ts "Call dentist" --project 4 --labels "Phone,5min" --priority 3
bun run task-create.ts "Client prep" --project 11 --priority 5 --due tomorrow
```

**Options:**
- `--project <id>` - Project ID (required)
- `--due <date>` - Due date (today, tomorrow, next week, YYYY-MM-DD)
- `--priority <n>` - Priority 1-5 (5 = highest)
- `--labels <list>` - Comma-separated label names
- `--assign <ids>` - Comma-separated user IDs

### task-update.ts
Update existing tasks.

```bash
bun run task-update.ts 123 --done           # Mark complete
bun run task-update.ts 123 --priority 5     # Set priority
bun run task-update.ts 123 --due tomorrow   # Set due date
bun run task-update.ts 123 --undone         # Mark incomplete
bun run task-update.ts 123 --clear-due      # Remove due date
```

### task-suggest.ts
Get ADHD-optimized task suggestions.

```bash
bun run task-suggest.ts                     # What should I work on?
bun run task-suggest.ts --time 15           # I have 15 minutes
bun run task-suggest.ts --context phone     # Phone tasks only
bun run task-suggest.ts --quick-wins        # Easy momentum builders
bun run task-suggest.ts --deep-work         # Focus-intensive tasks
bun run task-suggest.ts --urgent            # Overdue/due today
bun run task-suggest.ts --balance           # Work/life balance analysis
```

### task-assign.ts
Assign tasks to Bob and Friends agents.

```bash
bun run task-assign.ts 123 --agent mario    # Assign to Mario
bun run task-assign.ts 123 --agent bill --agent mario  # Multiple agents
bun run task-assign.ts 123 --unassign mario # Remove assignment
bun run task-assign.ts 123 --list           # Show current assignees
```

---

## Priority System

**Vikunja uses INVERTED priority (5 = highest):**

| Priority | Meaning | When to Use |
|----------|---------|-------------|
| 5 | HIGHEST | Urgent, do now! Client deadlines |
| 4 | High | Important, today |
| 3 | Medium | Normal tasks |
| 2 | Low | When convenient |
| 1 | Lowest | Someday/maybe |
| 0 | Unset | Default |

**Keywords that suggest priority:**
- **5 (Urgent):** "urgent", "ASAP", "critical", "client deadline", "due today"
- **3 (Normal):** Default for most tasks
- **1 (Low):** "someday", "when I get to it", "backlog"

---

## ADHD-Optimized Suggestions

### Time of Day Profiles

| Time | Best For | Label Types |
|------|----------|-------------|
| Morning (8-11am) | Deep work, creative | DeepWork, CreativeWork |
| Midday (11am-2pm) | Admin, meetings | AdminWork, Work |
| Afternoon (2-5pm) | Quick wins, calls | QuickWin, Phone, 5min, 15min |
| Evening (5pm+) | Personal, low-effort | Personal, Housework, YardWork |

### Momentum Building

For ADHD, start with easy tasks to build momentum:

1. **Start Easy** - Quick wins (5-15 min) build confidence
2. **Build Up** - Medium tasks after momentum established
3. **Hard Last** - Deep work after you're in flow

When breaking down tasks, order subtasks: Easy → Medium → Hard

### Task Suggestions Logic

When user asks "what should I work on?", consider:

1. **Overdue tasks** - Always surface first (🔴)
2. **Due today** - High visibility (🟡)
3. **High priority (4-5)** - Important regardless of due date
4. **Time of day appropriate** - Match to current energy
5. **Work/life balance** - Flag if heavily skewed

---

## Label System

### Context Labels (What area?)
- Personal (3), Work (4), Client (5), Project (6)
- Housework (7), YardWork (8), Errands (9)

### Work Type Labels (What kind?)
- QuickWin (10) - Easy, <15min, momentum
- AdminWork (11) - Routine, paperwork
- CreativeWork (12) - Design, writing
- DeepWork (13) - Focus-intensive

### Location Labels (Where?)
- Computer (14), Phone (15), Anywhere (16)

### Time Estimate Labels (How long?)
- 5min (19), 15min (20), 30min (21), 60min+ (22)

### Priority Labels
- Urgent (17), Important (18)

**Good task labeling:** 4-6 labels covering context, work type, location, and time estimate.

---

## Multi-Agent Team

Bob and Friends agents for task assignment:

| Agent | ID | Role | Assign For |
|-------|-----|------|-----------|
| **Bob** | 3 | Orchestrator | Overall coordination, multi-step projects |
| **Bill** | 4 | Architect | System design, planning, PRDs |
| **Mario** | 5 | Engineer | Implementation, coding, execution |
| **Riker** | 6 | Researcher | Investigation, discovery, research |
| **Howard** | 7 | Designer | UX, writing, content, communication |
| **Homer** | 40 | Strategist | Long-term strategy, ethics, big-picture |

**Usage patterns:**
- "Have Mario implement this" → Assign to mario (5)
- "Bill, design the architecture" → Assign to bill (4)
- "Riker, research options" → Assign to riker (6)

---

## Project Reference

Common projects (verify IDs in your Vikunja instance):

```
Root Projects:
├── Inbox (1)              # Unsorted tasks
├── Personal (4)
│   ├── Housework (8)
│   ├── YardWork (9)
│   └── Health & Fitness (10)
├── Work (5)
│   ├── Clients (11)
│   ├── Business Development (12)
│   └── Operations (13)
├── Learning (6)
│   └── Technical Skills (14)
└── Projects (7)
    ├── Bob (15)
    └── wallykroeker.com (16)
```

---

## Natural Language Dates

The tools understand natural language dates:

| Input | Interprets As |
|-------|---------------|
| "today" | Today 23:59:59 |
| "tomorrow" | Tomorrow 23:59:59 |
| "next week" | +7 days |
| "in 3 days" | +3 days |
| "next Monday" | Coming Monday |
| "next Friday" | Coming Friday |
| "2026-01-15" | Specific date |

All dates default to end of day (23:59:59 UTC).

---

## Common Workflows

### Quick Task Add
```
User: "add task trim hedges by sunday to yardwork"
Bob: 
  1. Parse: title="trim hedges", due="sunday", project=YardWork
  2. Run: bun run task-create.ts "Trim hedges" --project 9 --due sunday
  3. Confirm: "✓ Task created: Trim hedges, due Sunday"
```

### What Should I Work On?
```
User: "what should I work on?"
Bob:
  1. Run: bun run task-suggest.ts
  2. Review urgent/overdue, high priority, time-appropriate
  3. Recommend specific task with reasoning
```

### Mark Task Complete
```
User: "mark task 123 done"
Bob:
  1. Run: bun run task-update.ts 123 --done
  2. Confirm: "✓ Task #123 marked complete"
```

### Time-Constrained Query
```
User: "I have 10 minutes, what can I knock out?"
Bob:
  1. Run: bun run task-suggest.ts --time 10 --quick-wins
  2. Present 3-5 options with time estimates
  3. Recommend easiest for momentum
```

---

## Configuration

API credentials stored in: `$PAI_DIR/skills/Task/data/.env`

```bash
VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"
VIKUNJA_API_TOKEN="tk_your_token"
```

Generate token: Vikunja Settings → API Tokens → Create Token

---

## Error Handling

### 401 Unauthorized
- Token expired or invalid
- Regenerate in Vikunja Settings

### Task Not Found
- Check task ID (use actual API ID, not display #)
- Task may be deleted

### Project Not Found
- Verify project ID with `task-list.ts --json`
- Project may be archived

---

## Tips for Bob

1. **Always confirm before creating** - Show user what will be created
2. **Include due date year** - "Due Sunday, January 12, 2026"
3. **Suggest labels** - Infer from context
4. **Check for duplicates** - Search before creating
5. **Balance awareness** - Note if work/life skewed
6. **Momentum matters** - For breakdown, order easy → hard

