/**
 * Sync Command
 *
 * Sync tools to Interworky backend
 */

import { Command } from 'commander';
import { logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';
import { InterworkyAPI } from '../api/interworky';

export interface SyncOptions {
  force?: boolean;
  enabledOnly?: boolean;
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

    // Filter tools if needed
    let toolsToSync = toolsConfig.tools;
    if (options.enabledOnly) {
      toolsToSync = toolsToSync.filter(t => t.enabled);
      logger.info(`Syncing ${toolsToSync.length} enabled tools (${toolsConfig.tools.length - toolsToSync.length} disabled)`);
    } else {
      logger.info(`Syncing ${toolsToSync.length} tools`);
    }

    if (toolsToSync.length === 0) {
      logger.warn('No tools to sync');
      return;
    }

    // Initialize API client
    logger.startSpinner('Connecting to Interworky...');
    const api = new InterworkyAPI(credentials.apiKey, credentials.apiUrl);

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
    .description('Sync tools to Interworky')
    .option('-f, --force', 'Force sync even if already synced')
    .option('--enabled-only', 'Only sync enabled tools')
    .action(syncCommand);
}
