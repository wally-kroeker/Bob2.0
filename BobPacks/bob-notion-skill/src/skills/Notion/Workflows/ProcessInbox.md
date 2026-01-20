# Process Inbox Workflow

## Trigger

User says:
- "Bob, process my inbox"
- "Bob, show me what's in my inbox"
- "Bob, what captures need processing?"
- "Bob, organize my captures"

## Objective

Query Notion Captures database for items with `Status="Inbox"`, present them grouped by type, and route to appropriate handlers.

## Steps

### 1. Query Inbox Items

```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --status Inbox --limit 50
```

Expected: List of captures with Status="Inbox"

### 2. Group by Type

Group results by the `Type` field:
- **Text**: Plain notes, thoughts, ideas
- **Link**: URLs to process (fetch content, summarize)
- **Image**: Photos with descriptions (already processed by n8n)
- **File**: Documents (already uploaded by n8n)
- **Voice**: Transcribed voice memos (already processed by n8n)
- **Video**: Video URLs (already processed by n8n)

### 3. Present Summary to User

Format:
```
📥 Inbox Summary

Text notes: 5 items
Links: 12 items
Images: 3 items
Files: 1 item
Voice: 2 items
Videos: 0 items

Total: 23 items in inbox
```

### 4. Offer Actions

Ask user which type to process first, or offer options:
- "Process all links" → Route to `ProcessLinks.md` workflow
- "Process text notes" → Route to `ProcessNotes.md` workflow
- "Show me links" → List link captures
- "Show me images" → List image captures
- "Mark all as processed" → Bulk update Status to "Processed"

### 5. Route to Handler

Based on user choice, route to appropriate workflow:
- **Links**: `ProcessLinks.md`
- **Text Notes**: `ProcessNotes.md`
- **Images/Files/Voice/Video**: Already processed, just mark as Processed

## Batch Operations

If user wants to process multiple items:

### Mark Multiple as Processed

```bash
# For each page ID:
bun run $PAI_DIR/skills/Notion/Tools/UpdateCapture.ts --id <page-id> --status Processed
```

## Edge Cases

**Empty inbox**: Congratulate user, suggest checking recent processed items

**Too many items (>100)**: Offer to process in batches or filter by date range

**Mixed processing**: Some items need manual review, others can be auto-processed

## Success Criteria

- User sees organized list of inbox items
- User can choose which items to process
- Items are routed to appropriate handlers
- Status updates reflect processing state

## Example Interaction

```
User: Bob, process my inbox

Bob: Searching your Notion inbox...

📥 Inbox Summary

Text notes: 5 items
Links: 12 items
Images: 3 items

Total: 20 items in inbox

Would you like me to:
1. Process all 12 links (fetch content and summarize)
2. Process the 5 text notes (analyze and categorize)
3. Show me a specific type
4. Mark everything as processed

User: Process all links

Bob: [Routes to ProcessLinks.md workflow]
```

## Notes

- This is the main entry point for inbox processing
- Delegates specific processing to type-specific workflows
- Should be fast - just query and present, don't fetch external content
- Use Tool calls in parallel where possible
