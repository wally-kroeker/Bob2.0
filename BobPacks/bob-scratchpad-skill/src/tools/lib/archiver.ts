/**
 * Scratchpad Archiver
 *
 * Age-based archival of old scratchpad content to keep the active workspace clean.
 */

import { existsSync } from 'fs';
import { readdir, rename, mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { updateEntry, getIndex, writeIndex } from './indexer.ts';

// Environment configuration
const PAI_DIR = process.env.PAI_DIR || `${process.env.HOME}/.claude`;
const SCRATCHPAD_DIR = process.env.SCRATCHPAD_DIR || join(PAI_DIR, 'scratchpad');

export interface ArchiveCandidate {
  path: string;
  folderName: string;
  created: Date;
  age: number;        // Days old
  sizeKB: number;
  description: string;
  archiveTo: string;  // Archive destination (e.g., "archive/2024-10/")
}

export interface ArchiveResult {
  count: number;
  candidates: ArchiveCandidate[];
  archived?: string[]; // Only populated if not dry run
  errors?: Array<{ folder: string; error: string }>;
}

/**
 * Archive old content
 *
 * @param daysThreshold - Age threshold in days (default: 90)
 * @param dryRun - If true, only show what would be archived (default: true)
 */
export async function archiveOldContent(
  daysThreshold: number = 90,
  dryRun: boolean = true
): Promise<ArchiveResult> {
  console.log(`Checking for content older than ${daysThreshold} days...`);

  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

  console.log(`Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);

  // Find old folders
  const candidates = await findOldFolders(cutoffDate);

  if (candidates.length === 0) {
    console.log('No items found that need archiving.');
    return { count: 0, candidates: [] };
  }

  // Show candidates
  console.log(`\nFound ${candidates.length} item(s) to archive:\n`);
  candidates.forEach((candidate, index) => {
    console.log(`${index + 1}. ${candidate.folderName}`);
    console.log(`   Age: ${candidate.age} days`);
    console.log(`   Size: ${formatSize(candidate.sizeKB)}`);
    console.log(`   → ${candidate.archiveTo}\n`);
  });

  // If dry run, stop here
  if (dryRun) {
    console.log(`Total: ${candidates.length} items, ${formatSize(getTotalSize(candidates))}`);
    console.log('\nRun with --execute to perform archival.');
    return { count: candidates.length, candidates };
  }

  // Execute archival
  console.log('Executing archival...\n');
  const archived: string[] = [];
  const errors: Array<{ folder: string; error: string }> = [];

  for (const candidate of candidates) {
    try {
      await archiveFolder(candidate);
      archived.push(candidate.folderName);
      console.log(`✓ Moved to ${candidate.archiveTo}`);
    } catch (error: any) {
      errors.push({ folder: candidate.folderName, error: error.message });
      console.error(`✗ Failed to move ${candidate.folderName}: ${error.message}`);
    }
  }

  // Update last archive check
  const index = await getIndex();
  index.last_archive_check = new Date().toISOString();
  await writeIndex(index);

  console.log(`\nArchival complete: ${archived.length} items archived`);
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} items failed to archive`);
  }

  return { count: archived.length, candidates, archived, errors };
}

/**
 * Find folders older than cutoff date
 */
async function findOldFolders(cutoffDate: Date): Promise<ArchiveCandidate[]> {
  const candidates: ArchiveCandidate[] = [];

  try {
    const items = await readdir(SCRATCHPAD_DIR);

    for (const item of items) {
      const itemPath = join(SCRATCHPAD_DIR, item);

      // Skip hidden files and archive directory
      if (item.startsWith('.') || item === 'archive') continue;

      // Check if directory
      const stats = await stat(itemPath);
      if (!stats.isDirectory()) continue;

      // Parse timestamp from folder name
      const timestamp = parseTimestamp(item);
      if (!timestamp) {
        console.warn(`Skipping folder with invalid name format: ${item}`);
        continue;
      }

      const folderDate = new Date(timestamp);

      // Check if older than cutoff
      if (folderDate >= cutoffDate) continue;

      // Calculate age in days
      const age = Math.floor((Date.now() - folderDate.getTime()) / (1000 * 60 * 60 * 24));

      // Extract description
      const description = item.split('_').slice(1).join('_') || 'untitled';

      // Calculate size
      let sizeKB = 0;
      try {
        const readmePath = join(itemPath, 'README.md');
        if (existsSync(readmePath)) {
          const readmeStats = await stat(readmePath);
          sizeKB = Math.round(readmeStats.size / 1024);
        }
      } catch (error) {
        // Ignore size errors
      }

      // Determine archive destination
      const year = folderDate.getFullYear();
      const month = String(folderDate.getMonth() + 1).padStart(2, '0');
      const archiveSubdir = `${year}-${month}`;
      const archiveTo = `archive/${archiveSubdir}/`;

      candidates.push({
        path: itemPath,
        folderName: item,
        created: folderDate,
        age,
        sizeKB,
        description,
        archiveTo
      });
    }
  } catch (error: any) {
    console.error(`Error scanning scratchpad directory: ${error.message}`);
  }

  // Sort by age descending (oldest first)
  candidates.sort((a, b) => b.age - a.age);

  return candidates;
}

/**
 * Archive a single folder
 */
async function archiveFolder(candidate: ArchiveCandidate): Promise<void> {
  const { path, folderName, archiveTo } = candidate;

  // Create archive directory
  const archiveDir = join(SCRATCHPAD_DIR, archiveTo);
  await mkdir(archiveDir, { recursive: true });

  // Destination path
  let destPath = join(archiveDir, folderName);

  // Check for collision
  if (existsSync(destPath)) {
    console.warn(`⚠️  ${folderName} already exists in archive, appending -duplicate`);
    destPath = join(archiveDir, `${folderName}-duplicate`);
  }

  // Move folder
  await rename(path, destPath);

  // Update index
  try {
    await updateEntry(folderName, {
      archived: true,
      archivedDate: new Date().toISOString(),
      archivedTo: archiveTo
    });
  } catch (error: any) {
    console.warn(`⚠️  Could not update index for ${folderName}: ${error.message}`);
  }
}

/**
 * Parse timestamp from folder name
 */
function parseTimestamp(folderName: string): string | null {
  // Extract: "2024-10-21-205742_description" → "2024-10-21T20:57:42.000Z"
  const match = folderName.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{6})/);
  if (!match) return null;

  const [_, year, month, day, time] = match;
  const hours = time.substring(0, 2);
  const minutes = time.substring(2, 4);
  const seconds = time.substring(4, 6);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}

/**
 * Format size in human-readable format
 */
function formatSize(kb: number): string {
  if (kb < 1024) {
    return `${kb} KB`;
  } else {
    const mb = (kb / 1024).toFixed(1);
    return `${mb} MB`;
  }
}

/**
 * Calculate total size of candidates
 */
function getTotalSize(candidates: ArchiveCandidate[]): number {
  return candidates.reduce((sum, c) => sum + c.sizeKB, 0);
}

// Export for use as library
export default {
  archiveOldContent
};
