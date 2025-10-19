# Contributing

Thank you for your interest in contributing to Carla Next.js! This guide will help you get started with development.

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git

### Getting Started

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/carla-nextjs.git
cd carla-nextjs
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the project**

```bash
npm run build
```

4. **Link for local testing**

```bash
npm link
```

Now you can use `carla-nextjs` commands globally in your terminal.

## Project Structure

```
carla-nextjs/
├── src/
│   ├── cli/           # CLI commands (scan, sync, install, mcp, etc.)
│   ├── scanner/       # TypeScript AST route scanner
│   ├── generator/     # Tool definition generator
│   ├── mcp/           # MCP server implementation
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper utilities
├── bin/
│   └── cli.js         # Entry point for CLI
├── templates/         # Widget component templates
├── docs/              # VitePress documentation
└── dist/              # Compiled JavaScript (generated)
```

## Development Workflow

### Building

```bash
# Compile TypeScript once
npm run build

# Watch mode for active development
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Testing CLI Commands Locally

After building, you can test CLI commands:

```bash
# Using the linked global command
carla-nextjs --help
carla-nextjs scan

# Or directly with node
node bin/cli.js scan
```

## Code Style Guidelines

### TypeScript

- **Use explicit types** for function parameters and return values
- **Prefer interfaces** over type aliases for object shapes
- **Avoid `any`** - use `unknown` with type guards instead
- **Use const assertions** where appropriate

Example:
```typescript
// Good
export async function scanRoutes(projectRoot: string): Promise<Tool[]> {
  // implementation
}

// Bad
export async function scanRoutes(projectRoot) {
  // implementation
}
```

### Error Handling

Always provide meaningful error messages with context:

```typescript
// Good - specific error with context
throw new Error(`Failed to scan route ${filePath}: ${error.message}`)

// Bad - generic error
throw new Error('Something went wrong')
```

### CLI Feedback

Use `ora` and `chalk` for clear user feedback:

```typescript
import ora from 'ora'
import chalk from 'chalk'

const spinner = ora('Processing...').start()

try {
  // Do work
  spinner.succeed(chalk.green('Success!'))
} catch (error) {
  spinner.fail(chalk.red(`Failed: ${error.message}`))
  process.exit(1)
}
```

### Async/Await

- Always use `try/catch` for async operations
- Use `Promise.all()` for parallel operations when possible
- Provide clear error context

## Adding a New CLI Command

1. **Create command file** in `src/cli/commands/`:

```typescript
import { Command } from 'commander'
import { logger } from '../utils/logger.js'

export async function myCommand(): Promise<void> {
  logger.section('🚀 My Command')

  try {
    logger.startSpinner('Processing...')

    // Your implementation here

    logger.succeedSpinner('Done!')
  } catch (error) {
    logger.failSpinner('Failed')
    logger.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

export function registerMyCommand(program: Command): void {
  program
    .command('mycommand')
    .description('Description of what this does')
    .action(myCommand)
}
```

2. **Register in** `src/cli/index.ts`:

```typescript
import { registerMyCommand } from './commands/mycommand.js'

// In the program setup
registerMyCommand(program)
```

## Submitting Changes

### Pull Request Process

1. **Create a feature branch**

```bash
git checkout -b feature/my-new-feature
```

2. **Make your changes**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

```bash
npm run build
npm test
npm run lint
```

4. **Commit your changes**

```bash
git add .
git commit -m "feat: add my new feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Adding tests

5. **Push to your fork**

```bash
git push origin feature/my-new-feature
```

6. **Create a Pull Request**
   - Go to the [repository](https://github.com/Multi-Sync/carla-nextjs)
   - Click "New Pull Request"
   - Provide a clear description of your changes
   - Reference any related issues

### PR Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update documentation for user-facing changes
- Ensure all tests pass
- Respond to review feedback promptly

## Testing Your Changes

### Testing with a Real Next.js Project

1. **Build carla-nextjs**

```bash
cd carla-nextjs
npm run build
npm link
```

2. **Link in your test project**

```bash
cd /path/to/your/nextjs/project
npm link @interworky/carla-nextjs
```

3. **Test commands**

```bash
npx @interworky/carla-nextjs scan
npx @interworky/carla-nextjs install
```

4. **Unlink when done**

```bash
npm unlink @interworky/carla-nextjs
```

## Documentation

Documentation is built with [VitePress](https://vitepress.dev/).

### Running Docs Locally

```bash
# Start dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

### Adding Documentation

- Guides go in `docs/guide/`
- API reference goes in `docs/reference/`
- Examples go in `docs/examples/`
- Update sidebar in `docs/.vitepress/config.ts`

## Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update version in `docs/.vitepress/config.ts`
3. Update `CHANGELOG.md` with changes
4. Commit: `git commit -m "chore: bump version to X.Y.Z"`
5. Tag: `git tag vX.Y.Z`
6. Push: `git push origin main --tags`
7. GitHub Actions will automatically publish to npm

## Need Help?

- **Discord**: Join our [Discord community](https://discord.com/invite/YHmsekzMV5)
- **Issues**: Check [GitHub Issues](https://github.com/Multi-Sync/carla-nextjs/issues)
- **Discussions**: Start a [GitHub Discussion](https://github.com/Multi-Sync/carla-nextjs/discussions)

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this tool together to help developers add AI capabilities to their Next.js apps.

Thank you for contributing! 🎉
