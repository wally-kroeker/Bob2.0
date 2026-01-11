# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PAI (Personal AI Infrastructure) v2.0** - Open-source scaffolding for building personalized AI systems using modular, AI-installable "packs". This repository contains the pack templates, core infrastructure, and the Kai Bundle (complete PAI implementation).

## Fork Documentation

This repository is a **personal fork** of danielmiessler's PAI project, customized for Bob (Wally Kroeker's personal AI assistant).

### Git Remotes

| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | `github.com/wally-kroeker/Bob2.0` | Personal fork (push changes here) |
| `upstream` | `github.com/danielmiessler/Personal_AI_Infrastructure` | Original PAI repo (pull updates) |

### Repository Structure

```
Bob2.0/
├── BobPacks/              # PERSONAL packs (not in upstream)
│   ├── bob-telos-skill/   # Business accountability & Telos framework
│   ├── bob-cognitive-loop-skill/
│   └── ...
├── Bundles/               # Upstream bundles + Bob Bundle
├── Packs/                 # Upstream packs (pai-*)
└── ...
```

### Sync with Upstream

To pull latest changes from danielmiessler's PAI:

```bash
cd /home/bob/projects/Bob2.0
git fetch upstream
git merge upstream/main
git push origin main
```

### Customized Core Files (UPSTREAM DELTA)

**WARNING:** The following installed files have been customized beyond placeholder replacement. When merging upstream changes to `pai-core-install`, these files may need manual reconciliation.

#### Files Modified (in `~/.claude/skills/CORE/`)

| File | Upstream State | Bob Customization | Risk |
|------|---------------|-------------------|------|
| `SKILL.md` | Generic placeholders | Bob identity + personality numbers | LOW - structural match |
| `USER/DAIDENTITY.md` | Generic placeholders + default personality | Bob persona, Bobiverse traits, peer relationship | **MEDIUM** - added content |

#### DAIDENTITY.md Customizations (2026-01-10)

Added content **beyond** simple placeholder replacement:

1. **Personality & Behavior section** - Replaced generic traits with Bobiverse-specific personality:
   - "Conscientious & Careful", "Competent & Slightly Smug", "Dry Humor"
   - These overlap with `~/.claude/CLAUDE.md` (primary personality file)

2. **Relationship Model section** - Changed from options list to active "Partner/Peer" with example dialogue

3. **Personality Calibration** - Custom values: Directness 85, Humor 80, Precision 90, Formality 30, Curiosity 85

#### Redundancy Notes

Some content in `DAIDENTITY.md` is **intentionally redundant** with `~/.claude/CLAUDE.md`:
- CLAUDE.md = **authoritative** personality definition (detailed, with examples)
- DAIDENTITY.md = **summary** for hooks to read (Name, Color, Voice ID) + personality snapshot

If upstream introduces features that read personality from DAIDENTITY.md, we may need to:
1. Consolidate personality to one location
2. Or accept DAIDENTITY.md as the hook-readable summary

#### Merge Strategy

When merging upstream `pai-core-install` updates:

```bash
# 1. Check what changed in upstream CORE files
git diff upstream/main -- Packs/pai-core-install/src/skills/CORE/

# 2. If structural changes to SKILL.md or DAIDENTITY.md:
#    - Review changes manually
#    - Re-apply Bob customizations after merge
#    - Update this documentation

# 3. Safe to auto-merge: hooks/, tools/, other skills
```

### BobPacks Directory

Personal packs live in `BobPacks/` to keep them separate from upstream `Packs/`:
- **Naming**: `bob-{name}-skill` for skills, `bob-{name}-feature` for features
- **Structure**: Same as upstream (README.md, INSTALL.md, VERIFY.md, src/)
- **Skills**: Use **TitleCase** for skill directories (e.g., `src/skills/Telos/`)
- **Upstream contribution**: Packs intended for upstream should follow `Tools/PAIPackTemplate.md`

### Personal Packs Available

| Pack | Type | Description |
|------|------|-------------|
| `bob-bobiverse-agents-skill` | Skill | Bobiverse-named agents with persistent personas (Bill, Mario, Riker, Howard, Homer, Hugh, Bender, Ick) |
| `bob-cognitive-loop-skill` | Skill | Daily writing + Substack publishing |
| `bob-external-agents-skill` | Skill | Spawn external AI CLI agents (Codex, Gemini, Claude) as background processes |
| `bob-financial-system-skill` | Skill | Personal/corporate finance with Firefly III |
| `bob-opnsense-dns-skill` | Skill | OPNsense DNS management |
| `bob-pandoc-skill` | Skill | Markdown to PDF conversion |
| `bob-scratchpad-skill` | Skill | Universal scratchpad for managing untargeted outputs with auto-save, search, and archival |
| `bob-taskman-skill` | Skill | Vikunja task orchestration |
| `bob-telos-skill` | Skill | Business accountability using Telos framework |
| `bob-vikunja-skill` | Skill | Vikunja MCP reference |

### Creating a New BobPack

Follow upstream standards from `Packs/README.md` and `Tools/PAIPackTemplate.md`:

**1. Create pack structure:**
```bash
mkdir -p BobPacks/bob-{name}-skill/{src/skills/{SkillName},src/hooks,src/tools}
```

**2. Required files:**
```
bob-{name}-skill/
├── README.md           # YAML frontmatter + problem/solution/architecture
├── INSTALL.md          # Step-by-step with pre-install checks
├── VERIFY.md           # Mandatory completion checklist
└── src/
    └── skills/
        └── SkillName/  # TitleCase MANDATORY
            └── SKILL.md
```

**3. Update this documentation:**
- Add pack to "Personal Packs Available" table above
- Commit changes: `git add BobPacks/ CLAUDE.md && git commit -m "feat: add bob-{name}-skill"`

**4. For upstream contribution:**
- Ensure pack follows `Tools/PAIPackTemplate.md` completely
- Remove any personal data/paths
- Create PR to `upstream` (danielmiessler/Personal_AI_Infrastructure)

### BobPack Quality Checklist

Before marking a BobPack as ready:

- [ ] **README.md**: YAML frontmatter with name, version, author, description, type, dependencies
- [ ] **INSTALL.md**: Pre-installation system check, specific file paths, create directories, verification
- [ ] **VERIFY.md**: Specific path checks, activation test command, troubleshooting steps
- [ ] **TitleCase**: Skill directory uses TitleCase (e.g., `src/skills/Telos/` not `src/skills/telos/`)
- [ ] **SKILL.md**: YAML frontmatter with name, description, "USE WHEN" triggers
- [ ] **Tested**: Pack installed and verified working in `~/.claude/skills/`

## Core Architecture

### Key Concepts

**Packs** - Self-contained capability bundles (directory structure with README.md, INSTALL.md, VERIFY.md, and src/)
- Two types: **Skills** (AI-invoked capabilities) and **Features** (infrastructure/systems)
- Directory-based (v2.0+): Real code files in `src/` directory, not embedded in markdown
- AI-installable: Designed for AI agents to read and install autonomously

**Bundles** - Curated collections of packs that work together
- Handle installation order and pack dependencies
- Official Bundle = flagship complete PAI implementation
- Interactive wizard: `Bundles/Official/install.ts`

**Skills** - AI-invoked capabilities with SKILL.md routing
- **MANDATORY TitleCase naming** (CreateSkill, not create-skill)
- YAML frontmatter with "USE WHEN" triggers
- Workflow routing table
- Tools/ and Workflows/ subdirectories

**Hooks** - Event-driven automation scripts for Claude Code's hook system
- Events: PreToolUse, PostToolUse, SessionStart, Stop, UserPromptSubmit, etc.
- TypeScript scripts executed by Bun runtime
- Registered in `~/.claude/settings.json` or `$PAI_DIR/settings.json`

### System Flow

**Installation:**
1. User runs `bun run Bundles/Official/install.ts` (bootstrapping)
2. Wizard creates directory structure at `~/.claude` (or custom `$PAI_DIR`)
3. Sets environment variables (DA, TIME_ZONE, PAI_DIR)
4. User gives pack directories to AI for installation
5. AI copies files from `src/` to target locations
6. AI completes VERIFY.md checklist

**Runtime:**
1. User runs `claude`
2. SessionStart hook fires → `initialize-session.ts` runs
3. `load-core-context.ts` injects CORE skill (identity + routing)
4. User asks AI to perform task
5. CORE skill routes to appropriate skill via trigger matching
6. Skill executes workflow → generates output
7. PreToolUse hook validates security before command execution
8. PostToolUse hook captures output
9. Stop hook saves work to history/

### Critical File Locations

```
$PAI_DIR/                           # Default: ~/.claude
├── .env                            # SINGLE source of ALL API keys
├── hooks/                          # Event automation scripts
│   ├── security-validator.ts       # 10-tier attack pattern detection
│   ├── initialize-session.ts       # Session setup
│   ├── load-core-context.ts        # CORE skill injection
│   └── lib/observability.ts        # Shared utilities
├── history/                        # Captured work
│   ├── sessions/YYYY-MM/
│   ├── learnings/YYYY-MM/
│   └── raw-outputs/YYYY-MM/
├── skills/                         # Capabilities
│   ├── CORE/SKILL.md              # Auto-loaded identity (Tier 0)
│   ├── Art/                       # Visual generation
│   └── Agents/                    # Agent orchestration
└── settings.json                   # Hook registration + environment variables
```

## Development Commands

### Running TypeScript Files

This project uses **Bun** (not Node.js) to execute TypeScript directly - no build step required:

```bash
# Run any TypeScript file
bun run path/to/file.ts

# Examples:
bun run Bundles/Official/install.ts
bun run $PAI_DIR/hooks/security-validator.ts
bun run $PAI_DIR/skills/Art/Tools/Generate.ts --help
```

### Testing & Verification

**Verification-based testing** (not traditional unit tests):

```bash
# Test a hook manually (pipe JSON to stdin)
echo '{"session_id":"test","tool_name":"Bash","tool_input":{"command":"ls"}}' | \
  bun run $PAI_DIR/hooks/security-validator.ts

# Follow pack verification checklist
cat Packs/pai-hook-system/VERIFY.md

# Check system health
bun run $PAI_DIR/tools/PaiCheck.ts check

# Generate architecture documentation
bun run $PAI_DIR/tools/PaiCheck.ts generate
```

### Pack Development Workflow

```bash
# 1. Copy pack template
cp Tools/PAIPackTemplate.md Packs/my-new-pack/README.md

# 2. Create directory structure
mkdir -p Packs/my-new-pack/{src,src/hooks,src/skills,src/tools}

# 3. Write INSTALL.md and VERIFY.md

# 4. Implement code in src/

# 5. Test installation with AI:
#    "Install the pack from /absolute/path/to/Packs/my-new-pack/"

# 6. Validate before PR
bun run Tools/validate-pack.ts Packs/my-new-pack/
```

### Pack Installation Order

Critical dependency chain (install in this order):

1. **pai-hook-system** (foundation - event pipeline)
2. **pai-core-install** (identity + skill routing + MEMORY system)
3. Optional packs: voice, art, agents, prompting, observability

## Architectural Patterns

### Progressive Context Loading (4-Tier System)

Minimizes token usage by loading context progressively:

- **Tier 0**: CORE skill (automatic, loaded at SessionStart)
- **Tier 1**: Skill frontmatter only (triggers in system prompt)
- **Tier 2**: Full SKILL.md (loaded when triggered)
- **Tier 3**: Specific workflow (loaded on route)

### Fail-Safe Hook Design

Hooks **NEVER crash Claude Code**:

```typescript
async function main() {
  try {
    // Hook logic here
  } catch (error) {
    console.error('Error:', error);
    // NEVER throw - log and continue
  }
  process.exit(0);  // ALWAYS exit 0 (except PreToolUse blocking with exit 2)
}
```

### Single Source of Truth for Secrets

All API keys live in **ONE file**: `$PAI_DIR/.env`

Never store keys in:
- settings.json
- pack files
- code files
- multiple .env files

### Directory-Based Packs (v2.0 Format)

**Why:** Single markdown files hit token limits (28k vs 25k max)

**Structure:**
```
pack-name/
├── README.md      # Overview, architecture, problem/solution
├── INSTALL.md     # Step-by-step installation instructions
├── VERIFY.md      # Mandatory verification checklist
└── src/           # ACTUAL code files (.ts, .yaml, .hbs)
    ├── hooks/
    ├── skills/
    └── tools/
```

**Critical:** AI must copy actual files from `src/`, not extract from markdown blocks.

### TitleCase Naming Convention (Mandatory)

Skills system requires **strict TitleCase** for all files and directories:

- Skill directory: `CreateSkill` (not createskill, create-skill)
- Workflow files: `UpdateInfo.md` (not update-info.md)
- Tool files: `ManageServer.ts` (not manage-server.ts)
- YAML name: `name: CreateSkill`

**Why:** Routing logic depends on exact case matching.

### Security Validation Tiers

10-tier attack pattern detection system in `security-validator.ts`:

```typescript
const ATTACK_PATTERNS = {
  catastrophic: { action: 'block', ... },     // rm -rf /
  reverseShell: { action: 'block', ... },     // nc -e /bin/bash
  credentialTheft: { action: 'block', ... },  // curl | bash
  promptInjection: { action: 'block', ... },  // ignore previous instructions
  envManipulation: { action: 'warn', ... },   // export API keys
  gitDangerous: { action: 'confirm', ... },   // git push --force
  // ... 10 tiers total
}
```

## Critical Gotchas

1. **DON'T simplify implementations** - AI agents tend to create "equivalent" simplified versions. Install **EVERYTHING** exactly as specified in pack files.

2. **settings.json is strict JSON** - No comments allowed (not JSONC). Merge new hooks into existing arrays carefully.

3. **Exit codes matter** - PreToolUse: `exit 0` = allow, `exit 2` = block. All other hooks: always `exit 0`.

4. **PAI_DIR defaults to ~/.claude** - If not set, use default. Don't create custom paths unless user explicitly specifies.

5. **Skills require TitleCase** - CreateSkill, not create-skill. This is **MANDATORY** for routing.

6. **Hooks never crash Claude** - Always `exit 0`, log errors to stderr, fail silently.

7. **CORE skill auto-loads** - No trigger required. Loads at SessionStart via `load-core-context.ts` hook.

8. **Pack installation order matters** - Hooks → Core (includes MEMORY) → Skills. Dependencies must be installed first.

9. **Verification is mandatory** - VERIFY.md checklist must pass before claiming installation complete.

10. **One .env file** - All API keys go in `$PAI_DIR/.env`. Never scatter across multiple files.

11. **MEMORY is built-in** - The history/memory system is now part of pai-core-install, not a separate pack.

## Repository Structure

```
Bob2.0/
├── BobPacks/                   # Personal packs (not in upstream)
│   ├── bob-telos-skill/        # Business accountability
│   ├── bob-cognitive-loop-skill/
│   └── ...
├── Bundles/
│   └── Official/
│       ├── install.ts          # Interactive installation wizard
│       └── README.md           # Bundle documentation
├── Packs/
│   ├── pai-hook-system/        # Foundation (install first)
│   ├── pai-core-install/       # Skills + identity + MEMORY
│   ├── pai-voice-system/       # Voice notifications (optional)
│   ├── pai-art-skill/          # Visual generation (optional)
│   ├── pai-agents-skill/       # Agent orchestration (optional)
│   ├── pai-prompting-skill/    # Meta-prompting (optional)
│   └── pai-observability-server/ # Real-time dashboard (optional)
├── Tools/
│   ├── PAIPackTemplate.md      # Pack creation guide
│   ├── PAIBundleTemplate.md    # Bundle creation guide
│   ├── CheckPAIState.md        # System diagnostic
│   └── validate-pack.ts        # Pack validator
├── Deprecated/                 # Legacy v1.x code (ignore)
├── README.md                   # Main project documentation
├── PACKS.md                    # Pack system reference
├── SECURITY.md                 # Security guidelines
└── .env.example                # Environment variable template
```

## Common Tasks

### Installing the Complete System

```bash
# Clone repo
git clone https://github.com/danielmiessler/PAI.git
cd PAI/Bundles/Official

# Run interactive wizard
bun run install.ts
```

### Installing Individual Packs

Give the pack directory to Claude Code:

```
Install the pack from /absolute/path/to/Packs/pai-hook-system/

Use PAI_DIR="~/.claude" and DA="Bob".
```

### Creating a New Pack

1. Copy template: `cp Tools/PAIPackTemplate.md Packs/my-pack/README.md`
2. Create structure: `mkdir -p Packs/my-pack/src/{hooks,skills,tools}`
3. Write README.md (problem, solution, architecture)
4. Write INSTALL.md (step-by-step installation)
5. Write VERIFY.md (verification checklist)
6. Implement code in `src/`
7. Test with AI: "Install this pack from Packs/my-pack/"
8. Validate: `bun run Tools/validate-pack.ts Packs/my-pack/`

### Checking System Health

```bash
# Check what's installed
bun run $PAI_DIR/tools/PaiCheck.ts check

# Generate architecture documentation
bun run $PAI_DIR/tools/PaiCheck.ts generate

# View generated doc
cat $PAI_DIR/PaiArchitecture.md
```

## Key Principles (from README)

1. **Foundational Algorithm**: Current State → Desired State via verifiable iteration
2. **Scaffolding > Model**: Architecture matters more than which model you use
3. **As Deterministic as Possible**: Use templates and consistent patterns
4. **Code Before Prompts**: Only use AI where intelligence is actually needed
5. **UNIX Philosophy**: Modular tooling, do one thing well
6. **CLI as Interface**: Command-line first, GUIs are optional
7. **Meta / Self Update**: System should be able to modify itself

## Environment Variables

Set in `~/.zshrc` or `~/.bashrc`:

```bash
export DA="Bob"                      # Digital Assistant name
export PAI_DIR="$HOME/.claude"       # PAI installation directory
export TIME_ZONE="America/Los_Angeles"
```

API keys go in `$PAI_DIR/.env` (see `.env.example` for template).

## Related Documentation

- `README.md` - Project overview, principles, pack system
- `PACKS.md` - Complete pack system specification
- `Bundles/README.md` - Bundle system documentation
- `SECURITY.md` - Security policies and best practices
- `Tools/PAIPackTemplate.md` - Template for creating packs
