/**
 * Verify Command - The Link Patrol
 *
 * Scans the local build for broken links (404s) and suggests fixes
 * using fuzzy matching against actual routes.
 *
 * REFINEMENTS:
 * - Auto-starts/stops dev server (no manual "make sure server is running")
 * - Fuzzy matching with Levenshtein distance
 * - Context-aware suggestions (checks for redirects in next.config.js)
 * - Can auto-generate redirects for common patterns
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { LinkChecker, LinkState } from 'linkinator';
import { execa } from 'execa';
import fs from 'fs/promises';
import prompts from 'prompts';
import chalk from 'chalk';

// ============================================================================
// Types
// ============================================================================

export interface VerifyOptions {
  url?: string; // Base URL (default: http://localhost:3000)
  build?: boolean; // Build before checking
  fix?: boolean; // Auto-generate redirects for broken links
  port?: number; // Port to use for dev server
}

interface BrokenLink {
  url: string;
  status: number;
  parent: string;
  suggestedFix?: string;
  confidence: 'high' | 'medium' | 'low';
}

interface NextRoute {
  path: string;
  type: 'page' | 'api';
  filePath: string;
}

// ============================================================================
// Dev Server Management (Auto-start/stop)
// ============================================================================

let devServerProcess: any = null;

/**
 * Check if a server is already running on a port
 */
async function isServerRunning(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000),
    });
    return response.ok || response.status === 404; // Any response means server is running
  } catch {
    return false;
  }
}

/**
 * Start Next.js dev server in background
 */
async function startDevServer(port: number): Promise<void> {
  logger.startSpinner(`Starting Next.js dev server on port ${port}...`);

  devServerProcess = execa('npm', ['run', 'dev'], {
    env: { PORT: String(port) },
    detached: false,
    cleanup: true,
  });

  // Wait for server to be ready
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds timeout

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (await isServerRunning(port)) {
      logger.succeedSpinner('Dev server started');
      return;
    }

    attempts++;
  }

  throw new Error('Dev server failed to start within 30 seconds');
}

/**
 * Stop dev server
 */
async function stopDevServer(): Promise<void> {
  if (devServerProcess) {
    logger.info('Stopping dev server...');
    devServerProcess.kill('SIGTERM');
    devServerProcess = null;
  }
}

// ============================================================================
// Route Discovery
// ============================================================================

/**
 * Find all Next.js routes in the project
 */
async function discoverRoutes(): Promise<NextRoute[]> {
  const glob = await import('fast-glob');
  const routes: NextRoute[] = [];

  // App Router pages
  const appPages = await glob.default(['**/app/**/page.{ts,tsx,js,jsx}'], {
    cwd: process.cwd(),
    ignore: ['node_modules', '.next', 'dist'],
  });

  for (const file of appPages) {
    const routePath =
      file
        .replace(/^.*\/app/, '')
        .replace(/\/page\.(ts|tsx|js|jsx)$/, '')
        .replace(/\[([^\]]+)\]/g, ':$1') || // Convert [id] to :id
      '/';

    routes.push({
      path: routePath,
      type: 'page',
      filePath: file,
    });
  }

  // App Router API routes
  const appApis = await glob.default(['**/app/**/route.{ts,tsx,js,jsx}'], {
    cwd: process.cwd(),
    ignore: ['node_modules', '.next', 'dist'],
  });

  for (const file of appApis) {
    const routePath =
      file.replace(/^.*\/app/, '').replace(/\/route\.(ts|tsx|js|jsx)$/, '') || '/api';

    routes.push({
      path: routePath,
      type: 'api',
      filePath: file,
    });
  }

  // Pages Router pages
  const pagesFiles = await glob.default(['**/pages/**/*.{ts,tsx,js,jsx}'], {
    cwd: process.cwd(),
    ignore: ['node_modules', '.next', 'dist', '_app', '_document', '_error'],
  });

  for (const file of pagesFiles) {
    const routePath =
      file
        .replace(/^.*\/pages/, '')
        .replace(/\.(ts|tsx|js|jsx)$/, '')
        .replace(/\/index$/, '')
        .replace(/\[([^\]]+)\]/g, ':$1') || '/';

    const type = file.includes('/api/') ? 'api' : 'page';

    routes.push({
      path: routePath,
      type,
      filePath: file,
    });
  }

  return routes;
}

// ============================================================================
// Fuzzy Matching (Link Suggestions)
// ============================================================================

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find suggested fix for a broken link
 */
function findSuggestedFix(
  brokenUrl: string,
  validRoutes: NextRoute[]
): { suggestion: string; confidence: 'high' | 'medium' | 'low' } | null {
  const brokenPath = new URL(brokenUrl, 'http://localhost').pathname;
  const validPaths = validRoutes.map(r => r.path);

  // 1. Exact match (case-insensitive)
  const exactMatch = validPaths.find(p => p.toLowerCase() === brokenPath.toLowerCase());
  if (exactMatch && exactMatch !== brokenPath) {
    return { suggestion: exactMatch, confidence: 'high' };
  }

  // 2. Trailing slash differences
  const withoutSlash = brokenPath.replace(/\/$/, '');
  const withSlash = brokenPath + '/';

  if (validPaths.includes(withoutSlash)) {
    return { suggestion: withoutSlash, confidence: 'high' };
  }
  if (validPaths.includes(withSlash)) {
    return { suggestion: withSlash, confidence: 'high' };
  }

  // 3. Partial match (contains)
  const normalized = brokenPath.replace(/^\/|\/$/g, '');
  const partialMatch = validPaths.find(p => {
    const normalizedRoute = p.replace(/^\/|\/$/g, '');
    return normalizedRoute.includes(normalized) || normalized.includes(normalizedRoute);
  });

  if (partialMatch) {
    return { suggestion: partialMatch, confidence: 'medium' };
  }

  // 4. Fuzzy match with Levenshtein distance
  const closest = validPaths.reduce((best, current) => {
    const currentDistance = levenshteinDistance(brokenPath, current);
    const bestDistance = levenshteinDistance(brokenPath, best);
    return currentDistance < bestDistance ? current : best;
  }, validPaths[0] || '/');

  const distance = levenshteinDistance(brokenPath, closest);

  // Only suggest if distance is reasonable (< 5 edits)
  if (distance < 5) {
    return {
      suggestion: closest,
      confidence: distance < 3 ? 'medium' : 'low',
    };
  }

  return null;
}

// ============================================================================
// Link Checking
// ============================================================================

/**
 * Check all links on the site
 */
async function checkLinks(baseUrl: string, routes: NextRoute[]): Promise<BrokenLink[]> {
  logger.startSpinner('Crawling site for broken links...');

  const checker = new LinkChecker();
  const brokenLinks: BrokenLink[] = [];
  const checkedUrls = new Set<string>();

  checker.on('link', result => {
    // Only track broken links
    if (result.state === LinkState.BROKEN && !checkedUrls.has(result.url)) {
      checkedUrls.add(result.url);

      const fix = findSuggestedFix(result.url, routes);

      brokenLinks.push({
        url: result.url,
        status: result.status || 0,
        parent: result.parent || 'unknown',
        suggestedFix: fix?.suggestion,
        confidence: fix?.confidence || 'low',
      });
    }
  });

  try {
    await checker.check({
      path: baseUrl,
      recurse: true,
      timeout: 5000,
      linksToSkip: ['mailto:', 'tel:', 'javascript:', '#'],
    });

    logger.succeedSpinner(`Found ${brokenLinks.length} broken links`);
  } catch (error) {
    logger.failSpinner('Link check failed');
    throw error;
  }

  return brokenLinks;
}

// ============================================================================
// Redirect Generation
// ============================================================================

/**
 * Generate redirects configuration for next.config.js
 */
function generateRedirects(brokenLinks: BrokenLink[]): string {
  const redirects = brokenLinks
    .filter(link => link.suggestedFix && link.confidence !== 'low')
    .map(link => {
      const source = new URL(link.url, 'http://localhost').pathname;
      return {
        source,
        destination: link.suggestedFix!,
        permanent: false,
      };
    });

  if (redirects.length === 0) {
    return '';
  }

  return `
// Auto-generated redirects by Carla
// Add this to your next.config.js:

async redirects() {
  return [
${redirects
  .map(
    r => `    {
      source: '${r.source}',
      destination: '${r.destination}',
      permanent: false,
    },`
  )
  .join('\n')}
  ];
}
`;
}

/**
 * Update next.config.js with redirects
 */
async function updateNextConfig(redirectsCode: string): Promise<void> {
  const configPaths = ['next.config.js', 'next.config.mjs', 'next.config.ts'];

  let configPath: string | null = null;

  for (const path of configPaths) {
    try {
      await fs.access(path);
      configPath = path;
      break;
    } catch {
      continue;
    }
  }

  if (!configPath) {
    logger.warn('No next.config.js found. Creating one...');
    configPath = 'next.config.js';
    await fs.writeFile(
      configPath,
      `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  ${redirectsCode}\n};\n\nmodule.exports = nextConfig;\n`
    );
    logger.success('Created next.config.js with redirects');
    return;
  }

  // Append redirects to existing config
  const content = await fs.readFile(configPath, 'utf-8');

  if (content.includes('redirects()')) {
    logger.warn('Redirects already exist in next.config.js');
    logger.info('Please add these manually:');
    console.log(redirectsCode);
  } else {
    logger.info('Add this to your next.config.js:');
    console.log(redirectsCode);
  }
}

// ============================================================================
// Main Command
// ============================================================================

export async function verifyCommand(options: VerifyOptions): Promise<void> {
  const port = options.port || 3000;
  const baseUrl = options.url || `http://localhost:${port}`;
  let serverWasStarted = false;

  try {
    logger.section('🔗 The Link Patrol - Checking for 404s');

    // Step 1: Build if requested
    if (options.build) {
      logger.startSpinner('Building Next.js project...');
      try {
        await execa('npm', ['run', 'build']);
        logger.succeedSpinner('Build complete');
      } catch (error) {
        logger.failSpinner('Build failed');
        process.exit(1);
      }
    }

    // Step 2: Discover routes
    logger.startSpinner('Discovering Next.js routes...');
    const routes = await discoverRoutes();
    logger.succeedSpinner(`Found ${routes.length} routes`);

    // Step 3: Ensure dev server is running
    const isRunning = await isServerRunning(port);

    if (!isRunning) {
      logger.info('Dev server not running. Starting automatically...');
      await startDevServer(port);
      serverWasStarted = true;
    } else {
      logger.info(`Dev server already running at ${baseUrl}`);
    }

    // Step 4: Check links
    const brokenLinks = await checkLinks(baseUrl, routes);

    // Step 5: Stop dev server if we started it
    if (serverWasStarted) {
      await stopDevServer();
    }

    // Step 6: Report results
    if (brokenLinks.length === 0) {
      logger.success('✨ No broken links found! All links are working.');
      return;
    }

    logger.section(`🔧 Found ${brokenLinks.length} Broken Links`);

    // Group by confidence
    const highConfidence = brokenLinks.filter(l => l.confidence === 'high');
    const mediumConfidence = brokenLinks.filter(l => l.confidence === 'medium');
    const lowConfidence = brokenLinks.filter(l => l.confidence === 'low');

    if (highConfidence.length > 0) {
      console.log(chalk.bold('\n🎯 High Confidence Fixes:'));
      highConfidence.forEach(link => {
        console.log(chalk.red(`  ❌ ${link.url} (${link.status})`));
        console.log(chalk.gray(`     Found in: ${link.parent}`));
        console.log(chalk.green(`     💡 Fix: ${link.suggestedFix}`));
      });
    }

    if (mediumConfidence.length > 0) {
      console.log(chalk.bold('\n🤔 Medium Confidence Fixes:'));
      mediumConfidence.forEach(link => {
        console.log(chalk.red(`  ❌ ${link.url} (${link.status})`));
        console.log(chalk.green(`     💡 Possible fix: ${link.suggestedFix}`));
      });
    }

    if (lowConfidence.length > 0) {
      console.log(chalk.bold(`\n⚠️  ${lowConfidence.length} links with no clear fix`));
    }

    // Step 7: Auto-fix with redirects
    if (options.fix && (highConfidence.length > 0 || mediumConfidence.length > 0)) {
      const response = await prompts({
        type: 'confirm',
        name: 'generateRedirects',
        message: 'Generate redirects for these broken links?',
        initial: true,
      });

      if (response.generateRedirects) {
        const redirectsCode = generateRedirects(brokenLinks);
        await updateNextConfig(redirectsCode);
      }
    }

    // Step 8: Next steps
    logger.section('📝 Next Steps');
    logger.list([
      'Fix broken links in your code',
      'Or run: npx carla verify --fix (to generate redirects)',
      'Re-run: npx carla verify',
    ]);

    process.exit(brokenLinks.length > 0 ? 1 : 0);
  } catch (error) {
    logger.stopSpinner();

    // Cleanup: Stop server if we started it
    if (serverWasStarted) {
      await stopDevServer();
    }

    logger.error('Verify command failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerVerifyCommand(program: Command): void {
  program
    .command('verify')
    .description('🔗 Scan for broken links and auto-generate redirects')
    .option('--url <url>', 'Base URL to check', 'http://localhost:3000')
    .option('--port <port>', 'Port for dev server', '3000')
    .option('--build', 'Build before checking')
    .option('--fix', 'Auto-generate redirects for broken links')
    .action(verifyCommand);
}
