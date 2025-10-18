# Carla Next.js

[![npm version](https://badge.fury.io/js/%40interworky%2Fcarla-nextjs.svg)](https://www.npmjs.com/package/@interworky/carla-nextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-online-brightgreen)](https://multi-sync.github.io/carla-nextjs/)
[![Node.js Version](https://img.shields.io/node/v/@interworky/carla-nextjs)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)
[![Discord](https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.com/invite/YHmsekzMV5)

> Automatically turn your Next.js API routes into AI-powered tools for Carla, the AI Agent for websites (Customer Support + Analytics + Performance Monitoring + Bug Fixes).

📚 **[Read the full documentation →](https://multi-sync.github.io/carla-nextjs/)**

## Features

- 🔍 **Auto-discovery** - Scans API routes and generates tool definitions
- 🤖 **AI-Ready** - Works with OpenAI Realtime API (text & voice)
- 📦 **Zero Config** - One command to install widget
- 🔄 **Smart Sync** - Push tools to Interworky dashboard
- 🛠️ **Auto-Fix** - Detects and fixes common issues
- 🎯 **Type-Safe** - Full TypeScript support

## Quick Start

### 1. Install Widget

```bash
# Add your API key to .env.local
NEXT_PUBLIC_CARLA_API_KEY="your-api-key-here"

# Install the Interworky widget
npx @interworky/carla-nextjs install
```

This adds the Carla widget to your Next.js app.

### 2. Scan & Sync Tools

```bash
# Scan your API routes
npx @interworky/carla-nextjs scan

# Review generated tools
npx @interworky/carla-nextjs status

# Sync to Interworky
npx @interworky/carla-nextjs sync
```

That's it! Carla now has access to your API routes.

## Installation Options

```bash
# Interactive setup (recommended)
npx @interworky/carla-nextjs interactive

# Install widget on specific pages
npx @interworky/carla-nextjs install --pages "/,/products,/pricing"

# Install with custom delay
npx @interworky/carla-nextjs install --delay 2000

# Install with landing page mode
npx @interworky/carla-nextjs install --landing
```

## Commands

| Command      | Description                          |
|--------------|--------------------------------------|
| `install`    | Install Carla widget in your app     |
| `scan`       | Scan API routes and generate tools   |
| `generate-mcp` | Generate HTTP MCP routes at /api/mcp |
| `sync`       | Sync enabled tools to Interworky     |
| `status`     | Show current sync status             |
| `fix`        | Auto-fix tool issues                 |
| `interactive`| Interactive setup wizard             |
| `mcp`        | Start MCP server for AI editors      |

## Environment Variables

Add to your `.env.local`, `.env.development`, or `.env`:

```bash
NEXT_PUBLIC_CARLA_API_KEY="your-api-key-here"
```

**Getting your API key:**
1. Go to [interworky.com](https://interworky.com)
2. Create an account (or sign in)
3. Navigate to the **Integrations** page from the sidebar
4. Copy your API key

## How It Works

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Next.js    │───▶│ carla-nextjs │───▶│ Interworky  │
│  API Routes │    │   CLI Tool   │    │  Dashboard  │
└─────────────┘    └──────────────┘    └─────────────┘
      │                                        │
      │            ┌──────────────┐            │
      └───────────▶│ Carla Widget │◀───────────┘
                   │  (Frontend)  │
                   └──────────────┘
```

1. **Scan** - CLI analyzes your API routes using TypeScript AST
2. **Generate** - Creates tool definitions with types and descriptions
3. **Sync** - Pushes enabled tools to Interworky
4. **Execute** - Carla can call your APIs in real-time

## JavaScript & TypeScript Support

Carla Next.js automatically detects your project type and generates the appropriate files:

- **TypeScript projects** → `.tsx` components
- **JavaScript projects** → `.jsx` components

## Widget Features

The installed widget component:

- ✅ Loads asynchronously (non-blocking)
- ✅ 1.5s delay for optimal performance
- ✅ Proper cleanup on unmount
- ✅ Route-based conditional loading
- ✅ Error handling and fallbacks

## Examples

### Scan Specific Directory

```bash
npx @interworky/carla-nextjs scan --path ./src/app/api
```

### Sync with Force Rescan

```bash
npx @interworky/carla-nextjs scan --force
npx @interworky/carla-nextjs sync
```

### Check Tool Status

```bash
npx @interworky/carla-nextjs status --verbose
```

### Generate MCP Routes

```bash
# Generate HTTP MCP routes for AI integration
npx @interworky/carla-nextjs generate-mcp

# Force regenerate if routes already exist
npx @interworky/carla-nextjs generate-mcp --force
```

## MCP HTTP Routes

The `generate-mcp` command creates HTTP endpoints that expose your API tools via the Model Context Protocol:

### Generated Endpoints

- **GET /api/mcp/tools** - Returns the catalog of available tools
- **POST /api/mcp/call** - Executes a tool with provided arguments

### Usage Example

```javascript
// Get available tools
fetch('http://localhost:3000/api/mcp/tools')
  .then(res => res.json())
  .then(tools => console.log(tools));

// Execute a tool
fetch('http://localhost:3000/api/mcp/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'get_users',
    args: { limit: 10 }
  })
})
  .then(res => res.json())
  .then(result => console.log(result));
```

## MCP Server Integration

Use with AI editors like Cursor or Claude Desktop:

```json
{
  "mcpServers": {
    "carla-nextjs": {
      "command": "npx",
      "args": ["carla-nextjs", "mcp"],
      "cwd": "/path/to/your/nextjs/project"
    }
  }
}
```

Now your AI editor can scan, fix, and sync tools automatically.

## Requirements

- Node.js 18+
- Next.js 14+
- React 18+

## Support

- 📚 **Documentation**: [Full Documentation](https://multi-sync.github.io/carla-nextjs/)
- 💬 **Discord**: [Join Community](https://discord.com/invite/YHmsekzMV5)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
- 📧 **Email**: [hello@interworky.com](mailto:hello@interworky.com)

## License

MIT © [Interworky](https://interworky.com)

---

**Made with ❤️ by the Interworky team**
