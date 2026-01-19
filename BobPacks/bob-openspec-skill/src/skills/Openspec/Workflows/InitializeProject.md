# InitializeProject

Initialize OpenSpec in the current project by creating the directory structure.

## Trigger Patterns

- "initialize openspec"
- "set up openspec"
- "create openspec directory"
- "start using openspec"

## Workflow

### 1. Check Current Directory

Verify you're in a project directory (has package.json, README.md, or .git):

```bash
# Check for project indicators
ls -la | grep -E "(package.json|README.md|.git)"
```

If not in a project directory, warn the user.

### 2. Check if OpenSpec Already Initialized

```bash
# Check if openspec/ directory exists
[ -d "openspec" ] && echo "EXISTS" || echo "NOT_EXISTS"
```

If EXISTS: Ask user if they want to reinitialize (will preserve existing specs).

### 3. Run OpenSpec Init

```bash
openspec init
```

### 4. Verify Installation

```bash
# Check directory structure created
ls -la openspec/

# Expected:
# openspec/
# ├── changes/      # Active change proposals
# └── specs/        # Archived specifications (if present)
```

### 5. Report Success

Confirm to the user:
- OpenSpec directory created
- Location: `<current-directory>/openspec/`
- Ready to create proposals

## Example Output

```
✓ OpenSpec initialized in /home/bob/projects/my-app
✓ Created: openspec/changes/ (for active proposals)
✓ Created: openspec/specs/ (for archived specs)

Ready to create specifications. Try:
  "Create a proposal for [feature name]"
```

## Error Handling

**Error: "openspec: command not found"**
- Solution: Install OpenSpec CLI
  ```bash
  npm install -g @fission-ai/openspec@latest
  ```

**Error: Directory already initialized**
- Solution: Confirm with user before reinitializing
- Existing specs in `openspec/changes/` will be preserved

**Error: Not in a project directory**
- Solution: Ask user to navigate to project root or confirm current location
