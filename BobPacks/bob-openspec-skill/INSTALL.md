# Installation Guide: Openspec Skill

## Pre-Installation System Check

Before installing, verify your system meets these requirements:

### 1. Check PAI Core Installation

```bash
# Verify CORE skill exists
ls $PAI_DIR/skills/CORE/SKILL.md

# Verify PAI_DIR is set
echo $PAI_DIR
# Expected: /home/bob/.claude (or your custom path)
```

### 2. Check Node.js and npm

```bash
# Check Node.js version (14+ required)
node --version

# Check npm
npm --version
```

If Node.js is not installed:
```bash
# Ubuntu/Debian
sudo apt install nodejs npm

# macOS
brew install node
```

### 3. Install OpenSpec CLI

```bash
# Install globally
npm install -g @fission-ai/openspec@latest

# Verify installation
openspec --version
```

## Installation Steps

### Step 1: Copy Skill Files

```bash
# From the Bob2.0 repository root
cp -r BobPacks/bob-openspec-skill/src/skills/Openspec $PAI_DIR/skills/
```

### Step 2: Verify Directory Structure

```bash
# Check skill directory exists
ls -la $PAI_DIR/skills/Openspec/

# Expected output:
# SKILL.md
# Tools/
# Workflows/
```

### Step 3: Set Permissions

```bash
# Make tools executable (if any shell scripts exist)
chmod +x $PAI_DIR/skills/Openspec/Tools/*.sh 2>/dev/null || true
```

### Step 4: Test OpenSpec CLI Access

```bash
# Verify openspec is in PATH
which openspec

# Test CLI
openspec --help
```

## Installation Complete

The Openspec skill is now installed. Proceed to `VERIFY.md` to validate the installation.

## Troubleshooting

### Issue: "openspec: command not found"

**Solution:** The OpenSpec CLI is not installed or not in PATH.

```bash
# Re-install globally
npm install -g @fission-ai/openspec@latest

# Check npm global bin directory
npm bin -g

# Add to PATH if needed (add to ~/.zshrc or ~/.bashrc)
export PATH="$(npm bin -g):$PATH"
```

### Issue: "Permission denied" when installing npm package

**Solution:** Use a node version manager or fix npm permissions.

```bash
# Option 1: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Issue: Skill not recognized by Claude Code

**Solution:** Restart Claude Code session.

```bash
# Exit Claude Code
/exit

# Restart
claude
```

## Next Steps

After installation, proceed to `VERIFY.md` to complete the verification checklist.
