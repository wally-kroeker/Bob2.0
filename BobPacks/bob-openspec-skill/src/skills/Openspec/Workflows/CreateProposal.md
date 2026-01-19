# CreateProposal

Create a new OpenSpec change proposal with scaffolded proposal.md and tasks.md files.

## Trigger Patterns

- "create spec for [feature]"
- "new openspec proposal"
- "openspec proposal for [description]"
- "spec [feature name]"

## Workflow

### 1. Extract Change Information

From the user's request, extract:
- **Feature name**: The main subject (e.g., "user authentication", "dark mode", "API refactor")
- **Description**: What the change accomplishes

### 2. Generate Change ID

Create a URL-safe change ID from the feature name:

```bash
# Example: "User Authentication" → "user-authentication"
# Example: "Add Dark Mode Toggle" → "dark-mode-toggle"
```

Rules:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Keep it short and descriptive (2-4 words)

### 3. Check if Change Already Exists

```bash
# Check if change directory exists
[ -d "openspec/changes/<change-id>" ] && echo "EXISTS" || echo "NOT_EXISTS"
```

If EXISTS: Ask user if they want to overwrite or use a different ID.

### 4. Create Change Directory

```bash
mkdir -p "openspec/changes/<change-id>"
```

### 5. Generate proposal.md

Create `openspec/changes/<change-id>/proposal.md` with this template:

```markdown
# [Feature Name]

**Change ID:** <change-id>
**Created:** <current-date>
**Status:** Proposal

## Overview

[Brief description of what this change accomplishes]

## Motivation

[Why this change is needed]

## Proposed Solution

[High-level approach to implementing this change]

## Success Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Risks & Considerations

[Potential issues, trade-offs, or technical debt]

## Related Changes

[Links to related specs or dependencies]
```

**Fill in the template with:**
- Feature name from user's request
- Current date
- Description and motivation based on context
- Initial success criteria (user can refine)

### 6. Generate tasks.md

Create `openspec/changes/<change-id>/tasks.md` with this template:

```markdown
# Implementation Tasks: [Feature Name]

**Change ID:** <change-id>

## Task Breakdown

### Phase 1: Planning & Design

- [ ] Review existing codebase for related functionality
- [ ] Design architecture/approach
- [ ] Identify dependencies

### Phase 2: Implementation

- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

### Phase 3: Testing & Validation

- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Manual testing

### Phase 4: Documentation

- [ ] Update code comments
- [ ] Update README or docs
- [ ] Add usage examples

## Notes

[Implementation notes, decisions, or reminders]
```

**Fill in Phase 2 tasks based on:**
- The proposed solution
- Common implementation patterns
- User's specific requirements

### 7. Show User the Proposal

Display the created proposal location and contents:

```bash
# Show what was created
tree openspec/changes/<change-id>/

# Display proposal summary
cat openspec/changes/<change-id>/proposal.md | head -20
```

### 8. Offer to Refine

Ask the user:
```
I've created the proposal at openspec/changes/<change-id>/.

proposal.md: [Brief summary of what was written]
tasks.md: [Number] implementation tasks defined

Would you like me to:
1. Refine the proposal or tasks
2. Start implementing the tasks
3. Leave it for you to review
```

## Example Execution

**User:** "Create a spec for adding dark mode support"

**Actions:**
1. Change ID: `dark-mode`
2. Create: `openspec/changes/dark-mode/`
3. Generate `proposal.md`:
   ```markdown
   # Dark Mode Support

   **Change ID:** dark-mode
   **Status:** Proposal

   ## Overview
   Add dark mode theme support to the application with user toggle.

   ## Motivation
   Improve accessibility and user experience by supporting preferred
   color schemes. Reduces eye strain in low-light environments.

   ## Proposed Solution
   - Add CSS variables for theme colors
   - Implement theme toggle component
   - Persist user preference in localStorage
   - Support system preference detection
   ```

4. Generate `tasks.md` with specific implementation tasks
5. Display to user and offer next steps

## Templates

### Minimal proposal.md Template

```markdown
# [Feature Name]

**Change ID:** <change-id>

## What
[One sentence: what this change does]

## Why
[One sentence: why it's needed]

## How
[Bullet points: key implementation steps]

## Success
- [ ] [Observable outcome 1]
- [ ] [Observable outcome 2]
```

### Quick tasks.md Template

```markdown
# Tasks: [Feature Name]

## Implementation Checklist

- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]
- [ ] Tests
- [ ] Docs
```

Use the full template for complex changes, minimal template for simple features.

## Error Handling

**Error: openspec/ directory doesn't exist**
- Solution: Run InitializeProject workflow first
  ```
  "Initialize OpenSpec first - the project hasn't been set up yet."
  ```

**Error: Change ID already exists**
- Solution: Suggest alternatives
  ```
  "The 'dark-mode' spec already exists. Try:
   - dark-mode-v2
   - dark-mode-refactor
   Or use 'read spec dark-mode' to view the existing one."
  ```

**Error: Can't infer feature name**
- Solution: Ask user for clarification
  ```
  "I need a feature name for this spec. What should I call it?"
  ```
