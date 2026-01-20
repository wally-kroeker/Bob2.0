#!/usr/bin/env bun
/**
 * UpdateCapture.ts
 * CLI tool to update capture properties
 *
 * Usage:
 *   bun run UpdateCapture.ts --id <page-id> --status Processed
 *   bun run UpdateCapture.ts --id <page-id> --title "New Title" --content "New content"
 */

import { notionClient, type UpdateCaptureInput } from "./NotionClient.ts";

function printUsage() {
  console.log(`
Usage: bun run UpdateCapture.ts --id <page-id> [options]

Required:
  --id <value>         Notion page ID (required)

Optional:
  --title <text>       Update title
  --content <text>     Update content
  --status <value>     Update status (Inbox | Processed | Archived)
  --type <value>       Update type (Text | Link | Image | File | Voice | Video)
  --help               Show this help

Examples:
  # Mark as processed
  bun run UpdateCapture.ts --id abc123 --status Processed

  # Update title and content
  bun run UpdateCapture.ts --id abc123 --title "New Title" --content "Updated content"

  # Change type
  bun run UpdateCapture.ts --id abc123 --type Link
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  const idIndex = args.indexOf("--id");
  if (idIndex === -1 || !args[idIndex + 1]) {
    console.error("❌ Error: --id parameter is required");
    printUsage();
    process.exit(1);
  }

  const pageId = args[idIndex + 1];
  const updates: UpdateCaptureInput = {};

  // Parse update arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--title":
        updates.title = nextArg;
        i++;
        break;
      case "--content":
        updates.content = nextArg;
        i++;
        break;
      case "--status":
        updates.status = nextArg as any;
        i++;
        break;
      case "--type":
        updates.type = nextArg as any;
        i++;
        break;
    }
  }

  if (Object.keys(updates).length === 0) {
    console.error("❌ Error: At least one update parameter is required (--title, --content, --status, or --type)");
    printUsage();
    process.exit(1);
  }

  console.log(`🔄 Updating capture ${pageId}...\n`);
  console.log("Updates:");
  for (const [key, value] of Object.entries(updates)) {
    console.log(`  ${key}: ${value}`);
  }
  console.log();

  const capture = await notionClient.updateCapture(pageId, updates);

  console.log(`✅ Capture updated successfully!\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📄 ${capture.title}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`ID: ${capture.id}`);
  console.log(`Type: ${capture.type}`);
  console.log(`Status: ${capture.status}`);
  console.log(`Source: ${capture.source}`);
  console.log(`Captured: ${new Date(capture.capturedAt).toLocaleString()}\n`);

  if (capture.url) {
    console.log(`URL: ${capture.url}\n`);
  }

  if (capture.content) {
    const preview = capture.content.substring(0, 200);
    const ellipsis = capture.content.length > 200 ? "..." : "";
    console.log(`Content: ${preview}${ellipsis}\n`);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
