# Process Notes Workflow

## Trigger

User says:
- "Bob, process my text notes"
- "Bob, organize my notes"
- "Bob, analyze my text captures"
- Direct from `ProcessInbox.md` workflow

## Objective

Analyze text captures, extract insights, suggest categories/tags, and mark as processed.

## Steps

### 1. Query Text Captures

```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --status Inbox --type Text --limit 20
```

Expected: List of text note captures

### 2. Present Notes to User

Show list with titles and content previews:
```
📝 Found 5 text note captures:

1. "Meeting with team"
   Content: Discussed project timeline and...

2. "Random thought about architecture"
   Content: What if we used a different...

...

Process all or select specific ones?
```

### 3. Analyze Each Note

For each selected note, use Claude to:

**Prompt template**:
```
Analyze this note and provide:
1. A one-sentence summary
2. 2-3 key insights or action items
3. Suggested category (Ideas | References | Resources | Quotes | Projects | People | Events | Learning | Media | Random)

Note: <content>
```

**Expected output**:
```
Summary: [one sentence]

Insights:
- [Insight 1]
- [Insight 2]

Suggested Category: Projects
```

### 4. Update Notion

Append analysis to Content field:

```bash
bun run $PAI_DIR/skills/Notion/Tools/UpdateCapture.ts \
  --id <page-id> \
  --content "<original-content>\n\n---\n\n📊 Analysis:\nSummary: <summary>\n\nInsights:\n<insights>\n\nSuggested Category: <category>" \
  --status Processed
```

### 5. Report Success

```
✅ Processed 5 text notes:

- "Meeting with team" → Categorized as Projects
- "Random thought" → Categorized as Ideas
...

All notes marked as Processed.
```

## Advanced Processing

### Extract Action Items

If note contains actionable items:
```
Action Items Detected:
- [ ] Follow up with John
- [ ] Update documentation
```

Offer to:
1. Create tasks in Vikunja (if Task skill installed)
2. Add to separate "Action Items" database
3. Just note them in the content

### Extract People/Contacts

If note mentions people:
```
People Mentioned:
- John Smith
- Jane Doe
```

Offer to:
1. Link to existing contacts
2. Create new contact entries
3. Just note them in content

### Extract Dates/Events

If note contains date/time references:
```
Dates Mentioned:
- "next Tuesday" (2026-01-21)
- "deadline in 2 weeks" (2026-02-02)
```

Offer to create calendar events.

## Batch Processing

Process notes in parallel:
1. Fetch all text notes
2. Generate analysis for each (parallel - max 5 at a time)
3. Update Notion (sequential to avoid rate limits)

## Edge Cases

**Very short notes**: Skip analysis if <20 characters, just mark processed

**Very long notes**: Summarize first, then analyze summary

**Already analyzed**: Check if Content has "Analysis:" section

**Code snippets**: Detect and format properly, categorize as "Learning" or "Resources"

## Success Criteria

- Note analyzed successfully
- Insights and category suggestions added
- Status updated to "Processed"
- User notified of results

## Example Interaction

```
User: Bob, process my text notes

Bob: Searching for text notes...
Found 5 text notes in your inbox. Processing now...

[Analyzing content...]

✅ Processed 5 notes:

1. "Meeting with team"
   Summary: Discussed Q1 timeline and resource allocation
   Insights: Need to hire 2 engineers, deadline is March 1
   Category: Projects

2. "Architecture idea"
   Summary: Proposal for microservices refactor
   Insights: Could improve scalability, needs POC first
   Category: Ideas

...

All notes analyzed and marked as Processed.

Would you like me to:
1. Create tasks for action items (2 detected)
2. Add people to contacts (3 mentioned)
3. Both
4. Neither (keep as-is)
```

## Performance Notes

- Analysis is fast (Claude API is quick)
- Parallel processing saves time
- Consider caching analyses if re-processing needed

## Quality Control

If uncertain about category, mark as "Random" and note:
```
Note: Category confidence low (40%) - may need manual review
```

## Integration Points

**Task skill**: Create action items as tasks

**Contacts**: Link or create contact entries

**Calendar**: Create events from date mentions

**Fabric patterns**: Use `extract_wisdom` or `summarize` patterns if available
