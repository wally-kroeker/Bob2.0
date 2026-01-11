#!/usr/bin/env bun
/**
 * vikunja-client.ts - Shared Vikunja REST API client
 *
 * Provides authenticated API access to Vikunja for all task management tools.
 * Loads credentials from $PAI_DIR/skills/Task/data/.env
 */

import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";

// Types for Vikunja API responses
export interface VikunjaProject {
  id: number;
  title: string;
  description?: string;
  parent_project_id: number | null;
  is_archived: boolean;
  created: string;
  updated: string;
}

export interface VikunjaLabel {
  id: number;
  title: string;
  description?: string;
  hex_color?: string;
  created: string;
  updated: string;
}

export interface VikunjaUser {
  id: number;
  username: string;
  name?: string;
  email?: string;
}

export interface VikunjaTask {
  id: number;
  title: string;
  description?: string;
  done: boolean;
  priority: number;
  due_date?: string | null;
  project_id: number;
  labels?: VikunjaLabel[];
  assignees?: VikunjaUser[];
  created: string;
  updated: string;
  identifier?: string;
  index?: number;
  repeat_after?: number;
  repeat_mode?: string;
}

export interface TaskCreateParams {
  title: string;
  projectId: number;
  description?: string;
  dueDate?: string;
  priority?: number;
  labels?: number[];
  assignees?: number[];
}

export interface TaskUpdateParams {
  title?: string;
  description?: string;
  done?: boolean;
  dueDate?: string;
  priority?: number;
}

export interface TaskListParams {
  projectId?: number;
  done?: boolean;
  priority?: number;
  search?: string;
  page?: number;
  perPage?: number;
}

// ANSI colors for console output
export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

/**
 * Load environment variables from .env file
 */
function loadEnvFile(envPath: string): Record<string, string> {
  const env: Record<string, string> = {};
  
  if (!existsSync(envPath)) {
    return env;
  }
  
  const content = readFileSync(envPath, "utf-8");
  const lines = content.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    
    const match = trimmed.match(/^([A-Z_]+)=["']?(.+?)["']?$/);
    if (match) {
      env[match[1]] = match[2];
    }
  }
  
  return env;
}

/**
 * Get the data directory path for the Task skill
 */
function getDataDir(): string {
  // Try to find the data directory relative to this script
  const scriptDir = dirname(new URL(import.meta.url).pathname);
  
  // Check if we're in the installed location ($PAI_DIR/skills/Task/tools/lib)
  // Path: tools/lib -> tools -> Task -> data
  const installedDataDir = join(scriptDir, "..", "..", "data");
  if (existsSync(installedDataDir)) {
    return installedDataDir;
  }
  
  // Check if we're in the pack source location (src/tools/lib)
  // Path: tools/lib -> tools -> src -> skills/Task/data
  const sourceDataDir = join(scriptDir, "..", "..", "skills", "Task", "data");
  if (existsSync(sourceDataDir)) {
    return sourceDataDir;
  }
  
  // Fallback to $PAI_DIR/skills/Task/data
  const paiDir = process.env.PAI_DIR || join(homedir(), ".claude");
  return join(paiDir, "skills", "Task", "data");
}

/**
 * Load configuration from environment
 */
export interface VikunjaConfig {
  url: string;
  token: string;
}

export function loadConfig(): VikunjaConfig {
  // First try environment variables
  let url = process.env.VIKUNJA_URL;
  let token = process.env.VIKUNJA_API_TOKEN;
  
  // If not in environment, try .env file
  if (!url || !token) {
    const dataDir = getDataDir();
    const envPath = join(dataDir, ".env");
    
    if (existsSync(envPath)) {
      const envVars = loadEnvFile(envPath);
      url = url || envVars.VIKUNJA_URL;
      token = token || envVars.VIKUNJA_API_TOKEN;
    }
  }
  
  if (!url) {
    console.error(`${colors.red}Error: VIKUNJA_URL not configured${colors.reset}`);
    console.error(`Set in: $PAI_DIR/skills/Task/data/.env`);
    console.error(`Or export VIKUNJA_URL environment variable`);
    process.exit(1);
  }
  
  if (!token) {
    console.error(`${colors.red}Error: VIKUNJA_API_TOKEN not configured${colors.reset}`);
    console.error(`Set in: $PAI_DIR/skills/Task/data/.env`);
    console.error(`Or export VIKUNJA_API_TOKEN environment variable`);
    process.exit(1);
  }
  
  if (token.includes("your_token") || token === "tk_your_token_here") {
    console.error(`${colors.yellow}Warning: VIKUNJA_API_TOKEN appears to be a placeholder${colors.reset}`);
    console.error(`Update your .env file with a real token from Vikunja Settings → API Tokens`);
    process.exit(1);
  }
  
  return { url, token };
}

/**
 * Vikunja API client class
 */
export class VikunjaClient {
  private url: string;
  private token: string;
  
  constructor(config?: VikunjaConfig) {
    const cfg = config || loadConfig();
    this.url = cfg.url.replace(/\/$/, ""); // Remove trailing slash
    this.token = cfg.token;
  }
  
  /**
   * Make an authenticated API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.url}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;
    
    return JSON.parse(text) as T;
  }
  
  // ============ Tasks ============
  
  /**
   * List all tasks with optional filtering
   */
  async listTasks(params: TaskListParams = {}): Promise<VikunjaTask[]> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set("page", String(params.page));
    if (params.perPage) queryParams.set("per_page", String(params.perPage));
    if (params.search) queryParams.set("s", params.search);
    
    // Build filter string
    const filters: string[] = [];
    if (params.done !== undefined) {
      filters.push(`done = ${params.done}`);
    }
    if (params.priority !== undefined) {
      filters.push(`priority >= ${params.priority}`);
    }
    if (filters.length > 0) {
      queryParams.set("filter", filters.join(" && "));
    }
    
    const query = queryParams.toString();
    const endpoint = params.projectId 
      ? `/projects/${params.projectId}/tasks${query ? `?${query}` : ""}`
      : `/tasks/all${query ? `?${query}` : ""}`;
    
    return this.request<VikunjaTask[]>("GET", endpoint);
  }
  
  /**
   * Get a single task by ID
   */
  async getTask(taskId: number): Promise<VikunjaTask> {
    return this.request<VikunjaTask>("GET", `/tasks/${taskId}`);
  }
  
  /**
   * Create a new task
   */
  async createTask(params: TaskCreateParams): Promise<VikunjaTask> {
    const body: any = {
      title: params.title,
    };
    
    if (params.description) body.description = params.description;
    if (params.dueDate) body.due_date = params.dueDate;
    if (params.priority !== undefined) body.priority = params.priority;
    
    const task = await this.request<VikunjaTask>(
      "PUT",
      `/projects/${params.projectId}/tasks`,
      body
    );
    
    // Apply labels if specified
    if (params.labels && params.labels.length > 0) {
      for (const labelId of params.labels) {
        await this.addLabelToTask(task.id, labelId);
      }
    }
    
    // Assign users if specified
    if (params.assignees && params.assignees.length > 0) {
      await this.assignTask(task.id, params.assignees);
    }
    
    return task;
  }
  
  /**
   * Update an existing task
   */
  async updateTask(taskId: number, params: TaskUpdateParams): Promise<VikunjaTask> {
    const body: any = {};
    
    if (params.title !== undefined) body.title = params.title;
    if (params.description !== undefined) body.description = params.description;
    if (params.done !== undefined) body.done = params.done;
    if (params.dueDate !== undefined) body.due_date = params.dueDate;
    if (params.priority !== undefined) body.priority = params.priority;
    
    return this.request<VikunjaTask>("POST", `/tasks/${taskId}`, body);
  }
  
  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<void> {
    await this.request<void>("DELETE", `/tasks/${taskId}`);
  }
  
  /**
   * Add a label to a task
   */
  async addLabelToTask(taskId: number, labelId: number): Promise<void> {
    await this.request<void>("PUT", `/tasks/${taskId}/labels`, {
      label_id: labelId,
    });
  }
  
  /**
   * Remove a label from a task
   */
  async removeLabelFromTask(taskId: number, labelId: number): Promise<void> {
    await this.request<void>("DELETE", `/tasks/${taskId}/labels/${labelId}`);
  }
  
  /**
   * Assign users to a task
   */
  async assignTask(taskId: number, userIds: number[]): Promise<void> {
    for (const userId of userIds) {
      await this.request<void>("PUT", `/tasks/${taskId}/assignees`, {
        user_id: userId,
      });
    }
  }
  
  /**
   * Unassign a user from a task
   */
  async unassignTask(taskId: number, userId: number): Promise<void> {
    await this.request<void>("DELETE", `/tasks/${taskId}/assignees/${userId}`);
  }
  
  // ============ Projects ============
  
  /**
   * List all projects
   */
  async listProjects(): Promise<VikunjaProject[]> {
    return this.request<VikunjaProject[]>("GET", "/projects");
  }
  
  /**
   * Get a single project by ID
   */
  async getProject(projectId: number): Promise<VikunjaProject> {
    return this.request<VikunjaProject>("GET", `/projects/${projectId}`);
  }
  
  // ============ Labels ============
  
  /**
   * List all labels
   */
  async listLabels(): Promise<VikunjaLabel[]> {
    return this.request<VikunjaLabel[]>("GET", "/labels");
  }
  
  /**
   * Get a single label by ID
   */
  async getLabel(labelId: number): Promise<VikunjaLabel> {
    return this.request<VikunjaLabel>("GET", `/labels/${labelId}`);
  }
  
  /**
   * Find label by name (case-insensitive)
   */
  async findLabelByName(name: string): Promise<VikunjaLabel | undefined> {
    const labels = await this.listLabels();
    return labels.find(l => l.title.toLowerCase() === name.toLowerCase());
  }
  
  // ============ Users ============
  
  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<VikunjaUser> {
    return this.request<VikunjaUser>("GET", "/user");
  }
  
  /**
   * List all users (requires admin or team access)
   */
  async listUsers(): Promise<VikunjaUser[]> {
    return this.request<VikunjaUser[]>("GET", "/users");
  }
}

// Create client on demand - don't load config at import time
let _client: VikunjaClient | null = null;
export function getClient(): VikunjaClient {
  if (!_client) {
    _client = new VikunjaClient();
  }
  return _client;
}

// Helper function to format task for display
export function formatTask(task: VikunjaTask, showDetails = false): string {
  const priorityMarkers: Record<number, string> = {
    5: `${colors.red}[!!!]${colors.reset}`,
    4: `${colors.yellow}[!!]${colors.reset}`,
    3: `${colors.blue}[!]${colors.reset}`,
    2: `${colors.gray}[-]${colors.reset}`,
    1: `${colors.gray}[.]${colors.reset}`,
    0: `${colors.gray}[ ]${colors.reset}`,
  };
  
  const priority = priorityMarkers[task.priority] || priorityMarkers[0];
  const done = task.done ? `${colors.green}✓${colors.reset}` : " ";
  const id = `${colors.cyan}#${task.id}${colors.reset}`;
  
  let line = `${done} ${priority} ${id} ${task.title}`;
  
  if (task.due_date && task.due_date !== "0001-01-01T00:00:00Z") {
    const dueDate = task.due_date.split("T")[0];
    line += ` ${colors.yellow}📅 ${dueDate}${colors.reset}`;
  }
  
  if (showDetails && task.labels && task.labels.length > 0) {
    const labels = task.labels.map(l => l.title).join(", ");
    line += ` ${colors.gray}[${labels}]${colors.reset}`;
  }
  
  return line;
}

// Helper to parse natural language dates
export function parseNaturalDate(input: string): string | null {
  const now = new Date();
  const lower = input.toLowerCase().trim();
  
  if (lower === "today") {
    return formatDateISO(now);
  }
  
  if (lower === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateISO(tomorrow);
  }
  
  if (lower === "next week") {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return formatDateISO(nextWeek);
  }
  
  // "in X days"
  const inDaysMatch = lower.match(/in (\d+) days?/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const future = new Date(now);
    future.setDate(future.getDate() + days);
    return formatDateISO(future);
  }
  
  // Day names (next Monday, Tuesday, etc.)
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const target = new Date(now);
      const currentDay = target.getDay();
      let daysToAdd = i - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // Next week if today or past
      target.setDate(target.getDate() + daysToAdd);
      return formatDateISO(target);
    }
  }
  
  // Try parsing as ISO date
  const isoMatch = input.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    return `${isoMatch[0]}T23:59:59Z`;
  }
  
  return null;
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T23:59:59Z`;
}

