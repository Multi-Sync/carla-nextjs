#!/usr/bin/env node

/**
 * Carla NextJS CLI
 *
 * Main entry point for the command line interface
 */

import { Command } from 'commander';
import { registerInitCommand } from './commands/init';
import { registerScanCommand } from './commands/scan';
import { registerSyncCommand } from './commands/sync';
import { registerStatusCommand } from './commands/status';
import { registerFixCommand } from './commands/fix';
import { registerInteractiveCommand } from './commands/interactive';
import chalk from 'chalk';

const program = new Command();

program
  .name('carla-nextjs')
  .description('Next.js plugin for Carla AI assistant')
  .version('1.0.0');

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
registerInitCommand(program);
registerScanCommand(program);
registerSyncCommand(program);
registerStatusCommand(program);
registerFixCommand(program);
registerInteractiveCommand(program);

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
