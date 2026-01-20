#!/usr/bin/env bun
/**
 * NotionClient.ts
 * Core API wrapper for Notion Captures database
 *
 * Provides methods to query, read, update, and create captures.
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_CAPTURES_DB_ID || "2e730fb596b980ec85d4f3e8fddbd002";
const NOTION_VERSION = "2022-06-28";

if (!NOTION_API_KEY) {
  console.error("❌ NOTION_API_KEY not set in environment");
  process.exit(1);
}

// Types
export interface CaptureFilter {
  status?: "Inbox" | "Processed" | "Archived";
  type?: "Text" | "Link" | "Image" | "File" | "Voice" | "Video";
  source?: "Telegram" | "Manual" | "Other";
  query?: string; // Text search
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}

export interface Capture {
  id: string;
  title: string;
  content: string;
  type: string;
  url?: string;
  capturedAt: string;
  source: string;
  status: string;
}

export interface CreateCaptureInput {
  title: string;
  content: string;
  type: "Text" | "Link" | "Image" | "File" | "Voice" | "Video";
  url?: string;
  source?: "Telegram" | "Manual" | "Other";
  status?: "Inbox" | "Processed" | "Archived";
}

export interface UpdateCaptureInput {
  title?: string;
  content?: string;
  status?: "Inbox" | "Processed" | "Archived";
  type?: "Text" | "Link" | "Image" | "File" | "Voice" | "Video";
}

// Notion API client
export class NotionClient {
  private baseUrl = "https://api.notion.com/v1";

  private async request(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Query database with filters
   */
  async queryCaptures(filter: CaptureFilter = {}, limit = 100): Promise<Capture[]> {
    const filters: any[] = [];

    // Build Notion filter object
    if (filter.status) {
      filters.push({
        property: "Status",
        select: { equals: filter.status },
      });
    }

    if (filter.type) {
      filters.push({
        property: "Type",
        select: { equals: filter.type },
      });
    }

    if (filter.source) {
      filters.push({
        property: "Source",
        select: { equals: filter.source },
      });
    }

    if (filter.startDate) {
      filters.push({
        property: "Captured At",
        date: { on_or_after: filter.startDate },
      });
    }

    if (filter.endDate) {
      filters.push({
        property: "Captured At",
        date: { on_or_before: filter.endDate },
      });
    }

    if (filter.query) {
      filters.push({
        or: [
          {
            property: "Title",
            title: { contains: filter.query },
          },
          {
            property: "Content",
            rich_text: { contains: filter.query },
          },
        ],
      });
    }

    const body: any = {
      page_size: limit,
      sorts: [
        {
          property: "Captured At",
          direction: "descending",
        },
      ],
    };

    if (filters.length > 0) {
      body.filter = filters.length === 1 ? filters[0] : { and: filters };
    }

    const response = await this.request(`/databases/${DATABASE_ID}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return response.results.map((page: any) => this.parseCapture(page));
  }

  /**
   * Get single capture by ID
   */
  async getCapture(pageId: string): Promise<Capture> {
    const page = await this.request(`/pages/${pageId}`);
    return this.parseCapture(page);
  }

  /**
   * Update capture properties
   */
  async updateCapture(pageId: string, updates: UpdateCaptureInput): Promise<Capture> {
    const properties: any = {};

    if (updates.title) {
      properties.Title = {
        title: [{ text: { content: updates.title } }],
      };
    }

    if (updates.content) {
      properties.Content = {
        rich_text: [{ text: { content: updates.content } }],
      };
    }

    if (updates.status) {
      properties.Status = {
        select: { name: updates.status },
      };
    }

    if (updates.type) {
      properties.Type = {
        select: { name: updates.type },
      };
    }

    const page = await this.request(`/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });

    return this.parseCapture(page);
  }

  /**
   * Create new capture
   */
  async createCapture(input: CreateCaptureInput): Promise<Capture> {
    const properties: any = {
      Title: {
        title: [{ text: { content: input.title } }],
      },
      Content: {
        rich_text: [{ text: { content: input.content } }],
      },
      Type: {
        select: { name: input.type },
      },
      Source: {
        select: { name: input.source || "Manual" },
      },
      Status: {
        select: { name: input.status || "Inbox" },
      },
      "Captured At": {
        date: { start: new Date().toISOString() },
      },
    };

    if (input.url) {
      properties.URL = { url: input.url };
    }

    const page = await this.request("/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties,
      }),
    });

    return this.parseCapture(page);
  }

  /**
   * Archive capture (soft delete)
   */
  async archiveCapture(pageId: string): Promise<void> {
    await this.request(`/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
  }

  /**
   * Parse Notion page response to Capture object
   */
  private parseCapture(page: any): Capture {
    const props = page.properties;

    return {
      id: page.id,
      title: this.extractText(props.Title),
      content: this.extractText(props.Content),
      type: props.Type?.select?.name || "Text",
      url: props.URL?.url,
      capturedAt: props["Captured At"]?.date?.start || "",
      source: props.Source?.select?.name || "Manual",
      status: props.Status?.select?.name || "Inbox",
    };
  }

  /**
   * Extract text from Notion rich text property
   */
  private extractText(property: any): string {
    if (!property) return "";

    if (property.title) {
      return property.title.map((t: any) => t.plain_text).join("");
    }

    if (property.rich_text) {
      return property.rich_text.map((t: any) => t.plain_text).join("");
    }

    return "";
  }
}

// Export singleton instance
export const notionClient = new NotionClient();
