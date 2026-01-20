#!/usr/bin/env bun
/**
 * CreateCapture.ts
 * CLI tool to create new capture in Notion
 *
 * Usage:
 *   bun run CreateCapture.ts --title "Note" --content "..." --type Text
 */

import { notionClient, type CreateCaptureInput } from "./NotionClient.ts";

function printUsage() {
  console.log(`
Usage: bun run CreateCapture.ts --title <text> --content <text> --type <value> [options]

Required:
  --title <text>       Capture title (required)
  --content <text>     Capture content (required)
  --type <value>       Capture type: Text | Link | Image | File | Voice | Video (required)

Optional:
  --url <url>          Source URL (for Link, Image, Video types)
  --source <value>     Source: Telegram | Manual | Other (default: Manual)
  --status <value>     Status: Inbox | Processed | Archived (default: Inbox)
  --help               Show this help

Examples:
  # Create text note
  bun run CreateCapture.ts --title "Meeting Notes" --content "Discussed project timeline" --type Text

  # Create link capture
  bun run CreateCapture.ts --title "React Docs" --content "Official documentation" --type Link --url "https://react.dev"

  # Create with specific status
  bun run CreateCapture.ts --title "Archived Note" --content "Old content" --type Text --status Archived
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  const input: Partial<CreateCaptureInput> = {};

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--title":
        input.title = nextArg;
        i++;
        break;
      case "--content":
        input.content = nextArg;
        i++;
        break;
      case "--type":
        input.type = nextArg as any;
        i++;
        break;
      case "--url":
        input.url = nextArg;
        i++;
        break;
      case "--source":
        input.source = nextArg as any;
        i++;
        break;
      case "--status":
        input.status = nextArg as any;
        i++;
        break;
    }
  }

  // Validate required fields
  if (!input.title || !input.content || !input.type) {
    console.error("❌ Error: --title, --content, and --type are required");
    printUsage();
    process.exit(1);
  }

  console.log(`📝 Creating new capture...\n`);
  console.log("Details:");
  console.log(`  Title: ${input.title}`);
  console.log(`  Type: ${input.type}`);
  console.log(`  Status: ${input.status || "Inbox"}`);
  console.log(`  Source: ${input.source || "Manual"}`);
  if (input.url) {
    console.log(`  URL: ${input.url}`);
  }
  console.log();

  const capture = await notionClient.createCapture(input as CreateCaptureInput);

  console.log(`✅ Capture created successfully!\n`);
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

  console.log(`Content:\n${capture.content}\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n✨ View in Notion: https://notion.so/${capture.id.replace(/-/g, "")}`);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
