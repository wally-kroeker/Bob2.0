---
name: Bob Task Skill
pack-id: bob-task-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Unified task management with Vikunja API integration, ADHD-optimized suggestions, and multi-agent assignment support.
type: skill
platform: claude-code
dependencies: []
keywords: [tasks, vikunja, adhd, productivity, task-management, agents, todo, projects]
---

# Bob Task Skill

> Unified task management with direct Vikunja API integration, ADHD-optimized suggestions, and multi-agent support

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Skill Definition | `src/skills/Task/SKILL.md` | AI activation triggers and ADHD logic |
| API Client | `src/tools/lib/vikunja-client.ts` | Shared Vikunja REST API client |
| List Tasks | `src/tools/task-list.ts` | List and filter tasks |
| Create Task | `src/tools/task-create.ts` | Create new tasks with labels |
| Update Task | `src/tools/task-update.ts` | Update/complete tasks |
| Suggest Tasks | `src/tools/task-suggest.ts` | ADHD-optimized task suggestions |
| Assign Tasks | `src/tools/task-assign.ts` | Multi-agent task assignment |
| Config Template | `src/skills/Task/data/env.template` | API credentials template |

**Summary:**
- **Files created:** 8
- **Dependencies:** Bun runtime, Vikunja instance
- **Runtime:** TypeScript/Bun

---

## The Problem

Managing tasks through multiple packs with complex infrastructure:
- **MCP Server Dependency** - Required external HTTP MCP server
- **SQLite Cache** - Required periodic sync scripts and stale data issues
- **N8N Workflows** - External automation dependency for task breakdown
- **Split Documentation** - Technical reference separate from user-facing skill

---

## The Solution

A single, simplified pack that calls Vikunja REST API directly:

### Architecture

```
┌─────────────────────────────────┐
│     AI Agent (Claude Code)      │
│  ┌─────────────────────────────┐│
│  │  SKILL.md (activation)      ││
│  │  - Task triggers            ││
│  │  - ADHD suggestions         ││
│  └─────────────────────────────┘│
└────────────┬────────────────────┘
             │ invokes
             ▼
┌─────────────────────────────────┐
│      TypeScript CLI Tools       │
│  - task-list.ts                 │
│  - task-create.ts               │
│  - task-update.ts               │
│  - task-suggest.ts (ADHD)       │
│  - task-assign.ts (agents)      │
└────────────┬────────────────────┘
             │ REST calls
             ▼
┌─────────────────────────────────┐
│   Vikunja API (HTTPS)           │
│   taskman.vrexplorers.com       │
└─────────────────────────────────┘
```

### Key Features

1. **Direct API** - No MCP server, call Vikunja REST API directly
2. **Always Fresh** - No cache, always current data from API
3. **ADHD-Optimized** - Time-of-day aware suggestions, momentum building
4. **Multi-Agent** - Assign tasks to Bob and Friends team
5. **Simple Setup** - Single .env file for configuration

---

## Why This Is Different

This sounds similar to the previous bob-taskman-skill which also managed Vikunja tasks. What makes this approach different?

The previous approach required an MCP server, SQLite cache with sync scripts, and N8N automation. This pack eliminates all external dependencies by calling the Vikunja API directly from simple TypeScript scripts. Fresh data every query, zero maintenance.

- Direct API calls eliminate MCP server dependency
- No cache means always-fresh data without sync
- Single pack replaces two separate skill packs
- TypeScript tools are simple and easily debuggable

---

## Installation

See [INSTALL.md](INSTALL.md) for step-by-step instructions.

**Quick Install:**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cp -r src/skills/Task "$PAI_DIR/skills/"
cp -r src/tools "$PAI_DIR/skills/Task/"
cd "$PAI_DIR/skills/Task/tools"
bun install
cp "$PAI_DIR/skills/Task/data/env.template" "$PAI_DIR/skills/Task/data/.env"
# Edit .env with your VIKUNJA_API_TOKEN
```

---

## Verification

See [VERIFY.md](VERIFY.md) for the complete verification checklist.

**Quick Test:**
```bash
cd "$PAI_DIR/skills/Task/tools"
bun run task-list.ts --help
bun run task-list.ts --limit 5
```

---

## Configuration

Copy `.env.template` to `.env` and add your Vikunja API token:

```bash
# $PAI_DIR/skills/Task/data/.env
VIKUNJA_URL="https://taskman.vrexplorers.com/api/v1"
VIKUNJA_API_TOKEN="tk_your_actual_token"
```

Generate a token in Vikunja: Settings → API Tokens → Create Token

---

## CLI Tools Usage

### List Tasks
```bash
bun run task-list.ts                    # All active tasks
bun run task-list.ts --project 9        # Tasks in YardWork project
bun run task-list.ts --label Computer   # Tasks with Computer label
bun run task-list.ts --due today        # Tasks due today
bun run task-list.ts --limit 10         # Limit results
```

### Create Task
```bash
bun run task-create.ts "Trim hedges" --project 9 --priority 3
bun run task-create.ts "Call dentist" --due tomorrow --labels "Phone,5min"
```

### Update Task
```bash
bun run task-update.ts 123 --done           # Mark complete
bun run task-update.ts 123 --priority 5     # Set priority
bun run task-update.ts 123 --due "next Friday"
```

### Get Suggestions (ADHD-Optimized)
```bash
bun run task-suggest.ts                     # What should I work on?
bun run task-suggest.ts --time 15           # I have 15 minutes
bun run task-suggest.ts --context phone     # Phone tasks only
bun run task-suggest.ts --quick-wins        # Easy momentum builders
```

### Assign Task
```bash
bun run task-assign.ts 123 --agent mario    # Assign to Mario (Engineer)
bun run task-assign.ts 123 --agent bill     # Assign to Bill (Architect)
```

---

## Multi-Agent Team

| Agent | ID | Role | Use For |
|-------|-----|------|---------|
| **Bob** | 3 | Orchestrator | Overall strategy, coordination |
| **Bill** | 4 | Architect | System design, planning |
| **Mario** | 5 | Engineer | Implementation, coding |
| **Riker** | 6 | Researcher | Investigation, discovery |
| **Howard** | 7 | Designer | UX, content, communication |
| **Homer** | 40 | Strategist | Long-term strategy, ethics |

---

## Credits

- **Vikunja**: Open source task management
- **Original TaskMan**: Wally Kroeker
- **Consolidation**: Simplified from bob-taskman-skill + bob-vikunja-skill

---

## Changelog

### 1.0.0 - 2026-01-06
- Initial release
- Consolidated bob-taskman-skill and bob-vikunja-skill
- Direct Vikunja API (no MCP server)
- No SQLite cache (always fresh)
- ADHD-optimized suggestions
- Multi-agent assignment support

