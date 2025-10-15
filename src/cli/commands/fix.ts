/**
 * Fix Command
 *
 * Auto-fix common issues in tool definitions
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config.js';
import { ToolFixer, FixResult } from '../fixer/tool-fixer.js';
import { ToolsConfig } from '../../types/index.js';

export interface FixOptions {
  dryRun?: boolean;
}

export async function fixCommand(options: FixOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    // Check if tools exist
    const toolsConfig = configManager.loadTools();
    if (!toolsConfig) {
      logger.error('No tools found. Run: npx carla-nextjs scan');
      process.exit(1);
    }

    logger.section('🔧 Fixing Tool Issues');

    if (options.dryRun) {
      logger.info('Dry run mode - no changes will be saved');
    }

    logger.startSpinner('Analyzing tools...');

    // Find tools with issues
    const toolsWithIssues = toolsConfig.tools.filter(t => t.issues && t.issues.length > 0);
    logger.succeedSpinner(`Found ${toolsWithIssues.length} tools with potential issues`);

    // Fix all tools
    const fixer = new ToolFixer();
    const results = fixer.fixAll(toolsConfig.tools);

    // Count fixes
    const fixedTools = results.filter((r: FixResult) => r.fixed);
    const totalFixes = results.reduce((sum: number, r: FixResult) => sum + r.fixes.length, 0);

    if (fixedTools.length === 0) {
      logger.success('No issues found - all tools are good! 🎉');
      return;
    }

    // Display fixes
    logger.section(`✅ Fixed ${fixedTools.length} Tools (${totalFixes} changes)`);

    fixedTools.forEach(result => {
      logger.success(result.tool.name);
      result.fixes.forEach(fix => {
        logger.info(`  • ${fix}`);
      });
    });

    if (!options.dryRun) {
      // Save fixed tools
      const updatedConfig: ToolsConfig = {
        ...toolsConfig,
        tools: results.map(r => r.tool),
        generatedAt: new Date().toISOString(),
      };

      configManager.saveTools(updatedConfig);
      logger.success('Changes saved to carla-tools.json');

      // Next steps
      logger.section('📝 Next Steps');
      logger.list([
        'Review changes: git diff carla-tools.json',
        'Sync to Interworky: npx carla-nextjs sync',
        'Check status: npx carla-nextjs status',
      ]);
    } else {
      logger.section('📝 Next Steps');
      logger.info('Run without --dry-run to apply fixes');
    }
  } catch (error) {
    logger.stopSpinner();
    logger.error('Fix failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerFixCommand(program: Command): void {
  program
    .command('fix')
    .description('Auto-fix common issues in tool definitions')
    .option('--dry-run', 'Preview fixes without saving')
    .action(fixCommand);
}
