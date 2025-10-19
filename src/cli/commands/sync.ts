/**
 * Sync Command
 *
 * Sync tools to Interworky backend
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config.js';
import { InterworkyAPI } from '../api/interworky.js';
import { Tool } from '../../types/index.js';
import { getApiKeyFromEnv, decodeApiKey } from '../../utils/decode-api-key.js';

export interface SyncOptions {
  force?: boolean;
  verbose?: boolean;
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  const configManager = new ConfigManager();

  // Enable debug logging if verbose flag is set
  const verbose = options.verbose || false;
  if (verbose) {
    logger.info('Verbose mode enabled');
  }

  try {
    // Get API key from environment
    const apiKey = getApiKeyFromEnv();

    if (verbose) {
      logger.info(`API Key (first 20 chars): ${apiKey.substring(0, 20)}...`);
    }

    // Decode and validate API key
    let orgId: string;
    try {
      const decoded = decodeApiKey(apiKey);
      orgId = decoded.orgId;
      logger.info(`Organization ID: ${orgId}`);

      if (verbose && decoded.assistantId) {
        logger.info(`Assistant ID: ${decoded.assistantId}`);
      }
    } catch (error) {
      logger.error('Failed to decode API key');
      if (error instanceof Error) {
        logger.error(error.message);
      }
      logger.info('Please check your NEXT_PUBLIC_CARLA_API_KEY in your .env file');
      process.exit(1);
    }

    // Check if tools exist
    const toolsConfig = configManager.loadTools();
    if (!toolsConfig) {
      logger.error('No tools found. Run: npx carla-nextjs scan');
      process.exit(1);
    }

    logger.section('🔄 Syncing Tools to Interworky');

    // Filter disabled tools (always filter by default for security)
    const toolsToSync = toolsConfig.tools.filter((t: Tool) => t.enabled);
    const disabledCount = toolsConfig.tools.length - toolsToSync.length;

    if (disabledCount > 0) {
      logger.info(
        `Syncing ${toolsToSync.length} enabled tools (${disabledCount} disabled tools excluded)`
      );
    } else {
      logger.info(`Syncing ${toolsToSync.length} enabled tools`);
    }

    if (toolsToSync.length === 0) {
      logger.warn('No tools to sync');
      return;
    }

    // Initialize API client
    logger.startSpinner('Connecting to Interworky...');
    const api = new InterworkyAPI(orgId);

    try {
      // Sync tools
      logger.updateSpinnerText('Syncing tools...');
      const result = await api.syncTools(toolsToSync);

      logger.succeedSpinner('Sync complete');

      // Update last sync time
      configManager.updateLastSync(new Date().toISOString());

      // Display results
      logger.section('✅ Sync Results');
      logger.success(`Successfully synced: ${result.synced} tools`);

      if (result.failed > 0) {
        logger.warn(`Failed to sync: ${result.failed} tools`);
        if (result.errors && result.errors.length > 0) {
          logger.error('Errors:');
          result.errors.forEach(err => logger.error(`  - ${err}`));
        }
      }

      logger.section('📝 Next Steps');
      logger.list([
        'Check status: npx carla-nextjs status',
        'View tools in Interworky dashboard',
        'Test your assistant with the new tools',
      ]);
    } catch (error) {
      logger.failSpinner('Sync failed');

      // Enhanced error reporting
      if (error instanceof Error) {
        logger.error(`Error: ${error.message}`);

        // Check for specific error types
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          logger.error('Authentication failed - API key may be invalid');
        } else if (error.message.includes('404')) {
          logger.error('API endpoint not found - please check your configuration');
        } else if (error.message.includes('500') || error.message.includes('502')) {
          logger.error('Server error - please try again later');
        } else if (error.message.includes('Network') || error.message.includes('ENOTFOUND')) {
          logger.error('Network error - please check your internet connection');
        }
      } else {
        logger.error(String(error));
      }

      logger.section('🔍 Debugging Information');
      logger.list([
        `Organization ID: ${orgId}`,
        `Tools to sync: ${toolsToSync.length}`,
        `API Endpoint: https://interworky.com/api-core/api`,
      ]);

      logger.section('💡 Troubleshooting');
      logger.list([
        'Verify NEXT_PUBLIC_CARLA_API_KEY in your .env file',
        'Check https://interworky.com/dashboard/integrations for your API key',
        'Ensure you have an active internet connection',
        'Try running: npx carla-nextjs status',
      ]);

      process.exit(1);
    }
  } catch (error) {
    logger.stopSpinner();
    logger.error('Sync failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerSyncCommand(program: Command): void {
  program
    .command('sync')
    .description('Sync enabled tools to Interworky (disabled tools are excluded)')
    .option('-f, --force', 'Force sync even if already synced')
    .option('-v, --verbose', 'Enable verbose logging for debugging')
    .action(syncCommand);
}
