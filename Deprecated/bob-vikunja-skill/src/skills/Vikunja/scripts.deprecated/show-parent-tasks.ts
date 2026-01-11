#!/usr/bin/env bun

/**
 * Show only parent tasks (tasks that have subtasks)
 */

import { readFileSync } from 'fs';

const VIKUNJA_URL = process.env.VIKUNJA_URL;
const VIKUNJA_API_KEY = process.env.VIKUNJA_API_KEY || process.env.Vikunja_API_Key;

if (!VIKUNJA_URL || !VIKUNJA_API_KEY) {
  console.error("❌ Error: VIKUNJA_URL and VIKUNJA_API_KEY must be set in .env file");
  process.exit(1);
}

interface VikunjaTask {
  id: number;
  title: string;
  description: string;
  done: boolean;
  priority: number;
  due_date: string | null;
  project_id: number;
  related_tasks?: {
    subtask?: Array<any>;
    parenttask?: Array<any>;
  };
}

async function vikunjaRequest<T>(endpoint: string): Promise<T> {
  const url = `${VIKUNJA_URL}${endpoint}`;
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
}

async function main() {
  try {
    console.log("🔄 Fetching parent tasks from Vikunja...\n");

    const tasks = await vikunjaRequest<VikunjaTask[]>("/api/v1/tasks/all");

    // Filter for parent tasks (tasks that have subtasks and are not completed)
    const parentTasks = tasks.filter(task => {
      const hasSubtasks = task.related_tasks?.subtask && task.related_tasks.subtask.length > 0;
      const isNotDone = !task.done;
      return hasSubtasks && isNotDone;
    });

    if (parentTasks.length === 0) {
      console.log("✅ No parent tasks found.");
      process.exit(0);
    }

    console.log(`📋 Found ${parentTasks.length} parent task${parentTasks.length === 1 ? '' : 's'}:\n`);

    parentTasks.forEach((task, index) => {
      const priorityIcon = task.priority >= 4 ? "🔴" : task.priority >= 2 ? "🟡" : "🟢";
      const subtaskCount = task.related_tasks?.subtask?.length || 0;
      const completedSubtasks = task.related_tasks?.subtask?.filter(st => st.done).length || 0;

      console.log(`${index + 1}. ${priorityIcon} ${task.title}`);
      console.log(`   Progress: ${completedSubtasks}/${subtaskCount} subtasks completed`);

      if (task.description) {
        // Extract just the reason if it's an AI breakdown
        const reasonMatch = task.description.match(/\*\*Reason:\*\*\s*([^*]+)/);
        if (reasonMatch) {
          console.log(`   Reason: ${reasonMatch[1].trim()}`);
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error("❌ Failed to fetch tasks:", error);
    process.exit(1);
  }
}

main();
