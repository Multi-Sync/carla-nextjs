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
  accessToken?: string;
  apiUrl?: string;
  assistantId?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    logger.section('🚀 Initialize Carla NextJS');

    // Check if already initialized
    if (configManager.hasCredentials() && !options.accessToken) {
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
    let accessToken = options.accessToken || process.env.INTERWORKY_ACCESS_TOKEN;
    if (!accessToken) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'accessToken',
          message: 'Enter your Interworky access token (JWT):',
          validate: (input: string) => {
            if (!input || input.trim().length === 0) {
              return 'Access token is required';
            }
            return true;
          },
        },
      ]);
      accessToken = answers.accessToken;
    }

    // Get assistant ID
    let assistantId = options.assistantId || process.env.INTERWORKY_ASSISTANT_ID;
    if (!assistantId) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'assistantId',
          message: 'Enter your assistant ID:',
          validate: (input: string) => {
            if (!input || input.trim().length === 0) {
              return 'Assistant ID is required';
            }
            return true;
          },
        },
      ]);
      assistantId = answers.assistantId;
    }

    // Get API URL (with default)
    let apiUrl = options.apiUrl || process.env.INTERWORKY_API_URL;
    if (!apiUrl) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiUrl',
          message: 'Interworky API URL:',
          default: 'http://localhost:8080/api',
        },
      ]);
      apiUrl = answers.apiUrl;
    }

    logger.startSpinner('Validating credentials...');

    try {
      // Save configuration
      configManager.saveCredentials({
        accessToken: accessToken!,
        apiUrl: apiUrl!,
        assistantId: assistantId!,
      });

      logger.succeedSpinner('Configuration saved');

      logger.section('✅ Initialization Complete');
      logger.success(`Assistant ID: ${assistantId}`);
      logger.success(`API URL: ${apiUrl}`);

      logger.section('📝 Next Steps');
      logger.list([
        'Scan your API routes: npx carla-nextjs scan',
        'Review generated tools: cat carla-tools.json',
        'Sync to Interworky: npx carla-nextjs sync',
      ]);
    } catch (error) {
      logger.failSpinner('Initialization failed');
      if (error instanceof Error) {
        logger.error(error.message);
      }
      logger.info('Please check your credentials and try again');
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
    .option('-t, --access-token <token>', 'Interworky access token (JWT)')
    .option('-a, --assistant-id <id>', 'Assistant ID')
    .option('-u, --api-url <url>', 'Interworky API URL', 'http://localhost:8080/api')
    .action(initCommand);
}
