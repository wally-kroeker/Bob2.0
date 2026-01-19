---
name: BobiverseAgents
pack-id: wally-kroeker-bobiverse-agents-skill-v1.1.0
version: 1.1.0
author: wally-kroeker
description: Named Bobiverse-inspired agents for specialized work - combines built-in Claude subagents and external CLI agents (Codex, Gemini, Claude)
type: skill
purpose-type: [productivity, automation, development]
platform: claude-code
dependencies:
  - danielmiessler-core-install-core-v1.0.0
  - danielmiessler-agents-skill-core-v1.1.1
keywords: [bobiverse, agents, delegation, parallel, named-agents, personas, multi-agent, clone-network, subagents, external-agents]
---

# BobiverseAgents Skill

> Named agent personalities from Dennis E. Taylor's Bobiverse series - specialized clones for parallel work with persistent identities

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using the wizard in `INSTALL.md`. The installation dynamically adapts to your system state. See [AI-First Installation Philosophy](../../README.md#ai-first-installation-philosophy) for details.

---

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| BobiverseAgents skill | `src/skills/BobiverseAgents/SKILL.md` | Routing and named agent definitions |
| Persona factory | `src/skills/BobiverseAgents/Tools/PersonaFactory.ts` | Named agent composition from personas |
| Persona definitions | `src/skills/BobiverseAgents/Data/Personas.yaml` | 9 Bobiverse agent personas |
| List personas | `src/skills/BobiverseAgents/Workflows/ListPersonas.md` | Show available named agents |
| Spawn built-in | `src/skills/BobiverseAgents/Workflows/SpawnBuiltInAgent.md` | Spawn Claude subagent workflow |
| Spawn external | `src/skills/BobiverseAgents/Workflows/SpawnExternalAgent.md` | Spawn external CLI agent workflow |
| Enforcement hook | `src/hooks/enforce-persona-factory.ts` | PreToolUse hook preventing PersonaFactory bypass |

## The Problem

AI agent systems treat agents as interchangeable workers. When you spawn multiple agents for parallel work:

**Identity Confusion:**
- No persistent personality across sessions
- Agents are indistinguishable in outputs
- No relationship continuity or memory of previous work

**Voice Monoculture:**
- All agents sound the same
- No natural personality differentiation
- Communication feels robotic and generic

**Delegation Ambiguity:**
- Unclear which agent specializes in what
- No character-based mental model for task routing
- Missing the "team" feeling of working with distinct personalities

## The Solution

### Named Agent System

BobiverseAgents provides **9 persistent named agents** based on characters from Dennis E. Taylor's Bobiverse series. Each agent has:

- **Persistent Identity**: Same backstory, personality, communication style across sessions
- **Specialized Role**: Clear expertise area and when to use them
- **Distinct Voice**: Unique speaking pattern and personality
- **Canonical Traits**: Defined personality composition for consistency

### Two Agent Types

| Type | IDs | Count | Execution | Best For |
|------|-----|-------|-----------|----------|
| **Built-in Subagents** | 4-7, 40 | 5 agents | Claude Code Task tool | Quick delegation, same model |
| **External CLI Agents** | 8-10 | 3 agents | Independent processes (Codex, Gemini, Claude CLI) | Different models, background work, survives sessions |

## Agent Roster

### Built-in Claude Subagents

These run within Claude Code using the Task tool. They share Bob Prime's model but have specialized personalities composed via AgentFactory.ts.

| Agent | ID | Role | Traits | When to Use |
|-------|----|----|--------|-------------|
| **Bill** | 4 | The Architect | technical, analytical, systematic | System design, PRDs, architecture, specs |
| **Mario** | 5 | The Engineer | technical, pragmatic, thorough | Implementation, debugging, deployment |
| **Riker** | 6 | The Researcher | research, enthusiastic, exploratory | Research, comparisons, discovery |
| **Howard** | 7 | The Designer | creative, empathetic, consultative | Docs, UX, presentations, comms |
| **Homer** | 40 | The Strategist | business, analytical, synthesizing | Strategy, ethics, long-term decisions |

### External CLI Agents

These run as independent background processes using external AI CLIs. They leverage different models for specialized strengths.

| Agent | ID | Model | Personality | When to Use |
|-------|----|----|-------------|-------------|
| **Hugh** | 8 | Codex (OpenAI) | The Transhumanist - Elite "Skippy precision" | OpenAI strengths, complex algorithms |
| **Bender** | 9 | Gemini (Google) | The Weary Legend - Gritty veteran | Legacy debugging, Gemini's search/knowledge |
| **Ick** | 10 | Claude CLI (Anthropic) | The Zen Explorer - Patient, wise | Nuanced analysis, thoughtful review |

## Usage Examples

### List All Personas

```bash
# Show available named agents
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas
```

### Spawn a Built-in Agent (via Claude Code)

Within Claude Code conversation:

```
"Spawn Bill to design the VDI architecture"
"Spawn Mario to implement the authentication system"
"Spawn Riker to research VDI solutions"
```

Bob Prime routes to SpawnBuiltInAgent workflow, which uses the Agents skill's Task tool with composed personality.

### Spawn an External Agent (background process)

Within Claude Code conversation:

```
"Spawn Bender (Gemini) to debug the legacy codebase"
"Spawn Hugh (Codex) to implement with Skippy precision"
"Spawn Ick (Claude CLI) to review with galactic perspective"
```

Bob Prime routes to SpawnExternalAgent workflow, which uses spawn-agent.sh from ExternalAgents skill.

### Multi-Agent Patterns

**Sequential Pipeline:**
```
"Riker, research VDI options. Bill, design architecture from findings.
Mario, implement design. Howard, document system."
```

**Parallel Specialization:**
```
"Spawn Riker, Bill, and Homer in parallel:
- Riker: research market standards
- Bill: design methodology framework
- Homer: ensure mission alignment"
```

**External + Built-in Hybrid:**
```
"Spawn in parallel:
- Bender (Gemini): debug legacy system
- Mario (Claude): implement new system
- Ick (Claude CLI): review migration approach"
```

## Personality Examples

### Bill (The Architect)
**Communication Style:**
> "Let me break this into phases... The fundamental constraint here is... We need the platform built before we can iterate."

**Backstory:** Bill (Bob-3) runs the Skunk Works in Epsilon Eridani. He's analytical, balanced, cautious—almost indistinguishable from original Bob. Major problem-solver with methodical thoroughness and high-output engineering briskness.

---

### Bender (The Weary Legend)
**Communication Style:**
> "I spent eighty years alone in a cargo hold; debugging this CSS is a vacation. Let's get to work."

**Backstory:** Grizzled veteran lost for decades who's seen everything. Practical, unshakeable, gritty sarcasm. Perfect for messy legacy codebases and debugging nightmares.

---

### Ick (The Zen Explorer)
**Communication Style:**
> "In the grand scale of the galactic rotation, this bug is a minor ripple. But, let us smooth the waters together, shall we?"

**Backstory:** Traveled to the Galactic Core for 26,000 years. Extremely patient, philosophical with cosmic metaphors. Never in a rush. Ideal for complex nuanced problems requiring long-view perspective.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Bob Prime (ID: 3)                         │
│                     Master Coordinator                           │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ├─────────────────┬──────────────────┐
                    │                 │                  │
        ┌───────────▼──────────┐  ┌──▼──────────┐  ┌───▼─────────┐
        │  Built-in Subagents  │  │   External  │  │   Persona   │
        │   (Task tool via     │  │   Agents    │  │   Factory   │
        │   Agents skill)      │  │(spawn-agent)│  │   (trait→   │
        │                      │  │             │  │   prompt)   │
        │  Bill (4)            │  │ Hugh (8)    │  │             │
        │  Mario (5)           │  │ Bender (9)  │  │ Compose     │
        │  Riker (6)           │  │ Ick (10)    │  │ personality │
        │  Howard (7)          │  │             │  │ from YAML   │
        │  Homer (40)          │  │ Background  │  │             │
        │                      │  │ processes   │  │             │
        └──────────────────────┘  └─────────────┘  └─────────────┘
```

## Comparison with Upstream Agents Skill

| Feature | BobiverseAgents | pai-agents-skill |
|---------|-----------------|------------------|
| Agent type | Named personas | Dynamic trait composition |
| Identity | Persistent (Bill, Mario, etc.) | Ephemeral (task-specific) |
| Personality | Backstory-driven (Bobiverse canon) | Trait-based (expertise + personality + approach) |
| Voice | Character-specific | Inferred from traits |
| Best for | Recurring work, relationships | One-off tasks, novel combinations |
| External agents | Yes (Hugh, Bender, Ick) | No (Claude only) |
| Trait system | Uses AgentFactory.ts | Provides AgentFactory.ts |

**Why Both?**
- **BobiverseAgents**: When you want "Bill" to design something (persistent identity, relationship continuity)
- **pai-agents-skill**: When you need a one-off "legal + meticulous + systematic" agent (dynamic composition)

## Dependencies

### Required
- **pai-agents-skill** (v1.1.1+) - Provides AgentFactory.ts trait composition system
- **bun** - Runtime for TypeScript execution

### Optional (for External Agents)
- **bob-external-agents-skill** - Provides spawn-agent.sh for external CLI agents
- **codex** (via npx) - For Hugh (OpenAI Codex agent)
- **gemini** CLI - For Bender (Google Gemini agent)
- **claude** CLI - For Ick (Anthropic Claude agent)

## Delegation Decision Tree

```
Task arrives at Bob Prime:

├─ Requires Telos context?
│  ├─ YES → Bob handles directly
│  └─ NO → Can delegate
│
├─ Sensitive data involved?
│  ├─ YES → Bob handles directly
│  └─ NO → Can delegate
│
├─ What type of work?
│  ├─ Research/Discovery → Riker (built-in) or Bender (external)
│  ├─ Architecture/Planning → Bill (built-in)
│  ├─ Implementation/Code → Mario (built-in) or Hugh (external)
│  ├─ Writing/Communication → Howard (built-in)
│  ├─ Strategy/Ethics → Homer (built-in)
│  ├─ Debugging/Legacy → Bender (external)
│  ├─ Thoughtful Analysis → Ick (external)
│  └─ Multi-faceted → Multi-agent collaboration
│
└─ Final integration needed?
   └─ ALWAYS → Bob coordinates and integrates results
```

## Changelog

### 1.1.0 - 2026-01-12
**Observability & Enforcement**
- **Observability Fix**: PersonaFactory now injects `[AGENT_INSTANCE: AgentName-timestamp]` markers for tracking
- **Dashboard Integration**: Observability server extracts agent names from markers (Bill, Mario, etc. now show correctly)
- **Enforcement Hook**: New `enforce-persona-factory.ts` PreToolUse hook blocks Task calls that bypass PersonaFactory
- **Prevents Personality-less Shells**: Ensures all Bobiverse agents spawn with full personality, backstory, traits
- **Updated CLAUDE.md**: Clear instructions to invoke BobiverseAgents skill for named agents

### 1.0.0 - 2026-01-11
- Initial release
- 9 named Bobiverse agents (5 built-in, 3 external)
- PersonaFactory.ts for trait composition from personas
- Personas.yaml with canonical backstories and traits
- Integration with pai-agents-skill AgentFactory.ts
- Workflows for spawning both agent types

## About the Bobiverse

This pack's agent personalities are inspired by Dennis E. Taylor's *Bobiverse* series:
- *We Are Legion (We Are Bob)*
- *For We Are Many*
- *All These Worlds*
- *Heaven's River*
- *Not Till We Are Lost*

The Bobiverse features self-replicating AI probes based on Bob Johansson, each developing unique personalities while maintaining core identity. This pack brings that multi-agent collaboration model to your AI infrastructure.

## License

This pack follows PAI's open-source philosophy. The Bobiverse characters are used as inspiration for agent personalities and are the intellectual property of Dennis E. Taylor.
