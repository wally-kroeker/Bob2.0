# Save to Scratchpad

Save content to a timestamped folder in the scratchpad.

## When to Use

- User says "save this to scratchpad"
- User says "put this in scratchpad"
- User asks to save research, notes, or drafts
- Content should be preserved but not formally documented

## Steps

### 1. Gather Content and Description

Extract the content to save and optionally a description:

- **Content**: The text, data, or research to save
- **Description**: Optional user-provided description or inferred from context

**Examples:**
- User: "Save this research to scratchpad" → Content: previous output, Description: infer from content
- User: "Save this CIS Controls research to scratchpad" → Content: previous output, Description: "cis-controls-research"

### 2. Generate Timestamp and Folder Name

Create a folder name using this format:

```
YYYY-MM-DD-HHMMSS_description
```

**Process:**
1. Get current timestamp: `YYYY-MM-DD-HHMMSS` (24-hour format)
2. Sanitize description:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep only: a-z, 0-9, hyphens)
   - Truncate to 50 characters max
3. Combine: `{timestamp}_{description}`

**Examples:**
- Input: "CIS Controls Research" → `2025-01-05-143000_cis-controls-research`
- Input: "Meeting Brief for Circuit & Chisel" → `2025-01-05-143000_meeting-brief-for-circuit-chisel`
- No description → `2025-01-05-143000_untitled`

### 3. Create Folder

Create the folder in scratchpad:

```typescript
const scratchpadDir = process.env.SCRATCHPAD_DIR || `${process.env.PAI_DIR}/scratchpad`;
const folderPath = `${scratchpadDir}/${folderName}`;

// Create folder
await Deno.mkdir(folderPath, { recursive: true });
```

### 4. Save Content

Save the content to the folder:

**Single content block:**
```typescript
// Save as README.md
const readmePath = `${folderPath}/README.md`;
await Deno.writeTextFile(readmePath, content);
```

**Multiple files:**
```typescript
// If content includes multiple named sections, save as separate files
// Example: research.md, notes.md, links.md
```

### 5. Generate Context File

Create a README.md (or prepend to existing) with metadata:

```markdown
# {Title from Description}

**Created**: {YYYY-MM-DD HH:MM:SS}
**Agent**: {DA name if available}
**Session**: {session_id if available}
**Context**: {Brief context about how this was created}

---

{Content or "See files in this folder"}
```

**Example:**
```markdown
# CIS Controls Research

**Created**: 2025-01-05 14:30:00
**Agent**: Bob
**Session**: abc123
**Context**: Research on CIS Controls v8 for SMB security assessments

---

[Content follows...]
```

### 6. Update Index

Call the indexer to add this entry:

```typescript
import { addEntry } from '$PAI_DIR/tools/lib/indexer.ts';

await addEntry({
  path: folderName,
  created: new Date().toISOString(),
  description: sanitizedDescription,
  archived: false,
  tags: [], // Future: extract keywords from content
  size_kb: Math.round(contentSize / 1024)
});
```

### 7. Return Confirmation

Provide clear confirmation to the user:

```
Saved to scratchpad: scratchpad/{folderName}/

The folder contains:
- README.md ({size}KB)
{- additional files if applicable}

You can find it later by searching: "search scratchpad for {key terms}"
```

## Example Execution

**User:** "Can you research CIS Controls for SMB security assessments and save it to scratchpad?"

**Assistant:**
1. Conducts research (using WebSearch, WebFetch, etc.)
2. Executes Save workflow:
   - Timestamp: 2025-01-05-143000
   - Description: "cis-controls-smb-security"
   - Creates: `scratchpad/2025-01-05-143000_cis-controls-smb-security/`
   - Saves: README.md with research
   - Updates index
3. Returns:
   ```
   Saved to scratchpad: scratchpad/2025-01-05-143000_cis-controls-smb-security/

   The folder contains:
   - README.md (12KB)

   You can find it later by searching: "search scratchpad for cis controls"
   ```

## Edge Cases

### No Description Provided

Use "untitled" or infer from content:

```typescript
if (!description) {
  // Try to infer from first line or key terms in content
  description = inferDescription(content) || 'untitled';
}
```

### Folder Name Collision

If folder already exists with same timestamp:

```typescript
if (await exists(folderPath)) {
  // Append counter: 2025-01-05-143000_description-2
  folderName = `${folderName}-2`;
}
```

### Empty Content

Minimum check before saving:

```typescript
if (!content || content.trim().length < 10) {
  return "Error: Content too short to save. Provide content to save.";
}
```

## Tools Used

- `ScratchpadManager.save(content, description?)` - Main save function
- `indexer.addEntry(metadata)` - Update search index
- `Write` tool - Create files
- `Bash` tool (if needed for mkdir/file operations)

## Success Criteria

- [ ] Folder created with correct timestamp format
- [ ] Content saved to folder
- [ ] README.md contains metadata (created, agent, context)
- [ ] Index updated with new entry
- [ ] User receives confirmation with folder path
