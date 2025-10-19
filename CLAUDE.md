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
Each command is in `src/cli/<command>.ts`:
- `scan.ts` - Scans Next.js project for API routes
- `sync.ts` - Syncs tools to Interworky API
- `install.ts` - Installs widget component
- `mcp.ts` - Starts MCP server
- `status.ts` - Shows current status
- `fix.ts` - Auto-fixes common issues

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

## Testing the CLI Locally

```bash
# Build first
npm run build

# Test CLI commands
node bin/cli.js --help
node bin/cli.js scan
node bin/cli.js status

# Or link globally
npm link
carla-nextjs --help
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
throw new Error(`Failed to scan route ${filePath}: ${error.message}`)

// Bad - generic errors
throw new Error('Something went wrong')
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
import { Command } from 'commander'
import ora from 'ora'
import chalk from 'chalk'

export function registerMyCommand(program: Command) {
  program
    .command('mycommand')
    .description('Description of what this does')
    .action(async () => {
      const spinner = ora('Doing something...').start()

      try {
        // Your logic here
        spinner.succeed(chalk.green('Success!'))
      } catch (error) {
        spinner.fail(chalk.red(`Failed: ${error.message}`))
        process.exit(1)
      }
    })
}
```

2. Register in `src/cli/index.ts`:
```typescript
import { registerMyCommand } from './cli/mycommand'
// ...
registerMyCommand(program)
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

**Scanning routes:**
"Scan my Next.js API routes and show me what tools were found"

**Adding a new feature:**
"Add a new CLI command called 'validate' that checks if all tools have proper descriptions"

**Fixing issues:**
"The scanner is not detecting my API routes in the pages directory. Can you help debug?"

**Documentation:**
"Update the getting started guide to include Windows-specific installation steps"

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
