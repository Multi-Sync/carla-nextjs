#!/usr/bin/env node

/**
 * Carla NextJS CLI
 *
 * Main entry point for the command line interface
 */

import { loadNextjsEnv } from './utils/env-loader.js';

// Load environment variables from Next.js project .env files
// This must happen before any other imports that might read env vars
loadNextjsEnv();

import { Command } from 'commander';
import { registerScanCommand } from './commands/scan.js';
import { registerSyncCommand } from './commands/sync.js';
import { registerStatusCommand } from './commands/status.js';
import { registerFixCommand } from './commands/fix.js';
import { registerInteractiveCommand } from './commands/interactive.js';
import { registerGenerateMCPCommand } from './commands/generate-mcp.js';
import { registerInstallCommand } from './commands/install.js';
import chalk from 'chalk';

const program = new Command();

program.name('carla-nextjs').description('Next.js plugin for Carla AI assistant').version('1.0.0');

// ASCII art banner
const banner = `
╔═══════════════════════════════════════╗
║                                       ║
║   ${chalk.bold.cyan('Carla NextJS')}                      ║
║   ${chalk.gray('AI-powered tool generation')}       ║
║                                       ║
╚═══════════════════════════════════════╝
`;

console.log(banner);

// Register commands
registerScanCommand(program);
registerSyncCommand(program);
registerStatusCommand(program);
registerFixCommand(program);
registerInteractiveCommand(program);
registerGenerateMCPCommand(program);
registerInstallCommand(program);

// Handle natural language input (future)
const args = process.argv.slice(2);
if (args.length > 0 && args[0].includes(' ')) {
  console.log(chalk.yellow('ℹ️  Natural language mode coming soon!'));
  console.log(chalk.gray(`    You said: "${args[0]}"`));
  console.log(chalk.gray('    For now, use: npx carla-nextjs scan'));
  process.exit(0);
}

// Parse arguments
program.parse();
