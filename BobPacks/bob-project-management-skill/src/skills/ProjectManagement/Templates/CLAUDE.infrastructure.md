# [Project Name] - Infrastructure

This file provides guidance to Claude Code when working with this infrastructure project.

## Overview

**Purpose:** [Brief description of what this infrastructure manages]

**Domain:** [e.g., kroeker.fun, fablab.local]

**Owner:** [Name or team]

**Environment:** [e.g., Production, Development, Homelab]

## Services

| Service | Location | Purpose | Access |
|---------|----------|---------|--------|
| [Service 1] | [IP/domain:port] | [What it does] | [How to access] |
| [Service 2] | [IP/domain:port] | [What it does] | [How to access] |
| [Service 3] | [IP/domain:port] | [What it does] | [How to access] |

## Architecture

[High-level diagram or description of how services connect]

**Network topology:**
- [Network segment 1] - [Purpose, IP range]
- [Network segment 2] - [Purpose, IP range]

**Key infrastructure:**
- [Component 1] - [Purpose]
- [Component 2] - [Purpose]

## Common Operations

### Starting Services

```bash
# Start all services
[command - e.g., docker-compose up -d]

# Start specific service
[command pattern]

# Check service status
[command]
```

### Stopping Services

```bash
# Stop all services
[command]

# Stop specific service
[command pattern]

# Restart service
[command pattern]
```

### Viewing Logs

```bash
# View all logs
[command]

# View specific service logs
[command pattern]

# Follow logs in real-time
[command pattern]
```

### Updating Services

```bash
# Pull latest changes
[command]

# Rebuild and restart
[command]

# Update specific service
[command pattern]
```

## Configuration Files

| File | Purpose | Modify When |
|------|---------|-------------|
| [file] | [What it configures] | [When to edit] |
| [file] | [What it configures] | [When to edit] |
| [file] | [What it configures] | [When to edit] |

## Access & Credentials

**SSH Access:**
```bash
# Main server
ssh [user]@[host]

# Alternative access
[alternative method]
```

**Credential Locations:**
- [Service 1] credentials: [Where stored - reference only, no actual secrets]
- [Service 2] API keys: [Where stored]

**Important:** Never commit credentials to git. Use environment variables or secrets management.

## Networking

### Port Mappings

| Port | Service | Protocol | Access |
|------|---------|----------|--------|
| [port] | [service] | [TCP/UDP] | [Internal/External] |
| [port] | [service] | [TCP/UDP] | [Internal/External] |

### DNS Records

| Hostname | Type | Target | Purpose |
|----------|------|--------|---------|
| [hostname] | [A/CNAME] | [IP/target] | [Purpose] |
| [hostname] | [A/CNAME] | [IP/target] | [Purpose] |

### Firewall Rules

[Description of firewall configuration]

```bash
# View current rules
[command]

# Add new rule
[command pattern]
```

## Backup & Recovery

### Backup Procedures

```bash
# Backup all data
[command]

# Backup specific service
[command pattern]

# Verify backup
[command]
```

**Backup schedule:** [When backups run]

**Backup location:** [Where backups are stored]

### Recovery Procedures

```bash
# Restore from backup
[command]

# Restore specific service
[command pattern]

# Verify restoration
[command]
```

## Monitoring

**Monitoring tools:**
- [Tool 1] - [Access URL/method]
- [Tool 2] - [Access URL/method]

**Key metrics:**
- [Metric 1] - [Normal range, alert threshold]
- [Metric 2] - [Normal range, alert threshold]

**Alerts:**
- [Alert type] → [Notification method]

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- [Task]

**Weekly:**
- [Task]

**Monthly:**
- [Task]

### Update Schedule

- **OS updates:** [Schedule/policy]
- **Service updates:** [Schedule/policy]
- **Security patches:** [Schedule/policy]

## Troubleshooting

### Common Issues

**[Issue 1]**
- **Symptom:** [What you see]
- **Check:** [Diagnostic steps]
- **Fix:** [Resolution steps]

**[Issue 2]**
- **Symptom:** [What you see]
- **Check:** [Diagnostic steps]
- **Fix:** [Resolution steps]

### Diagnostic Commands

```bash
# Check service health
[command]

# View resource usage
[command]

# Check network connectivity
[command]

# Review recent logs
[command]
```

## Dependencies

**External dependencies:**
- [Dependency 1] - [Why needed, where configured]
- [Dependency 2] - [Why needed, where configured]

**Internal dependencies:**
- [Service 1] requires [Service 2]
- [Service 3] requires [Service 4]

## Security

**Security measures:**
- [Measure 1]
- [Measure 2]
- [Measure 3]

**Access control:**
- [Who has access to what]

**Audit logging:**
- [What's logged, where logs are stored]

## External Resources

- **Monitoring Dashboard:** [URL]
- **Documentation:** [URL]
- **Vendor Support:** [Contact info]

---

*Last updated: [Date]*
