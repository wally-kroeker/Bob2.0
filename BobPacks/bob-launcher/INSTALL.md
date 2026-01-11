# Bob Launcher - Installation Guide

This pack installs the Claude Code launcher as `cc` in your PATH for global access.

## Prerequisites

- Claude Code CLI installed (`claude` command available)
- Bash shell
- Python 3 (for JSON manipulation in the script)
- (Optional) LiteLLM proxy for multi-model support
- (Optional) Tavily API key for web search with non-Anthropic models

## Installation Steps

### Step 1: Create the bin directory (if it doesn't exist)

```bash
mkdir -p ~/.local/bin
```

### Step 2: Copy the launcher script as `cc`

```bash
cp src/tools/claude-launcher.sh ~/.local/bin/cc
```

### Step 3: Make the script executable

```bash
chmod +x ~/.local/bin/cc
```

### Step 4: Ensure ~/.local/bin is in your PATH

Add to your shell profile if not already present:

**For Bash (~/.bashrc):**
```bash
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
fi
```

**For Zsh (~/.zshrc):**
```bash
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
fi
```

### Step 5: (Optional) Set up a local LiteLLM model list (config.yaml)

By default, the launcher will query your LiteLLM proxy at `LITELLM_URL` (`/v1/models`) to get the available model list.

Create `~/.local/bin/config.yaml` only if you want to **curate/override** the model list shown in the menu (for example, to hide internal models or add descriptions via stable aliases).

```bash
mkdir -p ~/.local/bin
cat > ~/.local/bin/config.yaml << 'EOF'
model_list:
  - model_name: gemini-flash
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-2.5-pro
      api_key: os.environ/GEMINI_API_KEY
  - model_name: gpt-5
    litellm_params:
      model: gpt-5.1
      api_key: os.environ/OPENAI_API_KEY
EOF
```

Customize this config with your preferred model names.

### Step 6: (Optional) Configure LiteLLM connection settings

If your LiteLLM proxy uses different settings, edit the script:

```bash
# Edit these lines at the top of the script:
# LITELLM_URL="http://walub.kroeker.fun:4000"
# LITELLM_KEY="sk-1234567890abcdef"
nano ~/.local/bin/cc
```

## Quick Install (One-liner)

For a quick install with defaults:

```bash
mkdir -p ~/.local/bin && \
cp src/tools/claude-launcher.sh ~/.local/bin/cc && \
chmod +x ~/.local/bin/cc && \
grep -q '$HOME/.local/bin' ~/.bashrc 2>/dev/null || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && \
source ~/.bashrc
```

## Uninstallation

To remove the launcher:

```bash
rm ~/.local/bin/cc
rm -f ~/.local/bin/config.yaml  # If you created one
```

