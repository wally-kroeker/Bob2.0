# Installation Instructions - Bob OPNsense DNS Skill

This document provides step-by-step instructions for installing the Bob OPNsense DNS Skill pack.

---

## Prerequisites

- **Bun runtime**: `curl -fsSL https://bun.sh/install | bash`
- **Claude Code** (or compatible agent system with skill support)
- **Write access** to `$PAI_DIR/` (default: `~/.claude`)
- **OPNsense firewall** with API access enabled
- **OPNsense API key/secret** with Unbound DNS permissions

---

## Pre-Installation: System Analysis

### Step 0.1: Detect Current Configuration

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== OPNsense DNS Pre-Installation Check ==="

# Check if skill already exists
if [ -d "$PAI_DIR/skills/OpnsenseDns" ]; then
  echo "⚠️  OpnsenseDns skill already exists"
  ls -la "$PAI_DIR/skills/OpnsenseDns/"
else
  echo "✓ OpnsenseDns skill not installed"
fi

# Check if tool already exists
if [ -f "$PAI_DIR/tools/OpnsenseDns.ts" ]; then
  echo "⚠️  OpnsenseDns.ts tool already exists"
else
  echo "✓ OpnsenseDns.ts not installed"
fi

# Check Bun is available
if command -v bun &> /dev/null; then
  echo "✓ Bun runtime available: $(bun --version)"
else
  echo "✗ Bun not found - install with: curl -fsSL https://bun.sh/install | bash"
fi

# Check environment
echo ""
echo "Environment:"
echo "  PAI_DIR: ${PAI_DIR:-'NOT SET (will use ~/.claude)'}"
```

### Step 0.2: Verify OPNsense API Access

Before installing, confirm you have:
- [ ] OPNsense firewall IP/hostname
- [ ] API key created (System → Access → Users → API keys)
- [ ] API secret downloaded
- [ ] Network access to OPNsense from this machine

### Step 0.3: Conflict Resolution

| Scenario | Action |
|----------|--------|
| Clean install | Proceed to Step 1 |
| Skill exists | Backup existing, replace with new version |
| Tool exists | Replace with new version |

---

## Installation Steps

### Step 1: Copy Skill Files

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
PACK_DIR="/home/bob/projects/Bob2.0/BobPacks/bob-opnsense-dns-skill"

# Create skill directory
mkdir -p "$PAI_DIR/skills/OpnsenseDns/data"

# Copy skill definition
cp "$PACK_DIR/src/skills/OpnsenseDns/SKILL.md" "$PAI_DIR/skills/OpnsenseDns/"

# Copy environment template
cp "$PACK_DIR/src/skills/OpnsenseDns/data/env.template" "$PAI_DIR/skills/OpnsenseDns/data/"

# Verify
ls -la "$PAI_DIR/skills/OpnsenseDns/"
```

**Expected output:**
- `SKILL.md` in skills/OpnsenseDns/
- `data/` directory with `env.template`

---

### Step 2: Copy Tool

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
PACK_DIR="/home/bob/projects/Bob2.0/BobPacks/bob-opnsense-dns-skill"

# Create tools directory if needed
mkdir -p "$PAI_DIR/tools"

# Copy tool
cp "$PACK_DIR/src/tools/OpnsenseDns.ts" "$PAI_DIR/tools/"

# Make executable
chmod +x "$PAI_DIR/tools/OpnsenseDns.ts"

# Verify
ls -la "$PAI_DIR/tools/OpnsenseDns.ts"
```

**Expected output:**
- `OpnsenseDns.ts` in tools/ with execute permissions

---

### Step 3: Configure API Credentials

Create the `.env` file with your OPNsense API credentials:

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Copy template to .env
cp "$PAI_DIR/skills/OpnsenseDns/data/env.template" "$PAI_DIR/skills/OpnsenseDns/data/.env"

# Edit with your credentials
nano "$PAI_DIR/skills/OpnsenseDns/data/.env"
```

**Required values:**

```bash
OPNSENSE_HOST=10.10.10.1              # Your OPNsense IP
OPNSENSE_API_KEY=your_actual_key      # API key from OPNsense
OPNSENSE_API_SECRET=your_actual_secret # API secret from OPNsense
OPNSENSE_VERIFY_SSL=false             # Set to true if using valid SSL cert
```

**Important:** Never commit the `.env` file to git.

---

### Step 4: Test Tool Execution

Verify the tool runs correctly:

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Show help
bun run "$PAI_DIR/tools/OpnsenseDns.ts" help

# Test API connection (list records)
bun run "$PAI_DIR/tools/OpnsenseDns.ts" list
```

**Expected output for `help`:**
```
OPNsense Unbound DNS Management via API

Usage: bun run OpnsenseDns.ts <command> [options]

Commands:
  add           Add DNS host override
  list          List all DNS host overrides
  delete        Delete DNS host override
  bulk-add      Add multiple DNS records from file
  ...
```

**Expected output for `list`:**
```
Found X DNS host override(s):
✓ hostname.domain → IP
  Description: ...
  UUID: ...
```

---

### Step 5: Restart Claude Code

Restart Claude Code to load the new skill.

---

## Verification

Proceed to [VERIFY.md](VERIFY.md) to complete the mandatory verification checklist.

---

## Troubleshooting

### "Missing API credentials" Error

```bash
# Verify .env file exists
ls -la "$PAI_DIR/skills/OpnsenseDns/data/.env"

# Check contents (mask secrets)
grep -E "^OPNSENSE_" "$PAI_DIR/skills/OpnsenseDns/data/.env"
```

### "Connection refused" Error

- Verify OPNsense is reachable: `ping $OPNSENSE_HOST`
- Check HTTPS port is open: `nc -zv $OPNSENSE_HOST 443`
- Verify API is enabled in OPNsense

### "401 Unauthorized" Error

- Verify API key/secret are correct
- Check API user has Unbound permissions in OPNsense
- Try regenerating API key

### SSL Certificate Errors

Set `OPNSENSE_VERIFY_SSL=false` for self-signed certificates.

---

## Uninstallation

To remove the skill:

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Remove skill files
rm -rf "$PAI_DIR/skills/OpnsenseDns"

# Remove tool
rm "$PAI_DIR/tools/OpnsenseDns.ts"
```

---

## Next Steps

1. Complete [VERIFY.md](VERIFY.md) checklist
2. Test adding a DNS record
3. Review FabLab DNS tiers in SKILL.md
4. Create bulk import JSON for your infrastructure

---

**Installation complete!** The OPNsense DNS skill is ready to use.
