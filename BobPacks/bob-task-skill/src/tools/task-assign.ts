#!/usr/bin/env bun
/**
 * task-assign.ts - Assign tasks to Bob and Friends agents
 *
 * Multi-agent team:
 *   Bob (3)    - Orchestrator, coordination
 *   Bill (4)   - Architect, design
 *   Mario (5)  - Engineer, implementation
 *   Riker (6)  - Researcher, investigation
 *   Howard (7) - Designer, UX/content
 *   Homer (40) - Strategist, big-picture
 *
 * Usage:
 *   bun run task-assign.ts 123 --agent mario
 *   bun run task-assign.ts 123 --agent bill --agent mario
 *   bun run task-assign.ts 123 --user 5
 */

import { VikunjaClient, colors, formatTask } from "./lib/vikunja-client";

// Check for --help before anything else
if (process.argv.includes("--help") || process.argv.includes("-h") || process.argv.length <= 2) {
  showHelp();
  process.exit(0);
}

// Bob and Friends agent mapping
const AGENTS: Record<string, { id: number; name: string; role: string }> = {
  bob: { id: 3, name: "Bob", role: "Orchestrator" },
  bill: { id: 4, name: "Bill", role: "Architect" },
  mario: { id: 5, name: "Mario", role: "Engineer" },
  riker: { id: 6, name: "Riker", role: "Researcher" },
  howard: { id: 7, name: "Howard", role: "Designer" },
  homer: { id: 40, name: "Homer", role: "Strategist" },
};

function showHelp() {
  console.log(`
${colors.cyan}${colors.bold}task-assign.ts${colors.reset} - Assign tasks to Bob and Friends agents

${colors.yellow}Usage:${colors.reset}
  bun run task-assign.ts <task-id> [options]

${colors.yellow}Options:${colors.reset}
  --agent <name>      Assign to agent by name (can use multiple times)
  --user <id>         Assign to user by ID (can use multiple times)
  --unassign <name>   Remove agent from task
  --unassign-user <id> Remove user by ID from task
  --list              List current assignees
  --json              Output as JSON
  --help              Show this help

${colors.yellow}Available Agents:${colors.reset}
  bob     (ID: 3)  - Orchestrator, coordination
  bill    (ID: 4)  - Architect, system design
  mario   (ID: 5)  - Engineer, implementation
  riker   (ID: 6)  - Researcher, investigation
  howard  (ID: 7)  - Designer, UX/content
  homer   (ID: 40) - Strategist, big-picture

${colors.yellow}Examples:${colors.reset}
  bun run task-assign.ts 123 --agent mario
  bun run task-assign.ts 123 --agent bill --agent mario
  bun run task-assign.ts 123 --unassign mario
  bun run task-assign.ts 123 --list
`);
}

interface Options {
  taskId?: number;
  agents: string[];
  userIds: number[];
  unassignAgents: string[];
  unassignUserIds: number[];
  listOnly: boolean;
  jsonOutput: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  
  const options: Options = {
    agents: [],
    userIds: [],
    unassignAgents: [],
    unassignUserIds: [],
    listOnly: false,
    jsonOutput: false,
  };
  
  // First argument should be task ID
  let i = 0;
  if (!args[0].startsWith("--")) {
    options.taskId = parseInt(args[0], 10);
    i = 1;
  }
  
  for (; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case "--agent":
        options.agents.push(args[++i].toLowerCase());
        break;
      case "--user":
        options.userIds.push(parseInt(args[++i], 10));
        break;
      case "--unassign":
        options.unassignAgents.push(args[++i].toLowerCase());
        break;
      case "--unassign-user":
        options.unassignUserIds.push(parseInt(args[++i], 10));
        break;
      case "--list":
        options.listOnly = true;
        break;
      case "--json":
        options.jsonOutput = true;
        break;
    }
  }
  
  return options;
}

async function main() {
  const options = parseArgs();
  
  if (!options.taskId) {
    console.error(`${colors.red}Error: Task ID is required${colors.reset}`);
    console.error(`Usage: bun run task-assign.ts <task-id> --agent mario`);
    process.exit(1);
  }
  
  const client = new VikunjaClient();
  
  try {
    // Get the task first
    const task = await client.getTask(options.taskId);
    
    // List only mode
    if (options.listOnly) {
      if (options.jsonOutput) {
        console.log(JSON.stringify(task.assignees || [], null, 2));
        return;
      }
      
      console.log(`\n${colors.cyan}${colors.bold}Task #${task.id}:${colors.reset} ${task.title}\n`);
      
      if (!task.assignees || task.assignees.length === 0) {
        console.log(`${colors.gray}No assignees${colors.reset}`);
      } else {
        console.log(`${colors.cyan}Assignees:${colors.reset}`);
        for (const assignee of task.assignees) {
          // Check if it's a known agent
          const agentEntry = Object.entries(AGENTS).find(([_, a]) => a.id === assignee.id);
          if (agentEntry) {
            const [name, agent] = agentEntry;
            console.log(`  ${colors.green}${agent.name}${colors.reset} (ID: ${agent.id}) - ${agent.role}`);
          } else {
            console.log(`  ${assignee.name || assignee.username} (ID: ${assignee.id})`);
          }
        }
      }
      console.log("");
      return;
    }
    
    // Check if any operations specified
    if (
      options.agents.length === 0 &&
      options.userIds.length === 0 &&
      options.unassignAgents.length === 0 &&
      options.unassignUserIds.length === 0
    ) {
      console.error(`${colors.red}Error: No assignment operation specified${colors.reset}`);
      console.error(`Use --agent, --user, --unassign, or --list`);
      process.exit(1);
    }
    
    // Process unassignments first
    for (const agentName of options.unassignAgents) {
      const agent = AGENTS[agentName];
      if (!agent) {
        console.error(`${colors.yellow}Warning: Unknown agent "${agentName}", skipping${colors.reset}`);
        continue;
      }
      await client.unassignTask(options.taskId, agent.id);
      console.log(`${colors.yellow}✓ Unassigned ${agent.name} (${agent.role})${colors.reset}`);
    }
    
    for (const userId of options.unassignUserIds) {
      await client.unassignTask(options.taskId, userId);
      console.log(`${colors.yellow}✓ Unassigned user ID ${userId}${colors.reset}`);
    }
    
    // Process assignments
    const assignedAgents: string[] = [];
    const assignedUsers: number[] = [];
    
    for (const agentName of options.agents) {
      const agent = AGENTS[agentName];
      if (!agent) {
        console.error(`${colors.yellow}Warning: Unknown agent "${agentName}", skipping${colors.reset}`);
        console.error(`Available agents: ${Object.keys(AGENTS).join(", ")}`);
        continue;
      }
      await client.assignTask(options.taskId, [agent.id]);
      assignedAgents.push(`${agent.name} (${agent.role})`);
    }
    
    for (const userId of options.userIds) {
      await client.assignTask(options.taskId, [userId]);
      assignedUsers.push(userId);
    }
    
    if (options.jsonOutput) {
      const updatedTask = await client.getTask(options.taskId);
      console.log(JSON.stringify(updatedTask, null, 2));
      return;
    }
    
    // Output results
    console.log(`\n${colors.green}✓ Assignment updated${colors.reset}\n`);
    console.log(`${colors.cyan}Task:${colors.reset} ${formatTask(task)}`);
    
    if (assignedAgents.length > 0) {
      console.log(`\n${colors.cyan}Assigned agents:${colors.reset}`);
      for (const agent of assignedAgents) {
        console.log(`  ${colors.green}+${colors.reset} ${agent}`);
      }
    }
    
    if (assignedUsers.length > 0) {
      console.log(`\n${colors.cyan}Assigned users:${colors.reset}`);
      for (const userId of assignedUsers) {
        console.log(`  ${colors.green}+${colors.reset} User ID ${userId}`);
      }
    }
    
    console.log("");
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
    process.exit(1);
  }
}

main();

