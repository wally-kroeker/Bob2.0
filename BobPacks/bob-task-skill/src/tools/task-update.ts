#!/usr/bin/env bun
/**
 * task-update.ts - Update existing Vikunja tasks
 *
 * Usage:
 *   bun run task-update.ts 123 --done           # Mark complete
 *   bun run task-update.ts 123 --priority 5     # Set priority
 *   bun run task-update.ts 123 --due tomorrow   # Set due date
 *   bun run task-update.ts 123 --title "New title"
 */

import { VikunjaClient, colors, parseNaturalDate, formatTask } from "./lib/vikunja-client";

// Check for --help before anything else
if (process.argv.includes("--help") || process.argv.includes("-h") || process.argv.length <= 2) {
  showHelp();
  process.exit(0);
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bold}task-update.ts${colors.reset} - Update existing Vikunja tasks

${colors.yellow}Usage:${colors.reset}
  bun run task-update.ts <task-id> [options]

${colors.yellow}Options:${colors.reset}
  --done              Mark task as completed
  --undone            Mark task as not completed
  --title <text>      Update task title
  --description <txt> Update task description
  --due <date>        Set due date (today, tomorrow, next week, or YYYY-MM-DD)
  --clear-due         Remove due date
  --priority <n>      Set priority 1-5 (5 = highest)
  --json              Output updated task as JSON
  --help              Show this help

${colors.yellow}Examples:${colors.reset}
  bun run task-update.ts 123 --done
  bun run task-update.ts 123 --priority 5 --due tomorrow
  bun run task-update.ts 123 --title "Updated task title"
  bun run task-update.ts 123 --undone --clear-due
`);
}

interface Options {
  taskId?: number;
  done?: boolean;
  title?: string;
  description?: string;
  dueDate?: string;
  clearDue: boolean;
  priority?: number;
  jsonOutput: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  
  const options: Options = {
    clearDue: false,
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
      case "--done":
        options.done = true;
        break;
      case "--undone":
        options.done = false;
        break;
      case "--title":
        options.title = args[++i];
        break;
      case "--description":
        options.description = args[++i];
        break;
      case "--due":
        options.dueDate = args[++i];
        break;
      case "--clear-due":
        options.clearDue = true;
        break;
      case "--priority":
        options.priority = parseInt(args[++i], 10);
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
    console.error(`Usage: bun run task-update.ts <task-id> --done`);
    process.exit(1);
  }
  
  // Check if any update options provided
  if (
    options.done === undefined &&
    !options.title &&
    !options.description &&
    !options.dueDate &&
    !options.clearDue &&
    options.priority === undefined
  ) {
    console.error(`${colors.red}Error: No update options provided${colors.reset}`);
    console.error(`Use --done, --title, --description, --due, --priority, etc.`);
    process.exit(1);
  }
  
  const client = new VikunjaClient();
  
  try {
    // Get current task first
    const currentTask = await client.getTask(options.taskId);
    
    // Parse due date if provided
    let dueDate: string | undefined;
    if (options.clearDue) {
      dueDate = "0001-01-01T00:00:00Z"; // Vikunja's "no date"
    } else if (options.dueDate) {
      const parsed = parseNaturalDate(options.dueDate);
      if (parsed) {
        dueDate = parsed;
      } else {
        console.error(`${colors.yellow}Warning: Could not parse date "${options.dueDate}", skipping${colors.reset}`);
      }
    }
    
    // Build update params
    const updateParams: any = {};
    if (options.done !== undefined) updateParams.done = options.done;
    if (options.title) updateParams.title = options.title;
    if (options.description) updateParams.description = options.description;
    if (dueDate) updateParams.dueDate = dueDate;
    if (options.priority !== undefined) updateParams.priority = options.priority;
    
    // Update the task
    const updatedTask = await client.updateTask(options.taskId, updateParams);
    
    if (options.jsonOutput) {
      console.log(JSON.stringify(updatedTask, null, 2));
      return;
    }
    
    console.log(`\n${colors.green}✓ Task updated successfully${colors.reset}\n`);
    
    // Show what changed
    if (options.done === true) {
      console.log(`  ${colors.green}✓${colors.reset} Marked as complete`);
    } else if (options.done === false) {
      console.log(`  ${colors.yellow}○${colors.reset} Marked as incomplete`);
    }
    
    if (options.title) {
      console.log(`  ${colors.cyan}Title:${colors.reset} ${options.title}`);
    }
    
    if (options.priority !== undefined) {
      console.log(`  ${colors.cyan}Priority:${colors.reset} ${options.priority}`);
    }
    
    if (options.clearDue) {
      console.log(`  ${colors.cyan}Due date:${colors.reset} cleared`);
    } else if (dueDate) {
      console.log(`  ${colors.cyan}Due date:${colors.reset} ${dueDate.split("T")[0]}`);
    }
    
    console.log(`\n${colors.gray}Updated task:${colors.reset}`);
    console.log(formatTask(updatedTask, true));
    console.log("");
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
    process.exit(1);
  }
}

main();

