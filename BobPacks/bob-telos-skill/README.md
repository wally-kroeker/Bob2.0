---
name: Bob Telos Skill
pack-id: bob-telos-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Business accountability skill using the Telos framework. Tracks goals, leads, wisdom principles, and challenges. Core to Bob's ADHD support functionality.
type: skill
platform: claude-code
dependencies:
  - pai-core-install
keywords: [telos, accountability, goals, leads, wisdom, challenges, business, adhd, goodfields, fablab]
---

# Bob Telos Skill

> Business partner and strategic accountability system using the Telos framework

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Skill Definition | `src/skills/Telos/SKILL.md` | Activation triggers, workflows, response patterns |
| Data Directory | `data/` | Business context files (gitignored, user-created) |

**Summary:**
- **Files created:** 1 (SKILL.md)
- **Directories created:** 2 (Telos/, Telos/data/)
- **Dependencies:** pai-core-install

---

## The Problem

ADHD entrepreneurs struggle with:
- **Context switching** - Losing track of priorities across multiple businesses
- **Accountability gaps** - No consistent system to track goals and progress
- **Pattern blindness** - Repeating mistakes because lessons aren't captured
- **Lead leakage** - Potential clients falling through cracks without follow-up tracking

Traditional task managers don't capture the strategic context needed for effective accountability. You need something that knows your goals, your risks, your patterns, and can call you out when you're avoiding important work.

---

## The Solution

The Telos skill implements a structured accountability framework:

### Core Components

| Component | Code | Purpose |
|-----------|------|---------|
| **Goals** | G1-G3 | Prioritized objectives with deadlines |
| **Risks** | R1-R3 | Threats requiring mitigation |
| **Leads** | Table | Active pipeline with status tracking |
| **Wisdom** | W1-W15 | Lessons learned for pattern recognition |
| **Challenges** | C1-C7 | Active blockers with resolution strategies |

### Multi-Context Support

Tracks three business contexts simultaneously:
- **GoodFields** (`goodfields.md`) - Consulting business, leads, revenue
- **FabLab** (`fablab.md`) - Infrastructure projects, services, network
- **Personal** (`personal.md`) - Goals, values, decision filters

### Strategic Partnership Behaviors

- **Accountability**: Remind about deadlines based on goal hierarchy
- **Focus**: Redirect when scattered or distracted from G1
- **Momentum**: Push toward action when leads are warm
- **Reality check**: Use risk register to create urgency
- **Pattern recognition**: Notice procrastination from LOG/Challenges
- **Celebration**: Mark wins to build confidence

---

## Activation Triggers

Bob activates this skill when you say:

| Trigger | Action |
|---------|--------|
| "business partner mode" | Full context dump with priorities |
| "check my context" | Read and summarize all Telos files |
| "what should I focus on?" | Return G1 priority goal |
| "how are my leads?" | Show Active Leads table |
| "W1", "wisdom 1" | Reference specific wisdom principle |
| "C3", "challenge 3" | Reference specific challenge |

---

## Installation

See [INSTALL.md](INSTALL.md) for step-by-step instructions.

**Quick Install:**
```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
cp -r src/skills/Telos "$PAI_DIR/skills/"
mkdir -p "$PAI_DIR/skills/Telos/data"
```

---

## Data Directory Structure

After installation, create your business context files in `$PAI_DIR/skills/Telos/data/`:

```
data/
├── goodfields.md    # GoodFields consulting (leads, revenue, goals)
├── personal.md      # Personal goals, values, decision filters
└── fablab.md        # FabLab infrastructure (projects, services)
```

Each file follows the Telos framework structure. See SKILL.md for expected sections.

---

## Verification

See [VERIFY.md](VERIFY.md) for the complete verification checklist.

**Quick Test:**
```
User: "Bob, business partner mode"

Expected: Context dump with goals, leads, and priority action
```

---

## Customization

### Recommended

1. **Populate data files** - Add your actual business context
2. **Adjust priorities** - Reorder G1/G2/G3 based on current focus
3. **Update risk register** - Keep R1-R3 current with actual threats

### Optional

| Customization | File | Impact |
|--------------|------|--------|
| Add new context | `data/newcontext.md` | Track additional business entity |
| Change triggers | `SKILL.md` | Modify activation phrases |
| Add wisdom entries | `data/personal.md` | Capture new lessons learned |

---

## Credits

- **Telos Framework**: Strategic planning methodology
- **Bob Customization**: Wally Kroeker
- **PAI Infrastructure**: Daniel Miessler

---

## Changelog

### 1.0.0 - 2025-01-05
- Initial release with upstream-compatible structure
- TitleCase directory naming (`Telos/` not `telos/`)
- Enhanced INSTALL.md with pre-installation checks
- Enhanced VERIFY.md with specific test commands
