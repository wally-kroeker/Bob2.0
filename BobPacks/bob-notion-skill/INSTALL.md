# bob-notion-skill Installation Guide

## Pre-Installation Checks

### 1. Verify PAI Installation
```bash
echo $PAI_DIR
# Should output: /home/bob/.claude (or your custom path)

ls $PAI_DIR/skills/
# Should show existing skills
```

### 2. Verify Notion Setup
Ensure you have:
- Notion API key (from https://www.notion.so/my-integrations)
- Captures database ID: `2e730fb596b980ec85d4f3e8fddbd002`
- Database shared with your Notion integration

### 3. Check Environment Variables
```bash
grep NOTION $PAI_DIR/.env
```

Should show:
```
NOTION_API_KEY=secret_xxx
NOTION_CAPTURES_DB_ID=2e730fb596b980ec85d4f3e8fddbd002
```

If missing, add them to `$PAI_DIR/.env`.

---

## Installation Steps

### Step 1: Create Skill Directory
```bash
mkdir -p $PAI_DIR/skills/Notion/{Tools,Workflows,Data}
```

### Step 2: Copy Skill Files
```bash
# Copy SKILL.md
cp /home/bob/projects/Bob2.0/BobPacks/bob-notion-skill/src/skills/Notion/SKILL.md \
   $PAI_DIR/skills/Notion/

# Copy Tools
cp /home/bob/projects/Bob2.0/BobPacks/bob-notion-skill/src/skills/Notion/Tools/*.ts \
   $PAI_DIR/skills/Notion/Tools/

# Copy Workflows
cp /home/bob/projects/Bob2.0/BobPacks/bob-notion-skill/src/skills/Notion/Workflows/*.md \
   $PAI_DIR/skills/Notion/Workflows/
```

### Step 3: Install Dependencies
```bash
cd $PAI_DIR/skills/Notion
bun install
```

**Note**: If `package.json` doesn't exist, dependencies are minimal (only `@notionhq/client`). The tools will handle this gracefully.

### Step 4: Verify Environment Variables
```bash
# Test that .env is loaded correctly
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --help
```

Should show usage instructions, not an API error.

---

## Configuration

### Required Environment Variables

Add to `$PAI_DIR/.env`:
```bash
# Notion API
NOTION_API_KEY=secret_xxx
NOTION_CAPTURES_DB_ID=2e730fb596b980ec85d4f3e8fddbd002
```

### Optional Environment Variables

For link processing (used by ProcessLinks workflow):
```bash
# Jina Reader (for link content extraction)
JINA_API_KEY=jina_xxx  # Optional - uses free tier if not set

# Claude API (for summarization)
ANTHROPIC_API_KEY=sk-ant-xxx  # Already in PAI .env
```

---

## Post-Installation

### 1. Test Database Connection
```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --status Inbox
```

Should return a list of inbox items from your Notion database.

### 2. Test Single Item Retrieval
```bash
# Get a page ID from the search above, then:
bun run $PAI_DIR/skills/Notion/Tools/GetCapture.ts --id <page-id>
```

Should show full details of the capture.

### 3. Activate Skill in Claude Code

The skill auto-activates when:
- User mentions "notion", "captures", "second brain", or "inbox"
- User asks to "process my inbox"
- User searches for past captures

Test: Start a new Claude Code session and say:
```
Bob, show me what's in my Notion inbox
```

---

## Troubleshooting

### Error: "NOTION_API_KEY not set"
**Solution**: Add `NOTION_API_KEY=secret_xxx` to `$PAI_DIR/.env`

### Error: "Database not found"
**Solution**:
1. Verify database ID in `.env` matches your Notion database
2. Ensure database is shared with your Notion integration
3. Go to Notion → Database → Share → Add "Second Brain Capture" integration

### Error: "Could not find database with ID"
**Solution**:
1. Open your Notion database in browser
2. Copy ID from URL: `notion.so/workspace/{DATABASE_ID}?v=...`
3. Update `NOTION_CAPTURES_DB_ID` in `.env`

### Error: "Property 'Status' does not exist"
**Solution**: Your database schema doesn't match expected structure. See `README.md` for required properties.

---

## Uninstall

To remove the skill:
```bash
rm -rf $PAI_DIR/skills/Notion
```

Then remove from `$PAI_DIR/.env`:
```bash
# Remove these lines:
# NOTION_API_KEY=...
# NOTION_CAPTURES_DB_ID=...
```

---

## Next Steps

After installation:
1. Complete VERIFY.md checklist
2. Try: "Bob, process my inbox"
3. Try: "Bob, what did I capture about [topic]?"
4. Update `/home/bob/projects/Bob2.0/CLAUDE.md` to add `bob-notion-skill` to Personal Packs list

---

**Installation Time**: 5-10 minutes
**Difficulty**: Easy
**Prerequisites**: Notion API key, database ID, PAI v2.3+
