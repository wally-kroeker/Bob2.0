# ArchiveSpec

Archive a completed OpenSpec change proposal by merging it into project documentation.

## Trigger Patterns

- "archive spec [change-id]"
- "finalize spec [change-id]"
- "merge spec [change-id]"
- "complete [change-id]"
- "archive the [change-id] specification"

## Workflow

### 1. Extract Change ID

Identify which change to archive from user's request.

### 2. Verify Change Exists

```bash
# Check if change directory exists
[ -d "openspec/changes/<change-id>" ] && echo "EXISTS" || echo "NOT_EXISTS"
```

If NOT_EXISTS: List available specs.

### 3. Check Completion Status (Optional)

Before archiving, optionally verify the spec is complete:

```bash
# Count pending tasks
pending=$(grep -c "^- \[ \]" openspec/changes/<change-id>/tasks.md)

if [ "$pending" -gt 0 ]; then
  echo "⚠ Warning: $pending tasks still incomplete"
fi
```

**Ask user for confirmation if tasks incomplete:**
```
⚠ The <change-id> spec has 5 incomplete tasks.

Archive anyway?
1. Yes, archive as-is
2. No, let me finish the tasks
3. Mark remaining tasks as optional
```

### 4. Run OpenSpec Archive Command

```bash
openspec archive <change-id>
```

**What this does:**
1. Merges change files into `openspec/specs/` (or main project docs)
2. Removes the change directory from `openspec/changes/`
3. Updates any spec indices or catalogs

### 5. Verify Archive Success

```bash
# Check change directory is removed
[ ! -d "openspec/changes/<change-id>" ] && echo "✓ Archived" || echo "✗ Failed"

# Check if spec was added to archive (location may vary)
ls -la openspec/specs/ | grep "<change-id>"
```

### 6. Report Results

Confirm to user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Archived: <change-id>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Actions taken:
  ✓ Merged to project documentation
  ✓ Removed from active changes
  ✓ Task completion: 12/12 (100%)

The specification has been finalized and is now
part of the project's permanent documentation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 7. Offer Next Actions

```
Next:
  - "List specs" to see remaining active changes
  - "Create a new proposal" to start next feature
```

## Manual Archive (Fallback)

If `openspec archive` command is not available or fails:

### 1. Create Archive Directory

```bash
# Create archive location if it doesn't exist
mkdir -p openspec/specs/<change-id>
```

### 2. Copy Files

```bash
# Copy all files from change to archive
cp -r openspec/changes/<change-id>/* openspec/specs/<change-id>/
```

### 3. Add Metadata

Add archive timestamp to the proposal:

```bash
# Append archive date to proposal.md
echo "" >> openspec/specs/<change-id>/proposal.md
echo "---" >> openspec/specs/<change-id>/proposal.md
echo "**Archived:** $(date +%Y-%m-%d)" >> openspec/specs/<change-id>/proposal.md
```

### 4. Remove Active Change

```bash
# Remove from active changes
rm -rf openspec/changes/<change-id>
```

### 5. Update Spec Index (Optional)

If there's a master spec index file:

```bash
# Add entry to specs/INDEX.md
echo "- [$change_id](specs/$change_id/proposal.md) - Archived $(date +%Y-%m-%d)" >> openspec/specs/INDEX.md
```

## Pre-Archive Checklist

Before archiving, optionally run through this checklist:

```
Pre-Archive Checklist for <change-id>:

  [ ] All tasks completed
  [ ] Code implemented and merged
  [ ] Tests written and passing
  [ ] Documentation updated
  [ ] Peer review completed
  [ ] Success criteria met

Ready to archive? (y/n)
```

## Example Execution

**User:** "Archive the auth-system spec"

**Check tasks:**
```bash
grep -c "^- \[ \]" openspec/changes/auth-system/tasks.md
# Output: 2
```

**Response:**
```
⚠ The auth-system spec has 2 incomplete tasks:
  - Add rate limiting to login endpoint
  - Write integration tests for token refresh

Would you like to:
1. Finish these tasks first
2. Archive with incomplete tasks (mark as optional)
3. Cancel archiving

Your choice?
```

**User:** "Archive it, those are optional"

**Execute:**
```bash
openspec archive auth-system
```

**Response:**
```
✓ Successfully archived: auth-system

Summary:
  Title: User Authentication System
  Tasks: 10/12 completed (83%)
  Files archived: proposal.md, tasks.md, api-design.md

Location: openspec/specs/auth-system/

The auth-system specification is now part of your
project's permanent documentation.

Active specs remaining: 2
  - dark-mode
  - api-refactor
```

## Archive Formats

Different projects may archive specs differently:

### Format 1: Flat Archive
```
openspec/
├── changes/          # Active
└── archive/          # Completed
    ├── auth-system.md
    └── dark-mode.md
```

### Format 2: Dated Archive
```
openspec/
├── changes/          # Active
└── archive/
    └── 2026-01/
        ├── auth-system/
        └── dark-mode/
```

### Format 3: Integrated Docs
```
docs/
├── specs/
│   ├── auth-system.md    # From openspec
│   └── dark-mode.md      # From openspec
└── README.md
```

The `openspec archive` command should handle the project's configured format automatically.

## Error Handling

**Error: Change not found**
```
Cannot archive: spec 'auth-system' not found.

Active specs:
  - dark-mode
  - api-refactor

Try: "archive spec dark-mode"
```

**Error: Archive command fails**
```
✗ OpenSpec archive command failed.

Attempting manual archive...

[... manual archive steps ...]

✓ Manual archive successful
```

**Error: Tasks incomplete**
```
⚠ Cannot archive: spec has 8 incomplete tasks.

Options:
1. Finish remaining tasks
2. Mark tasks as optional and archive
3. Convert to new spec (split incomplete work)

Which would you like?
```

**Error: Archive location conflict**
```
✗ Archive failed: openspec/specs/auth-system already exists

This might be a previously archived spec with the same name.

Actions:
1. Rename: "auth-system-v2"
2. Overwrite existing archive
3. Cancel archiving

Choose an option:
```

## Post-Archive Actions

After successful archiving, optionally:

### 1. Git Commit

```bash
git add openspec/
git commit -m "Archive spec: <change-id> - [Brief description]"
```

### 2. Notification

If using a notification system, announce:
```
"Specification '<change-id>' has been completed and archived."
```

### 3. Update Project Status

If tracking project status elsewhere (Vikunja, GitHub Projects, etc.), mark as complete.

### 4. Generate Changelog Entry

Extract key information for CHANGELOG.md:
```markdown
## [Version] - 2026-01-13

### Added
- User Authentication System (spec: auth-system)
  - JWT-based authentication
  - Login/logout endpoints
  - Token refresh mechanism
```
