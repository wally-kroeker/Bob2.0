# BobiverseAgents Skill - Verification Checklist

This checklist verifies that the BobiverseAgents skill is correctly installed and functional.

## File Existence Checks

### Core Skill Files

Run these checks to verify all files are in place:

```bash
# Main skill definition
test -f $PAI_DIR/skills/BobiverseAgents/SKILL.md && echo "✓ SKILL.md" || echo "✗ SKILL.md MISSING"

# Data files
test -f $PAI_DIR/skills/BobiverseAgents/Data/Personas.yaml && echo "✓ Personas.yaml" || echo "✗ Personas.yaml MISSING"

# Tools
test -f $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts && echo "✓ PersonaFactory.ts" || echo "✗ PersonaFactory.ts MISSING"

# Workflows
test -f $PAI_DIR/skills/BobiverseAgents/Workflows/ListPersonas.md && echo "✓ ListPersonas.md" || echo "✗ ListPersonas.md MISSING"
test -f $PAI_DIR/skills/BobiverseAgents/Workflows/SpawnBuiltInAgent.md && echo "✓ SpawnBuiltInAgent.md" || echo "✗ SpawnBuiltInAgent.md MISSING"
test -f $PAI_DIR/skills/BobiverseAgents/Workflows/SpawnExternalAgent.md && echo "✓ SpawnExternalAgent.md" || echo "✗ SpawnExternalAgent.md MISSING"
```

**Expected Result**: All files show ✓ checkmarks.

### Directory Structure

```bash
# Verify directory structure
test -d $PAI_DIR/skills/BobiverseAgents/Data && echo "✓ Data/" || echo "✗ Data/ MISSING"
test -d $PAI_DIR/skills/BobiverseAgents/Tools && echo "✓ Tools/" || echo "✗ Tools/ MISSING"
test -d $PAI_DIR/skills/BobiverseAgents/Workflows && echo "✓ Workflows/" || echo "✗ Workflows/ MISSING"
```

**Expected Result**: All directories exist.

## Functional Tests

### Test 1: List Personas

Verify PersonaFactory.ts can list all 9 personas:

```bash
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas
```

**Expected Output**: Should display 9 personas with details:

```
Available Personas:
==================

1. Bob Prime (ID: 3) - Built-in
   Role: Master Coordinator
   Backstory: Original Bob (Bob-1), conscientious & careful...
   Communication: "I see we're ignoring physics again today..."

2. Bill (ID: 4) - Built-in
   Role: The Architect
   Backstory: Bob-3 from Epsilon Eridani, runs Skunk Works...
   Communication: "Let me break this into phases..."

[... continues for all 9 agents ...]
```

**Verification**: Count the personas listed. Must be exactly 9 (Bob Prime, Bill, Mario, Riker, Howard, Homer, Hugh, Bender, Ick).

### Test 2: Get Specific Persona

Verify PersonaFactory can retrieve a specific persona by name:

```bash
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --persona "Bill"
```

**Expected Output**: Should display Bill's persona details:

```json
{
  "name": "Bill",
  "id": 4,
  "type": "built-in",
  "role": "The Architect",
  "traits": ["technical", "analytical", "systematic"],
  "backstory": "...",
  "communication_style": "...",
  "when_to_use": [...],
  "voice": {...}
}
```

### Test 3: Get Persona by ID

```bash
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --id 6
```

**Expected Output**: Should display Riker's persona details (ID 6).

### Test 4: SKILL.md Frontmatter

Verify SKILL.md has valid YAML frontmatter:

```bash
head -20 $PAI_DIR/skills/BobiverseAgents/SKILL.md | grep -E "(name:|USE WHEN)"
```

**Expected Output**: Should show:
```
name: BobiverseAgents
USE WHEN:
```

## Integration Tests

### Test 5: Skill Triggering

Test that the skill can be invoked from Claude Code conversation:

**Test Command**: In Claude Code, say:
```
"List available Bobiverse personas"
```

**Expected Behavior**:
- Skill routes to ListPersonas workflow
- Executes PersonaFactory.ts --list-personas
- Returns formatted list of 9 agents

**Verification**: All 9 personas are listed with roles and brief descriptions.

### Test 6: Built-in Agent Spawning (if pai-agents-skill installed)

**Test Command**: In Claude Code, say:
```
"Spawn Bill to analyze the BobiverseAgents pack structure"
```

**Expected Behavior**:
- Routes to SpawnBuiltInAgent workflow
- Composes Bill's personality using AgentFactory.ts
- Spawns Claude subagent via Task tool with Bill's traits
- Agent responds in Bill's communication style

**Verification**: Agent response includes Bill's analytical, systematic approach and references "phases" or "constraints."

### Test 7: External Agent Spawning (if bob-external-agents-skill installed)

**Test Command**: In Claude Code, say:
```
"Spawn Bender to investigate something"
```

**Expected Behavior**:
- Routes to SpawnExternalAgent workflow
- Calls spawn-agent.sh with Bender's traits
- Spawns Gemini CLI agent in background
- Returns task ID

**Verification**: External agent spawns successfully (check with `check-agents.sh list` from ExternalAgents skill).

## Dependency Checks

### Check pai-agents-skill Integration

```bash
# Verify AgentFactory.ts exists (required dependency)
test -f $PAI_DIR/skills/Agents/Tools/AgentFactory.ts && echo "✓ AgentFactory available" || echo "✗ AgentFactory MISSING"

# Test AgentFactory directly
bun run $PAI_DIR/skills/Agents/Tools/AgentFactory.ts --list
```

**Expected Output**: AgentFactory lists available traits (10 expertise, 10 personality, 8 approach).

### Check External Agents Integration (Optional)

```bash
# Verify ExternalAgents skill (if installed)
test -f $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh && echo "✓ ExternalAgents available" || echo "✗ ExternalAgents not installed (optional)"

# Check external CLIs (optional)
which claude && echo "✓ Claude CLI available" || echo "✗ Claude CLI not installed"
which gemini && echo "✓ Gemini CLI available" || echo "✗ Gemini CLI not installed"
npx codex --version && echo "✓ Codex available" || echo "✗ Codex not installed"
```

**Note**: External CLIs are optional. If missing, only built-in agents (Bill, Mario, Riker, Howard, Homer) will work.

## Persona Data Validation

### Verify All Personas in YAML

```bash
# Count personas in Personas.yaml
grep "^  name:" $PAI_DIR/skills/BobiverseAgents/Data/Personas.yaml | wc -l
```

**Expected Output**: `9` (9 personas defined)

### Check Required Fields

```bash
# Verify each persona has required fields
grep -E "(name:|id:|type:|role:|traits:|backstory:)" $PAI_DIR/skills/BobiverseAgents/Data/Personas.yaml | head -30
```

**Expected Output**: Should show structured YAML with all required fields present.

## Voice Configuration (Optional)

If using voice notifications:

```bash
# Check voice config file
test -f $PAI_DIR/config/voice-personalities.json && echo "✓ Voice config exists" || echo "✗ Voice config missing (optional)"

# Verify persona voices are mapped
if [ -f $PAI_DIR/config/voice-personalities.json ]; then
  cat $PAI_DIR/config/voice-personalities.json | grep -E "(bob|bill|mario|riker|howard|homer|hugh|bender|ick)"
fi
```

**Expected Output**: If configured, should show voice mappings for persona names.

## Troubleshooting

### Problem: PersonaFactory.ts fails with "Cannot find module"

**Diagnosis**:
```bash
# Check if Bun is installed
bun --version

# Check if file is executable
ls -l $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts
```

**Solution**: Install Bun or fix permissions:
```bash
chmod +x $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts
```

### Problem: "AgentFactory not found" error

**Diagnosis**:
```bash
# Check if pai-agents-skill is installed
test -f $PAI_DIR/skills/Agents/Tools/AgentFactory.ts && echo "Installed" || echo "NOT INSTALLED"
```

**Solution**: Install pai-agents-skill first (required dependency).

### Problem: Skill doesn't trigger from conversation

**Diagnosis**:
```bash
# Check SKILL.md frontmatter
head -30 $PAI_DIR/skills/BobiverseAgents/SKILL.md

# Look for "USE WHEN" triggers
grep "USE WHEN" $PAI_DIR/skills/BobiverseAgents/SKILL.md -A 5
```

**Solution**: Verify triggers match your request. Try explicit: "Use BobiverseAgents to list personas"

### Problem: External agents don't spawn

**Diagnosis**:
```bash
# Check if ExternalAgents skill is installed
test -f $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh && echo "Installed" || echo "NOT INSTALLED"

# Check CLI availability
which claude gemini
npx codex --version
```

**Solution**:
- Install bob-external-agents-skill
- Install required external CLIs
- **Note**: External agents are optional. Built-in agents work without them.

## Success Criteria

Mark this verification complete when ALL of the following are true:

- [ ] All core files exist (SKILL.md, Personas.yaml, PersonaFactory.ts, workflows)
- [ ] PersonaFactory.ts --list-personas shows 9 agents
- [ ] Specific persona retrieval works (Bill, Mario, etc.)
- [ ] SKILL.md has valid frontmatter
- [ ] Skill triggers from Claude Code conversation
- [ ] Built-in agent spawning works (uses pai-agents-skill)
- [ ] pai-agents-skill dependency is satisfied (AgentFactory.ts found)
- [ ] (Optional) External agents spawn if bob-external-agents-skill installed
- [ ] (Optional) Voice configuration present if using TTS

## Post-Verification

After successful verification:

1. **Read persona backstories**: See agent-personas.md for full canonical definitions
2. **Try multi-agent patterns**: Sequential pipeline, parallel specialization, hybrid external+built-in
3. **Explore delegation decision tree**: When to use which agent (README.md)
4. **Configure voice personalities**: Map agent names to TTS voices (optional)

## Verification Report

After running all checks, generate a summary:

```bash
echo "=== BobiverseAgents Verification Summary ==="
echo "Files: $(find $PAI_DIR/skills/BobiverseAgents -type f | wc -l) files"
echo "Personas: $(bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas 2>/dev/null | grep "^[0-9]" | wc -l) personas"
echo "AgentFactory: $(test -f $PAI_DIR/skills/Agents/Tools/AgentFactory.ts && echo "Available" || echo "MISSING")"
echo "ExternalAgents: $(test -f $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh && echo "Available" || echo "Not installed (optional)")"
echo "Bun: $(bun --version 2>/dev/null || echo "NOT INSTALLED")"
```

**Expected Output**:
```
=== BobiverseAgents Verification Summary ===
Files: 6 files
Personas: 9 personas
AgentFactory: Available
ExternalAgents: Available
Bun: 1.x.x
```

---

**Installation Status**: ✓ Complete once all success criteria are met

**Time to Verify**: ~2-3 minutes

**Next Steps**: Try spawning agents and exploring multi-agent collaboration patterns
