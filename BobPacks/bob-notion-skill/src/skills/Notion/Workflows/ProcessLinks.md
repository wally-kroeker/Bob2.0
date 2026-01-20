# Process Links Workflow

## Trigger

User says:
- "Bob, process my link captures"
- "Bob, process these links"
- "Bob, summarize the links in my inbox"
- Direct from `ProcessInbox.md` workflow

## Objective

Fetch content from link captures, generate summaries, update Notion with enriched content, and mark as processed.

## Steps

### 1. Query Link Captures

```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --status Inbox --type Link --limit 20
```

Expected: List of link captures with URLs

### 2. Present Links to User

Show list with titles and URLs:
```
📎 Found 12 link captures:

1. React Documentation
   https://react.dev/learn

2. TypeScript Best Practices
   https://example.com/ts-best-practices

...

Process all or select specific ones?
```

### 3. Fetch Link Content

For each selected link:

**Option A: Use Jina Reader (recommended)**
```bash
curl "https://r.jina.ai/<url>"
```

**Option B: Use WebFetch tool**
```
WebFetch with prompt: "Extract main content, summary, and key points"
```

**Option C: Use Browser skill**
```
Browser skill to capture full page content
```

### 4. Generate Summary

Use Claude to summarize:

**Prompt template**:
```
Summarize this article in 2-3 sentences, then extract 3-5 key points.

Article: <content>
```

**Expected output**:
```
Summary: [2-3 sentence summary]

Key Points:
- Point 1
- Point 2
- Point 3
```

### 5. Update Notion

```bash
bun run $PAI_DIR/skills/Notion/Tools/UpdateCapture.ts \
  --id <page-id> \
  --content "<original-content>\n\n---\n\nSummary: <summary>\n\nKey Points:\n<key-points>" \
  --status Processed
```

### 6. Report Success

```
✅ Processed 12 links:

- React Documentation → Summary added
- TypeScript Best Practices → Summary added
...

All links marked as Processed.
```

## Batch Processing

Process links in parallel (max 5 at a time to respect rate limits):

1. Split into batches of 5
2. For each batch:
   - Fetch content (parallel)
   - Generate summaries (parallel)
   - Update Notion (sequential to avoid rate limits)

## Error Handling

**Link unreachable**: Mark with note "Failed to fetch: [error]", set Status="Needs Review"

**Paywall/Login required**: Note in content "Content behind paywall", set Status="Needs Review"

**Timeout**: Retry once, then mark "Needs Review"

**Rate limit**: Pause, wait, retry

## Edge Cases

**PDF links**: Extract text first (may need different tool)

**YouTube/Video URLs**: Should be Type="Video" not "Link" - suggest fixing type

**Already processed**: Check if Content already has "Summary:" section

## Success Criteria

- Link content fetched successfully
- Summary generated and added to Content field
- Status updated to "Processed"
- User notified of results

## Example Interaction

```
User: Bob, process my link captures

Bob: Searching for link captures...
Found 8 links in your inbox. Processing now...

[Fetching content from 8 URLs...]
[Generating summaries...]

✅ Processed 8 links:

1. React Documentation - Added summary and 4 key points
2. TypeScript Guide - Added summary and 3 key points
...

7. Example Article - Failed to fetch (404 error) - marked for review
8. Medium Post - Behind paywall - marked for review

6 processed successfully, 2 need manual review.
```

## Performance Notes

- Fetching content is the slowest step (network I/O)
- Use parallel processing where possible
- Cache fetched content if user wants to re-process
- Consider adding "Summary Quality" field to track confidence

## Integration Points

**Jina Reader**: Free tier, no API key needed, works well for most sites

**WebFetch tool**: Use if Jina fails or for JS-heavy sites

**Browser skill**: Last resort for complex sites requiring rendering

**Scraping skill**: Alternative if available in PAI system
