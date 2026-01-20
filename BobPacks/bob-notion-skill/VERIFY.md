# bob-notion-skill Verification Checklist

Complete this checklist to verify the skill is installed correctly.

---

## 1. Directory Structure

Verify files exist:

```bash
ls -la $PAI_DIR/skills/Notion/
```

Expected output:
```
SKILL.md
Tools/
Workflows/
Data/
```

Verify Tools exist:
```bash
ls $PAI_DIR/skills/Notion/Tools/
```

Expected output:
```
NotionClient.ts
SearchCaptures.ts
GetCapture.ts
UpdateCapture.ts
CreateCapture.ts
```

Verify Workflows exist:
```bash
ls $PAI_DIR/skills/Notion/Workflows/
```

Expected output:
```
ProcessInbox.md
ProcessLinks.md
ProcessNotes.md
SearchCaptures.md
```

- [ ] All files present

---

## 2. Environment Variables

```bash
grep NOTION $PAI_DIR/.env
```

Expected output:
```
NOTION_API_KEY=secret_xxx
NOTION_CAPTURES_DB_ID=2e730fb596b980ec85d4f3e8fddbd002
```

- [ ] `NOTION_API_KEY` set
- [ ] `NOTION_CAPTURES_DB_ID` set

---

## 3. Database Connection Test

```bash
bun run $PAI_DIR/skills/Notion/Tools/SearchCaptures.ts --status Inbox --limit 5
```

Expected: List of up to 5 inbox items (or empty if inbox is empty)

**If error "NOTION_API_KEY not set"**: Add key to `$PAI_DIR/.env`

**If error "Database not found"**: Verify database ID and that database is shared with integration

- [ ] Search command works
- [ ] Returns results or "No captures found"

---

## 4. Single Item Retrieval Test

Get a page ID from the search above (look for "id:" in output), then:

```bash
bun run $PAI_DIR/skills/Notion/Tools/GetCapture.ts --id <page-id>
```

Expected: Full details of the capture including Title, Content, Type, Status, etc.

- [ ] Get command works
- [ ] Shows full capture details

---

## 5. Update Test (Optional)

**WARNING**: This modifies your Notion database. Only run if you're okay with testing updates.

```bash
# Create a test capture first
bun run $PAI_DIR/skills/Notion/Tools/CreateCapture.ts \
  --title "Test Capture" \
  --content "This is a test" \
  --type Text \
  --status Inbox

# Note the page ID from output, then update it
bun run $PAI_DIR/skills/Notion/Tools/UpdateCapture.ts \
  --id <page-id> \
  --status Processed
```

Expected: Status changes from "Inbox" to "Processed" in Notion

- [ ] Create command works
- [ ] Update command works
- [ ] Changes visible in Notion database

---

## 6. Skill Activation Test

Start a new Claude Code session and say:

```
Bob, show me what's in my Notion inbox
```

Expected behavior:
- Skill activates automatically (you should see "Loading Notion skill..." or similar)
- Bob searches your Notion database
- Bob presents inbox items

Alternative test:
```
Bob, what did I capture about [some topic you've captured]?
```

Expected: Bob searches captures and shows relevant results

- [ ] Skill activates on "notion" or "inbox" mention
- [ ] Bob can query the database
- [ ] Results are accurate

---

## 7. Workflow Test: Process Inbox

```
Bob, process my inbox
```

Expected behavior:
- Bob queries `Status="Inbox"`
- Bob presents items grouped by type (Text, Link, Image, etc.)
- Bob offers to process items

- [ ] ProcessInbox workflow triggers
- [ ] Items are grouped by type
- [ ] Bob offers next actions

---

## 8. Workflow Test: Process Links (if you have links in inbox)

```
Bob, process link captures
```

Expected behavior:
- Bob finds items with `Type="Link"` and `Status="Inbox"`
- Bob fetches content from URLs
- Bob generates summaries
- Bob updates Notion with enriched content

- [ ] ProcessLinks workflow triggers
- [ ] Bob fetches link content
- [ ] Summaries are added to Notion

---

## 9. Workflow Test: Search Captures

```
Bob, search my captures for "keyword"
```

or

```
Bob, what did I capture about React last week?
```

Expected behavior:
- Bob searches Notion database
- Bob filters by keyword, date range, or type
- Bob presents matching captures

- [ ] SearchCaptures workflow triggers
- [ ] Search filters work correctly
- [ ] Results are relevant

---

## 10. Integration Test: End-to-End

1. Send a message to your Telegram bot (text, link, or image)
2. Wait for n8n to process (should be instant)
3. Ask Bob: "Bob, show me my latest capture"

Expected:
- Item appears in Notion with `Status="Inbox"`
- Bob can find and retrieve it
- Bob can process and update it

- [ ] Telegram → n8n → Notion works
- [ ] Bob can read from Notion
- [ ] Bob can update Notion

---

## Completion

If all checks pass:
- [ ] Skill is fully operational
- [ ] Update `/home/bob/projects/Bob2.0/CLAUDE.md` to add `bob-notion-skill` to Personal Packs table
- [ ] Commit to git: `git add BobPacks/bob-notion-skill && git commit -m "feat: add bob-notion-skill"`

---

## Troubleshooting

### Skill doesn't activate
**Solution**: Check `SKILL.md` has correct "USE WHEN" triggers. Restart Claude Code session.

### Database queries return empty
**Solution**:
1. Verify you have items in Notion database
2. Check Status field matches exactly: "Inbox" not "inbox"
3. Verify database schema matches expected structure

### Permission errors
**Solution**: Go to Notion database → Share → Add your integration

### Tools fail with "Module not found"
**Solution**: Run `bun install` in `$PAI_DIR/skills/Notion/`

---

**Verification Time**: 10-15 minutes
**Status**: [ ] Complete | [ ] Issues found (see troubleshooting)
