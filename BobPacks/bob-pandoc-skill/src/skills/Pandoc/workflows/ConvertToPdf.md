# ConvertToPdf Workflow

Convert markdown documents to professionally formatted PDFs optimized for resumes, cover letters, and job applications.

## Step 1: Check Pandoc Installation

```bash
which pandoc
```

**If not installed:**
```bash
# Ubuntu/Debian/WSL
sudo apt-get update && sudo apt-get install -y pandoc texlive-latex-base texlive-fonts-recommended texlive-latex-extra

# macOS
brew install pandoc basictex
```

## Step 2: Identify Input File(s)

**Ask user if not specified:**
- "Which markdown file should I convert?"
- "Convert resume, cover letter, or both?"

**Common patterns:**
- Single file: `resume.md`
- Multiple files: `resume.md` and `cover_letter.md`
- Directory: All `.md` files in specified directory

## Step 3: Determine Output Path

**Default naming:**
- `resume.md` → `resume.pdf`
- `cover_letter.md` → `cover_letter.pdf`
- Custom: User specifies output name

**Location:**
- Same directory as source file (default)
- Custom directory if user specifies

## Step 4: Apply Professional Formatting

**Standard pandoc command for professional documents:**

```bash
pandoc input.md -o output.pdf \
  --pdf-engine=pdflatex \
  -V geometry:margin=0.75in \
  -V fontsize=11pt \
  -V linestretch=1.15 \
  --variable=colorlinks:false
```

**Formatting breakdown:**
- `--pdf-engine=pdflatex` - High-quality PDF rendering
- `-V geometry:margin=0.75in` - Professional margins (0.75" all sides)
- `-V fontsize=11pt` - Readable font size
- `-V linestretch=1.15` - Comfortable line spacing
- `--variable=colorlinks:false` - Clean black text for printing

**For extra clean formatting (optional):**
```bash
pandoc input.md -o output.pdf \
  --pdf-engine=pdflatex \
  -V geometry:margin=0.75in \
  -V fontsize=11pt \
  -V linestretch=1.15 \
  -V pagestyle=empty \
  --variable=colorlinks:false
```

Adding `-V pagestyle=empty` removes page numbers (good for 1-2 page resumes).

## Step 5: Execute Conversion

Run the pandoc command with user's file(s).

**Single file:**
```bash
pandoc /path/to/resume.md -o /path/to/resume.pdf \
  --pdf-engine=pdflatex \
  -V geometry:margin=0.75in \
  -V fontsize=11pt \
  -V linestretch=1.15 \
  -V pagestyle=empty \
  --variable=colorlinks:false
```

**Multiple files (loop):**
```bash
for file in resume.md cover_letter.md; do
  basename="${file%.md}"
  pandoc "$file" -o "${basename}.pdf" \
    --pdf-engine=pdflatex \
    -V geometry:margin=0.75in \
    -V fontsize=11pt \
    -V linestretch=1.15 \
    -V pagestyle=empty \
    --variable=colorlinks:false
done
```

## Step 6: Verify Output

Check that PDF was created successfully:

```bash
ls -lh output.pdf
```

**Optional: Open PDF for preview (if user requests):**
```bash
# Linux/WSL
xdg-open output.pdf

# macOS
open output.pdf
```

## Step 7: Report Results

Tell user:
1. ✅ Conversion successful
2. 📄 Output file location
3. 📏 File size
4. 💡 Next steps (e.g., "Ready to submit to Red River Mutual")

**Example output:**
```
✅ Converted successfully!

Files created:
- resume.pdf (47 KB)
- cover_letter.pdf (23 KB)

Location: ~/.claude/skills/job-search/testing/

Ready to submit your application!
```

## Troubleshooting

**Error: "pandoc: pdflatex not found"**
```bash
# Install LaTeX engine
sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-latex-extra
```

**Error: "! LaTeX Error: File ... not found"**
```bash
# Install additional LaTeX packages
sudo apt-get install texlive-latex-extra
```

**Output looks wrong (formatting issues):**
- Check markdown syntax (especially headers)
- Verify no HTML tags (use pure markdown)
- Try adding `-V pagestyle=empty` for cleaner output

## Advanced Options (If User Requests)

**Custom margins:**
```bash
-V geometry:margin=1in              # All sides 1 inch
-V geometry:top=1in,bottom=1in,left=0.75in,right=0.75in  # Custom per side
```

**Custom font:**
```bash
-V mainfont="Arial"                 # Requires XeLaTeX
--pdf-engine=xelatex
```

**Different font size:**
```bash
-V fontsize=10pt                    # Smaller
-V fontsize=12pt                    # Larger
```

## Done

PDF generated with professional formatting, ready for job applications or professional use.
