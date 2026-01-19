---
name: Openspec
description: Spec-driven development using OpenSpec CLI for AI-assisted project specifications. USE WHEN user mentions openspec, project specs, spec-driven development, create specification, OR wants structured proposal workflow. Manages Proposal → Definition → Implementation → Archive lifecycle.
---

# Openspec

AI-assisted spec-driven development through the OpenSpec CLI. Create, manage, and archive structured project specifications using markdown-based change proposals.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **InitializeProject** | "initialize openspec", "set up openspec", "create openspec directory" | `Workflows/InitializeProject.md` |
| **CreateProposal** | "create spec", "new proposal", "openspec proposal", "spec for [feature]" | `Workflows/CreateProposal.md` |
| **ListSpecs** | "list specs", "show specs", "active changes", "what specs are open" | `Workflows/ListSpecs.md` |
| **ReadSpec** | "read spec", "show spec", "view [change-id]", "what's in the spec" | `Workflows/ReadSpec.md` |
| **ValidateSpec** | "validate spec", "check spec", "verify spec integrity" | `Workflows/ValidateSpec.md` |
| **ArchiveSpec** | "archive spec", "finalize spec", "merge spec", "complete [change-id]" | `Workflows/ArchiveSpec.md` |

## OpenSpec Lifecycle

```
1. Initialize → openspec init (creates openspec/ directory)
2. Propose → AI creates openspec/changes/<id>/proposal.md
3. Define → AI fills tasks.md with implementation steps
4. Implement → Execute tasks, track in spec
5. Archive → openspec archive <id> (merges to project docs)
```

## Examples

**Example 1: Start a new feature specification**
```
User: "Create an OpenSpec proposal for user authentication"
→ Invokes CreateProposal workflow
→ AI scaffolds openspec/changes/auth-system/
→ Generates proposal.md with feature description
→ Creates tasks.md with implementation breakdown
→ User reviews and AI iterates
```

**Example 2: Initialize OpenSpec in a project**
```
User: "Set up OpenSpec for this project"
→ Invokes InitializeProject workflow
→ Runs: openspec init
→ Creates openspec/ directory structure
→ Returns success confirmation
```

**Example 3: Track active specifications**
```
User: "What OpenSpec changes are in progress?"
→ Invokes ListSpecs workflow
→ Runs: openspec list
→ Returns formatted list of active change IDs
```

**Example 4: Review a specification**
```
User: "Show me the auth-system spec"
→ Invokes ReadSpec workflow
→ Reads openspec/changes/auth-system/proposal.md
→ Reads openspec/changes/auth-system/tasks.md
→ Displays formatted content
```

**Example 5: Complete and archive a specification**
```
User: "Archive the auth-system specification"
→ Invokes ArchiveSpec workflow
→ Runs: openspec archive auth-system
→ Merges spec to project documentation
→ Removes change from active directory
```

**Example 6: Validate specification integrity**
```
User: "Check if the auth-system spec is valid"
→ Invokes ValidateSpec workflow
→ Runs: openspec validate auth-system
→ Returns validation results
```
