---
name: OpnsenseDns
description: |
  OPNsense Unbound DNS management via REST API for FabLab infrastructure.
  USE WHEN user mentions 'dns records', 'opnsense dns', 'add dns entry', 'unbound host override',
  OR needs to manage FabLab DNS infrastructure. Provides programmatic DNS record creation,
  updates, deletion, and bulk operations.
---

# OPNsense DNS Management Skill

**Purpose**: Manage OPNsense Unbound DNS host overrides via REST API for FabLab infrastructure.

## Capabilities

- **Add DNS Records**: Create individual or bulk host overrides
- **List DNS Records**: Query existing DNS entries by domain/hostname
- **Update DNS Records**: Modify existing host overrides
- **Delete DNS Records**: Remove host overrides by UUID
- **Reconfigure Unbound**: Apply changes and restart DNS service
- **Bulk Operations**: Import DNS records from JSON files

## Tool Location

`$PAI_DIR/tools/OpnsenseDns.ts`

Run with: `bun run $PAI_DIR/tools/OpnsenseDns.ts <command> [options]`

## Configuration

**API Credentials Location**: `$PAI_DIR/skills/OpnsenseDns/data/.env`

Required environment variables:
```bash
OPNSENSE_HOST=10.10.10.1
OPNSENSE_API_KEY=your_api_key_here
OPNSENSE_API_SECRET=your_api_secret_here
OPNSENSE_VERIFY_SSL=false
```

## Usage Patterns

### Add Single DNS Record
```bash
bun run $PAI_DIR/tools/OpnsenseDns.ts add \
  --hostname host1 \
  --domain infra.fablab.local \
  --ip 10.10.10.10 \
  --description "Proxmox Host One"
```

### Add Multiple Records (Bulk)
```bash
bun run $PAI_DIR/tools/OpnsenseDns.ts bulk-add \
  --file /path/to/dns_records.json
```

### List All DNS Records
```bash
bun run $PAI_DIR/tools/OpnsenseDns.ts list
bun run $PAI_DIR/tools/OpnsenseDns.ts list --json
```

### Delete DNS Record
```bash
bun run $PAI_DIR/tools/OpnsenseDns.ts delete --uuid <record-uuid>
```

## FabLab DNS Tiers

This skill manages DNS for all FabLab infrastructure tiers:

| Tier | Domain | Examples |
|------|--------|----------|
| Infrastructure | `infra.fablab.local` | OPNsense, switches, Proxmox hosts |
| Management | `mgmt.fablab.local` | Authentik, Guacamole, VDI, Tailscale, Wazuh |
| Applications | `apps.fablab.local` | TaskMan, n8n, AIChat, GoodFields, Firefly |
| Storage | `storage.fablab.local` | OMV NAS devices |

## Bulk Import Format

Create a JSON file with DNS records:

```json
[
  {
    "hostname": "service-name",
    "domain": "subdomain.fablab.local",
    "ip": "10.10.x.x",
    "description": "Service description"
  }
]
```

## Security Notes

- API credentials stored in `.env` (gitignored, never committed)
- Uses HTTPS with certificate verification disabled (self-signed OPNsense cert)
- API key/secret should have minimum required permissions
- Backup OPNsense config before bulk operations

## Manual Restart Required

After adding, updating, or deleting DNS records, you **must manually restart Unbound**:

```bash
# SSH to OPNsense
ssh root@opnsense
configctl unbound restart
```

## API Documentation Reference

- OPNsense Unbound API: https://docs.opnsense.org/development/api/core/unbound.html

