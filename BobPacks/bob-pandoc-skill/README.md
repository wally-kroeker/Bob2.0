---
name: Bob Pandoc Skill
pack-id: bob-pandoc-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Professional document conversion from markdown to PDF using pandoc. Optimized for job applications with clean formatting.
type: skill
platform: claude-code
dependencies:
  - pandoc (system package)
keywords: [pandoc, pdf, markdown, conversion, resume, documents]
---

# Bob Pandoc Skill

Professional markdown to PDF conversion.

## Features

- **Clean PDF Output**: Professional formatting for documents
- **Resume Optimization**: Tuned for job application materials
- **Template Support**: Customizable LaTeX templates
- **Batch Conversion**: Multiple document processing

## Activation Triggers

Bob activates this skill when:
- You need markdown to PDF conversion
- You're preparing resume or cover letter
- You want professional document formatting

## Prerequisites

```bash
# Install pandoc
sudo apt install pandoc texlive-latex-base texlive-fonts-recommended
```

## Installation

```bash
cp -r src/skills/Pandoc ~/.claude/skills/
```
