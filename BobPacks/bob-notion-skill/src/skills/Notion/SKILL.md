---
name: Notion
description: Notion API integration for Second Brain capture system. Query, read, update, and process captured content from Telegram. USE WHEN user mentions notion, captures, second brain, inbox, or wants to process/search captured items.
---

# Notion Skill

Provides Bob with access to Wally's Second Brain capture system - a Notion database populated via Telegram → n8n automation.

## USE WHEN

Activate this skill when user:
- Mentions "notion", "captures", "second brain", or "inbox"
- Says "process my inbox" or "process these links"
- Asks "what did I capture about..." or "show me recent captures"
- Wants to search, organize, or recall past captures
- Needs to create new Notion entries programmatically

## Database Context

**Database ID**: `2e730fb596b980ec85d4f3e8fddbd002`

**Schema**:
- **Title** (title): Auto-generated or manual
- **Content** (rich_text): Processed content
- **Type** (select): Text, Link, Image, File, Voice, Video
- **URL** (url): Source URL (for links/media)
- **Captured At** (date): Timestamp with time
- **Source** (select): Telegram, Manual, Other
- **Status** (select): Inbox, Processed, Archived

**Workflow**:
1. User sends message to Telegram bot
2. n8n receives webhook, processes message
3. n8n writes to Notion with `Status="Inbox"`
4. Bob uses this skill to process, organize, and recall

## Workflows

| Workflow | File | Use Case |
|----------|------|----------|
| Process Inbox | `Workflows/ProcessInbox.md` | Query `Status="Inbox"`, present items by type, route to handlers |
| Process Links | `Workflows/ProcessLinks.md` | Fetch URL content, summarize, update Notion, mark processed |
| Process Notes | `Workflows/ProcessNotes.md` | Analyze text captures, suggest categories, extract insights |
| Search Captures | `Workflows/SearchCaptures.md` | Search by keyword, date, type - memory recall |

## Tools

| Tool | File | Purpose |
|------|------|---------|
| Notion Client | `Tools/NotionClient.ts` | API wrapper for all operations |
| Search Captures | `Tools/SearchCaptures.ts` | CLI: Query database with filters |
| Get Capture | `Tools/GetCapture.ts` | CLI: Retrieve single item details |
| Update Capture | `Tools/UpdateCapture.ts` | CLI: Update properties (status, content, etc.) |
| Create Capture | `Tools/CreateCapture.ts` | CLI: Create new Notion entries |

## Common Operations

### Query Inbox
```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --status Inbox
```

### Search by Keyword
```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --query "react"
```

### Get Single Item
```bash
bun run $PAI_DIR/skills/Notion/Tools/GetCapture.ts --id <page-id>
```

### Update Status
```bash
bun run $PAI_DIR/skills/Notion/Tools/UpdateCapture.ts \
  --id <page-id> \
  --status Processed
```

### Create Capture
```bash
bun run $PAI_DIR/skills/Notion/Tools/CreateCapture.ts \
  --title "Note" \
  --content "..." \
  --type Text \
  --status Inbox
```

## Environment Variables

Required in `$PAI_DIR/.env`:
```bash
NOTION_API_KEY=secret_xxx
NOTION_CAPTURES_DB_ID=2e730fb596b980ec85d4f3e8fddbd002
```

## Error Handling

**Database not found**: Verify database ID and that database is shared with Notion integration

**Authentication failed**: Check `NOTION_API_KEY` in `.env`

**Property not found**: Database schema doesn't match expected structure (see schema above)

**Rate limit**: Notion API has rate limits - batch operations should respect limits

## Integration Points

**Second Brain Project**: `/home/bob/projects/second-brain`
- n8n workflows write to same database
- Telegram bot sends to n8n
- Bob reads/updates via this skill

**Related Skills**:
- Scratchpad skill: Alternative capture system for untargeted outputs
- Art skill: Can generate images to send to Telegram for capture
- Browser skill: Can capture screenshots to send to second brain

## Notes

- This skill is **read-mostly** - primary writes come from Telegram/n8n
- Bob can create captures, but main use case is organizing/processing existing ones
- Database schema is minimal by design (no complex taxonomy until processing)
- Links should be fetched and summarized during processing, not at capture time
