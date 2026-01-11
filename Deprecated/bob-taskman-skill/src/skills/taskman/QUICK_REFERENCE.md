# TaskMan Quick Reference Guide

## 🚀 Common Commands

### Cache Management
```bash
# Refresh task cache from Vikunja
/taskman-refresh

# Check cache age
sqlite3 ~/.claude/skills/taskman/data/taskman.db \
  "SELECT value FROM cache_metadata WHERE key='last_sync'"
```

### Task Queries (SQL)

**Next tasks to work on:**
```sql
sqlite3 ~/.claude/skills/taskman/data/taskman.db -header -column "
SELECT id, title, project_name, priority, due_date
FROM tasks
WHERE done = false
  AND parent_task_id IS NULL
ORDER BY
  CASE WHEN due_date IS NOT NULL AND due_date < date('now', '+3 days')
       THEN 0 ELSE 1 END,
  priority DESC,
  due_date ASC
LIMIT 10;"
```

**Tasks by project:**
```sql
sqlite3 ~/.claude/skills/taskman/data/taskman.db -header -column "
SELECT id, title, priority, due_date
FROM tasks
WHERE project_name = 'Projects'
  AND done = false
ORDER BY priority DESC, due_date ASC;"
```

**High priority tasks:**
```sql
sqlite3 ~/.claude/skills/taskman/data/taskman.db -header -column "
SELECT id, title, project_name, due_date
FROM tasks
WHERE done = false
  AND priority >= 4
ORDER BY priority DESC, due_date ASC;"
```

**Tasks due soon:**
```sql
sqlite3 ~/.claude/skills/taskman/data/taskman.db -header -column "
SELECT id, title, project_name, due_date
FROM tasks
WHERE done = false
  AND due_date BETWEEN date('now') AND date('now', '+7 days')
ORDER BY due_date ASC;"
```

**Project task distribution:**
```sql
sqlite3 ~/.claude/skills/taskman/data/taskman.db -header -column "
SELECT
    project_name,
    COUNT(*) as active_tasks,
    COUNT(CASE WHEN priority >= 4 THEN 1 END) as high_priority
FROM tasks
WHERE done = false
GROUP BY project_name
ORDER BY active_tasks DESC;"
```

---

## 📊 Data Structure Cheat Sheet

### Projects
```
Current Hierarchy:
├── Inbox (1)
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

### Priority Scale (INVERTED!)
```
5 = HIGHEST  (Urgent!)
4 = High
3 = Medium
2 = Low
1 = Lowest   (Someday)
0 = Unset
```

### Task Emojis
```
🎯 = Parent task (conceptual goal)
🤖 = Subtask (AI-generated breakdown)
```

---

## 🔧 MCP Tool Usage

### Create Task
```javascript
mcp__vikunja__vikunja_tasks({
  subcommand: 'create',
  projectId: 9,                    // Required
  title: 'Task title',             // Required
  description: 'Details',          // Optional
  dueDate: '2024-12-31T23:59:59Z', // Optional (ISO 8601 UTC)
  priority: 3                      // Optional (0-5)
})
```

### Update Task
```javascript
mcp__vikunja__vikunja_tasks({
  subcommand: 'update',
  id: 82,                          // Required
  priority: 5,                     // Update priority
  dueDate: '2024-11-08T23:59:59Z', // Update due date
  done: true                       // Mark complete
})
```

### Create Project
```javascript
mcp__vikunja__vikunja_projects({
  subcommand: 'create',
  title: 'New Project',            // Required
  parentProjectId: 7,              // Optional (for nesting)
  description: 'Project details'   // Optional
})
```

### Relate Tasks (Parent/Child)
```javascript
// Create parent-child relationship
mcp__vikunja__vikunja_tasks({
  subcommand: 'relate',
  id: 100,              // Child task ID
  otherTaskId: 82,      // Parent task ID
  relationKind: 'subtask'
})
```

---

## ⏰ Date Parsing Reference

### Natural Language → ISO 8601 UTC

```
Input                   Output (Example: Nov 7, 2024)
─────────────────────   ──────────────────────────────
"tomorrow"           →  2024-11-08T23:59:59Z
"next Tuesday"       →  2024-11-12T23:59:59Z
"in 3 days"          →  2024-11-10T23:59:59Z
"end of weekend"     →  2024-11-10T23:59:59Z (Sunday)
"tomorrow at 2pm"    →  2024-11-08T22:00:00Z (PST→UTC)
"next Friday 9am"    →  2024-11-15T17:00:00Z (PST→UTC)
```

### Time Defaults
```
No time specified  →  23:59:59 (end of day)
"morning"          →  09:00:00
"afternoon"        →  14:00:00
"evening"          →  18:00:00
```

### Recurring Tasks
```
"every day"        →  {repeatAfter: 1, repeatMode: "day"}
"every Tuesday"    →  {repeatAfter: 1, repeatMode: "week"}
"every 2 weeks"    →  {repeatAfter: 2, repeatMode: "week"}
"monthly"          →  {repeatAfter: 1, repeatMode: "month"}
```

---

## 🎯 ADHD Task Breakdown

### When to Break Down
- Task > 60 minutes → Break into subtasks
- Multiple distinct steps → Break down
- User requests breakdown → Break down

### Breakdown Pattern
```
🎯 Parent Task (Overall goal)
├── 🤖 Easy subtask   → Priority 5 (Build momentum!)
├── 🤖 Medium subtask → Priority 3 (Sustain effort)
├── 🤖 Hard subtask   → Priority 1 (Use momentum)
└── 🤖 Easy subtask   → Priority 5 (End positive!)
```

### Priority Override
- Client deadline → All Priority 5 (urgency overrides ADHD pattern)
- Emergency → Priority 5
- Personal health/safety → Priority 4-5

---

## 📍 Project Routing Logic

### Decision Tree
```
1. Extract keywords from input
2. Search existing projects
3. Decide:
   ├─ Exact match?      → Use it
   ├─ Area keyword?     → Use area (Housework, YardWork, etc.)
   ├─ New client?       → Create under Work/Clients/[Name]
   ├─ Major initiative? → Create under Projects/[Name]
   └─ Ambiguous?        → Use Inbox (organize later)
```

### Keyword Patterns
```
"yard|hedge|outdoor"     → YardWork (9)
"house|clean|organize"   → Housework (8)
"client|strategy|prep"   → Work/Clients/[Name]
"bob|pai|skill"          → Projects/Bob (15)
"website|blog|content"   → wallykroeker.com (16)
```

---

## 🏷️ Common Labels

```
Context:
- Computer (137 tasks)    # Requires computer
- Phone                   # Phone-only capable
- Errands                 # Out-of-house

Work Type:
- DeepWork (92 tasks)     # Focused attention required
- CreativeWork (54 tasks) # Design/creative
- AdminWork (43 tasks)    # Administrative
- Physical                # Physical labor

Energy Level:
- QuickWin (6 tasks)      # ≤15 min
- Important (76 tasks)    # High importance
- Client (9 tasks)        # Client work

Area:
- Work (115 tasks)
- Personal (36 tasks)
- Housework (13 tasks)
- YardWork (8 tasks)
```

---

## 🕐 Time of Day Suggestions

```
Morning (8am-11am):
  Best for: DeepWork, CreativeWork, Learning
  Projects: Bob, Technical Skills
  Energy: High

Midday (11am-2pm):
  Best for: Client work, AdminWork
  Projects: Work/Clients, Operations
  Energy: Medium-High

Afternoon (2pm-5pm):
  Best for: QuickWins, Phone tasks
  Projects: Business Development
  Energy: Medium

Evening (5pm+):
  Best for: Personal, Housework, YardWork
  Projects: Personal area
  Energy: Low-Medium
```

---

## 🔍 Troubleshooting

### Cache is stale
```bash
# Check age
sqlite3 ~/.claude/skills/taskman/data/taskman.db \
  "SELECT value FROM cache_metadata WHERE key='last_sync'"

# Refresh
/taskman-refresh
```

### MCP connection issues
```bash
# Check MCP config
cat ~/.claude.json | jq '.mcpServers.vikunja'

# Verify API token is set
echo $VIKUNJA_API_TOKEN
```

### Sync script fails
```bash
# Check dependencies
command -v curl jq sqlite3

# Check API access
curl -H "Authorization: Bearer $VIKUNJA_API_TOKEN" \
  https://taskman.vrexplorers.com/api/v1/projects
```

---

## 📚 Documentation Files

- **SKILL.md** - Complete skill prompt & instructions
- **DATA_STRUCTURE.md** - Full data model documentation
- **DIAGRAMS.md** - Visual system diagrams
- **QUICK_REFERENCE.md** - This file (quick lookups)

---

## 💡 Quick Tips

1. **Cache First:** Always check cache age before queries
2. **Write via MCP:** Create/update via MCP, then refresh cache
3. **Set Priorities:** Tasks without priorities are easy to lose
4. **Add Due Dates:** Helps with urgency & planning
5. **Organize Inbox:** Move tasks to proper projects regularly
6. **ADHD Pattern:** Easy → Hard → Easy for momentum
7. **Balance Check:** Monitor Work vs Personal task ratio
8. **Label Everything:** Makes filtering & context switching easier

---

## 🎓 Learning More

Ask Claude (Bob):
- "What should I work on next?"
- "Show tasks in [project name]"
- "Break down this complex task"
- "Add task: [description] by [date]"
- "What's my workload this week?"
- "Show high priority tasks"
- "Tasks due soon"

Bob understands natural language and will:
✓ Parse dates naturally
✓ Route to correct projects
✓ Assign ADHD-optimized priorities
✓ Break down complex tasks
✓ Suggest next tasks contextually
