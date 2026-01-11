#!/usr/bin/env bun

/**
 * Vikunja Task Fetcher
 *
 * Fetches tasks from Vikunja API and outputs them in a format
 * useful for Bob to provide task context.
 *
 * Usage:
 *   bun fetch-tasks.ts                    # All tasks
 *   bun fetch-tasks.ts --today            # Today's tasks
 *   bun fetch-tasks.ts --project <id>     # Project-specific tasks
 *   bun fetch-tasks.ts --upcoming <days>  # Tasks due in next N days
 */

interface VikunjaTask {
  id: number;
  title: string;
  description: string;
  done: boolean;
  priority: number;
  due_date: string | null;
  project_id: number;
  created: string;
  updated: string;
  labels?: Array<{ id: number; title: string }>;
  assignees?: Array<{ id: number; username: string }>;
}

interface VikunjaProject {
  id: number;
  title: string;
  description: string;
}

// Load environment variables
const VIKUNJA_URL = process.env.VIKUNJA_URL;
const VIKUNJA_API_KEY = process.env.VIKUNJA_API_KEY || process.env.Vikunja_API_Key;

if (!VIKUNJA_URL || !VIKUNJA_API_KEY) {
  console.error("❌ Error: VIKUNJA_URL and VIKUNJA_API_KEY must be set in .env file");
  console.error("   VIKUNJA_URL:", VIKUNJA_URL || "(not set)");
  console.error("   VIKUNJA_API_KEY:", VIKUNJA_API_KEY ? "(set)" : "(not set)");
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  today: args.includes("--today"),
  project: args.includes("--project") ? args[args.indexOf("--project") + 1] : null,
  upcoming: args.includes("--upcoming") ? parseInt(args[args.indexOf("--upcoming") + 1]) : null,
  help: args.includes("--help") || args.includes("-h"),
};

if (options.help) {
  console.log(`
Vikunja Task Fetcher

Usage:
  bun fetch-tasks.ts [options]

Options:
  --today              Show only tasks due today
  --project <id>       Show tasks for specific project
  --upcoming <days>    Show tasks due in next N days
  --help, -h           Show this help message

Examples:
  bun fetch-tasks.ts                    # All tasks
  bun fetch-tasks.ts --today            # Today's tasks
  bun fetch-tasks.ts --upcoming 7       # Next week's tasks
  bun fetch-tasks.ts --project 5        # Tasks in project 5
  `);
  process.exit(0);
}

/**
 * Make authenticated request to Vikunja API
 */
async function vikunjaRequest<T>(endpoint: string): Promise<T> {
  const url = `${VIKUNJA_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${VIKUNJA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch all tasks
 */
async function fetchAllTasks(): Promise<VikunjaTask[]> {
  return await vikunjaRequest<VikunjaTask[]>("/api/v1/tasks/all");
}

/**
 * Fetch all projects
 */
async function fetchProjects(): Promise<VikunjaProject[]> {
  return await vikunjaRequest<VikunjaProject[]>("/api/v1/projects");
}

/**
 * Filter tasks based on options
 */
function filterTasks(tasks: VikunjaTask[]): VikunjaTask[] {
  let filtered = tasks;

  // Filter by project
  if (options.project) {
    const projectId = parseInt(options.project);
    filtered = filtered.filter(task => task.project_id === projectId);
  }

  // Filter by date
  if (options.today) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filtered = filtered.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate < tomorrow;
    });
  } else if (options.upcoming !== null) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + options.upcoming);

    filtered = filtered.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= now && dueDate <= futureDate;
    });
  }

  // Exclude completed tasks by default
  filtered = filtered.filter(task => !task.done);

  return filtered;
}

/**
 * Format tasks for display
 */
function formatTasks(tasks: VikunjaTask[], projects: VikunjaProject[]): string {
  if (tasks.length === 0) {
    return "✅ No tasks found matching criteria.";
  }

  // Create project lookup
  const projectMap = new Map(projects.map(p => [p.id, p.title]));

  // Sort by priority (descending) then by due date
  const sorted = tasks.sort((a, b) => {
    // Priority first (higher priority = lower number, so reverse)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // Then by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  });

  let output = `📋 Found ${tasks.length} task${tasks.length === 1 ? '' : 's'}:\n\n`;

  sorted.forEach((task, index) => {
    const priorityIcon = task.priority >= 4 ? "🔴" : task.priority >= 2 ? "🟡" : "🟢";
    const projectName = projectMap.get(task.project_id) || `Project ${task.project_id}`;
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date";

    output += `${index + 1}. ${priorityIcon} ${task.title}\n`;
    output += `   Project: ${projectName}\n`;
    output += `   Due: ${dueDate}\n`;
    if (task.description) {
      output += `   Description: ${task.description}\n`;
    }
    if (task.labels && task.labels.length > 0) {
      output += `   Labels: ${task.labels.map(l => l.title).join(", ")}\n`;
    }
    output += `\n`;
  });

  return output;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log("🔄 Fetching tasks from Vikunja...\n");

    const [tasks, projects] = await Promise.all([
      fetchAllTasks(),
      fetchProjects(),
    ]);

    const filtered = filterTasks(tasks);
    const formatted = formatTasks(filtered, projects);

    console.log(formatted);

    // Also output as JSON for programmatic use
    if (process.env.JSON_OUTPUT === "true") {
      console.log("\n--- JSON OUTPUT ---");
      console.log(JSON.stringify({ tasks: filtered, projects }, null, 2));
    }
  } catch (error) {
    console.error("❌ Failed to fetch tasks:", error);
    process.exit(1);
  }
}

main();
