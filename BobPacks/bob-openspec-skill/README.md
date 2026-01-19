---
name: bob-openspec-skill
version: 1.0.0
author: Bob Prime (Wally Kroeker)
description: Spec-driven development using OpenSpec CLI for AI-assisted project specifications
type: skill
dependencies:
  - pai-core-install
  - npm package @fission-ai/openspec
requires:
  - Node.js and npm
  - OpenSpec CLI (@fission-ai/openspec)
---

# Openspec Skill

**Spec-Driven Development (SDD) through AI-assisted project specifications.**

## Problem

Building complex projects without clear specifications leads to:
- Misalignment between intent and implementation
- Scope creep and feature drift
- Difficulty tracking changes and rationale
- Poor AI collaboration due to unclear requirements
- No structured workflow for proposal → definition → implementation

Traditional documentation approaches are either:
- Too rigid (formal specs that become outdated)
- Too loose (README files that lack structure)
- Not AI-friendly (no standard format for AI agents to consume)

## Solution

**OpenSpec** by Fission-AI provides a structured workflow where AI coding assistants and humans collaborate on project specifications *before* code implementation. This skill wraps the OpenSpec CLI and adds AI-native workflows for:

1. **Proposal Creation** - AI generates structured change proposals
2. **Task Breakdown** - Specifications are decomposed into actionable tasks
3. **Implementation Tracking** - Code changes are tied to their specifications
4. **Spec Archival** - Completed changes are merged into project documentation

### Workflow

```
Proposal → Definition → Implementation → Archive
```

Each change lives in `openspec/changes/<change-id>/` with:
- `proposal.md` - Rationale and description
- `tasks.md` - Step-by-step implementation plan
- Spec updates specific to the change

## Architecture

### OpenSpec CLI Integration

The skill provides AI-accessible wrappers around:

```bash
openspec init              # Initialize project
openspec list              # List active changes
openspec validate <id>     # Validate spec integrity
openspec archive <id>      # Merge and archive change
```

### Skill Workflows

| Workflow | Purpose | CLI Command |
|----------|---------|-------------|
| **InitializeProject** | Create openspec/ directory | `openspec init` |
| **CreateProposal** | Scaffold new change proposal | Manual (AI-driven) |
| **ListSpecs** | Show active specifications | `openspec list` |
| **ReadSpec** | Display spec contents | File read |
| **ValidateSpec** | Check spec integrity | `openspec validate` |
| **ArchiveSpec** | Finalize completed change | `openspec archive` |

### AI-Driven Proposal Creation

**Critical:** The OpenSpec CLI has no `create` command. The skill handles proposal scaffolding:

1. Create `openspec/changes/<change-id>/` directory
2. Generate `proposal.md` from template
3. Generate `tasks.md` with initial structure
4. AI iterates on content with user

### Directory Structure

```
project/
└── openspec/
    ├── changes/           # Active change proposals
    │   └── my-feature/
    │       ├── proposal.md
    │       └── tasks.md
    └── specs/             # Archived project specs
```

## Use Cases

**Example 1: Start a new feature**
```
User: "Create a spec for user authentication"
→ CreateProposal workflow
→ AI scaffolds openspec/changes/auth-system/
→ Generates proposal.md and tasks.md
→ User reviews and refines
```

**Example 2: Implement from spec**
```
User: "Implement the auth system spec"
→ ReadSpec workflow reads tasks.md
→ AI executes implementation steps
→ ArchiveSpec workflow merges to project docs
```

**Example 3: Track active work**
```
User: "What specs are in progress?"
→ ListSpecs workflow
→ Returns active change IDs with status
```

## Benefits

1. **Structured Collaboration** - Clear proposal → implementation workflow
2. **Change Tracking** - Every change has documented rationale
3. **AI-Friendly** - Markdown format optimized for AI consumption
4. **Version Control** - Specs live in repository alongside code
5. **Archival** - Completed changes become project documentation

## Installation

See `INSTALL.md` for step-by-step installation instructions.

## Verification

See `VERIFY.md` for mandatory verification checklist.
