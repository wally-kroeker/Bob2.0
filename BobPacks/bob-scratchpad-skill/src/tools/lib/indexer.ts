/**
 * Scratchpad Index Manager
 *
 * Maintains .scratchpad-index.json for fast search and listing operations.
 */

import { existsSync } from 'fs';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

// Environment configuration
const PAI_DIR = process.env.PAI_DIR || `${process.env.HOME}/.claude`;
const SCRATCHPAD_DIR = process.env.SCRATCHPAD_DIR || join(PAI_DIR, 'scratchpad');
const INDEX_FILE = join(SCRATCHPAD_DIR, '.scratchpad-index.json');

export interface IndexEntry {
  path: string;           // Folder name with timestamp
  created: string;        // ISO timestamp
  description: string;    // Human-readable description
  archived: boolean;      // Is this in archive/?
  archivedDate?: string;  // When was it archived?
  archivedTo?: string;    // Which archive folder? (e.g., "2024-10/")
  tags: string[];         // Keywords for search
  size_kb: number;        // Size in KB
}

export interface ScratchpadIndex {
  entries: IndexEntry[];
  last_archive_check: string;
  version: string;
}

/**
 * Get the current index, creating it if it doesn't exist
 */
export async function getIndex(): Promise<ScratchpadIndex> {
  // Check if index exists
  if (!existsSync(INDEX_FILE)) {
    // Create new index
    const emptyIndex: ScratchpadIndex = {
      entries: [],
      last_archive_check: new Date().toISOString(),
      version: '1.0.0'
    };

    // Try to build from filesystem
    console.warn('Index not found. Rebuilding from filesystem...');
    await rebuildIndex();

    // Read newly created index
    return await getIndex();
  }

  try {
    const content = await readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    console.error(`Error reading index: ${error.message}`);
    console.warn('Creating new empty index...');

    const emptyIndex: ScratchpadIndex = {
      entries: [],
      last_archive_check: new Date().toISOString(),
      version: '1.0.0'
    };

    await writeIndex(emptyIndex);
    return emptyIndex;
  }
}

/**
 * Write index to disk
 */
export async function writeIndex(index: ScratchpadIndex): Promise<void> {
  const content = JSON.stringify(index, null, 2);
  await writeFile(INDEX_FILE, content, 'utf-8');
}

/**
 * Add new entry to index
 */
export async function addEntry(entry: Omit<IndexEntry, 'tags'>): Promise<void> {
  const index = await getIndex();

  // Check if entry already exists
  const existingIndex = index.entries.findIndex(e => e.path === entry.path);
  if (existingIndex !== -1) {
    // Update existing entry
    index.entries[existingIndex] = { ...entry, tags: [] };
  } else {
    // Add new entry
    index.entries.push({ ...entry, tags: [] });
  }

  await writeIndex(index);
}

/**
 * Update existing entry
 */
export async function updateEntry(path: string, updates: Partial<IndexEntry>): Promise<void> {
  const index = await getIndex();

  const entryIndex = index.entries.findIndex(e => e.path === path);
  if (entryIndex === -1) {
    throw new Error(`Entry not found: ${path}`);
  }

  // Merge updates
  index.entries[entryIndex] = {
    ...index.entries[entryIndex],
    ...updates
  };

  await writeIndex(index);
}

/**
 * Remove entry from index
 */
export async function removeEntry(path: string): Promise<void> {
  const index = await getIndex();

  index.entries = index.entries.filter(e => e.path !== path);

  await writeIndex(index);
}

/**
 * Search index
 */
export async function searchIndex(query: string, includeArchive: boolean = false): Promise<IndexEntry[]> {
  const index = await getIndex();

  const lowerQuery = query.toLowerCase();

  // Filter entries
  let results = index.entries.filter(entry => {
    // Skip archived if not requested
    if (!includeArchive && entry.archived) return false;

    // Search in description and tags
    const inDescription = entry.description.toLowerCase().includes(lowerQuery);
    const inTags = entry.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));

    return inDescription || inTags;
  });

  // Sort: non-archived first, then by date descending
  results.sort((a, b) => {
    if (a.archived !== b.archived) {
      return a.archived ? 1 : -1; // Non-archived first
    }
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  return results;
}

/**
 * Rebuild index from filesystem
 */
export async function rebuildIndex(): Promise<void> {
  console.log(`Scanning scratchpad directory: ${SCRATCHPAD_DIR}`);

  const newIndex: ScratchpadIndex = {
    entries: [],
    last_archive_check: new Date().toISOString(),
    version: '1.0.0'
  };

  // Scan active scratchpad
  await scanDirectory(SCRATCHPAD_DIR, newIndex, false);

  // Scan archive
  const archiveDir = join(SCRATCHPAD_DIR, 'archive');
  if (existsSync(archiveDir)) {
    await scanArchiveDirectory(archiveDir, newIndex);
  }

  // Write new index
  await writeIndex(newIndex);

  console.log(`Index rebuilt: ${newIndex.entries.length} entries`);
}

/**
 * Scan a directory for scratchpad folders
 */
async function scanDirectory(dir: string, index: ScratchpadIndex, archived: boolean): Promise<void> {
  try {
    const items = await readdir(dir);

    for (const item of items) {
      const itemPath = join(dir, item);

      // Skip hidden files and archive directory
      if (item.startsWith('.') || item === 'archive') continue;

      // Check if directory
      const stats = await stat(itemPath);
      if (!stats.isDirectory()) continue;

      // Parse timestamp from folder name
      const match = item.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{6})_(.+)$/);
      if (!match) {
        console.warn(`Skipping folder with invalid name format: ${item}`);
        continue;
      }

      const [_, year, month, day, time, description] = match;
      const timestamp = `${year}-${month}-${day}T${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6)}.000Z`;

      // Calculate size
      let size_kb = 0;
      try {
        const readmePath = join(itemPath, 'README.md');
        if (existsSync(readmePath)) {
          const readmeStats = await stat(readmePath);
          size_kb = Math.round(readmeStats.size / 1024);
        }
      } catch (error) {
        // Ignore size errors
      }

      // Add entry
      index.entries.push({
        path: item,
        created: timestamp,
        description,
        archived,
        tags: [],
        size_kb
      });
    }
  } catch (error: any) {
    console.error(`Error scanning directory ${dir}: ${error.message}`);
  }
}

/**
 * Scan archive directory (YYYY-MM subdirectories)
 */
async function scanArchiveDirectory(archiveDir: string, index: ScratchpadIndex): Promise<void> {
  try {
    const months = await readdir(archiveDir);

    for (const monthDir of months) {
      const monthPath = join(archiveDir, monthDir);

      // Check if directory
      const stats = await stat(monthPath);
      if (!stats.isDirectory()) continue;

      // Parse YYYY-MM format
      if (!/^\d{4}-\d{2}$/.test(monthDir)) {
        console.warn(`Skipping archive folder with invalid name: ${monthDir}`);
        continue;
      }

      // Scan this month's archived folders
      const items = await readdir(monthPath);

      for (const item of items) {
        const itemPath = join(monthPath, item);

        // Check if directory
        const itemStats = await stat(itemPath);
        if (!itemStats.isDirectory()) continue;

        // Parse timestamp from folder name
        const match = item.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{6})_(.+)$/);
        if (!match) {
          console.warn(`Skipping archived folder with invalid name: ${item}`);
          continue;
        }

        const [_, year, month, day, time, description] = match;
        const timestamp = `${year}-${month}-${day}T${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6)}.000Z`;

        // Calculate size
        let size_kb = 0;
        try {
          const readmePath = join(itemPath, 'README.md');
          if (existsSync(readmePath)) {
            const readmeStats = await stat(readmePath);
            size_kb = Math.round(readmeStats.size / 1024);
          }
        } catch (error) {
          // Ignore size errors
        }

        // Add entry
        index.entries.push({
          path: item,
          created: timestamp,
          description,
          archived: true,
          archivedDate: new Date().toISOString(), // We don't know exact archive date
          archivedTo: monthDir,
          tags: [],
          size_kb
        });
      }
    }
  } catch (error: any) {
    console.error(`Error scanning archive directory: ${error.message}`);
  }
}

// Export for use as library
export default {
  getIndex,
  writeIndex,
  addEntry,
  updateEntry,
  removeEntry,
  searchIndex,
  rebuildIndex
};
