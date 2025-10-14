/**
 * Generate MCP Command
 *
 * Generates /api/_mcp/route.ts for Model Context Protocol support
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config.js';
import { MCPRouteGenerator } from '../generator/mcp-route-generator.js';

export interface GenerateMCPOptions {
  force?: boolean;
}

export async function generateMCPCommand(options: GenerateMCPOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    // Check if tools exist
    const toolsConfig = configManager.loadTools();
    if (!toolsConfig) {
      logger.error('No tools found. Run: npx carla-nextjs scan');
      process.exit(1);
    }

    logger.section('🔌 Generating MCP Endpoint');

    // Initialize generator
    const generator = new MCPRouteGenerator({
      projectRoot: configManager.getProjectRoot(),
      toolsConfig,
    });

    // Check if already exists
    if (generator.routeExists() && !options.force) {
      logger.warn('MCP route already exists at /api/_mcp/route.ts');
      logger.info('Use --force to regenerate');
      return;
    }

    // Count enabled tools
    const enabledTools = toolsConfig.tools.filter(t => t.enabled);
    const disabledCount = toolsConfig.tools.length - enabledTools.length;

    logger.startSpinner('Generating MCP route...');

    // Generate the route
    const routeFilePath = await generator.generate();

    logger.succeedSpinner('MCP route generated');

    // Display results
    logger.section('✅ Success');
    logger.success(`Created: ${routeFilePath.replace(configManager.getProjectRoot(), '.')}`);
    logger.info(`Exposed ${enabledTools.length} enabled tools`);

    if (disabledCount > 0) {
      logger.info(`Excluded ${disabledCount} disabled tools`);
    }

    logger.section('📋 MCP Endpoint');
    logger.info('Local:  http://localhost:3000/api/_mcp');
    logger.info('Production: https://yourapp.com/api/_mcp');

    logger.section('🤖 Usage with AI Agents');
    logger.info('Add to your MCP configuration:');
    logger.code(`{
  "mcpServers": {
    "my-nextjs-app": {
      "url": "http://localhost:3000/api/_mcp"
    }
  }
}`);

    logger.section('✅ Next Steps');
    logger.list([
      'Start your dev server: npm run dev',
      'Configure your AI agent (Cursor, Claude Desktop, etc.)',
      'Test with: curl -X POST http://localhost:3000/api/_mcp \\',
      '  -H "Content-Type: application/json" \\',
      '  -d \'{"method":"tools/list"}\'',
    ]);
  } catch (error) {
    logger.stopSpinner();
    logger.error('Generation failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerGenerateMCPCommand(program: Command): void {
  program
    .command('generate-mcp')
    .description('Generate MCP endpoint at /api/_mcp')
    .option('-f, --force', 'Force regenerate even if exists')
    .action(generateMCPCommand);
}
