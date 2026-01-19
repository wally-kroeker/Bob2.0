# Changelog - BobiverseAgents Skill

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] - 2026-01-12

### Added

#### Observability Integration
- **PersonaFactory marker injection**: `PersonaFactory.ts` now injects `[AGENT_INSTANCE: AgentName-timestamp]` markers at the start of every composed agent prompt
  - Marker format: `[AGENT_INSTANCE: Mario-1768255222931]`
  - Enables observability system to track which named agent is executing
  - Marker is extracted by existing `metadata-extraction.ts` hook (no upstream changes)

- **Observability server enhancement**: Modified `file-ingest.ts` in observability server to extract agent names from `agent_instance_id` field
  - Location: `Packs/pai-observability-server/src/observability/apps/server/src/file-ingest.ts`
  - Extracts "Mario" from "Mario-1768255222931" marker
  - Dashboard now shows "Bill", "Mario", "Riker" instead of generic "general-purpose"
  - Non-breaking: falls back to existing behavior for non-Bobiverse agents

#### Enforcement Hook
- **New PreToolUse hook**: `src/hooks/enforce-persona-factory.ts`
  - Fires before Task tool execution
  - Detects if Task description/prompt mentions Bobiverse agent names (Bill, Mario, Riker, Howard, Homer, Hugh, Bender, Ick)
  - Blocks execution (exit 2) if agent name detected WITHOUT `[AGENT_INSTANCE: ...]` marker
  - Provides clear error message with remediation steps
  - Fail-safe design: errors exit 0 (allow) to never crash Claude Code
  - Only affects Task tool + Bobiverse names - does not interfere with generic agent spawns

- **Settings registration**: Hook registered in `~/.claude/settings.json` under `PreToolUse` → `Task` matcher
  - Additive change: new entry in hook array
  - No modification to existing upstream hooks

### Changed

#### Documentation Updates
- **CLAUDE.md enhancement**: Updated `~/.claude/CLAUDE.md` with explicit instructions to invoke BobiverseAgents skill
  - Before: Vague "use Agents skill with AgentFactory.ts"
  - After: Clear "invoke BobiverseAgents skill using Skill tool" with example
  - Prevents bypassing PersonaFactory with raw Task calls

- **README.md updates**:
  - Added enforcement hook to "What's Included" table
  - Added v1.1.0 changelog entry
  - Documented observability integration

### Technical Details

#### Files Modified (Source)
```
BobPacks/bob-bobiverse-agents-skill/
├── src/
│   ├── skills/BobiverseAgents/Tools/PersonaFactory.ts  # Added marker injection (lines 156-162)
│   └── hooks/enforce-persona-factory.ts                # NEW FILE (130 lines)
├── README.md                                           # Updated changelog + components table
└── CHANGELOG.md                                        # NEW FILE (this file)

Packs/pai-observability-server/
└── src/observability/apps/server/src/file-ingest.ts   # Added Bobiverse name extraction (lines 48-56)
```

#### Files Modified (Installed)
```
~/.claude/
├── skills/BobiverseAgents/Tools/PersonaFactory.ts     # Marker injection
├── hooks/enforce-persona-factory.ts                   # Enforcement hook
├── observability/apps/server/src/file-ingest.ts       # Name extraction
├── settings.json                                       # Hook registration (lines 49-57)
└── CLAUDE.md                                           # Skill invocation instructions

~/.claude/MEMORY/agents/                                # Ready for future Agent Memory feature
```

#### Integration Points

**Marker Injection Flow:**
```
PersonaFactory.ts --persona mario --task "..." --output json
  ↓
Generates timestamp
  ↓
Injects [AGENT_INSTANCE: Mario-1768255222931] at start of prompt
  ↓
Returns JSON with marker-enhanced prompt
  ↓
Task tool spawns agent with marker
  ↓
PreToolUse hook captures agent_instance_id
  ↓
Observability server extracts "Mario" from marker
  ↓
Dashboard displays "Mario" instead of "general-purpose"
```

**Enforcement Flow:**
```
User says: "Get Mario to deploy this"
  ↓
BobiverseAgents skill invoked
  ↓
PersonaFactory.ts composes prompt with marker
  ↓
Task tool call triggered
  ↓
PreToolUse hook fires: enforce-persona-factory.ts
  ↓
Hook detects "Mario" in description
  ↓
Hook verifies [AGENT_INSTANCE: ...] marker present
  ↓
✅ Allow (exit 0) - proper invocation
```

**Bypass Prevention:**
```
Raw Task call: description="Mario - test", prompt="You are Mario..."
  ↓
PreToolUse hook fires: enforce-persona-factory.ts
  ↓
Hook detects "Mario" in description
  ↓
Hook checks for [AGENT_INSTANCE: ...] marker
  ↓
❌ Marker NOT found
  ↓
Block (exit 2) with error message:
  "BLOCKED: Bobiverse agent 'Mario' requires PersonaFactory"
  "TO FIX: Use BobiverseAgents skill workflow..."
```

### Why These Changes

**Problem Identified:**
- Agents were spawning without PersonaFactory (bypassing skill workflow)
- Result: "Personality-less shells" - agents without full backstory, traits, voice config
- Observability dashboard showed all agents as "general-purpose"
- No way to track which named agent did what work

**Root Causes:**
1. CLAUDE.md instructions were vague about HOW to invoke named agents
2. No enforcement mechanism prevented raw Task calls
3. Observability system couldn't identify named agents from existing metadata
4. No marker in prompts to distinguish named agents from generic ones

**Solution Architecture:**
1. **Marker Injection** - PersonaFactory adds unique identifier to every agent prompt
2. **Observability Integration** - Dashboard extracts agent names from markers
3. **Enforcement Hook** - Blocks Task calls that bypass PersonaFactory for named agents
4. **Documentation** - Clear instructions prevent accidental bypass

### Backward Compatibility

✅ **Fully backward compatible:**
- Generic agent spawns (no Bobiverse names) are unaffected
- Existing hooks continue to function normally
- Observability falls back to existing behavior for non-Bobiverse agents
- Hook only activates for Bobiverse agent names

✅ **No upstream modifications:**
- Enforcement hook is a new file in BobPack (not upstream)
- Settings.json changes are additive (new hook entry in array)
- Observability changes are in pack source (user controls updates)

### Testing

**Verification performed:**
- ✅ Mario spawned via BobiverseAgents skill shows as "Mario" in observability
- ✅ Hook blocks raw Task("Mario - test") without marker (exit 2)
- ✅ Hook allows Task with [AGENT_INSTANCE: Mario-...] marker (exit 0)
- ✅ Hook allows generic Task calls without Bobiverse names (exit 0)
- ✅ Hook fails safe on error (exit 0, never crashes Claude Code)

**Test Cases:**
```bash
# Test 1: Valid PersonaFactory invocation (should succeed)
bun run PersonaFactory.ts --persona mario --task "test" | jq -r '.prompt' | grep "AGENT_INSTANCE"
# Result: ✅ Marker present

# Test 2: Hook blocks bypass attempt (should block)
echo '{"tool_name":"Task","tool_input":{"description":"Mario - test"}}' | bun run enforce-persona-factory.ts
# Result: ✅ Exit 2, error message displayed

# Test 3: Hook allows marked agent (should allow)
echo '{"tool_name":"Task","tool_input":{"prompt":"[AGENT_INSTANCE: Mario-123] You are Mario"}}' | bun run enforce-persona-factory.ts
# Result: ✅ Exit 0

# Test 4: Generic agent unaffected (should allow)
echo '{"tool_name":"Task","tool_input":{"description":"Generic task"}}' | bun run enforce-persona-factory.ts
# Result: ✅ Exit 0
```

### Future Enhancements

Documented in `FUTURE_ENHANCEMENTS.md`:
- **Agent Memory System** - Persistent memory files for each agent (memories.md, inside-jokes.md, learnings.md)
- **Bob Moot System** - Multi-agent convening for group discussion and consensus
- Both features leverage the observability infrastructure added in this release

---

## [1.0.0] - 2026-01-11

### Added
- Initial release of BobiverseAgents skill
- 9 named Bobiverse agent personas (5 built-in, 3 external)
- PersonaFactory.ts for trait composition from Personas.yaml
- Canonical backstories and personality traits for each agent
- Integration with pai-agents-skill AgentFactory.ts for trait system
- Workflows for spawning built-in (Task tool) and external (spawn-agent.sh) agents
- Voice configuration for each agent persona

### Components
- `SKILL.md` - Skill routing and trigger patterns
- `PersonaFactory.ts` - Agent composition tool
- `Personas.yaml` - Agent definitions with backstories, traits, voice mappings
- `ListPersonas.md` - Workflow to display available agents
- `SpawnBuiltInAgent.md` - Claude Code subagent workflow
- `SpawnExternalAgent.md` - External CLI agent workflow
- `README.md` - Pack documentation and usage examples
- `INSTALL.md` - AI-assisted installation wizard
- `VERIFY.md` - Installation verification checklist

### Agent Roster
**Built-in:** Bill (4), Mario (5), Riker (6), Howard (7), Homer (40)
**External:** Hugh (8), Bender (9), Ick (10)

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles:
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

Version format: [MAJOR.MINOR.PATCH]
- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes, backward compatible
