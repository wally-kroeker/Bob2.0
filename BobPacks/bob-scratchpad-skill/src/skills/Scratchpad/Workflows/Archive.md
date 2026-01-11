# Archive Old Scratchpad Data

Move scratchpad folders older than a threshold (default 90 days) to the archive directory to keep the active workspace clean.

## When to Use

- User says "archive old scratchpad data"
- User says "clean up scratchpad"
- User asks "move old items to archive"
- Automated periodic cleanup (if configured)
- Active scratchpad is getting cluttered

## Steps

### 1. Parse Parameters

Extract optional parameters:

**Threshold** (default: 90 days):
- Uses `SCRATCHPAD_ARCHIVE_DAYS` environment variable
- User can override: "archive items older than 60 days"

**Dry run** (default: true):
- Show what would be archived without actually moving
- User must confirm with "--execute" or "do it"

```typescript
interface ArchiveParams {
  daysThreshold: number;  // Default: from env or 90
  dryRun: boolean;        // Default: true
  force?: boolean;        // Skip confirmation if true
}
```

### 2. Calculate Cutoff Date

Determine which items are "old":

```typescript
const threshold = process.env.SCRATCHPAD_ARCHIVE_DAYS || 90;
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - threshold);

console.log(`Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);
console.log(`Items older than ${threshold} days will be archived.`);
```

### 3. Scan for Old Items

Find folders older than threshold:

```typescript
const scratchpadDir = process.env.SCRATCHPAD_DIR || `${process.env.PAI_DIR}/scratchpad`;

// List all folders (exclude archive/ itself)
const folders = await listFolders(scratchpadDir);

// Filter to those older than threshold
const oldFolders = folders.filter(folder => {
  // Parse timestamp from folder name
  const timestamp = parseTimestamp(folder); // Extract YYYY-MM-DD-HHMMSS
  const folderDate = new Date(timestamp);

  return folderDate < cutoffDate;
});
```

**Parse timestamp from folder name:**
```typescript
function parseTimestamp(folderName: string): string {
  // Extract: "2024-10-21-205742_description" → "2024-10-21"
  const match = folderName.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    // Fall back to filesystem mtime
    return getModificationTime(folderPath);
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}
```

### 4. Calculate Age for Each Item

Show user exactly how old each item is:

```typescript
interface ArchiveCandidate {
  path: string;
  created: Date;
  age: number;  // Days old
  sizeKB: number;
  description: string;
}
```

### 5. Show Preview (Dry Run)

If `dryRun: true`, show what would be archived:

```
Checking for content older than 90 days...

Would archive 5 items:

1. 2024-10-21-205742_youtube-transcript
   Age: 95 days
   Size: 2.3 MB
   → archive/2024-10/2024-10-21-205742_youtube-transcript/

2. 2024-10-23-183226_algorithmic-art-party
   Age: 93 days
   Size: 512 KB
   → archive/2024-10/2024-10-23-183226_algorithmic-art-party/

3. 2024-10-23-225809_goodfields-design-review
   Age: 93 days
   Size: 1.1 MB
   → archive/2024-10/2024-10-23-225809_goodfields-design-review/

4. 2024-10-24-150200_wallykroeker-design-review
   Age: 92 days
   Size: 856 KB
   → archive/2024-10/2024-10-24-150200_wallykroeker-design-review/

5. 2024-10-26-151451_bob-capabilities
   Age: 90 days
   Size: 3.4 MB
   → archive/2024-10/2024-10-26-151451_bob-capabilities/

Total: 5 items, 8.1 MB

Run with --execute to perform archival:
"archive old scratchpad data --execute"

OR just say: "do it"
```

### 6. Execute Archival (If Confirmed)

If user confirms with "--execute" or "do it":

For each old folder:

1. **Create archive month directory:**
   ```typescript
   const archiveMonth = `${year}-${month}`; // e.g., "2024-10"
   const archiveDir = `${scratchpadDir}/archive/${archiveMonth}`;
   await mkdir(archiveDir, { recursive: true });
   ```

2. **Move folder to archive:**
   ```typescript
   const sourcePath = `${scratchpadDir}/${folderName}`;
   const destPath = `${archiveDir}/${folderName}`;

   await rename(sourcePath, destPath);
   ```

3. **Update index:**
   ```typescript
   import { updateEntry } from '$PAI_DIR/tools/lib/indexer.ts';

   await updateEntry(folderName, {
     archived: true,
     archivedDate: new Date().toISOString(),
     archivedTo: `archive/${archiveMonth}/`
   });
   ```

4. **Log progress:**
   ```
   ✓ Moved to archive/2024-10/2024-10-21-205742_youtube-transcript/
   ✓ Moved to archive/2024-10/2024-10-23-183226_algorithmic-art-party/
   ...
   ```

### 7. Update Last Archive Check

Record when archival was last run:

```typescript
const index = await readIndex();
index.last_archive_check = new Date().toISOString();
await writeIndex(index);
```

### 8. Return Summary

Provide clear summary of what was done:

```
Archival complete!

Archived 5 items to archive/:
- archive/2024-10/ (5 items, 8.1 MB)

Active scratchpad now contains:
- 15 items (last 90 days)
- 24.5 MB total

Archived items remain searchable.
To search archive: "search scratchpad for [query] including archive"
```

## Example Execution (Dry Run)

**User:** "archive old scratchpad data"

**Assistant:**
1. Reads SCRATCHPAD_ARCHIVE_DAYS (90)
2. Calculates cutoff: 2024-10-07 (90 days ago from 2025-01-05)
3. Scans scratchpad for folders older than cutoff
4. Finds 5 candidates
5. Shows preview (dry run)
6. Waits for confirmation

## Example Execution (Execute)

**User:** "do it"

**Assistant:**
1. Confirms user wants to execute
2. Creates archive/2024-10/ directory
3. Moves each folder to archive
4. Updates index entries (archived: true)
5. Updates last_archive_check timestamp
6. Returns summary

## Edge Cases

### No Old Items

```
Checking for content older than 90 days...

No items found that need archiving.

Oldest active item: 2024-11-15 (51 days old)

Everything in your scratchpad is recent!
```

### All Items Are Old

If everything would be archived:

```
Warning: All 47 scratchpad items are older than 90 days!

This would archive EVERYTHING in your active scratchpad.

Options:
1. Increase threshold: "archive items older than 180 days"
2. Review items first: "list all scratchpad items"
3. Search for what you need: "search scratchpad for [topic]"

Are you sure you want to archive everything? (yes/no)
```

### Archive Directory Collision

If folder already exists in archive:

```typescript
if (await exists(destPath)) {
  // Rename with counter
  destPath = `${destPath}-duplicate`;
  console.warn(`⚠️  Folder already exists, renamed to ${folderName}-duplicate`);
}
```

### Filesystem Errors

Handle move errors gracefully:

```typescript
try {
  await rename(sourcePath, destPath);
  console.log(`✓ Moved to ${destPath}`);
} catch (error) {
  console.error(`✗ Failed to move ${folderName}: ${error.message}`);
  // Continue with other folders, collect errors
  errors.push({ folder: folderName, error });
}

// At end, report any errors
if (errors.length > 0) {
  console.log(`\n⚠️  ${errors.length} items failed to archive. See details above.`);
}
```

## Advanced Options

### Custom Threshold

```
User: "archive items older than 60 days"
→ Override SCRATCHPAD_ARCHIVE_DAYS for this run
```

### Selective Archival

```
User: "archive scratchpad items about [topic]"
→ Filter candidates by topic before archiving (future enhancement)
```

### Compress Before Archive

```typescript
// Future: Tar/gzip folders before moving to archive
await compress(`${folderName}.tar.gz`, sourcePath);
await move(`${folderName}.tar.gz`, archiveDir);
```

## Automated Archival (Future)

Option to run archival automatically:

**Cron job:**
```bash
# Run archival monthly on the 1st at 2am
0 2 1 * * bun run $PAI_DIR/tools/ScratchpadManager.ts archive --execute --silent
```

**Hook-based:**
```typescript
// Run on SessionStart if >7 days since last check
if (daysSinceLastCheck > 7) {
  await archiveOldContent(90, true); // Dry run only
  console.log("Note: 5 old items ready for archival. Run 'archive old scratchpad data'");
}
```

## Tools Used

- `archiver.archiveOldContent(threshold, dryRun)` - Main archival logic
- `indexer.updateEntry(path, updates)` - Mark entries as archived
- `Bash` tool with `mv` - Move folders
- `Bash` tool with `mkdir` - Create archive directories
- `Read`/`Write` tools - Update index file

## Success Criteria

- [ ] Threshold calculated correctly
- [ ] Old folders identified accurately
- [ ] Dry run shows preview without moving files
- [ ] Execute actually moves folders to archive/YYYY-MM/
- [ ] Index updated with archived status
- [ ] Last archive check timestamp updated
- [ ] Summary provided to user
- [ ] Archived items remain searchable
- [ ] Errors handled gracefully
