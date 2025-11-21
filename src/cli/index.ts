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
// NEW COMMANDS - The QA & Clean-Up Crew
import { registerDoctorCommand } from './commands/doctor.js';
import { registerCleanCommand } from './commands/clean.js';
import { registerVerifyCommand } from './commands/verify.js';
import { registerInitCICommand } from './commands/init-ci.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('carla-nextjs')
  .description('The QA & Clean-Up Crew for Next.js Vibe Coders')
  .version('2.0.0');

// ASCII art banner - "Sea Light" theme
const banner = `
${chalk.bold.cyan('⚓ ════════════════════════════════════════════════════ ⚓')}
${chalk.bold.white('                        CARLA')}
${chalk.cyan('          Code with Vibes. Ship with Confidence.')}

${chalk.gray('          The AI QA Agent for Next.js Vibe Coders')}
${chalk.bold.cyan('⚓ ════════════════════════════════════════════════════ ⚓')}
`;

console.log(banner);

// Register commands
// NEW QA COMMANDS - The Killer Features
registerDoctorCommand(program); // 👨‍⚕️ AI-powered hydration & error fixing
registerCleanCommand(program); // 🧹 Unused code & duplicate detection
registerVerifyCommand(program); // 🔗 Broken link detection & auto-fix
registerInitCICommand(program); // 🛡️ CI/CD setup (GitHub Actions + Husky)

// ORIGINAL COMMANDS - Still valuable
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
