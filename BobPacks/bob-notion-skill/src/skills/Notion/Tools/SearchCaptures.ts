#!/usr/bin/env bun
/**
 * SearchCaptures.ts
 * CLI tool to search Notion Captures database
 *
 * Usage:
 *   bun run SearchCaptures.ts --status Inbox
 *   bun run SearchCaptures.ts --type Link --limit 10
 *   bun run SearchCaptures.ts --query "react"
 *   bun run SearchCaptures.ts --startDate 2026-01-01
 */

import { notionClient, type CaptureFilter } from "./NotionClient.ts";

function printUsage() {
  console.log(`
Usage: bun run SearchCaptures.ts [options]

Options:
  --status <value>     Filter by status (Inbox | Processed | Archived)
  --type <value>       Filter by type (Text | Link | Image | File | Voice | Video)
  --source <value>     Filter by source (Telegram | Manual | Other)
  --query <text>       Search text in title and content
  --startDate <date>   Filter from date (ISO format: 2026-01-01)
  --endDate <date>     Filter to date (ISO format: 2026-01-31)
  --limit <number>     Max results (default: 100)
  --help               Show this help

Examples:
  # Show all inbox items
  bun run SearchCaptures.ts --status Inbox

  # Find links in inbox
  bun run SearchCaptures.ts --status Inbox --type Link

  # Search for keyword
  bun run SearchCaptures.ts --query "react hooks"

  # Show captures from last week
  bun run SearchCaptures.ts --startDate 2026-01-12 --endDate 2026-01-19

  # Limit results
  bun run SearchCaptures.ts --status Inbox --limit 5
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  const filter: CaptureFilter = {};
  let limit = 100;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--status":
        filter.status = nextArg as any;
        i++;
        break;
      case "--type":
        filter.type = nextArg as any;
        i++;
        break;
      case "--source":
        filter.source = nextArg as any;
        i++;
        break;
      case "--query":
        filter.query = nextArg;
        i++;
        break;
      case "--startDate":
        filter.startDate = nextArg;
        i++;
        break;
      case "--endDate":
        filter.endDate = nextArg;
        i++;
        break;
      case "--limit":
        limit = parseInt(nextArg, 10);
        i++;
        break;
    }
  }

  console.log("🔍 Searching Notion Captures...\n");

  const captures = await notionClient.queryCaptures(filter, limit);

  if (captures.length === 0) {
    console.log("No captures found matching filters.");
    process.exit(0);
  }

  console.log(`Found ${captures.length} capture(s):\n`);

  for (const capture of captures) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📄 ${capture.title}`);
    console.log(`   ID: ${capture.id}`);
    console.log(`   Type: ${capture.type}`);
    console.log(`   Status: ${capture.status}`);
    console.log(`   Source: ${capture.source}`);
    console.log(`   Captured: ${new Date(capture.capturedAt).toLocaleString()}`);

    if (capture.url) {
      console.log(`   URL: ${capture.url}`);
    }

    if (capture.content) {
      const preview = capture.content.substring(0, 150);
      const ellipsis = capture.content.length > 150 ? "..." : "";
      console.log(`   Content: ${preview}${ellipsis}`);
    }

    console.log();
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\nTotal: ${captures.length} capture(s)`);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
