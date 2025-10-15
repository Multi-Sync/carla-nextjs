/**
 * Init Command
 *
 * Initialize and authenticate with Interworky
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import { logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config.js';
import { InterworkyAPI } from '../api/interworky.js';

export interface InitOptions {
  apiKey?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    logger.section('🚀 Initialize Carla NextJS');

    // Check if already initialized
    if (configManager.hasCredentials() && !options.apiKey) {
      const { reinit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'reinit',
          message: 'Already initialized. Re-initialize?',
          default: false,
        },
      ]);

      if (!reinit) {
        logger.info('Initialization cancelled');
        return;
      }
    }

    // Check environment variable first
    let apiKey = options.apiKey || process.env.INTERWORKY_API_KEY;
    if (!apiKey) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your Next.js API key from Interworky:',
          validate: (input: string) => {
            if (!input || input.trim().length === 0) {
              return 'API key is required';
            }
            // Validate it's a valid base64 string
            try {
              Buffer.from(input, 'base64').toString('utf-8');
              return true;
            } catch (error) {
              return 'Invalid API key format';
            }
          },
        },
      ]);
      apiKey = answers.apiKey;
    }

    logger.startSpinner('Validating credentials...');

    try {
      // Decode and validate API key
      const decoded = Buffer.from(apiKey!, 'base64').toString('utf-8');
      const [organizationId, accessToken] = decoded.split('$$');

      if (!organizationId || !accessToken) {
        throw new Error('Invalid API key format');
      }

      // Save API key
      configManager.saveApiKey(apiKey!);

      logger.succeedSpinner('Configuration saved');

      logger.section('✅ Initialization Complete');
      logger.success(`Organization ID: ${organizationId}`);
      logger.success(`API URL: https://interworky.com/api-core/api`);

      logger.section('📝 Next Steps');
      logger.list([
        'Scan your API routes: npx carla-nextjs scan',
        'Review generated tools: cat carla-tools.json',
        'Sync to Interworky: npx carla-nextjs sync',
        'Install Carla widget: npx carla-nextjs install',
      ]);
    } catch (error) {
      logger.failSpinner('Initialization failed');
      if (error instanceof Error) {
        logger.error(error.message);
      }
      logger.info('Please check your API key and try again');
      process.exit(1);
    }
  } catch (error) {
    logger.stopSpinner();
    logger.error('Initialization failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize and authenticate with Interworky')
    .option('-k, --api-key <key>', 'Next.js API key from Interworky')
    .action(initCommand);
}
