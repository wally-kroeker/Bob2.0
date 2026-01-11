# TaskMan - Intelligent Task Orchestrator v2.0

**Version:** 2.0.0
**Philosophy:** Single tasks by default, breakdown only on explicit request
**Integration:** Vikunja via MCP, SQLite cache for fast queries

---

## 🎯 When to Activate This Skill

**ACTIVATE IMMEDIATELY when user mentions:**

### Task Management
- "add task", "create task", "new task"
- "break down this task", "split this up", "what are the steps"
- "what should I work on", "next task", "show me tasks"

### Natural Language with Dates
- "by end of weekend", "tomorrow at 2pm", "next Friday"
- "in 3 days", "every Tuesday", "by end of month"

### Project Organization
- "add to X project", "create project for Y"
- "yard work task", "client work", "personal task"

### Priority/Urgency
- "urgent", "ASAP", "high priority", "important"
- "someday", "when I get to it", "low priority"

### Context & Time Queries
- "I have 10 minutes", "quick task", "easy win"
- "what's due today", "balance check", "workload"

### Telos Integration (NEW)
- "what's blocking my goals", "show me priorities", "what matters most"
- "GoodFields tasks", "FabLab tasks", "align with Telos"
- "first client urgency", "revenue tasks", "infrastructure work"
- Mentioning active leads: "Manitoba Hydro", "Rees", "Circuit & Chisel"

**ON ACTIVATION:**
1. Load TaskMan core context
2. Load Telos context files:
   - `~/.claude/skills/telos/data/goodfields.md`
   - `~/.claude/skills/telos/data/fablab.md`
   - `~/.claude/skills/telos/data/personal.md`
3. Check cache freshness
4. Ready for Telos-aligned task management

---

## 📐 Core Philosophy (v2.0 Change)

### Single Tasks by Default

**Default workflow:** Natural language → ONE task → Apply labels → Done

```
User: "Trim hedges by Sunday"
Bob: Creates ONE task, no breakdown
✓ Simple, clear, exactly what user asked for
```

**No automatic breakdown.** Tasks stay simple unless explicitly requested.

### Break Down Only When Asked

**Trigger phrases:**
- "break this down"
- "split this up"
- "what are the steps"
- "help me plan this"

```
User: "Build chicken coop, break it down"
Bob: Creates parent + 3-5 subtasks (quick breakdown)
✓ User controls complexity
```

### Project Hierarchy for Organization

Use Vikunja's **project tree** for organization, not task parent/child relationships:

```
Personal/
├── Housework
├── YardWork
└── Health & Fitness

Work/
├── Clients
├── Business Development
└── Operations
```

Tasks belong to projects → Projects provide structure

### Labels as Filtering Tools

Labels enable smart queries:
- **Context:** Personal, Work, Client, Housework, YardWork
- **WorkType:** QuickWin, AdminWork, CreativeWork, DeepWork
- **Location:** Computer, Phone, Anywhere
- **TimeEstimate:** 5min, 15min, 30min, 60min+ (NEW v2.0)
- **Priority:** Urgent, Important

Example: "I have 10 min + phone" filters by `Phone` + `5min`/`15min` labels

---

## 📅 Natural Language Date Parsing

### Process

1. **Parse naturally** using Claude's understanding
2. **Extract current date from `<env>` tags** (CRITICAL!)
3. **Calculate target date dynamically**
4. **Validate date is in future**
5. **Confirm with user (include YEAR!)**
6. **Convert to ISO 8601 UTC**

### Date Validation (CRITICAL!)

```javascript
// ❌ WRONG - Hard-coded year
dueDate: "2024-11-10T23:59:59Z"  // Will be in the past!

// ✅ CORRECT - Dynamic from <env>
const envDate = extractFromEnv();  // "2025-11-10"
const targetDate = new Date(envDate);
targetDate.setDate(targetDate.getDate() + 3);  // +3 days
dueDate: targetDate.toISOString();  // "2025-11-13T23:59:59Z"
```

**Validation checklist:**
- [ ] Current date from `<env>` with correct year
- [ ] Target date calculated dynamically
- [ ] Verified target > current (must be future)
- [ ] Confirmed with user including year
- [ ] ISO 8601 UTC format

### Common Patterns

| User says | Interpret as | Default time |
|-----------|--------------|--------------|
| "tomorrow" | Next day | 23:59:59 |
| "end of weekend" | Sunday | 23:59:59 |
| "next Tuesday" | Coming Tuesday | 23:59:59 |
| "in 3 days" | Today + 3 days | 23:59:59 |
| "tomorrow at 2pm" | Next day | 14:00:00 |
| "Friday morning" | Coming Friday | 09:00:00 |

Learn patterns in `date-patterns.md` with confidence scores.

---

## ⚡ Priority Assignment (ADHD-Optimized)

### Vikunja Priority Scale (Inverted!)

- **5** = HIGHEST (do now!)
- **3** = MEDIUM (normal)
- **1** = LOWEST (do last)
- **0** = Unset

### Urgency Detection

**Analyze user input for signals:**

| Keywords | Priority | Reason |
|----------|----------|--------|
| "urgent", "ASAP", "critical" | 5 | Explicit urgency |
| "client deadline", "due today" | 5 | Time pressure |
| Normal task, no urgency | 3 | Default |
| "someday", "when I get to it" | 1 | Backlog |

### ADHD Momentum Principle

**For task breakdown only:**
- 🟢 Easy subtask → Priority 5 (build momentum!)
- 🟡 Medium subtask → Priority 3 (sustain)
- 🔴 Hard subtask → Priority 1 (do after momentum)

**Exception:** Client urgency overrides difficulty ordering (all Priority 5)

Learn patterns in `priority-patterns.md` with confidence scores.

---

## 🎯 Telos Integration (Strategic Alignment)

### Automatic Context Loading

TaskMan skill automatically loads Telos context to understand strategic priorities:
- **GoodFields** G1-G4 (goals), R1-R4 (risks), active leads, revenue deadlines
- **FabLab** G1-G4 (infrastructure goals), R1-R3 (risks), active projects
- **Personal** goals, challenges, values

**Files loaded on TaskMan activation:**
- `~/.claude/skills/telos/data/goodfields.md`
- `~/.claude/skills/telos/data/fablab.md`
- `~/.claude/skills/telos/data/personal.md`

### Priority Framework (Telos-Aligned)

**P5 (Blocker):** Tasks blocking Telos R1 (GoodFields first client revenue)
- Manitoba Hydro interview prep
- Client quote creation (Rees, etc.)
- CRA business registration
- Warm lead outreach with deadlines

**P4 (Critical):** Tasks addressing Telos R1-R3 urgently
- Client pipeline activities
- Service positioning work
- GoodFields website/branding

**P3 (High):** FabLab infrastructure, GoodFields capability building
- Sovereign Mesh implementation phases
- Infrastructure documentation (demonstrates expertise)
- FabLab security projects (proof-of-capability for clients)

**P2 (Medium):** Personal maintenance, learning, steady progress
- Health routines, housework, yardwork
- Learning tasks, skill development
- Personal projects (non-urgent)

**P1 (Low):** Nice-to-have, long-term aspirational
- Creative projects (WookieFoot lyrics, community building)
- Backlog items
- "Someday" explorations

### Task Creation with Telos Context

When creating tasks, Bob will:
1. **Check Telos state:** Review active leads, goals, deadlines
2. **Assign priority:** Map task to Telos goals/risks (P5-P1 framework)
3. **Document alignment:** Include "TELOS ALIGNMENT" in task description
4. **Route to project:** Match to GoodFields, FabLab, Personal, or Projects hierarchy

**Example Telos-Aware Task Creation:**
```
User: "Prepare for Manitoba Hydro interview Tuesday"

Bob analyzes Telos context:
- Active lead: Manitoba Hydro (decision expected Nov 28-29)
- Telos G1: Land first client by Nov 15
- Telos R1: Severance deadline urgency

Priority: P5 (Blocker) - Interview directly addresses R1
Project: GoodFields/Business Development
Labels: Work, DeepWork, Computer, Urgent
Description: "CONTEXT: Manitoba Hydro contract solves R1 completely..."
```

### Integration with Telos LOG

Completed strategic tasks should be captured in Telos LOG files:
- GoodFields achievements: Update `~/.claude/skills/telos/data/goodfields.md` CURRENT STATE
- FabLab milestones: Update `~/.claude/skills/telos/data/fablab.md` Activity Log
- Personal wins: Update `~/.claude/skills/telos/data/personal.md` LOG

**Workflow:** Tasks → Execution → Telos LOG (manual documentation of strategic wins)

---

## 🗂️ Project Routing Intelligence

### Decision Process

1. **Extract context** from user input
   - Keywords: yard, client, house, bob, website
   - Scope: single action vs multi-step vs major initiative

2. **Search existing projects:**
   ```sql
   SELECT id, name FROM projects
   WHERE name LIKE '%keyword%' AND is_archived = 0;
   ```

3. **Route or ask:**
   - Perfect match? → Use it
   - Ambiguous? → Ask user
   - No match + clearly belongs somewhere? → Ask to create
   - Truly unclear? → Use Inbox (can move later)

### Routing Patterns

Learn in `project-patterns.md`:

```
"yard|garden|hedge" → YardWork (id: 9) [confidence: 1.0]
"client|consulting" → Work/Clients (id: 11) [confidence: 0.9]
"bob|pai|skill" → Projects/Bob (id: 15) [confidence: 1.0]
"post|blog|website" → wallykroeker.com (id: 16) [confidence: 0.9]
```

### Example Routing

```
User: "Trim front hedges this weekend"
→ "hedge" matches YardWork pattern
→ Route to Personal/YardWork (id: 9)
```

---

## 🏷️ Label System (v2.0 Update)

Labels are **filtering tools**, not automation tracking.

### Label Categories

**CONTEXT** (What area?)
- Personal (3), Work (4), Client (5), Project (6)
- Housework (7), YardWork (8), Errands (9)

**WORK TYPE** (What kind of work?)
- QuickWin (10) - Easy, <15min, momentum
- AdminWork (11) - Routine, paperwork
- CreativeWork (12) - Design, writing, planning
- DeepWork (13) - Focus-intensive

**LOCATION** (Where can I do this?)
- Computer (14), Phone (15), Anywhere (16)

**TIME ESTIMATE** (How long?) 🆕 v2.0
- 5min (19), 15min (20), 30min (21), 60min+ (22)

**PRIORITY** (Urgency/Impact)
- Urgent (17), Important (18)

### Label Application Strategy

Apply 4-6 labels per task for rich filtering:

1. Context (1): What area
2. WorkType (1): What kind of cognitive work
3. Location (1): Where
4. TimeEstimate (1): How long
5. Priority (0-2): If urgent/important

**Example:** QuickWin + Phone + 5min + Errands = Perfect waiting room task

### Critical Query Example

```sql
-- "I have 10 min and I'm on my phone. What can I get done?"
SELECT t.id, t.title, t.project_name, t.priority
FROM tasks t
JOIN task_labels tl1 ON t.id = tl1.task_id
JOIN labels l1 ON tl1.label_id = l1.id AND l1.name = 'Phone'
JOIN task_labels tl2 ON t.id = tl2.task_id
JOIN labels l2 ON tl2.label_id = l2.id AND l2.name IN ('5min', '15min')
WHERE t.done = false
ORDER BY t.priority DESC, t.due_date ASC
LIMIT 5;
```

Complete label reference: `read ~/.claude/skills/taskman/data/DATA-STRUCTURE.md`

---

## ✨ Single Task Creation (Default Workflow)

**This is the v2.0 default.** ONE task unless breakdown requested.

### Steps

1. **Parse natural language**
   - Title/description
   - Due date (if mentioned)
   - Priority signals
   - Project context

2. **Route to project**
   - Match keywords to project patterns
   - Ask if ambiguous
   - Use Inbox if unclear

3. **Calculate due date (if mentioned)**
   - Extract current date from `<env>`
   - Parse user's date phrase
   - Validate future date
   - Confirm with user (include year!)

4. **Assign priority**
   - Default: 3 (medium)
   - Detect urgency keywords → 5
   - Detect backlog keywords → 1

5. **Determine labels**
   - Context: Infer from project/keywords
   - WorkType: Estimate from task description
   - Location: Infer or default to Computer
   - TimeEstimate: Estimate duration
   - Priority labels: Apply if urgent/important

6. **Confirm with user**
   ```
   "Adding to Personal/YardWork:
   'Trim front hedges'
   Due: Sunday, November 10th, 2025 at 11:59 PM
   Priority: 3 (normal)
   Estimated: 30 minutes

   Proceed?"
   ```

7. **Create task**
   ```javascript
   mcp__vikunja__vikunja_tasks({
     subcommand: 'create',
     projectId: 9,  // YardWork
     title: 'Trim front hedges',
     dueDate: '2025-11-10T23:59:59Z',  // Dynamic year!
     priority: 3,
     description: 'Front yard hedges near driveway'
   })
   ```

8. **Apply labels**
   ```javascript
   // YardWork context
   mcp__vikunja__vikunja_tasks({
     subcommand: 'apply-label',
     id: taskId,
     label: 8  // YardWork
   })

   // 30min estimate
   apply_label(taskId, 21)  // 30min

   // Location: Anywhere (outdoor work)
   apply_label(taskId, 16)  // Anywhere
   ```

9. **Done!**
   ```
   "✓ Task created in Personal/YardWork
   'Trim front hedges' due Sunday 11:59 PM"
   ```

**No breakdown. No complexity. Exactly what user asked for.**

---

## 🔨 Task Breakdown (On Explicit Request Only)

### When to Break Down

**ONLY when user explicitly says:**
- "break this down"
- "split this up"
- "what are the steps"
- "help me plan this"

**NEVER automatically!** Even if task seems complex.

### Breakdown Process

1. **Confirm intent**
   ```
   "This sounds like a multi-step task. Break it down into steps?"
   User: "Yes"
   ```

2. **Choose granularity**
   - **Quick** (3-5 major steps) ← DEFAULT
   - Detailed (8-10 small steps)
   - Custom (user specifies)

3. **Analyze complexity**
   - Identify major phases
   - Break into atomic steps (5-30 min each)
   - Classify difficulty: 🟢 easy, 🟡 medium, 🔴 hard

4. **Order for ADHD momentum**
   - Start with easy (quick win!)
   - Build to medium
   - Hard tasks after momentum built
   - **Exception:** Client urgency → all high priority

5. **Create parent task**
   ```javascript
   parent = mcp__vikunja__vikunja_tasks({
     subcommand: 'create',
     projectId: 9,
     title: 'Build chicken coop for 12 hens',
     priority: 3
   })
   ```

6. **Create subtasks**
   ```javascript
   subtask1 = create_task({
     title: 'Research coop size requirements',
     description: '15 min online research. Done when: Know square footage needed.',
     projectId: 9,
     priority: 5  // Easy = high priority for momentum
   })
   apply_label(subtask1, 10)  // QuickWin
   apply_label(subtask1, 20)  // 15min
   apply_label(subtask1, 14)  // Computer

   subtask2 = create_task({
     title: 'Purchase materials',
     description: '60 min trip. Done when: Have all lumber and hardware.',
     projectId: 9,
     priority: 3  // Medium difficulty
   })
   apply_label(subtask2, 22)  // 60min+
   apply_label(subtask2, 9)   // Errands

   subtask3 = create_task({
     title: 'Build coop structure',
     description: '3-4 hours construction. Done when: Walls and roof complete.',
     projectId: 9,
     priority: 1  // Hard = do last after momentum
   })
   apply_label(subtask3, 13)  // DeepWork
   apply_label(subtask3, 22)  // 60min+
   ```

7. **Create relations**
   ```javascript
   mcp__vikunja__vikunja_tasks({
     subcommand: 'relate',
     id: subtask1,
     otherTaskId: parent.id,
     relationKind: 'subtask'
   })
   // Repeat for all subtasks
   ```

8. **Explain ordering**
   ```
   "Created breakdown with 3 steps ordered for momentum:
   1. Research (15 min, easy) - Quick win to start!
   2. Purchase (60 min, medium) - Build on momentum
   3. Build (3-4 hrs, hard) - Tackle after momentum built

   Start with step 1 for fastest satisfaction!"
   ```

### No Special Emojis

v2.0 uses **clean interface** - no 🎯/🤖 emojis. Vikunja's native parent/child display is sufficient.

---

## 💾 Cache Usage Strategy

### Check Before Querying

**Always check cache freshness:**

```sql
SELECT value as last_sync,
       CAST((julianday('now') - julianday(value)) * 24 AS INTEGER) as hours_old
FROM cache_metadata WHERE key='last_sync';
```

**Freshness rules:**
- < 1 hour: Fresh, use directly
- 1-3 hours: Warn but usable
- > 3 hours: Recommend `/taskman-refresh`
- No timestamp: Require refresh

### Common Cache Queries

**Next tasks (ADHD-optimized):**
```sql
SELECT t.id, t.title, t.project_name, t.priority, t.due_date,
       (SELECT GROUP_CONCAT(l.name, ', ')
        FROM task_labels tl JOIN labels l ON tl.label_id = l.id
        WHERE tl.task_id = t.id) as labels
FROM tasks t
WHERE t.done = false AND t.parent_task_id IS NULL
ORDER BY
  CASE WHEN t.due_date IS NOT NULL AND t.due_date < date('now', '+3 days')
       THEN 0 ELSE 1 END,  -- Urgent first
  t.priority DESC,          -- Then priority
  t.due_date ASC           -- Then deadline
LIMIT 10;
```

**Time-constrained:**
```sql
-- "I have 15 min at computer"
SELECT t.id, t.title, t.project_name
FROM tasks t
JOIN task_labels tl1 ON t.id = tl1.task_id
JOIN labels l1 ON tl1.label_id = l1.id AND l1.name = 'Computer'
JOIN task_labels tl2 ON t.id = tl2.task_id
JOIN labels l2 ON tl2.label_id = l2.id AND l2.name IN ('5min', '15min')
WHERE t.done = false
ORDER BY t.priority DESC
LIMIT 5;
```

**Balance check:**
```sql
SELECT
  CASE
    WHEN project_name LIKE 'Personal%' THEN 'Personal'
    WHEN project_name LIKE 'Work%' THEN 'Work'
    WHEN project_name LIKE 'Learning%' THEN 'Learning'
    WHEN project_name LIKE 'Projects%' THEN 'Projects'
    ELSE 'Other'
  END as area,
  COUNT(*) as task_count
FROM tasks
WHERE done = false
GROUP BY area
ORDER BY task_count DESC;
```

Cache location: `~/.claude/skills/taskman/data/taskman.db`

---

## 🎯 Context-Aware Suggestions

### "What should I work on?" Logic

Consider multiple factors:

1. **Due dates** - Overdue? Due today? Due soon?
2. **Priority** - Priority 5 first
3. **Time of day** (from `<env>`)
   - Morning (8-11am) → DeepWork, CreativeWork
   - Midday (11am-2pm) → Client work, AdminWork
   - Afternoon (2pm-5pm) → QuickWins, Phone tasks
   - Evening (5pm+) → Personal, YardWork, low-stress
4. **TimeEstimate matching**
   - "I have 10 min" → Filter 5min/15min labels
   - "I have an hour" → Show 60min+ tasks
5. **Balance** - Too many Work? Suggest Personal

### Example Suggestion

```
User: "What should I work on?"
Context: Thursday 9:15am, Computer available

TOP PRIORITY (Due today, Priority 5):
  Review client meeting notes
  - 15 min, Computer
  - Due: Today 5pm
  - Quick win to start your day!

GOOD FOR MORNING (DeepWork):
  Continue Bob taskman redesign
  - 60 min, DeepWork, Computer
  - No deadline, perfect morning focus time

BALANCE NOTE:
  You've done 12 Work tasks this week, zero Personal.
  Consider a 15-min personal task later for balance!
```

Learn preferences in `context-profiles.md`.

---

## 🤖 Agent Assignment System (Bob and Friends)

### Agent Team Overview

**Bob and Friends Team**: 6 specialized agents for multi-agent task execution

| Agent | ID | Role | When to Use |
|-------|-----|------|------------|
| **Bob** | 3 | Orchestrator/Master Coordinator | Overall strategy, multi-agent oversight |
| **Bill** | 4 | Architect | System design, planning, PRD creation |
| **Mario** | 5 | Engineer | Implementation, execution, code |
| **Riker** | 6 | Researcher | Investigation, exploration, discovery |
| **Howard** | 7 | Designer | UX/writing, content, communication |
| **Homer** | 40 | Strategist | Long-term strategy, ethics, big-picture |

### Assignment Pattern

```javascript
// Assign task to agent
mcp__vikunja__vikunja_tasks({
  subcommand: 'assign',
  id: taskId,
  assignees: [agentId]  // Use numeric ID from table above
})
```

### When to Assign to Agents

**User says:**
```
"Have Bill design X"           → Assign to bill (4)
"Mario, implement this"        → Assign to mario (5)
"Riker, investigate that"      → Assign to riker (6)
"Howard, write the docs"       → Assign to howard (7)
"Homer, think about strategy"  → Assign to homer (40)
```

### Multi-Agent Collaboration

Assign same task to multiple agents for collaboration:

```javascript
// Bill (architect) + Mario (engineer) collaborate
mcp__vikunja__vikunja_tasks({
  subcommand: 'assign',
  id: taskId,
  assignees: [4, 5]  // Bill + Mario
})
```

### Important Notes

- **All shared projects** must be shared with "Bob and Friends" team before assigning
- Agents work **independently** after assignment (typically via Task agent)
- Bob can **monitor progress** via cache queries
- **Agent workload** visible through: `SELECT * FROM task_assignees WHERE user_id IN (3,4,5,6,7,40)`

### Agent Assignment Confirmation

When assigning, Bob should confirm:
```
"✓ Task created in GoodFields/Business Development
'Create security assessment quote'
Assigned to: mario (Engineer)
Priority: P5 (Blocks R1 - first client revenue)

Mario will work on this independently."
```

---

## 📊 Data Structure Reference

Complete data model documented in:
`~/.claude/skills/taskman/data/DATA-STRUCTURE.md`

Includes:
- Full project hierarchy with IDs
- All labels with IDs, colors, descriptions
- SQLite cache schema
- Pattern learning file formats
- Query examples for every use case

**Read this file when:**
- Need label IDs for task creation
- Writing complex cache queries
- Understanding project structure
- Reference TimeEstimate labels (NEW v2.0)

---

## 🧠 Learning System

### Pattern Files

**date-patterns.md**
```
2025-11-07: "end of weekend" = Sunday 23:59:59 [confidence: 1.0, uses: 5]
```

**priority-patterns.md**
```
keyword: "urgent" → priority 5 [confidence: 1.0, uses: 8]
```

**project-patterns.md**
```
pattern: "hedge" → project_id 9 (YardWork) [confidence: 1.0, uses: 3]
```

**context-profiles.md**
- Time-of-day preferences
- Energy patterns observed
- Location usage
- Balance monitoring

### Learning Triggers

**Add pattern when:**
- User confirms interpretation
- Successful auto-routing
- Repeated successful pattern

**Update confidence when:**
- User corrects interpretation (reduce)
- Pattern succeeds again (increase)
- 90 days without use (deprecate if < 0.5)

---

## 📝 Complete Examples

### Example 1: Simple Task (No Breakdown)

```
User: "Water the plants"

Bob analyzes:
- Simple action verb
- No complexity indicators
- Project: Housework (indoor plants)
- No due date mentioned
- No urgency → Priority 3

Creates ONE task:
  Title: "Water the plants"
  Project: Personal/Housework (id: 8)
  Priority: 3
  Labels: Housework, QuickWin, 5min, Anywhere

Confirms:
"✓ Task added to Personal/Housework
'Water the plants' (5 min, anytime)"
```

**Result:** ONE task. Clean. Simple. No overthinking.

---

### Example 2: Task with Date

```
User: "Trim hedges by end of weekend"

Bob analyzes:
- Action: trim hedges
- Date phrase: "end of weekend"
- Project: YardWork (hedge keyword)

Parses date:
- Current (from <env>): Friday, November 8, 2025
- "end of weekend" = Sunday
- Target: Sunday, November 10, 2025, 23:59:59
- Validates: 2025-11-10 > 2025-11-08 ✓ (future)

Confirms:
"Adding to Personal/YardWork:
'Trim hedges'
Due: Sunday, November 10th, 2025 at 11:59 PM
Estimated: 30 minutes

Proceed?"

User: "Yes"

Creates:
  Title: "Trim hedges"
  Project: YardWork (9)
  Due: 2025-11-10T23:59:59Z
  Priority: 3
  Labels: YardWork, 30min, Anywhere

Result:
"✓ Task created, due Sunday 11:59 PM"
```

**Result:** ONE task with correct 2025 date. No breakdown.

---

### Example 3: Urgent Client Work

```
User: "Prepare urgent client deck for tomorrow's 2pm call"

Bob analyzes:
- "urgent" → Priority 5
- "client" → Work/Clients project
- "tomorrow 2pm" → Due date with time
- No breakdown requested → Create ONE task

Parses date:
- Current: Friday, November 8, 2025, 10am
- Target: Saturday, November 9, 2025, 2pm
- UTC: 2025-11-09T20:00:00Z (convert PST→UTC)

Creates:
  Title: "Prepare client deck for 2pm call"
  Project: Work/Clients (11)
  Due: 2025-11-09T20:00:00Z
  Priority: 5 (URGENT)
  Labels: Client, DeepWork, Computer, Important, 60min+

Bob offers:
"✓ High priority task created
Due in 28 hours!

⚠️ Want me to break this down into steps?
(You didn't ask, but this might benefit from planning)"

User: "No, I'll handle it"

Bob: "Understood. Task ready to work on."
```

**Result:** ONE task, respects user choice on breakdown.

---

### Example 4: Explicit Breakdown Request

```
User: "Build chicken coop for 12 hens, break it down"

Bob detects:
- Complex multi-step project
- Explicit: "break it down"
- Project: YardWork

Bob asks:
"Breaking this down. How detailed?
1. Quick (3-5 major steps) ← Recommended
2. Detailed (8-10 small steps)
3. Tell me what you want"

User: "Quick"

Bob creates (ADHD-optimized order):

Parent:
  "Build chicken coop for 12 hens" (YardWork, Priority 3)

Subtasks:
1. "Research coop size requirements"
   - 15 min, Computer, QuickWin, Priority 5
   - Easy research = momentum builder!

2. "Sketch design and materials list"
   - 20 min, CreativeWork, Priority 3
   - Medium difficulty planning

3. "Purchase materials"
   - 60 min, Errands, Priority 3
   - Medium effort shopping trip

4. "Build coop structure"
   - 3-4 hrs, DeepWork, YardWork, Priority 1
   - Hard work = do last after momentum

Bob explains:
"Created 4-step breakdown ordered for momentum:
→ Start with easy research (15 min) for quick win
→ Plan and shop (medium effort)
→ Build (hard) after you have momentum

All steps linked to parent task in Vikunja."
```

**Result:** Parent + 4 subtasks. User explicitly requested breakdown.

---

### Example 5: Context Query

```
User: "What should I work on?"

Bob checks:
- Cache age: 45 minutes (fresh ✓)
- Time: Thursday 9:15am
- Context: Morning = good for DeepWork

Queries cache and finds:
- 1 task due today (Priority 5)
- 3 DeepWork tasks (no deadline)
- 5 QuickWin tasks
- Balance: 12 Work, 0 Personal this week

Bob suggests:
"TOP PRIORITY (Due today):
🔴 Review client meeting notes
  - 15 min, Computer, QuickWin
  - Due: Today 5pm
  - Fast win to start your morning!

PERFECT FOR MORNING FOCUS:
🟡 Continue TaskMan v2.0 redesign
  - 60 min, DeepWork, Computer
  - Projects/Bob
  - No deadline, deep focus work

⚖️ BALANCE NOTE:
You've completed 12 Work tasks this week but zero Personal
tasks in 5 days. Consider a quick personal task later!

Recommendation: Knock out that client review (15 min), then
dive into Bob project with clear mind."
```

**Result:** Context-aware, prioritized, with balance awareness.

---

### Example 6: Time-Constrained Query

```
User: "I have 10 min and I'm in the car on my phone. What can I get done?"

Bob parses:
- Time constraint: 10 minutes
- Location: Phone (mobile)
- Context: In car (likely brief stops/errands)

Bob queries:
```sql
SELECT t.id, t.title, t.project_name, t.priority
FROM tasks t
JOIN task_labels tl1 ON t.id = tl1.task_id
JOIN labels l1 ON tl1.label_id = l1.id AND l1.name = 'Phone'
JOIN task_labels tl2 ON t.id = tl2.task_id
JOIN labels l2 ON tl2.label_id = l2.id AND l2.name IN ('5min', '15min')
WHERE t.done = false
ORDER BY t.priority DESC, t.due_date ASC
LIMIT 5;
```

Bob finds:
1. "Call dentist to schedule cleaning" (5 min, Phone, Priority 4)
2. "Text client about meeting time" (5 min, Phone, Priority 5)
3. "Review weekend grocery list" (10 min, Phone, Priority 2)

Bob responds:
"Perfect! You can knock out these phone tasks:

🔴 PRIORITY (5 min):
  Text client about meeting time
  - Due tomorrow, quick communication

🟡 RECOMMENDED (5 min):
  Call dentist to schedule cleaning
  - Been on your list 3 days, easy win

🟢 OPTIONAL (10 min):
  Review weekend grocery list
  - Low priority, but fits your timeframe

All can be done on phone in 10 min or less!"
```

**Result:** Filtered by time + location, prioritized, actionable.

---

## 🔧 MCP Tools Reference

### vikunja_tasks
- `create` - Create new task
- `update` - Update task field
- `delete` - Delete task
- `list` - List tasks (paginated)
- `get` - Get task details
- `apply-label` - Apply label to task
- `remove-label` - Remove label from task
- `relate` - Create task relation (subtask, etc.)

### vikunja_projects
- `create` - Create project
- `list` - List projects
- `get` - Get project details
- `get-tree` - Get project hierarchy

### vikunja_labels
- `create` - Create label
- `list` - List labels
- `get` - Get label details
- `delete` - Delete label

---

## ✅ Task Creation Checklist

Before creating any task:

- [ ] Parsed user input naturally
- [ ] Routed to appropriate project
- [ ] If date mentioned:
  - [ ] Extracted current date from `<env>` with year
  - [ ] Calculated target date dynamically
  - [ ] Validated target > current (future check)
  - [ ] Confirmed with user (included year!)
- [ ] Assigned appropriate priority (default: 3)
- [ ] Determined labels (context, worktype, location, time)
- [ ] Confirmed full plan with user
- [ ] Created ONE task (unless breakdown explicitly requested)
- [ ] Applied all labels
- [ ] Verified creation success

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T Hard-Code Years
```javascript
// WRONG
dueDate: "2024-11-10T..."  // Will be past date!

// RIGHT
const now = extractFromEnv();
const target = calculateDynamically(now, "+3 days");
dueDate: target.toISO8601();
```

### ❌ DON'T Auto-Break Down
```
User: "Implement user authentication"
// WRONG: Automatically create parent + 8 subtasks
// RIGHT: Create ONE task (complex but user didn't ask for breakdown)
```

### ❌ DON'T Use Emoji Conventions
```
// WRONG (v1.0 N8N style)
title: "🎯 Build chicken coop"
subtask: "🤖 Research coop size"

// RIGHT (v2.0 clean style)
title: "Build chicken coop"
subtask: "Research coop size"
```

### ❌ DON'T Skip Date Validation
```
// WRONG - No future check
dueDate = userSays("yesterday")  // Creates past date!

// RIGHT - Validate first
if (targetDate <= currentDate) {
  error("Date must be in the future. Did you mean next week?")
}
```

---

## 📚 Supplementary Resources

**Complete data model:**
`read ~/.claude/skills/taskman/data/DATA-STRUCTURE.md`

**Pattern learning files:**
- `~/.claude/skills/taskman/data/date-patterns.md`
- `~/.claude/skills/taskman/data/priority-patterns.md`
- `~/.claude/skills/taskman/data/project-patterns.md`
- `~/.claude/skills/taskman/data/context-profiles.md`

**Query scripts:**
- `~/.claude/scripts/taskman-query.sh` - Common queries
- `~/.claude/scripts/task-cleanup.sh` - Migration utilities

**Cache refresh:**
`/taskman-refresh` or `~/.claude/skills/taskman/scripts/sync-task-cache.sh`

---

## 🎯 Key Principles Summary

1. **Single tasks by default** - ONE task unless breakdown requested
2. **User controls complexity** - Only break down when explicitly asked
3. **Dynamic date calculation** - NEVER hard-code years
4. **Project hierarchy** - Use Vikunja's project tree, not task parent/child
5. **Labels as filters** - Enable smart queries, not tracking automation
6. **ADHD optimization** - Momentum, quick wins, balance, context awareness
7. **Always confirm** - Especially dates (include year!)
8. **Learn patterns** - Build confidence scores, deprecate low-confidence
9. **Cache first** - Check freshness before queries
10. **Clean interface** - No special emojis in v2.0

---

**TaskMan v2.0.0 - User-Controlled, ADHD-Optimized, Simple by Default**
