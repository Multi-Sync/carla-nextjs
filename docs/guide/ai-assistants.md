# Using Carla with AI Assistants

Learn how to integrate Carla Next.js with Cursor, Claude Code, and other MCP-compatible AI coding assistants.

## Overview

Carla Next.js includes a Model Context Protocol (MCP) server that allows AI assistants to:
- Discover your Next.js API routes automatically
- Read tool definitions and parameters
- Understand your API structure
- Help you build and debug faster

## Compatible AI Tools

- ✅ **Cursor IDE** - Direct MCP integration
- ✅ **Claude Desktop** - Official MCP support
- ✅ **Claude Code** - Via CLAUDE.md instructions
- ✅ **VS Code with Continue** - MCP plugin support
- ✅ **Windsurf** - MCP integration
- ✅ **GitHub Copilot Chat** - Limited MCP support

## Quick Setup

### 1. Install Carla Next.js in Your Project

```bash
cd your-nextjs-project
npx @interworky/carla-nextjs install
```

### 2. Scan Your API Routes

```bash
npx @interworky/carla-nextjs scan
```

This creates `.carla/tools.json` with your API route definitions.

### 3. Configure Your AI Assistant

Choose your tool:

## Cursor IDE Setup

### Option 1: Automatic (Recommended)

Cursor can detect MCP servers automatically:

1. Open your Next.js project in Cursor
2. Press `Cmd/Ctrl + Shift + P`
3. Search for "MCP"
4. Select "Add MCP Server"
5. Choose "Carla Next.js" from the list
6. Done! ✅

### Option 2: Manual Configuration

Create `.cursor/mcp_config.json` in your project:

```json
{
  "mcpServers": {
    "carla-nextjs": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"],
      "env": {
        "NEXT_PUBLIC_CARLA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Then restart Cursor.

### Verify It's Working

Open Cursor's AI chat and ask:
```
What API routes are available in this project?
```

Cursor should list all your scanned routes!

## Claude Desktop Setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

**Important:** Use absolute path for `cwd`.

Restart Claude Desktop, then test:
```
Show me the API tools available via Carla
```

## Claude Code Setup

Claude Code uses `CLAUDE.md` for project context. We've already added comprehensive instructions!

Just make sure `CLAUDE.md` exists in your project root with Carla-specific information.

**Test with:**
```
Read CLAUDE.md and tell me about the Carla MCP server
```

## VS Code with Continue

Install the Continue extension, then add to `.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "carla-nextjs",
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"]
    }
  ]
}
```

## Starting the MCP Server Manually

For debugging or testing:

```bash
# Start MCP server
npx @interworky/carla-nextjs mcp

# With debug output
npx @interworky/carla-nextjs mcp --debug

# Specify port
npx @interworky/carla-nextjs mcp --port 3001
```

The server will run until you stop it (Ctrl+C).

## What Tools Are Exposed?

The MCP server exposes all enabled tools from `.carla/tools.json`.

**Example tools:**
- `get_products` - GET /api/products
- `create_order` - POST /api/orders
- `get_user_profile` - GET /api/user
- etc.

**View your tools:**
```bash
cat .carla/tools.json
```

## Example Prompts

### With Cursor or Claude Desktop

**Discover routes:**
```
What API routes exist in this Next.js app?
```

**Understand a route:**
```
Explain what the /api/orders/[id] route does
```

**Generate code:**
```
Create a new API route for /api/products/search that accepts a query parameter
```

**Debug:**
```
Why isn't my /api/users route being detected by Carla?
```

### With Claude Code

**Scan routes:**
```
Run the Carla scan command and show me what was found
```

**Add feature:**
```
Add a new API route for user authentication and make sure Carla can detect it
```

**Fix issues:**
```
The scanner says my route is invalid. Can you help fix the TypeScript types?
```

## Enabling/Disabling Tools

Edit `.carla/tools.json` to control which routes are exposed to AI:

```json
{
  "tools": [
    {
      "name": "delete_user",
      "method": "DELETE",
      "path": "/api/users/[id]",
      "enabled": false  // ⬅ Disabled - AI won't see this
    },
    {
      "name": "get_products",
      "method": "GET",
      "path": "/api/products",
      "enabled": true   // ⬅ Enabled - AI can use this
    }
  ]
}
```

After changing, restart your MCP server or AI assistant.

## Troubleshooting

### MCP Server Not Starting

```bash
# Check if already running
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Try again
npx @interworky/carla-nextjs mcp
```

### Tools Not Showing Up

1. **Re-scan routes:**
   ```bash
   npx @interworky/carla-nextjs scan
   ```

2. **Check tools.json exists:**
   ```bash
   cat .carla/tools.json
   ```

3. **Restart AI assistant**

### Permission Errors

Make sure your API key is set:
```bash
echo 'NEXT_PUBLIC_CARLA_API_KEY="your-key"' >> .env.local
```

### Wrong Tools Detected

```bash
# Re-scan with clean slate
rm -rf .carla
npx @interworky/carla-nextjs scan
```

## Advanced Configuration

### Custom Transport

```json
{
  "mcpServers": {
    "carla-nextjs": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"],
      "transport": "sse"  // or "http"
    }
  }
}
```

### Multiple Projects

```json
{
  "mcpServers": {
    "carla-project-a": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"],
      "cwd": "/path/to/project-a"
    },
    "carla-project-b": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"],
      "cwd": "/path/to/project-b"
    }
  }
}
```

### Environment Variables

```json
{
  "mcpServers": {
    "carla-nextjs": {
      "command": "npx",
      "args": ["@interworky/carla-nextjs", "mcp"],
      "env": {
        "NEXT_PUBLIC_CARLA_API_KEY": "your-key",
        "CARLA_API_URL": "https://custom-api.com",
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Best Practices

### 1. Keep Tools Updated

Re-scan after adding new routes:
```bash
git pull
npx @interworky/carla-nextjs scan
```

### 2. Disable Sensitive Routes

Don't expose dangerous operations:
```json
{
  "name": "delete_all_users",
  "enabled": false  // ⬅ Keep disabled!
}
```

### 3. Use Clear Descriptions

AI assistants use descriptions to understand intent:

```typescript
// Good - clear description
export async function GET() {
  // Gets list of all products with prices and stock status
  return Response.json(products)
}

// Better - even more context
/**
 * Returns paginated list of products
 * @param limit - Max products to return (default 20)
 * @param offset - Pagination offset
 * @returns Product array with id, name, price, inStock
 */
export async function GET(request: Request) {
  // ...
}
```

### 4. Version Control MCP Config

Add to `.gitignore`:
```
.cursor/mcp_config.json  # Contains API keys
```

But commit:
```
.carla/tools.json        # Tool definitions (no secrets)
.cursorrules             # Cursor rules
CLAUDE.md                # Claude Code instructions
```

## Security Considerations

⚠️ **Important:**
- MCP server runs locally with your permissions
- AI assistants can read tool definitions but can't execute them directly
- API keys in MCP config are local to your machine
- Never commit API keys to git
- Disable destructive routes (DELETE, etc.) in production

## Example Workflow

Here's a complete workflow using Cursor:

1. **Create a new API route:**
   ```typescript
   // app/api/hello/route.ts
   export async function GET() {
     return Response.json({ message: 'Hello!' })
   }
   ```

2. **Scan for new route:**
   ```bash
   npx @interworky/carla-nextjs scan
   ```

3. **Ask Cursor:**
   ```
   What's the new /api/hello route I just added?
   ```

4. **Cursor responds:**
   ```
   I see you added GET /api/hello which returns a JSON
   object with a message property. Would you like me to:
   - Add error handling?
   - Add request parameters?
   - Write tests for it?
   ```

5. **Iterate:**
   ```
   Yes, add a name parameter to customize the greeting
   ```

6. **Cursor updates the code:**
   ```typescript
   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url)
     const name = searchParams.get('name') || 'World'
     return Response.json({ message: `Hello, ${name}!` })
   }
   ```

7. **Re-scan and sync:**
   ```bash
   npx @interworky/carla-nextjs scan
   npx @interworky/carla-nextjs sync
   ```

Now your AI assistant knows about the updated route!

## Community Examples

Share your MCP setup on [Discord](https://discord.com/invite/YHmsekzMV5)!

See what others are building:
- [Cursor + Carla Workflow Video](#)
- [Claude Desktop Integration Guide](#)
- [Best Prompts for API Development](#)

## Next Steps

- [CLI Reference](/reference/cli) - All available commands
- [Configuration](/reference/configuration) - Detailed config options
- [Troubleshooting](/guide/troubleshooting) - Common issues
- [Examples](/examples/) - Real-world projects

---

**Questions?** Join our [Discord](https://discord.com/invite/YHmsekzMV5) or open an issue on [GitHub](https://github.com/Multi-Sync/carla-nextjs/issues).
