# Search Scratchpad

Search for content across all scratchpad folders (active and archived) using grep-based search.

## When to Use

- User says "search scratchpad for [query]"
- User says "find in scratchpad [query]"
- User asks "what did I save about [topic]?"
- User wants to find previously saved research or notes

## Steps

### 1. Parse Search Query

Extract the search query from user input:

**Examples:**
- "search scratchpad for security assessment" → query: "security assessment"
- "what did I save about CIS Controls?" → query: "CIS Controls"
- "find in scratchpad goodfields" → query: "goodfields"

### 2. Determine Search Scope

Check if user wants to include archive:

**Default:** Search active scratchpad only (`$SCRATCHPAD_DIR/`)
**Include archive:** If user says "including archive" or "search all"

```typescript
const includeArchive = userInput.includes('including archive') ||
                      userInput.includes('search all') ||
                      userInput.includes('everywhere');

const searchPaths = includeArchive
  ? [`${scratchpadDir}/`, `${scratchpadDir}/archive/`]
  : [`${scratchpadDir}/`];
```

### 3. Execute Grep Search

Use the Grep tool for fast content search:

```typescript
// Search for query in all markdown files
const results = await Grep({
  pattern: query,
  path: scratchpadDir,
  output_mode: 'files_with_matches',
  '-i': true, // Case insensitive
  '-C': 3, // Show 3 lines of context
  glob: '**/*.md' // Only search markdown files
});
```

### 4. Parse Results and Extract Metadata

For each match:

1. Extract folder name from path
2. Parse timestamp from folder name
3. Get description from folder name
4. Check if in archive (path contains `/archive/`)
5. Read first few lines for preview

```typescript
interface SearchResult {
  path: string;          // 2025-01-05-143000_cis-controls-research
  created: string;       // 2025-01-05
  description: string;   // cis-controls-research
  archived: boolean;     // false or true
  location: string;      // scratchpad/ or archive/2025-01/
  preview: string;       // First 200 chars of README.md
  matchCount?: number;   // Optional: number of matches
}
```

### 5. Sort Results

Sort by relevance and recency:

1. **Primary sort:** Non-archived before archived
2. **Secondary sort:** Most recent first (by timestamp)
3. **Tertiary sort:** Match count (if available)

### 6. Format Results

Present results in clean, scannable format:

```
Found {count} match{es} {in active scratchpad | including archive}:

1. {folder-description}
   Created: {YYYY-MM-DD}
   {Location: archive/YYYY-MM/ (if archived)}
   Preview: {first 100 chars of content}...

2. {folder-description}
   Created: {YYYY-MM-DD}
   Preview: {first 100 chars of content}...

...

{Showing first 20 results | Total: 45 matches - narrow search for more specific results}
```

### 7. Handle No Results

If no matches found:

```
No results found for "{query}" in scratchpad.

Try:
- Searching with different keywords
- Including archive: "search scratchpad for {query} including archive"
- Listing recent items: "show recent scratchpad items"
```

## Example Execution

**User:** "search scratchpad for security assessment"

**Assistant:**
1. Parses query: "security assessment"
2. Searches: `$SCRATCHPAD_DIR/` (active only)
3. Finds: 3 matches
4. Returns:
   ```
   Found 3 matches:

   1. smb-security-assessment-research
      Created: 2025-01-05
      Preview: Research on CIS Controls for SMB security - IG1 and IG2 implementation guide...

   2. cis-controls-v8-research
      Created: 2025-12-01
      Preview: Comprehensive CIS Controls v8 research with security assessment framework...

   3. security-quote-templates
      Created: 2025-01-02
      Preview: Templates for security assessment proposals and SOW documents...

   Narrow search: "search scratchpad for CIS Controls security"
   ```

## Example: Including Archive

**User:** "search scratchpad for goodfields including archive"

**Assistant:**
1. Parses query: "goodfields"
2. Searches: Active + Archive
3. Returns:
   ```
   Found 2 matches (including archive):

   1. goodfields-design-review
      Created: 2025-10-23
      Location: archive/2024-10/
      Preview: Design critique for GoodFields website with recommendations...

   2. goodfields-incorporation-docs
      Created: 2025-01-03
      Preview: Corporation documents and business numbers for GoodFields Inc...
   ```

## Edge Cases

### Empty Query

```
Error: Please provide a search query.

Examples:
- "search scratchpad for security"
- "what did I save about CIS Controls?"
```

### Too Many Results

If >50 results:

```
Found 127 matches for "{query}".

Showing first 20 results:
[...]

Too many results. Try narrowing your search:
- Add more specific keywords
- Include date range (future enhancement)
- Filter by topic (future enhancement)
```

### Search Index Available

If `.scratchpad-index.json` exists, use it for faster initial filtering:

```typescript
// Read index
const index = await readIndex();

// Filter entries matching query
const candidates = index.entries.filter(entry =>
  entry.description.includes(query.toLowerCase()) ||
  entry.tags?.some(tag => tag.includes(query.toLowerCase()))
);

// Then grep within candidate folders for exact matches
```

## Advanced Search Patterns

### Regex Support

Users can provide regex patterns:

```
User: "search scratchpad for 'CVE-\\d{4}-\\d{4,}'"
→ Find CVE identifiers
```

### Multi-term Search

```
User: "search scratchpad for 'security AND assessment'"
→ Both terms must appear (future enhancement)
```

## Tools Used

- `Grep` tool - Fast content search with ripgrep
- `Read` tool - Read index and preview files
- `indexer.searchIndex(query)` - Optional fast pre-filter using index

## Success Criteria

- [ ] Query extracted from user input
- [ ] Search scope determined (active vs all)
- [ ] Grep search executed successfully
- [ ] Results parsed and sorted correctly
- [ ] Preview text extracted from matches
- [ ] Results formatted clearly for user
- [ ] "No results" handled gracefully
