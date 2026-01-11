#!/usr/bin/env bash
# ExternalAgents: Check status of spawned external agents
#
# Usage: check-agents.sh [command] [options]
#
# Commands:
#   list              List all agents (running and completed)
#   status <task_id>  Check status of specific agent
#   output <task_id>  View output from agent
#   kill <task_id>    Kill a running agent
#   clean             Remove completed agent files older than 24h

set -euo pipefail

PAI_DIR="${PAI_DIR:-$HOME/.claude}"
OUTPUT_BASE="${PAI_DIR}/external-agents"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

usage() {
    cat << EOF
ExternalAgents: Check status of spawned agents

Usage: $(basename "$0") <command> [options]

Commands:
  list                    List all agents (running and completed)
  status <task_id>        Check status of specific agent
  output <task_id>        View output from agent
  tail <task_id>          Tail output (follow mode)
  kill <task_id>          Kill a running agent
  clean                   Remove completed agent files older than 24h
  summary                 Quick summary of agent statuses

Options:
  -j, --json              Output in JSON format
  -h, --help              Show this help

Examples:
  $(basename "$0") list
  $(basename "$0") status 20250110-143022-claude-12345
  $(basename "$0") output 20250110-143022-claude-12345
  $(basename "$0") tail 20250110-143022-claude-12345
EOF
    exit 0
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

# Ensure output directory exists
mkdir -p "$OUTPUT_BASE"

# Parse global options
JSON_OUTPUT=false
while [[ $# -gt 0 && "$1" == -* ]]; do
    case $1 in
        -j|--json)
            JSON_OUTPUT=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            break
            ;;
    esac
done

COMMAND="${1:-list}"
shift || true

check_pid_alive() {
    local pid=$1
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
        echo "true"
    else
        echo "false"
    fi
}

update_status() {
    local meta_file=$1
    local pid
    pid=$(jq -r '.pid // empty' "$meta_file" 2>/dev/null)
    local current_status
    current_status=$(jq -r '.status // "unknown"' "$meta_file" 2>/dev/null)

    if [[ "$current_status" == "running" && -n "$pid" ]]; then
        if ! kill -0 "$pid" 2>/dev/null; then
            # Process died but wasn't marked complete
            jq '.status = "completed" | .completed_at = "'"$(date -Iseconds)"'"' "$meta_file" > "${meta_file}.tmp" && mv "${meta_file}.tmp" "$meta_file"
        fi
    fi
}

cmd_list() {
    local running=0
    local completed=0
    local failed=0

    if $JSON_OUTPUT; then
        echo "["
        local first=true
    else
        echo ""
        echo -e "${BOLD}External Agents${NC}"
        echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
        printf "%-28s %-10s %-20s %-10s\n" "TASK ID" "MODEL" "AGENT" "STATUS"
        echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
    fi

    shopt -s nullglob
    for meta_file in "$OUTPUT_BASE"/*.meta; do
        [[ ! -f "$meta_file" ]] && continue

        update_status "$meta_file"

        local task_id model agent_name status
        task_id=$(jq -r '.task_id' "$meta_file")
        model=$(jq -r '.model' "$meta_file")
        agent_name=$(jq -r '.agent_name' "$meta_file")
        status=$(jq -r '.status' "$meta_file")

        case $status in
            running) running=$((running + 1)); status_color="${YELLOW}" ;;
            completed) completed=$((completed + 1)); status_color="${GREEN}" ;;
            *) failed=$((failed + 1)); status_color="${RED}" ;;
        esac

        if $JSON_OUTPUT; then
            $first || echo ","
            first=false
            cat "$meta_file"
        else
            printf "%-28s %-10s %-20s ${status_color}%-10s${NC}\n" \
                "$task_id" "$model" "${agent_name:0:20}" "$status"
        fi
    done

    if $JSON_OUTPUT; then
        echo "]"
    else
        echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
        echo -e "Running: ${YELLOW}$running${NC}  Completed: ${GREEN}$completed${NC}  Failed: ${RED}$failed${NC}"
        echo ""
    fi
}

cmd_summary() {
    local running=0
    local completed=0

    shopt -s nullglob
    for meta_file in "$OUTPUT_BASE"/*.meta; do
        [[ ! -f "$meta_file" ]] && continue
        update_status "$meta_file"
        local status
        status=$(jq -r '.status' "$meta_file")
        case $status in
            running) ((running++)) ;;
            completed) ((completed++)) ;;
        esac
    done

    if $JSON_OUTPUT; then
        echo "{\"running\": $running, \"completed\": $completed}"
    else
        echo -e "External Agents: ${YELLOW}$running running${NC}, ${GREEN}$completed completed${NC}"
    fi
}

cmd_status() {
    local task_id="${1:-}"
    [[ -z "$task_id" ]] && error "Task ID required. Use: $(basename "$0") status <task_id>"

    local meta_file="${OUTPUT_BASE}/${task_id}.meta"
    [[ ! -f "$meta_file" ]] && error "Agent not found: $task_id"

    update_status "$meta_file"

    if $JSON_OUTPUT; then
        cat "$meta_file"
    else
        echo ""
        echo -e "${BOLD}Agent Status: $task_id${NC}"
        echo ""

        local model agent_name status traits voice started completed pid
        model=$(jq -r '.model' "$meta_file")
        agent_name=$(jq -r '.agent_name' "$meta_file")
        status=$(jq -r '.status' "$meta_file")
        traits=$(jq -r '.traits // "none"' "$meta_file")
        voice=$(jq -r '.voice // "default"' "$meta_file")
        started=$(jq -r '.started_at' "$meta_file")
        completed=$(jq -r '.completed_at // "N/A"' "$meta_file")
        pid=$(jq -r '.pid // "N/A"' "$meta_file")

        case $status in
            running) status_display="${YELLOW}RUNNING${NC}" ;;
            completed) status_display="${GREEN}COMPLETED${NC}" ;;
            *) status_display="${RED}$status${NC}" ;;
        esac

        echo "  Model:       $model"
        echo "  Agent:       $agent_name"
        echo -e "  Status:      $status_display"
        echo "  Traits:      $traits"
        echo "  Voice:       $voice"
        echo "  PID:         $pid"
        echo "  Started:     $started"
        echo "  Completed:   $completed"
        echo ""

        local output_file="${OUTPUT_BASE}/${task_id}.output"
        if [[ -f "$output_file" ]]; then
            local lines
            lines=$(wc -l < "$output_file")
            local size
            size=$(du -h "$output_file" | cut -f1)
            echo "  Output:      $lines lines ($size)"
            echo "  File:        $output_file"
        fi
        echo ""
    fi
}

cmd_output() {
    local task_id="${1:-}"
    [[ -z "$task_id" ]] && error "Task ID required. Use: $(basename "$0") output <task_id>"

    local output_file="${OUTPUT_BASE}/${task_id}.output"
    [[ ! -f "$output_file" ]] && error "Output not found: $output_file"

    cat "$output_file"
}

cmd_tail() {
    local task_id="${1:-}"
    [[ -z "$task_id" ]] && error "Task ID required. Use: $(basename "$0") tail <task_id>"

    local output_file="${OUTPUT_BASE}/${task_id}.output"
    [[ ! -f "$output_file" ]] && error "Output not found: $output_file"

    tail -f "$output_file"
}

cmd_kill() {
    local task_id="${1:-}"
    [[ -z "$task_id" ]] && error "Task ID required. Use: $(basename "$0") kill <task_id>"

    local meta_file="${OUTPUT_BASE}/${task_id}.meta"
    [[ ! -f "$meta_file" ]] && error "Agent not found: $task_id"

    local pid
    pid=$(jq -r '.pid // empty' "$meta_file")
    [[ -z "$pid" ]] && error "No PID found for agent"

    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid"
        jq '.status = "killed" | .killed_at = "'"$(date -Iseconds)"'"' "$meta_file" > "${meta_file}.tmp" && mv "${meta_file}.tmp" "$meta_file"
        echo -e "${GREEN}Killed agent $task_id (PID: $pid)${NC}"
    else
        echo -e "${YELLOW}Agent already stopped${NC}"
    fi
}

cmd_clean() {
    local count=0
    local cutoff
    cutoff=$(date -d '24 hours ago' +%s 2>/dev/null || date -v-24H +%s)

    shopt -s nullglob
    for meta_file in "$OUTPUT_BASE"/*.meta; do
        [[ ! -f "$meta_file" ]] && continue

        local status completed_at
        status=$(jq -r '.status' "$meta_file")
        completed_at=$(jq -r '.completed_at // empty' "$meta_file")

        if [[ "$status" == "completed" && -n "$completed_at" ]]; then
            local file_time
            file_time=$(date -d "$completed_at" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%S" "${completed_at%%+*}" +%s 2>/dev/null || echo 0)

            if [[ "$file_time" -lt "$cutoff" ]]; then
                local task_id
                task_id=$(jq -r '.task_id' "$meta_file")
                rm -f "${OUTPUT_BASE}/${task_id}.meta" "${OUTPUT_BASE}/${task_id}.output" "${OUTPUT_BASE}/${task_id}.pid"
                ((count++))
            fi
        fi
    done

    echo -e "${GREEN}Cleaned $count completed agent(s)${NC}"
}

# Execute command
case "$COMMAND" in
    list)
        cmd_list
        ;;
    summary)
        cmd_summary
        ;;
    status)
        cmd_status "$@"
        ;;
    output)
        cmd_output "$@"
        ;;
    tail)
        cmd_tail "$@"
        ;;
    kill)
        cmd_kill "$@"
        ;;
    clean)
        cmd_clean
        ;;
    *)
        error "Unknown command: $COMMAND"
        ;;
esac
