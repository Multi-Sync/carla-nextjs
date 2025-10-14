/**
 * Interactive Command
 *
 * Interactive wizard for setting up carla-nextjs
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import { logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';
import { initCommand } from './init';
import { scanCommand } from './scan';
import { fixCommand } from './fix';
import { syncCommand } from './sync';

export async function interactiveCommand(): Promise<void> {
  try {
    logger.section('🚀 Carla NextJS Interactive Setup');

    const configManager = new ConfigManager();

    // Step 1: Check initialization
    const credentials = configManager.getCredentials();
    let needsInit = !credentials;

    if (!needsInit) {
      logger.success(`Already initialized for: ${configManager.loadConfig()?.organizationName}`);
      const { reinit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'reinit',
          message: 'Re-initialize with different credentials?',
          default: false,
        },
      ]);
      needsInit = reinit;
    }

    if (needsInit) {
      logger.section('Step 1: Initialize');
      await initCommand({});
    }

    // Step 2: Scan API routes
    const toolsConfig = configManager.loadTools();
    let needsScan = !toolsConfig;

    if (!needsScan) {
      logger.success(`Found ${toolsConfig!.tools.length} existing tools`);
      const { rescan } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'rescan',
          message: 'Re-scan API routes?',
          default: false,
        },
      ]);
      needsScan = rescan;
    }

    if (needsScan) {
      logger.section('Step 2: Scan API Routes');
      await scanCommand({ force: true });
    }

    // Reload tools after potential rescan
    const currentTools = configManager.loadTools();
    if (!currentTools) {
      logger.error('No tools found after scanning');
      return;
    }

    // Step 3: Review and enable/disable tools
    logger.section('Step 3: Review Tools');
    const { reviewTools } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'reviewTools',
        message: `Review and configure ${currentTools.tools.length} tools?`,
        default: true,
      },
    ]);

    if (reviewTools) {
      for (const tool of currentTools.tools) {
        console.log('\n' + '='.repeat(60));
        logger.info(`Tool: ${tool.name}`);
        logger.info(`Description: ${tool.description}`);
        logger.info(`Method: ${tool.method} ${tool.endpoint}`);
        logger.info(`Status: ${tool.enabled ? '✓ Enabled' : '✗ Disabled'}`);

        if (tool.issues && tool.issues.length > 0) {
          logger.warn(`Issues: ${tool.issues.join(', ')}`);
        }

        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do with this tool?',
            choices: [
              { name: 'Keep as is', value: 'keep' },
              { name: tool.enabled ? 'Disable' : 'Enable', value: 'toggle' },
              { name: 'Skip remaining tools', value: 'skip' },
            ],
          },
        ]);

        if (action === 'skip') {
          break;
        }

        if (action === 'toggle') {
          tool.enabled = !tool.enabled;
          logger.success(`Tool ${tool.enabled ? 'enabled' : 'disabled'}`);
        }
      }

      // Save changes
      configManager.saveTools({
        ...currentTools,
        tools: currentTools.tools,
        generatedAt: new Date().toISOString(),
      });
      logger.success('Changes saved');
    }

    // Step 4: Fix issues
    const toolsWithIssues = currentTools.tools.filter(t => t.issues && t.issues.length > 0);
    if (toolsWithIssues.length > 0) {
      logger.section('Step 4: Fix Issues');
      logger.warn(`Found ${toolsWithIssues.length} tools with issues`);

      const { fixIssues } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'fixIssues',
          message: 'Auto-fix these issues?',
          default: true,
        },
      ]);

      if (fixIssues) {
        await fixCommand({});
      }
    }

    // Step 5: Sync to Interworky
    logger.section('Step 5: Sync to Interworky');

    const reloadedTools = configManager.loadTools()!;
    const enabledCount = reloadedTools.tools.filter(t => t.enabled).length;

    const { syncNow } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'syncNow',
        message: `Sync ${enabledCount} enabled tools to Interworky?`,
        default: true,
      },
    ]);

    if (syncNow) {
      await syncCommand({ enabledOnly: true });
    }

    // Complete
    logger.section('✅ Setup Complete!');
    logger.success('Your Carla NextJS integration is ready');

    logger.section('📝 Quick Reference');
    logger.list([
      'Check status: npx carla-nextjs status',
      'Rescan APIs: npx carla-nextjs scan',
      'Sync changes: npx carla-nextjs sync',
      'Fix issues: npx carla-nextjs fix',
    ]);
  } catch (error) {
    logger.stopSpinner();
    logger.error('Interactive setup failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerInteractiveCommand(program: Command): void {
  program
    .command('interactive')
    .alias('i')
    .description('Interactive setup wizard')
    .action(interactiveCommand);
}
