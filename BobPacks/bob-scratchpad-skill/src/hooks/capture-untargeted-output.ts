#!/usr/bin/env bun

/**
 * Capture Untargeted Output Hook
 *
 * Auto-saves agent outputs that don't have an explicit destination.
 * Optional hook - can be disabled via SCRATCHPAD_AUTO_SAVE=false
 */

import { save } from '../tools/ScratchpadManager.ts';

// Check if auto-save is enabled
const AUTO_SAVE_ENABLED = process.env.SCRATCHPAD_AUTO_SAVE === 'true';

async function main() {
  // Exit early if auto-save disabled
  if (!AUTO_SAVE_ENABLED) {
    process.exit(0);
  }

  try {
    // Read event from stdin
    const input = await readStdin();
    const event = JSON.parse(input);

    const { tool_name, tool_input, tool_output, session_id } = event;

    // Only process specific tools that generate content
    const contentTools = ['Task', 'WebFetch', 'WebSearch'];
    if (!contentTools.includes(tool_name)) {
      process.exit(0);
    }

    // Extract output
    const output = tool_output?.output || tool_output?.result || '';

    // Check if output is substantial
    if (typeof output !== 'string' || output.length < 200) {
      process.exit(0); // Too short, skip
    }

    // Heuristic: Check if output was explicitly saved
    // (This is a simplified check - in production, would examine recent tool calls)
    const wasExplicitlySaved = await checkIfOutputWasSaved(session_id);
    if (wasExplicitlySaved) {
      process.exit(0); // Already saved, don't duplicate
    }

    // Infer description from tool and content
    const description = inferDescription(tool_name, output, tool_input);

    // Auto-save to scratchpad
    const folderPath = await save({
      content: output,
      description,
      metadata: {
        tool: tool_name,
        session_id,
        auto_saved: true,
        timestamp: new Date().toISOString()
      }
    });

    // Log to stderr (won't interfere with Claude Code)
    console.error(`[Scratchpad] Auto-saved to: ${folderPath}`);

    process.exit(0);
  } catch (error: any) {
    // Never crash - hooks should fail silently
    console.error(`[Scratchpad Hook Error] ${error.message}`);
    process.exit(0);
  }
}

/**
 * Read from stdin
 */
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Check if output was already saved to a file
 * (Simplified heuristic - in production, would check recent Write/Edit tool calls)
 */
async function checkIfOutputWasSaved(session_id: string): Promise<boolean> {
  // TODO: Implement by checking recent tool history
  // For now, assume not saved (conservative)
  return false;
}

/**
 * Infer description from tool name and content
 */
function inferDescription(tool_name: string, content: string, tool_input: any): string {
  // Extract keywords based on tool type
  let description = '';

  if (tool_name === 'Task') {
    // Use subagent type or description
    const subagent = tool_input?.subagent_type || '';
    const prompt = tool_input?.prompt || '';

    if (subagent) {
      description = `${subagent}-output`;
    } else if (prompt) {
      // Extract first few words from prompt
      const firstWords = prompt.split(' ').slice(0, 5).join('-');
      description = sanitize(firstWords);
    }
  } else if (tool_name === 'WebSearch' || tool_name === 'WebFetch') {
    // Use query or URL
    const query = tool_input?.query || tool_input?.url || '';
    if (query) {
      description = `web-${sanitize(query.split(' ').slice(0, 3).join('-'))}`;
    }
  }

  // Fall back to content-based inference
  if (!description) {
    description = extractKeywords(content);
  }

  return description || 'untargeted-output';
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string {
  // Simple keyword extraction - take first meaningful words
  const words = content
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 5)
    .join('-');

  return sanitize(words);
}

/**
 * Sanitize string for use in folder name
 */
function sanitize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/^-+|-+$/g, '');
}

// Run main function
main();
