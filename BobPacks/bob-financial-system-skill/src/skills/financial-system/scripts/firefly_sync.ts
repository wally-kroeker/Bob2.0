#!/usr/bin/env bun
/**
 * Firefly III Sync Script
 *
 * Fetches current month transactions from Firefly III API and exports to markdown cache.
 *
 * Usage:
 *    bun run firefly_sync.ts                    # Sync current month
 *    bun run firefly_sync.ts --month 2025-10   # Sync specific month
 *    bun run firefly_sync.ts --all              # Sync all months
 */

import { parseArgs } from "util";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

// ============================================================================
// Types
// ============================================================================

interface FireflyAccount {
  id: string;
  type: string;
  attributes: {
    name: string;
    type: string;
    current_balance: string;
  };
}

interface FireflyTransaction {
  id: string;
  type: string;
  attributes: {
    date: string;
    description: string;
    amount: string;
    category_name?: string;
    budget_name?: string;
    tags?: string[];
    transactions?: Array<{
      amount: string;
      description: string;
    }>;
  };
}

interface FormattedTransaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  budget: string;
}

type EntityType = "personal" | "goodfields" | "fablab";

// ============================================================================
// Custom Error Class
// ============================================================================

class FireflySyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FireflySyncError";
  }
}

// ============================================================================
// Firefly Sync Client
// ============================================================================

class FireflySync {
  private apiUrl: string;
  private apiToken: string;
  private headers: Record<string, string>;
  private dataDir: string;
  private personalDir: string;
  private goodfieldsDir: string;
  private fablabDir: string;
  private accounts: Map<string, string>;
  private accountToEntity: Map<string, EntityType>;

  constructor(apiUrl: string, apiToken: string, dataDir?: string) {
    this.apiUrl = apiUrl.replace(/\/$/, "");
    this.apiToken = apiToken;
    this.headers = {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    };

    // Set data directory
    if (!dataDir) {
      const scriptDir = import.meta.dir;
      dataDir = join(scriptDir, "..", "data");
    }
    this.dataDir = dataDir;

    // Set entity subdirectories
    this.personalDir = join(this.dataDir, "personal");
    this.goodfieldsDir = join(this.dataDir, "goodfields");
    this.fablabDir = join(this.dataDir, "fablab");

    // Initialize maps
    this.accounts = new Map();
    this.accountToEntity = new Map();
  }

  /**
   * Initialize data directories
   */
  async initializeDirectories(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    await mkdir(this.personalDir, { recursive: true });
    await mkdir(this.goodfieldsDir, { recursive: true });
    await mkdir(this.fablabDir, { recursive: true });
  }

  /**
   * Make GET request to Firefly API
   */
  private async get(endpoint: string, params?: Record<string, string>): Promise<any> {
    const url = new URL(`${this.apiUrl}/api/v1${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new FireflySyncError(`API error on ${endpoint}: ${error}`);
    }
  }

  /**
   * Discover asset accounts and map to entities
   */
  async discoverAccounts(): Promise<void> {
    try {
      const data = await this.get("/accounts", { type: "asset" });

      if (!data.data || data.data.length === 0) {
        throw new FireflySyncError("No accounts found in Firefly");
      }

      for (const account of data.data as FireflyAccount[]) {
        const accountId = account.id;
        const accountName = account.attributes.name;
        this.accounts.set(accountId, accountName);

        // Map account name to entity
        const nameLower = accountName.toLowerCase();
        let entity: EntityType;

        if (nameLower.includes("personal") || nameLower.includes("checking")) {
          entity = "personal";
        } else if (nameLower.includes("goodfields") || nameLower.includes("business")) {
          entity = "goodfields";
        } else if (nameLower.includes("fablab") || nameLower.includes("operations")) {
          entity = "fablab";
        } else {
          // Default to personal if can't determine
          entity = "personal";
          console.log(
            `Warning: Account '${accountName}' mapped to 'personal' (ambiguous name)`
          );
        }

        this.accountToEntity.set(accountId, entity);
      }

      console.log(`Discovered ${this.accounts.size} accounts:`);
      for (const [accId, accName] of this.accounts) {
        const entity = this.accountToEntity.get(accId);
        console.log(`  - ${accName} (${entity})`);
      }
    } catch (error) {
      console.error(`Error discovering accounts: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch transactions for account in date range
   */
  async fetchTransactions(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<FireflyTransaction[]> {
    const transactions: FireflyTransaction[] = [];
    let page = 1;

    while (true) {
      const data = await this.get(`/accounts/${accountId}/transactions`, {
        start: startDate,
        end: endDate,
        page: page.toString(),
      });

      if (!data.data || data.data.length === 0) {
        break;
      }

      transactions.push(...data.data);

      // Check if there are more pages
      const totalPages = data.meta?.pagination?.total_pages || 0;
      if (totalPages <= page) {
        break;
      }

      page++;
    }

    return transactions;
  }

  /**
   * Extract relevant fields from transaction
   */
  formatTransaction(transaction: FireflyTransaction): FormattedTransaction {
    const attrs = transaction.attributes;

    // Firefly III nests transaction details inside attributes.transactions[]
    const txn = attrs.transactions?.[0];
    
    // Get transaction amount (from nested transaction or fallback to attributes)
    let amount = 0;
    if (txn) {
      amount = parseFloat(txn.amount || "0");
      // Withdrawals are stored as positive but represent spending (negative)
      if (txn.type === "withdrawal") {
        amount = -Math.abs(amount);
      }
    } else if (attrs.amount) {
      amount = parseFloat(attrs.amount);
    }

    // Extract date - format "2025-10-31T00:00:00-05:00" -> "2025-10-31"
    let date = new Date().toISOString().split("T")[0];
    if (txn?.date) {
      date = txn.date.split("T")[0];
    } else if (attrs.date) {
      date = attrs.date.split("T")[0];
    }

    return {
      date,
      amount,
      description: txn?.description || attrs.description || "(No description)",
      category: txn?.category_name || attrs.category_name || "Uncategorized",
      tags: txn?.tags || attrs.tags || [],
      budget: txn?.budget_name || attrs.budget_name || "",
    };
  }

  /**
   * Generate markdown file for entity's transactions
   */
  generateMarkdown(
    entity: string,
    monthStr: string,
    transactions: FormattedTransaction[],
    balance: number
  ): string {
    // Parse month string (format: 2025-11)
    let monthDisplay: string;
    try {
      const [year, month] = monthStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      monthDisplay = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch {
      monthDisplay = monthStr;
    }

    // Calculate totals
    const totalSpent = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by category
    const byCategory = new Map<string, FormattedTransaction[]>();
    for (const t of transactions) {
      const cat = t.category;
      if (!byCategory.has(cat)) {
        byCategory.set(cat, []);
      }
      byCategory.get(cat)!.push(t);
    }

    // Sort categories by amount
    const sortedCategories = Array.from(byCategory.entries()).sort((a, b) => {
      const sumA = Math.abs(a[1].reduce((sum, t) => sum + t.amount, 0));
      const sumB = Math.abs(b[1].reduce((sum, t) => sum + t.amount, 0));
      return sumB - sumA;
    });

    // Generate markdown
    let md = `# ${entity.charAt(0).toUpperCase() + entity.slice(1)} Finances - ${monthDisplay}\n\n`;
    md += "## Summary\n";
    md += `- Generated: ${new Date().toISOString().replace("T", " ").slice(0, 19)}\n`;
    md += `- Account Balance: $${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    md += `- Total Transactions: ${transactions.length}\n`;
    md += `- Total Income: $${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    md += `- Total Spent: $${Math.abs(totalSpent).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    md += `- Net: $${(totalIncome + totalSpent).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

    // Transactions by category
    md += "## Transactions by Category\n\n";

    for (const [category, catTransactions] of sortedCategories) {
      const categoryTotal = catTransactions.reduce((sum, t) => sum + t.amount, 0);
      md += `### ${category}\n`;
      md += `**Total: $${categoryTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (${catTransactions.length} transactions)\n\n`;
      md += "| Date | Description | Amount |\n";
      md += "|------|-------------|--------|\n";

      // Sort transactions by date (newest first)
      const sorted = catTransactions.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      for (const t of sorted) {
        const desc = (t.description || "(No description)").slice(0, 50);
        md += `| ${t.date || "N/A"} | ${desc} | $${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
      }

      md += "\n";
    }

    return md;
  }

  /**
   * Sync transactions for specific month
   */
  async syncMonth(monthStr?: string): Promise<void> {
    if (!monthStr) {
      // Default to current month
      const today = new Date();
      monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    }

    // Parse month
    let monthDate: Date;
    try {
      const [year, month] = monthStr.split("-");
      monthDate = new Date(parseInt(year), parseInt(month) - 1);
    } catch {
      throw new FireflySyncError(`Invalid month format: ${monthStr}. Use YYYY-MM`);
    }

    // Calculate date range
    const startDate = `${monthStr}-01`;
    const nextMonth = new Date(monthDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const lastDay = new Date(nextMonth.getTime() - 86400000); // Subtract 1 day
    const endDate = `${monthStr}-${String(lastDay.getDate()).padStart(2, "0")}`;

    console.log(`Syncing ${monthStr}...`);

    // Aggregate transactions and balances per entity
    const entityData: Map<EntityType, { transactions: FormattedTransaction[]; totalBalance: number }> = new Map();
    entityData.set("personal", { transactions: [], totalBalance: 0 });
    entityData.set("goodfields", { transactions: [], totalBalance: 0 });
    entityData.set("fablab", { transactions: [], totalBalance: 0 });

    // Fetch transactions from all accounts
    for (const [accountId, accountName] of this.accounts) {
      const entity = this.accountToEntity.get(accountId)!;

      process.stdout.write(`  Fetching ${entity} (${accountName})... `);

      try {
        // Fetch transactions
        const transactions = await this.fetchTransactions(accountId, startDate, endDate);
        const formatted = transactions.map((t) => this.formatTransaction(t));

        // Get account balance
        const accountData = await this.get(`/accounts/${accountId}`);
        const balance = parseFloat(accountData.data.attributes.current_balance);

        // Add to entity aggregate
        const data = entityData.get(entity)!;
        data.transactions.push(...formatted);
        data.totalBalance += balance;

        console.log(`✓ (${formatted.length} transactions)`);
      } catch (error) {
        console.log(`✗ Error: ${error}`);
      }
    }

    // Write aggregated data per entity
    for (const [entity, data] of entityData) {
      if (data.transactions.length === 0 && data.totalBalance === 0) {
        continue; // Skip entities with no data
      }

      const entityDir =
        entity === "personal"
          ? this.personalDir
          : entity === "goodfields"
            ? this.goodfieldsDir
            : this.fablabDir;
      const filepath = join(entityDir, `${monthStr}-transactions.md`);
      const markdown = this.generateMarkdown(entity, monthStr, data.transactions, data.totalBalance);
      await writeFile(filepath, markdown, "utf-8");
    }
  }

  /**
   * Sync last N months of transactions
   */
  async syncAllMonths(monthsBack: number = 6): Promise<void> {
    const today = new Date();

    for (let i = 0; i < monthsBack; i++) {
      const month = new Date(today);
      month.setMonth(month.getMonth() - i);
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
      await this.syncMonth(monthStr);
    }
  }

  /**
   * Print sync status
   */
  printStatus(): void {
    console.log("Firefly III Sync Status");
    console.log(`API URL: ${this.apiUrl}`);
    console.log(`Data Directory: ${this.dataDir}`);
    console.log(`Accounts: ${this.accounts.size}`);
    console.log("");
  }
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      month: {
        type: "string",
        short: "m",
      },
      all: {
        type: "boolean",
        short: "a",
      },
      "months-back": {
        type: "string",
      },
      "api-url": {
        type: "string",
      },
      "data-dir": {
        type: "string",
      },
      help: {
        type: "boolean",
        short: "h",
      },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`
Firefly III Sync Script

Fetches current month transactions from Firefly III API and exports to markdown cache.

Usage:
    bun run firefly_sync.ts                    # Sync current month
    bun run firefly_sync.ts --month 2025-10   # Sync specific month
    bun run firefly_sync.ts --all              # Sync all months

Options:
    -m, --month <YYYY-MM>       Sync specific month
    -a, --all                   Sync all months (6 months back)
    --months-back <N>           Number of months to sync with --all (default: 6)
    --api-url <URL>             Firefly III API URL (default: from env FIREFLY_III_URL)
    --data-dir <PATH>           Data directory for markdown cache (default: ./data)
    -h, --help                  Show this help message

Environment Variables:
    Configure in ../data/.env file:
    FIREFLY_III_ACCESS_TOKEN    API token for Firefly III (required)
    FIREFLY_III_URL             Firefly III API URL (default: https://firefly.apps.kroeker.fun)
`);
    process.exit(0);
  }

  // Load environment variables from data/.env file
  const envPath = join(import.meta.dir, "..", "data", ".env");
  try {
    const envFile = await Bun.file(envPath).text();
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not load ${envPath}, using system environment variables`);
  }

  // Get API token from environment
  const apiToken = process.env.FIREFLY_III_ACCESS_TOKEN;
  if (!apiToken) {
    console.error("Error: FIREFLY_III_ACCESS_TOKEN not set");
    console.error(`Create ${envPath} with your Firefly III API token`);
    console.error("Or set it with: export FIREFLY_III_ACCESS_TOKEN=your-token");
    process.exit(1);
  }

  // Get API URL from environment or CLI
  const apiUrl =
    values["api-url"] || process.env.FIREFLY_III_URL || "http://firefly.apps.kroeker.fun:8080";

  try {
    // Initialize sync client
    const sync = new FireflySync(apiUrl, apiToken, values["data-dir"]);

    // Initialize directories
    await sync.initializeDirectories();

    // Discover accounts
    console.log("Discovering accounts...");
    await sync.discoverAccounts();
    console.log("");

    // Sync transactions
    if (values.all) {
      const monthsBack = values["months-back"] ? parseInt(values["months-back"]) : 6;
      await sync.syncAllMonths(monthsBack);
    } else if (values.month) {
      await sync.syncMonth(values.month);
    } else {
      // Default to current month
      await sync.syncMonth();
    }

    console.log("\nSync complete!");
  } catch (error) {
    if (error instanceof FireflySyncError) {
      console.error(`Sync failed: ${error.message}`);
      process.exit(1);
    } else {
      console.error(`Unexpected error: ${error}`);
      process.exit(1);
    }
  }
}

// Run main function
main();

