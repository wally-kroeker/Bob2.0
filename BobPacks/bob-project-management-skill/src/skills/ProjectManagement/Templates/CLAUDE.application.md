# [Project Name]

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

[Brief description of what this application does - 2-3 sentences explaining the purpose and main functionality]

## Stack

- **Runtime:** [e.g., Bun, Node.js, Python]
- **Framework:** [e.g., React, Next.js, Fastify, Django]
- **Database:** [e.g., PostgreSQL, MongoDB, SQLite, or "None"]
- **Deployment:** [e.g., Cloudflare Pages, Vercel, Railway, Docker]
- **Key Libraries:** [List 3-5 important dependencies]

## Development

### Prerequisites

[List what needs to be installed before setup]

```bash
# Example:
# - Bun 1.0+
# - Node.js 18+
# - Docker (for local database)
```

### Setup

```bash
# Clone and install
git clone [repo-url]
cd [project-name]
[install command - e.g., bun install, npm install, pip install -r requirements.txt]

# Environment setup
cp .env.example .env
# Edit .env with required values

# Database setup (if applicable)
[database setup commands]
```

### Running Locally

```bash
# Development server
[command - e.g., bun run dev, npm run dev, python manage.py runserver]

# Access at: http://localhost:[port]
```

### Testing

```bash
# Run tests
[command - e.g., bun test, npm test, pytest]

# Run with coverage
[command if applicable]

# Run specific test file
[command pattern]
```

### Building

```bash
# Production build
[command - e.g., bun run build, npm run build]

# Preview production build
[command if applicable]
```

### Deployment

```bash
# Deploy to [platform]
[command - e.g., bun run deploy, npm run deploy, git push]

# Deployment checklist:
# - [ ] Run tests
# - [ ] Update version
# - [ ] Check environment variables
# - [ ] Verify build succeeds
```

## Project Structure

```
project-name/
├── src/                    # Source code
│   ├── components/         # [Description]
│   ├── pages/             # [Description]
│   ├── lib/               # [Description]
│   └── ...
├── public/                # Static assets
├── tests/                 # Test files
├── [other directories]
└── README.md
```

## Architecture

[High-level architecture overview - component organization, data flow, key patterns]

**Key components:**
- **[Component 1]** - [Purpose]
- **[Component 2]** - [Purpose]
- **[Component 3]** - [Purpose]

## Code Conventions

### Style

- [e.g., TypeScript strict mode enabled]
- [e.g., Use functional components with hooks]
- [e.g., Follow Airbnb style guide]

### Naming

- **Files:** [e.g., PascalCase for components, kebab-case for utilities]
- **Functions:** [e.g., camelCase, descriptive names]
- **Constants:** [e.g., UPPER_SNAKE_CASE]

### Patterns

- [e.g., Use custom hooks for shared logic]
- [e.g., Colocate tests with source files]
- [e.g., Prefer composition over inheritance]

## Key Files

- `[file]` - [Purpose and when to modify]
- `[file]` - [Purpose and when to modify]
- `[file]` - [Purpose and when to modify]

## Common Tasks

### Adding a new [feature/component/page]

```bash
[Step-by-step commands or instructions]
```

### Updating dependencies

```bash
[Command to update dependencies]
```

### Database migrations (if applicable)

```bash
[Migration commands]
```

## Environment Variables

Required environment variables (see `.env.example` for full list):

- `[VAR_NAME]` - [Description, where to get value]
- `[VAR_NAME]` - [Description, where to get value]

## Troubleshooting

### Common Issues

**[Issue 1]**
- **Symptom:** [What user sees]
- **Cause:** [Why it happens]
- **Fix:** [How to resolve]

**[Issue 2]**
- **Symptom:** [What user sees]
- **Cause:** [Why it happens]
- **Fix:** [How to resolve]

## External Resources

- **Production:** [URL]
- **Staging:** [URL if applicable]
- **Documentation:** [URL if applicable]
- **API Reference:** [URL if applicable]

---

*Last updated: [Date]*
