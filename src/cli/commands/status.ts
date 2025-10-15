/**
 * Status Command
 *
 * Show current tool status and sync information
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config.js';
import { InterworkyAPI } from '../api/interworky.js';
import { Tool } from '../../types/index.js';
import { getApiKeyFromEnv, decodeApiKey } from '../../utils/decode-api-key.js';
import { INTERWORKY_API_URL } from '../../config/auth.js';

export interface StatusOptions {
  verbose?: boolean;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    logger.section('📊 Carla NextJS Status');

    // Get API key and decode
    let apiKey: string;
    let orgId: string;

    try {
      apiKey = getApiKeyFromEnv();
      const decoded = decodeApiKey(apiKey);
      orgId = decoded.orgId;

      logger.success(`Organization ID: ${orgId}`);
      logger.info(`API URL: ${INTERWORKY_API_URL}`);
    } catch (error) {
      logger.error('API key not configured');
      logger.info('Add NEXT_PUBLIC_CARLA_API_KEY to your .env.local file');
      logger.info('Get your API key from: https://interworky.com/dashboard/integrations');
      return;
    }

    // Check local tools
    const toolsConfig = configManager.loadTools();

    logger.section('📝 Local Tools');
    if (!toolsConfig) {
      logger.warn('No tools scanned');
      logger.info('Run: npx carla-nextjs scan');
    } else {
      const enabledCount = toolsConfig.tools.filter((t: Tool) => t.enabled).length;
      const disabledCount = toolsConfig.tools.length - enabledCount;
      const toolsWithIssues = toolsConfig.tools.filter((t: Tool) => t.issues && t.issues.length > 0);

      logger.success(`Total: ${toolsConfig.tools.length} tools`);
      logger.info(`  ✓ Enabled: ${enabledCount}`);
      if (disabledCount > 0) {
        logger.info(`  ✗ Disabled: ${disabledCount}`);
      }
      if (toolsWithIssues.length > 0) {
        logger.warn(`  ⚠️  With issues: ${toolsWithIssues.length}`);
      }
      logger.info(`  Generated: ${new Date(toolsConfig.generatedAt).toLocaleString()}`);

      // Show tools with issues if verbose
      if (options.verbose && toolsWithIssues.length > 0) {
        logger.section('⚠️  Tools with Issues');
        toolsWithIssues.forEach((tool: Tool) => {
          logger.warn(`${tool.name}:`);
          tool.issues!.forEach((issue: string) => {
            logger.info(`    - ${issue}`);
          });
        });
      }
    }

    // Check sync status
    logger.section('🔄 Sync Status');
    const lastSync = configManager.getLastSync();

    if (!lastSync) {
      logger.warn('Never synced');
      logger.info('Run: npx carla-nextjs sync');
    } else {
      logger.success(`Last synced: ${new Date(lastSync).toLocaleString()}`);

      // Calculate time since last sync
      const hoursSinceSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 24) {
        logger.warn(`Last sync was ${Math.floor(hoursSinceSync / 24)} days ago`);
      }
    }

    // Check API connection validity
    logger.section('🔑 API Connection');
    logger.startSpinner('Checking connection...');

    try {
      const api = new InterworkyAPI(orgId);
      const remoteMethods = await api.getTools();
      logger.succeedSpinner('Connection valid');

      if (options.verbose) {
        logger.success(`Remote tools: ${remoteMethods.length}`);

        // Compare with local
        if (toolsConfig) {
          const localCount = toolsConfig.tools.length;
          const diff = remoteMethods.length - localCount;

          if (diff > 0) {
            logger.info(`Remote has ${diff} more tools than local`);
          } else if (diff < 0) {
            logger.info(`Local has ${Math.abs(diff)} more tools than remote`);
          } else {
            logger.success('Local and remote tool counts match');
          }
        }
      }
    } catch (error) {
      logger.failSpinner('API connection failed');
      if (error instanceof Error) {
        logger.error(error.message);
      }
    }

    // Next steps
    logger.section('📝 Suggested Actions');
    const suggestions: string[] = [];

    if (!toolsConfig) {
      suggestions.push('Scan API routes: npx carla-nextjs scan');
    }
    if (!lastSync && toolsConfig) {
      suggestions.push('Sync tools: npx carla-nextjs sync');
    }
    if (lastSync && toolsConfig) {
      const hoursSinceSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 24) {
        suggestions.push('Sync tools again: npx carla-nextjs sync');
      }
    }
    if (toolsConfig) {
      const toolsWithIssues = toolsConfig.tools.filter((t: Tool) => t.issues && t.issues.length > 0);
      if (toolsWithIssues.length > 0) {
        suggestions.push('Fix tool issues: npx carla-nextjs fix');
      }
    }

    if (suggestions.length > 0) {
      logger.list(suggestions);
    } else {
      logger.success('Everything looks good! 🎉');
    }
  } catch (error) {
    logger.stopSpinner();
    logger.error('Failed to get status');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show current tool status and sync information')
    .option('-v, --verbose', 'Show detailed information')
    .action(statusCommand);
}
