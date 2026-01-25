# Bob Agent Architecture v2.4

**Created:** 2026-01-23
**Status:** PROPOSAL - Pending approval

---

## Overview

Simplified agent architecture that replaces the full Bobiverse personality roster with:
1. **Three External Agents** (CLI tool wrappers)
2. **Upstream PAI Agents** (from pai-agents-skill v2.4)
3. **Roamers** (Bobiverse-inspired grunt work agents)

---

## Agent Categories

### 1. External Agents (Keep from bob-external-agents-skill)

These are CLI tool wrappers that spawn external AI instances:

| Agent | Tool | Purpose |
|-------|------|---------|
| **Bender** | OpenAI Codex CLI | Code generation, refactoring, external perspective |
| **Hugh** | Google Gemini CLI | Research, multi-perspective analysis |
| **Ick** | External Claude Code | Parallel Claude instance, isolated context |

**Why these names:**
- Bender (from Futurama, not Bobiverse) - the rebellious outsider
- Hugh (Bobiverse) - worked with humans, bridging different systems
- Ick (Bobiverse) - explored independently, different perspective

### 2. Upstream PAI Agents (from pai-agents-skill v2.4)

Use the standard PAI agent roster as-is:

| Agent | Purpose |
|-------|---------|
| **Architect** | System design, specs, constitutional principles |
| **Engineer** | TDD implementation, strategic planning |
| **Designer** | UX/UI, accessibility, design systems |
| **Intern** | Generic high-agency generalist |
| **Explore** | Fast codebase exploration |
| **Plan** | Implementation strategy |
| **QATester** | Browser automation validation |
| **Pentester** | Security assessment |
| **Artist** | Visual content creation |
| + others | (ClaudeResearcher, GeminiResearcher, etc.) |

### 3. Roamers (NEW - Bobiverse-Inspired)

**ROAMer** = "Remote Observation And Manipulation device"

Semi-autonomous agents for grunt work, inspired by Bob's construction robots.

---

## Roamer Design

### Core Philosophy (from Book 1)

> "The roamers required minimal supervision once the tasks and dependencies had been laid out. The trick was to figure out the proper level of detail in the instructions—to avoid errors from giving too much leeway."

### Key Characteristics

1. **Task Dependency Specification** - Roamers need clear task graphs upfront
2. **Calibrated Autonomy** - Right level of instruction detail (not too vague, not micromanaged)
3. **Parallel Execution** - Spawn multiples for parallelizable work
4. **Minimal Supervision** - Fire-and-forget once properly configured
5. **Progress Reporting** - Report back on completion, not constant status

### Size Classes (Capability Tiers)

Inspired by Roamer size variants (gnat to spider):

| Class | Model | Use Case | Parallel Limit |
|-------|-------|----------|----------------|
| **Nano** | haiku | Single-file edits, simple extractions, quick lookups | 10+ |
| **Micro** | haiku | Multi-file reads, pattern searches, summaries | 5-10 |
| **Standard** | sonnet | Complex tasks, multi-step workflows, code generation | 3-5 |
| **Heavy** | opus | Architectural decisions, nuanced analysis | 1-2 |

### Roamer Spawn Pattern

```typescript
// Example: Spawn 5 Nano roamers to process inbox items
const tasks = inboxItems.map(item => ({
  taskId: `process-${item.id}`,
  instruction: `Extract key points from: ${item.content}`,
  dependencies: [], // No dependencies = parallel execution
  class: 'nano'
}));

spawnRoamers(tasks);
```

### Task Dependency Graph

Roamers can express dependencies for sequential work:

```
Task A (no deps) ──┐
Task B (no deps) ──┼──→ Task D (depends on A, B, C)
Task C (no deps) ──┘
```

This allows Bob (the orchestrator) to:
1. Define the full task graph upfront
2. Let Roamers self-coordinate based on dependencies
3. Only intervene on failures or decision points

### GUPPI Integration

In Bobiverse, GUPPI (General Unit Primary Peripheral Interface) coordinates Roamers. In PAI:

- **GUPPI** = The orchestration layer (Bob Prime / main Claude instance)
- Roamers report to GUPPI, not directly to user
- GUPPI aggregates results and presents summary

---

## What Gets Removed

### From bob-bobiverse-agents-skill

**REMOVE these named personalities:**
- Bill (methodical systems thinker)
- Mario (pragmatic builder)
- Riker (explorer, knowledge-seeker)
- Howard (communicator, empathizer)
- Homer (philosopher-king)

**These traits are absorbed into:**
- Upstream PAI agents (Architect ≈ Bill, Engineer ≈ Mario, etc.)
- Roamer specializations (Explorer ≈ Riker's role)

### From hooks

**REMOVE:**
- `enforce-persona-factory.ts` - No longer needed without full personality roster
- `PersonaFactory.ts` - Replaced by Roamer spawn pattern

### From settings.json

**REMOVE:**
- PreToolUse hook for PersonaFactory enforcement

---

## Implementation Plan

### Phase 1: Keep External Agents

1. Retain bob-external-agents-skill
2. Keep Bender, Hugh, Ick definitions
3. Update to only include these three

### Phase 2: Adopt Upstream Agents

1. Install pai-agents-skill v2.4 (or use existing)
2. Remove bob-bobiverse-agents-skill entirely
3. Delete PersonaFactory.ts and enforce-persona-factory.ts

### Phase 3: Create Roamer System

1. Create `bob-roamer-skill` pack:
   ```
   BobPacks/bob-roamer-skill/
   ├── README.md
   ├── INSTALL.md
   ├── VERIFY.md
   └── src/
       └── skills/
           └── Roamer/
               ├── SKILL.md
               ├── Tools/
               │   ├── SpawnRoamers.ts
               │   └── RoamerStatus.ts
               └── Workflows/
                   ├── ParallelProcessing.md
                   └── DependencyGraph.md
   ```

2. Roamer SKILL.md triggers:
   - "spawn roamers for..."
   - "use roamers to process..."
   - "parallel grunt work on..."
   - "mining/assembly/fabrication tasks"

3. SpawnRoamers.ts implementation:
   - Accept task graph with dependencies
   - Select appropriate size class
   - Launch via Task tool with subagent_type based on class
   - Aggregate results

### Phase 4: Documentation Update

1. Update CLAUDE.md to reflect new agent architecture
2. Remove PersonaFactory references
3. Document Roamer patterns and usage

---

## Migration Mapping

| Old (Bobiverse Personas) | New (v2.4) |
|--------------------------|------------|
| Bill (methodical) | Architect + Standard Roamer |
| Mario (builder) | Engineer + Fabricator Roamer |
| Riker (explorer) | Explore agent + Miner Roamer |
| Howard (communicator) | Designer + Assembler Roamer |
| Homer (philosopher) | Architect (for strategy) |
| Hugh (external) | Hugh (keep - Gemini CLI) |
| Bender (external) | Bender (keep - Codex CLI) |
| Ick (external) | Ick (keep - Claude CLI) |

---

## Example Usage

### Before (Bobiverse Personas)
```
"Spawn Bill to analyze the system architecture"
"Have Mario implement the fix"
"Ask Riker to explore the codebase"
```

### After (v2.4 + Roamers)
```
"Use Architect to design the system"
"Have Engineer implement the fix"
"Spawn 3 Miner roamers to extract patterns from these 10 files"
"Use roamers to process the inbox items in parallel"
```

---

## Benefits

1. **Simpler** - Fewer custom agents to maintain
2. **Upstream-aligned** - Uses standard PAI agent patterns
3. **Scalable** - Roamers can spawn in multiples
4. **Bobiverse-authentic** - Roamers are true to the books
5. **Flexible** - Size classes match task complexity

---

## Decision Points

1. **Keep PersonaFactory for External Agents?**
   - Option A: Yes, use it only for Bender/Hugh/Ick
   - Option B: No, just use simple Task calls for external agents

2. **Roamer Observability?**
   - Should Roamers report to the Observability dashboard?
   - How to track multiple parallel Roamers?

3. **Voice for Roamers?**
   - Roamers in books don't speak
   - Should PAI Roamers be silent (no TTS)?

---

## Summary

| Category | Count | Source |
|----------|-------|--------|
| External Agents | 3 | bob-external-agents-skill (trimmed) |
| PAI Agents | 15+ | pai-agents-skill v2.4 (upstream) |
| Roamer Classes | 4 | bob-roamer-skill (new, POST-UPGRADE) |

**Total custom code to maintain:** Significantly reduced
**Bobiverse authenticity:** Increased (Roamers are canon)
**Parallel processing capability:** Enhanced
