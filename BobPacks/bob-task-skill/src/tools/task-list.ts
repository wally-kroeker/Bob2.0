#!/usr/bin/env bun
/**
 * task-list.ts - List and filter Vikunja tasks
 *
 * Usage:
 *   bun run task-list.ts                    # All active tasks
 *   bun run task-list.ts --project 9        # Tasks in specific project
 *   bun run task-list.ts --label Computer   # Tasks with label
 *   bun run task-list.ts --due today        # Tasks due today
 *   bun run task-list.ts --done             # Completed tasks
 *   bun run task-list.ts --limit 10         # Limit results
 *   bun run task-list.ts --search "keyword" # Search by title
 */

import { VikunjaClient, formatTask, colors, parseNaturalDate } from "./lib/vikunja-client";

// Check for --help before anything else
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
  process.exit(0);
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bold}task-list.ts${colors.reset} - List and filter Vikunja tasks

${colors.yellow}Usage:${colors.reset}
  bun run task-list.ts [options]

${colors.yellow}Options:${colors.reset}
  --project <id>      Filter by project ID
  --label <name>      Filter by label name
  --due <date>        Filter by due date (today, tomorrow, this-week, overdue, or YYYY-MM-DD)
  --done              Show completed tasks (default: active only)
  --all               Show all tasks (completed and active)
  --priority <n>      Minimum priority (1-5, where 5 is highest)
  --search <query>    Search by title
  --limit <n>         Limit number of results (default: 50)
  --details           Show labels and more details
  --json              Output as JSON
  --help              Show this help

${colors.yellow}Examples:${colors.reset}
  bun run task-list.ts --project 9 --limit 5
  bun run task-list.ts --label Computer --priority 3
  bun run task-list.ts --due today
  bun run task-list.ts --search "meeting"
`);
}

interface Options {
  projectId?: number;
  labelName?: string;
  dueDate?: string;
  showDone: boolean;
  showAll: boolean;
  minPriority?: number;
  search?: string;
  limit: number;
  showDetails: boolean;
  jsonOutput: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    showDone: false,
    showAll: false,
    limit: 50,
    showDetails: false,
    jsonOutput: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case "--project":
        options.projectId = parseInt(args[++i], 10);
        break;
      case "--label":
        options.labelName = args[++i];
        break;
      case "--due":
        options.dueDate = args[++i];
        break;
      case "--done":
        options.showDone = true;
        break;
      case "--all":
        options.showAll = true;
        break;
      case "--priority":
        options.minPriority = parseInt(args[++i], 10);
        break;
      case "--search":
        options.search = args[++i];
        break;
      case "--limit":
        options.limit = parseInt(args[++i], 10);
        break;
      case "--details":
        options.showDetails = true;
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
  const client = new VikunjaClient();
  
  try {
    // Fetch tasks
    let tasks = await client.listTasks({
      projectId: options.projectId,
      done: options.showAll ? undefined : options.showDone,
      priority: options.minPriority,
      search: options.search,
      perPage: options.limit,
    });
    
    // Filter by label if specified
    if (options.labelName) {
      const labelLower = options.labelName.toLowerCase();
      tasks = tasks.filter(t => 
        t.labels?.some(l => l.title.toLowerCase() === labelLower)
      );
    }
    
    // Filter by due date if specified
    if (options.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      tasks = tasks.filter(t => {
        if (!t.due_date || t.due_date === "0001-01-01T00:00:00Z") return false;
        
        const dueDate = new Date(t.due_date);
        
        switch (options.dueDate) {
          case "today":
            return dueDate >= today && dueDate < tomorrow;
          case "tomorrow":
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            return dueDate >= tomorrow && dueDate < dayAfter;
          case "this-week":
            return dueDate >= today && dueDate < weekEnd;
          case "overdue":
            return dueDate < today;
          default:
            // Assume it's a date string
            const targetDate = parseNaturalDate(options.dueDate);
            if (targetDate) {
              const target = new Date(targetDate);
              target.setHours(0, 0, 0, 0);
              const targetEnd = new Date(target);
              targetEnd.setDate(targetEnd.getDate() + 1);
              return dueDate >= target && dueDate < targetEnd;
            }
            return true;
        }
      });
    }
    
    // Limit results
    tasks = tasks.slice(0, options.limit);
    
    // Output
    if (options.jsonOutput) {
      console.log(JSON.stringify(tasks, null, 2));
      return;
    }
    
    if (tasks.length === 0) {
      console.log(`${colors.yellow}No tasks found matching criteria.${colors.reset}`);
      return;
    }
    
    console.log(`\n${colors.cyan}${colors.bold}Tasks (${tasks.length}):${colors.reset}\n`);
    
    for (const task of tasks) {
      console.log(formatTask(task, options.showDetails));
    }
    
    console.log("");
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
    process.exit(1);
  }
}

main();

