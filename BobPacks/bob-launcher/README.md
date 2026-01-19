---
name: Bob Launcher
pack-id: bob-launcher-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Interactive model selection launcher for Claude Code. Supports Anthropic direct API, LiteLLM proxy, and multiple AI providers.
type: tool
platform: claude-code
dependencies: []
keywords: [launcher, claude, model-selection, litellm, anthropic]
---

# Bob Launcher

Interactive CLI launcher for Claude Code with multi-model support.

## Features

- **Model Selection**: Choose between Sonnet, Opus, Haiku
- **LiteLLM Support**: Connect to Gemini, GPT, Ollama via proxy
- **Tmux Session Management**: All sessions run in tmux with project-based naming
- **Session Restore**: List and reattach to active Claude sessions
- **Dangerous Mode Toggle**: Quick toggle for `--dangerously-skip-permissions`
- **Web Tools Toggle**: Enable/disable Anthropic WebSearch
- **Tavily Integration**: Fallback to Tavily MCP for web search
- **Pricing Display**: Show model costs before selection

## Session Management

All Claude Code sessions run inside tmux for session persistence and management.

### Session Naming

Sessions are named based on your current directory:
- Pattern: `cc_<project_folder>`
- Examples: `cc_Bob2.0`, `cc_my_project`
- Duplicates get suffixes: `cc_Bob2.0_2`, `cc_Bob2.0_3`

### Restore Sessions

Press `r` in the main menu to:
- List all active `cc_*` sessions with status (● attached, ○ detached)
- Attach to any session by number
- Kill sessions you no longer need

### Dangerous Mode

Press `d` in the main menu to toggle dangerous mode:
- When **ON**: Appends `--dangerously-skip-permissions` to all claude commands
- When **OFF**: Normal permission prompts
- Shows warning banner when enabled
- Session-scoped (resets when launcher exits)

### Tmux Controls

When inside a Claude session:
- **Detach**: `Ctrl-B d` - Detach and return to shell (session keeps running)
- **Switch**: `Ctrl-B s` - Switch between tmux sessions
- **Kill**: `Ctrl-B x` - Kill current pane/session

## Installation

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

**Quick Install:**
```bash
mkdir -p ~/.local/bin && \
cp src/tools/claude-launcher.sh ~/.local/bin/cc && \
chmod +x ~/.local/bin/cc && \
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && \
source ~/.bashrc
```

After installation, verify with [VERIFY.md](VERIFY.md).

## Usage

```bash
cc              # Launch interactive menu
cc --help       # Show usage
```

## Pack Structure

```
bob-launcher/
├── README.md           # This file - pack overview
├── INSTALL.md          # Step-by-step installation instructions
├── VERIFY.md           # Mandatory verification checklist
└── src/
    └── tools/
        └── claude-launcher.sh   # The launcher script
```
