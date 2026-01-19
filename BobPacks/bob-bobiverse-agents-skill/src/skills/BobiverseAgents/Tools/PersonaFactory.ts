#!/usr/bin/env bun

/**
 * PersonaFactory - Compose Bobiverse Agents from Personas
 *
 * Bridges AgentFactory (trait composition) with Bobiverse personas (rich backstories).
 * Reads a persona name, gets trait composition from AgentFactory, then enriches it
 * with the persona's backstory, character, and communication style.
 *
 * Usage:
 *   bun run PersonaFactory.ts --persona bill --task "Design auth system"
 *   bun run PersonaFactory.ts --persona hugh --task "Optimize algorithm"
 *   bun run PersonaFactory.ts --list-personas
 *   bun run PersonaFactory.ts --persona mario --task "Fix bug" --output json
 *
 * @version 1.0.0
 */

import { parseArgs } from "util";
import { readFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { parse as parseYaml } from "yaml";

// Paths
const PAI_DIR = process.env.PAI_DIR || `${process.env.HOME}/.claude`;

// Try both installed and source paths for Personas.yaml
let PERSONAS_PATH = `${PAI_DIR}/skills/BobiverseAgents/Data/Personas.yaml`;
const SOURCE_PERSONAS_PATH = `${PAI_DIR}/../projects/Bob2.0/BobPacks/bob-bobiverse-agents-skill/src/skills/BobiverseAgents/Data/Personas.yaml`;
if (!existsSync(PERSONAS_PATH) && existsSync(SOURCE_PERSONAS_PATH)) {
  PERSONAS_PATH = SOURCE_PERSONAS_PATH;
}

const AGENT_FACTORY_PATH = `${PAI_DIR}/skills/Agents/Tools/AgentFactory.ts`;

// Types
interface PersonaDefinition {
  name: string;
  id: number;
  role: string;
  type: "subagent" | "external";
  model?: string;
  character: string;
  traits: string;
  voice: string;
  voice_id: string;
  personality_notes: string[];
  use_when: string[];
  sample_quote: string;
  backstory: string;
}

interface PersonasData {
  personas: Record<string, PersonaDefinition>;
  metadata: {
    version: string;
    description: string;
    created: string;
    subagent_personas: string[];
    external_personas: string[];
    model_routing: Record<string, string>;
  };
}

interface AgentFactoryOutput {
  name: string;
  traits: string[];
  voice: string;
  voice_id: string;
  voiceReason: string;
  expertise: string[];
  personality: string[];
  approach: string[];
  prompt: string;
}

interface ComposedPersona {
  name: string;
  id: number;
  role: string;
  type: "subagent" | "external";
  model?: string;
  traits: string[];
  voice: string;
  voice_id: string;
  character: string;
  backstory: string;
  personality_notes: string[];
  use_when: string[];
  sample_quote: string;
  prompt: string;
}

function loadPersonas(): PersonasData {
  if (!existsSync(PERSONAS_PATH)) {
    console.error(`Error: Personas file not found at ${PERSONAS_PATH}`);
    console.error("\nIs bob-bobiverse-agents-skill installed?");
    process.exit(1);
  }
  const content = readFileSync(PERSONAS_PATH, "utf-8");
  return parseYaml(content) as PersonasData;
}

function getAgentFactoryComposition(
  traits: string,
  task: string
): AgentFactoryOutput | null {
  if (!existsSync(AGENT_FACTORY_PATH)) {
    console.error(`Error: AgentFactory not found at ${AGENT_FACTORY_PATH}`);
    console.error("\nIs pai-agents-skill installed?");
    process.exit(1);
  }

  const result = spawnSync(
    "bun",
    ["run", AGENT_FACTORY_PATH, "--traits", traits, "--task", task, "--output", "json"],
    { encoding: "utf-8" }
  );

  if (result.status !== 0) {
    console.error("Error: AgentFactory failed");
    console.error(result.stderr);
    return null;
  }

  try {
    return JSON.parse(result.stdout) as AgentFactoryOutput;
  } catch (e) {
    console.error("Error: Failed to parse AgentFactory output");
    console.error(result.stdout);
    return null;
  }
}

function composePersona(
  personaName: string,
  task: string
): ComposedPersona | null {
  const personas = loadPersonas();
  const persona = personas.personas[personaName.toLowerCase()];

  if (!persona) {
    console.error(`Error: Persona not found: ${personaName}\n`);
    console.error("Available personas:");
    console.error("  SUBAGENTS:  " + personas.metadata.subagent_personas.join(", "));
    console.error("  EXTERNAL:   " + personas.metadata.external_personas.join(", "));
    return null;
  }

  // Get trait composition from AgentFactory
  const agentComposition = getAgentFactoryComposition(persona.traits, task);
  if (!agentComposition) {
    return null;
  }

  // Generate timestamp for agent instance tracking
  const timestamp = Date.now();
  const agentName = persona.name.split(' ')[0]; // Extract first word (e.g., "Bill" from "Bill (The Architect)")

  // Combine AgentFactory prompt with persona backstory
  // Inject observability marker for metadata-extraction.ts
  const enrichedPrompt = `[AGENT_INSTANCE: ${agentName}-${timestamp}]

# ${persona.name} - ${persona.role}

${persona.character}

${persona.backstory}

## Communication Style
${persona.personality_notes.map((note) => `- ${note}`).join("\n")}

Example: "${persona.sample_quote}"

## Task Assignment
${task}

## Trait Composition
${agentComposition.prompt}`;

  return {
    name: persona.name,
    id: persona.id,
    role: persona.role,
    type: persona.type,
    model: persona.model,
    traits: agentComposition.traits,
    voice: persona.voice,
    voice_id: persona.voice_id,
    character: persona.character,
    backstory: persona.backstory,
    personality_notes: persona.personality_notes,
    use_when: persona.use_when,
    sample_quote: persona.sample_quote,
    prompt: enrichedPrompt,
  };
}

function listPersonas(): void {
  const personas = loadPersonas();

  console.log("BOBIVERSE AGENT PERSONAS\n");
  console.log(`Version: ${personas.metadata.version}`);
  console.log(`${personas.metadata.description}\n`);

  console.log("BUILT-IN SUBAGENTS (Claude Code Task tool):");
  for (const key of personas.metadata.subagent_personas) {
    const p = personas.personas[key];
    console.log(`\n  ${p.name.padEnd(15)} [ID: ${p.id}] - ${p.role}`);
    console.log(`  ${"".padEnd(15)} Traits: ${p.traits}`);
    console.log(`  ${"".padEnd(15)} Voice:  ${p.voice} [${p.voice_id}]`);
    console.log(`  ${"".padEnd(15)} Use: ${p.use_when[0]}`);
    console.log(`  ${"".padEnd(15)} "${p.sample_quote.slice(0, 60)}..."`);
  }

  console.log("\n\nEXTERNAL CLI AGENTS (Codex, Gemini, Claude):");
  for (const key of personas.metadata.external_personas) {
    const p = personas.personas[key];
    console.log(`\n  ${p.name.padEnd(15)} [ID: ${p.id}] - ${p.role}`);
    console.log(`  ${"".padEnd(15)} Model:  ${p.model}`);
    console.log(`  ${"".padEnd(15)} Traits: ${p.traits}`);
    console.log(`  ${"".padEnd(15)} Voice:  ${p.voice} [${p.voice_id}]`);
    console.log(`  ${"".padEnd(15)} Use: ${p.use_when[0]}`);
    console.log(`  ${"".padEnd(15)} "${p.sample_quote.slice(0, 60)}..."`);
  }

  console.log("\n\nMODEL ROUTING:");
  for (const [persona, model] of Object.entries(personas.metadata.model_routing)) {
    console.log(`  ${persona.padEnd(10)} -> ${model}`);
  }
}

function outputPersona(persona: ComposedPersona, format: string): void {
  switch (format) {
    case "json":
      console.log(JSON.stringify(persona, null, 2));
      break;

    case "yaml":
      console.log(`name: "${persona.name}"`);
      console.log(`id: ${persona.id}`);
      console.log(`role: "${persona.role}"`);
      console.log(`type: "${persona.type}"`);
      if (persona.model) console.log(`model: "${persona.model}"`);
      console.log(`traits: [${persona.traits.join(", ")}]`);
      console.log(`voice: "${persona.voice}"`);
      console.log(`voice_id: "${persona.voice_id}"`);
      break;

    case "summary":
      console.log(`PERSONA: ${persona.name} [ID: ${persona.id}]`);
      console.log(`Role:    ${persona.role}`);
      console.log(`Type:    ${persona.type}${persona.model ? ` (${persona.model})` : ""}`);
      console.log(`Traits:  ${persona.traits.join(", ")}`);
      console.log(`Voice:   ${persona.voice} [${persona.voice_id}]`);
      console.log(`\nCharacter:\n${persona.character}`);
      console.log(`\nSample: "${persona.sample_quote}"`);
      break;

    case "prompt":
    default:
      console.log(persona.prompt);
      break;
  }
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      persona: { type: "string", short: "p" },
      task: { type: "string", short: "t" },
      output: { type: "string", short: "o", default: "text" },
      "list-personas": { type: "boolean", short: "l" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    console.log(`
PersonaFactory - Compose Bobiverse agents from personas

USAGE:
  bun run PersonaFactory.ts [options]

OPTIONS:
  -p, --persona <name>     Persona name (bill, mario, riker, howard, homer, hugh, bender, ick)
  -t, --task <desc>        Task description
  -o, --output <fmt>       Output format: text (default), json, yaml, summary, prompt
  -l, --list-personas      List all available personas
  -h, --help               Show this help

EXAMPLES:
  # Compose Bill for system design
  bun run PersonaFactory.ts -p bill -t "Design authentication system"

  # Compose Hugh (Codex) for optimization
  bun run PersonaFactory.ts -p hugh -t "Optimize sorting algorithm"

  # Get JSON output for external integration
  bun run PersonaFactory.ts -p mario -t "Fix deployment bug" -o json

  # List all personas with details
  bun run PersonaFactory.ts --list-personas

PERSONA TYPES:
  Built-in Subagents (Claude Code):
    bill, mario, riker, howard, homer

  External CLI Agents:
    hugh    - Codex (OpenAI) - Elite precision
    bender  - Gemini         - Veteran resilience
    ick     - Claude CLI     - Zen wisdom
`);
    return;
  }

  if (values["list-personas"]) {
    listPersonas();
    return;
  }

  if (!values.persona) {
    console.error("Error: --persona is required\n");
    console.error("Use --list-personas to see available personas");
    console.error("Use --help for usage information");
    process.exit(1);
  }

  if (!values.task) {
    console.error("Error: --task is required");
    process.exit(1);
  }

  const persona = composePersona(values.persona, values.task);
  if (!persona) {
    process.exit(1);
  }

  outputPersona(persona, values.output);
}

main().catch(console.error);
