# Search Captures Workflow

## Trigger

User says:
- "Bob, what did I capture about [topic]?"
- "Bob, search my captures for [keyword]"
- "Bob, show me captures from [date range]"
- "Bob, find that link I saved about [topic]"
- "Bob, show me recent images"

## Objective

Search the Notion Captures database by keyword, date, type, or combination, and present relevant results.

## Steps

### 1. Parse User Query

Extract search parameters:
- **Keyword**: Main search term
- **Type**: Text, Link, Image, File, Voice, Video
- **Date range**: "last week", "January", "since 2026-01-01"
- **Status**: Usually search all, but can filter by Processed/Archived

### 2. Build Search Query

Translate natural language to search parameters:

**Example 1**: "what did I capture about React last week?"
```
--query "React"
--startDate 2026-01-12
--endDate 2026-01-19
```

**Example 2**: "show me link captures from January"
```
--type Link
--startDate 2026-01-01
--endDate 2026-01-31
```

**Example 3**: "find that image I saved"
```
--type Image
(sorted by most recent)
```

### 3. Execute Search

```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts \
  --query "<keyword>" \
  --type <type> \
  --startDate <date> \
  --endDate <date> \
  --limit 20
```

### 4. Present Results

Format results by relevance:

```
🔍 Search Results for "React hooks"

Found 5 captures:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 React Hooks Tutorial
   Type: Link
   Captured: Jan 15, 2026
   URL: https://react.dev/hooks
   Content: Official React documentation on hooks...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 My notes on useEffect
   Type: Text
   Captured: Jan 14, 2026
   Content: The dependency array is crucial...

...

Would you like to:
1. View full details of a specific capture
2. Process these captures
3. Export results
```

### 5. Offer Follow-up Actions

- **View details**: Show full content of specific capture
- **Process**: Mark as processed or update status
- **Export**: Create summary document
- **Related searches**: Suggest related queries

## Advanced Search

### Fuzzy Matching

If no exact matches, try related terms:
- "React hooks" → also search "hooks", "React"
- "typescript" → also search "TS", "type safety"

### Multi-field Search

Search across multiple fields:
- Title
- Content
- URL (for links)

### Semantic Search (future)

Use embeddings to find semantically similar captures, not just keyword matches.

## Edge Cases

**No results**: Suggest alternative searches or broader queries

**Too many results**: Offer to narrow down by type, date, or additional keywords

**Ambiguous query**: Ask user to clarify ("Did you mean links or text notes?")

## Date Parsing

Handle natural language dates:
- "last week" → Calculate 7 days ago
- "yesterday" → Calculate 1 day ago
- "January" → 2026-01-01 to 2026-01-31
- "this month" → Current month range
- "Q1" → Jan 1 to Mar 31

## Success Criteria

- Search executes successfully
- Results are relevant to query
- User can find what they're looking for
- Follow-up actions are clear

## Example Interactions

### Example 1: Keyword Search
```
User: Bob, what did I capture about React?

Bob: Searching for "React"...

🔍 Found 8 captures:

Links (5):
- React Hooks Tutorial (Jan 15)
- React 19 Release Notes (Jan 10)
...

Text Notes (3):
- My React learnings (Jan 12)
...

Would you like to see the full content of any specific capture?
```

### Example 2: Date Range Search
```
User: Bob, show me everything I captured last week

Bob: Searching captures from Jan 12-19...

🔍 Found 23 captures:

By Type:
- Text: 8 items
- Links: 12 items
- Images: 3 items

By Date:
- Monday (Jan 13): 5 captures
- Tuesday (Jan 14): 8 captures
...

Would you like to see a specific day or type?
```

### Example 3: Type-Specific Search
```
User: Bob, find that image I saved about architecture

Bob: Searching image captures for "architecture"...

🔍 Found 2 images:

1. System Architecture Diagram
   Captured: Jan 14, 2026
   Content: Whiteboard sketch of microservices...

2. Building Architecture Reference
   Captured: Dec 20, 2025
   Content: Photo of building design...

Showing image 1 details...
```

## Performance Notes

- Notion API search can be slow for large databases
- Consider caching recent search results
- Limit results to 50 by default for performance
- Use pagination for large result sets

## Integration Points

**MEMORY system**: Save frequent searches for faster recall

**AI summarization**: Offer to summarize all results if many found

**Export tools**: Export results as markdown, PDF, or CSV

**Related captures**: Suggest "You might also be interested in..." based on semantic similarity
