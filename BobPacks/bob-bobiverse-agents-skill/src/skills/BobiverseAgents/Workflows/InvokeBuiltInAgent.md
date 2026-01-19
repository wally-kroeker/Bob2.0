# InvokeBuiltInAgent Workflow

**Invokes named Bobiverse agents (Bill, Mario, Riker, Howard, Homer) using PersonaFactory + Task tool.**

---

## Pre-flight Checklist (MANDATORY)

**STOP! Before proceeding, you MUST complete this checklist:**

- [ ] I understand I must run `PersonaFactory.ts` via Bash
- [ ] I will capture JSON output and use the `prompt` field verbatim
- [ ] I will use `subagent_type: "general-purpose"` for custom voices
- [ ] I will NOT manually compose agent prompts
- [ ] I understand built-in agents are Claude Code subagents (NOT external processes)

**⚠️ VIOLATION: If you skip PersonaFactory, you're not invoking the proper Bobiverse persona.**

---

## When to Use

User mentions a named Bobiverse agent:

| User Says | Agent | Trigger |
|-----------|-------|---------|
| "Bill", "the architect", "get Bill to design" | Bill (ID: 4) | Architecture, PRDs, system design |
| "Mario", "the engineer", "have Mario implement" | Mario (ID: 5) | Implementation, debugging, deployment |
| "Riker", "the researcher", "Riker can research" | Riker (ID: 6) | Research, comparisons, discovery |
| "Howard", "the designer", "ask Howard" | Howard (ID: 7) | Documentation, UX, presentations |
| "Homer", "the strategist", "Homer should analyze" | Homer (ID: 40) | Strategy, ethics, long-term decisions |

**KEY TRIGGER: Named agent reference = built-in agent invocation.**

---

## The Workflow

### Step 1: Detect Agent Name and Extract Task

From user input:
- **Which agent?** (bill, mario, riker, howard, homer)
- **What's the task?** (extract task description)

Example:
```
User: "Have Mario implement the authentication middleware"
→ Agent: mario
→ Task: "Implement the authentication middleware"
```

### Step 2: Run PersonaFactory (MANDATORY)

**⚠️ THIS STEP IS NOT OPTIONAL - YOU MUST EXECUTE PERSONAFACTORY.TS VIA BASH**

```bash
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
  --persona <agent_name> \
  --task "<task description>" \
  --output json
```

**Example for Bill:**
```bash
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
  --persona bill \
  --task "Design a microservices architecture for the payment system" \
  --output json
```

**What PersonaFactory returns (JSON output):**
```json
{
  "name": "Bill (The Architect)",
  "bob_id": 4,
  "traits": ["technical", "analytical", "systematic"],
  "voice": "Professional",
  "voice_id": "fG5mCMqjYjBCkbpXqbEl",
  "expertise": "System design, architecture, PRDs, specifications",
  "prompt": "You are Bill (Bob-4), The Architect from the Bobiverse...\n\n[Full composed prompt with personality, task, and output format]"
}
```

**You MUST use the `prompt` field from this output in your Task call.**

### Step 3: Launch Agent via Task Tool

**CRITICAL: Use `subagent_type: "general-purpose"` to preserve custom voice!**

```typescript
Task({
  description: "Bill - Design payment system architecture",
  prompt: <bill_full_prompt_from_json>,
  subagent_type: "general-purpose",  // NEVER "Intern" - would override voice!
  model: "sonnet"  // or "haiku" for speed, "opus" for complexity
})
```

### Step 4: Report Results to User

Present the agent's output clearly:
```
**Bill's Architecture Design:**

[Agent output here]
```

---

## Example Invocations

### Example 1: Bill (The Architect)

**User:** "Get Bill to design a microservices architecture for our payment processing system."

**Workflow:**
1. Detect: agent=bill, task="Design a microservices architecture for our payment processing system"
2. Run PersonaFactory:
   ```bash
   bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
     --persona bill \
     --task "Design a microservices architecture for our payment processing system" \
     --output json
   ```
3. Capture JSON output (contains full prompt)
4. Launch Task:
   ```typescript
   Task({
     description: "Bill - Payment system architecture",
     prompt: <bill_prompt>,
     subagent_type: "general-purpose",
     model: "sonnet"
   })
   ```

### Example 2: Mario (The Engineer)

**User:** "Mario, implement the API rate limiting middleware."

**Workflow:**
1. Detect: agent=mario, task="Implement the API rate limiting middleware"
2. Run PersonaFactory:
   ```bash
   bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
     --persona mario \
     --task "Implement the API rate limiting middleware" \
     --output json
   ```
3. Launch Task with Mario's composed prompt

### Example 3: Riker (The Researcher)

**User:** "Have Riker research VDI solutions for Linux desktop access."

**Workflow:**
1. Detect: agent=riker, task="Research VDI solutions for Linux desktop access"
2. Run PersonaFactory:
   ```bash
   bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
     --persona riker \
     --task "Research VDI solutions for Linux desktop access" \
     --output json
   ```
3. Launch Task with Riker's composed prompt

### Example 4: Howard (The Designer)

**User:** "Ask Howard to create user documentation for the CLI tool."

**Workflow:**
1. Detect: agent=howard, task="Create user documentation for the CLI tool"
2. Run PersonaFactory:
   ```bash
   bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
     --persona howard \
     --task "Create user documentation for the CLI tool" \
     --output json
   ```
3. Launch Task with Howard's composed prompt

### Example 5: Homer (The Strategist)

**User:** "Homer should analyze our product roadmap and identify ethical considerations."

**Workflow:**
1. Detect: agent=homer, task="Analyze our product roadmap and identify ethical considerations"
2. Run PersonaFactory:
   ```bash
   bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
     --persona homer \
     --task "Analyze our product roadmap and identify ethical considerations" \
     --output json
   ```
3. Launch Task with Homer's composed prompt

---

## Model Selection

| Task Type | Model | Reason |
|-----------|-------|--------|
| Quick checks | `haiku` | 10-20x faster, low cost |
| Standard work | `sonnet` | Balanced speed/quality |
| Complex reasoning | `opus` | Maximum intelligence |

**Default: `sonnet` unless user specifies otherwise.**

---

## Common Mistakes

### WRONG: Skipping PersonaFactory

```typescript
// WRONG - Manual prompt composition loses personality!
Task({
  prompt: "You are Bill, an architect. Design a system for...",
  subagent_type: "general-purpose"
})
```

**RIGHT: Using PersonaFactory output**
```bash
# Run PersonaFactory first
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
  --persona bill --task "..." --output json

# Use the returned prompt field
Task({ prompt: <json.prompt>, subagent_type: "general-purpose" })
```

### WRONG: Using named subagent_type

```typescript
// WRONG - "Intern" voice overrides Bill's Professional voice!
Task({
  prompt: <bill_prompt>,
  subagent_type: "Intern"  // ❌ Forces wrong voice
})
```

**RIGHT: Using general-purpose**
```typescript
// CORRECT - Preserves Bill's custom voice
Task({
  prompt: <bill_prompt>,
  subagent_type: "general-purpose"  // ✅ Respects voice_id
})
```

### WRONG: Confusing built-in vs external

```bash
# WRONG - spawn-agent.sh is for EXTERNAL agents (Hugh, Bender, Ick)!
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh --persona bill
```

**RIGHT: Built-in agents use Task tool**
```typescript
// CORRECT - Built-in agents use Task tool (subagent)
Task({ prompt: <bill_prompt>, subagent_type: "general-purpose" })
```

---

## Error Handling

### PersonaFactory fails

**Symptom:** PersonaFactory.ts returns error or invalid JSON

**Causes:**
- Invalid persona name (check spelling: bill, mario, riker, howard, homer)
- Missing $PAI_DIR environment variable
- PersonaFactory.ts not installed

**Fix:**
1. Verify persona name: `bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas`
2. Check $PAI_DIR: `echo $PAI_DIR`
3. Verify file exists: `ls $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts`

### Task tool fails

**Symptom:** Task call returns error

**Causes:**
- Malformed prompt (check JSON escaping)
- Invalid model name
- Task tool not available (skill not loaded)

**Fix:**
1. Check prompt is valid string
2. Verify model is one of: haiku, sonnet, opus
3. Ensure Agents skill is loaded

---

## Built-In Agent Roster (Quick Reference)

| Agent | ID | Role | Traits | Voice | When to Use |
|-------|----|----|--------|-------|-------------|
| **Bill** | 4 | The Architect | technical, analytical, systematic | Professional | System design, architecture, PRDs, specs |
| **Mario** | 5 | The Engineer | technical, pragmatic, thorough | Gritty | Implementation, debugging, deployment |
| **Riker** | 6 | The Researcher | research, enthusiastic, exploratory | Energetic | Research, comparisons, discovery |
| **Howard** | 7 | The Designer | creative, empathetic, consultative | Warm | Docs, UX, presentations, communication |
| **Homer** | 40 | The Strategist | business, analytical, synthesizing | Academic | Strategy, ethics, long-term decisions |

**Run full roster:** `bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas`
