# Installation Verification - Bob Scratchpad Skill

This checklist ensures the Bob Scratchpad Skill pack was installed correctly and is ready to use.

**Complete ALL checks before claiming installation success.**

---

## Verification Checklist

### 1. Directory Structure

- [ ] **Skill directory exists**
  ```bash
  ls -d "$PAI_DIR/skills/Scratchpad"
  # Expected: Directory exists
  ```

- [ ] **Workflows directory exists**
  ```bash
  ls -d "$PAI_DIR/skills/Scratchpad/Workflows"
  # Expected: Directory exists with 4 .md files
  ```

- [ ] **Tools directory contains Scratchpad files**
  ```bash
  ls "$PAI_DIR/tools/ScratchpadManager.ts"
  ls "$PAI_DIR/tools/lib/indexer.ts"
  ls "$PAI_DIR/tools/lib/archiver.ts"
  # Expected: All 3 files exist
  ```

- [ ] **Scratchpad directory structure created**
  ```bash
  ls -la "$PAI_DIR/scratchpad/"
  # Expected: scratchpad/ directory exists, archive/ subdirectory exists
  ```

---

### 2. File Integrity

- [ ] **SKILL.md has correct frontmatter**
  ```bash
  head -20 "$PAI_DIR/skills/Scratchpad/SKILL.md" | grep "name: Scratchpad"
  # Expected: Line contains "name: Scratchpad"
  ```

- [ ] **All workflow files present**
  ```bash
  ls "$PAI_DIR/skills/Scratchpad/Workflows/"*.md | wc -l
  # Expected: 4 (Save.md, Search.md, List.md, Archive.md)
  ```

- [ ] **Tool files are complete (not truncated)**
  ```bash
  wc -l "$PAI_DIR/tools/ScratchpadManager.ts"
  wc -l "$PAI_DIR/tools/lib/indexer.ts"
  wc -l "$PAI_DIR/tools/lib/archiver.ts"
  # Expected: Each file has >50 lines (not empty or truncated)
  ```

---

### 3. Environment Configuration

- [ ] **SCRATCHPAD_DIR is set**
  ```bash
  echo "SCRATCHPAD_DIR: ${SCRATCHPAD_DIR}"
  # Expected: Shows path to scratchpad directory (not empty)
  ```

- [ ] **SCRATCHPAD_ARCHIVE_DAYS is set**
  ```bash
  echo "SCRATCHPAD_ARCHIVE_DAYS: ${SCRATCHPAD_ARCHIVE_DAYS:-90}"
  # Expected: Shows number (default 90)
  ```

- [ ] **Environment variables in .env or shell profile**
  ```bash
  grep "SCRATCHPAD" "$PAI_DIR/.env" || grep "SCRATCHPAD" ~/.zshrc || grep "SCRATCHPAD" ~/.bashrc
  # Expected: Lines found with SCRATCHPAD variables
  ```

---

### 4. Hook Installation (Optional - Only if Using Auto-Save)

**Skip this section if you're NOT using the auto-save hook.**

- [ ] **Hook file exists**
  ```bash
  ls "$PAI_DIR/hooks/capture-untargeted-output.ts"
  # Expected: File exists
  ```

- [ ] **Hook is executable**
  ```bash
  test -x "$PAI_DIR/hooks/capture-untargeted-output.ts" && echo "Executable" || echo "Not executable"
  # Expected: "Executable" (or hook won't run)
  ```

- [ ] **Hook registered in settings.json**
  ```bash
  grep "capture-untargeted-output" "$HOME/.claude/settings.json"
  # Expected: Line found with hook command
  ```

- [ ] **Auto-save environment variable set to true**
  ```bash
  echo "SCRATCHPAD_AUTO_SAVE: ${SCRATCHPAD_AUTO_SAVE}"
  # Expected: "true" (if you want auto-save enabled)
  ```

---

### 5. Functional Tests

- [ ] **Manual save test**

  In a Claude Code session, run:
  ```
  save this test message to scratchpad
  ```

  **Expected result:**
  - New folder created in `$PAI_DIR/scratchpad/` with timestamp
  - Folder contains README.md or test content
  - Confirmation message with folder path

  **Verify:**
  ```bash
  ls -lt "$PAI_DIR/scratchpad/" | head -5
  # Should show recently created folder with timestamp
  ```

- [ ] **Search test**

  In a Claude Code session, run:
  ```
  search scratchpad for test
  ```

  **Expected result:**
  - Search results displayed
  - Shows folder created in previous test
  - Preview of content included

  **Verify:**
  ```bash
  # If index exists
  cat "$PAI_DIR/scratchpad/.scratchpad-index.json"
  # Should contain entry for test folder
  ```

- [ ] **List test**

  In a Claude Code session, run:
  ```
  show recent scratchpad items
  ```

  **Expected result:**
  - List of scratchpad folders by date
  - Most recent items shown first
  - Readable format (date + description)

- [ ] **Index creation/rebuild test**

  If no index exists, it should be created automatically:
  ```bash
  ls "$PAI_DIR/scratchpad/.scratchpad-index.json"
  # Expected: File exists after first save or search
  ```

  **Verify index format:**
  ```bash
  cat "$PAI_DIR/scratchpad/.scratchpad-index.json" | head -20
  # Expected: Valid JSON with "entries" array
  ```

---

### 6. Integration Tests

- [ ] **Skill triggers recognized by CORE**

  Verify the skill is loaded by the system:
  ```
  In Claude Code: "what skills do you have?"
  ```

  **Expected:** Scratchpad should be listed in available skills.

- [ ] **Workflow routing works**

  Test each trigger phrase:
  - "save this to scratchpad" → Save workflow
  - "search scratchpad for X" → Search workflow
  - "show recent scratchpad items" → List workflow
  - "archive old scratchpad data" → Archive workflow

  **Expected:** Each phrase triggers the correct workflow.

---

### 7. Data Integrity (Existing Scratchpad Content)

**Only applicable if you had existing scratchpad data before installation.**

- [ ] **Existing content preserved**
  ```bash
  # Count folders before and after installation
  find "$PAI_DIR/scratchpad/" -maxdepth 1 -type d | wc -l
  # Expected: Same number of folders (no data loss)
  ```

- [ ] **Existing folders indexed**
  ```bash
  # Check if old folders appear in index
  cat "$PAI_DIR/scratchpad/.scratchpad-index.json" | grep "2024"
  # Expected: Existing folders from 2024 (or previous) are indexed
  ```

---

## Verification Results

**Installation Status:** [ ] PASS / [ ] FAIL

**If FAIL, which checks failed?**
-

**Troubleshooting steps attempted:**
-

---

## Post-Verification Steps

After all checks pass:

1. **Test in real workflow:**
   - Save actual research to scratchpad
   - Search for it later
   - Verify content is easily accessible

2. **Customize if needed:**
   - Review [README.md](README.md#customization) for customization options
   - Adjust SCRATCHPAD_ARCHIVE_DAYS if 90 days isn't right for you
   - Customize folder naming patterns if using auto-save

3. **Decide on auto-save:**
   - If you didn't enable auto-save during installation, you can enable it later
   - Edit `~/.claude/settings.json` and `$PAI_DIR/.env`
   - See [INSTALL.md Step 6](INSTALL.md#step-6-register-hook-optional---only-if-using-auto-save)

4. **Update CLAUDE.md:**
   - Add Scratchpad to the "Personal Packs Available" table in `/home/bob/projects/Bob2.0/CLAUDE.md`
   - Document what it does for future reference

---

## Common Issues

### Issue: Save workflow doesn't create folder

**Possible causes:**
- Scratchpad directory doesn't exist
- No write permissions
- ScratchpadManager.ts not found

**Debug:**
```bash
# Check directory exists and is writable
ls -ld "$PAI_DIR/scratchpad"
touch "$PAI_DIR/scratchpad/test.txt" && rm "$PAI_DIR/scratchpad/test.txt"

# Check tool exists
ls "$PAI_DIR/tools/ScratchpadManager.ts"
```

### Issue: Search returns "no results" but content exists

**Possible causes:**
- Index not created
- Index corrupted
- Grep tool not available

**Debug:**
```bash
# Check if index exists
ls "$PAI_DIR/scratchpad/.scratchpad-index.json"

# Manually rebuild index
bun run "$PAI_DIR/tools/ScratchpadManager.ts" rebuild-index

# Test grep directly
grep -r "test" "$PAI_DIR/scratchpad/"
```

### Issue: Auto-save not working

**Possible causes:**
- Hook not registered
- SCRATCHPAD_AUTO_SAVE not set to "true"
- Hook file not executable

**Debug:**
```bash
# Check hook registration
grep "capture-untargeted-output" "$HOME/.claude/settings.json"

# Check environment
echo $SCRATCHPAD_AUTO_SAVE

# Check file permissions
ls -l "$PAI_DIR/hooks/capture-untargeted-output.ts"
```

---

## Verification Complete

If all checks pass, the Bob Scratchpad Skill is successfully installed and ready to use.

**Date verified:** _________________

**Verified by:** _________________

**Notes:**


---

**Next:** Return to [README.md](README.md) for usage examples and customization options.
