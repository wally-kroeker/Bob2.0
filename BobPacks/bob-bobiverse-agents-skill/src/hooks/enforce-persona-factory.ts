#!/usr/bin/env bun
// enforce-persona-factory.ts
// PreToolUse hook that ensures Bobiverse agents are spawned via PersonaFactory
//
// WHAT IT DOES:
// - Fires on Task tool calls
// - Checks if description/prompt mentions a Bobiverse agent name
// - If yes, requires [AGENT_INSTANCE: ...] marker (injected by PersonaFactory)
// - Blocks raw Task calls that bypass PersonaFactory for named agents
//
// WHY:
// - Ensures agents get full personality, backstory, and traits
// - Enables observability tracking of named agents
// - Prevents "personality-less shells" from being spawned
//
// DOES NOT AFFECT:
// - Generic agent spawns (no Bobiverse name mentioned)
// - Upstream Agents skill / AgentFactory usage
// - Any non-Task tool calls

const BOBIVERSE_AGENTS = [
  'bill',
  'mario',
  'riker',
  'howard',
  'homer',
  'hugh',
  'bender',
  'ick'
];

// Patterns that indicate a Bobiverse agent is being invoked
// Matches: "Bill", "bill", "Bill -", "Mario:", etc.
function detectBobiverseAgent(text: string): string | null {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  for (const agent of BOBIVERSE_AGENTS) {
    // Match agent name at word boundary
    // Patterns: "Bill designs...", "Mario - implement", "Get Riker to..."
    const patterns = [
      new RegExp(`\\b${agent}\\b`, 'i'),           // Word boundary match
      new RegExp(`^${agent}[:\\s-]`, 'i'),         // Starts with agent name
      new RegExp(`\\b${agent}[:\\s-]`, 'i'),       // Agent name followed by delimiter
    ];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return agent;
      }
    }
  }

  return null;
}

// Check if prompt contains the PersonaFactory marker
function hasAgentInstanceMarker(prompt: string): boolean {
  if (!prompt) return false;
  return /\[AGENT_INSTANCE:\s*[^\]]+\]/.test(prompt);
}

async function main() {
  try {
    // Read hook input from stdin
    const input = await Bun.stdin.text();
    const hookData = JSON.parse(input);

    // Only check Task tool calls
    if (hookData.tool_name !== 'Task') {
      process.exit(0); // Allow - not a Task call
    }

    const toolInput = hookData.tool_input || {};
    const description = toolInput.description || '';
    const prompt = toolInput.prompt || '';

    // Check if a Bobiverse agent is mentioned
    const agentInDescription = detectBobiverseAgent(description);
    const agentInPrompt = detectBobiverseAgent(prompt);
    const detectedAgent = agentInDescription || agentInPrompt;

    if (!detectedAgent) {
      process.exit(0); // Allow - no Bobiverse agent mentioned
    }

    // Bobiverse agent detected - require PersonaFactory marker
    if (hasAgentInstanceMarker(prompt)) {
      process.exit(0); // Allow - properly spawned via PersonaFactory
    }

    // Block - Bobiverse agent without PersonaFactory
    const capitalizedAgent = detectedAgent.charAt(0).toUpperCase() + detectedAgent.slice(1);
    console.error(`
╔════════════════════════════════════════════════════════════════════╗
║  BLOCKED: Bobiverse agent "${capitalizedAgent}" requires PersonaFactory       ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  You mentioned "${capitalizedAgent}" but bypassed PersonaFactory.             ║
║  This spawns a personality-less shell without:                     ║
║    - Full backstory and character traits                          ║
║    - Observability tracking                                       ║
║    - Voice configuration                                          ║
║    - Relationship continuity                                      ║
║                                                                    ║
║  TO FIX: Use the BobiverseAgents skill workflow:                  ║
║                                                                    ║
║  1. Run PersonaFactory:                                           ║
║     bun run $PAI_DIR/skills/BobiverseAgents/Tools/PersonaFactory.ts \\
║       --persona ${detectedAgent} --task "your task" --output json            ║
║                                                                    ║
║  2. Use returned prompt in Task call                              ║
║                                                                    ║
║  Or invoke the BobiverseAgents skill which handles this for you.  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

    process.exit(2); // Block the tool call

  } catch (error) {
    // Hooks should never crash Claude Code - fail open
    console.error('enforce-persona-factory error:', error);
    process.exit(0); // Allow on error (fail-safe)
  }
}

main();
