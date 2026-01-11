---
name: Vikunja
description: |
  Technical reference for TaskMan/Vikunja infrastructure. Provides MCP tool documentation,
  database query methods, and troubleshooting guides.
  USE WHEN taskman skill needs technical implementation details, MCP debugging,
  or database query patterns. Does NOT activate on user task queries directly.
---

# Vikunja Task Management - Technical Reference

> **⚠️ IMPORTANT**: This skill provides technical reference documentation only.
> **It does NOT activate on user task queries** - the `taskman` skill handles all user-facing task management.
> This documentation is available to Bob when the `taskman` skill is active and needs technical implementation details.

## Overview

This skill provides Bob with complete access to your Vikunja task management system (taskman.vrexplorers.com) through three complementary approaches:

1. **Vikunja MCP Tools** - For standard task operations and simple queries
2. **Direct Database Queries** - For complex filtering beyond MCP capabilities
3. **AI Task Breakdown** - Automatic ADHD-friendly subtask creation via N8N

**Key Features:**
- Real-time task context and status
- Project and label organization
- Task relationships and dependencies
- 🤖 **Automatic AI-powered task breakdown** into 10-20 minute subtasks
- Support for simple AND complex queries with no token limits

---

## 🎯 3-Tier Query Strategy

### Decision Logic: Which Method to Use?

```
User query about tasks
  ↓
Is it CRUD (create/update/delete/get single task)?
  YES → Use Tier 1: MCP Tools
  NO  → Continue
  ↓
Is it a simple search or filter (<50 tasks)?
  YES → Use Tier 1: MCP with pagination
  NO  → Continue
  ↓
Does it need parent/subtask filtering or multi-label AND?
  YES → Use Tier 2: Database Queries
  NO  → Continue
  ↓
Does it query >50 tasks or hit token limits?
  YES → Use Tier 2: Database Queries
  NO  → Use Tier 1 as fallback
```

### Tier 1: Vikunja MCP Tools (Default for Simple Operations)

**Status**: ✅ INSTALLED (user scope - global)

**When to Use:**
- ✅ Create, update, delete individual tasks
- ✅ Simple keyword searches
- ✅ Basic filtering (`done = false`, `priority >= 3`)
- ✅ Standard task operations (assign users, add comments, manage relations)
- ✅ Queries returning <50 tasks

**Configuration:**
- **Type**: HTTP MCP Server
- **URL**: `http://walub.kroeker.fun:8080/vikunja/mcp`
- **Instance**: https://taskman.vrexplorers.com (proxied through MCP server)
- **Authentication**: Bearer token in request headers
- **Config**: `~/.claude/settings.json` (mcpServers section)

**Settings Configuration:**
Add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "vikunja": {
      "type": "http",
      "url": "http://walub.kroeker.fun:8080/vikunja/mcp",
      "headers": {
        "Authorization": "Bearer sk-mcp-ea00ab7b2770f63edcc61b0d51c50f3bc88e836f3456e726"
      }
    }
  }
}
```

**Verification:**
```bash
claude mcp list        # Should show 'vikunja' as ✓ Connected
claude mcp get vikunja # Show configuration details
```

**Available MCP Tools:**
- `mcp__vikunja__vikunja_tasks` - List, create, get, update, delete tasks
- `mcp__vikunja__vikunja_projects` - Manage projects
- `mcp__vikunja__vikunja_labels` - Manage labels
- `mcp__vikunja__vikunja_teams` - Manage teams
- `mcp__vikunja__vikunja_filters` - Manage saved filters

**Example Usage:**
```javascript
// Simple keyword search (with pagination to avoid token limits)
vikunja_tasks({
  subcommand: 'list',
  search: 'goodfields',
  perPage: 50,  // CRITICAL: Prevents token limit errors
  page: 1,
  allProjects: true
})

// Basic filtering
vikunja_tasks({
  subcommand: 'list',
  filter: 'done = false && priority >= 3',
  perPage: 50
})

// Create task (triggers automatic AI breakdown if complex!)
vikunja_tasks({
  subcommand: 'create',
  projectId: 1,
  title: 'Build warm hay bale shelter for goats',
  description: 'Need to protect goats from winter weather'
})

// Update task by ID
vikunja_tasks({
  subcommand: 'update',
  id: 310,  // Use actual API ID, not display #
  done: true
})

// Create subtask relation
vikunja_tasks({
  subcommand: 'relate',
  id: 310,
  otherTaskId: 311,
  relationKind: 'subtask'
})
```

**Important Notes:**
- ⚠️ **ALWAYS use `perPage: 50`** for list operations to avoid token limit errors
- ⚠️ **Use actual API ID, not display #** (see "Critical Gotcha" section below)
- ⚠️ **Token Limit**: Responses >25,000 tokens will fail - use pagination!

**Benefits:**
- Clean MCP abstraction
- Proper tool integration
- Works for majority of queries
- No direct database access needed

**Limitations:**
- Cannot filter by task relationships (parent/subtask)
- Cannot do multi-label AND queries (Computer + DeepWork)
- Cannot handle >250 tasks in single query (pagination required)
- No custom SQL beyond basic filter syntax
- **Token limit**: Responses over 25,000 tokens will error

---

### Tier 2: Direct Database Queries (For Complex Filtering)

**Status**: ✅ INSTALLED (`~/.claude/scripts/vikunja-db-query.sh`)

**When to Use:**
- ✅ Find parent tasks (tasks with subtasks)
- ✅ Multi-label AND queries (tasks with Computer AND DeepWork)
- ✅ Custom SQL queries beyond MCP filter syntax
- ✅ Queries that would return >50 tasks (token limit workaround)
- ✅ Task hierarchy exploration

**Script Location:** `~/.claude/scripts/vikunja-db-query.sh`

**Available Commands:**

**1. Search Parent Tasks** (tasks that have subtasks)
```bash
vikunja-db-query.sh search_parent_tasks KEYWORD [active|done|all]

# Example:
vikunja-db-query.sh search_parent_tasks goodfields active
```

**Result:**
```
=== Parent Tasks Matching 'goodfields' (active) ===
350    🎯 Deploy landing page for goodfields.io               Active    5
351    🎯 Set up professional email wally@goodfields.io       Active    6
363    🎯 Update LinkedIn profile with Goodfields branding    Active    6
370    🎯 Create Goodfields social media accounts             Active    8
```

**2. Multi-Label AND Search** (tasks with BOTH labels)
```bash
vikunja-db-query.sh search_by_labels LABEL1 LABEL2 [active|done|all]

# Example:
vikunja-db-query.sh search_by_labels Computer DeepWork active
```

**Result:** Returns all tasks labeled with Computer AND DeepWork (40+ tasks in current database)

**3. Task Hierarchy** (parent + all subtasks in tree format)
```bash
vikunja-db-query.sh get_hierarchy TASK_ID

# Example:
vikunja-db-query.sh get_hierarchy 350
```

**Result:**
```
=== Task Hierarchy for Task #350 ===
350        🎯 Deploy landing page for goodfields.io    Active
  355      🤖 Update DNS settings for goodfields.io    Active
  356      🤖 Verify goodfields.io loads              Active
  ...
```

**4. Advanced Custom Queries** (raw SQL WHERE clause)
```bash
vikunja-db-query.sh advanced "SQL_WHERE_CLAUSE"

# Example:
vikunja-db-query.sh advanced "LOWER(title) LIKE '%urgent%' AND done = false"
```

**5. Database Statistics**
```bash
vikunja-db-query.sh stats
```

**Result:**
```
=== Vikunja Database Statistics ===
Total Tasks        165
Active Tasks       150
Parent Tasks       45
Total Labels       18
```

**Security:**
- Uses existing SSH keys to `taskman` host
- Read-only queries (no writes)
- Database credentials stored in script (chmod 700)
- Connection: SSH → Docker → PostgreSQL (fully internal)

**Performance:**
- ~50-100ms per query (faster than MCP)
- No token limits
- Can query all 165 tasks instantly
- Full SQL power for complex filtering

**Benefits:**
- No token limits (returns raw data)
- Full SQL capabilities
- Instant results for complex queries
- Multi-label AND, parent filtering, custom queries

**Limitations:**
- Requires SSH access to taskman host
- Direct database access (bypasses Vikunja API)
- Read-only (cannot create/update tasks)

---

### Tier 3: TypeScript Scripts (DEPRECATED - DO NOT USE)

**Location:** `~/.claude/skills/vikunja/scripts/`

**Status:** ⛔ DEPRECATED - Replaced by MCP + Database Queries

**Scripts (DO NOT USE):**
- `fetch-tasks.ts` → Use MCP `vikunja_tasks list` instead
- `show-parent-tasks.ts` → Use DB query `search_parent_tasks` instead

**Why Deprecated:**
- Redundant with MCP tools
- Less reliable than direct database access
- No longer maintained

---

## ⚠️ Critical Gotcha: API ID vs Display Identifier

### The Problem

Vikunja displays task numbers like **#172** in the UI, but the actual database ID is different (e.g., **310**).

**In API responses:**
```json
{
  "id": 310,                    // ← ACTUAL ID (use this for MCP calls)
  "identifier": "#172",         // ← DISPLAY ID (what you see in UI)
  "index": 172                  // ← Index number
}
```

### Why This Matters

**When using MCP tools:**
- ❌ `vikunja_tasks({subcommand: 'get', id: 172})` → **FAILS** ("task does not exist")
- ✅ `vikunja_tasks({subcommand: 'get', id: 310})` → **WORKS**

### Solution: Always Search First

**When user references "#172" or "task 172":**

```javascript
// Step 1: Search by title to find the task
vikunja_tasks({
  subcommand: 'list',
  search: 'Brainstorm ideas for TaskMan ADHD friendly notifications',
  allProjects: true,
  perPage: 50
})

// Step 2: Extract actual ID from results
// Response: {id: 310, identifier: '#172', title: '...'}

// Step 3: Use actual ID for operations
vikunja_tasks({
  subcommand: 'get',
  id: 310  // ← Use this, not 172!
})
```

### Best Practices

1. **Always use search first** if you only have the display number (#172)
2. **Extract and store the actual ID** from API responses
3. **Verify the identifier matches** (`#172`) to ensure correct task
4. **Document the actual ID** when referencing tasks
5. **Remember: UI ≠ API** - Display numbers are for humans, real IDs are for machines

---

## ⚡ Automatic AI Task Breakdown

**Status**: ✅ **PRODUCTION ACTIVE** (N8N: https://n8n.vrexplorers.com)

### What Happens When You Create a Task

**🚀 THIS IS AUTOMATIC!** Every time you create a task in Vikunja, the N8N workflow analyzes it and breaks it down if complex:

1. **Task Created** - You add a task to Vikunja
2. **Webhook Triggers** - N8N receives `task.created` event (< 1 second)
3. **Filtering Checks**:
   - Skip if title starts with 🤖 (AI-generated subtask)
   - Skip if title starts with 🎯 (AI-processed parent)
   - Skip if task has parent relation (manual subtask)
4. **AI Analyzes** - Claude Sonnet 4.5 analyzes complexity (~5-10 seconds)
5. **Decision**:
   - ✅ **Complex?** → Breaks into 3-10 subtasks (10-20 min each)
   - ⏭️ **Simple?** → Leaves task as-is
6. **Result**:
   - Parent task gets 🎯 emoji + AI summary
   - Subtasks created with 🤖 emoji + time estimates
   - All subtasks linked via bidirectional relations
   - Color-coded by difficulty: 🟢 easy, 🟡 medium, 🔴 hard

### Example Transformation

**Input:**
```
Title: "Build warm hay bale shelter for goats"
Description: "Need to protect goats from winter weather"
```

**Output (after ~45-60 seconds):**
```
🎯 Build warm hay bale shelter for goats (PARENT)
  └─ 🤖 Measure shelter area and count needed bales (15 min) - EASY 🟢
  └─ 🤖 Research local hay bale suppliers and prices (20 min) - EASY 🟢
  └─ 🤖 Contact suppliers and arrange purchase (15 min) - MEDIUM 🟡
  └─ 🤖 Pick up or receive hay bale delivery (30 min) - MEDIUM 🟡
  └─ 🤖 Clear and level ground for shelter location (30 min) - MEDIUM 🟡
  └─ 🤖 Stack hay bales to form three walls (45 min) - HARD 🔴
  └─ 🤖 Add weatherproof cover or roof material (30 min) - MEDIUM 🟡
```

### What Gets Broken Down?

**YES - Breaks down if:**
- Multi-step projects (build, implement, design, research, create, develop)
- Vague or ambiguous requirements
- Tasks that sound overwhelming
- Meaningful descriptions suggesting multiple actions

**NO - Skips if:**
- Simple, clear actions ("Call dentist", "Buy milk")
- Already atomic (can't be simplified)
- Tasks under ~30 minutes
- Simple errands

### Subtask Generation Rules

- **Count**: 3-10 subtasks per complex task
- **Duration**: 5-30 minutes each (prefers 10-15 min)
- **Order**: EASIEST FIRST (builds ADHD momentum)
- **Difficulty**: easy, medium, hard
- **Colors**: Green (easy), Yellow (medium), Red (hard)
- **Success Criteria**: Each subtask description includes what "done" looks like
- **Label Inheritance**: Subtasks inherit all parent labels + system label `ai-subtask`

### Workflow Architecture

**Canonical File**: `Tikunja AI Task Breakdown - EMOJI FILTER.json`

**13-Node Workflow:**
1. Webhook Trigger → Receive task.created events
2. Extract Task Data → Filter by emoji/relations
3. AI Agent (Claude 4.5) → Analyze & decide
4. Structured Parser → Validate JSON
5. IF Node → Check if breakdown needed
6. Transform → Add 🤖 emoji, format for Vikunja
7. Split in Batches → Loop through subtasks
8. Create Sub-Task → Create each subtask
9. Add Relation → Link subtask → parent
10. Preserve Subtask Labels → Maintain data through loop
11. Add Subtask Labels → Apply inherited + system labels
12. Update Parent Task → Add 🎯 emoji + summary
13. Add Parent Labels → Apply system label (ai-parent)

---

## Task Data Structure

### Core Fields

- **id**: Unique task identifier (actual API ID, NOT display #)
- **identifier**: Display identifier (e.g., "#172")
- **index**: Numeric index (e.g., 172)
- **title**: Task name
- **description**: Detailed description
- **done**: Completion status (true/false)
- **priority**: Priority level (1-5, 1 = highest)
- **due_date**: When task is due
- **project_id**: Which project it belongs to
- **labels**: Task categorization (array of label objects)
- **assignees**: Who's responsible
- **related_tasks**: Task relationships (parent-child, dependencies, etc.)
- **hex_color**: Task color in hex format (e.g., "4CAF50" for green)

### Task Relationships

Tasks include a `related_tasks` field - a map where each key is a relationship type and the value is an array of related tasks.

**Relationship Types (RelationKind):**

| Type | Description | Inverse |
|------|-------------|---------|
| `subtask` | This task is a subtask of another | `parenttask` |
| `parenttask` | This task has subtasks | `subtask` |
| `related` | General relation | `related` |
| `duplicateof` | Duplicate of another task | `duplicates` |
| `duplicates` | Has duplicates | `duplicateof` |
| `blocking` | Blocks another task | `blocked` |
| `blocked` | Blocked by another task | `blocking` |
| `precedes` | Must complete before another | `follows` |
| `follows` | Follows another task | `precedes` |
| `copiedfrom` | Copied from another task | `copiedto` |
| `copiedto` | Copied to another task | `copiedfrom` |

**Important Notes:**
- Relationships are **bidirectional** - creating a subtask relation automatically creates the inverse parenttask relation
- Query subtasks: `related_tasks.parenttask.length > 0`
- Query parent tasks: `related_tasks.subtask.length > 0`
- Emoji prefixes: 🤖 = AI-generated subtask, 🎯 = AI-processed parent

**Example Task with Relationships:**
```json
{
  "id": 100,
  "identifier": "#50",
  "title": "🎯 Complete project proposal",
  "done": false,
  "related_tasks": {
    "subtask": [
      {"id": 101, "title": "🤖 Research requirements", "done": true},
      {"id": 102, "title": "🤖 Draft outline", "done": false},
      {"id": 103, "title": "🤖 Write first draft", "done": false}
    ]
  }
}
```

### Label System

**Production Labels (taskman.vrexplorers.com):**

**System Labels** (AI-generated task tracking):
- `1` - ai-parent (Tasks processed by AI breakdown)
- `2` - ai-subtask (Subtasks created by AI)

**Context Labels** (What domain?):
- `3` - Personal
- `4` - Work
- `5` - Client
- `6` - Project
- `7` - Housework
- `8` - YardWork
- `9` - Errands

**Type Labels** (What kind of work?):
- `10` - QuickWin (Fast, easy wins)
- `11` - AdminWork (Administrative tasks)
- `12` - CreativeWork (Creative activities)
- `13` - DeepWork (Focus-intensive work)

**Location Labels** (Where can this be done?):
- `14` - Computer
- `15` - Phone
- `16` - Anywhere

**Priority Labels** (Urgency indicators):
- `17` - Urgent
- `18` - Important

---

## Common Usage Patterns

### Pattern 1: Daily Planning
```
User: "What tasks do I have today?"
Bob: [Uses MCP to fetch today's tasks]
     "You have 5 tasks due today:
     1. [High Priority] Deploy website updates
     2. [Medium] Review pull requests
     ..."
```

### Pattern 2: Find Parent Tasks
```
User: "Find all my GoodFields parent tasks"
Bob: [Uses DB query - beyond MCP capabilities]
     ~/.claude/scripts/vikunja-db-query.sh search_parent_tasks goodfields active

     Result:
     - Deploy landing page for goodfields.io (5 subtasks)
     - Set up professional email (6 subtasks)
     - Update LinkedIn profile (6 subtasks)
     - Create social media accounts (8 subtasks)
```

### Pattern 3: Multi-Label Filter
```
User: "Show me Computer tasks that are also DeepWork"
Bob: [Uses DB query - MCP cannot do multi-label AND]
     ~/.claude/scripts/vikunja-db-query.sh search_by_labels Computer DeepWork active

     Result: 40+ tasks with both labels
```

### Pattern 4: Create Complex Task (Triggers AI Breakdown)
```
User: "Create a task to build a chicken coop for 12 hens"
Bob: [Uses MCP to create task]
     vikunja_tasks({subcommand: 'create', ...})

     [N8N automatically breaks it down after 45-60 seconds]

     Result:
     🎯 Build chicken coop for 12 hens
       └─ 🤖 Research coop size requirements (10 min)
       └─ 🤖 Sketch basic design and materials list (15 min)
       └─ 🤖 ... (5 more subtasks)
```

### Pattern 5: Verify AI Workflow Results
```
User: "Did the AI break down my chicken coop task?"
Bob: [Uses MCP to search for AI-generated tasks]
     vikunja_tasks({subcommand: 'list', search: 'chicken coop', perPage: 50})

     [Checks for 🎯 emoji on parent, 🤖 on subtasks]
     [Verifies bidirectional relations]
     [Confirms label inheritance]
```

---

## Troubleshooting

### MCP Server Not Connected
```bash
# Check server status
claude mcp list

# Verify configuration
claude mcp get vikunja

# Check HTTP server is accessible
curl -H "Authorization: Bearer sk-mcp-ea00ab7b2770f63edcc61b0d51c50f3bc88e836f3456e726" \
  http://walub.kroeker.fun:8080/vikunja/mcp

# Reconfigure if needed
# Edit ~/.claude/settings.json and ensure mcpServers section matches:
# {
#   "mcpServers": {
#     "vikunja": {
#       "type": "http",
#       "url": "http://walub.kroeker.fun:8080/vikunja/mcp",
#       "headers": {
#         "Authorization": "Bearer sk-mcp-ea00ab7b2770f63edcc61b0d51c50f3bc88e836f3456e726"
#       }
#     }
#   }
# }
# Then restart Claude Code
```

### Error: "This task does not exist"
- ✓ You used display ID (#172) instead of actual API ID (310)
- ✓ Solution: Use `search` to find the task and get its real `id`

### Error: "MCP tool response exceeds maximum allowed tokens (25000)"
- ✓ You queried too many tasks without pagination
- ✓ Solution: Add `perPage: 50` to your MCP query
- ✓ Alternative: Use database query for large result sets

### Tasks Not Loading
- Verify MCP server connected: `claude mcp list`
- Check Vikunja instance accessible: https://taskman.vrexplorers.com
- Verify API token has permissions
- Check network connectivity

### Complex Query Not Working
- Check if MCP can handle it (parent filter, multi-label AND)
- If not, use database query script instead
- Verify SSH access to taskman host works

### AI Breakdown Not Triggering
- Wait 45-60 seconds after task creation
- Verify task is not already a subtask
- Check task doesn't start with 🤖 or 🎯
- Ensure N8N workflow is active

---

## Integration with PAI

- **TodoWrite**: Can sync PAI session todos with Vikunja tasks
- **Publishing Loop**: Can reference task completion in build logs
- **Project Work**: Provides task context during development sessions
- **N8N Workflows**: AI-powered automation for ADHD-friendly task management

---

## Security Notes

- MCP bearer token stored in `~/.claude/settings.json` (mcpServers.vikunja.headers)
- Database password stored in query script (secured by file permissions)
- Never commit credentials to repositories
- MCP token has full permissions for task/project management
- HTTP MCP server at walub.kroeker.fun:8080 proxies to HTTPS Vikunja instance
- Database access is read-only (no writes via script)
- SSH keys provide secure access to taskman host

---

## Resources

- **Vikunja Production**: https://taskman.vrexplorers.com
- **N8N Production**: https://n8n.vrexplorers.com
- **Vikunja API Docs**: https://try.vikunja.io/api/v1/docs
- **Vikunja MCP GitHub**: https://github.com/democratize-technology/vikunja-mcp
- **Database Query Script**: `~/.claude/scripts/vikunja-db-query.sh`
- **Project Documentation**: `/home/walub/projects/vikunja/CLAUDE.md`
