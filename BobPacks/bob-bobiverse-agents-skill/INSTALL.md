# BobiverseAgents Skill - Installation Guide

This guide walks through installing the BobiverseAgents skill pack into your PAI system.

## Pre-Installation System Check

### Required Dependencies

**MUST be installed first:**

1. **pai-core-install** (v1.0.0+)
   - Check: `test -f $PAI_DIR/skills/CORE/SKILL.md && echo "✓ CORE installed" || echo "✗ CORE missing"`

2. **pai-agents-skill** (v1.1.1+)
   - Check: `test -f $PAI_DIR/skills/Agents/Tools/AgentFactory.ts && echo "✓ Agents installed" || echo "✗ Agents missing"`
   - **CRITICAL**: This provides AgentFactory.ts trait composition system

3. **Bun runtime**
   - Check: `bun --version`
   - Install: `curl -fsSL https://bun.sh/install | bash`

### Optional Dependencies (for External Agents)

4. **bob-external-agents-skill** (recommended)
   - Check: `test -f $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh && echo "✓ ExternalAgents installed" || echo "✗ ExternalAgents missing"`
   - Needed for: Hugh (Codex), Bender (Gemini), Ick (Claude CLI)

5. **External CLIs** (optional)
   - Codex: `npx codex --version` (for Hugh)
   - Gemini: `gemini --version` (for Bender)
   - Claude: `claude --version` (for Ick)

### Environment Variables

Required environment variables (set these if not already configured):

```bash
export PAI_DIR="$HOME/.claude"  # Or your custom PAI directory
export DA="Bob"                  # Digital Assistant name
```

Verify:
```bash
echo "PAI_DIR: $PAI_DIR"
echo "DA: $DA"
test -d "$PAI_DIR" && echo "✓ PAI_DIR exists" || echo "✗ PAI_DIR missing"
```

## Installation Steps

### Step 1: Verify Prerequisites

Run all pre-installation checks above. If pai-agents-skill is missing, install it first:

```
"Install pai-agents-skill from /absolute/path/to/Packs/pai-agents-skill/"
```

### Step 2: Create Target Directory

```bash
mkdir -p $PAI_DIR/skills/BobiverseAgents/{Data,Tools,Workflows}
```

Verify:
```bash
test -d $PAI_DIR/skills/BobiverseAgents && echo "✓ Directory created" || echo "✗ Failed to create directory"
```

### Step 3: Copy Skill Files

Copy all files from the pack's `src/skills/BobiverseAgents/` directory:

```bash
# Copy SKILL.md
cp src/skills/BobiverseAgents/SKILL.md $PAI_DIR/skills/BobiverseAgents/

# Copy Data files
cp src/skills/BobiverseAgents/Data/*.yaml $PAI_DIR/skills/BobiverseAgents/Data/

# Copy Tools
cp src/skills/BobiverseAgents/Tools/*.ts $PAI_DIR/skills/BobiverseAgents/Tools/

# Copy Workflows
cp src/skills/BobiverseAgents/Workflows/*.md $PAI_DIR/skills/BobiverseAgents/Workflows/
```

**IMPORTANT**: Copy the ACTUAL files from `src/`, not code from markdown blocks. This is a directory-based pack (v2.0 format).

### Step 4: Verify File Permissions

Ensure tools are executable:

```bash
chmod +x $PAI_DIR/skills/BobiverseAgents/Tools/*.ts
```

### Step 5: Test PersonaFactory

Verify the tool works:

```bash
bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts --list-personas
```

Expected output: List of 9 personas (Bob Prime, Bill, Mario, Riker, Howard, Homer, Hugh, Bender, Ick)

### Step 6: Optional - Voice Configuration

If using voice notifications, configure persona voices in `$PAI_DIR/config/voice-personalities.json`:

```bash
# Check if voice config exists
test -f $PAI_DIR/config/voice-personalities.json && echo "✓ Voice config exists" || echo "✗ Voice config missing"
```

Add persona voice mappings (see README.md for full example):

```json
{
  "voices": {
    "bob": { "voice_id": "YOUR_ID", "rate_wpm": 225, "stability": 0.60 },
    "bill": { "voice_id": "YOUR_ID", "rate_wpm": 205, "stability": 0.75 },
    "mario": { "voice_id": "YOUR_ID", "rate_wpm": 220, "stability": 0.68 },
    "riker": { "voice_id": "YOUR_ID", "rate_wpm": 240, "stability": 0.60 },
    "howard": { "voice_id": "YOUR_ID", "rate_wpm": 218, "stability": 0.52 },
    "homer": { "voice_id": "YOUR_ID", "rate_wpm": 215, "stability": 0.62 },
    "hugh": { "voice_id": "YOUR_ID", "rate_wpm": 260, "stability": 0.58 },
    "bender": { "voice_id": "YOUR_ID", "rate_wpm": 198, "stability": 0.72 },
    "ick": { "voice_id": "YOUR_ID", "rate_wpm": 188, "stability": 0.82 }
  }
}
```

### Step 7: Register Skill (if needed)

The BobiverseAgents skill should be automatically discovered via SKILL.md frontmatter. No manual registration required.

To verify skill routing works, check SKILL.md is present:

```bash
test -f $PAI_DIR/skills/BobiverseAgents/SKILL.md && echo "✓ SKILL.md present" || echo "✗ SKILL.md missing"
```

## Installation Verification

After installation, run through the verification checklist in `VERIFY.md`:

```
"Run the verification checklist from VERIFY.md"
```

## Troubleshooting

### PersonaFactory.ts fails with "AgentFactory not found"

**Problem**: pai-agents-skill not installed or AgentFactory.ts missing.

**Solution**:
```bash
# Check if AgentFactory exists
test -f $PAI_DIR/skills/Agents/Tools/AgentFactory.ts && echo "✓ Found" || echo "✗ Missing"

# If missing, install pai-agents-skill first
```

### "Command not found: bun"

**Problem**: Bun runtime not installed.

**Solution**:
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or ~/.zshrc
bun --version
```

### External agents fail to spawn

**Problem**: bob-external-agents-skill not installed or external CLIs missing.

**Solution**:
```bash
# Check ExternalAgents skill
test -f $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh && echo "✓ Installed" || echo "✗ Not installed"

# Check external CLIs
which claude  # For Ick
which gemini  # For Bender
npx codex --version  # For Hugh
```

### Skill not triggering

**Problem**: SKILL.md triggers not matching user requests.

**Solution**:
```bash
# Verify SKILL.md is present
cat $PAI_DIR/skills/BobiverseAgents/SKILL.md

# Check "USE WHEN" triggers in frontmatter
# Try explicit invocation: "Use BobiverseAgents to list personas"
```

## Post-Installation

After successful installation:

1. **Test built-in agent spawning**: "Spawn Bill to design a test architecture"
2. **Test persona listing**: "List available Bobiverse personas"
3. **(Optional) Test external agent**: "Spawn Bender to research something" (requires bob-external-agents-skill)

## Next Steps

- Read the delegation decision tree in README.md
- Review persona backstories in agent-personas.md
- Try multi-agent collaboration patterns
- Configure voice personalities if using TTS

## Support

For issues or questions:
- Check VERIFY.md for validation steps
- Review agent-personas.md for canonical persona definitions
- Consult pai-agents-skill documentation for AgentFactory.ts usage

---

**Installation Time**: ~5 minutes (dependencies already installed)

**Disk Usage**: ~100KB (persona data + workflows)

**Dependencies**: pai-core-install, pai-agents-skill, bun
