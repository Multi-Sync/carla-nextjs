# CLAUDE.md

This file provides guidance to Claude Code and other AI assistants when working with the Carla Next.js project.

## Project Overview

**Carla Next.js** is a CLI tool and MCP (Model Context Protocol) server that automatically transforms Next.js API routes into AI-powered tools. It enables developers to add conversational AI capabilities to their Next.js applications with minimal configuration.

## Key Capabilities

1. **Automatic API Route Scanning** - Uses TypeScript AST to discover and analyze Next.js API routes
2. **Tool Generation** - Converts routes into OpenAI function calling tools
3. **MCP Server** - Exposes routes as MCP tools for AI coding assistants (Cursor, Claude Code, etc.)
4. **Widget Integration** - Provides embeddable chat widget for end users
5. **Sync to Dashboard** - Pushes tools to Interworky dashboard for management

## Project Structure

```
carla-nextjs/
├── src/
│   ├── cli/           # CLI commands (scan, sync, install, mcp, etc.)
│   ├── scanner/       # TypeScript AST route scanner
│   ├── generator/     # Tool definition generator
│   ├── mcp/           # MCP server implementation
│   └── utils/         # Helper utilities
├── bin/
│   └── cli.js         # Entry point for CLI
├── templates/         # Widget component templates
├── docs/              # VitePress documentation
└── dist/              # Compiled JavaScript (gitignored)
```

## Architecture Patterns

### CLI Commands

Each command is in `src/cli/commands/<command>.ts`:

**Original Commands (v1.x):**
- `scan.ts` - Scans Next.js project for API routes
- `sync.ts` - Syncs tools to Interworky API
- `install.ts` - Installs widget component
- `mcp.ts` - Starts MCP server
- `status.ts` - Shows current status
- `fix.ts` - Auto-fixes common issues

**New QA Commands (v2.0):**
- `doctor.ts` - Detection of hydration errors, unused code, type issues, and antipatterns
- `clean.ts` - Find and remove unused files, exports, dependencies, and duplicates
- `verify.ts` - Scan for broken links and auto-generate redirects
- `init-ci.ts` - Setup CI/CD with GitHub Actions and pre-commit hooks

### Route Scanning

The scanner (`src/scanner/`) uses TypeScript AST to:

1. Find all route.ts/route.js files in app/api or pages/api
2. Extract HTTP methods (GET, POST, PUT, DELETE, etc.)
3. Infer parameters from route params and request body
4. Generate JSON schema for OpenAI function calling

### MCP Server

The MCP server (`src/mcp/`) implements the Model Context Protocol:

- Exposes scanned routes as MCP tools
- Allows AI assistants to discover and call your API routes
- Supports both SSE and HTTP transports

## Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run dev

# Run linting
npm run lint
npm run lint:fix

# Format code
npm run format

# Run tests
npm test

# Build documentation
npm run docs:build
npm run docs:dev
```

## New QA Commands (v2.0)

Carla v2.0 introduces powerful QA and cleanup tools designed for "vibe coders" using AI tools like Cursor and v0.

### Doctor Command

**Purpose:** Detection of Next.js errors and code quality issues

**Features:**
- Detects hydration mismatches (server/client HTML differences)
- Identifies server/client component errors (e.g., using `window` in server components)
- Finds missing TypeScript types (`any` usage)
- Detects hardcoded API URLs that should be environment variables
- Discovers unused files and exports via reachability analysis

**Usage:**
```bash
# Check and report issues
npx carla-nextjs doctor

# Check only (CI mode) - exit 1 if issues found
npx carla-nextjs doctor --check

# Check specific issue type
npx carla-nextjs doctor --type hydration
npx carla-nextjs doctor --type types
npx carla-nextjs doctor --type hardcoded
npx carla-nextjs doctor --type unused
```

**How it works:**
1. Runs Next.js build to detect runtime errors
2. Performs AST-based static analysis for common issues
3. Uses reachability analysis to find unused code
4. Reports all detected issues

### Clean Command

**Purpose:** Find and remove unused code, exports, dependencies, and duplicate components

**Features:**
- Finds unused files not reachable from any Next.js entry point
- Discovers unused exports (functions/constants/classes) within used files
- Detects unused public assets (images, fonts, etc.)
- Identifies duplicate components with identical JSX structure (e.g., Button.tsx vs NewButton.tsx)
- Shows visual diffs before deletion
- Calculates disk space savings

**Usage:**
```bash
# Interactive mode - prompts before deleting
npx carla-nextjs clean

# Check only (CI mode) - exit 1 if issues found
npx carla-nextjs clean --check

# Clean specific type only
npx carla-nextjs clean --type files
npx carla-nextjs clean --type exports
npx carla-nextjs clean --type deps
npx carla-nextjs clean --type duplicates

# Auto-delete without prompts (dangerous!)
npx carla-nextjs clean --auto-fix
```

**How it works:**
1. Builds reachability tree from Next.js entry points (pages, routes, layouts)
2. Follows all imports recursively to mark reachable files
3. Identifies unreachable files and assets
4. Extracts exports from used files and checks if they're imported anywhere
5. Uses structural hashing to detect duplicate components
6. Provides interactive cleanup with diff previews

### Verify Command

**Purpose:** Scan for broken links (404s) and auto-generate redirects

**Features:**
- Auto-starts and stops Next.js dev server (no manual setup)
- Crawls entire site for broken internal links
- Fuzzy matching with Levenshtein distance for suggested fixes
- Context-aware suggestions (checks for redirects in next.config.js)
- Generates redirect configuration for Next.js
- Confidence levels: high, medium, low

**Usage:**
```bash
# Basic link check (auto-starts dev server)
npx carla-nextjs verify

# Build before checking
npx carla-nextjs verify --build

# Custom port
npx carla-nextjs verify --port 3001

# Auto-generate redirects for broken links
npx carla-nextjs verify --fix
```

**How it works:**
1. Discovers all Next.js routes (App Router and Pages Router)
2. Starts dev server automatically if not running
3. Crawls site using linkinator library
4. For each broken link, suggests fixes using:
   - Exact match (case-insensitive)
   - Trailing slash differences
   - Partial matches
   - Fuzzy matching (Levenshtein distance)
5. Optionally generates redirects for next.config.js
6. Stops dev server when done

### Init-CI Command

**Purpose:** Setup CI/CD with GitHub Actions and pre-commit hooks

**Features:**
- Generates GitHub Actions workflows for PR checks
- Installs and configures Husky for pre-commit hooks
- Creates quality tracking baseline (.carla/metrics.json)
- Multiple strategies (full QA, quick check, hooks-only)
- Trend tracking for health score over time

**Usage:**
```bash
# Interactive mode - choose strategy
npx carla-nextjs init-ci

# Full QA strategy (GitHub Actions + hooks + all checks)
npx carla-nextjs init-ci --strategy full

# Quick check (GitHub Actions with essential checks only)
npx carla-nextjs init-ci --strategy quick

# Hooks only (no GitHub Actions)
npx carla-nextjs init-ci --strategy hooks-only

# Force overwrite existing configuration
npx carla-nextjs init-ci --force

# Skip pre-commit hooks installation
npx carla-nextjs init-ci --skip-hooks
```

**What it installs:**
- **GitHub Actions workflow** (`.github/workflows/carla-qa-*.yml`)
  - Runs on Pull Requests to main/master/develop
  - Executes doctor, clean, verify commands
  - Builds Next.js and runs tests
  - Comments on PR with results
- **Pre-commit hook** (`.husky/pre-commit`)
  - Runs `carla doctor --check` before each commit
- **Pre-push hook** (`.husky/pre-push`)
  - Runs `carla doctor --check` and `carla clean --check`
  - Prevents pushing code with issues
- **Quality tracking** (`.carla/metrics.json`)
  - Baseline metrics for trend tracking
  - Health score calculation
  - History of issues found/fixed

## Testing the CLI Locally

```bash
# Build first
npm run build

# Test original commands
node bin/cli.js --help
node bin/cli.js scan
node bin/cli.js status
node bin/cli.js sync

# Test new QA commands
node bin/cli.js doctor --check
node bin/cli.js clean --check
node bin/cli.js verify
node bin/cli.js init-ci --strategy hooks-only

# Or link globally
npm link
carla-nextjs --help
carla-nextjs doctor
carla-nextjs clean
```

## Important Constraints

1. **TypeScript-first**: All source code is TypeScript, compiled to dist/
2. **Node 18+**: Minimum Node.js version is 18.0.0
3. **Next.js 14+**: Only supports Next.js 14+ (App Router or Pages Router)
4. **No Breaking Changes**: Maintain backward compatibility in minor versions
5. **CLI UX**: Commands should be fast, provide clear feedback, and handle errors gracefully

## Coding Guidelines

### TypeScript

- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for objects
- Use const assertions where appropriate
- Avoid `any` - use `unknown` and type guards instead

### Error Handling

```typescript
// Good - specific error types
throw new Error(`Failed to scan route ${filePath}: ${error.message}`);

// Bad - generic errors
throw new Error('Something went wrong');
```

### Async/Await

- Always use try/catch for async operations
- Provide meaningful error context
- Use Promise.all() for parallel operations

### CLI Feedback

- Use `ora` for spinners during long operations
- Use `chalk` for colored output (success = green, errors = red)
- Show clear progress indicators
- Provide actionable next steps in error messages

## Adding a New CLI Command

1. Create `src/cli/mycommand.ts`:

```typescript
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';

export function registerMyCommand(program: Command) {
  program
    .command('mycommand')
    .description('Description of what this does')
    .action(async () => {
      const spinner = ora('Doing something...').start();

      try {
        // Your logic here
        spinner.succeed(chalk.green('Success!'));
      } catch (error) {
        spinner.fail(chalk.red(`Failed: ${error.message}`));
        process.exit(1);
      }
    });
}
```

2. Register in `src/cli/index.ts`:

```typescript
import { registerMyCommand } from './cli/mycommand';
// ...
registerMyCommand(program);
```

## MCP Integration

The MCP server allows AI assistants to discover and use your Next.js API routes.

### Starting the MCP Server

```bash
carla-nextjs mcp
```

### Cursor Configuration

Add to `.cursor/mcp_config.json`:

```json
{
  "mcpServers": {
    "carla-nextjs": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"],
      "env": {
        "NEXT_PUBLIC_CARLA_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "carla-nextjs": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"]
    }
  }
}
```

## Common Workflows

### Publishing a New Version

1. Update version in `package.json` (semantic versioning)
2. Update version in `docs/.vitepress/config.ts` nav
3. Commit: `git commit -m "chore: bump version to X.Y.Z"`
4. Push: `git push origin main`
5. GitHub Actions automatically publishes to npm

### Adding a New Feature

1. Create feature branch (optional)
2. Implement feature with TypeScript
3. Add tests if applicable
4. Update documentation in `docs/`
5. Update CHANGELOG.md
6. Submit PR or push to main

### Updating Documentation

1. Edit files in `docs/`
2. Test locally: `npm run docs:dev`
3. Commit and push
4. GitHub Actions deploys to https://carla.interworky.com

## Key Technical Details

### Environment Variables

- `NEXT_PUBLIC_CARLA_API_KEY` - API key for Interworky dashboard
- `CARLA_API_URL` - Optional custom API URL (defaults to production)

### Configuration Files

The CLI creates:

- `.carla/tools.json` - Tool definitions and enabled state
- `.carla/config.json` - Project configuration
- `src/components/CarlaWidget.tsx` (or .js) - Widget component

### Widget Integration

The widget is a simple script tag:

```typescript
<script
  src="https://storage.googleapis.com/multisync/interworky/production/interworky.js"
  data-api-key={process.env.NEXT_PUBLIC_CARLA_API_KEY}
></script>
```

## Debugging Tips

### Scanner Issues

```bash
# Enable verbose logging
DEBUG=carla:* carla-nextjs scan

# Check what files are being scanned
carla-nextjs scan --verbose
```

### MCP Issues

```bash
# Test MCP server connection
carla-nextjs mcp --debug

# Check tool definitions
cat .carla/tools.json
```

## Example Prompts for AI Assistants

When working with Carla Next.js, try these prompts:

**Original features (v1.x):**
- "Scan my Next.js API routes and show me what tools were found"
- "The scanner is not detecting my API routes in the pages directory. Can you help debug?"
- "Add a new CLI command called 'validate' that checks if all tools have proper descriptions"

**New QA features (v2.0):**
- "Run the doctor command and help me fix the hydration errors it found"
- "Use the clean command to find and remove unused code from my project"
- "Check for broken links in my Next.js app using the verify command"
- "Set up CI/CD with GitHub Actions using init-ci"
- "The doctor command found unused exports. How can I review them before removing?"
- "I have duplicate Button components. How does the clean command detect and handle them?"
- "Generate redirects for broken links found by verify command"

**Documentation:**
- "Update the getting started guide to include Windows-specific installation steps"
- "Add examples of using the new QA commands in the docs"

## Related Resources

- [Interworky Dashboard](https://interworky.com)
- [Documentation](https://carla.interworky.com)
- [GitHub](https://github.com/Multi-Sync/carla-nextjs)
- [npm Package](https://www.npmjs.com/package/@interworky/carla-nextjs)
- [Discord](https://discord.com/invite/YHmsekzMV5)

## Notes for AI Assistants

- Always run `npm run build` after TypeScript changes
- Test CLI commands before suggesting to users
- Check existing code patterns before proposing new approaches
- Maintain consistent error handling and user feedback
- Update documentation when adding features
- Follow semantic versioning for package updates

**v2.0 Specific Notes:**
- Reachability analysis is used extensively in `doctor` and `clean` commands
- AST parsing is done with Babel (`@babel/parser`, `@babel/traverse`, `@babel/generator`)
- The `verify` command uses `linkinator` for link checking
- The `init-ci` command sets up Husky hooks and GitHub Actions workflows
- Quality tracking is stored in `.carla/metrics.json` for trend analysis
- All commands follow the pattern: check mode (`--check`) for CI
