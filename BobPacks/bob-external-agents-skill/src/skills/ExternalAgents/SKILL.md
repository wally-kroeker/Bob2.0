---
name: ExternalAgents
description: |
  Spawn external AI CLI agents (Claude, Gemini, Codex) as independent background processes.
  USE WHEN user says "use Codex", "use Gemini", "launch Gemini agents", "external agents",
  "spawn Codex", "Gemini for this", or wants tasks delegated to non-Claude-Code models.
  DIFFERENT FROM built-in Agents skill which uses Claude Code subagents (Task tool).
---

# ExternalAgents Skill

Spawn external AI agents (Codex, Gemini, Claude CLI) as independent background processes with full permissions. These agents run outside Claude Code's process tree and can work in parallel while you continue your conversation.

## When to Use This Skill

| User Says | Route To |
|-----------|----------|
| "use Gemini", "Gemini agent", "spawn Gemini" | → SpawnExternalAgent (gemini) |
| "use Codex", "Codex for this", "spawn Codex" | → SpawnExternalAgent (codex) |
| "use Claude CLI", "external Claude" | → SpawnExternalAgent (claude) |
| "launch external agents", "other guys" | → SpawnExternalAgent |
| "check on agents", "agent status" | → CheckAgentStatus |
| "what are my agents doing" | → ListAgents |
| "get agent output", "read agent results" | → GetAgentOutput |

## Distinction from Built-in Agents Skill

| Feature | ExternalAgents (this skill) | Agents (pai-agents-skill) |
|---------|----------------------------|---------------------------|
| Execution | Separate CLI process | Claude Code subagent |
| Models | Codex, Gemini, Claude CLI | Claude only |
| Permissions | Full (--dangerously-skip-permissions) | Sandbox-controlled |
| Parallelism | True OS-level parallelism | Task tool parallelism |
| Results | Written to file, read later | Returned inline |
| Process tree | Independent | Child of current session |
| Traits | Uses same AgentFactory.ts | Uses same AgentFactory.ts |

## Workflows

### SpawnExternalAgent

**Trigger:** User wants to delegate work to Codex, Gemini, or external Claude

**Steps:**

1. **Identify the model** from user request:
   - "Gemini" → `gemini`
   - "Codex" → `codex`
   - "Claude CLI" / "external Claude" → `claude`

2. **Determine traits** (if specified):
   - If user specifies traits ("skeptical researcher") → use those traits
   - If user specifies task type → infer traits from task
   - If neither → spawn vanilla (no traits)

3. **Execute spawn-agent.sh via Bash**:

```bash
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model <claude|gemini|codex> \
  --traits "<trait1,trait2,trait3>" \
  --task "<task description>" \
  --dir "<working directory>" \
  --output-format json
```

4. **Report task ID to user** for later retrieval

5. **Continue conversation** - agent runs in background

**Example:**

```bash
# User: "Use Gemini to research VDI solutions with an enthusiastic approach"

$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model gemini \
  --traits "research,enthusiastic,exploratory" \
  --task "Research VDI solutions for Linux desktop access. Compare Guacamole, Kasm, and NoVNC. Provide feature matrix and recommendations." \
  --output-format json
```

---

### SpawnMultipleAgents

**Trigger:** User wants to split work across multiple external agents

**Steps:**

1. **Analyze the plan/task list** to identify independent subtasks

2. **For each subtask**, determine:
   - Best model (Codex for code, Gemini for research, Claude for analysis)
   - Appropriate traits for the subtask
   - Clear, standalone task description

3. **Spawn agents in parallel** (multiple Bash calls in one message):

```bash
# Agent 1 - Research
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model gemini \
  --traits "research,thorough,systematic" \
  --task "Subtask 1 description..." \
  --output-format json

# Agent 2 - Implementation
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model codex \
  --traits "technical,meticulous,systematic" \
  --task "Subtask 2 description..." \
  --output-format json

# Agent 3 - Analysis
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model claude \
  --traits "analytical,skeptical,thorough" \
  --task "Subtask 3 description..." \
  --output-format json
```

4. **Report all task IDs** to user

5. **Optionally set reminder** to check on agents later

---

### CheckAgentStatus

**Trigger:** User wants to know agent status

**Execute:**

```bash
# Check specific agent
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh status <task_id>

# List all agents
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list

# Quick summary
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh summary
```

---

### GetAgentOutput

**Trigger:** User wants to see results from a completed agent

**Execute:**

```bash
# Read full output
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh output <task_id>

# Or read directly
cat $PAI_DIR/external-agents/<task_id>.output
```

**Then:** Summarize or present the results to the user

---

### KillAgent

**Trigger:** User wants to stop a running agent

**Execute:**

```bash
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh kill <task_id>
```

---

## Trait Recommendations by Model

External agents use the same trait system as built-in agents. However, different models have different strengths:

### Codex (Best for: Code)

| Task Type | Recommended Traits |
|-----------|-------------------|
| Code review | technical, meticulous, adversarial |
| Implementation | technical, pragmatic, systematic |
| Debugging | technical, analytical, thorough |
| Refactoring | technical, creative, systematic |

### Gemini (Best for: Research)

| Task Type | Recommended Traits |
|-----------|-------------------|
| Technology research | research, enthusiastic, exploratory |
| Competitive analysis | research, analytical, comparative |
| Documentation review | research, meticulous, systematic |
| Trend analysis | research, bold, synthesizing |

### Claude CLI (Best for: Analysis)

| Task Type | Recommended Traits |
|-----------|-------------------|
| Architecture review | technical, skeptical, thorough |
| Security audit | security, skeptical, adversarial |
| Strategy analysis | business, analytical, synthesizing |
| Risk assessment | finance, cautious, systematic |

---

## Available Traits (from AgentFactory)

**Expertise (10):** security, legal, finance, medical, technical, research, creative, business, data, communications

**Personality (10):** skeptical, enthusiastic, cautious, bold, analytical, creative, empathetic, contrarian, pragmatic, meticulous

**Approach (8):** thorough, rapid, systematic, exploratory, comparative, synthesizing, adversarial, consultative

---

## Output Location

All agent outputs are stored in: `$PAI_DIR/external-agents/`

Files per agent:
- `<task_id>.meta` - JSON metadata (status, traits, timestamps)
- `<task_id>.output` - Agent's output
- `<task_id>.pid` - Process ID

---

## Example Conversation

**User:** "I have a 3-part plan. Split it between two Gemini agents for research and one Codex agent for implementation."

**Bob:**
1. Analyzes plan, identifies:
   - Part 1: Research existing solutions (Gemini)
   - Part 2: Research best practices (Gemini)
   - Part 3: Implement prototype (Codex)

2. Spawns 3 external agents via spawn-agent.sh

3. Reports:
   ```
   Spawned 3 external agents:
   - 20250110-143022-gemini-1234: Research existing solutions (research,enthusiastic,exploratory)
   - 20250110-143023-gemini-1235: Research best practices (research,thorough,systematic)
   - 20250110-143024-codex-1236: Implement prototype (technical,pragmatic,systematic)

   They're running in background. I'll let you know when they complete, or you can ask "check on agents" anytime.
   ```

4. Continues conversation while agents work

**User (later):** "Check on the agents"

**Bob:** Runs check-agents.sh list, reports status

**User:** "Show me what the Codex agent produced"

**Bob:** Reads and summarizes the output file

---

## Constitutional Rules

1. **ALWAYS specify --output-format json** when spawning for programmatic capture
2. **NEVER block waiting** for external agents - they run in background
3. **USE spawn-agent.sh** - don't invoke CLIs directly (handles trait composition)
4. **REPORT task IDs** so user can check later
5. **TRAITS are optional** - vanilla agents work fine for simple tasks
6. **DIFFERENT traits for multiple agents** - don't use identical traits for parallel work
