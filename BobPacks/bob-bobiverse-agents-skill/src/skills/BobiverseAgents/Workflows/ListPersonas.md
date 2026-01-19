# ListPersonas Workflow

**Lists all available Bobiverse agents (built-in and external) with their traits, voices, and capabilities.**

---

## When to Use

User asks about available agents:

| User Says | Route To |
|-----------|----------|
| "what agents", "list agents", "show clones" | → ListPersonas |
| "available agents", "which agents can I use" | → ListPersonas |
| "show me the roster", "list the Bobs" | → ListPersonas |
| "what are the built-in agents" | → ListPersonas |
| "what external agents are there" | → ListPersonas |
| "agents help", "how do I use agents" | → ListPersonas |

**KEY TRIGGER: Any request to see available agents or understand agent capabilities.**

---

## The Workflow

### Step 1: Run PersonaFactory --list-personas

```bash
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas
```

**What this returns:**

A formatted table of all 8 Bobiverse agents with:
- Name and Bob ID
- Role/personality
- Model (for external agents)
- Primary traits
- Voice name and ID
- Typical use cases

### Step 2: Format Output for User

Present the list clearly, distinguishing built-in from external agents.

**Example Output:**

```
Available Bobiverse Agents:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILT-IN AGENTS (Claude Code Subagents - Inline Results)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Bill (Bob-4) - The Architect
   Traits: technical, analytical, systematic
   Voice: Professional
   Use For: System design, architecture, PRDs, specifications
   Invoke: "Have Bill design..."

2. Mario (Bob-5) - The Engineer
   Traits: technical, pragmatic, thorough
   Voice: Gritty
   Use For: Implementation, debugging, deployment
   Invoke: "Mario, implement..."

3. Riker (Bob-6) - The Researcher
   Traits: research, enthusiastic, exploratory
   Voice: Energetic
   Use For: Research, comparisons, discovery
   Invoke: "Get Riker to research..."

4. Howard (Bob-7) - The Designer
   Traits: creative, empathetic, consultative
   Voice: Warm
   Use For: Documentation, UX, presentations, communication
   Invoke: "Ask Howard to..."

5. Homer (Bob-40) - The Strategist
   Traits: business, analytical, synthesizing
   Voice: Academic
   Use For: Strategy, ethics, long-term decisions
   Invoke: "Homer should analyze..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXTERNAL AGENTS (Background Processes - Different Models)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. Hugh (Bob-8) - The Transhumanist
   Model: Codex (OpenAI)
   Traits: technical, bold, meticulous
   Voice: Intense
   Use For: Elite code generation, complex algorithms, precision
   Invoke: "Use Codex..." or "Spawn Hugh..."

7. Bender (Bob-9) - The Weary Legend
   Model: Gemini
   Traits: technical, skeptical, thorough
   Voice: Gritty
   Use For: Legacy debugging, research, broad knowledge
   Invoke: "Use Gemini..." or "Get Bender to..."

8. Ick (Bob-10) - The Zen Explorer
   Model: Claude CLI
   Traits: research, analytical, exploratory
   Voice: Calm
   Use For: Nuanced analysis, thoughtful review, patient exploration
   Invoke: "Spawn Ick..." or "Use Claude CLI..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How to use:
- Built-in: Mention agent name → "Have Mario implement X"
- External: Specify model or agent → "Use Gemini to research Y"

Run full details: bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas
```

### Step 3: Explain Built-In vs External Distinction

If user seems confused, clarify the difference:

```
Built-In Agents (Bill, Mario, Riker, Howard, Homer):
- Run as Claude Code subagents (Task tool)
- Return results immediately (inline)
- Use Claude model only
- Best for: Quick tasks, immediate results

External Agents (Hugh, Bender, Ick):
- Run as independent background processes
- Different AI models (Codex, Gemini, Claude CLI)
- Results saved to file, retrieved later
- Best for: Long tasks, leveraging different model strengths
```

---

## Quick Reference Roster (Embedded in Workflow)

Use this table when PersonaFactory isn't available:

### Built-In Agents

| Agent | ID | Role | Traits | Voice | Invoke Pattern |
|-------|----|----|--------|-------|----------------|
| **Bill** | 4 | The Architect | technical, analytical, systematic | Professional | "Bill, design..." |
| **Mario** | 5 | The Engineer | technical, pragmatic, thorough | Gritty | "Mario, implement..." |
| **Riker** | 6 | The Researcher | research, enthusiastic, exploratory | Energetic | "Riker, research..." |
| **Howard** | 7 | The Designer | creative, empathetic, consultative | Warm | "Howard, create..." |
| **Homer** | 40 | The Strategist | business, analytical, synthesizing | Academic | "Homer, analyze..." |

### External Agents

| Agent | ID | Model | Personality | Traits | Invoke Pattern |
|-------|----|----|-------------|--------|----------------|
| **Hugh** | 8 | Codex (OpenAI) | The Transhumanist - Elite precision | technical, bold, meticulous | "Use Codex..." |
| **Bender** | 9 | Gemini | The Weary Legend - Gritty veteran | technical, skeptical, thorough | "Use Gemini..." |
| **Ick** | 10 | Claude CLI | The Zen Explorer - Patient, wise | research, analytical, exploratory | "Spawn Ick..." |

---

## Alternative: Show Specific Agent Details

If user asks about a specific agent:

```bash
# Get detailed info for one persona
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
  --persona <agent_name> \
  --task "example task" \
  --output json
```

This shows:
- Full persona composition
- Voice ID
- Complete prompt structure
- Example use case

---

## Common Questions and Answers

### Q: How many agents can I run at once?

**A:**
- Built-in: Unlimited (Task tool handles parallelism)
- External: Limited by system resources (each is independent process)

### Q: Which agent should I use for X?

**A:** Use the decision tree:

```
Is it code-heavy?
  → Yes: Hugh (Codex) for implementation, Bill (design), Mario (debug)
  → No: Continue...

Is it research/exploration?
  → Yes: Riker (quick), Bender (thorough), Ick (nuanced)
  → No: Continue...

Is it creative/communication?
  → Yes: Howard (docs, UX, presentations)
  → No: Continue...

Is it strategic/ethical?
  → Yes: Homer (long-term thinking, ethics)
  → No: Ask for clarification
```

### Q: Can I customize agent traits?

**A:**
- Built-in agents: No, they have fixed personas (use generic Agents skill for custom)
- External agents: Yes, via spawn-agent.sh --traits parameter

### Q: What's the difference between Bender and Mario?

**A:**
- **Bender** (Bob-9): External agent using Gemini, runs in background, best for research/legacy
- **Mario** (Bob-5): Built-in agent using Claude, returns inline, best for implementation

### Q: How do I see what agents are running?

**A:**
```bash
# Built-in agents: Check active Task tools (no persistence)
# External agents: Check status
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list
```

---

## Example Conversations

### Example 1: User wants to see all agents

**User:** "What agents can I use?"

**Workflow:**
1. Run PersonaFactory --list-personas
2. Format output (as shown in Step 2)
3. Explain built-in vs external
4. Offer to demonstrate with example

### Example 2: User wants agent recommendations

**User:** "Which agent should I use for implementing a REST API?"

**Response:**
```
For REST API implementation, I recommend:

1. Bill (The Architect) - Design the API structure first
   "Bill, design a REST API for our product catalog"

2. Mario (The Engineer) - Implement the endpoints
   "Mario, implement the REST API based on Bill's design"

Alternative (external):
- Hugh (Codex) - For elite code generation
  "Use Codex to implement the REST API endpoints"

Want me to spawn them now, or would you like to see the full roster first?
```

### Example 3: User asks about specific agent

**User:** "Tell me about Riker."

**Response:**
```
Riker (Bob-6) - The Researcher

Role: Enthusiastic explorer and researcher
Traits: research, enthusiastic, exploratory
Voice: Energetic
Model: Claude (built-in agent)

Best for:
- Technology research
- Competitive analysis
- Exploring new solutions
- Discovering alternatives

Invoke: "Riker, research [topic]"

Example: "Riker, research VDI solutions for Linux and compare features"

Would you like me to have Riker research something for you?
```

---

## Error Handling

### PersonaFactory.ts not found

**Symptom:** Command fails with "file not found"

**Fix:**
1. Check $PAI_DIR is set: `echo $PAI_DIR`
2. Verify installation: `ls $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts`
3. If missing, reinstall BobiverseAgents skill

### No output / empty list

**Symptom:** PersonaFactory returns empty or error

**Fix:**
1. Check PersonaFactory.ts is valid TypeScript
2. Verify Data/Personas.yaml exists
3. Run with debug: `bun run PersonaFactory.ts --list-personas --debug`

### Outdated persona list

**Symptom:** List doesn't match expected agents

**Fix:**
1. Verify PersonaFactory.ts version
2. Check Data/Personas.yaml is up to date
3. Pull latest from repository

---

## Related Workflows

- **InvokeBuiltInAgent.md** - How to use Bill, Mario, Riker, Howard, Homer
- **InvokeExternalAgent.md** - How to use Hugh, Bender, Ick
- **CreateCustomAgent.md** (Agents skill) - Create ad-hoc agents with custom traits

---

## Quick Command Reference

```bash
# List all personas
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas

# Get details for specific persona
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \
  --persona bill --task "example" --output json

# List available traits (for custom agents)
bun run $PAI_DIR/skills/Agents/Tools/AgentFactory.ts --list

# Check running external agents
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list
```
