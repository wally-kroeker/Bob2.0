---
name: Scratchpad
description: Universal scratchpad system for managing untargeted outputs with auto-save, search, and age-based archival
version: 1.0.0
---

# Scratchpad Skill

**USE WHEN** user wants to:
- save content to scratchpad
- search scratchpad
- list scratchpad items
- archive old scratchpad data
- find saved research or notes
- show recent scratchpad folders

## Workflow Routing

| User Intent | Trigger Phrases | Workflow | Description |
|-------------|----------------|----------|-------------|
| Save content | "save this to scratchpad", "put this in scratchpad", "scratchpad save" | `Workflows/Save.md` | Create timestamped folder and save content |
| Search content | "search scratchpad for [query]", "find in scratchpad", "what did I save about [topic]?" | `Workflows/Search.md` | Grep-based search across active and archived |
| List items | "show recent scratchpad items", "list scratchpad folders", "what's in scratchpad?" | `Workflows/List.md` | Show recent folders by date |
| Archive old data | "archive old scratchpad data", "clean up scratchpad", "archive scratchpad" | `Workflows/Archive.md` | Move content >90 days to archive/ |

## Quick Reference

### Save
```
User: "Research CIS Controls and save to scratchpad"
→ Runs Workflows/Save.md
→ Creates: scratchpad/2025-01-05-143000_cis-controls-research/
```

### Search
```
User: "search scratchpad for security assessment"
→ Runs Workflows/Search.md
→ Returns: Matching folders with previews
```

### List
```
User: "show recent scratchpad items"
→ Runs Workflows/List.md
→ Returns: Last 30 days of folders
```

### Archive
```
User: "archive old scratchpad data"
→ Runs Workflows/Archive.md
→ Moves: Folders >90 days to archive/YYYY-MM/
```

## Tools Used

- `$PAI_DIR/tools/ScratchpadManager.ts` - Core orchestrator
- `$PAI_DIR/tools/lib/indexer.ts` - Search index management
- `$PAI_DIR/tools/lib/archiver.ts` - Age-based archival logic

## Configuration

Environment variables:
- `SCRATCHPAD_DIR` - Location of scratchpad (default: `$PAI_DIR/scratchpad`)
- `SCRATCHPAD_ARCHIVE_DAYS` - Age threshold for archival (default: 90)
- `SCRATCHPAD_AUTO_SAVE` - Enable auto-save hook (default: false)

## Notes

- Scratchpad is for **ephemeral, uncommitted thinking** (experiments, drafts, temporary research)
- History System is for **completed work** (learnings, decisions, features)
- Cognitive Loop is for **writing for publication** (daily writing, Substack posts)
- These systems are complementary - use the right tool for the right purpose
