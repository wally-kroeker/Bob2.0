# [Library Name]

This file provides guidance to Claude Code when working with code in this library.

## Overview

**Purpose:** [What problem this library solves in 1-2 sentences]

**Package Name:** [e.g., @username/package-name, package-name]

**Version:** [Current version]

**License:** [e.g., MIT, Apache 2.0]

## Installation

### NPM / Bun / Yarn

```bash
# NPM
npm install [package-name]

# Bun
bun add [package-name]

# Yarn
yarn add [package-name]
```

### PyPI (for Python libraries)

```bash
pip install [package-name]
```

### Other Package Managers

[If applicable - Cargo, Go modules, etc.]

## Quick Start

```typescript
// or python, rust, etc.
import { [MainExport] } from '[package-name]';

// Basic usage example
const result = [MainExport]([example]);
console.log(result);
```

## API Reference

### Core Functions/Classes

#### `[FunctionName]`

**Purpose:** [What it does]

**Signature:**
```typescript
function [FunctionName](
  param1: Type1,
  param2: Type2
): ReturnType
```

**Parameters:**
- `param1` - [Description]
- `param2` - [Description]

**Returns:** [Description of return value]

**Example:**
```typescript
const result = [FunctionName]('example', 42);
```

**Throws:**
- `[ErrorType]` - [When this error is thrown]

---

#### `[ClassName]`

**Purpose:** [What this class does]

**Constructor:**
```typescript
new [ClassName](config: ConfigType)
```

**Methods:**

##### `method1()`

[Description]

**Example:**
```typescript
const instance = new [ClassName]({ option: true });
const result = instance.method1();
```

---

### Types (TypeScript)

```typescript
// Main types exported
interface [TypeName] {
  [field]: [Type];
  [field]: [Type];
}

type [TypeName] = [Definition];
```

### Utilities

[Any utility functions, helpers, or constants exported]

## Configuration

### Options

```typescript
interface [ConfigOptions] {
  [option1]?: [Type];  // [Description, default value]
  [option2]?: [Type];  // [Description, default value]
}
```

**Example configuration:**
```typescript
const config = {
  [option1]: [value],
  [option2]: [value]
};
```

## Development

### Setup

```bash
# Clone repository
git clone [repo-url]
cd [library-name]

# Install dependencies
[install command]

# Build
[build command]
```

### Running Tests

```bash
# Run all tests
[test command]

# Run with coverage
[coverage command]

# Run specific test
[test file command]

# Watch mode
[watch command]
```

### Building

```bash
# Development build
[dev build command]

# Production build
[prod build command]

# Type checking
[type check command]
```

### Publishing

```bash
# Update version
[version command - e.g., npm version patch]

# Build for release
[build command]

# Publish
[publish command - e.g., npm publish]

# Publish checklist:
# - [ ] Tests pass
# - [ ] Version bumped
# - [ ] CHANGELOG updated
# - [ ] Documentation updated
# - [ ] Build successful
```

## Project Structure

```
library-name/
├── src/                # Source code
│   ├── index.ts       # Main entry point
│   ├── [module]/      # Feature modules
│   └── types/         # Type definitions
├── tests/             # Test files
├── dist/              # Built output
├── docs/              # Documentation
├── package.json
└── README.md
```

## Code Conventions

### Style

- [e.g., ESLint config used]
- [e.g., Prettier for formatting]
- [e.g., Strict TypeScript mode]

### Naming

- **Files:** [Convention - e.g., kebab-case]
- **Functions:** [Convention - e.g., camelCase]
- **Classes:** [Convention - e.g., PascalCase]
- **Constants:** [Convention - e.g., UPPER_SNAKE_CASE]

### Testing

- [Testing philosophy - e.g., unit tests for all public APIs]
- [Coverage requirements - e.g., minimum 80%]
- [Test file naming - e.g., *.test.ts]

## Dependencies

**Runtime dependencies:**
- `[dep]` - [Why needed]
- `[dep]` - [Why needed]

**Development dependencies:**
- `[dep]` - [Why needed]
- `[dep]` - [Why needed]

**Peer dependencies:**
- `[dep]` - [Version range, why needed]

## Examples

### Basic Usage

```typescript
[Complete working example]
```

### Advanced Usage

```typescript
[More complex example showing advanced features]
```

### Real-World Use Case

```typescript
[Practical example solving a common problem]
```

## Troubleshooting

### Common Issues

**[Issue 1]**
- **Problem:** [Description]
- **Cause:** [Why it happens]
- **Solution:** [How to fix]

**[Issue 2]**
- **Problem:** [Description]
- **Cause:** [Why it happens]
- **Solution:** [How to fix]

## Performance

[Performance characteristics, benchmarks if available]

**Best practices:**
- [Performance tip 1]
- [Performance tip 2]

## Browser/Environment Support

- **Node.js:** [Supported versions]
- **Browsers:** [Supported browsers if applicable]
- **Other runtimes:** [e.g., Bun, Deno support]

## Compatibility

**Breaking changes:**
- [List any breaking changes in recent versions]

**Migration guides:**
- [Link to migration docs if applicable]

## Contributing

[Link to CONTRIBUTING.md or brief guidelines]

**Development workflow:**
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## External Resources

- **NPM Package:** [URL]
- **GitHub Repository:** [URL]
- **Documentation Site:** [URL if applicable]
- **Changelog:** [URL or link to CHANGELOG.md]
- **Issue Tracker:** [URL]

## Maintenance Status

**Status:** [e.g., Active, Maintained, Looking for maintainers]

**Maintainers:** [List of maintainers]

---

*Last updated: [Date]*
