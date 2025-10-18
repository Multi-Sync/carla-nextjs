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

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--pages` | string | Comma-separated list of pages to show widget on | All pages |
| `--delay` | number | Delay before loading widget (ms) | 1500 |
| `--landing` | boolean | Use landing page mode (minimal UI) | false |

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

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--path` | string | Directory to scan | `./app/api` or `./pages/api` |
| `--force` | boolean | Force rescan (ignore cache) | false |
| `--verbose` | boolean | Show detailed output | false |

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

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--verbose` | boolean | Show detailed output | false |

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

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--verbose` | boolean | Show detailed information | false |

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

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--verbose` | boolean | Show detailed output | false |

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

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--force` | boolean | Overwrite existing routes | false |

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

## Global Options

These options work with all commands:

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help for a command |
| `-v, --version` | Show version number |

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

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Validation error |
| 3 | Network error |
| 4 | File system error |

## Environment Variables

Commands that interact with Interworky require:

```bash
NEXT_PUBLIC_CARLA_API_KEY="your-api-key"
```

See [Environment Variables](/reference/env-variables) for all options.
