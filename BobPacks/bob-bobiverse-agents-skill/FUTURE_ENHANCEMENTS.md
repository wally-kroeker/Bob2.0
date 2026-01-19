# BobiverseAgents - Future Enhancements

**Architect**: Bill (Bob-4)
**Date**: 2026-01-12
**Status**: Planned - awaiting implementation

---

## Feature 1: Agent Memory System

### Overview
Each Bobiverse agent gets persistent memory to enable relationship continuity and inside jokes across sessions.

### Proposed Structure
```
~/.claude/MEMORY/agents/
├── bill/
│   ├── memories.md          # Timestamped session entries
│   ├── inside-jokes.md      # Callbacks and humor
│   ├── learnings.md         # Technical insights
│   └── relationships.md     # Working style notes
├── mario/
├── riker/
├── howard/
├── homer/
├── hugh/
├── bender/
├── ick/
└── README.md
```

### Implementation Approach
1. PersonaFactory.ts gets `--load-memory` flag
2. Agent spawns with previous memories injected into prompt
3. Agent saves notable moments at end of task
4. Next spawn loads those memories

### Memory File Formats

**memories.md:**
```markdown
## 2026-01-12 14:30 - [Task Title]
**Context**: [Brief task description]
**What I Did**: [Summary]
**Notable**: [Worth remembering]
**Outcome**: [Result]
```

**inside-jokes.md:**
```markdown
## The Chords Incident
**Date**: 2026-01-10
**Context**: [What happened]
**Usage**: [When to reference]
**Example**: [How to use it]
```

### Open Design Questions
1. Memory retention: Permanent vs rolling 90-day vs user-curated?
2. Privacy: Avoid recording client details, financials?
3. Format: Structured markdown vs free-form?
4. Size limits: Unlimited vs cap at 50KB per file?

### Files to Modify
- `Tools/PersonaFactory.ts` - Add `--load-memory` flag
- `Data/Personas.yaml` - Add memory protocol instructions

---

## Feature 2: Bob Moot System

### Overview
From the Bobiverse books - all agents convene for group discussion, reach consensus, and provide collective advice.

### Proposed Flow
1. User: "Convene a moot on X"
2. Bob Prime spawns 5-8 agents in parallel (Round 1)
3. Each agent provides perspective from their expertise
4. Bob Prime synthesizes, identifies tensions
5. Agents respond to each other (Round 2)
6. Final consensus with dissenting opinions

### New Files Required
```
Workflows/ConveneMoot.md       # Moot orchestration workflow
Tools/MootOrchestrator.ts      # Automation helper
~/.claude/MEMORY/moots/        # Moot session history
```

### Moot Output Format
```markdown
# Bob Moot Session: [Topic]
**Date**: 2026-01-12
**Participants**: Bill, Mario, Riker, Howard, Homer

## Round 1: Initial Perspectives
[Each agent's take]

## Bob Prime's Synthesis
[Areas of consensus, key tensions]

## Round 2: Deliberation
[Agents respond to each other]

## Final Consensus
**RECOMMENDATION**: [Decision]
**CONFIDENCE**: 8/10
**DISSENTING OPINION**: [Minority position]
```

### Open Design Questions
1. Moot frequency: Major decisions only vs any complex question?
2. Participants: Always full roster vs task-specific subset?
3. Tiebreaker: Bob Prime vs Wally vs escalate to research?
4. Output: Save to MEMORY? Create Vikunja task? Generate PRD?

### Technical Considerations
- Token costs: 8 agents x 2 rounds = 16 invocations (use sonnet to manage)
- Context limits: Summarize Round 1 for Round 2 prompts
- Execution time: ~5-10 minutes for full moot (consider background execution)

---

## Implementation Phases

### Phase 1: Agent Memory Foundation
- Create directory structure
- Update PersonaFactory.ts with --load-memory
- Test with Bill and Mario

### Phase 2: Memory Rollout
- Extend to all 9 agents
- Validate usability
- Document best practices

### Phase 3: Moot Prototype
- Manual moot orchestration by Bob Prime
- Validate concept works
- Document pain points

### Phase 4: Moot Automation
- Create ConveneMoot.md workflow
- Build MootOrchestrator.ts
- Add to SKILL.md routing

### Phase 5: Integration
- Agent memory enhances moot quality
- Moots create shared experiences
- Positive feedback loop

---

## Cross-Feature Integration

When both features are implemented:
- Agents reference previous moots in discussions
- Inside jokes appear in moot debates
- Moot outcomes saved to agent memory files
- Demonstrated continuity across sessions

---

## No Hard Blockers

Existing PAI infrastructure handles 80% of needs:
- Task tool supports parallel agent spawning
- MEMORY system provides storage patterns
- PersonaFactory already composes agent prompts
- Observability tracks agent instances

---

*Architecture by Bill (The Architect) - "Before we write a single line, let's diagram the component dependencies."*
