# ReadSpec

Read and display the contents of an OpenSpec change proposal.

## Trigger Patterns

- "read spec [change-id]"
- "show spec [change-id]"
- "view [change-id]"
- "what's in the [change-id] spec"
- "show me the [change-id] proposal"

## Workflow

### 1. Extract Change ID

From the user's request, identify the change ID:
- Direct mention: "show spec auth-system" → `auth-system`
- Natural language: "what's in the dark mode spec" → `dark-mode`

### 2. Verify Change Exists

```bash
# Check if change directory exists
[ -d "openspec/changes/<change-id>" ] && echo "EXISTS" || echo "NOT_EXISTS"
```

If NOT_EXISTS: List available specs and ask user to clarify.

### 3. Read Proposal File

```bash
cat openspec/changes/<change-id>/proposal.md
```

### 4. Read Tasks File

```bash
cat openspec/changes/<change-id>/tasks.md
```

### 5. Check for Additional Files

```bash
# List all files in the change directory
ls -la openspec/changes/<change-id>/
```

Common additional files:
- `api-design.md` - API specifications
- `architecture.md` - System design
- `migration.md` - Migration plan
- `tests.md` - Test plan

### 6. Format and Present

Display the content in a structured format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Specification: <change-id>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PROPOSAL
────────────────────────────────────────
[Contents of proposal.md]

✅ TASKS
────────────────────────────────────────
[Contents of tasks.md]

📁 ADDITIONAL FILES
────────────────────────────────────────
[List any other files present]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 7. Summarize Status

Analyze the tasks.md to determine progress:

```bash
# Count total tasks
total=$(grep -c "^- \[" openspec/changes/<change-id>/tasks.md)

# Count completed tasks
completed=$(grep -c "^- \[x\]" openspec/changes/<change-id>/tasks.md)

# Calculate percentage
echo "Progress: $completed/$total tasks ($((completed * 100 / total))%)"
```

### 8. Offer Next Actions

Based on the spec content, suggest:
```
Options:
1. "Implement this spec" - Start working on the tasks
2. "Update the spec" - Modify proposal or tasks
3. "Archive this spec" - Mark as complete and merge
4. "Validate this spec" - Check integrity
```

## Example Execution

**User:** "Show me the auth-system spec"

**Response:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Specification: auth-system
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PROPOSAL
────────────────────────────────────────
# User Authentication System

**Change ID:** auth-system
**Created:** 2026-01-13
**Status:** In Progress

## Overview
Implement JWT-based authentication with login, logout,
and token refresh capabilities.

## Motivation
Current system lacks proper authentication. Users need
secure access control before we can add user-specific
features.

[... rest of proposal ...]

✅ TASKS (Progress: 5/12 - 42%)
────────────────────────────────────────
## Implementation Tasks

### Phase 1: Planning & Design
- [x] Review existing user model
- [x] Design JWT token structure
- [x] Identify dependencies (jsonwebtoken, bcrypt)

### Phase 2: Implementation
- [x] Set up JWT middleware
- [x] Create login endpoint
- [ ] Create logout endpoint
- [ ] Implement token refresh
- [ ] Add password hashing
- [ ] Create user registration

[... rest of tasks ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
- "Implement the next task" (logout endpoint)
- "Update this spec"
- "Validate this spec"
```

## Advanced: Read Specific Section

If user requests a specific section:

**User:** "What are the tasks for auth-system?"

**Response:** Show only tasks.md, not the full proposal.

**User:** "What's the motivation for dark-mode?"

**Response:** Extract and show only the Motivation section from proposal.md.

## Error Handling

**Error: Change not found**
```
Spec 'auth-system' not found.

Active specs:
  - dark-mode
  - api-refactor

Try: "show spec dark-mode"
```

**Error: Missing proposal.md**
```
The 'auth-system' change exists but is missing proposal.md.

This might be a corrupted spec. Files present:
  - tasks.md

Recreate or delete: rm -rf openspec/changes/auth-system
```

**Error: Empty spec**
```
The 'auth-system' spec exists but appears empty.

Would you like me to:
1. Regenerate the proposal
2. Delete the spec
```

## Parsing Tips

### Extract Title
```bash
grep -m 1 "^# " proposal.md | sed 's/^# //'
```

### Extract Status
```bash
grep "Status:" proposal.md | sed 's/.*Status: *//'
```

### Extract Success Criteria
```bash
sed -n '/## Success Criteria/,/^## /p' proposal.md | grep "^- \["
```

### Count Task Progress
```bash
total=$(grep -c "^- \[" tasks.md)
done=$(grep -c "^- \[x\]" tasks.md)
percent=$((done * 100 / total))
echo "$done/$total ($percent%)"
```
