# Installation: bob-external-agents-skill

## Pre-Installation Checks

Before installing, verify these prerequisites:

### 1. PAI_DIR is set

```bash
echo $PAI_DIR
# Should output: /home/bob/.claude (or your PAI directory)
```

If not set:
```bash
export PAI_DIR="$HOME/.claude"
echo 'export PAI_DIR="$HOME/.claude"' >> ~/.bashrc
```

### 2. pai-agents-skill is installed

```bash
ls $PAI_DIR/skills/Agents/Tools/AgentFactory.ts
# Should exist - provides trait composition
```

If not installed, install pai-agents-skill first.

### 3. Required tools are available

```bash
# Check bun (required)
which bun && bun --version

# Check jq (required)
which jq && jq --version

# Check external CLIs (at least one required)
which claude    # Claude Code CLI
which gemini    # Gemini CLI (optional)
npx @openai/codex --version  # Codex (optional, runs via npx)
```

Install missing tools:
```bash
# bun (if missing)
curl -fsSL https://bun.sh/install | bash

# jq (if missing)
sudo apt install jq  # Debian/Ubuntu
brew install jq      # macOS

# gemini (if missing)
npm install -g @anthropic-ai/gemini-cli

# codex (runs via npx, no global install needed)
```

---

## Installation Steps

### Step 1: Create skill directory

```bash
mkdir -p $PAI_DIR/skills/ExternalAgents/Tools
```

### Step 2: Copy SKILL.md

```bash
cp /home/bob/projects/Bob2.0/BobPacks/bob-external-agents-skill/src/skills/ExternalAgents/SKILL.md \
   $PAI_DIR/skills/ExternalAgents/SKILL.md
```

### Step 3: Copy and make scripts executable

```bash
cp /home/bob/projects/Bob2.0/BobPacks/bob-external-agents-skill/src/skills/ExternalAgents/Tools/spawn-agent.sh \
   $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh

cp /home/bob/projects/Bob2.0/BobPacks/bob-external-agents-skill/src/skills/ExternalAgents/Tools/check-agents.sh \
   $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh

chmod +x $PAI_DIR/skills/ExternalAgents/Tools/*.sh
```

### Step 4: Create external-agents output directory

```bash
mkdir -p $PAI_DIR/external-agents
```

### Step 5: Verify file structure

```bash
tree $PAI_DIR/skills/ExternalAgents
```

Expected output:
```
/home/bob/.claude/skills/ExternalAgents
├── SKILL.md
└── Tools
    ├── check-agents.sh
    └── spawn-agent.sh
```

### Step 6: Test spawn-agent.sh

```bash
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh --help
```

Should display usage information.

### Step 7: Test check-agents.sh

```bash
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list
```

Should display empty agent list (or existing agents if any).

---

## Optional: Add to settings.json

If you want the skill to appear in Claude Code's skill listing, add to `$PAI_DIR/settings.json`:

```json
{
  "skills": {
    "ExternalAgents": {
      "path": "$PAI_DIR/skills/ExternalAgents",
      "enabled": true
    }
  }
}
```

---

## Post-Installation

After installation, test with a simple spawn:

```bash
# Test with Claude CLI (should be available)
$PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
  --model claude \
  --task "Echo 'Hello from external agent'" \
  --output-format json
```

Then check status:
```bash
$PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list
```

---

## Troubleshooting

### "AgentFactory not found"

pai-agents-skill must be installed first. Check:
```bash
ls $PAI_DIR/skills/Agents/Tools/AgentFactory.ts
```

### "bun: command not found"

Install bun:
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### "jq: command not found"

Install jq:
```bash
sudo apt install jq  # Debian/Ubuntu
brew install jq      # macOS
```

### Agents spawn but no output

Check the output file directly:
```bash
tail -f $PAI_DIR/external-agents/<task_id>.output
```

Check if process is running:
```bash
cat $PAI_DIR/external-agents/<task_id>.pid
ps aux | grep <pid>
```
