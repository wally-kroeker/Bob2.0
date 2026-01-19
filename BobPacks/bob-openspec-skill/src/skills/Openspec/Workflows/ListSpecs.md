# ListSpecs

List all active OpenSpec change proposals in the project.

## Trigger Patterns

- "list specs"
- "show specs"
- "active changes"
- "what specs are open"
- "openspec status"

## Workflow

### 1. Check OpenSpec Initialized

```bash
# Verify openspec/ directory exists
[ -d "openspec" ] || echo "NOT_INITIALIZED"
```

If NOT_INITIALIZED: Suggest running InitializeProject workflow.

### 2. Run OpenSpec List Command

```bash
openspec list
```

**Expected output format:**
```
Active Changes:
  - auth-system
  - dark-mode
  - api-refactor
```

### 3. Enhance with Details (Optional)

For each change, optionally read the first line of proposal.md to show description:

```bash
for change in openspec/changes/*; do
  if [ -d "$change" ]; then
    change_id=$(basename "$change")
    title=$(grep -m 1 "^# " "$change/proposal.md" | sed 's/^# //')
    echo "  - $change_id: $title"
  fi
done
```

### 4. Format Output

Present to user in a clear format:

```
📋 Active OpenSpec Changes:

1. auth-system
   User Authentication
   Status: Proposal

2. dark-mode
   Dark Mode Support
   Status: In Progress

3. api-refactor
   API Restructure
   Status: Proposal

Total: 3 active changes
```

### 5. Offer Next Actions

Suggest what the user can do:
```
To view a spec: "Show me the [change-id] spec"
To create new:  "Create a proposal for [feature]"
To archive:     "Archive the [change-id] spec"
```

## Alternative: Manual Directory Listing

If `openspec list` command is not available or fails:

```bash
# List change directories
ls -1 openspec/changes/

# Get more details
find openspec/changes -maxdepth 1 -type d | tail -n +2
```

## Example Output

**User:** "What OpenSpec changes are in progress?"

**Response:**
```
📋 Active Specifications:

1. user-auth (User Authentication System)
   Created: 2026-01-13
   Files: proposal.md, tasks.md

2. payment-gateway (Stripe Payment Integration)
   Created: 2026-01-12
   Files: proposal.md, tasks.md, api-design.md

Total: 2 active changes

Next: "show me the user-auth spec" or "create a new proposal"
```

## Error Handling

**Error: "openspec: command not found"**
- Solution: Fall back to manual directory listing
  ```bash
  ls -1 openspec/changes/
  ```

**Error: No active changes**
- Response:
  ```
  No active OpenSpec changes found.

  Start a new specification:
    "Create a proposal for [feature name]"
  ```

**Error: openspec/ directory missing**
- Response:
  ```
  OpenSpec not initialized in this project.

  Run: "Initialize OpenSpec"
  ```
