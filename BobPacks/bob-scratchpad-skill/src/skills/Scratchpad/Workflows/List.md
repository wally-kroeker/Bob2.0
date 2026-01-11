# List Scratchpad Items

Show recent scratchpad folders by date, providing a quick overview of saved content.

## When to Use

- User says "show recent scratchpad items"
- User says "list scratchpad folders"
- User asks "what's in scratchpad?"
- User wants to browse scratchpad without specific search
- User asks "what did I save recently?"

## Steps

### 1. Parse Parameters

Extract optional parameters from user input:

**Days back** (default: 30):
- "show scratchpad items from last week" → 7 days
- "show scratchpad items from last month" → 30 days
- "show all scratchpad items" → no limit

**Limit** (default: 20):
- "show top 10 scratchpad items" → 10
- "show 50 scratchpad items" → 50

```typescript
interface ListParams {
  daysBack?: number;  // Default: 30
  limit?: number;     // Default: 20
  includeArchive?: boolean; // Default: false
}
```

### 2. Scan Scratchpad Directory

List all folders in scratchpad:

```bash
# List folders sorted by modification time (most recent first)
ls -lt "$SCRATCHPAD_DIR"/ | grep '^d' | head -n {limit}
```

**Or using index:**
```typescript
const index = await readIndex();
const entries = index.entries
  .filter(e => !e.archived) // Exclude archived by default
  .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
```

### 3. Filter by Date Range

If `daysBack` specified:

```typescript
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - daysBack);

const filtered = entries.filter(entry =>
  new Date(entry.created) >= cutoffDate
);
```

### 4. Extract Metadata

For each folder:

```typescript
interface ListItem {
  date: string;           // YYYY-MM-DD
  time?: string;          // HH:MM (optional)
  description: string;    // Human-readable description
  path: string;           // Full folder name with timestamp
  archived: boolean;      // Is this in archive/?
  size?: string;          // Optional: folder size
}
```

**Parse from folder name:**
```
2025-01-05-143000_cis-controls-research/
↓
{
  date: "2025-01-05",
  time: "14:30",
  description: "cis-controls-research",
  path: "2025-01-05-143000_cis-controls-research"
}
```

### 5. Group by Date (Optional)

For better readability, group items by date:

```
Recent scratchpad items (last 30 days):

2025-01-05 (3 items):
  14:30 - cis-controls-smb-research
  12:15 - meeting-brief-circuit-chisel
  09:00 - vdi-project-questions

2025-01-04 (2 items):
  16:45 - security-quote-templates
  10:30 - year-of-agent-research

2025-01-03 (1 item):
  14:00 - goodfields-incorporation-docs

...
```

### 6. Format Output

**Simple list format:**
```
Recent scratchpad items (last 30 days):

2025-01-05  cis-controls-smb-research
2025-01-05  meeting-brief-circuit-chisel
2025-01-04  security-quote-templates
2025-01-03  goodfields-incorporation-docs
2025-01-02  vdi-infrastructure-notes

Total: 15 items
```

**Detailed format (with sizes):**
```
Recent scratchpad items (last 30 days):

1. 2025-01-05  cis-controls-smb-research     (12KB)
2. 2025-01-05  meeting-brief-circuit-chisel  (5KB)
3. 2025-01-04  security-quote-templates      (8KB)
4. 2025-01-03  goodfields-incorporation-docs (3KB)
5. 2025-01-02  vdi-infrastructure-notes      (15KB)

Showing 5 of 15 total items
```

### 7. Include Summary Statistics

Provide helpful context:

```
Scratchpad summary:
- Total items: 47 (active: 15, archived: 32)
- Newest: 2025-01-05
- Oldest (active): 2024-10-15
- Total size: 234 MB

To see older items: "list scratchpad including archive"
To search: "search scratchpad for [topic]"
```

## Example Execution

**User:** "show recent scratchpad items"

**Assistant:**
1. Scans scratchpad directory
2. Filters to last 30 days
3. Sorts by date (newest first)
4. Limits to 20 items
5. Returns:
   ```
   Recent scratchpad items (last 30 days):

   2025-01-05  cis-controls-smb-research
   2025-01-05  meeting-brief-circuit-chisel
   2025-01-05  vdi-project-questions
   2025-01-04  security-quote-templates
   2025-01-03  goodfields-incorporation-docs
   2025-01-02  year-of-agent-research
   2025-01-01  interview-cheat-sheet
   2024-12-30  cognitive-loop-draft
   2024-12-28  linkedin-profile-update
   2024-12-25  holiday-project-notes

   Total: 10 items (showing last 30 days)

   To search: "search scratchpad for [topic]"
   To archive old items: "archive old scratchpad data"
   ```

## Example: Specific Time Range

**User:** "show scratchpad items from last week"

**Assistant:**
```
Scratchpad items (last 7 days):

2025-01-05  cis-controls-smb-research
2025-01-05  meeting-brief-circuit-chisel
2025-01-04  security-quote-templates
2025-01-03  goodfields-incorporation-docs
2024-12-31  year-review-notes

Total: 5 items
```

## Example: Including Archive

**User:** "list all scratchpad items including archive"

**Assistant:**
```
All scratchpad items (active + archive):

Active (15 items):
2025-01-05  cis-controls-smb-research
2025-01-05  meeting-brief-circuit-chisel
2025-01-04  security-quote-templates
...

Archived (32 items):
2024-10-23  goodfields-design-review (archived 2024-10)
2024-10-21  youtube-transcript (archived 2024-10)
2024-09-15  old-research-notes (archived 2024-09)
...

Total: 47 items

Showing first 20 items. Use search to find specific content.
```

## Edge Cases

### Empty Scratchpad

```
Scratchpad is empty.

To save content: "save this to scratchpad"
To get started: Check out README.md for examples
```

### No Recent Items

If no items in specified time range:

```
No scratchpad items found in the last {daysBack} days.

Latest item: {YYYY-MM-DD} - {description}

To see all items: "list all scratchpad items"
```

### Very Large Scratchpad (>100 items)

```
Scratchpad contains 234 items.

Recent items (last 30 days - 15 items):
[list...]

Older items are archived automatically after 90 days.
Use search to find specific content: "search scratchpad for [topic]"
```

## Advanced Options

### Sort by Size

```
User: "show largest scratchpad items"
→ Sort by folder size descending
```

### Filter by Pattern

```
User: "list scratchpad items about security"
→ Filter folders with "security" in description
```

### Group by Month

```
User: "show scratchpad items by month"
→ Group entries by YYYY-MM
```

## Tools Used

- `Bash` tool with `ls -lt` - List folders by modification time
- `Read` tool - Read index file for fast listing
- `indexer.getIndex()` - Get all entries from index
- `Bash` tool with `du` - Calculate folder sizes (optional)

## Success Criteria

- [ ] Parameters parsed correctly (daysBack, limit)
- [ ] Folders listed and sorted by date
- [ ] Date range filter applied correctly
- [ ] Output formatted clearly
- [ ] Summary statistics provided
- [ ] Empty scratchpad handled gracefully
