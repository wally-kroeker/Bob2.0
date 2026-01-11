---
name: Pandoc
description: Professional document conversion from markdown to PDF using pandoc. USE WHEN user wants to convert markdown to PDF, create PDF from resume, export document as PDF, generate professional PDF, or mentions pandoc conversion. Optimized for job applications (resumes, cover letters) with clean formatting.
---

# Pandoc

Convert markdown documents to professionally formatted PDFs using pandoc with optimized settings for resumes, cover letters, and professional documents.

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **Pandoc** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **ConvertToPdf** | "convert to PDF", "create PDF", "export as PDF" | `workflows/ConvertToPdf.md` |

## Examples

**Example 1: Convert resume to PDF**
```
User: "Convert my resume to PDF"
→ Invokes ConvertToPdf workflow
→ Detects markdown resume file
→ Applies professional formatting (margins, fonts, spacing)
→ Generates clean PDF suitable for job applications
→ User receives: resume.pdf ready to submit
```

**Example 2: Convert cover letter for job application**
```
User: "Create PDF from my cover letter markdown"
→ Invokes ConvertToPdf workflow
→ Applies business letter formatting
→ Generates professional PDF
→ User receives: cover_letter.pdf with proper spacing and margins
```

**Example 3: Batch convert multiple documents**
```
User: "Convert my resume and cover letter to PDF"
→ Invokes ConvertToPdf workflow for each file
→ Applies consistent professional formatting
→ User receives: Both documents as PDFs ready to submit
```

## Professional Formatting Defaults

The skill uses optimized pandoc settings for professional documents:

**Margins:**
- Top/Bottom: 0.75 inches
- Left/Right: 0.75 inches

**Font:**
- Default: Professional sans-serif (system default)
- Size: 11pt for body text

**Spacing:**
- Line height: Optimized for readability
- Paragraph spacing: Clean, professional

**Page:**
- Letter size (8.5" × 11")
- Clean, minimal styling
- No headers/footers unless specified

## Requirements

Requires pandoc to be installed:
```bash
# Ubuntu/Debian
sudo apt-get install pandoc texlive-latex-base texlive-fonts-recommended

# macOS
brew install pandoc basictex
```
