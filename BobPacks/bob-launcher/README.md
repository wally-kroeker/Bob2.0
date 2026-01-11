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
- **Web Tools Toggle**: Enable/disable Anthropic WebSearch
- **Tavily Integration**: Fallback to Tavily MCP for web search
- **Pricing Display**: Show model costs before selection

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
