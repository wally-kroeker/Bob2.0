#!/usr/bin/env bun
/**
 * task-create.ts - Create new Vikunja tasks
 *
 * Usage:
 *   bun run task-create.ts "Task title" --project 1
 *   bun run task-create.ts "Call dentist" --project 4 --due tomorrow --labels "Phone,5min"
 *   bun run task-create.ts "Important meeting prep" --project 5 --priority 5
 */

import { VikunjaClient, colors, parseNaturalDate } from "./lib/vikunja-client";

// Check for --help before anything else
if (process.argv.includes("--help") || process.argv.includes("-h") || process.argv.length <= 2) {
  showHelp();
  process.exit(0);
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bold}task-create.ts${colors.reset} - Create new Vikunja tasks

${colors.yellow}Usage:${colors.reset}
  bun run task-create.ts <title> [options]

${colors.yellow}Options:${colors.reset}
  --project <id>      Project ID (required)
  --description <txt> Task description
  --due <date>        Due date (today, tomorrow, next week, or YYYY-MM-DD)
  --priority <n>      Priority 1-5 (5 = highest, default: 0)
  --labels <list>     Comma-separated label names
  --assign <ids>      Comma-separated user IDs to assign
  --json              Output created task as JSON
  --help              Show this help

${colors.yellow}Priority Scale:${colors.reset}
  5 = HIGHEST (urgent, do now!)
  4 = High
  3 = Medium (normal)
  2 = Low
  1 = Lowest (someday)
  0 = Unset

${colors.yellow}Examples:${colors.reset}
  bun run task-create.ts "Trim hedges" --project 9 --due "next saturday"
  bun run task-create.ts "Call dentist" --project 4 --labels "Phone,5min" --priority 3
  bun run task-create.ts "Client meeting prep" --project 11 --priority 5 --due tomorrow
`);
}

interface Options {
  title: string;
  projectId?: number;
  description?: string;
  dueDate?: string;
  priority?: number;
  labels?: string[];
  assignees?: number[];
  jsonOutput: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  
  const options: Options = {
    title: "",
    jsonOutput: false,
  };
  
  // First non-flag argument is the title
  let i = 0;
  if (!args[0].startsWith("--")) {
    options.title = args[0];
    i = 1;
  }
  
  for (; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case "--project":
        options.projectId = parseInt(args[++i], 10);
        break;
      case "--description":
        options.description = args[++i];
        break;
      case "--due":
        options.dueDate = args[++i];
        break;
      case "--priority":
        options.priority = parseInt(args[++i], 10);
        break;
      case "--labels":
        options.labels = args[++i].split(",").map(s => s.trim());
        break;
      case "--assign":
        options.assignees = args[++i].split(",").map(s => parseInt(s.trim(), 10));
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
  
  if (!options.title) {
    console.error(`${colors.red}Error: Task title is required${colors.reset}`);
    console.error(`Usage: bun run task-create.ts "Task title" --project <id>`);
    process.exit(1);
  }
  
  if (!options.projectId) {
    console.error(`${colors.red}Error: Project ID is required (--project <id>)${colors.reset}`);
    console.error(`Use: bun run task-list.ts to see projects, or check Vikunja web UI`);
    process.exit(1);
  }
  
  const client = new VikunjaClient();
  
  try {
    // Parse due date if provided
    let dueDate: string | undefined;
    if (options.dueDate) {
      const parsed = parseNaturalDate(options.dueDate);
      if (parsed) {
        dueDate = parsed;
      } else {
        console.error(`${colors.yellow}Warning: Could not parse date "${options.dueDate}", skipping${colors.reset}`);
      }
    }
    
    // Resolve label names to IDs
    let labelIds: number[] | undefined;
    if (options.labels && options.labels.length > 0) {
      const allLabels = await client.listLabels();
      labelIds = [];
      
      for (const labelName of options.labels) {
        const label = allLabels.find(l => l.title.toLowerCase() === labelName.toLowerCase());
        if (label) {
          labelIds.push(label.id);
        } else {
          console.error(`${colors.yellow}Warning: Label "${labelName}" not found, skipping${colors.reset}`);
        }
      }
    }
    
    // Create the task
    const task = await client.createTask({
      title: options.title,
      projectId: options.projectId,
      description: options.description,
      dueDate,
      priority: options.priority,
      labels: labelIds,
      assignees: options.assignees,
    });
    
    if (options.jsonOutput) {
      console.log(JSON.stringify(task, null, 2));
      return;
    }
    
    console.log(`\n${colors.green}✓ Task created successfully${colors.reset}\n`);
    console.log(`  ${colors.cyan}ID:${colors.reset}       #${task.id}`);
    console.log(`  ${colors.cyan}Title:${colors.reset}    ${task.title}`);
    console.log(`  ${colors.cyan}Project:${colors.reset}  ${options.projectId}`);
    
    if (task.priority > 0) {
      console.log(`  ${colors.cyan}Priority:${colors.reset} ${task.priority}`);
    }
    
    if (dueDate) {
      console.log(`  ${colors.cyan}Due:${colors.reset}      ${dueDate.split("T")[0]}`);
    }
    
    if (labelIds && labelIds.length > 0) {
      console.log(`  ${colors.cyan}Labels:${colors.reset}   ${options.labels?.join(", ")}`);
    }
    
    console.log("");
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
    process.exit(1);
  }
}

main();

