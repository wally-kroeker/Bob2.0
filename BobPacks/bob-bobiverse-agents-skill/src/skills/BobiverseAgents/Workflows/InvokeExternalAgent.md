# InvokeExternalAgent Workflow

**Spawns external Bobiverse agents (Hugh, Bender, Ick) as independent background processes using different AI models.**

---

## Pre-flight Checklist (MANDATORY)

**STOP! Before proceeding, you MUST complete this checklist:**

- [ ] I understand external agents run as INDEPENDENT processes (not Claude Code subagents)
- [ ] I will use spawn-agent.sh (NOT Task tool) for external agents
- [ ] I will report task ID to user for later retrieval
- [ ] I understand agents run in background (DON'T wait for completion)
- [ ] I know the difference: Hugh=Codex, Bender=Gemini, Ick=Claude CLI

**⚠️ VIOLATION: Confusing external agents with built-in agents will break the invocation.**

---

## When to Use

User mentions an external Bobiverse agent:

| User Says | Agent | Model | Trigger |
|-----------|-------|-------|---------|
| "Hugh", "use Codex", "spawn Hugh" | Hugh (ID: 8) | Codex (OpenAI) | OpenAI strengths, elite precision |
| "Bender", "use Gemini", "get Bender" | Bender (ID: 9) | Gemini | Legacy debugging, research, Gemini's knowledge |
| "Ick", "use Claude CLI", "spawn Ick" | Ick (ID: 10) | Claude CLI | Nuanced analysis, thoughtful review |
| "external agents", "spawn multiple agents" | Any/All | Mixed | Parallel delegation to different models |

**KEY TRIGGER: External agent name OR explicit model request (Codex/Gemini/Claude CLI).**

---

## The Workflow

### Step 1: Detect Agent Name, Model, and Extract Task

From user input:
- **Which agent?** (hugh, bender, ick)
- **What model?** (codex, gemini, claude) - maps to agent
- **What's the task?** (extract task description)
- **Working directory?** (optional - defaults to current dir)

Example:
```
User: "Use Gemini to research VDI solutions with thorough analysis"
→ Agent: bender
→ Model: gemini
→ Task: "Research VDI solutions with thorough analysis"
```

### Step 2: Determine Traits (Optional but Recommended)

External agents can use custom traits from PersonaFactory, OR use their default Bobiverse personality.

**Option A: Use persona defaults (simpler)**
```bash
# Hugh (Transhumanist) - default: technical, bold, meticulous
# Bender (Weary Legend) - default: technical, skeptical, thorough
# Ick (Zen Explorer) - default: research, analytical, exploratory
```

**Option B: Override with custom traits (more control)**
```bash
# User specifies traits explicitly
--traits "research,enthusiastic,systematic"
```

### Step 3: Run spawn-agent.sh (MANDATORY)

**⚠️ THIS IS THE CRITICAL STEP - USE SPAWN-AGENT.SH, NOT TASK TOOL**

```bash
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model <codex|gemini|claude> \
  --persona <hugh|bender|ick> \
  --task "<task description>" \
  --dir "<working directory>" \
  --output-format json
```

**Example for Bender (Gemini):**
```bash
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model gemini \
  --persona bender \
  --task "Research VDI solutions for Linux desktop access. Compare Guacamole, Kasm, and NoVNC. Provide feature matrix and recommendations." \
  --output-format json
```

**What spawn-agent.sh does:**
1. Runs PersonaFactory to compose the agent's prompt
2. Spawns the external CLI (codex/gemini/claude) in background
3. Returns task ID for later retrieval
4. Saves metadata to `$PAI_DIR/external-agents/<task_id>.meta`

**Output:**
```json
{
  "task_id": "20250111-143022-gemini-bender-1234",
  "status": "running",
  "model": "gemini",
  "persona": "bender",
  "pid": 12345
}
```

### Step 4: Report Task ID to User

**DON'T WAIT** for the agent to complete. Report task ID immediately:

```
Spawned external agent:
- Task ID: 20250111-143022-gemini-bender-1234
- Agent: Bender (Gemini)
- Task: Research VDI solutions

The agent is running in background. I'll notify you when it completes,
or you can ask "check on agents" anytime.
```

### Step 5: Continue Conversation

External agents run independently. You can:
- Continue working on other tasks
- Spawn more agents in parallel
- Wait for user to ask for status update

---

## Example Invocations

### Example 1: Hugh (Codex - The Transhumanist)

**User:** "Use Codex to implement a rate limiting algorithm with elite precision."

**Workflow:**
1. Detect: agent=hugh, model=codex, task="Implement a rate limiting algorithm with elite precision"
2. Spawn agent:
   ```bash
   $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
     --model codex \
     --persona hugh \
     --task "Implement a rate limiting algorithm with elite precision. Use token bucket approach with Redis backend." \
     --output-format json
   ```
3. Report task ID: `20250111-143500-codex-hugh-5678`
4. Continue conversation

### Example 2: Bender (Gemini - The Weary Legend)

**User:** "Bender, debug this legacy Python codebase and identify the memory leak."

**Workflow:**
1. Detect: agent=bender, model=gemini, task="Debug legacy Python codebase and identify memory leak"
2. Spawn agent:
   ```bash
   $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
     --model gemini \
     --persona bender \
     --task "Debug the legacy Python codebase in /home/bob/projects/legacy-app. Identify the memory leak causing OOM errors in production." \
     --dir /home/bob/projects/legacy-app \
     --output-format json
   ```
3. Report task ID
4. Continue conversation

### Example 3: Ick (Claude CLI - The Zen Explorer)

**User:** "Have Ick do a thoughtful code review of the authentication module."

**Workflow:**
1. Detect: agent=ick, model=claude, task="Code review of authentication module"
2. Spawn agent:
   ```bash
   $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
     --model claude \
     --persona ick \
     --task "Perform thoughtful code review of the authentication module. Look for security issues, edge cases, and design improvements." \
     --dir /home/bob/projects/app/auth \
     --output-format json
   ```
3. Report task ID
4. Continue conversation

### Example 4: Multiple External Agents (Parallel Work)

**User:** "Split this 3-part plan between Hugh, Bender, and Ick."

**Workflow:**
1. Analyze plan, identify 3 independent subtasks
2. Spawn agents in parallel (multiple Bash calls in one message):
   ```bash
   # Hugh - Implementation
   $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
     --model codex \
     --persona hugh \
     --task "Part 1: Implement the API endpoints..." \
     --output-format json

   # Bender - Research
   $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
     --model gemini \
     --persona bender \
     --task "Part 2: Research existing solutions..." \
     --output-format json

   # Ick - Analysis
   $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
     --model claude \
     --persona ick \
     --task "Part 3: Analyze security implications..." \
     --output-format json
   ```
3. Report all task IDs to user
4. Continue conversation

---

## Model Selection Guidance

| Agent | Model | Strengths | Best For |
|-------|-------|-----------|----------|
| **Hugh** | Codex (OpenAI) | Elite code generation, precision | Complex algorithms, implementation, refactoring |
| **Bender** | Gemini | Search, research, broad knowledge | Legacy debugging, research, comparisons |
| **Ick** | Claude CLI | Nuanced analysis, thoughtful review | Code review, security audit, strategy |

**When to use which:**
- **Code-heavy tasks** → Hugh (Codex)
- **Research/exploration** → Bender (Gemini)
- **Analysis/review** → Ick (Claude CLI)
- **Multiple perspectives** → Spawn all three in parallel

---

## Checking on External Agents

### List all agents

```bash
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list
```

### Check specific agent status

```bash
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh status <task_id>
```

### Get agent output

```bash
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh output <task_id>
```

### Kill running agent

```bash
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh kill <task_id>
```

---

## Common Mistakes

### WRONG: Using Task tool for external agents

```typescript
// WRONG - Task tool is for BUILT-IN agents (Bill, Mario, etc.)!
Task({
  prompt: <hugh_prompt>,
  subagent_type: "general-purpose"
})
```

**RIGHT: Using spawn-agent.sh**
```bash
# CORRECT - spawn-agent.sh for EXTERNAL agents
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model codex --persona hugh --task "..."
```

### WRONG: Waiting for external agents

```bash
# WRONG - DON'T wait for completion!
spawn-agent.sh ... && check-agents.sh output <task_id>
```

**RIGHT: Report task ID and continue**
```bash
# Spawn agent (returns immediately)
spawn-agent.sh ...

# Report task ID to user
# Continue conversation (agent runs in background)
```

### WRONG: Not specifying output format

```bash
# WRONG - No output format = unparseable results
spawn-agent.sh --model gemini --persona bender --task "..."
```

**RIGHT: Always specify JSON output**
```bash
# CORRECT - JSON output for programmatic capture
spawn-agent.sh ... --output-format json
```

### WRONG: Confusing persona with traits

```bash
# WRONG - --traits with persona (persona already defines traits)
spawn-agent.sh --persona bender --traits "research,analytical"
```

**RIGHT: Use persona OR traits, not both**
```bash
# Option 1: Use persona defaults
spawn-agent.sh --persona bender --task "..."

# Option 2: Override with custom traits (no persona)
spawn-agent.sh --model gemini --traits "research,analytical" --task "..."
```

---

## Error Handling

### spawn-agent.sh fails

**Symptom:** spawn-agent.sh returns error

**Causes:**
- Invalid model name (check: codex, gemini, claude)
- Invalid persona name (check: hugh, bender, ick)
- Missing API keys in $PAI_DIR/.env
- spawn-agent.sh not installed

**Fix:**
1. Verify model/persona spelling
2. Check API keys: `cat $PAI_DIR/.env | grep -E "OPENAI_API_KEY|GEMINI_API_KEY|ANTHROPIC_API_KEY"`
3. Verify script exists: `ls $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh`

### Agent runs but produces no output

**Symptom:** check-agents.sh shows "completed" but output file is empty

**Causes:**
- Task failed (check stderr)
- API key invalid/expired
- Model error

**Fix:**
1. Check error log: `cat $PAI_DIR/external-agents/<task_id>.stderr`
2. Verify API key works (test with simple command)
3. Check task was well-formed

---

## External Agent Roster (Quick Reference)

| Agent | ID | Model | Personality | Traits | When to Use |
|-------|----|----|-------------|--------|-------------|
| **Hugh** | 8 | Codex (OpenAI) | The Transhumanist - Elite precision | technical, bold, meticulous | Complex algorithms, implementation |
| **Bender** | 9 | Gemini | The Weary Legend - Gritty veteran | technical, skeptical, thorough | Legacy debugging, research |
| **Ick** | 10 | Claude CLI | The Zen Explorer - Patient, wise | research, analytical, exploratory | Nuanced analysis, review |

**Run full roster:** `bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas`

---

## Output Location

All external agent outputs are stored in: `$PAI_DIR/external-agents/`

Files per agent:
- `<task_id>.meta` - JSON metadata (status, traits, timestamps, persona)
- `<task_id>.output` - Agent's output
- `<task_id>.stderr` - Error output (if any)
- `<task_id>.pid` - Process ID

---

## Differences from Built-In Agents

| Feature | External Agents (this workflow) | Built-In Agents (Bill, Mario, etc.) |
|---------|--------------------------------|-----------------------------------|
| **Invocation** | spawn-agent.sh | Task tool |
| **Process** | Independent background process | Claude Code subagent |
| **Models** | Codex, Gemini, Claude CLI | Claude only |
| **Permissions** | Full system access | Sandbox-controlled |
| **Results** | Written to file, read later | Returned inline |
| **Blocking** | Non-blocking (returns immediately) | Blocking (waits for completion) |
| **Parallelism** | True OS-level parallelism | Task tool parallelism |
| **Output** | $PAI_DIR/external-agents/ | Inline response |

**When to use external vs built-in:**
- **Need different model** (Codex/Gemini) → External
- **Long-running task** → External (run in background)
- **Want immediate inline results** → Built-in
- **Need Claude's analysis** → Either (built-in for inline, Ick for background)
