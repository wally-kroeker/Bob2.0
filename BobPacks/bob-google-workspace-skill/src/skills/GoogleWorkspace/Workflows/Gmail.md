# Gmail Operations

This workflow handles all Gmail-related operations through the Google Workspace MCP server.

## Send Email

### User Request Examples
- "Send an email to bob@example.com about the project update"
- "Email alice@company.com with the meeting notes"
- "Compose and send a message to team@example.com"

### Process
1. Extract recipient(s), subject, and body from user's request
2. Confirm details with user (especially for important emails)
3. Call MCP tool: `gmail_send_message`
4. Confirm sent and provide message ID

### MCP Tool: gmail_send_message

**Input Schema:**
```json
{
  "name": "gmail_send_message",
  "input": {
    "to": "recipient@example.com",
    "subject": "Email subject line",
    "body": "Email body content",
    "cc": ["cc1@example.com", "cc2@example.com"],
    "bcc": ["bcc@example.com"]
  }
}
```

**Parameters:**
- `to` (required): Primary recipient email address (string)
- `subject` (required): Email subject line (string)
- `body` (required): Email body content (plain text or HTML)
- `cc` (optional): Array of CC recipient email addresses
- `bcc` (optional): Array of BCC recipient email addresses

**Expected Output:**
```json
{
  "messageId": "18d4f2e1a3b5c6d7",
  "threadId": "18d4f2e1a3b5c6d7",
  "sent": true,
  "labelIds": ["SENT"]
}
```

### Error Handling
- **Invalid email address:** Ask user to verify recipient email format
- **Auth expired:** Trigger re-auth (delete `~/.config/google-workspace-mcp/credentials.json`)
- **Network error:** Retry operation or report failure to user
- **Scope missing:** User needs `gmail.send` scope (see SKILL.md troubleshooting)

### Best Practices
- Always confirm recipient before sending important emails
- For bulk emails, ask user to confirm before proceeding
- Log sent emails to history for user's reference
- Provide message ID so user can find email in Gmail

---

## Read Inbox

### User Request Examples
- "What's in my inbox?"
- "Check my Gmail"
- "Show me recent emails"
- "What are my latest messages?"

### Process
1. Call MCP tool: `gmail_list_messages` with default limit (10-20 messages)
2. Format output as readable list (from, subject, date, snippet)
3. Offer to read full content of specific messages
4. Offer to search if user looking for something specific

### MCP Tool: gmail_list_messages

**Input Schema:**
```json
{
  "name": "gmail_list_messages",
  "input": {
    "maxResults": 10,
    "query": "",
    "labelIds": ["INBOX"]
  }
}
```

**Parameters:**
- `maxResults` (optional): Number of messages to return (default: 10, max: 500)
- `query` (optional): Gmail search query (e.g., "is:unread", "from:bob")
- `labelIds` (optional): Filter by label (default: ["INBOX"])

**Expected Output:**
```json
{
  "messages": [
    {
      "id": "18d4f2e1a3b5c6d7",
      "threadId": "18d4f2e1a3b5c6d7",
      "snippet": "First 200 characters of email...",
      "from": "sender@example.com",
      "subject": "Email subject",
      "date": "2026-01-13T10:30:00Z",
      "labelIds": ["INBOX", "UNREAD"]
    }
  ],
  "resultSizeEstimate": 42
}
```

### Error Handling
- **No messages:** Inform user inbox is empty (or no messages match criteria)
- **Auth expired:** Trigger re-auth
- **Too many results:** Suggest narrowing search with query parameter

### Best Practices
- Default to 10 most recent messages (avoid overwhelming user)
- Show snippet to help user identify emails
- Group by thread if multiple messages are in same conversation
- Highlight unread messages

---

## Search Email

### User Request Examples
- "Search for emails from bob@example.com"
- "Find emails about 'budget review'"
- "Show me emails from last week"
- "Search for unread messages from the design team"

### Process
1. Parse search criteria from user request
2. Build Gmail query string (use Gmail search operators)
3. Call MCP tool: `gmail_search_messages`
4. Format results with most relevant emails first
5. Offer to read full content of specific results

### MCP Tool: gmail_search_messages

**Input Schema:**
```json
{
  "name": "gmail_search_messages",
  "input": {
    "query": "from:bob@example.com after:2026/01/01",
    "maxResults": 20
  }
}
```

**Parameters:**
- `query` (required): Gmail search query using Gmail operators
- `maxResults` (optional): Number of results to return (default: 20)

**Common Gmail Query Operators:**
- `from:user@example.com` - From specific sender
- `to:user@example.com` - To specific recipient
- `subject:keyword` - Subject contains keyword
- `after:YYYY/MM/DD` - Emails after date
- `before:YYYY/MM/DD` - Emails before date
- `is:unread` - Unread messages only
- `is:starred` - Starred messages
- `has:attachment` - Messages with attachments
- `newer_than:7d` - Messages from last 7 days
- `older_than:1m` - Messages older than 1 month

**Expected Output:**
```json
{
  "messages": [
    {
      "id": "18d4f2e1a3b5c6d7",
      "threadId": "18d4f2e1a3b5c6d7",
      "snippet": "Email preview...",
      "from": "bob@example.com",
      "subject": "Budget Review Q4",
      "date": "2026-01-10T14:20:00Z",
      "labelIds": ["INBOX"]
    }
  ],
  "resultSizeEstimate": 5
}
```

### Error Handling
- **No results:** Inform user no emails match criteria, suggest broader search
- **Invalid query syntax:** Simplify query or use basic search
- **Too many results:** Suggest narrowing with additional criteria

### Best Practices
- Learn Gmail query syntax to build effective searches
- Combine multiple operators (e.g., `from:bob after:2026/01/01`)
- Default to reasonable time ranges (avoid searching entire mailbox)
- Show result count to help user refine search

---

## Read Specific Message

### User Request Examples
- "Read that email from Alice about the proposal"
- "Show me the full content of the third email"
- "Open the message with subject 'Meeting Notes'"

### Process
1. If user references message from previous list, use that message ID
2. Otherwise, search for message based on description
3. Call MCP tool: `gmail_get_message`
4. Display full email content (from, to, cc, subject, body, attachments)
5. Offer actions (reply, forward, archive, etc.)

### MCP Tool: gmail_get_message

**Input Schema:**
```json
{
  "name": "gmail_get_message",
  "input": {
    "messageId": "18d4f2e1a3b5c6d7",
    "format": "full"
  }
}
```

**Parameters:**
- `messageId` (required): Gmail message ID (from list or search results)
- `format` (optional): "full" (default), "metadata", "minimal", or "raw"

**Expected Output:**
```json
{
  "id": "18d4f2e1a3b5c6d7",
  "threadId": "18d4f2e1a3b5c6d7",
  "from": "alice@example.com",
  "to": ["bob@example.com"],
  "cc": [],
  "bcc": [],
  "subject": "Proposal Review",
  "date": "2026-01-12T16:45:00Z",
  "body": "Full email body content here...",
  "attachments": [
    {
      "filename": "proposal.pdf",
      "mimeType": "application/pdf",
      "size": 245760
    }
  ],
  "labelIds": ["INBOX", "IMPORTANT"]
}
```

### Error Handling
- **Message not found:** Message may have been deleted or ID is invalid
- **Message ID ambiguous:** Ask user to be more specific
- **Auth expired:** Trigger re-auth

### Best Practices
- Display full headers for context (from, to, cc, date)
- Format body for readability (preserve formatting if HTML)
- List attachments with size information
- Track thread context (previous messages in conversation)

---

## Create Draft

### User Request Examples
- "Create a draft email to bob@example.com"
- "Save this as a draft: [email content]"
- "Draft a message to the team about the update"

### Process
1. Extract recipient(s), subject, and body
2. Confirm draft details with user
3. Call MCP tool: `gmail_create_draft`
4. Confirm draft saved and provide draft ID

### MCP Tool: gmail_create_draft

**Input Schema:**
```json
{
  "name": "gmail_create_draft",
  "input": {
    "to": "recipient@example.com",
    "subject": "Draft subject",
    "body": "Draft body content",
    "cc": [],
    "bcc": []
  }
}
```

**Parameters:**
- `to` (required): Primary recipient email address
- `subject` (required): Email subject line
- `body` (required): Email body content
- `cc` (optional): Array of CC recipients
- `bcc` (optional): Array of BCC recipients

**Expected Output:**
```json
{
  "draftId": "r-8675309123456789",
  "messageId": "18d4f2e1a3b5c6d7",
  "created": true
}
```

### Error Handling
- **Invalid email format:** Validate email addresses before creating draft
- **Auth expired:** Trigger re-auth
- **Draft creation failed:** Retry or report error

### Best Practices
- Drafts allow user to review/edit in Gmail before sending
- Use drafts for important emails that need review
- Provide draft ID so user can find draft in Gmail
- Inform user that draft is NOT sent (requires manual send from Gmail)

---

## Advanced Operations

### Filter by Label

Use `labelIds` parameter in `gmail_list_messages`:
```json
{
  "labelIds": ["IMPORTANT"]
}
```

Common labels:
- `INBOX` - Inbox messages
- `SENT` - Sent messages
- `DRAFT` - Draft messages
- `IMPORTANT` - Important (Gmail automatically flags)
- `STARRED` - User-starred messages
- `TRASH` - Deleted messages
- `SPAM` - Spam folder

### Pagination

For large result sets, use pagination:
```json
{
  "maxResults": 50,
  "pageToken": "token-from-previous-response"
}
```

The MCP server response includes `nextPageToken` if more results exist.

### Email Formatting

**Plain text:**
```json
{
  "body": "Simple text email"
}
```

**HTML (if supported by MCP server):**
```json
{
  "body": "<html><body><h1>Formatted Email</h1><p>Content</p></body></html>",
  "mimeType": "text/html"
}
```

---

## Integration Notes

### With PAI History
Every Gmail operation is logged:
```bash
# See all sent emails
grep "gmail_send_message" $PAI_DIR/history/raw-outputs/*/*.jsonl

# See all email searches
grep "gmail_search_messages" $PAI_DIR/history/raw-outputs/*/*.jsonl
```

### With Other Skills
- **Telos skill:** Email weekly status reports
- **Financial system:** Email invoices or receipts
- **Cognitive Loop:** Email blog posts or newsletters

### Context Awareness
The AI remembers:
- Emails it sent (can reference "the email I sent to Bob yesterday")
- Search results (can reference "that email from Alice")
- Draft emails (can reference "the draft I created")

---

## Common Workflows

### Daily Email Check
```
User: Check my inbox for anything important
→ gmail_list_messages with is:unread and is:important
→ Show top 5 messages
→ Offer to read specific messages
```

### Send Project Update
```
User: Send project update to the team
→ Confirm recipients (team@example.com)
→ Ask user for update content
→ gmail_send_message with formatted update
→ Confirm sent
```

### Search and Reply
```
User: Find Alice's email about the budget and reply
→ gmail_search_messages: from:alice subject:budget
→ gmail_get_message to read full content
→ User composes reply
→ gmail_send_message with reply content
```

### Weekly Cleanup
```
User: Archive all emails older than 30 days
→ gmail_search_messages: older_than:30d
→ Confirm with user
→ (Archive operation - may require additional MCP tool)
```

---

## Troubleshooting

### "Cannot send email - permission denied"
**Cause:** Missing `gmail.send` scope
**Solution:** Add scope to settings.json, delete credentials, re-auth

### "Message not found"
**Cause:** Message deleted or invalid ID
**Solution:** Search for message again or verify ID is correct

### "Too many requests"
**Cause:** Hit Gmail API rate limit
**Solution:** Wait and retry, or reduce request frequency

### "Invalid query"
**Cause:** Gmail search syntax error
**Solution:** Simplify query or use basic operators

---

## Reference: Gmail API Scopes

Required scopes in settings.json:

- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails (inbox, search)
- `https://www.googleapis.com/auth/gmail.modify` - Modify emails (labels, drafts)
- `https://www.googleapis.com/auth/gmail.compose` - Create drafts

**Current default:** `gmail.send` + `gmail.readonly`

To add more scopes:
1. Update `GOOGLE_SCOPES` in `~/.claude/settings.json`
2. Delete `~/.config/google-workspace-mcp/credentials.json`
3. Restart Claude Code
4. Re-authorize with new scopes
