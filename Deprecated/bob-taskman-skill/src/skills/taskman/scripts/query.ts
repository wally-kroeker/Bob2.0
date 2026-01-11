#!/usr/bin/env bun
/**
 * query.ts - Time-constrained task queries for ADHD support
 *
 * TaskMan v2.0 script for querying tasks by time estimate and context.
 * Uses local SQLite cache for fast filtering.
 *
 * Usage:
 *   bun run query.ts quick              # 5-15 min tasks
 *   bun run query.ts phone [minutes]    # Phone tasks with time filter
 *   bun run query.ts desk [minutes]     # Computer tasks with time filter
 *   bun run query.ts wins               # Quick wins (5 min only)
 *   bun run query.ts due                # Tasks due soon
 *   bun run query.ts custom <query>     # Custom SQL query
 *   bun run query.ts help               # Show help
 */

import { Database } from "bun:sqlite";
import { existsSync } from "fs";
import { join, dirname } from "path";

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// Paths
const scriptDir = dirname(new URL(import.meta.url).pathname);
const dataDir = join(scriptDir, "..", "data");
const dbPath = join(dataDir, "taskman.db");

interface TaskRow {
  id: number;
  title: string;
  project_name: string | null;
  priority: number;
  due_date: string | null;
}

/**
 * Check if database exists
 */
function checkDatabase(): Database {
  if (!existsSync(dbPath)) {
    console.log(`${colors.yellow}TaskMan cache not found. Run sync-cache.ts first.${colors.reset}`);
    process.exit(1);
  }
  return new Database(dbPath, { readonly: true });
}

/**
 * Format a single task for display
 */
function formatTask(task: TaskRow): string {
  // Priority marker
  let priorityMarker = `${colors.gray}-${colors.reset}`;
  switch (task.priority) {
    case 5:
      priorityMarker = `${colors.green}!!!${colors.reset}`;
      break;
    case 4:
      priorityMarker = `${colors.green}!!${colors.reset}`;
      break;
    case 3:
      priorityMarker = `${colors.yellow}!${colors.reset}`;
      break;
  }

  // Due date marker
  let dueMarker = "";
  if (task.due_date) {
    dueMarker = ` ${colors.cyan}📅 ${task.due_date}${colors.reset}`;
  }

  // Project name
  const project = task.project_name || "Unknown";

  return `${priorityMarker} [${colors.blue}${task.id}${colors.reset}] ${task.title} ${colors.gray}(${project})${colors.reset}${dueMarker}`;
}

/**
 * Display query results
 */
function displayResults(title: string, tasks: TaskRow[]) {
  console.log(`\n${colors.cyan}${title}:${colors.reset}\n`);

  if (tasks.length === 0) {
    console.log(`${colors.yellow}No matching tasks found.${colors.reset}`);
  } else {
    for (const task of tasks) {
      console.log(formatTask(task));
    }
  }

  console.log("");
}

/**
 * Query: Quick tasks (5-15 min)
 */
function queryQuick(db: Database.Database) {
  const tasks = db
    .prepare(
      `
    SELECT DISTINCT t.id, t.title, t.project_name, t.priority, t.due_date
    FROM tasks t
    JOIN task_labels tl ON t.id = tl.task_id
    JOIN labels l ON tl.label_id = l.id
    WHERE t.done = 0 AND l.name IN ('5min', '15min')
    ORDER BY t.priority DESC, t.due_date ASC
    LIMIT 10
  `
    )
    .all() as TaskRow[];

  displayResults("Quick Tasks (5-15 minutes)", tasks);
}

/**
 * Query: Phone tasks with time filter
 */
function queryPhone(db: Database.Database, minutes: number = 10) {
  // Build time labels based on minutes
  const timeLabels: string[] = ["'5min'"];
  if (minutes >= 15) timeLabels.push("'15min'");
  if (minutes >= 30) timeLabels.push("'30min'");

  const tasks = db
    .prepare(
      `
    SELECT DISTINCT t.id, t.title, t.project_name, t.priority, t.due_date
    FROM tasks t
    JOIN task_labels tl1 ON t.id = tl1.task_id
    JOIN labels l1 ON tl1.label_id = l1.id AND l1.name = 'Phone'
    JOIN task_labels tl2 ON t.id = tl2.task_id
    JOIN labels l2 ON tl2.label_id = l2.id AND l2.name IN (${timeLabels.join(", ")})
    WHERE t.done = 0
    ORDER BY t.priority DESC, t.due_date ASC
    LIMIT 10
  `
    )
    .all() as TaskRow[];

  displayResults(`Phone Tasks (${minutes} min or less)`, tasks);
}

/**
 * Query: Computer/desk tasks with time filter
 */
function queryDesk(db: Database.Database, minutes: number = 30) {
  // Build time labels based on minutes
  const timeLabels: string[] = ["'5min'"];
  if (minutes >= 15) timeLabels.push("'15min'");
  if (minutes >= 30) timeLabels.push("'30min'");
  if (minutes >= 60) timeLabels.push("'60min+'");

  const tasks = db
    .prepare(
      `
    SELECT DISTINCT t.id, t.title, t.project_name, t.priority, t.due_date
    FROM tasks t
    JOIN task_labels tl1 ON t.id = tl1.task_id
    JOIN labels l1 ON tl1.label_id = l1.id AND l1.name = 'Computer'
    JOIN task_labels tl2 ON t.id = tl2.task_id
    JOIN labels l2 ON tl2.label_id = l2.id AND l2.name IN (${timeLabels.join(", ")})
    WHERE t.done = 0
    ORDER BY t.priority DESC, t.due_date ASC
    LIMIT 10
  `
    )
    .all() as TaskRow[];

  displayResults(`Desk Tasks (${minutes} min or less)`, tasks);
}

/**
 * Query: Quick wins (5 min only)
 */
function queryWins(db: Database.Database) {
  const tasks = db
    .prepare(
      `
    SELECT DISTINCT t.id, t.title, t.project_name, t.priority, t.due_date
    FROM tasks t
    JOIN task_labels tl ON t.id = tl.task_id
    JOIN labels l ON tl.label_id = l.id AND l.name = '5min'
    WHERE t.done = 0
    ORDER BY t.priority DESC
    LIMIT 5
  `
    )
    .all() as TaskRow[];

  displayResults("Quick Wins (5 minutes)", tasks);
}

/**
 * Query: Tasks due soon
 */
function queryDue(db: Database.Database) {
  const tasks = db
    .prepare(
      `
    SELECT t.id, t.title, t.project_name, t.priority, t.due_date
    FROM tasks t
    WHERE t.done = 0
      AND t.due_date IS NOT NULL
      AND t.due_date != ''
      AND t.due_date <= date('now', '+7 days')
    ORDER BY t.due_date ASC, t.priority DESC
    LIMIT 10
  `
    )
    .all() as TaskRow[];

  displayResults("Tasks Due Soon (Next 7 Days)", tasks);
}

/**
 * Query: High priority tasks
 */
function queryPriority(db: Database.Database) {
  const tasks = db
    .prepare(
      `
    SELECT t.id, t.title, t.project_name, t.priority, t.due_date
    FROM tasks t
    WHERE t.done = 0 AND t.priority >= 4
    ORDER BY t.priority DESC, t.due_date ASC
    LIMIT 10
  `
    )
    .all() as TaskRow[];

  displayResults("High Priority Tasks (P4-P5)", tasks);
}

/**
 * Query: Custom SQL
 */
function queryCustom(db: Database.Database, sql: string) {
  try {
    const results = db.prepare(sql).all();
    console.log(`\n${colors.cyan}Custom Query Results:${colors.reset}\n`);

    if (Array.isArray(results) && results.length > 0) {
      // Format as table
      console.table(results);
    } else {
      console.log(`${colors.yellow}No results.${colors.reset}`);
    }
    console.log("");
  } catch (error) {
    console.log(`${colors.red}Query error: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
  }
}

/**
 * Show cache info
 */
function showInfo(db: Database.Database) {
  console.log(`\n${colors.cyan}TaskMan Cache Info:${colors.reset}\n`);

  // Last sync
  const syncResult = db.prepare("SELECT value FROM cache_metadata WHERE key = 'last_sync'").get() as
    | { value: string }
    | undefined;
  if (syncResult?.value) {
    console.log(`Last synced: ${syncResult.value}`);
  }

  // Task counts
  const totalResult = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
  const activeResult = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 0").get() as { count: number };
  console.log(`Total tasks: ${totalResult.count}`);
  console.log(`Active tasks: ${activeResult.count}`);

  // Project count
  const projectResult = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
  console.log(`Projects: ${projectResult.count}`);

  // Label count
  const labelResult = db.prepare("SELECT COUNT(*) as count FROM labels").get() as { count: number };
  console.log(`Labels: ${labelResult.count}`);

  console.log("");
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
${colors.cyan}TaskMan Query Tool - v2.0${colors.reset}

Usage:
  bun run query.ts quick              # 5-15 min tasks
  bun run query.ts phone [minutes]    # Phone tasks (default: 10 min)
  bun run query.ts desk [minutes]     # Computer tasks (default: 30 min)
  bun run query.ts wins               # Quick wins (5 min only)
  bun run query.ts due                # Tasks due in next 7 days
  bun run query.ts priority           # High priority tasks (P4-P5)
  bun run query.ts info               # Show cache info
  bun run query.ts custom <query>     # Custom SQL query
  bun run query.ts help               # Show this help

Examples:
  bun run query.ts phone 15           # Phone tasks ≤15 min
  bun run query.ts desk 60            # Desk tasks ≤60 min
  bun run query.ts custom "SELECT * FROM tasks WHERE priority = 5"
`);
}

/**
 * Main function
 */
function main() {
  const command = process.argv[2] || "help";

  switch (command) {
    case "quick": {
      const db = checkDatabase();
      queryQuick(db);
      db.close();
      break;
    }
    case "phone": {
      const db = checkDatabase();
      const minutes = parseInt(process.argv[3] || "10", 10);
      queryPhone(db, minutes);
      db.close();
      break;
    }
    case "desk": {
      const db = checkDatabase();
      const minutes = parseInt(process.argv[3] || "30", 10);
      queryDesk(db, minutes);
      db.close();
      break;
    }
    case "wins": {
      const db = checkDatabase();
      queryWins(db);
      db.close();
      break;
    }
    case "due": {
      const db = checkDatabase();
      queryDue(db);
      db.close();
      break;
    }
    case "priority": {
      const db = checkDatabase();
      queryPriority(db);
      db.close();
      break;
    }
    case "info": {
      const db = checkDatabase();
      showInfo(db);
      db.close();
      break;
    }
    case "custom": {
      const db = checkDatabase();
      const sql = process.argv.slice(3).join(" ");
      if (!sql) {
        console.log(`${colors.red}Error: No SQL query provided${colors.reset}`);
        console.log("Usage: bun run query.ts custom <sql>");
        process.exit(1);
      }
      queryCustom(db, sql);
      db.close();
      break;
    }
    case "help":
    default:
      showHelp();
      break;
  }
}

// Run main function
main();

