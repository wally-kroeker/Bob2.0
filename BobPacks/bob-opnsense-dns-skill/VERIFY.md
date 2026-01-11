# Verification Checklist - Bob OPNsense DNS Skill

> **MANDATORY:** Complete ALL checks before marking installation as successful.

---

## Installation Verification

Run these commands and confirm each passes:

### File Structure

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== OPNsense DNS Installation Verification ==="

# Check 1: Skill directory exists (TitleCase)
[ -d "$PAI_DIR/skills/OpnsenseDns" ] && echo "✓ OpnsenseDns directory exists" || echo "✗ FAIL: OpnsenseDns directory missing"

# Check 2: SKILL.md exists
[ -f "$PAI_DIR/skills/OpnsenseDns/SKILL.md" ] && echo "✓ SKILL.md exists" || echo "✗ FAIL: SKILL.md missing"

# Check 3: Data directory exists
[ -d "$PAI_DIR/skills/OpnsenseDns/data" ] && echo "✓ data/ directory exists" || echo "✗ FAIL: data/ directory missing"

# Check 4: Tool exists
[ -f "$PAI_DIR/tools/OpnsenseDns.ts" ] && echo "✓ OpnsenseDns.ts tool exists" || echo "✗ FAIL: OpnsenseDns.ts missing"

# Check 5: SKILL.md has correct name (TitleCase)
grep -q "^name: OpnsenseDns" "$PAI_DIR/skills/OpnsenseDns/SKILL.md" && echo "✓ SKILL.md has correct name" || echo "⚠️  WARN: Check SKILL.md name field"

# Check 6: Bun runtime available
command -v bun &> /dev/null && echo "✓ Bun runtime available" || echo "✗ FAIL: Bun not installed"
```

### Installation Checklist

- [ ] `$PAI_DIR/skills/OpnsenseDns/` directory exists (TitleCase)
- [ ] `$PAI_DIR/skills/OpnsenseDns/SKILL.md` file present
- [ ] `$PAI_DIR/skills/OpnsenseDns/data/` directory exists
- [ ] `$PAI_DIR/tools/OpnsenseDns.ts` file present and executable
- [ ] SKILL.md has `name: OpnsenseDns` (TitleCase)
- [ ] Bun runtime installed

---

## Configuration Verification

### API Credentials

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== API Configuration Check ==="

# Check .env file exists
if [ -f "$PAI_DIR/skills/OpnsenseDns/data/.env" ]; then
  echo "✓ .env file exists"
  
  # Check required variables (without revealing secrets)
  grep -q "OPNSENSE_HOST=" "$PAI_DIR/skills/OpnsenseDns/data/.env" && echo "✓ OPNSENSE_HOST configured" || echo "✗ OPNSENSE_HOST missing"
  grep -q "OPNSENSE_API_KEY=" "$PAI_DIR/skills/OpnsenseDns/data/.env" && echo "✓ OPNSENSE_API_KEY configured" || echo "✗ OPNSENSE_API_KEY missing"
  grep -q "OPNSENSE_API_SECRET=" "$PAI_DIR/skills/OpnsenseDns/data/.env" && echo "✓ OPNSENSE_API_SECRET configured" || echo "✗ OPNSENSE_API_SECRET missing"
else
  echo "✗ .env file missing - copy from env.template"
fi
```

### Configuration Checklist

- [ ] `.env` file created from `env.template`
- [ ] `OPNSENSE_HOST` set to OPNsense IP/hostname
- [ ] `OPNSENSE_API_KEY` set to your API key
- [ ] `OPNSENSE_API_SECRET` set to your API secret
- [ ] `OPNSENSE_VERIFY_SSL` set appropriately (false for self-signed)

---

## Functionality Verification

### Tool Help Test

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test tool executes and shows help
bun run "$PAI_DIR/tools/OpnsenseDns.ts" help
```

**Expected:** Help message showing available commands (add, list, delete, bulk-add, etc.)

### API Connection Test

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test API connection by listing records
bun run "$PAI_DIR/tools/OpnsenseDns.ts" list
```

**Expected:** List of DNS host overrides (may be empty if no records exist)

**If this fails:**
- Check network connectivity to OPNsense
- Verify API credentials in `.env`
- Check OPNsense API is enabled

### Functionality Checklist

- [ ] `bun run OpnsenseDns.ts help` shows usage information
- [ ] `bun run OpnsenseDns.ts list` connects to OPNsense API
- [ ] No errors in tool execution
- [ ] Claude Code has been restarted after installation

---

## Optional: Full Test Cycle

If you want to verify complete functionality:

### Add Test Record

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

bun run "$PAI_DIR/tools/OpnsenseDns.ts" add \
  --hostname test-record \
  --domain test.fablab.local \
  --ip 10.10.99.99 \
  --description "Test record - delete after verification"
```

### Verify Record Created

```bash
bun run "$PAI_DIR/tools/OpnsenseDns.ts" list | grep "test-record"
```

### Delete Test Record

```bash
# Get UUID from list output, then:
bun run "$PAI_DIR/tools/OpnsenseDns.ts" delete --uuid <UUID-FROM-LIST>
```

### Apply Changes (SSH to OPNsense)

```bash
ssh root@opnsense
configctl unbound restart
```

---

## Troubleshooting

### Tool Won't Execute

1. **Check Bun installed:**
   ```bash
   bun --version
   ```

2. **Check file permissions:**
   ```bash
   ls -la "$PAI_DIR/tools/OpnsenseDns.ts"
   chmod +x "$PAI_DIR/tools/OpnsenseDns.ts"
   ```

### API Connection Fails

1. **Test network connectivity:**
   ```bash
   ping -c 3 $OPNSENSE_HOST
   nc -zv $OPNSENSE_HOST 443
   ```

2. **Test API directly:**
   ```bash
   curl -k -u "KEY:SECRET" https://$OPNSENSE_HOST/api/unbound/settings/searchHostOverride
   ```

3. **Check OPNsense API settings:**
   - System → Settings → Administration → Enable API

### Skill Not Activating

1. **Check TitleCase naming:**
   ```bash
   ls "$PAI_DIR/skills/" | grep -i opnsense
   # Should show: OpnsenseDns (not opnsense-dns)
   ```

2. **Check SKILL.md name field:**
   ```bash
   head -5 "$PAI_DIR/skills/OpnsenseDns/SKILL.md"
   # Should show: name: OpnsenseDns
   ```

3. **Restart Claude Code**

---

## Final Checklist

- [ ] All file structure checks pass
- [ ] API credentials configured in `.env`
- [ ] Tool executes with `bun run OpnsenseDns.ts help`
- [ ] API connection works with `list` command
- [ ] Claude Code has been restarted

**Installation is COMPLETE when ALL checks pass.**
