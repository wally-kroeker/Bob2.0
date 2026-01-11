#!/usr/bin/env bash
# ExternalAgents: Spawn external AI CLI agents in background
#
# Usage: spawn-agent.sh --model <claude|gemini|codex> --traits <traits> --task <task> [options]
#
# This script:
# 1. Composes personality via AgentFactory.ts (if traits provided)
# 2. Spawns the appropriate CLI in background with full permissions
# 3. Writes output to designated file
# 4. Returns task ID for later retrieval

set -euo pipefail

# Configuration
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
OUTPUT_BASE="${PAI_DIR}/external-agents"
AGENT_FACTORY="${PAI_DIR}/skills/Agents/Tools/AgentFactory.ts"
PERSONAS_FILE="${PAI_DIR}/skills/ExternalAgents/personas.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Defaults
MODEL=""
TRAITS=""
TASK=""
TASK_FILE=""
WORKING_DIR="$(pwd)"
AGENT_NAME=""
OUTPUT_FORMAT="text"
PERSONA=""

usage() {
    cat << EOF
ExternalAgents: Spawn external AI CLI agents

Usage: $(basename "$0") [OPTIONS]

Required (choose one):
  -m, --model <model>       AI model: claude, gemini, or codex
  -p, --persona <persona>   Use predefined persona (bill, mario, riker, howard, homer, hugh, bender, ick)

Required:
  -t, --task <task>         Task description (or use --task-file)
  --task-file <file>        Read task from file instead of argument

Optional:
  -r, --traits <traits>     Comma-separated traits for AgentFactory (overrides persona traits)
  -n, --name <name>         Agent name (default: auto-generated from traits/persona or model)
  -d, --dir <directory>     Working directory for the agent (default: current)
  -o, --output-format <fmt> Output format: text, json (default: text)
  -h, --help                Show this help

Personas (Bobiverse-inspired, model-specific):
    hugh     - The Transhumanist [Codex]  - Elite precision, "Skippy" efficiency
    bender   - The Weary Legend [Gemini]  - Veteran resilience, gritty pragmatism
    ick      - The Zen Explorer [Claude]  - Patient wisdom, galactic perspective

  NOTE: Role-based personas (Bill, Mario, Riker, Howard, Homer) use the
        built-in Agents skill with Task tool subagents, not this script.

Examples:
  # Launch Hugh on Codex for elite code work
  $(basename "$0") -p hugh -t "Implement authentication with Skippy precision"

  # Launch Bender on Gemini to debug a mess
  $(basename "$0") -p bender -t "Debug this legacy codebase"

  # Launch Ick on Claude for thoughtful analysis
  $(basename "$0") -p ick -t "Review this architecture with galactic perspective"

  # Launch multiple agents in parallel (from Bob's perspective):
  # spawn-agent.sh -p bender -t "Task 1" &
  # spawn-agent.sh -p ick -t "Task 2" &
  # spawn-agent.sh -p bender -t "Task 3" &

  # Manual traits and model (without persona)
  $(basename "$0") -m gemini -r "research,enthusiastic,exploratory" -t "Research VDI solutions"
EOF
    exit 0
}

log() {
    echo -e "${CYAN}[ExternalAgents]${NC} $1" >&2
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--model)
            MODEL="$2"
            shift 2
            ;;
        -p|--persona)
            PERSONA="$2"
            shift 2
            ;;
        -t|--task)
            TASK="$2"
            shift 2
            ;;
        --task-file)
            TASK_FILE="$2"
            shift 2
            ;;
        -r|--traits)
            TRAITS="$2"
            shift 2
            ;;
        -n|--name)
            AGENT_NAME="$2"
            shift 2
            ;;
        -d|--dir)
            WORKING_DIR="$2"
            shift 2
            ;;
        -o|--output-format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Load persona if specified
if [[ -n "$PERSONA" ]]; then
    if [[ ! -f "$PERSONAS_FILE" ]]; then
        error "Personas file not found: $PERSONAS_FILE"
    fi

    # Load persona using Python to parse YAML
    PERSONA_DATA=$(python3 <<EOF
import yaml
import sys

with open('$PERSONAS_FILE', 'r') as f:
    personas = yaml.safe_load(f)

persona = personas.get('personas', {}).get('$PERSONA')
if not persona:
    print('ERROR', file=sys.stderr)
    sys.exit(1)

traits = persona.get('traits', '')
model = persona.get('model')
name = persona.get('name', '$PERSONA')

print(f"TRAITS={traits}")
print(f"MODEL={model if model else ''}")
print(f"NAME={name}")
EOF
)

    if [[ $? -ne 0 ]]; then
        error "Persona not found: $PERSONA. Available: hugh, bender, ick"
    fi

    # Extract values from persona data
    eval "$PERSONA_DATA"

    # Set defaults from persona if not explicitly provided
    [[ -z "$TRAITS" && -n "$(echo "$PERSONA_DATA" | grep '^TRAITS=')" ]] && TRAITS=$(echo "$PERSONA_DATA" | grep '^TRAITS=' | cut -d= -f2-)
    [[ -z "$MODEL" && -n "$(echo "$PERSONA_DATA" | grep '^MODEL=' | cut -d= -f2-)" ]] && MODEL=$(echo "$PERSONA_DATA" | grep '^MODEL=' | cut -d= -f2-)
    [[ -z "$AGENT_NAME" && -n "$(echo "$PERSONA_DATA" | grep '^NAME=')" ]] && AGENT_NAME=$(echo "$PERSONA_DATA" | grep '^NAME=' | cut -d= -f2-)

    log "Using persona: $PERSONA ($AGENT_NAME)"
fi

# Validate required arguments
[[ -z "$MODEL" && -z "$PERSONA" ]] && error "Either --model or --persona is required"
[[ -z "$MODEL" ]] && error "Model could not be determined. Specify --model or use a model-specific persona (hugh, bender, ick)"
[[ -z "$TASK" && -z "$TASK_FILE" ]] && error "Task is required (-t/--task or --task-file)"

# Read task from file if specified
if [[ -n "$TASK_FILE" ]]; then
    [[ ! -f "$TASK_FILE" ]] && error "Task file not found: $TASK_FILE"
    TASK="$(cat "$TASK_FILE")"
fi

# Validate model
case "$MODEL" in
    claude|gemini|codex)
        ;;
    *)
        error "Invalid model: $MODEL. Must be one of: claude, gemini, codex"
        ;;
esac

# Create output directory
mkdir -p "$OUTPUT_BASE"

# Generate task ID and output paths
TASK_ID="$(date +%Y%m%d-%H%M%S)-${MODEL}-$$"
OUTPUT_FILE="${OUTPUT_BASE}/${TASK_ID}.output"
META_FILE="${OUTPUT_BASE}/${TASK_ID}.meta"
PID_FILE="${OUTPUT_BASE}/${TASK_ID}.pid"

# Compose personality prompt via AgentFactory (if traits provided)
SYSTEM_PROMPT=""
VOICE_INFO=""

if [[ -n "$TRAITS" ]]; then
    if [[ ! -f "$AGENT_FACTORY" ]]; then
        error "AgentFactory not found at $AGENT_FACTORY. Is pai-agents-skill installed?"
    fi

    log "Composing agent personality from traits: $TRAITS"

    # Get agent composition from AgentFactory
    AGENT_JSON=$(bun run "$AGENT_FACTORY" --traits "$TRAITS" --task "$TASK" --output json 2>/dev/null) || {
        error "AgentFactory failed. Check traits are valid."
    }

    # Extract fields from JSON
    SYSTEM_PROMPT=$(echo "$AGENT_JSON" | jq -r '.prompt // empty')
    AGENT_NAME_GEN=$(echo "$AGENT_JSON" | jq -r '.name // empty')
    VOICE_INFO=$(echo "$AGENT_JSON" | jq -r '.voice // empty')

    # Use generated name if not provided
    [[ -z "$AGENT_NAME" ]] && AGENT_NAME="$AGENT_NAME_GEN"

    [[ -z "$SYSTEM_PROMPT" ]] && error "AgentFactory returned empty prompt"

    log "Agent personality: $AGENT_NAME (Voice: $VOICE_INFO)"
else
    # No traits - use vanilla agent
    AGENT_NAME="${AGENT_NAME:-${MODEL}-agent}"
    log "Spawning vanilla $MODEL agent (no traits)"
fi

# Write metadata
cat > "$META_FILE" << EOF
{
  "task_id": "$TASK_ID",
  "model": "$MODEL",
  "agent_name": "$AGENT_NAME",
  "traits": "$TRAITS",
  "voice": "$VOICE_INFO",
  "working_dir": "$WORKING_DIR",
  "started_at": "$(date -Iseconds)",
  "status": "running",
  "output_file": "$OUTPUT_FILE",
  "pid_file": "$PID_FILE"
}
EOF

log "Task ID: $TASK_ID"
log "Output: $OUTPUT_FILE"

# Spawn the appropriate agent
cd "$WORKING_DIR"

case "$MODEL" in
    claude)
        # Claude CLI with full permissions
        CMD_ARGS=(
            claude
            --print
            --dangerously-skip-permissions
        )

        if [[ -n "$SYSTEM_PROMPT" ]]; then
            CMD_ARGS+=(--append-system-prompt "$SYSTEM_PROMPT")
        fi

        # Run in background, capture output
        (
            "${CMD_ARGS[@]}" "$TASK" > "$OUTPUT_FILE" 2>&1
            # Update status on completion
            jq '.status = "completed" | .completed_at = "'"$(date -Iseconds)"'"' "$META_FILE" > "${META_FILE}.tmp" && mv "${META_FILE}.tmp" "$META_FILE"
        ) &
        ;;

    gemini)
        # Gemini CLI with YOLO mode
        # Gemini doesn't have system prompt flag, so we prepend to task
        FULL_PROMPT="$TASK"
        if [[ -n "$SYSTEM_PROMPT" ]]; then
            FULL_PROMPT="[PERSONALITY CONTEXT]
$SYSTEM_PROMPT

[TASK]
$TASK"
        fi

        (
            gemini --yolo --output-format text "$FULL_PROMPT" > "$OUTPUT_FILE" 2>&1
            jq '.status = "completed" | .completed_at = "'"$(date -Iseconds)"'"' "$META_FILE" > "${META_FILE}.tmp" && mv "${META_FILE}.tmp" "$META_FILE"
        ) &
        ;;

    codex)
        # Codex CLI with full bypass
        # Codex can read from stdin, so we can prepend personality
        FULL_PROMPT="$TASK"
        if [[ -n "$SYSTEM_PROMPT" ]]; then
            FULL_PROMPT="[PERSONALITY CONTEXT]
$SYSTEM_PROMPT

[TASK]
$TASK"
        fi

        (
            echo "$FULL_PROMPT" | npx @openai/codex exec \
                --dangerously-bypass-approvals-and-sandbox \
                --skip-git-repo-check \
                -o "$OUTPUT_FILE" \
                - 2>&1
            jq '.status = "completed" | .completed_at = "'"$(date -Iseconds)"'"' "$META_FILE" > "${META_FILE}.tmp" && mv "${META_FILE}.tmp" "$META_FILE"
        ) &
        ;;
esac

# Save PID
AGENT_PID=$!
echo "$AGENT_PID" > "$PID_FILE"

# Update metadata with PID
jq '.pid = '"$AGENT_PID"'' "$META_FILE" > "${META_FILE}.tmp" && mv "${META_FILE}.tmp" "$META_FILE"

log "Agent spawned with PID: $AGENT_PID"

# Output result based on format
if [[ "$OUTPUT_FORMAT" == "json" ]]; then
    cat "$META_FILE"
else
    echo ""
    echo -e "${GREEN}External agent spawned successfully${NC}"
    echo ""
    echo "  Task ID:     $TASK_ID"
    echo "  Model:       $MODEL"
    echo "  Agent:       $AGENT_NAME"
    echo "  PID:         $AGENT_PID"
    echo "  Output:      $OUTPUT_FILE"
    echo ""
    echo "To check status:"
    echo "  cat $META_FILE"
    echo ""
    echo "To view output:"
    echo "  tail -f $OUTPUT_FILE"
    echo ""
fi
