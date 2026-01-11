#!/usr/bin/env bun
/**
 * OPNsense Unbound DNS Management via REST API
 *
 * This tool provides programmatic access to OPNsense Unbound DNS host overrides.
 * Uses the OPNsense REST API to add, list, update, and delete DNS records.
 *
 * Usage:
 *   bun run OpnsenseDns.ts add --hostname host1 --domain infra.fablab.local --ip 10.10.10.10
 *   bun run OpnsenseDns.ts list
 *   bun run OpnsenseDns.ts delete --uuid <uuid>
 *   bun run OpnsenseDns.ts bulk-add --file records.json
 */

import { parseArgs } from "util";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";

// Types
interface HostOverride {
  enabled?: string;
  hostname?: string;
  domain?: string;
  rr?: string;
  server?: string;
  description?: string;
  uuid?: string;
}

interface ApiResponse {
  uuid?: string;
  result?: string;
  rows?: HostOverride[];
  [key: string]: unknown;
}

interface DnsRecord {
  hostname: string;
  domain: string;
  ip: string;
  description?: string;
}

// Load environment variables from .env file
function loadEnv(): { host: string; apiKey: string; apiSecret: string; verifySsl: boolean } {
  const skillDir = dirname(import.meta.path);
  const envPaths = [
    join(skillDir, "../skills/OpnsenseDns/data/.env"),
    join(process.env.PAI_DIR || `${process.env.HOME}/.claude`, "skills/OpnsenseDns/data/.env"),
  ];

  let envContent = "";
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, "utf-8");
      break;
    }
  }

  if (!envContent) {
    // Try loading from process.env directly
    const host = process.env.OPNSENSE_HOST;
    const apiKey = process.env.OPNSENSE_API_KEY;
    const apiSecret = process.env.OPNSENSE_API_SECRET;
    const verifySsl = process.env.OPNSENSE_VERIFY_SSL?.toLowerCase() === "true";

    if (host && apiKey && apiSecret) {
      return { host, apiKey, apiSecret, verifySsl };
    }

    console.error("Error: Missing API credentials.");
    console.error("Please configure one of:");
    console.error("  - $PAI_DIR/skills/OpnsenseDns/data/.env");
    console.error("  - Environment variables: OPNSENSE_HOST, OPNSENSE_API_KEY, OPNSENSE_API_SECRET");
    process.exit(1);
  }

  // Parse .env file
  const env: Record<string, string> = {};
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }

  const host = env.OPNSENSE_HOST;
  const apiKey = env.OPNSENSE_API_KEY;
  const apiSecret = env.OPNSENSE_API_SECRET;
  const verifySsl = env.OPNSENSE_VERIFY_SSL?.toLowerCase() === "true";

  if (!host || !apiKey || !apiSecret) {
    console.error("Error: Missing required environment variables in .env file.");
    console.error("Required: OPNSENSE_HOST, OPNSENSE_API_KEY, OPNSENSE_API_SECRET");
    process.exit(1);
  }

  return { host, apiKey, apiSecret, verifySsl };
}

/**
 * OPNsense Unbound DNS API Client
 */
class OPNsenseDNS {
  private host: string;
  private apiKey: string;
  private apiSecret: string;
  private verifySsl: boolean;
  private baseUrl: string;

  constructor() {
    const config = loadEnv();
    this.host = config.host;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.verifySsl = config.verifySsl;
    this.baseUrl = `https://${this.host}/api/unbound`;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
    return `Basic ${credentials}`;
  }

  private async request(method: string, endpoint: string, data?: object): Promise<ApiResponse> {
    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
    };

    if (data && method.toUpperCase() !== "GET") {
      options.body = JSON.stringify(data);
    }

    // Note: Bun's fetch doesn't have a rejectUnauthorized option like Node
    // For self-signed certs, you may need to set NODE_TLS_REJECT_UNAUTHORIZED=0
    if (!this.verifySsl) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Add a new DNS host override
   */
  async addHostOverride(
    hostname: string,
    domain: string,
    ip: string,
    description: string = "",
    enabled: boolean = true,
    rrType: string = "A"
  ): Promise<ApiResponse> {
    const data = {
      host: {
        enabled: enabled ? "1" : "0",
        hostname,
        domain,
        rr: rrType,
        server: ip,
        description,
      },
    };

    const result = await this.request("POST", "/settings/addHostOverride", data);
    console.log(`✓ Added: ${hostname}.${domain} → ${ip}`);
    return result;
  }

  /**
   * Get host override(s)
   */
  async getHostOverride(uuid?: string): Promise<ApiResponse> {
    const endpoint = uuid ? `/settings/getHostOverride/${uuid}` : "/settings/getHostOverride";
    return await this.request("GET", endpoint);
  }

  /**
   * Update existing host override
   */
  async setHostOverride(uuid: string, data: object): Promise<ApiResponse> {
    return await this.request("POST", `/settings/setHostOverride/${uuid}`, data);
  }

  /**
   * Delete host override
   */
  async deleteHostOverride(uuid: string): Promise<ApiResponse> {
    const result = await this.request("POST", `/settings/delHostOverride/${uuid}`);
    console.log(`✓ Deleted record: ${uuid}`);
    return result;
  }

  /**
   * Search/list all host overrides
   */
  async searchHostOverrides(): Promise<HostOverride[]> {
    const result = await this.request("GET", "/settings/searchHostOverride");
    return result.rows || [];
  }

  /**
   * Reconfigure Unbound service to apply changes
   */
  async reconfigure(): Promise<ApiResponse> {
    const result = await this.request("POST", "/service/reconfigure");
    console.log("✓ Unbound reconfigured");
    return result;
  }

  /**
   * Restart Unbound service
   */
  async restart(): Promise<ApiResponse> {
    const result = await this.request("POST", "/service/restart");
    console.log("✓ Unbound restarted");
    return result;
  }

  /**
   * Add multiple DNS records
   */
  async bulkAdd(records: DnsRecord[]): Promise<string[]> {
    const uuids: string[] = [];

    for (const record of records) {
      const result = await this.addHostOverride(
        record.hostname,
        record.domain,
        record.ip,
        record.description || ""
      );

      if (result.uuid) {
        uuids.push(result.uuid);
      }
    }

    return uuids;
  }
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.log(`
OPNsense Unbound DNS Management via API

Usage: bun run OpnsenseDns.ts <command> [options]

Commands:
  add           Add DNS host override
    --hostname    Hostname (e.g., host1)
    --domain      Domain (e.g., infra.fablab.local)
    --ip          IP address
    --description Optional description

  list          List all DNS host overrides
    --json        Output as JSON

  delete        Delete DNS host override
    --uuid        UUID of record to delete

  bulk-add      Add multiple DNS records from file
    --file        JSON file with DNS records

  reconfigure   Reconfigure Unbound service

  restart       Restart Unbound service

  help          Show this help message

Examples:
  bun run OpnsenseDns.ts add --hostname host1 --domain infra.fablab.local --ip 10.10.10.10
  bun run OpnsenseDns.ts list --json
  bun run OpnsenseDns.ts delete --uuid abc123
  bun run OpnsenseDns.ts bulk-add --file records.json
`);
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help" || args[0] === "--help") {
    printUsage();
    process.exit(0);
  }

  const command = args[0];

  // Initialize client
  const client = new OPNsenseDNS();

  switch (command) {
    case "add": {
      const { values } = parseArgs({
        args: args.slice(1),
        options: {
          hostname: { type: "string" },
          domain: { type: "string" },
          ip: { type: "string" },
          description: { type: "string", default: "" },
        },
        strict: true,
      });

      if (!values.hostname || !values.domain || !values.ip) {
        console.error("Error: --hostname, --domain, and --ip are required");
        process.exit(1);
      }

      await client.addHostOverride(
        values.hostname,
        values.domain,
        values.ip,
        values.description || ""
      );

      console.log("\n⚠️  MANUAL RESTART REQUIRED");
      console.log("To apply DNS changes, SSH to OPNsense and run:");
      console.log("  configctl unbound restart");
      break;
    }

    case "list": {
      const { values } = parseArgs({
        args: args.slice(1),
        options: {
          json: { type: "boolean", default: false },
        },
        strict: true,
      });

      const records = await client.searchHostOverrides();

      if (values.json) {
        console.log(JSON.stringify(records, null, 2));
      } else {
        console.log(`\nFound ${records.length} DNS host override(s):\n`);
        for (const record of records) {
          const enabled = record.enabled === "1" ? "✓" : "✗";
          const hostname = record.hostname || "";
          const domain = record.domain || "";
          const ip = record.server || "";
          const desc = record.description || "";
          const uuid = record.uuid || "";

          console.log(`${enabled} ${hostname}.${domain} → ${ip}`);
          if (desc) {
            console.log(`  Description: ${desc}`);
          }
          console.log(`  UUID: ${uuid}\n`);
        }
      }
      break;
    }

    case "delete": {
      const { values } = parseArgs({
        args: args.slice(1),
        options: {
          uuid: { type: "string" },
        },
        strict: true,
      });

      if (!values.uuid) {
        console.error("Error: --uuid is required");
        process.exit(1);
      }

      await client.deleteHostOverride(values.uuid);

      console.log("\n⚠️  MANUAL RESTART REQUIRED");
      console.log("To apply DNS changes, SSH to OPNsense and run:");
      console.log("  configctl unbound restart");
      break;
    }

    case "bulk-add": {
      const { values } = parseArgs({
        args: args.slice(1),
        options: {
          file: { type: "string" },
        },
        strict: true,
      });

      if (!values.file) {
        console.error("Error: --file is required");
        process.exit(1);
      }

      if (!existsSync(values.file)) {
        console.error(`Error: File not found: ${values.file}`);
        process.exit(1);
      }

      const records: DnsRecord[] = JSON.parse(readFileSync(values.file, "utf-8"));
      const uuids = await client.bulkAdd(records);

      console.log(`\n✓ Added ${uuids.length} DNS records`);
      console.log("\n⚠️  MANUAL RESTART REQUIRED");
      console.log("To apply DNS changes, SSH to OPNsense and run:");
      console.log("  configctl unbound restart");
      break;
    }

    case "reconfigure": {
      console.log("⚠️  API reconfigure endpoint may not be available");
      console.log("To apply DNS changes, SSH to OPNsense and run:");
      console.log("  configctl unbound restart");
      break;
    }

    case "restart": {
      console.log("⚠️  API restart endpoint may not be available");
      console.log("To restart Unbound, SSH to OPNsense and run:");
      console.log("  configctl unbound restart");
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

