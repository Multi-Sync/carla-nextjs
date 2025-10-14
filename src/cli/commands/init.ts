/**
 * Init Command
 *
 * Initialize and authenticate with Interworky
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import { logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';
import { InterworkyAPI } from '../api/interworky';

export interface InitOptions {
  apiKey?: string;
  apiUrl?: string;
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

    // Get API key
    let apiKey = options.apiKey;
    if (!apiKey) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your Interworky API key:',
          validate: (input: string) => {
            if (!input || input.trim().length === 0) {
              return 'API key is required';
            }
            return true;
          },
        },
      ]);
      apiKey = answers.apiKey;
    }

    // Get API URL (with default)
    let apiUrl = options.apiUrl;
    if (!apiUrl) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiUrl',
          message: 'Interworky API URL:',
          default: 'https://api.interworky.com',
        },
      ]);
      apiUrl = answers.apiUrl;
    }

    // Validate API key
    logger.startSpinner('Validating API key...');
    const api = new InterworkyAPI(apiKey!, apiUrl!);

    try {
      const orgInfo = await api.validateApiKey();
      logger.succeedSpinner('API key validated');

      // Save configuration
      configManager.saveCredentials({
        apiKey: apiKey!,
        apiUrl: apiUrl!,
        organizationId: orgInfo.organizationId,
        organizationName: orgInfo.organizationName,
      });

      logger.section('✅ Initialization Complete');
      logger.success(`Organization: ${orgInfo.organizationName}`);
      logger.success(`API URL: ${apiUrl}`);

      logger.section('📝 Next Steps');
      logger.list([
        'Scan your API routes: npx carla-nextjs scan',
        'Review generated tools: cat carla-tools.json',
        'Sync to Interworky: npx carla-nextjs sync',
      ]);
    } catch (error) {
      logger.failSpinner('API key validation failed');
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
    .option('-k, --api-key <key>', 'Interworky API key')
    .option('-u, --api-url <url>', 'Interworky API URL', 'https://api.interworky.com')
    .action(initCommand);
}
