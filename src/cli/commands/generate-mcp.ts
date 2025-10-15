/**
 * Generate MCP Command
 *
 * Generates HTTP MCP routes for Model Context Protocol support
 * Creates:
 * - GET /api/mcp/tools - Tool catalog
 * - POST /api/mcp/call - Tool execution proxy
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

    logger.section('🔌 Generating MCP Routes');

    // Detect project type
    const isTypeScript = configManager.isTypeScriptProject();
    const fileType = isTypeScript ? 'TypeScript' : 'JavaScript';
    logger.info(`Detected ${fileType} project`);

    // Initialize generator
    const generator = new MCPRouteGenerator({
      projectRoot: configManager.getProjectRoot(),
      toolsConfig,
      isTypeScript,
    });

    // Check if already exists
    if (generator.routeExists() && !options.force) {
      logger.warn('MCP routes already exist');
      logger.info('Use --force to regenerate');
      return;
    }

    // Count enabled tools
    const enabledTools = toolsConfig.tools.filter(t => t.enabled);
    const disabledCount = toolsConfig.tools.length - enabledTools.length;

    logger.startSpinner('Generating MCP routes...');

    // Generate the routes
    const routeFilePaths = await generator.generate();

    logger.succeedSpinner('MCP routes generated');

    // Display results
    logger.section('✅ Success');
    routeFilePaths.forEach(filePath => {
      logger.success(`Created: ${filePath.replace(configManager.getProjectRoot(), '.')}`);
    });
    logger.info(`Exposed ${enabledTools.length} enabled tools`);

    if (disabledCount > 0) {
      logger.info(`Excluded ${disabledCount} disabled tools`);
    }

    logger.section('📋 MCP Endpoints');
    logger.info('Tool Catalog:  GET  /api/mcp/tools');
    logger.info('Execute Tool:  POST /api/mcp/call');

    logger.section('🔧 Usage Example');
    logger.code(`// Get available tools
fetch('http://localhost:3000/api/mcp/tools')

// Execute a tool
fetch('http://localhost:3000/api/mcp/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'get_users',
    args: { limit: 10 }
  })
})`);

    logger.section('✅ Next Steps');
    logger.list([
      'Start dev server: npm run dev',
      'Test endpoints: curl http://localhost:3000/api/mcp/tools',
      'Integrate with your AI agent or application',
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
    .description('Generate HTTP MCP routes at /api/mcp')
    .option('-f, --force', 'Force regenerate even if exists')
    .action(generateMCPCommand);
}
