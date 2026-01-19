# ValidateSpec

Validate an OpenSpec change proposal for integrity and completeness.

## Trigger Patterns

- "validate spec [change-id]"
- "check spec [change-id]"
- "verify spec integrity"
- "is the [change-id] spec valid"

## Workflow

### 1. Extract Change ID

Identify the change to validate from user's request.

### 2. Run OpenSpec Validate Command

```bash
openspec validate <change-id>
```

**Expected output:**
- Validation success or failure
- List of issues found (if any)
- Warnings about missing sections

### 3. Manual Validation (Fallback)

If `openspec validate` is not available, perform manual checks:

#### Check 1: Required Files Exist

```bash
# Check for proposal.md
[ -f "openspec/changes/<change-id>/proposal.md" ] && echo "✓ proposal.md" || echo "✗ MISSING: proposal.md"

# Check for tasks.md
[ -f "openspec/changes/<change-id>/tasks.md" ] && echo "✓ tasks.md" || echo "✗ MISSING: tasks.md"
```

#### Check 2: Proposal Structure

Verify proposal.md contains required sections:

```bash
# Required sections
grep -q "^# " openspec/changes/<change-id>/proposal.md && echo "✓ Title" || echo "✗ Missing title"
grep -q "^## Overview" openspec/changes/<change-id>/proposal.md && echo "✓ Overview" || echo "⚠ Missing overview"
grep -q "^## Motivation" openspec/changes/<change-id>/proposal.md && echo "✓ Motivation" || echo "⚠ Missing motivation"
```

#### Check 3: Tasks Structure

Verify tasks.md has actionable items:

```bash
# Count tasks
task_count=$(grep -c "^- \[" openspec/changes/<change-id>/tasks.md)

if [ "$task_count" -gt 0 ]; then
  echo "✓ $task_count tasks defined"
else
  echo "✗ No tasks found"
fi
```

#### Check 4: No Empty Files

```bash
# Check file sizes
for file in openspec/changes/<change-id>/*.md; do
  if [ -s "$file" ]; then
    echo "✓ $(basename $file) has content"
  else
    echo "✗ $(basename $file) is empty"
  fi
done
```

### 4. Report Validation Results

Format the results clearly:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Validation: <change-id>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED FILES
  ✓ proposal.md exists
  ✓ tasks.md exists

PROPOSAL STRUCTURE
  ✓ Title present
  ✓ Overview section
  ✓ Motivation section
  ⚠ Success Criteria missing

TASKS
  ✓ 12 tasks defined
  ⚠ 0 tasks completed

ISSUES FOUND: 2 warnings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ⚠ VALID WITH WARNINGS

Recommendations:
  - Add Success Criteria to proposal.md
  - Start completing tasks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Provide Recommendations

Based on validation results:

**If fully valid:**
```
✓ Spec is valid and ready for implementation.

Next: "Implement the <change-id> spec"
```

**If missing sections:**
```
⚠ Spec is missing recommended sections.

Would you like me to add:
  - Success Criteria
  - Risk & Considerations
```

**If critical errors:**
```
✗ Spec has critical errors and cannot be implemented.

Fix these issues:
  - proposal.md is empty
  - No tasks defined

Action: "Update the <change-id> spec"
```

## Validation Levels

### Level 1: Critical (Must Pass)
- [ ] proposal.md exists
- [ ] tasks.md exists
- [ ] Files are not empty
- [ ] Change directory exists

### Level 2: Recommended (Should Pass)
- [ ] Proposal has title
- [ ] Proposal has Overview section
- [ ] Proposal has Motivation section
- [ ] At least 1 task defined

### Level 3: Best Practice (Nice to Have)
- [ ] Success Criteria defined
- [ ] Risks & Considerations section
- [ ] Tasks organized by phase
- [ ] Some tasks completed

## Example Execution

**User:** "Validate the auth-system spec"

**Response:**
```
🔍 Validating spec: auth-system

CRITICAL CHECKS
  ✓ proposal.md exists (2.3 KB)
  ✓ tasks.md exists (1.8 KB)
  ✓ Files have content

STRUCTURE CHECKS
  ✓ Title: "User Authentication System"
  ✓ Overview section present
  ✓ Motivation section present
  ✓ Proposed Solution present
  ✓ Success Criteria present (3 items)

TASK CHECKS
  ✓ 12 tasks defined
  ✓ Tasks organized into 4 phases
  ✓ 5 tasks completed (42%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ VALIDATION PASSED

The auth-system spec is well-formed and ready for
implementation. 58% of tasks remaining.

Next: "Implement the next task"
```

## Advanced Validation

### Check for Broken Links

If the proposal references other files or specs:

```bash
# Extract [link](path) references
grep -o '\[.*\](.*\.md)' openspec/changes/<change-id>/proposal.md | \
  sed 's/.*](\(.*\))/\1/' | \
  while read -r link; do
    [ -f "$link" ] && echo "✓ $link" || echo "✗ BROKEN: $link"
  done
```

### Check Task Completeness

Ensure tasks are properly formatted:

```bash
# Find tasks with improper format
grep "^- \[" openspec/changes/<change-id>/tasks.md | \
  grep -v "^- \[[ x]\]" && echo "⚠ Found malformed task checkboxes"
```

### Estimate Effort

Count approximate complexity:

```bash
total_tasks=$(grep -c "^- \[" tasks.md)

if [ "$total_tasks" -lt 5 ]; then
  echo "Complexity: SMALL (< 5 tasks)"
elif [ "$total_tasks" -lt 15 ]; then
  echo "Complexity: MEDIUM (5-15 tasks)"
else
  echo "Complexity: LARGE (15+ tasks)"
fi
```

## Error Handling

**Error: Change not found**
```
Cannot validate: spec 'auth-system' not found.

Available specs:
  - dark-mode
  - api-refactor

Try: "validate spec dark-mode"
```

**Error: openspec validate command fails**
```
OpenSpec CLI validation failed. Running manual validation...

[... manual validation results ...]
```

**Error: Spec is corrupted**
```
✗ CRITICAL ERROR: Spec is corrupted

Issues:
  - proposal.md is empty
  - tasks.md is missing

Recommended action:
  1. Backup: cp -r openspec/changes/<change-id> /tmp/backup
  2. Delete: rm -rf openspec/changes/<change-id>
  3. Recreate: "Create a proposal for [feature]"
```
