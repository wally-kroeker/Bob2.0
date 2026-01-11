---
name: Bob Scratchpad Skill
pack-id: wally-kroeker-scratchpad-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Universal scratchpad system for managing untargeted outputs with auto-save, search, and age-based archival
type: skill
purpose-type: [productivity, automation, organization]
platform: claude-code
dependencies: []
keywords: [scratchpad, temporary-storage, auto-save, search, archival, grep, organization, workspace]
---

<p align="center">
  <img src="../icons/bob-scratchpad.png" alt="Bob Scratchpad Skill" width="256">
</p>

# Bob Scratchpad Skill

> Universal scratchpad system for managing untargeted outputs with auto-save, search, and age-based archival - a lightweight workspace for ephemeral thinking

## Installation Prompt

You are receiving a PAI Pack - a modular upgrade for AI agent systems.

**What is PAI?** See: [PAI Project Overview](../../README.md)

**What is a Pack?** See: [Pack System](../../PACKS.md)

This pack adds a universal scratchpad workspace to your AI infrastructure. The Bob Scratchpad Skill is not about permanent documentation or formal capture - it's a workspace for ephemeral, uncommitted thinking:

- **Temporary Workspace**: Raw dumps, experiments, and work-in-progress that may never be finished
- **Auto-Save Capability**: Optionally capture untargeted outputs automatically before they're lost
- **Fast Search**: Grep-based search across all scratchpad content (active and archived)
- **Automatic Archival**: Move content older than 90 days to archive/ automatically
- **Manual Organization**: You decide what's worthy of permanence; the skill provides tooling, not judgment

**Core principle:** A safe place for unfinished thoughts.

The scratchpad is for the messy middle - the research you're exploring, the drafts you're iterating, the temporary projects that may become something or may disappear. It's orthogonal to the History System (which captures completed work) and Cognitive Loop (which handles writing for publication).

Please follow the installation instructions in `INSTALL.md` to integrate this pack into your infrastructure.

---

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Scratchpad Manager | `tools/ScratchpadManager.ts` | Core logic for save/search/list/archive operations |
| Search Indexer | `tools/lib/indexer.ts` | Maintains .scratchpad-index.json for fast queries |
| Archiver | `tools/lib/archiver.ts` | Age-based archival (>90 days to archive/) |
| Save Workflow | `skills/Scratchpad/Workflows/Save.md` | Save content to timestamped folder |
| Search Workflow | `skills/Scratchpad/Workflows/Search.md` | Grep-based search across active and archived |
| List Workflow | `skills/Scratchpad/Workflows/List.md` | Show recent items by date |
| Archive Workflow | `skills/Scratchpad/Workflows/Archive.md` | Trigger manual archival |
| Auto-save Hook (optional) | `hooks/capture-untargeted-output.ts` | Auto-save orphaned outputs |
| Skill Routing | `skills/Scratchpad/SKILL.md` | Trigger detection and workflow routing |

**Summary:**
- **Files created:** 9
- **Hooks registered:** 1 (optional)
- **Dependencies:** None

---

## The Problem

AI agents are excellent at generating content - research, analysis, drafts, explorations - but this content often exists only in conversation history. When you're exploring a topic, experimenting with code, or brainstorming ideas, where does that work go?

**The ephemeral output problem:**

When you ask your AI to "research security frameworks for SMBs" or "draft a meeting brief" or "explore this codebase," the output exists only in the conversation. If you don't explicitly save it somewhere, it's lost when the session ends. You end up with:

- **Lost research**: "I know we looked into CIS Controls last month, but where is that research?"
- **Repeated work**: "Didn't we already draft a response to this? Where did we save it?"
- **Forgotten context**: "What was the conclusion from that security assessment investigation?"
- **Manual save overhead**: Constantly deciding "is this worth saving?" and "where should I save it?"

**The organization burden:**

If you do save outputs, where do they go? Creating a formal directory structure for every bit of research is overkill. Saving to Downloads/ creates clutter. Creating project folders for experiments that may not pan out feels premature.

You need a place for:
- **Work in progress** - drafts that aren't ready for final storage
- **Exploratory research** - investigations that may or may not lead anywhere
- **Temporary projects** - experiments that might become formal projects or might be discarded
- **Meeting prep** - notes and briefs that are time-sensitive and disposable
- **Quick saves** - "just capture this before I forget" dumps

**The history system doesn't solve this:**

The History System (MEMORY in pai-core-install) captures *completed work* - learnings, decisions, features implemented. It's designed for permanence and institutional memory. But what about:
- Incomplete thoughts?
- Research dead-ends?
- Experiments that failed?
- Drafts you're not ready to commit?
- Temporary analysis?

These don't belong in formal history. They need a workspace, not an archive.

**What happens without a scratchpad:**

1. **Outputs disappear**: Research and analysis exist only in conversation history, difficult to find later
2. **Manual saving is inconsistent**: Sometimes you remember to save, sometimes you don't
3. **No search capability**: Can't find that investigation from last week
4. **Clutter accumulates**: Downloads/ and Documents/ fill with random research files
5. **No lifecycle management**: Old research sits forever with no automatic cleanup

You need a system that:
- Makes saving effortless (ideally automatic)
- Provides fast search ("what did I save about X?")
- Handles temporary content differently than permanent documentation
- Cleans up after itself (automatic archival of old content)
- Stays out of your way (minimal organization required)

---

## The Solution

The Bob Scratchpad Skill provides a lightweight workspace system that sits between ephemeral conversation history and permanent documentation. Think of it as a "staging area" for AI-generated content.

**Core Architecture:**

```
~/.claude/scratchpad/
├── YYYY-MM-DD-HHMMSS_description/    # Timestamped project folders
│   ├── README.md                      # Auto-generated context
│   └── ... (output files)
├── standalone-file.md                 # Individual files allowed
├── archive/                           # Auto-archived content >90 days
│   └── YYYY-MM/
│       └── YYYY-MM-DD-HHMMSS_description/
└── .scratchpad-index.json            # Metadata for fast search
```

**Three-Layer System:**

1. **Skill Layer** - Workflow routing and command handling
   - `Save.md` - Create timestamped folders and save content
   - `Search.md` - Grep-based search across all content
   - `List.md` - Show recent items by date
   - `Archive.md` - Manually trigger archival

2. **Tool Layer** - Core logic implementation
   - `ScratchpadManager.ts` - Main orchestrator (save/search/list/archive)
   - `indexer.ts` - Maintain search index for fast lookups
   - `archiver.ts` - Age-based archival logic (>90 days)

3. **Hook Layer** (optional) - Auto-capture untargeted outputs
   - `capture-untargeted-output.ts` - Detect orphaned agent outputs and auto-save

**Key Design Principles:**

1. **Effortless Capture**: Auto-save hook can catch untargeted outputs automatically
2. **Fast Search**: Grep-based search with index for performance
3. **Automatic Lifecycle**: Content auto-archives after 90 days (configurable)
4. **Manual Control**: You decide what to keep, move, or delete
5. **Minimal Structure**: Timestamped folders with descriptive names, nothing more

**Data Flow:**

```
User asks for research
    ↓
AI generates output
    ↓
[Optional] Hook detects untargeted output
    ↓
ScratchpadManager.save()
    ↓
Create folder: scratchpad/2025-01-05-143000_security-research/
    ↓
Generate README.md with context
    ↓
Update .scratchpad-index.json
    ↓
User can search later: "search scratchpad for security"
```

**Lifecycle Management:**

```
Content created → Active scratchpad (searchable)
    ↓ (90 days)
Automatic archival → archive/YYYY-MM/ (still searchable)
    ↓ (manual decision)
Delete or promote → Remove or move to permanent storage
```

---

## What Makes This Different

This sounds similar to the History System which also captures outputs automatically. What makes this approach different?

The Scratchpad is for ephemeral, uncommitted thinking - not completed work. History captures structured completions (learnings, decisions, features) via hooks. Scratchpad handles raw dumps, experiments, and temporary projects that may never be finished. It's a workspace, not an archive. You decide what's worthy of permanence; History captures what's done.

- Workspace for experiments not formal completion capture system
- Manual organization not automatic hook based categorization required
- Temporary ephemeral not permanent institutional memory storage design
- User decides permanence not AI decides documentation worthiness

---

## Installation

See [INSTALL.md](INSTALL.md) for complete installation instructions including:

- Prerequisites
- Pre-installation system analysis
- Conflict resolution matrix
- Step-by-step installation
- Verification commands

**Quick start:**
```bash
# Give this pack directory to your AI agent:
Install the bob-scratchpad-skill pack from /home/bob/projects/Bob2.0/BobPacks/bob-scratchpad-skill/

Use PAI_DIR="/home/bob/.claude"
```

---

## Invocation Scenarios

The Scratchpad skill triggers on explicit commands:

| Trigger | Skill | Workflow | Action |
|---------|-------|----------|--------|
| "save this to scratchpad" | Scratchpad | Save.md | Create timestamped folder, save content |
| "search scratchpad for [query]" | Scratchpad | Search.md | Grep search across active and archived |
| "what did I save about [topic]?" | Scratchpad | Search.md | Search with topic as query |
| "show recent scratchpad items" | Scratchpad | List.md | List last 30 days |
| "list scratchpad folders" | Scratchpad | List.md | Show all folders by date |
| "archive old scratchpad data" | Scratchpad | Archive.md | Move content >90 days to archive/ |

**Optional Auto-Save:**

If the `capture-untargeted-output` hook is enabled:
- Agent generates content via Task/WebFetch/WebSearch
- Output is substantial (>200 chars)
- No explicit file write detected
- → Automatically saved to scratchpad with inferred description

---

## Example Usage

### Example 1: Manual Save

**User:** "Can you research CIS Controls for SMB security assessments? Save it to scratchpad."

**AI:**
```
I'll research CIS Controls for SMB security and save it to scratchpad.

[Conducts research using WebSearch/WebFetch]

Saved to scratchpad: scratchpad/2025-01-05-143000_cis-controls-smb-research/

The folder contains:
- README.md (research summary)
- cis-controls-ig1-ig2.md (implementation guide)
- pricing-notes.md (Canadian MSP pricing)
```

**User (later):** "search scratchpad for cis controls"

**AI:**
```
Found 2 matches:

1. 2025-01-05-143000_cis-controls-smb-research/
   Created: 2025-01-05
   Preview: CIS Controls v8 for SMB security - IG1 and IG2...

2. 2025-12-01-131450_cis-controls-v8-research/ (archived)
   Created: 2025-12-01
   Preview: Comprehensive CIS Controls v8 research...
```

### Example 2: List Recent Items

**User:** "show me recent scratchpad items"

**AI:**
```
Recent scratchpad items (last 30 days):

2025-01-05  cis-controls-smb-research
2025-01-04  circuit-chisel-meeting-brief
2025-01-03  vdi-project-questions
2025-01-02  security-quote-templates
2024-12-28  year-of-agent-research

Total: 15 items
```

### Example 3: Archival

**User:** "archive old scratchpad data"

**AI:**
```
Checking for content older than 90 days...

Would archive 5 items:

- 2024-10-21-205742_youtube-transcript (95 days old)
- 2024-10-23-183226_algorithmic-art-party (93 days old)
- 2024-10-23-225809_goodfields-design-review (93 days old)
- 2024-10-24-150200_wallykroeker-design-review (92 days old)
- 2024-10-26-151451_bob-capabilities (90 days old)

Run with --execute to perform archival.
```

**User:** "do it"

**AI:**
```
Archiving 5 items to archive/2024-10/...

✓ Moved to archive/2024-10/2024-10-21-205742_youtube-transcript/
✓ Moved to archive/2024-10/2024-10-23-183226_algorithmic-art-party/
✓ Moved to archive/2024-10/2024-10-23-225809_goodfields-design-review/
✓ Moved to archive/2024-10/2024-10-24-150200_wallykroeker-design-review/
✓ Moved to archive/2024-10/2024-10-26-151451_bob-capabilities/

Archived 5 items. They remain searchable in archive/.
```

### Example 4: Search Including Archive

**User:** "search scratchpad for 'goodfields design' including archive"

**AI:**
```
Found 1 match (including archive):

1. 2024-10-23-225809_goodfields-design-review/ (archived)
   Created: 2024-10-23
   Location: archive/2024-10/
   Preview: Design critique for GoodFields website...
```

---

## Configuration

**Environment variables:**

**Option 1: `.env` file** (recommended):
```bash
# $PAI_DIR/.env
SCRATCHPAD_DIR="/home/bob/.claude/scratchpad"
SCRATCHPAD_ARCHIVE_DAYS="90"
SCRATCHPAD_AUTO_SAVE="false"  # Set to "true" to enable auto-save hook
```

**Option 2: Shell profile** (for manual installation):
```bash
# Add to ~/.zshrc or ~/.bashrc
export SCRATCHPAD_DIR="$PAI_DIR/scratchpad"
export SCRATCHPAD_ARCHIVE_DAYS="90"
export SCRATCHPAD_AUTO_SAVE="false"
```

**Auto-save hook configuration:**

To enable the optional auto-save hook, add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bun run $PAI_DIR/hooks/capture-untargeted-output.ts"
          }
        ]
      }
    ]
  },
  "environment": {
    "SCRATCHPAD_AUTO_SAVE": "true"
  }
}
```

---

## Customization

### Recommended Customization

**What to Customize:** Folder naming conventions and description inference

**Why:** The auto-save feature generates folder names from inferred descriptions. Customizing the inference rules makes scratchpad folders more meaningful and easier to find.

**Process:**
1. Review first 10-20 auto-saved folders
2. Identify patterns in your work (e.g., "security research", "client meetings", "code experiments")
3. Update `inferDescription()` function in `capture-untargeted-output.ts` with your common patterns
4. Add custom keyword mappings:
   ```typescript
   const KEYWORD_PATTERNS = {
     'CVE': 'security-research',
     'interview': 'meeting-prep',
     'RFC': 'standards-research',
     'API': 'integration-research'
   };
   ```

**Expected Outcome:** Auto-saved folders have consistent, predictable names that match your workflow.

---

### Optional Customization

| Customization | File | Impact |
|--------------|------|--------|
| Archive threshold | `.env` (SCRATCHPAD_ARCHIVE_DAYS) | Change from 90 days to your preference (e.g., 30, 60, 180) |
| Index rebuilding frequency | `ScratchpadManager.ts` | Add cron job or manual trigger preference |
| Search result limit | `Search.md` workflow | Default number of results returned (currently 20) |
| Auto-save content threshold | `capture-untargeted-output.ts` | Minimum character count for auto-save (currently 200) |

---

## Credits

- **Original concept**: Wally Kroeker (Bob project) - developed for personal AI infrastructure
- **Inspired by**: Scratch buffers in Emacs, ~/tmp directories, engineering lab notebooks
- **Complements**: pai-core-install (MEMORY system - permanent work capture), bob-cognitive-loop-skill (writing for publication)

---

## Related Work

- **pai-core-install (MEMORY system)**: Automatic capture of completed work (learnings, decisions, features)
- **bob-cognitive-loop-skill**: Daily writing workflow with Substack publishing

---

## Works Well With

- **pai-core-install (MEMORY system)**: Scratchpad for experiments, MEMORY for completed work
- **bob-cognitive-loop-skill**: Scratchpad for rough drafts, Cognitive Loop for published writing
- **bob-telos-skill**: Scratchpad for strategy notes, Telos for formal goals and accountability

---

## Relationships

### Parent Of
*None*

### Child Of
*None*

### Sibling Of
- pai-core-install (MEMORY system - complementary, different purposes)
- bob-cognitive-loop-skill (complementary - different workflows)

### Part Of Collection
- Bob Personal Productivity Suite

---

## Changelog

### 1.0.0 - 2025-01-05
- Initial release
- Auto-save hook for untargeted outputs (optional)
- Grep-based search across active and archived content
- Age-based archival (configurable threshold, default 90 days)
- JSON index for fast search
- Four workflows: Save, Search, List, Archive
- Support for existing scratchpad data (backward compatible)
