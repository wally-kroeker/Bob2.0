---
name: Bob Vikunja Skill
pack-id: bob-vikunja-skill-v1.0.1
version: 1.0.1
author: wally-kroeker
description: Technical reference for Vikunja MCP integration. Documents MCP tools, database queries, 3-tier query strategy, and AI task breakdown workflow.
type: skill
platform: claude-code
dependencies:
  - kai-core-install
  - bob-taskman-skill (recommended - handles user-facing queries)
keywords: [vikunja, mcp, tasks, reference, api, database, n8n, ai-breakdown, adhd]
---

# Bob Vikunja Skill

> Technical reference documentation for Vikunja task management infrastructure

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Skill Definition | `src/skills/Vikunja/SKILL.md` | Complete technical reference (600+ lines) |
| Deprecated Scripts | `src/skills/Vikunja/scripts.deprecated/` | Legacy TypeScript tools (replaced by MCP) |

**Summary:**
- **Files created:** 1 (SKILL.md with comprehensive documentation)
- **Dependencies:** kai-core-install, bob-taskman-skill (recommended)
- **External Requirements:** Vikunja MCP server, SSH access to taskman host

---

## The Problem

Vikunja task management requires understanding multiple integration layers:
- **MCP Tools** - For standard CRUD operations
- **Database Queries** - For complex filtering beyond MCP capabilities
- **AI Task Breakdown** - N8N workflow that auto-generates subtasks
- **ID Confusion** - API IDs vs display identifiers (#172 vs 310)

Without a central reference, Bob has to re-learn these patterns each session. The `taskman` skill handles user queries, but needs technical details for implementation.

---

## The Solution

A comprehensive reference skill providing:

### 3-Tier Query Strategy

| Tier | Method | Use Case |
|------|--------|----------|
| 1 | MCP Tools | CRUD, simple search, <50 tasks |
| 2 | Database Queries | Parent tasks, multi-label AND, complex SQL |
| 3 | Deprecated Scripts | ⛔ Don't use - replaced by Tier 1 & 2 |

### Key Documentation Sections

- **MCP Tool Reference** - All available tools with examples
- **Database Query Script** - `vikunja-db-query.sh` commands
- **AI Task Breakdown** - N8N workflow documentation
- **Critical Gotcha** - API ID vs Display ID resolution
- **Troubleshooting** - Common errors and solutions

---

## Important Note

**This skill does NOT activate on user task queries.**

The user-facing task management is handled by `bob-taskman-skill`. This skill provides the technical implementation details that `taskman` references when needed.

### Activation Triggers

Bob references this skill when:
- Debugging MCP connection issues
- Needing database query syntax
- Understanding AI task breakdown behavior
- Resolving API ID confusion
- Troubleshooting Vikunja integration

---

## Installation

See [INSTALL.md](INSTALL.md) for step-by-step instructions.

**Quick Install:**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cp -r src/skills/Vikunja "$PAI_DIR/skills/"
```

---

## External Requirements

This skill documents integration with external services:

| Service | URL | Purpose |
|---------|-----|---------|
| Vikunja | taskman.vrexplorers.com | Task management |
| N8N | n8n.vrexplorers.com | AI task breakdown workflow |
| MCP Server | walub.kroeker.fun:8080 | HTTP MCP server for API integration |

**Note:** The skill provides documentation only. Actual service configuration is separate.

---

## Verification

See [VERIFY.md](VERIFY.md) for the complete verification checklist.

**Quick Test:**
```bash
# Check skill exists
ls -la "$PAI_DIR/skills/Vikunja/SKILL.md"

# Verify MCP integration (if configured)
claude mcp list | grep vikunja
```

---

## Works Well With

- **bob-taskman-skill** (required) - Handles user-facing task queries
- **kai-core-install** (required) - Skill routing and identity

---

## Credits

- **Vikunja MCP**: democratize-technology
- **N8N Workflow**: Custom implementation
- **Bob Customization**: Wally Kroeker

---

## Changelog

### 1.0.1 - 2025-01-05
- Updated MCP configuration to use HTTP server (walub.kroeker.fun:8080)
- Changed from NPX-based MCP to HTTP MCP server architecture
- Updated all documentation to reflect new server location
- Added explicit mcpServers configuration examples

### 1.0.0 - 2025-01-05
- Initial release with upstream-compatible structure
- TitleCase directory naming (`Vikunja/` not `vikunja/`)
- Comprehensive SKILL.md with 3-tier query documentation
- Enhanced INSTALL.md and VERIFY.md
