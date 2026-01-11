#!/usr/bin/env bun

/**
 * Scratchpad Manager - Core orchestrator for scratchpad operations
 *
 * Provides save, search, list, and archive functionality for the scratchpad workspace.
 */

import { existsSync } from 'fs';
import { mkdir, readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';
import { addEntry, searchIndex, rebuildIndex as rebuildIndexLib, getIndex } from './lib/indexer.ts';
import { archiveOldContent as archiveLib } from './lib/archiver.ts';

// Environment configuration
const PAI_DIR = process.env.PAI_DIR || `${process.env.HOME}/.claude`;
const SCRATCHPAD_DIR = process.env.SCRATCHPAD_DIR || join(PAI_DIR, 'scratchpad');
const DA = process.env.DA || 'AI';

interface SaveOptions {
  content: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface SearchOptions {
  query: string;
  includeArchive?: boolean;
  limit?: number;
}

interface ListOptions {
  daysBack?: number;
  limit?: number;
  includeArchive?: boolean;
}

interface ArchiveOptions {
  daysThreshold?: number;
  dryRun?: boolean;
}

/**
 * Save content to scratchpad
 */
export async function save(options: SaveOptions): Promise<string> {
  const { content, description, metadata = {} } = options;

  // Validate content
  if (!content || content.trim().length < 10) {
    throw new Error('Content too short to save. Minimum 10 characters required.');
  }

  // Generate timestamp
  const now = new Date();
  const timestamp = formatTimestamp(now);

  // Sanitize description
  const sanitizedDesc = description ? sanitizeDescription(description) : 'untitled';

  // Create folder name
  const folderName = `${timestamp}_${sanitizedDesc}`;
  const folderPath = join(SCRATCHPAD_DIR, folderName);

  // Check for collision (unlikely but possible)
  if (existsSync(folderPath)) {
    const counter = 2;
    const altFolderName = `${folderName}-${counter}`;
    return save({ content, description: `${sanitizedDesc}-${counter}`, metadata });
  }

  // Create folder
  await mkdir(folderPath, { recursive: true });

  // Generate README.md with metadata
  const readme = generateReadme({
    title: description || 'Untitled',
    created: now.toISOString(),
    agent: DA,
    metadata,
    content
  });

  // Save README.md
  const readmePath = join(folderPath, 'README.md');
  await writeFile(readmePath, readme, 'utf-8');

  // Calculate size
  const size = Buffer.byteLength(readme, 'utf-8');

  // Add to index
  await addEntry({
    path: folderName,
    created: now.toISOString(),
    description: sanitizedDesc,
    archived: false,
    tags: [],
    size_kb: Math.round(size / 1024)
  });

  return folderPath;
}

/**
 * Search scratchpad
 */
export async function search(options: SearchOptions): Promise<any[]> {
  const { query, includeArchive = false, limit = 20 } = options;

  if (!query || query.trim().length === 0) {
    throw new Error('Search query required');
  }

  // Use index for faster search
  const results = await searchIndex(query, includeArchive);

  // Limit results
  return results.slice(0, limit);
}

/**
 * List recent scratchpad items
 */
export async function list(options: ListOptions = {}): Promise<any[]> {
  const { daysBack = 30, limit = 20, includeArchive = false } = options;

  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Get index
  const index = await getIndex();

  // Filter by date and archive status
  let entries = index.entries.filter(entry => {
    if (!includeArchive && entry.archived) return false;
    const entryDate = new Date(entry.created);
    return entryDate >= cutoffDate;
  });

  // Sort by date descending
  entries.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  // Limit
  return entries.slice(0, limit);
}

/**
 * Archive old content
 */
export async function archive(options: ArchiveOptions = {}): Promise<any> {
  const { daysThreshold = 90, dryRun = true } = options;

  return await archiveLib(daysThreshold, dryRun);
}

/**
 * Rebuild index from filesystem
 */
export async function rebuildIndex(): Promise<void> {
  await rebuildIndexLib();
}

// ===== Helper Functions =====

/**
 * Format timestamp as YYYY-MM-DD-HHMMSS
 */
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

/**
 * Sanitize description for folder name
 */
function sanitizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Remove duplicate hyphens
    .substring(0, 50)              // Limit length
    .replace(/^-+|-+$/g, '');      // Trim hyphens
}

/**
 * Generate README.md content with metadata
 */
function generateReadme(params: {
  title: string;
  created: string;
  agent: string;
  metadata: Record<string, any>;
  content: string;
}): string {
  const { title, created, agent, metadata, content } = params;

  const createdFormatted = new Date(created).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  let readme = `# ${title}\n\n`;
  readme += `**Created**: ${createdFormatted}\n`;
  readme += `**Agent**: ${agent}\n`;

  // Add metadata
  if (metadata.session_id) {
    readme += `**Session**: ${metadata.session_id}\n`;
  }
  if (metadata.context) {
    readme += `**Context**: ${metadata.context}\n`;
  }

  readme += `\n---\n\n`;
  readme += content;

  return readme;
}

// ===== CLI Interface =====

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'save': {
        const content = args[1] || 'Test content';
        const description = args[2];
        const path = await save({ content, description });
        console.log(`Saved to: ${path}`);
        break;
      }

      case 'search': {
        const query = args[1];
        if (!query) {
          console.error('Usage: ScratchpadManager.ts search <query> [--include-archive]');
          process.exit(1);
        }
        const includeArchive = args.includes('--include-archive');
        const results = await search({ query, includeArchive });
        console.log(`Found ${results.length} results:`);
        results.forEach((result, index) => {
          console.log(`\n${index + 1}. ${result.description}`);
          console.log(`   Created: ${new Date(result.created).toLocaleDateString()}`);
          if (result.archived) {
            console.log(`   Location: archive/${result.archivedTo}`);
          }
        });
        break;
      }

      case 'list': {
        const daysBackArg = args.find(arg => arg.startsWith('--days='));
        const daysBack = daysBackArg ? parseInt(daysBackArg.split('=')[1]) : 30;
        const includeArchive = args.includes('--include-archive');

        const items = await list({ daysBack, includeArchive });
        console.log(`Recent scratchpad items (last ${daysBack} days):\n`);
        items.forEach(item => {
          const date = new Date(item.created).toLocaleDateString();
          const archived = item.archived ? ' (archived)' : '';
          console.log(`${date}  ${item.description}${archived}`);
        });
        console.log(`\nTotal: ${items.length} items`);
        break;
      }

      case 'archive': {
        const dryRun = !args.includes('--execute');
        const thresholdArg = args.find(arg => arg.startsWith('--threshold='));
        const daysThreshold = thresholdArg ? parseInt(thresholdArg.split('=')[1]) : 90;

        const result = await archive({ daysThreshold, dryRun });
        if (dryRun) {
          console.log(`Would archive ${result.count} items (dry run)`);
          console.log('\nRun with --execute to perform archival');
        } else {
          console.log(`Archived ${result.count} items`);
        }
        break;
      }

      case 'rebuild-index': {
        console.log('Rebuilding scratchpad index...');
        await rebuildIndex();
        console.log('Index rebuilt successfully');
        break;
      }

      default:
        console.log('Scratchpad Manager - Core tool for scratchpad operations');
        console.log('\nUsage:');
        console.log('  save <content> [description]     - Save content to scratchpad');
        console.log('  search <query> [--include-archive] - Search scratchpad');
        console.log('  list [--days=N] [--include-archive] - List recent items');
        console.log('  archive [--threshold=N] [--execute] - Archive old items');
        console.log('  rebuild-index                    - Rebuild search index');
        break;
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.main) {
  main();
}

// Export functions for use as library
export default {
  save,
  search,
  list,
  archive,
  rebuildIndex
};
