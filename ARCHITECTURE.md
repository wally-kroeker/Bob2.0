# Bob2.0 Architecture

**PAI Instance vs Repository Separation**

---

## Two Directories, Two Purposes

### `~/.claude/` - Installed PAI Instance (NOT Git-Controlled)

**Purpose:** Runtime installation of PAI system
- Like `/usr/local` or an installed application
- Contains running configuration, hooks, skills, tools
- Session history and cache files
- **NEVER** tracked in git
- **NEVER** pushed to any repository
- Personal runtime state only

**Contents:**
```
~/.claude/
├── hooks/              # Runtime hook scripts
├── skills/             # Installed skills (including CORE)
├── agents/             # Agent personalities
├── tools/              # Utility scripts
├── MEMORY/             # Session history, learnings (runtime only)
├── .env                # API keys (NEVER commit)
├── settings.json       # Personal configuration
├── history.jsonl       # Session transcripts
└── cache/              # Temporary files
```

**Why not git-controlled?**
- Contains sensitive data (API keys, session transcripts)
- Runtime state that changes constantly
- Personal configuration not meant for sharing
- Session history is ephemeral, not source code

### `/home/bob/projects/Bob2.0/` - Source Repository (Git-Controlled)

**Purpose:** Version-controlled source code and documentation
- Personal fork of danielmiessler/Personal_AI_Infrastructure
- BobPacks (personal skill packages)
- System documentation and architectural decisions
- Installation templates and guides

**Git Remotes:**
```
origin   → https://github.com/wally-kroeker/Bob2.0
upstream → https://github.com/danielmiessler/Personal_AI_Infrastructure.git
```

**Contents:**
```
Bob2.0/
├── BobPacks/           # Personal skill packages
├── Bundles/            # Installation bundles
├── Packs/              # Upstream PAI packs
├── Tools/              # Development tools
├── MEMORY/             # Documentation archive (copied from runtime)
├── CLAUDE.md           # Project guidance
└── ARCHITECTURE.md     # This file
```

---

## Documentation Flow

### Session Documentation Workflow

When `document session` is called:

1. **Create** documentation in runtime instance:
   ```
   ~/.claude/MEMORY/PAISYSTEMUPDATES/YYYY/MM/*.md
   ```

2. **Copy** to repository for version control:
   ```
   ~/projects/Bob2.0/MEMORY/PAISYSTEMUPDATES/YYYY/MM/*.md
   ```

3. **Commit** to repository:
   ```bash
   cd ~/projects/Bob2.0
   git add MEMORY/
   git commit -m "docs: Session update - [description]"
   git push origin main
   ```

### Why This Pattern?

**Separation of Concerns:**
- **Runtime** (`~/.claude`) = working state, changes constantly
- **Repository** (`Bob2.0`) = source of truth, changes deliberately

**Security:**
- Runtime instance contains secrets, session transcripts
- Repository contains only sanitized documentation
- No risk of accidentally pushing sensitive data

**Flexibility:**
- Can rebuild `~/.claude` from repository at any time
- Can version control documentation without runtime noise
- Clean separation like `/usr/local` vs `/usr/src`

---

## GitPush Workflow Behavior

The **System skill's GitPush workflow** operates on the **repository**, not the runtime instance:

1. Documentation created in `~/.claude/MEMORY/` (runtime)
2. Copied to `Bob2.0/MEMORY/` (repository)
3. Git operations happen in `Bob2.0/` only
4. Push to `origin` (wally-kroeker/Bob2.0)

**NEVER:**
- Initialize `~/.claude` as a git repository
- Commit runtime state to git
- Push session transcripts or API keys

---

## Installation vs Source

| Aspect | `~/.claude` (Runtime) | `Bob2.0` (Source) |
|--------|----------------------|-------------------|
| **Purpose** | Installed PAI instance | Source code repository |
| **Git Status** | Not a git repo | Git-controlled |
| **Contains** | Running system, sessions | Source code, docs |
| **Updated By** | Installation scripts | Manual development |
| **Sensitive?** | Yes (keys, transcripts) | No (sanitized only) |
| **Pushed Where?** | Never | github.com/wally-kroeker/Bob2.0 |

---

## Upstream Sync Pattern

When pulling updates from upstream PAI:

```bash
cd ~/projects/Bob2.0

# Fetch latest from danielmiessler
git fetch upstream
git merge upstream/main

# Resolve conflicts (especially in customized files)
# See CLAUDE.md section "Customized Core Files (UPSTREAM DELTA)"

# Push to personal fork
git push origin main

# Reinstall affected packs to ~/.claude
# (Installation updates the runtime instance from repository source)
```

---

## BobPacks Development Pattern

When creating a new BobPack:

1. **Develop** in repository:
   ```
   Bob2.0/BobPacks/bob-new-skill/
   ├── README.md
   ├── INSTALL.md
   ├── VERIFY.md
   └── src/skills/NewSkill/
   ```

2. **Install** to runtime:
   ```
   Tell Bob: "Install the pack from /home/bob/projects/Bob2.0/BobPacks/bob-new-skill/"
   → Copies src/ to ~/.claude/skills/NewSkill/
   ```

3. **Document** changes:
   ```
   Created in: ~/.claude/MEMORY/PAISYSTEMUPDATES/
   Copied to:  Bob2.0/MEMORY/PAISYSTEMUPDATES/
   ```

4. **Commit** source:
   ```bash
   cd Bob2.0
   git add BobPacks/bob-new-skill/
   git add MEMORY/
   git commit -m "feat: Add bob-new-skill BobPack"
   git push origin main
   ```

---

## Key Principles

1. **Runtime is ephemeral** - Can be rebuilt from source at any time
2. **Source is permanent** - Version controlled, backed up, shared
3. **Documentation bridges both** - Created at runtime, archived in source
4. **Secrets stay in runtime** - Never commit `.env`, `history.jsonl`, session transcripts
5. **BobPacks start in source** - Developed in repo, installed to runtime

---

## Related Documentation

- `CLAUDE.md` - Fork structure and upstream sync
- `BobPacks/README.md` - BobPack development guidelines
- `MEMORY/PAISYSTEMUPDATES/` - System change history

---

**Last Updated:** 2026-01-20
**Maintainer:** Wally Kroeker
**Repository:** https://github.com/wally-kroeker/Bob2.0
