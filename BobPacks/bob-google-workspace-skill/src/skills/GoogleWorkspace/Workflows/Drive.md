# Drive Operations

This workflow handles all Google Drive operations through the Google Workspace MCP server.

## List Files

### User Request Examples
- "List my recent Drive files"
- "Show me what's in my Google Drive"
- "What files are in my 'Projects' folder?"
- "List documents I created last week"

### Process
1. Parse any filters (folder, date range, file type)
2. Call MCP tool: `drive_list_files` with appropriate parameters
3. Format output as readable list (name, type, modified date, size)
4. Offer to search, download, or show more details

### MCP Tool: drive_list_files

**Input Schema:**
```json
{
  "name": "drive_list_files",
  "input": {
    "pageSize": 20,
    "orderBy": "modifiedTime desc",
    "q": "",
    "fields": "files(id, name, mimeType, modifiedTime, size, owners, shared)"
  }
}
```

**Parameters:**
- `pageSize` (optional): Number of files to return (default: 20, max: 1000)
- `orderBy` (optional): Sort order (e.g., "modifiedTime desc", "name", "createdTime")
- `q` (optional): Search query (Drive query syntax)
- `fields` (optional): Which file fields to return
- `pageToken` (optional): For pagination

**Common orderBy values:**
- `modifiedTime desc` - Most recently modified first
- `modifiedTime` - Oldest first
- `name` - Alphabetical by name
- `createdTime desc` - Most recently created first
- `viewedByMeTime desc` - Most recently viewed first

**Expected Output:**
```json
{
  "files": [
    {
      "id": "1a2b3c4d5e6f",
      "name": "Project Proposal.pdf",
      "mimeType": "application/pdf",
      "modifiedTime": "2026-01-12T15:30:00Z",
      "size": "245760",
      "owners": [
        {
          "displayName": "Bob",
          "emailAddress": "bob@example.com"
        }
      ],
      "shared": false
    },
    {
      "id": "6f5e4d3c2b1a",
      "name": "Team Roadmap",
      "mimeType": "application/vnd.google-apps.document",
      "modifiedTime": "2026-01-13T10:00:00Z",
      "size": null,
      "owners": [
        {
          "displayName": "Bob",
          "emailAddress": "bob@example.com"
        }
      ],
      "shared": true
    }
  ],
  "nextPageToken": "token-for-next-page"
}
```

### Error Handling
- **No files:** Inform user Drive is empty or no files match criteria
- **Permission denied:** User may not have access to folder
- **Invalid query:** Simplify search criteria
- **Auth expired:** Trigger re-auth

### Best Practices
- Default to 20 most recent files
- Show human-readable file sizes (KB, MB, GB)
- Indicate shared vs private files
- Distinguish Google Docs/Sheets/Slides from uploaded files
- Group by folder if browsing specific location

---

## Search Files

### User Request Examples
- "Search Drive for 'budget'"
- "Find presentations I worked on last week"
- "Search for PDFs in the Projects folder"
- "Find files shared with alice@example.com"

### Process
1. Parse search criteria from user request
2. Build Drive query string (use Drive query operators)
3. Call MCP tool: `drive_search_files`
4. Format results with most relevant files first
5. Offer to download or share specific results

### MCP Tool: drive_search_files

**Input Schema:**
```json
{
  "name": "drive_search_files",
  "input": {
    "q": "name contains 'budget' and mimeType='application/pdf'",
    "pageSize": 20,
    "orderBy": "modifiedTime desc"
  }
}
```

**Parameters:**
- `q` (required): Drive query string using Drive operators
- `pageSize` (optional): Number of results to return (default: 20)
- `orderBy` (optional): Sort order

**Common Drive Query Operators:**
- `name contains 'keyword'` - Filename contains keyword
- `fullText contains 'keyword'` - File content or name contains keyword
- `mimeType='type'` - Specific file type
- `modifiedTime > '2026-01-01T00:00:00'` - Modified after date
- `'parent-folder-id' in parents` - Files in specific folder
- `sharedWithMe` - Files shared with user
- `trashed=false` - Exclude deleted files
- `'user@example.com' in owners` - Files owned by user
- `'user@example.com' in writers` - Files user can edit

**Common MIME Types:**
- `application/pdf` - PDF files
- `application/vnd.google-apps.document` - Google Docs
- `application/vnd.google-apps.spreadsheet` - Google Sheets
- `application/vnd.google-apps.presentation` - Google Slides
- `application/vnd.google-apps.folder` - Folders
- `image/jpeg`, `image/png` - Images
- `text/plain` - Text files

**Expected Output:**
```json
{
  "files": [
    {
      "id": "1a2b3c4d5e6f",
      "name": "Q4 Budget Review.pdf",
      "mimeType": "application/pdf",
      "modifiedTime": "2026-01-10T14:20:00Z",
      "size": "512000",
      "webViewLink": "https://drive.google.com/file/d/1a2b3c4d5e6f/view"
    }
  ]
}
```

### Error Handling
- **No results:** Suggest broader search criteria
- **Invalid query syntax:** Simplify query
- **Too many results:** Suggest narrowing with additional filters
- **Permission denied:** Some files may be filtered out

### Best Practices
- Combine multiple operators for precise searches
- Default to `trashed=false` to exclude deleted files
- Search both name and fullText for comprehensive results
- Sort by relevance or modified time
- Show file preview links when available

---

## Upload File

### User Request Examples
- "Upload this document to my Drive"
- "Save this file to the Projects folder in Drive"
- "Upload report.pdf to Google Drive"

### Process
1. Identify file to upload (path or content)
2. Determine destination folder (default: root or specified folder)
3. Confirm file name and location
4. Call MCP tool: `drive_upload_file`
5. Confirm uploaded and provide file link

### MCP Tool: drive_upload_file

**Input Schema:**
```json
{
  "name": "drive_upload_file",
  "input": {
    "name": "Project Proposal.pdf",
    "mimeType": "application/pdf",
    "content": "base64-encoded-file-content",
    "parents": ["folder-id-optional"]
  }
}
```

**Parameters:**
- `name` (required): File name to use in Drive
- `mimeType` (required): MIME type of file
- `content` (required): File content (base64 encoded or file path)
- `parents` (optional): Array of parent folder IDs (default: root)

**Expected Output:**
```json
{
  "id": "1a2b3c4d5e6f",
  "name": "Project Proposal.pdf",
  "mimeType": "application/pdf",
  "size": "245760",
  "webViewLink": "https://drive.google.com/file/d/1a2b3c4d5e6f/view",
  "webContentLink": "https://drive.google.com/uc?id=1a2b3c4d5e6f&export=download",
  "uploaded": true
}
```

### Error Handling
- **File too large:** Drive has file size limits (check MCP server docs)
- **Permission denied:** User may not have write access to folder
- **Duplicate name:** Ask user if they want to keep both or replace
- **Invalid MIME type:** Verify file type

### Best Practices
- Show upload progress for large files (if MCP server supports)
- Confirm destination folder before uploading
- Provide both view and download links
- Log uploaded files for user's reference
- Handle duplicate names gracefully

---

## Download File

### User Request Examples
- "Download the budget spreadsheet from Drive"
- "Get the latest version of the project proposal"
- "Download file ID 1a2b3c4d5e6f"

### Process
1. Identify which file to download (search if needed)
2. Determine download format (especially for Google Docs/Sheets/Slides)
3. Call MCP tool: `drive_download_file`
4. Save file to local path or return content
5. Confirm download location

### MCP Tool: drive_download_file

**Input Schema:**
```json
{
  "name": "drive_download_file",
  "input": {
    "fileId": "1a2b3c4d5e6f",
    "mimeType": "application/pdf"
  }
}
```

**Parameters:**
- `fileId` (required): ID of file to download (from list or search)
- `mimeType` (optional): Export format for Google Docs/Sheets/Slides

**Export MIME Types (for Google Docs):**
- Google Doc → `application/pdf`, `text/plain`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- Google Sheet → `application/pdf`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX)
- Google Slides → `application/pdf`, `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)

**Expected Output:**
```json
{
  "fileId": "1a2b3c4d5e6f",
  "name": "Project Proposal.pdf",
  "content": "base64-encoded-file-content",
  "size": "245760",
  "downloaded": true
}
```

### Error Handling
- **File not found:** Verify file ID or search again
- **Permission denied:** User may not have download access
- **Export format not supported:** Use different MIME type
- **File too large:** May need to download via direct link

### Best Practices
- For Google Docs, ask user preferred format (PDF, DOCX, etc.)
- Show download progress for large files
- Verify file integrity after download
- Provide local path where file was saved
- Handle Google Workspace files vs regular files differently

---

## Update Permissions (Share)

### User Request Examples
- "Share the project proposal with alice@example.com"
- "Make the budget spreadsheet public"
- "Give bob@example.com edit access to the roadmap"
- "Remove charlie@example.com's access to the report"

### Process
1. Identify which file to share
2. Determine permission type (view, comment, edit)
3. Confirm sharing details with user
4. Call MCP tool: `drive_update_permissions`
5. Confirm shared and provide shareable link

### MCP Tool: drive_update_permissions

**Input Schema:**
```json
{
  "name": "drive_update_permissions",
  "input": {
    "fileId": "1a2b3c4d5e6f",
    "role": "writer",
    "type": "user",
    "emailAddress": "alice@example.com",
    "sendNotificationEmail": true
  }
}
```

**Parameters:**
- `fileId` (required): ID of file to share
- `role` (required): Permission level ("reader", "commenter", "writer", "owner")
- `type` (required): Permission type ("user", "group", "domain", "anyone")
- `emailAddress` (required for user/group): Email of user or group
- `sendNotificationEmail` (optional): Notify user of access (default: true)

**Permission Roles:**
- `reader` - Can view and download
- `commenter` - Can view, download, and comment (Google Docs/Sheets/Slides only)
- `writer` - Can view, download, comment, and edit
- `owner` - Full control (transfer ownership)

**Permission Types:**
- `user` - Specific user (requires emailAddress)
- `group` - Google Group (requires emailAddress)
- `domain` - Everyone in domain (e.g., @example.com)
- `anyone` - Public access (anyone with link)

**Expected Output:**
```json
{
  "permissionId": "perm123abc",
  "role": "writer",
  "type": "user",
  "emailAddress": "alice@example.com",
  "granted": true
}
```

### Error Handling
- **File not found:** Verify file ID
- **Permission denied:** User may not be owner or have sharing rights
- **Invalid email:** Validate email address
- **Domain restriction:** Some organizations restrict external sharing

### Best Practices
- Default to "reader" unless user specifies edit access
- Confirm before making files public
- Send notification emails unless user says not to
- Show shareable link after granting access
- Log permission changes for audit trail

---

## Advanced Operations

### Create Folder

Create a new folder:
```json
{
  "name": "drive_create_folder",
  "input": {
    "name": "Projects",
    "parents": ["parent-folder-id"]
  }
}
```

### Move File

Move file to different folder:
```json
{
  "name": "drive_move_file",
  "input": {
    "fileId": "1a2b3c4d5e6f",
    "addParents": ["new-folder-id"],
    "removeParents": ["old-folder-id"]
  }
}
```

### Delete File (Move to Trash)

```json
{
  "name": "drive_delete_file",
  "input": {
    "fileId": "1a2b3c4d5e6f"
  }
}
```

Note: This moves file to trash (can be restored). Permanent deletion may require separate operation.

### Copy File

```json
{
  "name": "drive_copy_file",
  "input": {
    "fileId": "1a2b3c4d5e6f",
    "name": "Copy of Project Proposal.pdf"
  }
}
```

### Batch Operations

For operations on multiple files, call MCP tools in sequence (MCP server may support batch operations - check documentation).

---

## Integration Notes

### With PAI History
Every Drive operation is logged:
```bash
# See all uploaded files
grep "drive_upload_file" $PAI_DIR/history/raw-outputs/*/*.jsonl

# See all shared files
grep "drive_update_permissions" $PAI_DIR/history/raw-outputs/*/*.jsonl
```

### With Other Skills
- **Cognitive Loop:** Upload blog posts to Drive
- **Financial system:** Upload invoices or receipts
- **Art skill:** Upload generated images

### Context Awareness
The AI remembers:
- Files it uploaded (can reference "the proposal I uploaded yesterday")
- Search results (can reference "that spreadsheet about budgets")
- Permission changes (can reference "the file I shared with Alice")

---

## Common Workflows

### Daily File Check
```
User: Show me files I worked on today
→ drive_list_files with modifiedTime > today
→ Show files sorted by modified time
→ Offer to open or download
```

### Project File Organization
```
User: Find all PDFs related to project X
→ drive_search_files: name contains 'project-x' and mimeType='application/pdf'
→ List results
→ Offer to move to project folder
```

### Share with Team
```
User: Share the roadmap with the team
→ Confirm file name (search if needed)
→ Confirm team members' emails
→ drive_update_permissions for each team member
→ Provide shareable link
```

### Backup Important File
```
User: Download a copy of the budget spreadsheet
→ Search for budget spreadsheet
→ drive_download_file as XLSX
→ Save to local machine
→ Confirm download location
```

---

## Troubleshooting

### "File not found"
**Cause:** File deleted, invalid ID, or wrong account
**Solution:** Search for file again or verify Drive account

### "Permission denied"
**Cause:** User doesn't own file or lacks sharing rights
**Solution:** Request access from owner or verify permissions

### "Upload failed"
**Cause:** File too large, network issue, or quota exceeded
**Solution:** Check file size, retry, or free up Drive storage

### "Export format not supported"
**Cause:** Trying to export Google Doc in unsupported format
**Solution:** Use supported export format (PDF, DOCX, etc.)

### "Quota exceeded"
**Cause:** Drive storage limit reached
**Solution:** Delete old files or upgrade storage plan

---

## Reference: Drive API Scopes

Required scope in settings.json:

- `https://www.googleapis.com/auth/drive.file` - Access files created by app (default)

Optional scopes:
- `https://www.googleapis.com/auth/drive` - Full Drive access (all files)
- `https://www.googleapis.com/auth/drive.readonly` - Read-only access
- `https://www.googleapis.com/auth/drive.metadata.readonly` - Metadata only

**Current default:** `drive.file` (files created/opened by app only)

**Note:** The `drive.file` scope is restrictive - app can only access files it created or that user explicitly opened with the app. For full Drive access, use `drive` scope.

To change scopes:
1. Update `GOOGLE_SCOPES` in `~/.claude/settings.json`
2. Delete `~/.config/google-workspace-mcp/credentials.json`
3. Restart Claude Code
4. Re-authorize with new scopes

---

## File Size Limits

Google Drive limits:
- **Free account:** 15 GB total storage (shared with Gmail and Photos)
- **Single file:** Up to 5 TB (but upload limits may apply)
- **Google Docs:** 50 MB (text), 2 MB (embedded images)
- **Google Sheets:** 10 million cells or 256 columns
- **Google Slides:** 100 MB

Check current usage:
```
User: How much Drive storage am I using?
→ (May require separate MCP tool - check documentation)
```

---

## MIME Type Reference

### Google Workspace Files
- `application/vnd.google-apps.document` - Google Doc
- `application/vnd.google-apps.spreadsheet` - Google Sheet
- `application/vnd.google-apps.presentation` - Google Slides
- `application/vnd.google-apps.form` - Google Form
- `application/vnd.google-apps.folder` - Folder

### Common File Types
- `application/pdf` - PDF
- `application/msword` - DOC
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - DOCX
- `application/vnd.ms-excel` - XLS
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - XLSX
- `text/plain` - TXT
- `text/csv` - CSV
- `image/jpeg` - JPG
- `image/png` - PNG
- `application/zip` - ZIP

---

## Query Syntax Examples

**Files modified today:**
```
modifiedTime > '2026-01-13T00:00:00'
```

**PDFs in specific folder:**
```
'folder-id-here' in parents and mimeType='application/pdf'
```

**Files shared with me:**
```
sharedWithMe=true and trashed=false
```

**Files I own containing keyword:**
```
'bob@example.com' in owners and fullText contains 'budget'
```

**Files larger than 10 MB:**
```
size > 10485760
```

**Google Docs only:**
```
mimeType='application/vnd.google-apps.document'
```

Combine with `and`, `or`, `not` for complex queries.
