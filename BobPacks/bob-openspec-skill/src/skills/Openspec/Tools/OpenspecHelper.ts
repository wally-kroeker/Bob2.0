#!/usr/bin/env bun

/**
 * OpenspecHelper.ts
 *
 * Helper utilities for working with OpenSpec specifications.
 * Provides functions for creating, reading, and managing spec proposals.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const OPENSPEC_DIR = 'openspec';
const CHANGES_DIR = join(OPENSPEC_DIR, 'changes');
const SPECS_DIR = join(OPENSPEC_DIR, 'specs');

/**
 * Check if OpenSpec is initialized in the current directory
 */
function isInitialized(): boolean {
  return existsSync(OPENSPEC_DIR);
}

/**
 * Generate a URL-safe change ID from a feature name
 * Example: "User Authentication" -> "user-authentication"
 */
function generateChangeId(featureName: string): string {
  return featureName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Create a new change proposal with scaffolded files
 */
function createProposal(changeId: string, featureName: string, description: string): void {
  const changeDir = join(CHANGES_DIR, changeId);

  if (existsSync(changeDir)) {
    throw new Error(`Change '${changeId}' already exists`);
  }

  mkdirSync(changeDir, { recursive: true });

  const currentDate = new Date().toISOString().split('T')[0];

  // Create proposal.md
  const proposalContent = `# ${featureName}

**Change ID:** ${changeId}
**Created:** ${currentDate}
**Status:** Proposal

## Overview

${description}

## Motivation

[Why this change is needed]

## Proposed Solution

[High-level approach to implementing this change]

## Success Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Risks & Considerations

[Potential issues, trade-offs, or technical debt]

## Related Changes

[Links to related specs or dependencies]
`;

  writeFileSync(join(changeDir, 'proposal.md'), proposalContent);

  // Create tasks.md
  const tasksContent = `# Implementation Tasks: ${featureName}

**Change ID:** ${changeId}

## Task Breakdown

### Phase 1: Planning & Design

- [ ] Review existing codebase for related functionality
- [ ] Design architecture/approach
- [ ] Identify dependencies

### Phase 2: Implementation

- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

### Phase 3: Testing & Validation

- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Manual testing

### Phase 4: Documentation

- [ ] Update code comments
- [ ] Update README or docs
- [ ] Add usage examples

## Notes

[Implementation notes, decisions, or reminders]
`;

  writeFileSync(join(changeDir, 'tasks.md'), tasksContent);

  console.log(`✓ Created proposal: ${changeDir}`);
  console.log(`  - proposal.md`);
  console.log(`  - tasks.md`);
}

/**
 * List all active change proposals
 */
function listChanges(): Array<{ id: string; title: string; path: string }> {
  if (!existsSync(CHANGES_DIR)) {
    return [];
  }

  const changes = readdirSync(CHANGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      const changeId = dirent.name;
      const proposalPath = join(CHANGES_DIR, changeId, 'proposal.md');

      let title = changeId;
      if (existsSync(proposalPath)) {
        const content = readFileSync(proposalPath, 'utf-8');
        const titleMatch = content.match(/^# (.+)$/m);
        if (titleMatch) {
          title = titleMatch[1];
        }
      }

      return {
        id: changeId,
        title,
        path: join(CHANGES_DIR, changeId)
      };
    });

  return changes;
}

/**
 * Read the content of a change proposal
 */
function readChange(changeId: string): { proposal: string; tasks: string } {
  const changeDir = join(CHANGES_DIR, changeId);

  if (!existsSync(changeDir)) {
    throw new Error(`Change '${changeId}' not found`);
  }

  const proposalPath = join(changeDir, 'proposal.md');
  const tasksPath = join(changeDir, 'tasks.md');

  const proposal = existsSync(proposalPath)
    ? readFileSync(proposalPath, 'utf-8')
    : '[proposal.md not found]';

  const tasks = existsSync(tasksPath)
    ? readFileSync(tasksPath, 'utf-8')
    : '[tasks.md not found]';

  return { proposal, tasks };
}

/**
 * Get task completion statistics
 */
function getTaskStats(changeId: string): { total: number; completed: number; percent: number } {
  const changeDir = join(CHANGES_DIR, changeId);
  const tasksPath = join(changeDir, 'tasks.md');

  if (!existsSync(tasksPath)) {
    return { total: 0, completed: 0, percent: 0 };
  }

  const content = readFileSync(tasksPath, 'utf-8');
  const lines = content.split('\n');

  const total = lines.filter(line => /^- \[[x ]\]/.test(line)).length;
  const completed = lines.filter(line => /^- \[x\]/.test(line)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percent };
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'check':
        console.log(isInitialized() ? 'Initialized' : 'Not initialized');
        break;

      case 'create': {
        const featureName = args[1];
        const description = args[2] || featureName;
        if (!featureName) {
          console.error('Usage: OpenspecHelper.ts create "Feature Name" "Description"');
          process.exit(1);
        }
        const changeId = generateChangeId(featureName);
        createProposal(changeId, featureName, description);
        break;
      }

      case 'list': {
        const changes = listChanges();
        if (changes.length === 0) {
          console.log('No active changes');
        } else {
          console.log(`Active changes (${changes.length}):\n`);
          changes.forEach(change => {
            console.log(`  - ${change.id}: ${change.title}`);
          });
        }
        break;
      }

      case 'read': {
        const changeId = args[1];
        if (!changeId) {
          console.error('Usage: OpenspecHelper.ts read <change-id>');
          process.exit(1);
        }
        const { proposal, tasks } = readChange(changeId);
        console.log('='.repeat(60));
        console.log('PROPOSAL');
        console.log('='.repeat(60));
        console.log(proposal);
        console.log('\n' + '='.repeat(60));
        console.log('TASKS');
        console.log('='.repeat(60));
        console.log(tasks);
        break;
      }

      case 'stats': {
        const changeId = args[1];
        if (!changeId) {
          console.error('Usage: OpenspecHelper.ts stats <change-id>');
          process.exit(1);
        }
        const stats = getTaskStats(changeId);
        console.log(`Tasks: ${stats.completed}/${stats.total} (${stats.percent}%)`);
        break;
      }

      case 'id': {
        const featureName = args.slice(1).join(' ');
        if (!featureName) {
          console.error('Usage: OpenspecHelper.ts id "Feature Name"');
          process.exit(1);
        }
        console.log(generateChangeId(featureName));
        break;
      }

      default:
        console.log(`OpenSpec Helper Tool

Usage:
  OpenspecHelper.ts check                           Check if initialized
  OpenspecHelper.ts create "Name" "Description"     Create new proposal
  OpenspecHelper.ts list                            List active changes
  OpenspecHelper.ts read <change-id>                Read a change
  OpenspecHelper.ts stats <change-id>               Get task statistics
  OpenspecHelper.ts id "Feature Name"               Generate change ID

Examples:
  bun run OpenspecHelper.ts create "User Auth" "Add JWT authentication"
  bun run OpenspecHelper.ts list
  bun run OpenspecHelper.ts read user-auth
  bun run OpenspecHelper.ts stats user-auth
`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.main) {
  main();
}

// Export functions for use in other modules
export {
  isInitialized,
  generateChangeId,
  createProposal,
  listChanges,
  readChange,
  getTaskStats,
};
