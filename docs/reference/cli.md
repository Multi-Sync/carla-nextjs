# CLI Commands

The Carla Next.js CLI provides powerful commands for managing your AI-powered tools.

## Installation

The CLI is available via `npx`, so you don't need to install it globally:

```bash
npx @interworky/carla-nextjs [command]
```

For frequent use, you can install it in your project:

```bash
npm install -D @interworky/carla-nextjs
```

## Commands

### `install`

Install the Carla widget in your Next.js application.

```bash
npx @interworky/carla-nextjs install [options]
```

**Options:**

| Option      | Type    | Description                                     | Default   |
| ----------- | ------- | ----------------------------------------------- | --------- |
| `--pages`   | string  | Comma-separated list of pages to show widget on | All pages |
| `--delay`   | number  | Delay before loading widget (ms)                | 1500      |
| `--landing` | boolean | Use landing page mode (minimal UI)              | false     |

**Examples:**

```bash
# Install on all pages
npx @interworky/carla-nextjs install

# Install on specific pages only
npx @interworky/carla-nextjs install --pages "/,/products,/pricing"

# Install with 3 second delay
npx @interworky/carla-nextjs install --delay 3000

# Install in landing page mode
npx @interworky/carla-nextjs install --landing
```

**What it does:**

1. Detects your project type (TypeScript/JavaScript)
2. Detects your routing (App Router/Pages Router)
3. Generates the appropriate widget component
4. Adds it to your root layout or `_app.tsx` file

---

### `scan`

Scan your API routes and generate tool definitions.

```bash
npx @interworky/carla-nextjs scan [options]
```

**Options:**

| Option      | Type    | Description                 | Default                      |
| ----------- | ------- | --------------------------- | ---------------------------- |
| `--path`    | string  | Directory to scan           | `./app/api` or `./pages/api` |
| `--force`   | boolean | Force rescan (ignore cache) | false                        |
| `--verbose` | boolean | Show detailed output        | false                        |

**Examples:**

```bash
# Scan default API directory
npx @interworky/carla-nextjs scan

# Scan specific directory
npx @interworky/carla-nextjs scan --path ./src/app/api

# Force rescan with verbose output
npx @interworky/carla-nextjs scan --force --verbose
```

**What it does:**

1. Analyzes your API routes using TypeScript AST
2. Extracts route parameters, request bodies, and response types
3. Generates tool definitions in `.carla/tools.json`
4. Reports summary of found routes

---

### `sync`

Sync enabled tools to the Interworky platform.

```bash
npx @interworky/carla-nextjs sync [options]
```

**Options:**

| Option      | Type    | Description          | Default |
| ----------- | ------- | -------------------- | ------- |
| `--verbose` | boolean | Show detailed output | false   |

**Examples:**

```bash
# Sync enabled tools
npx @interworky/carla-nextjs sync

# Sync with detailed output
npx @interworky/carla-nextjs sync --verbose
```

**What it does:**

1. Reads tools from `.carla/tools.json`
2. Filters for enabled tools only
3. Uploads to Interworky via API
4. Reports sync status

::: tip
Only tools marked as `enabled: true` will be synced. Edit `.carla/tools.json` to enable/disable specific tools.
:::

---

### `status`

Show current sync status and tool information.

```bash
npx @interworky/carla-nextjs status [options]
```

**Options:**

| Option      | Type    | Description               | Default |
| ----------- | ------- | ------------------------- | ------- |
| `--verbose` | boolean | Show detailed information | false   |

**Examples:**

```bash
# Show basic status
npx @interworky/carla-nextjs status

# Show detailed status
npx @interworky/carla-nextjs status --verbose
```

**Output includes:**

- Total number of tools found
- Number of enabled tools
- Last sync time
- Tool list with status
- Validation warnings

---

### `fix`

Auto-fix common issues in tool definitions.

```bash
npx @interworky/carla-nextjs fix [options]
```

**Options:**

| Option      | Type    | Description          | Default |
| ----------- | ------- | -------------------- | ------- |
| `--verbose` | boolean | Show detailed output | false   |

**Examples:**

```bash
# Fix issues automatically
npx @interworky/carla-nextjs fix

# Fix with detailed output
npx @interworky/carla-nextjs fix --verbose
```

**What it fixes:**

- Missing descriptions
- Invalid parameter types
- Malformed tool names
- Broken route paths
- Type inconsistencies

---

### `generate-mcp`

Generate HTTP MCP (Model Context Protocol) routes.

```bash
npx @interworky/carla-nextjs generate-mcp [options]
```

**Options:**

| Option    | Type    | Description               | Default |
| --------- | ------- | ------------------------- | ------- |
| `--force` | boolean | Overwrite existing routes | false   |

**Examples:**

```bash
# Generate MCP routes
npx @interworky/carla-nextjs generate-mcp

# Force regenerate
npx @interworky/carla-nextjs generate-mcp --force
```

**What it creates:**

- `GET /api/mcp/tools` - Returns tool catalog
- `POST /api/mcp/call` - Executes tools

See [MCP Integration](/guide/mcp) for more details.

---

### `mcp`

Start MCP server for AI editor integration.

```bash
npx @interworky/carla-nextjs mcp
```

**No options.**

**What it does:**

- Starts a Model Context Protocol server
- Exposes tools to AI editors (Cursor, Claude Desktop)
- Enables AI editors to scan, fix, and sync tools

See [MCP Integration](/guide/mcp) for configuration.

---

### `interactive`

Launch interactive setup wizard.

```bash
npx @interworky/carla-nextjs interactive
```

**No options.**

**What it does:**

- Guides you through the entire setup process
- Asks questions about your preferences
- Runs appropriate commands based on your answers
- Provides helpful tips and next steps

Perfect for first-time users!

---

### `doctor` 🆕

AI-powered detection and fixing of Next.js errors.

```bash
npx @interworky/carla-nextjs doctor [options]
```

**Options:**

| Option        | Type    | Description                                | Default |
| ------------- | ------- | ------------------------------------------ | ------- |
| `--check`     | boolean | CI mode - check only, exit 1 if issues    | false   |
| `--fix-safe`  | boolean | Auto-fix without prompts (for pre-commit)  | false   |
| `--type`      | string  | Check specific type (see below)            | all     |

**Type values:**
- `hydration` - Hydration mismatches only
- `types` - Missing TypeScript types
- `hardcoded` - Hardcoded values that should be env vars
- `unused` - Unused code detection
- `all` - All checks (default)

**Examples:**

```bash
# Interactive mode - prompts for each fix
npx @interworky/carla-nextjs doctor

# CI mode - check only, exit 1 if issues found
npx @interworky/carla-nextjs doctor --check

# Auto-fix mode (for pre-commit hooks)
npx @interworky/carla-nextjs doctor --fix-safe

# Check only hydration errors
npx @interworky/carla-nextjs doctor --type hydration
```

**What it detects:**

- **Hydration mismatches** - Server/client HTML differences
- **Server/Client errors** - Using `window`, `document` in server components
- **Missing types** - Usage of `any` type
- **Hardcoded values** - API URLs that should be environment variables
- **Unused code** - Files and exports not reachable from any entry point
- **Invalid nesting** - HTML violations like `<div>` inside `<p>`

**How it works:**

1. Runs Next.js build to detect runtime errors
2. Performs AST-based static analysis
3. Uses reachability analysis to find unused code
4. Gathers context (parent components, layouts, imports)
5. Generates AI-powered fixes using OpenAI GPT-4
6. Applies fixes interactively or automatically

::: tip
Set `OPENAI_API_KEY` environment variable for AI-powered fix generation.
:::

---

### `clean` 🆕

Find and remove unused code, exports, dependencies, and duplicate components.

```bash
npx @interworky/carla-nextjs clean [options]
```

**Options:**

| Option        | Type    | Description                              | Default |
| ------------- | ------- | ---------------------------------------- | ------- |
| `--check`     | boolean | CI mode - check only, exit 1 if issues  | false   |
| `--auto-fix`  | boolean | Auto-delete without prompts (dangerous!) | false   |
| `--type`      | string  | Clean specific type (see below)          | all     |
| `--git-only`  | boolean | Only check git-tracked files             | false   |

**Type values:**
- `files` - Unused files only
- `exports` - Unused exports only
- `deps` - Unused dependencies only
- `duplicates` - Duplicate components only
- `all` - All types (default)

**Examples:**

```bash
# Interactive mode - prompts before deleting
npx @interworky/carla-nextjs clean

# CI mode - check only
npx @interworky/carla-nextjs clean --check

# Clean only unused files
npx @interworky/carla-nextjs clean --type files

# Clean only duplicate components
npx @interworky/carla-nextjs clean --type duplicates
```

**What it finds:**

- **Unused files** - Not reachable from any Next.js entry point
- **Unused exports** - Functions/constants/classes never imported
- **Unused assets** - Images/fonts in `/public` not referenced in code
- **Duplicate components** - Components with identical JSX structure
- **Unused dependencies** - npm packages not imported anywhere

**How it works:**

1. Builds reachability tree from Next.js entry points
2. Follows all imports recursively
3. Identifies unreachable files and assets
4. Extracts exports and checks if they're imported
5. Uses structural hashing to detect duplicates
6. Provides interactive cleanup with diff previews

::: warning
Review changes carefully before confirming deletion. Use `--check` mode in CI to prevent accidental deletions.
:::

---

### `verify` 🆕

Scan for broken links (404s) and auto-generate redirects.

```bash
npx @interworky/carla-nextjs verify [options]
```

**Options:**

| Option    | Type    | Description                            | Default              |
| --------- | ------- | -------------------------------------- | -------------------- |
| `--url`   | string  | Base URL to check                      | http://localhost:3000 |
| `--port`  | number  | Port for dev server                    | 3000                 |
| `--build` | boolean | Build before checking                  | false                |
| `--fix`   | boolean | Auto-generate redirects for broken links | false              |

**Examples:**

```bash
# Basic link check (auto-starts dev server)
npx @interworky/carla-nextjs verify

# Build before checking
npx @interworky/carla-nextjs verify --build

# Check with custom port
npx @interworky/carla-nextjs verify --port 3001

# Auto-generate redirects
npx @interworky/carla-nextjs verify --fix
```

**What it does:**

1. Discovers all Next.js routes (App Router and Pages Router)
2. Auto-starts dev server if not running
3. Crawls entire site for broken internal links
4. For each broken link, suggests fixes using:
   - Exact match (case-insensitive)
   - Trailing slash differences
   - Partial matches
   - Fuzzy matching (Levenshtein distance)
5. Optionally generates redirect configuration for `next.config.js`
6. Auto-stops dev server when done

**Confidence levels:**

- 🎯 **High** - Exact match or trailing slash difference
- 🤔 **Medium** - Partial match or close fuzzy match
- ⚠️ **Low** - Distant fuzzy match (not recommended for auto-fix)

::: tip
The `--fix` option will only generate redirects for high and medium confidence suggestions.
:::

---

### `init-ci` 🆕

Setup CI/CD with GitHub Actions and pre-commit hooks.

```bash
npx @interworky/carla-nextjs init-ci [options]
```

**Options:**

| Option          | Type    | Description                              | Default |
| --------------- | ------- | ---------------------------------------- | ------- |
| `--strategy`    | string  | CI strategy (see below)                  | full    |
| `--force`       | boolean | Overwrite existing configuration         | false   |
| `--skip-hooks`  | boolean | Skip pre-commit hooks installation       | false   |

**Strategy values:**
- `full` - GitHub Actions + Pre-commit hooks + All checks (recommended)
- `quick` - GitHub Actions with essential checks only
- `hooks-only` - Pre-commit hooks only (no GitHub Actions)

**Examples:**

```bash
# Interactive mode - choose strategy
npx @interworky/carla-nextjs init-ci

# Full QA strategy
npx @interworky/carla-nextjs init-ci --strategy full

# Quick check strategy
npx @interworky/carla-nextjs init-ci --strategy quick

# Hooks only (no GitHub Actions)
npx @interworky/carla-nextjs init-ci --strategy hooks-only

# Force overwrite
npx @interworky/carla-nextjs init-ci --force
```

**What it installs:**

**GitHub Actions workflow** (`.github/workflows/carla-qa-*.yml`):
- Runs on Pull Requests to main/master/develop
- Executes `doctor`, `clean`, `verify` commands
- Builds Next.js and runs tests
- Comments on PR with results

**Pre-commit hook** (`.husky/pre-commit`):
- Runs `carla doctor --fix-safe` before each commit
- Auto-adds fixed files to commit

**Pre-push hook** (`.husky/pre-push`):
- Runs `carla doctor --check` and `carla clean --check`
- Prevents pushing code with issues

**Quality tracking** (`.carla/metrics.json`):
- Baseline metrics for trend tracking
- Health score calculation
- History of issues found/fixed

::: warning GitHub Secrets Required
You need to add `OPENAI_API_KEY` as a GitHub repository secret for AI-powered fixes to work in CI.

**Steps:**
1. Go to GitHub repo → Settings → Secrets → Actions
2. Click "New repository secret"
3. Name: `OPENAI_API_KEY`
4. Value: Your OpenAI API key (sk-...)
5. Click "Add secret"
:::

---

## Global Options

These options work with all commands:

| Option          | Description             |
| --------------- | ----------------------- |
| `-h, --help`    | Show help for a command |
| `-v, --version` | Show version number     |

**Examples:**

```bash
# Show help for scan command
npx @interworky/carla-nextjs scan --help

# Show version
npx @interworky/carla-nextjs --version
```

## Common Workflows

### Initial Setup

```bash
# 1. Install widget
npx @interworky/carla-nextjs install

# 2. Scan API routes
npx @interworky/carla-nextjs scan

# 3. Review tools
npx @interworky/carla-nextjs status

# 4. Sync to Interworky
npx @interworky/carla-nextjs sync
```

### After Adding New Routes

```bash
# 1. Rescan with force
npx @interworky/carla-nextjs scan --force

# 2. Check what changed
npx @interworky/carla-nextjs status

# 3. Sync updates
npx @interworky/carla-nextjs sync
```

### Troubleshooting Issues

```bash
# 1. Check current status
npx @interworky/carla-nextjs status --verbose

# 2. Fix issues
npx @interworky/carla-nextjs fix

# 3. Rescan and sync
npx @interworky/carla-nextjs scan --force
npx @interworky/carla-nextjs sync
```

### QA & Cleanup Workflow 🆕

```bash
# 1. Check for errors
npx @interworky/carla-nextjs doctor

# 2. Clean up unused code
npx @interworky/carla-nextjs clean

# 3. Verify links
npx @interworky/carla-nextjs verify

# 4. Commit changes
git add .
git commit -m "chore: fix issues and clean up code"
```

### Setting Up CI/CD 🆕

```bash
# 1. Initialize CI/CD
npx @interworky/carla-nextjs init-ci --strategy full

# 2. Add GitHub secret (OPENAI_API_KEY)
# Do this in GitHub repo settings

# 3. Commit and push
git add .
git commit -m "chore: add Carla CI/CD"
git push

# 4. Create a Pull Request to test
```

### Pre-Release Quality Check 🆕

```bash
# Run all checks before releasing
npx @interworky/carla-nextjs doctor --check
npx @interworky/carla-nextjs clean --check
npx @interworky/carla-nextjs verify --build

# If all pass, you're good to go!
```

## Exit Codes

| Code | Meaning           |
| ---- | ----------------- |
| 0    | Success           |
| 1    | General error     |
| 2    | Validation error  |
| 3    | Network error     |
| 4    | File system error |

## Environment Variables

**Commands that interact with Interworky require:**

```bash
NEXT_PUBLIC_CARLA_API_KEY="your-api-key"
```

**Commands that use AI-powered features require:**

```bash
OPENAI_API_KEY="sk-..."
```

This is needed for:
- `doctor` command (AI-powered fix generation)
- `init-ci` command (when using GitHub Actions)

See [Environment Variables](/reference/env-variables) for all options.
