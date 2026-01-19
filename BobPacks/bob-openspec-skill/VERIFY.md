# Verification Checklist: Openspec Skill

Complete this checklist to verify successful installation.

## System Verification

### 1. File Structure

```bash
# Check skill directory exists
[ -d "$PAI_DIR/skills/Openspec" ] && echo "✓ Skill directory exists" || echo "✗ MISSING"

# Check SKILL.md
[ -f "$PAI_DIR/skills/Openspec/SKILL.md" ] && echo "✓ SKILL.md exists" || echo "✗ MISSING"

# Check Tools directory
[ -d "$PAI_DIR/skills/Openspec/Tools" ] && echo "✓ Tools/ directory exists" || echo "✗ MISSING"

# Check Workflows directory
[ -d "$PAI_DIR/skills/Openspec/Workflows" ] && echo "✓ Workflows/ directory exists" || echo "✗ MISSING"
```

**Expected output:**
```
✓ Skill directory exists
✓ SKILL.md exists
✓ Tools/ directory exists
✓ Workflows/ directory exists
```

### 2. OpenSpec CLI

```bash
# Verify OpenSpec CLI is installed
openspec --version
```

**Expected:** Version number (e.g., `1.0.0` or similar)

### 3. Skill Activation Test

Start a new Claude Code session and test the skill:

```bash
# Start Claude Code
claude

# In the session, ask:
# "Initialize OpenSpec in this project"
```

**Expected behavior:**
- Claude recognizes the Openspec skill
- Invokes the InitializeProject workflow
- Runs `openspec init` command
- Creates `openspec/` directory

## Functional Tests

### Test 1: Initialize a Project

```bash
# Create a test directory
mkdir -p /tmp/openspec-test
cd /tmp/openspec-test

# In Claude Code, ask:
# "Initialize OpenSpec here"
```

**Verify:**
- [ ] `openspec/` directory created
- [ ] `openspec/changes/` directory exists
- [ ] No errors in output

### Test 2: Create a Proposal

In Claude Code:
```
"Create an OpenSpec proposal for adding user authentication"
```

**Verify:**
- [ ] Creates `openspec/changes/auth-system/` (or similar)
- [ ] `proposal.md` file exists with content
- [ ] `tasks.md` file exists

### Test 3: List Specifications

In Claude Code:
```
"List active OpenSpec changes"
```

**Verify:**
- [ ] Runs `openspec list` command
- [ ] Shows the proposal created in Test 2
- [ ] Output is formatted correctly

### Test 4: Archive a Specification

In Claude Code:
```
"Archive the auth-system specification"
```

**Verify:**
- [ ] Runs `openspec archive auth-system`
- [ ] Change directory is removed from `openspec/changes/`
- [ ] Spec is merged to main project documentation

## Troubleshooting

### Skill Not Recognized

**Symptom:** Claude doesn't invoke the Openspec skill

**Solution:**
1. Restart Claude Code session (`/exit` then `claude`)
2. Verify SKILL.md has correct frontmatter with `USE WHEN` clause
3. Check skill directory name is TitleCase: `Openspec` not `openspec`

### OpenSpec Command Fails

**Symptom:** `openspec: command not found`

**Solution:**
```bash
# Re-install OpenSpec
npm install -g @fission-ai/openspec@latest

# Verify npm global bin is in PATH
echo $PATH | grep "$(npm bin -g)"

# If not in PATH, add to ~/.zshrc or ~/.bashrc:
export PATH="$(npm bin -g):$PATH"
```

### Workflows Not Found

**Symptom:** Error: "Workflow file not found"

**Solution:**
1. Check workflow files use TitleCase: `InitializeProject.md` not `initialize-project.md`
2. Verify all workflows referenced in SKILL.md exist in `Workflows/` directory

## Verification Complete

- [ ] All file structure checks passed
- [ ] OpenSpec CLI version displayed
- [ ] Skill activation test successful
- [ ] Test 1: Initialize project works
- [ ] Test 2: Create proposal works
- [ ] Test 3: List specs works
- [ ] Test 4: Archive spec works

Once all items are checked, the Openspec skill is ready for use.

## Quick Reference

**Initialize project:**
```
"Initialize OpenSpec in this project"
```

**Create proposal:**
```
"Create an OpenSpec proposal for [feature description]"
```

**List active changes:**
```
"Show active OpenSpec changes"
```

**Read a spec:**
```
"Show me the [change-id] specification"
```

**Archive completed spec:**
```
"Archive the [change-id] specification"
```
