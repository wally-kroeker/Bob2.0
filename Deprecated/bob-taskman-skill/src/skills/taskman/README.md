# TaskMan - Intelligent Task Orchestration System

**Version:** 1.0
**Last Updated:** November 7, 2025
**Documentation Status:** ✅ Complete

---

## Overview

TaskMan is Bob's intelligent task orchestration layer that transforms natural language task requests into structured, actionable tasks in Vikunja. It combines AI intelligence with ADHD-optimized workflows to provide seamless task management through conversation.

**Key Features:**
- 🗣️ **Natural language task creation** - Just talk to Bob
- 📅 **Smart date parsing** - "by end of weekend" → ISO 8601 UTC
- 🎯 **Intelligent project routing** - Auto-detects correct project
- 🧠 **ADHD-optimized breakdown** - Easy → Hard → Easy for momentum
- ⚡ **Fast cache-based queries** - SQLite for instant responses
- 🔄 **MCP integration** - Direct connection to Vikunja API

---

## Architecture

```
User (Natural Language)
    ↓
Claude Code (Bob + TaskMan Skill)
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

**Design Principle:** Write through MCP (authoritative), read from cache (fast).

---

## Current System State

**As of:** November 7, 2025 13:35 UTC

### Statistics
- **Total Tasks:** 208 (125 active, 83 completed)
- **Projects:** 14 (5 root, 9 child projects)
- **Labels:** 14+ in active use
- **Cache Status:** ✅ Fresh (38 second sync time)

### Project Distribution
```
Projects               33 tasks  (26%)
Inbox                  23 tasks  (18%)  ⚠️ Needs organization
Housework              23 tasks  (18%)
Business Development   18 tasks  (14%)
Operations             12 tasks  (10%)
YardWork               8 tasks   (6%)
Personal               7 tasks   (6%)
wallykroeker.com       1 task    (1%)
```

### Areas for Improvement
- ⚠️ **100% of tasks have no priority set** (all priority = 0)
- ⚠️ **No meaningful due dates** on most tasks
- ⚠️ **23 tasks in Inbox** need proper project assignment

---

## Documentation Index

### 📖 Core Documentation

#### [SKILL.md](./SKILL.md)
**The complete skill prompt** - This is what Claude reads when TaskMan skill activates.

Contains:
- When to activate TaskMan
- Cache usage protocols
- Natural language date parsing
- Priority assignment (ADHD principles)
- Project routing logic
- Task breakdown strategies
- MCP tool usage
- Learning system

**Use when:** You need to understand how Bob thinks about tasks.

---

#### [DATA_STRUCTURE.md](./DATA_STRUCTURE.md)
**Complete technical documentation** of the Vikunja data model and TaskMan cache.

Contains:
- Vikunja data model (Projects, Tasks, Labels)
- TaskMan SQLite cache schema
- Cache refresh strategies
- Data flow (Read vs Write operations)
- Project & task separation principles
- ADHD-optimized features
- MCP integration details
- Current state analysis
- Future enhancements

**Use when:** You need to understand the technical architecture or debug data issues.

---

#### [DIAGRAMS.md](./DIAGRAMS.md)
**Visual system diagrams** showing data flow and relationships.

Contains:
- Overall architecture diagram
- Entity relationship diagrams
- Project hierarchy visualization
- Task lifecycle flowchart
- Task breakdown flow (ADHD pattern)
- Cache sync process
- Read vs Write patterns
- Priority decision tree
- Project selection decision tree
- Complete data flow summary

**Use when:** You want visual understanding of how the system works.

---

#### [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Fast lookups and common patterns** - your go-to for day-to-day usage.

Contains:
- Common SQL queries
- Project hierarchy IDs
- Priority scale reference
- MCP tool usage examples
- Date parsing patterns
- ADHD breakdown template
- Project routing keywords
- Common labels list
- Time-of-day suggestions
- Troubleshooting guide

**Use when:** You need quick answers or copy-pasteable commands.

---

### 📁 Data Files

#### `data/taskman.db`
SQLite cache database containing:
- `cache_metadata` - Sync timestamps, statistics
- `projects` - Project snapshot with hierarchy
- `tasks` - Task snapshot with all fields
- `task_labels` - Many-to-many task-label relationships

**Refresh:** `/taskman-refresh` command

---

#### `data/project-hierarchy.md`
Current project structure synced from Vikunja.

```
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

---

### 🔧 Scripts

#### `scripts/sync-task-cache.sh`
Bash script that syncs Vikunja data to local SQLite cache.

**Process:**
1. Validates dependencies (curl, jq, sqlite3)
2. Checks VIKUNJA_API_TOKEN
3. Creates temp database with schema
4. Fetches all projects (1 page)
5. Fetches all tasks (paginated, 50/page)
6. Updates metadata
7. Atomic swap: `mv taskman.db.tmp taskman.db`

**Runtime:** ~38 seconds for 208 tasks, 14 projects

**Usage:**
```bash
VIKUNJA_API_TOKEN="tk_..." \
VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1" \
~/.claude/skills/taskman/scripts/sync-task-cache.sh
```

---

## Quick Start

### Basic Usage

**Ask Bob:**
```
"What should I work on next?"
"Add task: trim hedges by end of weekend"
"Show tasks in Projects"
"Break down: build chicken coop"
"What's my workload this week?"
```

**Bob will:**
1. Parse your natural language
2. Route to correct project
3. Assign ADHD-optimized priority
4. Break down complex tasks
5. Suggest contextual next steps

---

### Common Workflows

#### Creating a Simple Task
```
You: "Add task: call dentist tomorrow at 2pm"

Bob:
1. Parse: "call dentist", tomorrow 2pm
2. Route: Personal (health-related)
3. Priority: 3 (no urgency keywords)
4. Create via MCP
5. Confirm: "Created in Personal project, due tomorrow at 2:00 PM"
```

#### Breaking Down Complex Task
```
You: "Break down: build raised garden bed"

Bob:
1. Analyze: ~4-6 hours, construction project
2. Create parent: 🎯 Build raised garden bed
3. Generate subtasks (ADHD-ordered):
   🤖 Research designs (easy, Priority 5)
   🤖 Measure space (easy, Priority 5)
   🤖 Purchase materials (medium, Priority 3)
   🤖 Cut lumber (hard, Priority 1)
   🤖 Assemble frame (hard, Priority 1)
   🤖 Add soil & plants (easy, Priority 5)
4. Explain reasoning
5. Create in Vikunja with relations
```

#### Querying Tasks
```
You: "What should I work on next?"

Bob:
1. Check cache freshness
2. Query for next tasks (ADHD-optimized SQL)
3. Consider:
   - Due dates (urgent first)
   - Priority levels
   - Time of day (morning = DeepWork)
   - Balance (work vs personal)
4. Suggest top 3-5 tasks with reasoning
```

---

## Key Concepts

### Read vs Write Operations

**Read Operations (Use Cache):**
- ✅ "What should I work on?"
- ✅ "Show tasks in [project]"
- ✅ "Tasks due this week"
- ✅ Filtering, searching, statistics
- **Benefit:** Instant response, no API limits

**Write Operations (Use MCP):**
- ✅ Create new tasks
- ✅ Update task details
- ✅ Mark complete
- ✅ Create/update projects
- **Benefit:** Direct to source of truth

**Rule:** After writing via MCP, remind user to `/taskman-refresh` when convenient.

---

### ADHD Momentum Principle

**For task breakdown:**
```
Easy subtask   → Priority 5  (Build momentum!)
Medium subtask → Priority 3  (Sustain effort)
Hard subtask   → Priority 1  (Use built momentum)
Easy subtask   → Priority 5  (End on positive note)
```

**Exception:** Client urgency overrides difficulty ordering.

---

### Project Routing Intelligence

**Decision process:**
1. Extract keywords from input
2. Search existing projects
3. Decide based on match quality:
   - **Exact match?** Use it
   - **Area keyword?** Use area project (Housework, YardWork)
   - **New client?** Create under Work/Clients/[Name]
   - **Major initiative?** Create under Projects/[Name]
   - **Ambiguous?** Use Inbox (organize later)

---

### Natural Language Date Parsing

**Bob natively understands:**
- "tomorrow" → Next day 23:59:59
- "next Tuesday" → Coming Tuesday 23:59:59
- "end of weekend" → Sunday 23:59:59
- "tomorrow at 2pm" → Next day 14:00:00 (→ UTC)
- "every Tuesday" → Recurring task

**Process:**
1. Parse with Claude's temporal understanding
2. Check current date/time from `<env>`
3. Confirm interpretation
4. Convert to ISO 8601 UTC
5. Pass to MCP

---

## Integration

### MCP Configuration

**File:** `~/.claude.json`

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

**MCP Package:** `@democratize-technology/vikunja-mcp`
**Protocol:** stdio (standard input/output)

---

### Vikunja Instance

**URL:** https://taskman.vrexplorers.com
**API:** https://taskman.vrexplorers.com/api/v1
**Authentication:** Bearer token (API key)

---

### Cache Dependencies

**Required:**
- `curl` - HTTP requests to API
- `jq` - JSON parsing
- `sqlite3` - Database operations

**Environment Variables:**
```bash
VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"
VIKUNJA_API_TOKEN="tk_..."
```

---

## Troubleshooting

### Cache is stale or empty

**Check age:**
```bash
sqlite3 ~/.claude/skills/taskman/data/taskman.db \
  "SELECT value FROM cache_metadata WHERE key='last_sync'"
```

**Refresh:**
```
/taskman-refresh
```

---

### MCP connection issues

**Check MCP config:**
```bash
cat ~/.claude.json | jq '.mcpServers.vikunja'
```

**Test API access:**
```bash
curl -H "Authorization: Bearer $VIKUNJA_API_TOKEN" \
  https://taskman.vrexplorers.com/api/v1/projects
```

---

### Sync script fails

**Check dependencies:**
```bash
command -v curl jq sqlite3
```

**Install if missing:**
```bash
sudo apt install curl jq sqlite3
```

---

## Best Practices

### 1. Set Priorities
Don't leave tasks at priority 0. Use the scale:
- 5 = Urgent (client deadlines, emergencies)
- 4 = Important (should do soon)
- 3 = Normal (regular tasks)
- 2 = Low (when convenient)
- 1 = Someday (backlog)

### 2. Add Due Dates
Tasks with due dates get prioritized better. Use natural language:
- "by Friday"
- "end of month"
- "tomorrow at 2pm"

### 3. Organize Inbox Regularly
Inbox is for ambiguous tasks. Move them to proper projects weekly.

### 4. Use Labels
Labels provide cross-cutting context:
- Computer, Phone (location)
- DeepWork, QuickWin (effort)
- Client, Important (context)

### 5. Break Down Big Tasks
Tasks > 60 min should be broken into 15-30 min subtasks for better momentum.

### 6. Refresh Cache After Writes
After creating/updating via MCP, run `/taskman-refresh` when convenient.

### 7. Monitor Balance
Check work vs personal ratio regularly. Bob can suggest tasks to maintain balance.

---

## Future Enhancements

### Planned Features
1. **Reminder Integration** - Morning task notifications
2. **Team Collaboration** - Task assignment, shared projects
3. **Recurring Tasks** - Weekly reviews, routine maintenance
4. **Advanced Analytics** - Completion velocity, time tracking
5. **Smart Suggestions** - ML-based priority recommendations

### Improvement Opportunities
1. Set priorities on existing tasks
2. Add due dates to time-sensitive work
3. Organize 23 tasks in Inbox
4. Establish formal parent/child relations (use parent_task_id)
5. Balance work/life task distribution

---

## Contributing

This is part of Bob (Personal AI Infrastructure). Updates to TaskMan should:

1. Update SKILL.md with new patterns/logic
2. Update DATA_STRUCTURE.md if data model changes
3. Add diagrams to DIAGRAMS.md for new flows
4. Update QUICK_REFERENCE.md with new commands
5. Document learned patterns in `data/*-patterns.md`

---

## Resources

### Documentation
- [Vikunja API Docs](https://vikunja.io/docs/api-documentation/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Personal AI Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure)

### Related Projects
- **Bob** - Personal AI Infrastructure (PAI)
- **Vikunja** - Open-source task management
- **Claude Code** - Anthropic's coding agent

---

## License

Part of Personal AI Infrastructure (PAI).
MIT License.

---

## Changelog

### v1.0.0 - November 7, 2025
- ✅ Complete documentation suite created
- ✅ Data structure documented (Vikunja + Cache)
- ✅ Visual diagrams for all major flows
- ✅ Quick reference guide
- ✅ Current system state analyzed
- ✅ Best practices documented
- ✅ 208 tasks, 14 projects in production

---

## Contact

**System:** TaskMan via Bob (PAI)
**Owner:** Wally
**Vikunja Instance:** https://taskman.vrexplorers.com
**Skill Location:** `~/.claude/skills/taskman/`

---

**Made with ❤️ by Bob, powered by Claude Code & Vikunja**
