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

export interface SyncOptions {
  force?: boolean;
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    // Check if initialized
    const credentials = configManager.getCredentials();
    if (!credentials) {
      logger.error('Not initialized. Run: npx carla-nextjs init');
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
    let toolsToSync = toolsConfig.tools.filter((t: Tool) => t.enabled);
    const disabledCount = toolsConfig.tools.length - toolsToSync.length;

    if (disabledCount > 0) {
      logger.info(`Syncing ${toolsToSync.length} enabled tools (${disabledCount} disabled tools excluded)`);
    } else {
      logger.info(`Syncing ${toolsToSync.length} enabled tools`);
    }

    if (toolsToSync.length === 0) {
      logger.warn('No tools to sync');
      return;
    }

    // Initialize API client
    logger.startSpinner('Connecting to Interworky...');
    const api = new InterworkyAPI(credentials.accessToken, credentials.apiUrl);

    try {
      // Sync tools
      logger.updateSpinnerText('Syncing tools...');
      const result = await api.syncTools(toolsToSync, credentials.organizationId);

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
      if (error instanceof Error) {
        logger.error(error.message);
      }
      logger.info('Please check your API key and try again');
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
    .action(syncCommand);
}
