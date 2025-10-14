# carla-nextjs

Next.js plugin for Carla AI assistant with automatic API route scanning and intelligent tool generation.

## Features

- 🔍 **Automatic API Scanning** - Scans your Next.js API routes and generates tools automatically
- 🤖 **AI-Native Development** - MCP server integration for Cursor, Claude Desktop, and VS Code
- 🚀 **Zero Config** - Works out of the box with sensible defaults
- 📝 **Natural Language CLI** - Control via simple commands
- 🔄 **Realtime API** - Built for OpenAI's Realtime API (text & voice)
- 🛠️ **Auto-Fix** - Automatically fixes common issues with tool definitions
- 🔐 **Secure** - Tools stored in Interworky's organization methods system

## Installation

```bash
npm install carla-nextjs
```

## Quick Start

### 1. Initialize

```bash
npx carla-nextjs init
```

### 2. Scan Your API Routes

```bash
npx carla-nextjs scan
```

### 3. Review & Sync

```bash
# Review the generated tools
cat carla-tools.json

# Sync to Interworky
npx carla-nextjs sync
```

### 4. Add to Your App

```tsx
// app/layout.tsx
import { CarlaProvider } from 'carla-nextjs';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CarlaProvider apiKey={process.env.NEXT_PUBLIC_CARLA_API_KEY}>
          {children}
        </CarlaProvider>
      </body>
    </html>
  );
}
```

### 5. Deploy! 🎉

That's it! Your Carla assistant now knows about all your API endpoints.

## AI-Native Development

### MCP Server (for Cursor, Claude Desktop)

Add to your MCP config:

```json
{
  "carla-nextjs": {
    "command": "npx",
    "args": ["carla-nextjs", "mcp"],
    "cwd": "/path/to/your/project"
  }
}
```

Now your AI assistant can:
- Scan your APIs automatically
- Fix tool issues
- Sync changes to Interworky
- Generate integration code

### Natural Language CLI

```bash
npx carla-nextjs "scan my project"
npx carla-nextjs "what tools do I have?"
npx carla-nextjs "fix the broken tools"
npx carla-nextjs "disable all DELETE methods"
```

## Commands

- `init` - Initialize and authenticate with Interworky
- `scan` - Scan API routes and generate tools
- `sync` - Sync tools to Interworky
- `status` - Show current tool status
- `fix` - Auto-fix common issues
- `interactive` - Interactive setup wizard
- `mcp` - Start MCP server for AI assistants

## Documentation

- [Getting Started](docs/getting-started.md)
- [CLI Reference](docs/cli-reference.md)
- [API Reference](docs/api-reference.md)
- [MCP Integration](docs/mcp-integration.md)
- [Troubleshooting](docs/troubleshooting.md)

## How It Works

1. **Scan**: CLI scans your `app/api/` routes using TypeScript AST
2. **Generate**: Creates tool definitions with parameters, descriptions
3. **Store**: Syncs to Interworky's organization_methods database
4. **Load**: Carla fetches tools at runtime via API key
5. **Execute**: Tools attached to RealtimeAgent, executed on user queries

## Examples

See the [examples](examples/) directory for complete projects:

- [E-commerce Store](examples/ecommerce)
- [Blog Platform](examples/blog)
- [SaaS Dashboard](examples/saas)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

## Support

- 📧 Email: hello@interworky.com
- 💬 Discord: [Join our community](https://discord.gg/interworky)
- 📚 Docs: [docs.interworky.com](https://docs.interworky.com)
