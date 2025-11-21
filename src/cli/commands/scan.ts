/**
 * Scan Command
 *
 * Scans Next.js API routes and generates tool definitions
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config.js';
import { ApiRouteScanner } from '../scanner/api-routes.js';
import { ToolGenerator } from '../generator/tool-generator.js';
import { ToolsConfig, ScanResult } from '../../types/index.js';

export interface ScanOptions {
  force?: boolean;
  format?: 'json' | 'table';
}

export async function scanCommand(options: ScanOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    // Check if tools already exist
    if (!options.force && configManager.hasTools()) {
      logger.warn('Tools already exist. Use --force to rescan.');
      logger.info('Run: npx @interworky/carla-nextjs scan --force');
      return;
    }

    logger.section('🔍 Scanning Next.js API Routes');
    logger.startSpinner('Scanning project...');

    // Scan API routes
    const scanner = new ApiRouteScanner(configManager.getProjectRoot());
    const routes = await scanner.scan();

    if (routes.length === 0) {
      logger.failSpinner('No API routes found');
      logger.warn('Make sure you have API routes in:');
      logger.list(['app/api/**/route.ts', 'pages/api/**/*.ts']);
      return;
    }

    logger.succeedSpinner(`Found ${routes.length} API route files`);

    // Generate tools
    logger.startSpinner('Generating tool definitions...');
    const generator = new ToolGenerator();
    const { tools, recommendations } = generator.generate(routes);

    const enabledCount = tools.filter(t => t.enabled).length;
    const disabledCount = tools.length - enabledCount;

    logger.succeedSpinner(`Generated ${tools.length} tools`);

    // Create tools config
    const toolsConfig: ToolsConfig = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      tools,
      settings: {
        mcpEndpoint: '/api/mcp',
      },
    };

    // Save to file
    configManager.saveTools(toolsConfig);

    // Display results
    logger.section('📊 Summary');
    logger.success(`Total tools generated: ${tools.length}`);
    logger.info(`  ✓ Enabled: ${enabledCount}`);
    if (disabledCount > 0) {
      logger.info(`  ✗ Disabled: ${disabledCount}`);
    }

    // Display recommendations
    if (recommendations.length > 0) {
      logger.section('⚠️  Recommendations');
      recommendations.forEach(rec => {
        if (rec.type === 'security') {
          logger.warn(rec.message);
        } else {
          logger.info(rec.message);
        }
      });
    }

    // Next steps
    logger.section('📝 Generated File');
    logger.info('carla-tools.json');

    logger.section('✅ Next Steps');
    logger.list([
      'Review tools: cat carla-tools.json',
      'Initialize: npx @interworky/carla-nextjs init (if not done)',
      'Sync to Interworky: npx @interworky/carla-nextjs sync',
    ]);

    // Output JSON if requested
    if (options.format === 'json') {
      const result: ScanResult = {
        success: true,
        filesScanned: routes.length,
        toolsGenerated: tools.length,
        toolsEnabled: enabledCount,
        toolsDisabled: disabledCount,
        tools,
        recommendations,
      };
      console.log('\n' + JSON.stringify(result, null, 2));
    }
  } catch (error) {
    logger.stopSpinner();
    logger.error('Scan failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerScanCommand(program: Command): void {
  program
    .command('scan')
    .description('Scan Next.js API routes and generate tool definitions')
    .option('-f, --force', 'Force rescan even if tools exist')
    .option('--format <format>', 'Output format (json|table)', 'table')
    .action(scanCommand);
}
