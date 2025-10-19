/**
 * Install Command
 *
 * Install Carla widget in Next.js application
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { ConfigManager } from '../utils/config.js';
import { getApiKeyFromEnv } from '../../utils/decode-api-key.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InstallOptions {
  pages?: string;
  delay?: number;
  landing?: boolean;
}

export async function installCommand(options: InstallOptions): Promise<void> {
  const configManager = new ConfigManager();

  try {
    logger.section('📦 Install Carla Widget');

    // Get API key from environment
    const apiKey = getApiKeyFromEnv();

    // Find layout file
    const projectRoot = configManager.getProjectRoot();
    const possibleLayouts = [
      path.join(projectRoot, 'src', 'app', 'layout.tsx'),
      path.join(projectRoot, 'src', 'app', 'layout.js'),
      path.join(projectRoot, 'app', 'layout.tsx'),
      path.join(projectRoot, 'app', 'layout.js'),
    ];

    let layoutPath: string | null = null;
    for (const possiblePath of possibleLayouts) {
      if (fs.existsSync(possiblePath)) {
        layoutPath = possiblePath;
        break;
      }
    }

    if (!layoutPath) {
      logger.error('Could not find app/layout.tsx or app/layout.js');
      logger.info('Please create a layout file in your app directory');
      process.exit(1);
    }

    logger.info(`Found layout: ${path.relative(projectRoot, layoutPath)}`);

    // Read layout file
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    // Check if already installed
    if (layoutContent.includes('interworky.js')) {
      logger.warn('Carla widget appears to be already installed');
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Reinstall anyway?',
          default: false,
        },
      ]);

      if (!overwrite) {
        logger.info('Installation cancelled');
        return;
      }
    }

    // Ask which pages to show Carla on
    let pagesToShow = options.pages;
    if (!pagesToShow) {
      const { pagesChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'pagesChoice',
          message: 'On which pages should Carla be displayed?',
          choices: [
            { name: 'All pages', value: 'all' },
            { name: 'Specific pages (enter routes)', value: 'specific' },
          ],
          default: 'all',
        },
      ]);

      if (pagesChoice === 'specific') {
        const { routes } = await inquirer.prompt([
          {
            type: 'input',
            name: 'routes',
            message: 'Enter route patterns (comma-separated, e.g., /, /products, /about):',
            validate: (input: string) => {
              if (!input || input.trim().length === 0) {
                return 'Please enter at least one route';
              }
              return true;
            },
          },
        ]);
        pagesToShow = routes;
      } else {
        pagesToShow = 'all';
      }
    }

    logger.startSpinner('Installing Carla widget...');

    try {
      // Determine if project uses TypeScript or JavaScript
      const isTypeScript = layoutPath.endsWith('.tsx') || layoutPath.endsWith('.ts');
      const fileExtension = isTypeScript ? 'tsx' : 'jsx';

      // Determine component directory - create outside app directory to avoid routing conflicts
      const relativePath = path.relative(projectRoot, layoutPath);
      const usesSrcDir = relativePath.startsWith('src');

      // Create components directory outside of app to prevent Next.js treating it as a route
      const componentsDir = usesSrcDir
        ? path.join(projectRoot, 'src', 'components')
        : path.join(projectRoot, 'components');
      const widgetPath = path.join(componentsDir, `InterworkyWidget.${fileExtension}`);

      logger.info(`Using ${usesSrcDir ? 'src/' : ''}components for widget (outside app directory)`);

      // Create components directory if it doesn't exist
      if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
        logger.info(`Created directory: ${path.relative(projectRoot, componentsDir)}`);
      }

      // Read appropriate template
      const templatePath = path.join(
        __dirname,
        `../../../templates/InterworkyWidget.${fileExtension}.template`
      );
      let widgetContent = fs.readFileSync(templatePath, 'utf-8');

      // Configure based on pages option
      let routeCondition = '';
      let routeConditionEnd = '';
      const delay = options.delay || 1500;
      const landingFlag = options.landing ? 'script.dataset.landing = true;' : '';

      if (pagesToShow && pagesToShow !== 'all') {
        const routes = pagesToShow.split(',').map((r: string) => r.trim());
        const routeCheck = routes.map(r => `pathname === '${r}'`).join(' || ');
        routeCondition = `if (${routeCheck}) {`;
        routeConditionEnd = '}';
      }

      // Replace template variables
      widgetContent = widgetContent
        .replace('{{API_KEY}}', apiKey)
        .replace('{{ROUTE_CONDITION}}', routeCondition)
        .replace('{{ROUTE_CONDITION_END}}', routeConditionEnd)
        .replace('{{DELAY}}', delay.toString())
        .replace('{{LANDING_FLAG}}', landingFlag ? `        ${landingFlag}\n` : '');

      // Write widget component
      fs.writeFileSync(widgetPath, widgetContent, 'utf-8');

      // Update layout to import and use the widget
      let updatedContent = layoutContent;

      // Check if already imported
      const hasWidgetImport = layoutContent.includes('InterworkyWidget');

      if (!hasWidgetImport) {
        // Add import at the top of the file
        const importMatch = layoutContent.match(/import\s+.*?from\s+['"].*?['"]/);

        // Determine relative path from layout to widget (widget is outside app directory)
        // Layout is in app/layout.tsx, widget is in components/InterworkyWidget.tsx
        // So the import should be '../components/InterworkyWidget' or '../../components/InterworkyWidget'
        const widgetImportPath = usesSrcDir
          ? '../components/InterworkyWidget' // src/app/layout.tsx -> src/components/
          : '../components/InterworkyWidget'; // app/layout.tsx -> components/

        if (importMatch) {
          const lastImportIndex = layoutContent.lastIndexOf(importMatch[0]);
          const insertPosition = layoutContent.indexOf('\n', lastImportIndex) + 1;

          updatedContent =
            updatedContent.slice(0, insertPosition) +
            `import InterworkyWidget from '${widgetImportPath}';\n` +
            updatedContent.slice(insertPosition);
        } else {
          // Insert at the beginning
          updatedContent = `import InterworkyWidget from '${widgetImportPath}';\n` + updatedContent;
        }

        // Find the body tag and inject widget component
        const bodyMatch = updatedContent.match(/<body[^>]*>/);
        if (bodyMatch) {
          const bodyIndex = updatedContent.indexOf(bodyMatch[0]) + bodyMatch[0].length;
          const widgetElement = `\n        <InterworkyWidget />`;

          updatedContent =
            updatedContent.slice(0, bodyIndex) + widgetElement + updatedContent.slice(bodyIndex);
        } else {
          throw new Error('Could not find <body> tag in layout file');
        }

        // Write updated layout
        fs.writeFileSync(layoutPath, updatedContent, 'utf-8');
      }

      logger.succeedSpinner('Carla widget installed successfully');

      logger.section('✅ Installation Complete');
      logger.success('Carla widget has been added to your application');
      logger.info(`Created: ${path.relative(projectRoot, widgetPath)}`);
      logger.info(`Modified: ${path.relative(projectRoot, layoutPath)}`);

      logger.section('📝 Next Steps');
      logger.list([
        'Run your development server: npm run dev',
        'Visit your app and test Carla',
        'Customize the widget in your Interworky dashboard',
      ]);
    } catch (error) {
      logger.failSpinner('Installation failed');
      if (error instanceof Error) {
        logger.error(error.message);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.stopSpinner();
    logger.error('Installation failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerInstallCommand(program: Command): void {
  program
    .command('install')
    .description('Install Carla widget in your Next.js application')
    .option('-p, --pages <pages>', 'Pages to show Carla on (comma-separated routes or "all")')
    .option(
      '-d, --delay <ms>',
      'Delay before loading script in milliseconds (default: 1500)',
      parseInt
    )
    .option('-l, --landing', 'Add landing page flag to widget')
    .action(installCommand);
}
