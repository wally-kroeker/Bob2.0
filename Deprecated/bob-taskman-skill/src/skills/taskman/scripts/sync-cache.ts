#!/usr/bin/env bun
/**
 * sync-cache.ts - Sync Vikunja tasks to local SQLite cache
 *
 * This script fetches all tasks, projects, and labels from Vikunja API
 * and builds a local SQLite database for fast querying by TaskMan skill.
 *
 * Usage:
 *   bun run sync-cache.ts
 *
 * Configuration:
 *   Reads from ~/.claude.json (mcpServers.vikunja.env) or environment variables:
 *   - VIKUNJA_URL: API base URL
 *   - VIKUNJA_API_TOKEN: Authentication token
 */

import { Database } from "bun:sqlite";
import { readFileSync, existsSync, mkdirSync, unlinkSync, renameSync, appendFileSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Paths
const scriptDir = dirname(new URL(import.meta.url).pathname);
const dataDir = join(scriptDir, "..", "data");
const dbPath = join(dataDir, "taskman.db");
const tempDbPath = join(dataDir, "taskman.db.tmp");
const logPath = join(dataDir, "sync.log");

function log(level: "info" | "success" | "warn" | "error", message: string) {
  const timestamp = new Date().toISOString();
  const prefixes = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
  };
  const logMessage = `${prefixes[level]} ${message}`;
  console.log(logMessage);

  // Also write to log file (without colors)
  const plainLog = `${timestamp} [${level.toUpperCase()}] ${message}\n`;
  try {
    appendFileSync(logPath, plainLog);
  } catch {
    // Ignore log file errors
  }
}

interface Config {
  vikunjaUrl: string;
  vikunjaToken: string;
}

interface VikunjaProject {
  id: number;
  title: string;
  parent_project_id: number | null;
  is_archived: boolean;
}

interface VikunjaLabel {
  id: number;
  title: string;
  description?: string;
  hex_color?: string;
}

interface VikunjaTask {
  id: number;
  title: string;
  project_id: number;
  description?: string;
  done: boolean;
  priority: number;
  due_date?: string | null;
  parent_task_id?: number | null;
  labels?: VikunjaLabel[];
  created: string;
  updated: string;
}

/**
 * Load configuration from ~/.claude.json or environment variables
 */
function loadConfig(): Config {
  let vikunjaUrl = process.env.VIKUNJA_URL;
  let vikunjaToken = process.env.VIKUNJA_API_TOKEN;

  if (!vikunjaUrl || !vikunjaToken) {
    const claudeConfigPath = join(homedir(), ".claude.json");
    if (existsSync(claudeConfigPath)) {
      try {
        const config = JSON.parse(readFileSync(claudeConfigPath, "utf-8"));
        const vikunjaEnv = config?.mcpServers?.vikunja?.env;
        if (vikunjaEnv) {
          vikunjaUrl = vikunjaUrl || vikunjaEnv.VIKUNJA_URL;
          vikunjaToken = vikunjaToken || vikunjaEnv.VIKUNJA_API_TOKEN;
        }
      } catch (e) {
        log("warn", "Failed to parse ~/.claude.json");
      }
    }
  }

  if (!vikunjaUrl) {
    log("error", "VIKUNJA_URL not found");
    log("error", "Set in ~/.claude.json under mcpServers.vikunja.env.VIKUNJA_URL");
    log("error", "Or export VIKUNJA_URL environment variable");
    process.exit(1);
  }

  if (!vikunjaToken) {
    log("error", "VIKUNJA_API_TOKEN not found");
    log("error", "Set in ~/.claude.json under mcpServers.vikunja.env.VIKUNJA_API_TOKEN");
    log("error", "Or export VIKUNJA_API_TOKEN environment variable");
    process.exit(1);
  }

  return { vikunjaUrl, vikunjaToken };
}

/**
 * Make API request to Vikunja
 */
async function apiRequest<T>(
  config: Config,
  endpoint: string
): Promise<T> {
  const url = `${config.vikunjaUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.vikunjaToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed: ${endpoint} (HTTP ${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Initialize database schema
 */
function initDatabase(db: Database) {
  log("info", "Initializing database schema...");

  db.exec(`
    -- Metadata table
    CREATE TABLE IF NOT EXISTS cache_metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id INTEGER,
      is_archived BOOLEAN DEFAULT 0
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      project_id INTEGER,
      project_name TEXT,
      due_date TEXT,
      priority INTEGER,
      done BOOLEAN,
      parent_task_id INTEGER,
      created_at TIMESTAMP,
      updated_at TIMESTAMP
    );

    -- Labels table
    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      hex_color TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Task labels (many-to-many)
    CREATE TABLE IF NOT EXISTS task_labels (
      task_id INTEGER,
      label_id INTEGER,
      PRIMARY KEY (task_id, label_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id),
      FOREIGN KEY (label_id) REFERENCES labels(id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
    CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name);
    CREATE INDEX IF NOT EXISTS idx_task_labels_task ON task_labels(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_labels_label ON task_labels(label_id);
  `);

  log("success", "Database schema initialized");
}

/**
 * Sync projects from Vikunja
 */
async function syncProjects(
  config: Config,
  db: Database
): Promise<Map<number, string>> {
  log("info", "Fetching projects...");

  const projects = await apiRequest<VikunjaProject[]>(config, "/projects");
  log("info", `Found ${projects.length} projects`);

  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, parent_id, is_archived)
    VALUES (?, ?, ?, ?)
  `);

  const projectNameMap = new Map<number, string>();

  for (const project of projects) {
    insertProject.run(
      project.id,
      project.title,
      project.parent_project_id || null,
      project.is_archived ? 1 : 0
    );
    projectNameMap.set(project.id, project.title);
  }

  log("success", `Synced ${projects.length} projects`);
  return projectNameMap;
}

/**
 * Sync labels from Vikunja
 */
async function syncLabels(config: Config, db: Database): Promise<void> {
  log("info", "Fetching labels...");

  const labels = await apiRequest<VikunjaLabel[]>(config, "/labels");
  log("info", `Found ${labels.length} labels`);

  const insertLabel = db.prepare(`
    INSERT OR REPLACE INTO labels (id, name, description, hex_color)
    VALUES (?, ?, ?, ?)
  `);

  for (const label of labels) {
    insertLabel.run(
      label.id,
      label.title,
      label.description || "",
      label.hex_color || ""
    );
  }

  log("success", `Synced ${labels.length} labels`);
}

/**
 * Sync tasks from Vikunja (with pagination)
 */
async function syncTasks(
  config: Config,
  db: Database,
  projectNameMap: Map<number, string>
): Promise<number> {
  log("info", "Fetching tasks...");

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, project_id, project_name, due_date, priority, done, parent_task_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTaskLabel = db.prepare(`
    INSERT OR IGNORE INTO task_labels (task_id, label_id)
    VALUES (?, ?)
  `);

  let page = 1;
  let totalTasks = 0;
  const perPage = 50;

  while (true) {
    log("info", `Fetching page ${page}...`);

    const tasks = await apiRequest<VikunjaTask[]>(
      config,
      `/tasks/all?page=${page}&per_page=${perPage}`
    );

    if (tasks.length === 0) {
      log("info", "No more tasks to fetch");
      break;
    }

    for (const task of tasks) {
      // Parse due date (extract date portion only)
      let dueDate: string | null = null;
      if (task.due_date && task.due_date !== "0001-01-01T00:00:00Z") {
        dueDate = task.due_date.split("T")[0];
      }

      // Get project name
      const projectName = projectNameMap.get(task.project_id) || null;

      // Insert task
      insertTask.run(
        task.id,
        task.title,
        task.project_id,
        projectName,
        dueDate,
        task.priority || 0,
        task.done ? 1 : 0,
        task.parent_task_id || null,
        task.created,
        task.updated
      );

      // Insert task labels
      if (task.labels && task.labels.length > 0) {
        for (const label of task.labels) {
          insertTaskLabel.run(task.id, label.id);
        }
      }
    }

    totalTasks += tasks.length;
    log("info", `Processed ${tasks.length} tasks from page ${page} (total: ${totalTasks})`);

    if (tasks.length < perPage) {
      break;
    }

    page++;
  }

  log("success", `Synced ${totalTasks} tasks`);
  return totalTasks;
}

/**
 * Update cache metadata
 */
function updateMetadata(db: Database) {
  log("info", "Updating cache metadata...");

  const timestamp = new Date().toISOString();

  const insertMeta = db.prepare(`
    INSERT OR REPLACE INTO cache_metadata (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);

  insertMeta.run("last_sync", timestamp);

  // Store statistics
  const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
  const activeCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 0").get() as { count: number };

  insertMeta.run("total_tasks", String(taskCount.count));
  insertMeta.run("active_tasks", String(activeCount.count));

  log("success", "Metadata updated");
}

/**
 * Main sync function
 */
async function main() {
  const startTime = Date.now();

  log("info", "=========================================");
  log("info", "TaskMan Cache Sync Starting");
  log("info", `Time: ${new Date().toISOString()}`);
  log("info", "=========================================");

  // Ensure data directory exists
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Load configuration
  const config = loadConfig();

  // Remove temp database if exists
  if (existsSync(tempDbPath)) {
    unlinkSync(tempDbPath);
  }

  // Create new database
  const db = new Database(tempDbPath);

  try {
    // Initialize schema
    initDatabase(db);

    // Sync data
    const projectNameMap = await syncProjects(config, db);
    await syncLabels(config, db);
    await syncTasks(config, db, projectNameMap);

    // Update metadata
    updateMetadata(db);

    // Close database
    db.close();

    // Atomic move: replace old database with new one
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
    }
    renameSync(tempDbPath, dbPath);

    // Calculate duration
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Get final statistics
    const finalDb = new Database(dbPath);
    const totalTasks = (finalDb.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number }).count;
    const activeTasks = (finalDb.prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 0").get() as { count: number }).count;
    const projectCount = (finalDb.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number }).count;
    finalDb.close();

    log("success", "=========================================");
    log("success", "TaskMan Cache Sync Complete!");
    log("success", `Duration: ${duration}s`);
    log("success", `Projects: ${projectCount}`);
    log("success", `Tasks: ${totalTasks} (${activeTasks} active)`);
    log("success", `Cache: ${dbPath}`);
    log("success", "=========================================");
  } catch (error) {
    db.close();
    // Clean up temp database on error
    if (existsSync(tempDbPath)) {
      unlinkSync(tempDbPath);
    }
    log("error", `Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run main function
main();

