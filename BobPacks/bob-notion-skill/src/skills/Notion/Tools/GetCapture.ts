#!/usr/bin/env bun
/**
 * GetCapture.ts
 * CLI tool to get single capture by ID
 *
 * Usage:
 *   bun run GetCapture.ts --id <page-id>
 */

import { notionClient } from "./NotionClient.ts";

function printUsage() {
  console.log(`
Usage: bun run GetCapture.ts --id <page-id>

Options:
  --id <value>    Notion page ID (required)
  --help          Show this help

Examples:
  # Get capture by ID
  bun run GetCapture.ts --id 12345678-1234-1234-1234-123456789012
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

  console.log(`🔍 Fetching capture ${pageId}...\n`);

  const capture = await notionClient.getCapture(pageId);

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
    console.log(`Content:\n${capture.content}\n`);
  } else {
    console.log(`Content: (empty)\n`);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
