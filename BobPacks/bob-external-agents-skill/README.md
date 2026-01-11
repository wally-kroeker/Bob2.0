---
name: bob-external-agents-skill
version: 1.0.0
author: Wally Kroeker
description: Spawn external AI CLI agents (Codex, Gemini, Claude) as independent background processes
type: skill
dependencies:
  - pai-agents-skill (for AgentFactory.ts and trait system)
  - bun (for AgentFactory execution)
  - jq (for JSON processing)
---

# ExternalAgents Skill

Spawn external AI agents (Codex, Gemini, Claude CLI) as independent background processes with full permissions. These agents run **outside Claude Code's process tree**, enabling true OS-level parallelism while you continue your conversation.

## Problem

The built-in Agents skill (pai-agents-skill) only supports Claude models via the Task tool. When you want to:

- Use Codex for code-heavy tasks
- Use Gemini for research with its web search strengths
- Run truly independent processes that survive session termination
- Leverage different models' unique capabilities in parallel

...you need a way to spawn external CLI agents programmatically.

## Solution

ExternalAgents provides shell-script wrappers that:

1. **Compose agent personalities** using the existing AgentFactory.ts trait system
2. **Spawn external CLIs** (codex, gemini, claude) in background with full permissions
3. **Track agent status** via metadata files
4. **Collect results** when agents complete

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Request                                │
│         "Launch two Gemini agents for research"                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    ExternalAgents Skill                           │
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐  │
│  │ spawn-agent.sh  │───▶│ AgentFactory.ts │───▶│ Compose      │  │
│  │                 │    │ (traits→prompt) │    │ Personality  │  │
│  └────────┬────────┘    └─────────────────┘    └──────────────┘  │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Spawn External CLI (background)                 │ │
│  │                                                              │ │
│  │   claude --print --dangerously-skip-permissions              │ │
│  │   gemini --yolo                                              │ │
│  │   codex exec --dangerously-bypass-approvals-and-sandbox      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Write Output to Files                           │ │
│  │                                                              │ │
│  │   $PAI_DIR/external-agents/<task_id>.output                  │ │
│  │   $PAI_DIR/external-agents/<task_id>.meta                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

## Comparison with Built-in Agents

| Feature | ExternalAgents | Agents (pai-agents-skill) |
|---------|----------------|---------------------------|
| Models | Codex, Gemini, Claude CLI | Claude only |
| Execution | Separate OS process | Claude Code subagent |
| Permissions | Full (dangerous mode) | Sandbox-controlled |
| Parallelism | True OS-level | Task tool parallelism |
| Results | File-based, async | Inline, synchronous |
| Survives session | Yes | No |
| Trait system | Shared AgentFactory.ts | Shared AgentFactory.ts |

## Usage Examples

### Spawn a Gemini Research Agent

```bash
# From within Claude Code conversation:
"Use Gemini to research VDI solutions with an enthusiastic approach"

# Bob executes:
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model gemini \
  --traits "research,enthusiastic,exploratory" \
  --task "Research VDI solutions for Linux desktop access"
```

### Spawn Multiple Agents in Parallel

```bash
# "Split this between Gemini for research and Codex for implementation"

# Agent 1
spawn-agent.sh --model gemini --traits "research,thorough" --task "Research part..."

# Agent 2
spawn-agent.sh --model codex --traits "technical,systematic" --task "Implement part..."
```

### Check Agent Status

```bash
# List all agents
check-agents.sh list

# Check specific agent
check-agents.sh status 20250110-143022-gemini-1234

# View output
check-agents.sh output 20250110-143022-gemini-1234
```

## Files

```
bob-external-agents-skill/
├── README.md              # This file
├── INSTALL.md             # Installation instructions
├── VERIFY.md              # Verification checklist
└── src/
    └── skills/
        └── ExternalAgents/
            ├── SKILL.md   # Skill routing and workflows
            └── Tools/
                ├── spawn-agent.sh    # Spawn external agents
                └── check-agents.sh   # Check/manage agents
```

## Prerequisites

- **pai-agents-skill** installed (provides AgentFactory.ts)
- **bun** runtime (for AgentFactory.ts execution)
- **jq** for JSON processing
- External CLIs installed:
  - `claude` - Claude Code CLI
  - `gemini` - Gemini CLI (optional)
  - `codex` - OpenAI Codex CLI via npx (optional)

## Security Note

External agents run with full permissions (`--dangerously-skip-permissions` or equivalent). They can:

- Read/write any file
- Execute any command
- Access network resources

Only use this skill in trusted environments where you understand the implications.
