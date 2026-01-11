#!/usr/bin/env bun
/**
 * sync-projects.ts - Sync project hierarchy from Vikunja to local markdown file
 *
 * This script fetches all projects from the Vikunja API and generates
 * a markdown file showing the project hierarchy.
 *
 * Usage:
 *   bun run sync-projects.ts
 *
 * Configuration:
 *   Reads from ~/.claude.json (mcpServers.vikunja.env) or environment variables:
 *   - VIKUNJA_URL: API base URL
 *   - VIKUNJA_API_TOKEN: Authentication token
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
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

function log(level: "info" | "success" | "warn" | "error", message: string) {
  const prefixes = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
  };
  console.log(`${prefixes[level]} ${message}`);
}

interface VikunjaProject {
  id: number;
  title: string;
  parent_project_id: number | null;
  is_archived: boolean;
  description?: string;
}

interface Config {
  vikunjaUrl: string;
  vikunjaToken: string;
}

/**
 * Load configuration from ~/.claude.json or environment variables
 */
function loadConfig(): Config {
  // Try environment variables first
  let vikunjaUrl = process.env.VIKUNJA_URL;
  let vikunjaToken = process.env.VIKUNJA_API_TOKEN;

  // Fall back to ~/.claude.json
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
    throw new Error(`API request failed: ${endpoint} (HTTP ${response.status})`);
  }

  return response.json() as Promise<T>;
}

/**
 * Build project hierarchy tree
 */
function buildHierarchy(projects: VikunjaProject[]): Map<number | null, VikunjaProject[]> {
  const hierarchy = new Map<number | null, VikunjaProject[]>();

  for (const project of projects) {
    const parentId = project.parent_project_id || null;
    if (!hierarchy.has(parentId)) {
      hierarchy.set(parentId, []);
    }
    hierarchy.get(parentId)!.push(project);
  }

  return hierarchy;
}

/**
 * Generate markdown content for the hierarchy
 */
function generateMarkdown(
  hierarchy: Map<number | null, VikunjaProject[]>,
  parentId: number | null = null,
  indent: number = 0
): string {
  const children = hierarchy.get(parentId) || [];
  let content = "";

  for (const project of children.sort((a, b) => a.title.localeCompare(b.title))) {
    const prefix = indent === 0 ? "### " : "  ".repeat(indent) + "- ";
    const archiveTag = project.is_archived ? " [ARCHIVED]" : "";
    content += `${prefix}${project.title} (id: ${project.id})${archiveTag}\n`;

    // Recursively add children
    const childContent = generateMarkdown(hierarchy, project.id, indent + 1);
    if (childContent) {
      content += childContent;
    }
    if (indent === 0) {
      content += "\n";
    }
  }

  return content;
}

/**
 * Main function
 */
async function main() {
  log("info", "=========================================");
  log("info", "Vikunja Project Hierarchy Sync");
  log("info", `Time: ${new Date().toISOString()}`);
  log("info", "=========================================");

  // Load configuration
  const config = loadConfig();

  // Determine output path
  const scriptDir = dirname(new URL(import.meta.url).pathname);
  const dataDir = join(scriptDir, "..", "data");
  const outputFile = join(dataDir, "project-hierarchy.md");

  // Ensure data directory exists
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  try {
    // Fetch projects
    log("info", "Fetching projects from Vikunja...");
    const projects = await apiRequest<VikunjaProject[]>(config, "/projects");
    log("info", `Found ${projects.length} projects`);

    // Build hierarchy
    const hierarchy = buildHierarchy(projects);
    const rootProjects = hierarchy.get(null) || [];
    log("info", `Root projects: ${rootProjects.length}`);

    // Generate markdown content
    let markdown = `# Vikunja Project Hierarchy\n\n`;
    markdown += `**Last synced:** ${new Date().toISOString()}\n\n`;
    markdown += `**Total projects:** ${projects.length}\n\n`;
    markdown += `---\n\n`;
    markdown += `## Project Tree\n\n`;
    markdown += generateMarkdown(hierarchy);
    markdown += `---\n\n`;
    markdown += `## Sync Instructions\n\n`;
    markdown += `Run: \`bun run sync-projects.ts\` to update this file from Vikunja API\n`;

    // Write output file
    writeFileSync(outputFile, markdown);

    log("success", "=========================================");
    log("success", "Project hierarchy synced successfully!");
    log("success", `Projects: ${projects.length}`);
    log("success", `Output: ${outputFile}`);
    log("success", "=========================================");
  } catch (error) {
    log("error", `Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run main function
main();

