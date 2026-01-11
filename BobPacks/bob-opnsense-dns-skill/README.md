---
name: Bob OPNsense DNS Skill
pack-id: bob-opnsense-dns-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: OPNsense Unbound DNS management via REST API for FabLab infrastructure. Programmatic DNS record creation, updates, deletion, and bulk operations.
type: skill
purpose-type: [infrastructure, automation, networking]
platform: claude-code
dependencies: []
keywords: [opnsense, dns, unbound, fablab, infrastructure, api, networking, host-override]
---

# Bob OPNsense DNS Skill

> OPNsense Unbound DNS management via REST API for FabLab infrastructure

## Installation Prompt

You are receiving a PAI Pack - a modular upgrade for AI agent systems.

**What is PAI?** See: [PAI Project Overview](../../README.md)

**What is a Pack?** See: [Pack System](../../PACKS.md)

This pack adds programmatic DNS management for OPNsense firewalls. The Bob OPNsense DNS Skill provides:

- **DNS Record Management**: Create, list, update, delete host overrides via REST API
- **Bulk Operations**: Import multiple records from JSON files
- **FabLab Integration**: Pre-configured for FabLab infrastructure tiers
- **TypeScript/Bun**: Follows PAI standard tooling (no Python dependencies)

**Core principle:** Infrastructure as code for DNS management.

Please follow the installation instructions in `INSTALL.md` to integrate this pack into your infrastructure.

---

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| DNS Tool | `tools/OpnsenseDns.ts` | CLI for add/list/delete/bulk operations |
| Skill Definition | `skills/OpnsenseDns/SKILL.md` | Activation triggers and usage patterns |
| Config Template | `skills/OpnsenseDns/data/env.template` | API credentials template |

**Summary:**
- **Files created:** 3
- **Hooks registered:** 0
- **Dependencies:** Bun runtime, OPNsense firewall with API access

---

## The Problem

Managing DNS records in OPNsense manually is tedious:
- **Web UI overhead**: Each record requires multiple clicks through the GUI
- **No bulk operations**: Adding 20 records means 20 form submissions
- **No automation**: Can't script DNS changes for infrastructure deployments
- **Error-prone**: Manual entry leads to typos in hostnames/IPs
- **No version control**: Changes aren't tracked or auditable

For FabLab infrastructure with dozens of services across multiple tiers (infrastructure, management, applications, storage), manual DNS management doesn't scale.

---

## The Solution

A TypeScript CLI tool that interfaces with OPNsense's Unbound API:

**Architecture:**

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Bob (Claude)  │ ───► │  OpnsenseDns.ts  │ ───► │  OPNsense API   │
│   "add dns..."  │      │  (Bun runtime)   │      │  (REST/HTTPS)   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  Unbound DNS    │
                                                   │  (Host Override)│
                                                   └─────────────────┘
```

**Key Features:**

| Feature | Description |
|---------|-------------|
| `add` | Create single DNS host override |
| `list` | Query all existing records (human or JSON) |
| `delete` | Remove record by UUID |
| `bulk-add` | Import multiple records from JSON file |

**FabLab DNS Tiers:**

| Tier | Domain | Examples |
|------|--------|----------|
| Infrastructure | `infra.fablab.local` | OPNsense, switches, Proxmox |
| Management | `mgmt.fablab.local` | Authentik, Guacamole, Wazuh |
| Applications | `apps.fablab.local` | TaskMan, n8n, Firefly |
| Storage | `storage.fablab.local` | OMV NAS devices |

---

## What Makes This Different

This sounds similar to editing `/etc/hosts` which also manages DNS. What makes this approach different?

OPNsense Unbound provides centralized, authoritative DNS for the entire network. Unlike hosts files (per-machine), Unbound serves all clients automatically. The API enables infrastructure-as-code: DNS records can be version-controlled, bulk-imported, and automated as part of service deployments. Changes propagate network-wide without touching individual machines.

- Centralized DNS not scattered per-machine hosts files approach
- API-driven automation not manual web GUI form clicking
- Bulk JSON import not one-record-at-a-time manual entry
- TypeScript Bun runtime not Python dependency requirements

---

## Installation

See [INSTALL.md](INSTALL.md) for complete installation instructions.

**Quick start:**
```bash
# Give this pack directory to your AI agent:
Install the bob-opnsense-dns-skill pack from /home/bob/projects/Bob2.0/BobPacks/bob-opnsense-dns-skill/

Use PAI_DIR="/home/bob/.claude"
```

---

## Invocation Scenarios

| Trigger | Action |
|---------|--------|
| "add dns record for host1" | Run `OpnsenseDns.ts add --hostname host1 ...` |
| "list all dns records" | Run `OpnsenseDns.ts list` |
| "show dns entries as json" | Run `OpnsenseDns.ts list --json` |
| "delete dns record [uuid]" | Run `OpnsenseDns.ts delete --uuid [uuid]` |
| "bulk import dns from file" | Run `OpnsenseDns.ts bulk-add --file [path]` |

---

## Example Usage

### Add Single Record

```bash
bun run $PAI_DIR/tools/OpnsenseDns.ts add \
  --hostname taskman \
  --domain apps.fablab.local \
  --ip 10.10.20.50 \
  --description "Vikunja Task Manager"
```

### List All Records

```bash
bun run $PAI_DIR/tools/OpnsenseDns.ts list

# Output:
# Found 15 DNS host override(s):
# ✓ opnsense.infra.fablab.local → 10.10.10.1
#   Description: OPNsense Firewall
#   UUID: abc123...
```

### Bulk Import

```json
// records.json
[
  {"hostname": "host1", "domain": "infra.fablab.local", "ip": "10.10.10.10", "description": "Proxmox 1"},
  {"hostname": "host2", "domain": "infra.fablab.local", "ip": "10.10.10.12", "description": "Proxmox 2"}
]
```

```bash
bun run $PAI_DIR/tools/OpnsenseDns.ts bulk-add --file records.json
```

---

## Configuration

**API Credentials:** `$PAI_DIR/skills/OpnsenseDns/data/.env`

```bash
OPNSENSE_HOST=10.10.10.1
OPNSENSE_API_KEY=your_api_key_here
OPNSENSE_API_SECRET=your_api_secret_here
OPNSENSE_VERIFY_SSL=false
```

**Creating OPNsense API Key:**
1. OPNsense Web UI → System → Access → Users
2. Edit your user → API keys → Add
3. Download key/secret, add to `.env`

---

## Security Notes

- **Never commit `.env`** - Contains sensitive API credentials
- **Self-signed certs** - `OPNSENSE_VERIFY_SSL=false` for self-signed OPNsense certificates
- **Minimum permissions** - Create API user with only Unbound DNS permissions
- **Backup first** - Export OPNsense config before bulk operations

---

## Manual Restart Required

After DNS changes, you must manually restart Unbound:

```bash
ssh root@opnsense
configctl unbound restart
```

The API reconfigure endpoint requires elevated permissions not typically granted to API users.

---

## Credits

- **OPNsense API**: https://docs.opnsense.org/development/api/core/unbound.html
- **Bob Customization**: Wally Kroeker
- **FabLab Infrastructure**: vrexplorers.com

---

## Changelog

### 1.0.0 - 2025-01-05
- Converted from Python to TypeScript (Bun runtime)
- TitleCase directory naming (`OpnsenseDns/`)
- Updated to PAI upstream pack standards
- Added comprehensive INSTALL.md and VERIFY.md
