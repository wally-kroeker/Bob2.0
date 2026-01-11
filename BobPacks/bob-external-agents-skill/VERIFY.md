# Verification: bob-external-agents-skill

Complete this checklist to verify the skill is properly installed.

## File Structure Verification

- [ ] **SKILL.md exists**
  ```bash
  test -f $PAI_DIR/skills/ExternalAgents/SKILL.md && echo "PASS" || echo "FAIL"
  ```

- [ ] **spawn-agent.sh exists and is executable**
  ```bash
  test -x $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh && echo "PASS" || echo "FAIL"
  ```

- [ ] **check-agents.sh exists and is executable**
  ```bash
  test -x $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh && echo "PASS" || echo "FAIL"
  ```

- [ ] **Output directory exists**
  ```bash
  test -d $PAI_DIR/external-agents && echo "PASS" || echo "FAIL"
  ```

## Dependency Verification

- [ ] **AgentFactory.ts accessible**
  ```bash
  test -f $PAI_DIR/skills/Agents/Tools/AgentFactory.ts && echo "PASS" || echo "FAIL"
  ```

- [ ] **bun available**
  ```bash
  which bun && echo "PASS" || echo "FAIL"
  ```

- [ ] **jq available**
  ```bash
  which jq && echo "PASS" || echo "FAIL"
  ```

- [ ] **At least one external CLI available**
  ```bash
  (which claude || which gemini || npx @openai/codex --version 2>/dev/null) && echo "PASS" || echo "FAIL"
  ```

## Functional Verification

### Test 1: spawn-agent.sh help

- [ ] **spawn-agent.sh displays help**
  ```bash
  $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh --help
  ```
  Expected: Usage information displayed

### Test 2: check-agents.sh list

- [ ] **check-agents.sh lists agents**
  ```bash
  $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list
  ```
  Expected: Empty list or existing agents shown

### Test 3: Spawn test agent (with traits)

- [ ] **Spawn a test Claude agent with traits**
  ```bash
  $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
    --model claude \
    --traits "technical,pragmatic,rapid" \
    --task "List the current directory and describe what you see." \
    --output-format json
  ```
  Expected:
  - JSON output with task_id, model, agent_name
  - Agent runs in background
  - Files created in $PAI_DIR/external-agents/

### Test 4: Verify agent metadata

- [ ] **Check agent was created**
  ```bash
  $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh list
  ```
  Expected: Test agent appears in list

- [ ] **Check agent status**
  ```bash
  # Replace with actual task_id from Test 3
  $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh status <task_id>
  ```
  Expected: Status information (running or completed)

### Test 5: Verify agent output

- [ ] **Wait for completion and check output**
  ```bash
  # Wait a few seconds for agent to complete
  sleep 10

  # Check status
  $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh status <task_id>

  # View output
  $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh output <task_id>
  ```
  Expected: Agent output displayed

### Test 6: Spawn vanilla agent (no traits)

- [ ] **Spawn without traits**
  ```bash
  $PAI_DIR/skills/ExternalAgents/Tools/spawn-agent.sh \
    --model claude \
    --task "What is 2 + 2?" \
    --output-format json
  ```
  Expected: Agent spawns with vanilla personality

## Cleanup

- [ ] **Clean test agents**
  ```bash
  $PAI_DIR/skills/ExternalAgents/Tools/check-agents.sh clean
  ```

## Skill Activation Test

- [ ] **Test skill trigger in Claude Code**

  Start a new Claude Code session and say:
  ```
  "Use Gemini to research something simple"
  ```

  Expected: Bob should recognize this triggers ExternalAgents skill and attempt to spawn a Gemini agent (may fail if Gemini CLI not installed, but routing should work)

---

## Verification Complete

All items checked? The skill is properly installed and functional.

If any items failed, review INSTALL.md troubleshooting section.
