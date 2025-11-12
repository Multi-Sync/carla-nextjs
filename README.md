# Carla Next.js

[![npm version](https://badge.fury.io/js/%40interworky%2Fcarla-nextjs.svg)](https://www.npmjs.com/package/@interworky/carla-nextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/docs-online-brightgreen)](https://multi-sync.github.io/carla-nextjs/)
[![Node.js Version](https://img.shields.io/node/v/@interworky/carla-nextjs)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)
[![Discord](https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.com/invite/YHmsekzMV5)

> Automatically turn your Next.js API routes into AI-powered tools for Carla, the AI Agent for Next.js applications.

**Start Free:** Performance Monitoring + Error Tracking + Analytics
**Premium ($19.99/mo):** AI-Powered Auto-Fix + AI Customer Support Widget
**7-Day Free Trial** available for premium features

📚 **[Read the full documentation →](https://carla.interworky.com)** | 💰 **[Pricing Details →](https://carla.interworky.com/guide/pricing)**

## What is Carla?

Carla is a comprehensive platform for Next.js applications that provides:

- **Free Tier:** Essential monitoring, error tracking, and analytics - always free, no credit card required
- **Premium Tier:** AI-powered automation (Auto-Fix with GitHub PRs) and AI Customer Support - $19.99/month with 7-day free trial

## Features

### ✨ Always Free

- 📊 **Performance Monitoring** - Real-time performance tracking and metrics
- 🐛 **Error Detection** - Automatic error capture with stack traces
- 📈 **Analytics & Insights** - Visitor tracking, page views, and user journeys
- 📱 **10,000+ Device Awareness** - Comprehensive device and browser detection
- 🔍 **Auto-discovery** - Scans API routes and generates tool definitions
- 📦 **Zero Config Widget** - One command to install
- 🔄 **Smart Sync** - Push tools to Interworky dashboard
- 🛠️ **CLI Auto-Fix Tool** - Detects and fixes common configuration issues
- 🎯 **Type-Safe** - Full TypeScript support

### 🚀 Premium Features ($19.99/month)

> **7-Day Free Trial Available** - Try premium features free for 7 days. Credit card required. Cancel anytime during trial at no charge.

- 🤖 **AI-Powered Auto-Fix** - AI detects errors and creates GitHub PRs with fixes automatically
- 🔗 **GitHub Integration** - OAuth connection and automated PR creation
- 💬 **AI Customer Support Widget** - Embeddable voice & text chat widget for your website
- 🧠 **Full MCP Server** - Advanced Model Context Protocol features for AI assistants (Cursor, Claude Code, etc.)

**Learn more:** [Pricing & Feature Comparison →](https://carla.interworky.com/guide/pricing)

## Pricing

|                                | Free Tier        | Premium Tier     |
| ------------------------------ | ---------------- | ---------------- |
| **Price**                      | **FREE forever** | **$19.99/month** |
| **Credit Card**                | ❌ Not required  | ✅ Required      |
| **Trial**                      | N/A              | ✅ 7 days free   |
| **Performance Monitoring**     | ✅ Unlimited     | ✅ Included      |
| **Error Tracking**             | ✅ Unlimited     | ✅ Included      |
| **Analytics**                  | ✅ Unlimited     | ✅ Included      |
| **AI-Powered Auto-Fix**        | ❌               | ✅               |
| **GitHub PR Creation**         | ❌               | ✅               |
| **AI Customer Support Widget** | ❌               | ✅               |
| **Voice Chat Support**         | ❌               | ✅               |

**Full details:** [View complete pricing guide →](https://carla.interworky.com/guide/pricing)

## Quick Start

### 1. Sign Up & Get Your API Key

1. Visit [interworky.com](https://interworky.com)
2. Create a free account (no credit card required)
3. Navigate to the **Integrations** page
4. Copy your API key

### 2. Initialize Carla in Your Next.js Project

```bash
# Initialize and authenticate
npx @interworky/carla-nextjs init
```

This will:

- Authenticate with your API key
- Create `.carla/` configuration directory
- Add `NEXT_PUBLIC_CARLA_API_KEY` to your `.env.local`

### 3. Choose Your Integration Path

You'll be guided to choose between two options:

#### Option A: Manual Integration (Free Tier)

- Install widget component manually
- Get immediate access to performance monitoring, error tracking, and analytics
- No trial or credit card required
- Perfect for getting started

```bash
# Install the widget component
npx @interworky/carla-nextjs install

# Scan your API routes
npx @interworky/carla-nextjs scan

# Sync to dashboard
npx @interworky/carla-nextjs sync
```

#### Option B: GitHub Integration (Premium - 7-Day Free Trial)

- Connect GitHub via OAuth
- Enables AI-Powered Auto-Fix with PR creation
- Includes AI Customer Support Widget
- Requires credit card for trial ($19.99/month after 7 days)

```bash
# Start premium trial and connect GitHub
# Follow the dashboard prompts to:
# 1. Start 7-day free trial
# 2. Connect GitHub OAuth
# 3. Install widget component
```

### 4. Start Monitoring

Once integrated, access your dashboard to:

- View real-time performance metrics
- Track errors with stack traces
- Analyze visitor data and user journeys
- **(Premium)** Receive automated PR fixes for detected errors
- **(Premium)** Enable AI customer support chat widget

**Next steps:** [Complete setup guide →](https://carla.interworky.com/guide/getting-started)

## Use with Cursor, Claude Code & AI Assistants

Carla Next.js includes an MCP (Model Context Protocol) server that works with AI coding assistants:

```bash
# Start MCP server
npx @interworky/carla-nextjs mcp
```

### Cursor IDE Setup

Add to `.cursor/mcp_config.json`:

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

### Claude Desktop Setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "carla-nextjs": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"],
      "cwd": "/absolute/path/to/your/nextjs/project"
    }
  }
}
```

### Claude Code Setup

We include a comprehensive `CLAUDE.md` with project context and instructions.

**📖 [Full AI Assistant Setup Guide](https://carla.interworky.com/guide/ai-assistants)**

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

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `install`      | Install Carla widget in your app     |
| `scan`         | Scan API routes and generate tools   |
| `generate-mcp` | Generate HTTP MCP routes at /api/mcp |
| `sync`         | Sync enabled tools to Interworky     |
| `status`       | Show current sync status             |
| `fix`          | Auto-fix tool issues                 |
| `interactive`  | Interactive setup wizard             |
| `mcp`          | Start MCP server for AI editors      |

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
    args: { limit: 10 },
  }),
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
