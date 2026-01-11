#!/usr/bin/env bun
/**
 * cleanup.ts - TaskMan v2.0 Migration Utilities
 *
 * Collection of utilities for cleaning up and managing the v2.0 migration.
 *
 * Usage:
 *   bun run cleanup.ts move-archive       # Move AI tasks to Archive project
 *   bun run cleanup.ts delete-labels      # Delete deprecated labels (ai-parent, ai-subtask)
 *   bun run cleanup.ts verify             # Verify migration completed successfully
 *   bun run cleanup.ts stats              # Show migration statistics
 *   bun run cleanup.ts help               # Show help
 *
 * Configuration:
 *   Reads from ~/.claude.json (mcpServers.vikunja.env) or environment variables:
 *   - VIKUNJA_URL: API base URL
 *   - VIKUNJA_API_TOKEN: Authentication token
 */

import { Database } from "bun:sqlite";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Configuration
const ARCHIVE_PROJECT_ID = 17;

// Task IDs to archive (from export - v1.0 AI-generated tasks)
const TASK_IDS = [
  211, 212, 213, 214, 215, 216, 217, 218, 219, 260, 261, 262, 263, 264, 265,
  267, 268, 269, 270, 271, 272, 273, 282, 283, 284, 285, 286, 287, 288, 289,
  290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304,
  305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319,
  320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334,
  335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349,
  350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364,
  365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379,
  380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394,
  396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 411,
  412, 413, 414, 415, 417, 418, 419, 420, 421, 422, 423, 427, 428, 429, 430,
  431, 432, 433, 434, 435, 436, 437, 438, 439, 440,
];

// Paths
const scriptDir = dirname(new URL(import.meta.url).pathname);
const dataDir = join(scriptDir, "..", "data");
const dbPath = join(dataDir, "taskman.db");

function log(level: "info" | "success" | "warn" | "error", message: string) {
  const prefixes = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
  };
  console.log(`${prefixes[level]} ${message}`);
}

interface Config {
  vikunjaUrl: string;
  vikunjaToken: string;
}

interface VikunjaLabel {
  id: number;
  title: string;
}

interface VikunjaProject {
  id: number;
  title: string;
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
    process.exit(1);
  }

  if (!vikunjaToken) {
    log("error", "VIKUNJA_API_TOKEN not found");
    process.exit(1);
  }

  return { vikunjaUrl, vikunjaToken };
}

/**
 * Make API request to Vikunja
 */
async function apiRequest<T>(
  config: Config,
  method: string,
  endpoint: string,
  body?: object
): Promise<{ data: T | null; status: number }> {
  const url = `${config.vikunjaUrl}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${config.vikunjaToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const status = response.status;

  if (status >= 200 && status < 300) {
    const data = await response.json() as T;
    return { data, status };
  }

  return { data: null, status };
}

/**
 * Move tasks to Archive project
 */
async function moveArchive(config: Config) {
  log("info", `Moving ${TASK_IDS.length} tasks to Archive (Project ID: ${ARCHIVE_PROJECT_ID})`);
  console.log("");

  let moved = 0;
  let failed = 0;
  let notFound = 0;

  for (const taskId of TASK_IDS) {
    const { data, status } = await apiRequest<{ id: number }>(
      config,
      "PUT",
      `/tasks/${taskId}`,
      { project_id: ARCHIVE_PROJECT_ID }
    );

    if (data && data.id === taskId) {
      moved++;
      if (moved % 10 === 0) {
        log("info", `Moved ${moved} tasks...`);
      }
    } else if (status === 404) {
      notFound++;
    } else {
      failed++;
      log("error", `Failed to move task ${taskId}`);
    }
  }

  console.log("");
  log("success", "Migration complete!");
  log("success", `Successfully moved: ${moved} tasks`);
  if (notFound > 0) log("warn", `Already deleted: ${notFound} tasks`);
  if (failed > 0) log("error", `Failed: ${failed} tasks`);
}

/**
 * Delete deprecated labels
 */
async function deleteLabels(config: Config) {
  log("info", "Finding deprecated labels (ai-parent, ai-subtask)...");

  // Get all labels
  const { data: labels } = await apiRequest<VikunjaLabel[]>(config, "GET", "/labels");

  if (!labels) {
    log("error", "Failed to fetch labels");
    return;
  }

  let deleted = 0;

  // Find and delete ai-parent
  const aiParent = labels.find((l) => l.title === "ai-parent");
  if (aiParent) {
    log("info", `Deleting label: ai-parent (ID: ${aiParent.id})`);
    const { status } = await apiRequest(config, "DELETE", `/labels/${aiParent.id}`);
    if (status >= 200 && status < 300) deleted++;
  }

  // Find and delete ai-subtask
  const aiSubtask = labels.find((l) => l.title === "ai-subtask");
  if (aiSubtask) {
    log("info", `Deleting label: ai-subtask (ID: ${aiSubtask.id})`);
    const { status } = await apiRequest(config, "DELETE", `/labels/${aiSubtask.id}`);
    if (status >= 200 && status < 300) deleted++;
  }

  if (deleted === 0) {
    log("warn", "No deprecated labels found (already deleted?)");
  } else {
    log("success", `Deleted ${deleted} deprecated labels`);
  }
}

/**
 * Verify migration status
 */
async function verifyMigration(config: Config) {
  log("info", "Verifying TaskMan v2.0 migration...");
  console.log("");

  // Check Archive project exists
  const { data: projects } = await apiRequest<VikunjaProject[]>(config, "GET", "/projects");
  if (!projects) {
    log("error", "Failed to fetch projects");
    return;
  }

  const archiveExists = projects.find((p) => p.id === ARCHIVE_PROJECT_ID);
  if (!archiveExists) {
    log("error", `Archive project (ID: ${ARCHIVE_PROJECT_ID}) not found!`);
  } else {
    log("success", `✓ Archive project exists (ID: ${ARCHIVE_PROJECT_ID})`);
  }

  // Check TimeEstimate labels exist
  const { data: labels } = await apiRequest<VikunjaLabel[]>(config, "GET", "/labels");
  if (!labels) {
    log("error", "Failed to fetch labels");
    return;
  }

  const label5min = labels.find((l) => l.title === "5min");
  const label15min = labels.find((l) => l.title === "15min");
  const label30min = labels.find((l) => l.title === "30min");
  const label60min = labels.find((l) => l.title === "60min+");

  if (label5min && label15min && label30min && label60min) {
    log(
      "success",
      `✓ TimeEstimate labels exist (IDs: ${label5min.id}, ${label15min.id}, ${label30min.id}, ${label60min.id})`
    );
  } else {
    log("error", "TimeEstimate labels incomplete!");
  }

  // Check deprecated labels are gone
  const aiParent = labels.find((l) => l.title === "ai-parent");
  const aiSubtask = labels.find((l) => l.title === "ai-subtask");

  if (!aiParent && !aiSubtask) {
    log("success", "✓ Deprecated labels removed");
  } else {
    log("warn", "Deprecated labels still exist (run: bun run cleanup.ts delete-labels)");
  }

  // Check local cache
  if (existsSync(dbPath)) {
    log("success", `✓ Local cache exists: ${dbPath}`);

    try {
      const db = new Database(dbPath, { readonly: true });
      const result = db.prepare("SELECT value FROM cache_metadata WHERE key = 'last_sync'").get() as
        | { value: string }
        | undefined;
      if (result?.value) {
        log("success", `✓ Cache last synced: ${result.value}`);
      } else {
        log("warn", "Cache metadata missing (run: bun run sync-cache.ts)");
      }
      db.close();
    } catch (e) {
      log("warn", "Failed to read cache database");
    }
  } else {
    log("error", `Local cache not found: ${dbPath}`);
    log("info", "Run: bun run sync-cache.ts");
  }

  console.log("");
  log("info", "Verification complete!");
}

/**
 * Show statistics
 */
async function showStats(config: Config) {
  log("info", "TaskMan v2.0 Statistics");
  console.log("");

  // Projects
  const { data: projects } = await apiRequest<VikunjaProject[]>(config, "GET", "/projects");
  if (projects) {
    log("info", `Projects: ${projects.length}`);
  }

  // Tasks in Archive
  const { data: archiveTasks } = await apiRequest<{ id: number }[]>(
    config,
    "GET",
    `/projects/${ARCHIVE_PROJECT_ID}/tasks`
  );
  if (archiveTasks) {
    log("info", `Tasks in Archive: ${archiveTasks.length}`);
  }

  // Labels
  const { data: labels } = await apiRequest<VikunjaLabel[]>(config, "GET", "/labels");
  if (labels) {
    log("info", `Labels: ${labels.length}`);
  }

  // TimeEstimate label info
  console.log("");
  log("info", "TimeEstimate Label Usage:");

  const timeLabels = ["5min", "15min", "30min", "60min+"];
  if (labels) {
    for (const labelName of timeLabels) {
      const label = labels.find((l) => l.title === labelName);
      if (label) {
        console.log(`  - ${labelName} (ID: ${label.id})`);
      }
    }
  }

  // Local cache stats
  if (existsSync(dbPath)) {
    console.log("");
    log("info", "Local Cache Statistics:");
    try {
      const db = new Database(dbPath, { readonly: true });
      const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
      const activeCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE done = 0").get() as { count: number };
      const projectCount = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
      const labelCount = db.prepare("SELECT COUNT(*) as count FROM labels").get() as { count: number };

      console.log(`  - Tasks: ${taskCount.count} (${activeCount.count} active)`);
      console.log(`  - Projects: ${projectCount.count}`);
      console.log(`  - Labels: ${labelCount.count}`);

      db.close();
    } catch (e) {
      log("warn", "Failed to read cache database");
    }
  }

  console.log("");
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
${colors.cyan}TaskMan v2.0 Migration Utilities${colors.reset}

Usage:
  bun run cleanup.ts move-archive    # Move ${TASK_IDS.length} AI tasks to Archive project
  bun run cleanup.ts delete-labels   # Delete deprecated labels (ai-parent, ai-subtask)
  bun run cleanup.ts verify          # Verify migration completed successfully
  bun run cleanup.ts stats           # Show migration statistics
  bun run cleanup.ts help            # Show this help

Recommended order:
  1. bun run cleanup.ts move-archive
  2. bun run cleanup.ts delete-labels
  3. bun run cleanup.ts verify
`);
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2] || "help";

  switch (command) {
    case "move-archive": {
      const config = loadConfig();
      await moveArchive(config);
      break;
    }
    case "delete-labels": {
      const config = loadConfig();
      await deleteLabels(config);
      break;
    }
    case "verify": {
      const config = loadConfig();
      await verifyMigration(config);
      break;
    }
    case "stats": {
      const config = loadConfig();
      await showStats(config);
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

