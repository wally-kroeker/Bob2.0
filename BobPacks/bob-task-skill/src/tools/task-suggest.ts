#!/usr/bin/env bun
/**
 * task-suggest.ts - ADHD-optimized task suggestions
 *
 * Provides context-aware task suggestions based on:
 * - Time of day (morning = deep work, afternoon = quick wins)
 * - Available time
 * - Priority and due dates
 * - Momentum building (easy tasks first)
 *
 * Usage:
 *   bun run task-suggest.ts                     # Default suggestions
 *   bun run task-suggest.ts --time 15           # I have 15 minutes
 *   bun run task-suggest.ts --context phone     # Phone-only tasks
 *   bun run task-suggest.ts --quick-wins        # Easy momentum builders
 */

import { VikunjaClient, VikunjaTask, colors, formatTask } from "./lib/vikunja-client";

// Check for --help before anything else
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
  process.exit(0);
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bold}task-suggest.ts${colors.reset} - ADHD-optimized task suggestions

${colors.yellow}Usage:${colors.reset}
  bun run task-suggest.ts [options]

${colors.yellow}Options:${colors.reset}
  --time <minutes>    Available time (5, 15, 30, 60)
  --context <type>    Location context: computer, phone, anywhere
  --quick-wins        Show only quick wins (5-15 min tasks)
  --deep-work         Show only deep work tasks
  --urgent            Show only urgent/overdue tasks
  --balance           Show work/life balance analysis
  --json              Output as JSON
  --help              Show this help

${colors.yellow}ADHD Optimization:${colors.reset}
  - Morning (8-11am):   Deep work, creative tasks
  - Midday (11am-2pm):  Admin work, meetings
  - Afternoon (2-5pm):  Quick wins, phone tasks
  - Evening (5pm+):     Personal, low-effort tasks

${colors.yellow}Examples:${colors.reset}
  bun run task-suggest.ts                    # What should I work on?
  bun run task-suggest.ts --time 15          # 15 minute tasks
  bun run task-suggest.ts --context phone    # Phone tasks only
  bun run task-suggest.ts --quick-wins       # Easy momentum builders
`);
}

interface Options {
  availableTime?: number;
  context?: string;
  quickWins: boolean;
  deepWork: boolean;
  urgent: boolean;
  showBalance: boolean;
  jsonOutput: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    quickWins: false,
    deepWork: false,
    urgent: false,
    showBalance: false,
    jsonOutput: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case "--time":
        options.availableTime = parseInt(args[++i], 10);
        break;
      case "--context":
        options.context = args[++i].toLowerCase();
        break;
      case "--quick-wins":
        options.quickWins = true;
        break;
      case "--deep-work":
        options.deepWork = true;
        break;
      case "--urgent":
        options.urgent = true;
        break;
      case "--balance":
        options.showBalance = true;
        break;
      case "--json":
        options.jsonOutput = true;
        break;
    }
  }
  
  return options;
}

function getTimeOfDay(): "morning" | "midday" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour >= 8 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "midday";
  if (hour >= 14 && hour < 17) return "afternoon";
  return "evening";
}

function getTimeOfDayDescription(tod: string): string {
  switch (tod) {
    case "morning": return "Deep work & creative tasks";
    case "midday": return "Admin work & meetings";
    case "afternoon": return "Quick wins & phone tasks";
    case "evening": return "Personal & low-effort tasks";
    default: return "";
  }
}

function hasLabel(task: VikunjaTask, labelName: string): boolean {
  return task.labels?.some(l => l.title.toLowerCase() === labelName.toLowerCase()) || false;
}

function getTimeEstimate(task: VikunjaTask): number | null {
  if (hasLabel(task, "5min")) return 5;
  if (hasLabel(task, "15min")) return 15;
  if (hasLabel(task, "30min")) return 30;
  if (hasLabel(task, "60min+")) return 60;
  return null;
}

function isQuickWin(task: VikunjaTask): boolean {
  return hasLabel(task, "QuickWin") || hasLabel(task, "5min") || hasLabel(task, "15min");
}

function isDeepWork(task: VikunjaTask): boolean {
  return hasLabel(task, "DeepWork") || hasLabel(task, "CreativeWork");
}

function isOverdue(task: VikunjaTask): boolean {
  if (!task.due_date || task.due_date === "0001-01-01T00:00:00Z") return false;
  return new Date(task.due_date) < new Date();
}

function isDueToday(task: VikunjaTask): boolean {
  if (!task.due_date || task.due_date === "0001-01-01T00:00:00Z") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = new Date(task.due_date);
  return dueDate >= today && dueDate < tomorrow;
}

function isDueSoon(task: VikunjaTask): boolean {
  if (!task.due_date || task.due_date === "0001-01-01T00:00:00Z") return false;
  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() + 3);
  return new Date(task.due_date) <= threeDays;
}

async function main() {
  const options = parseArgs();
  const client = new VikunjaClient();
  
  try {
    // Fetch all active tasks
    let tasks = await client.listTasks({
      done: false,
      perPage: 200,
    });
    
    // Apply context filter
    if (options.context) {
      const contextLabel = options.context.charAt(0).toUpperCase() + options.context.slice(1);
      tasks = tasks.filter(t => hasLabel(t, contextLabel));
    }
    
    // Apply time filter
    if (options.availableTime) {
      tasks = tasks.filter(t => {
        const estimate = getTimeEstimate(t);
        return estimate !== null && estimate <= options.availableTime!;
      });
    }
    
    // Apply specific filters
    if (options.quickWins) {
      tasks = tasks.filter(isQuickWin);
    }
    if (options.deepWork) {
      tasks = tasks.filter(isDeepWork);
    }
    if (options.urgent) {
      tasks = tasks.filter(t => isOverdue(t) || isDueToday(t) || t.priority >= 4);
    }
    
    // Sort by urgency and priority
    tasks.sort((a, b) => {
      // Overdue first
      const aOverdue = isOverdue(a) ? 0 : 1;
      const bOverdue = isOverdue(b) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      
      // Due today next
      const aDueToday = isDueToday(a) ? 0 : 1;
      const bDueToday = isDueToday(b) ? 0 : 1;
      if (aDueToday !== bDueToday) return aDueToday - bDueToday;
      
      // Then by priority (higher first)
      if (b.priority !== a.priority) return b.priority - a.priority;
      
      // Then by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      
      return 0;
    });
    
    if (options.jsonOutput) {
      console.log(JSON.stringify(tasks.slice(0, 10), null, 2));
      return;
    }
    
    // Display suggestions
    const timeOfDay = getTimeOfDay();
    const hour = new Date().getHours();
    
    console.log(`\n${colors.cyan}${colors.bold}Task Suggestions${colors.reset}`);
    console.log(`${colors.gray}${new Date().toLocaleString()}${colors.reset}`);
    console.log(`${colors.gray}Time of day: ${timeOfDay} - ${getTimeOfDayDescription(timeOfDay)}${colors.reset}\n`);
    
    // Urgent/Overdue section
    const urgent = tasks.filter(t => isOverdue(t) || isDueToday(t));
    if (urgent.length > 0) {
      console.log(`${colors.red}${colors.bold}🔴 URGENT (${urgent.length}):${colors.reset}`);
      for (const task of urgent.slice(0, 3)) {
        const marker = isOverdue(task) ? `${colors.red}OVERDUE${colors.reset}` : `${colors.yellow}Due today${colors.reset}`;
        console.log(`  ${formatTask(task, true)} - ${marker}`);
      }
      console.log("");
    }
    
    // High priority section
    const highPriority = tasks.filter(t => t.priority >= 4 && !isOverdue(t) && !isDueToday(t));
    if (highPriority.length > 0) {
      console.log(`${colors.yellow}${colors.bold}⚡ HIGH PRIORITY (${highPriority.length}):${colors.reset}`);
      for (const task of highPriority.slice(0, 3)) {
        console.log(`  ${formatTask(task, true)}`);
      }
      console.log("");
    }
    
    // Time-of-day appropriate tasks
    let appropriate: VikunjaTask[] = [];
    let appropriateLabel = "";
    
    switch (timeOfDay) {
      case "morning":
        appropriate = tasks.filter(isDeepWork);
        appropriateLabel = "🧠 DEEP WORK (morning focus)";
        break;
      case "midday":
        appropriate = tasks.filter(t => hasLabel(t, "AdminWork") || hasLabel(t, "Work"));
        appropriateLabel = "📋 ADMIN WORK (midday)";
        break;
      case "afternoon":
        appropriate = tasks.filter(isQuickWin);
        appropriateLabel = "⚡ QUICK WINS (afternoon energy)";
        break;
      case "evening":
        appropriate = tasks.filter(t => hasLabel(t, "Personal") || hasLabel(t, "Housework") || hasLabel(t, "YardWork"));
        appropriateLabel = "🏠 PERSONAL (evening wind-down)";
        break;
    }
    
    // Remove already shown tasks
    appropriate = appropriate.filter(t => 
      !urgent.includes(t) && !highPriority.includes(t)
    );
    
    if (appropriate.length > 0) {
      console.log(`${colors.green}${colors.bold}${appropriateLabel} (${appropriate.length}):${colors.reset}`);
      for (const task of appropriate.slice(0, 5)) {
        const estimate = getTimeEstimate(task);
        const timeStr = estimate ? `${colors.gray}~${estimate}min${colors.reset}` : "";
        console.log(`  ${formatTask(task, true)} ${timeStr}`);
      }
      console.log("");
    }
    
    // Balance analysis
    if (options.showBalance) {
      const work = tasks.filter(t => hasLabel(t, "Work") || hasLabel(t, "Client")).length;
      const personal = tasks.filter(t => hasLabel(t, "Personal") || hasLabel(t, "Housework") || hasLabel(t, "YardWork")).length;
      const total = tasks.length;
      
      console.log(`${colors.cyan}${colors.bold}📊 BALANCE ANALYSIS:${colors.reset}`);
      console.log(`  Total active: ${total}`);
      console.log(`  Work tasks: ${work} (${Math.round(work/total*100)}%)`);
      console.log(`  Personal tasks: ${personal} (${Math.round(personal/total*100)}%)`);
      
      if (work > personal * 2) {
        console.log(`  ${colors.yellow}⚠️  Heavy on work tasks - consider some personal time${colors.reset}`);
      } else if (personal > work * 2) {
        console.log(`  ${colors.yellow}⚠️  Heavy on personal tasks - check work priorities${colors.reset}`);
      } else {
        console.log(`  ${colors.green}✓ Balanced workload${colors.reset}`);
      }
      console.log("");
    }
    
    // Recommendation
    if (tasks.length > 0) {
      const recommended = urgent[0] || highPriority[0] || appropriate[0] || tasks[0];
      if (recommended) {
        console.log(`${colors.cyan}${colors.bold}💡 RECOMMENDATION:${colors.reset}`);
        console.log(`  Start with: ${formatTask(recommended, true)}`);
        
        if (isQuickWin(recommended)) {
          console.log(`  ${colors.gray}Quick win - builds momentum!${colors.reset}`);
        } else if (isDeepWork(recommended)) {
          console.log(`  ${colors.gray}Deep work - block distractions${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.green}No tasks matching criteria. You're all caught up! 🎉${colors.reset}`);
    }
    
    console.log("");
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
    process.exit(1);
  }
}

main();

