---
name: bob-notion-skill
version: 1.0.0
author: Bob (Wally Kroeker)
description: Notion API integration for Second Brain capture system - query, read, update, and process captured content
type: skill
dependencies: []
---

# bob-notion-skill

Personal Notion API integration for Bob's Second Brain capture system.

## Problem

Wally captures ideas, notes, links, images, and voice memos via Telegram → n8n → Notion. These captures land in a Notion database with `Status="Inbox"`. Without programmatic access, Bob can't help process, organize, or recall this content.

## Solution

A skill that gives Bob full access to the Notion Captures database:
- Query inbox items (all types: text, links, images, voice, video)
- Read full capture details
- Update status and metadata
- Process links (fetch content, summarize)
- Search and recall past captures

## Architecture

```
Bob → Notion Skill → Notion API → Captures Database
                                   (written by n8n)
```

### Notion Database Schema

**Database ID**: `2e730fb596b980ec85d4f3e8fddbd002`

| Property | Type | Values |
|----------|------|--------|
| Title | title | Auto-generated or manual |
| Content | rich_text | Processed content |
| Type | select | Text, Link, Image, File, Voice, Video |
| URL | url | Source URL (for links/media) |
| Captured At | date | Timestamp with time |
| Source | select | Telegram, Manual, Other |
| Status | select | Inbox, Processed, Archived |

## Workflows

**ProcessInbox** - Main workflow for processing inbox items
- Query `Status="Inbox"`
- Present items to user
- Route to type-specific handlers

**ProcessLinks** - Link-specific handler
- Fetch URL content (via Jina Reader or Scraping skill)
- Generate summary using Claude
- Update Notion with enriched content
- Mark as Processed

**ProcessNotes** - Text note handler
- Analyze content
- Suggest categories/tags
- Extract key insights
- Mark as Processed

**SearchCaptures** - Memory recall workflow
- Search by keyword, date range, type
- "What did I capture about X?"
- "Show me images from last week"

## Tools

**NotionClient.ts** - Core API wrapper
- Query database with filters
- Get page details
- Update page properties
- Create new pages

**SearchCaptures.ts** - CLI search tool
```bash
bun run SearchCaptures.ts --query "keyword" --type Link --status Inbox
```

**GetCapture.ts** - CLI get single item
```bash
bun run GetCapture.ts --id <page-id>
```

**UpdateCapture.ts** - CLI update item
```bash
bun run UpdateCapture.ts --id <page-id> --status Processed
```

**CreateCapture.ts** - CLI create item
```bash
bun run CreateCapture.ts --title "Note" --content "..." --type Text
```

## Integration with Second Brain Project

This skill reads from the same Notion database that n8n writes to:
- n8n workflows handle incoming Telegram messages
- n8n writes captures to Notion with `Status="Inbox"`
- Bob uses this skill to process, organize, and recall captures
- Bob can also create new captures programmatically

## Configuration

Requires in `$PAI_HOME/.env`:
```bash
NOTION_API_KEY=secret_xxx
NOTION_CAPTURES_DB_ID=2e730fb596b980ec85d4f3e8fddbd002
```

## Use Cases

1. **Process Inbox**: "Bob, process my inbox" → shows all inbox items, helps organize
2. **Process Links**: "Bob, process these links" → fetches content, creates summaries
3. **Memory Recall**: "Bob, what did I capture about React?" → searches captures
4. **Quick Capture**: "Bob, create a note: remember to..." → writes to Notion
5. **Status Updates**: "Bob, mark these as processed" → bulk status updates

---

**Related Projects:**
- `/home/bob/projects/second-brain` - n8n workflows and Telegram bot integration
- BobPacks/bob-scratchpad-skill - Alternative capture system for untargeted outputs

**Created**: 2026-01-19
**Last Updated**: 2026-01-19
