---
name: Bob TaskMan Skill
pack-id: bob-taskman-skill-v2.0.1
version: 2.0.1
author: wally-kroeker
description: Intelligent task orchestrator integrating with Vikunja MCP server. Routes tasks, manages priorities, and handles workflows with ADHD-optimized task suggestions.
type: skill
platform: claude-code
dependencies:
  - vikunja MCP server (HTTP server at walub.kroeker.fun:8080)
  - bob-vikunja-skill (recommended - technical reference)
keywords: [taskman, vikunja, tasks, orchestration, workflow, mcp, adhd, sqlite, cache]
---

# Bob TaskMan Skill

> Intelligent task orchestration with Vikunja MCP integration and local SQLite caching

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Skill Definition | `src/skills/taskman/SKILL.md` | Complete skill documentation (1100+ lines) |
| Data Structure | `src/skills/taskman/DATA_STRUCTURE.md` | Database schema and data model |
| Quick Reference | `src/skills/taskman/QUICK_REFERENCE.md` | Common patterns and queries |
| Diagrams | `src/skills/taskman/DIAGRAMS.md` | Visual architecture reference |
| Scripts | `src/skills/taskman/scripts/` | TypeScript utilities for cache sync and queries |

**Summary:**
- **Files created:** 5 documentation files + 4 TypeScript scripts
- **Dependencies:** Vikunja MCP server, bob-vikunja-skill (recommended)
- **Runtime:** Bun (TypeScript execution)

---

## The Problem

Managing tasks through Vikunja MCP has several challenges:
- **API Latency** - Every query hits the remote API
- **Complex Filtering** - MCP tools don't support multi-label AND queries
- **ADHD Support** - Need context-aware task suggestions based on time/energy
- **Natural Language** - Users want to say "by end of weekend" not ISO dates

---

## The Solution

TaskMan provides an intelligent task orchestration layer:

### Architecture

```
User Input (Natural Language)
    ↓
Claude Code (TaskMan Skill)
    ↓
┌─────────────────┬──────────────────┐
│                 │                  │
│   MCP Tools     │   SQLite Cache   │
│  (Write Ops)    │   (Read Ops)     │
│                 │                  │
│  Vikunja API    │  ~/.claude/      │
│                 │  skills/taskman/ │
│                 │  data/taskman.db │
└─────────────────┴──────────────────┘
```

### Key Features

1. **Local SQLite Cache** - Fast queries without API calls
2. **Natural Language Dates** - "tomorrow", "end of weekend", "next Friday"
3. **ADHD-Optimized Suggestions** - Time-of-day aware, momentum-building
4. **Project Routing** - Smart categorization based on keywords
5. **Label-Based Filtering** - Time estimates, locations, work types

### TypeScript Scripts

| Script | Purpose |
|--------|---------|
| `sync-projects.ts` | Fetch Vikunja projects to markdown hierarchy |
| `sync-cache.ts` | Full SQLite cache sync from Vikunja API |
| `cleanup.ts` | Migration utilities (archive, delete labels, verify, stats) |
| `query.ts` | Time-constrained ADHD task queries |

---

## Activation Triggers

Bob activates this skill when user mentions:

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

---

## Prerequisites

- **Claude Code** (or compatible AI agent system)
- **PAI Core** installed (`kai-core-install` pack)
- **Bun** runtime installed (for TypeScript scripts)
- **Vikunja MCP Server** configured

---

## Installation

See [INSTALL.md](INSTALL.md) for step-by-step instructions.

**Quick Install:**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cp -r src/skills/taskman "$PAI_DIR/skills/"
cd "$PAI_DIR/skills/taskman/scripts"
bun install
```

---

## Verification

See [VERIFY.md](VERIFY.md) for the complete verification checklist.

**Quick Test:**
```bash
# Check skill exists
ls -la "$PAI_DIR/skills/taskman/SKILL.md"

# Test cache sync
cd "$PAI_DIR/skills/taskman/scripts"
bun run sync-cache.ts

# Test query
bun run query.ts quick
```

---

## Works Well With

- **bob-vikunja-skill** (recommended) - Technical MCP reference
- **kai-core-install** (required) - Skill routing and identity
- **bob-telos-skill** (optional) - Strategic goal alignment

---

## Script Usage

### Sync Cache
```bash
bun run sync-cache.ts
# Syncs all tasks, projects, labels from Vikunja to local SQLite
```

### Sync Projects
```bash
bun run sync-projects.ts
# Updates project-hierarchy.md file
```

### Query Tasks
```bash
bun run query.ts quick          # 5-15 min tasks
bun run query.ts phone 15       # Phone tasks ≤15 min
bun run query.ts desk 30        # Computer tasks ≤30 min
bun run query.ts wins           # Quick wins (5 min only)
bun run query.ts custom "SQL"   # Custom SQL query
```

### Cleanup/Migration
```bash
bun run cleanup.ts move-archive    # Move tasks to Archive project
bun run cleanup.ts delete-labels   # Delete deprecated labels
bun run cleanup.ts verify          # Verify migration status
bun run cleanup.ts stats           # Show statistics
```

---

## Credits

- **Vikunja MCP**: democratize-technology
- **Bob Customization**: Wally Kroeker

---

## Changelog

### 2.0.1 - 2026-01-05
- **Fixed:** Replaced `better-sqlite3` with `bun:sqlite` for Bun compatibility
- Scripts now work natively with Bun without external SQLite dependencies
- Removed `better-sqlite3` and `@types/better-sqlite3` from package.json

### 2.0.0 - 2026-01-05
- Converted all shell scripts to TypeScript/Bun
- Added package.json for dependency management
- Enhanced README with architecture diagram
- Comprehensive INSTALL.md and VERIFY.md
- Single task creation by default (no auto-breakdown)
- TimeEstimate labels (5min, 15min, 30min, 60min+)

### 1.0.0 - 2025-11-07
- Initial release with shell scripts
- SQLite cache implementation
- ADHD-optimized task suggestions
