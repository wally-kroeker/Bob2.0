# Bob Launcher - Verification Checklist

Complete ALL checks below to confirm successful installation.

## Installation Verification

### ✅ Core Installation

- [ ] **Script exists at correct location**
  ```bash
  ls -la ~/.local/bin/cc
  ```
  Expected: File exists and shows executable permissions (`-rwx...`)

- [ ] **Script is executable**
  ```bash
  test -x ~/.local/bin/cc && echo "✓ Executable" || echo "✗ Not executable"
  ```
  Expected: `✓ Executable`

- [ ] **PATH includes ~/.local/bin**
  ```bash
  echo $PATH | grep -q "$HOME/.local/bin" && echo "✓ In PATH" || echo "✗ Not in PATH"
  ```
  Expected: `✓ In PATH`

- [ ] **`cc` command is accessible from anywhere**
  ```bash
  which cc
  ```
  Expected: `/home/<user>/.local/bin/cc`

### ✅ Functional Verification

- [ ] **Launcher displays menu**
  ```bash
  cc --help 2>/dev/null || cc
  ```
  Expected: Interactive menu appears with provider selection (Anthropic/LiteLLM)

  > Press `q` to quit the menu after verifying it appears

- [ ] **Script has valid bash syntax**
  ```bash
  bash -n ~/.local/bin/cc && echo "✓ Valid syntax" || echo "✗ Syntax error"
  ```
  Expected: `✓ Valid syntax`

### ✅ Tmux Session Management

- [ ] **Tmux is installed**
  ```bash
  which tmux && echo "✓ Tmux installed" || echo "✗ Tmux not found"
  ```
  Expected: `✓ Tmux installed`

- [ ] **New session creates tmux session**
  ```bash
  cd /tmp && cc  # Select Anthropic → Sonnet
  # After Claude starts, press Ctrl-B d to detach
  tmux list-sessions | grep "^cc_" && echo "✓ Session created" || echo "✗ No session"
  ```
  Expected: `cc_tmp` (or similar) session visible

- [ ] **Session restore menu works**
  ```bash
  cc  # Press 'r' for Restore Session
  ```
  Expected: Shows list of active `cc_*` sessions

- [ ] **Dangerous mode toggle works**
  ```bash
  cc  # Press 'd' to toggle dangerous mode
  ```
  Expected: Menu shows `[ON]` indicator and warning banner

- [ ] **Session attach works from outside tmux**
  ```bash
  # With a detached session existing:
  cc  # Press 'r', select session number
  ```
  Expected: Attaches to existing session

- [ ] **Session switch works from inside tmux**
  ```bash
  # While inside a tmux session:
  cc  # Press 'r', select different session
  ```
  Expected: Switches to selected session (doesn't create nested tmux)

- [ ] **Kill session works**
  ```bash
  cc  # Press 'r', then 'k', select session, confirm
  ```
  Expected: Session removed from `tmux list-sessions`

### ✅ Optional: LiteLLM Configuration

Only if you set up LiteLLM support:

- [ ] **Config file exists (if using LiteLLM)**
  ```bash
  ls ~/.local/bin/config.yaml 2>/dev/null && echo "✓ Config exists" || echo "○ No config (will use LiteLLM /v1/models)"
  ```
  Expected: Either shows config exists, or indicates the remote `/v1/models` fallback will be used

- [ ] **LiteLLM proxy health (if running)**
  ```bash
  curl -s --max-time 3 http://walub.kroeker.fun:4000/health 2>/dev/null && echo "✓ LiteLLM online" || echo "○ LiteLLM not running"
  ```
  Expected: Either shows online, or indicates proxy not running (optional)

## Quick Verification (All-in-One)

Run this single command to verify the essentials:

```bash
echo "=== Bob Launcher Verification ===" && \
test -x ~/.local/bin/cc && echo "✓ Script installed and executable" || echo "✗ Script missing or not executable" && \
which cc >/dev/null 2>&1 && echo "✓ cc command in PATH" || echo "✗ cc not in PATH" && \
bash -n ~/.local/bin/cc && echo "✓ Script syntax valid" || echo "✗ Script has syntax errors"
```

## Verification Status

| Check | Status |
|-------|--------|
| Script installed at ~/.local/bin/cc | ☐ |
| Script is executable | ☐ |
| ~/.local/bin in PATH | ☐ |
| `cc` command accessible | ☐ |
| Menu displays correctly | ☐ |
| Syntax validation passes | ☐ |
| Tmux installed | ☐ |
| Tmux session creation works | ☐ |
| Session restore menu works | ☐ |
| Dangerous mode toggle works | ☐ |

**Installation is COMPLETE when ALL required checks pass.**

## Troubleshooting

### `cc: command not found`
- Ensure `~/.local/bin` is in your PATH
- Run `source ~/.bashrc` (or `~/.zshrc`) to reload
- Open a new terminal session

### Permission denied
- Run `chmod +x ~/.local/bin/cc`

### Menu doesn't display correctly
- Ensure your terminal supports ANSI colors
- Check bash version: `bash --version` (needs 4.0+)

