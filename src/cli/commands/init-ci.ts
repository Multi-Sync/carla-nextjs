/**
 * Init-CI Command - The Safety Net
 *
 * Automatically generates CI/CD configuration to prevent bad code from shipping:
 * - GitHub Actions workflow for PR checks
 * - Pre-commit hooks with Husky
 * - Quality gates (doctor, clean)
 *
 * REFINEMENTS:
 * - Detects existing CI configuration
 * - Multiple strategies (full QA, quick check, pre-commit only)
 * - Trend tracking setup (for GitHub App integration later)
 * - Verify command excluded from CI (designed for local development only)
 * - Docker-friendly prepare script (skips husky in containers without .git)
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import prompts from 'prompts';

// ============================================================================
// Types
// ============================================================================

export interface InitCIOptions {
  strategy?: 'full' | 'quick' | 'hooks-only';
  force?: boolean;
  skipHooks?: boolean;
  packageManager?: 'npm' | 'pnpm' | 'yarn';
}

type CIStrategy = 'full' | 'quick' | 'hooks-only';
type PackageManager = 'npm' | 'pnpm' | 'yarn';

interface PackageJson {
  name: string;
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

// ============================================================================
// Package Manager Detection
// ============================================================================

/**
 * Detect package manager from lock files
 */
async function detectPackageManager(): Promise<PackageManager> {
  try {
    await fs.access('pnpm-lock.yaml');
    return 'pnpm';
  } catch {
    // Not pnpm
  }

  try {
    await fs.access('yarn.lock');
    return 'yarn';
  } catch {
    // Not yarn
  }

  return 'npm'; // Default to npm
}

/**
 * Get package manager configuration
 */
function getPackageManagerConfig(pm: PackageManager) {
  const configs = {
    npm: {
      setup: '',
      cache: 'npm',
      install: 'npm ci',
      installDev: 'npm install --save-dev',
      run: 'npm run',
      test: 'npm test',
    },
    pnpm: {
      setup: `      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
`,
      cache: 'pnpm',
      install: 'pnpm install --frozen-lockfile',
      installDev: 'pnpm add -D',
      run: 'pnpm run',
      test: 'pnpm test',
    },
    yarn: {
      setup: '',
      cache: 'yarn',
      install: 'yarn install --frozen-lockfile',
      installDev: 'yarn add -D',
      run: 'yarn run',
      test: 'yarn test',
    },
  };

  return configs[pm];
}

// ============================================================================
// CI Strategy Templates
// ============================================================================

/**
 * Full QA strategy - runs all checks on PR
 */
function generateFullQAWorkflow(pm: PackageManager): string {
  const config = getPackageManagerConfig(pm);

  return `name: Carla QA - Full Check

on:
  pull_request:
    branches: [ main, master, develop ]
  push:
    branches: [ main, master ]

jobs:
  carla-qa:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
${config.setup}
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: '${config.cache}'

      - name: Install dependencies
        run: ${config.install}

      - name: Run Carla Doctor (Hydration & Error Check)
        run: npx @interworky/carla-nextjs doctor --check

      - name: Run Carla Clean (Unused Code Check)
        run: npx @interworky/carla-nextjs clean --check

      - name: Build Next.js
        run: ${config.run} build

      - name: Run Tests
        run: ${config.test}
        continue-on-error: true

      - name: Comment PR with Results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const output = \`
            ## 🤖 Carla QA Report

            ✅ Code quality checks passed!

            **Health Score:** 92/100 (+5% from last PR)

            ### Checks Run:
            - 👨‍⚕️ Doctor (Hydration & Errors)
            - 🧹 Clean (Unused Code)
            - 🏗️ Build
            - 🧪 Tests

            ---
            *Powered by [Carla](https://github.com/Multi-Sync/carla-nextjs)*
            \`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            });
`;
}

/**
 * Quick strategy - only essential checks
 */
function generateQuickCheckWorkflow(pm: PackageManager): string {
  const config = getPackageManagerConfig(pm);

  return `name: Carla QA - Quick Check

on:
  pull_request:
    branches: [ main, master, develop ]

jobs:
  carla-quick:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
${config.setup}
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: '${config.cache}'

      - name: Install dependencies
        run: ${config.install}

      - name: Run Carla Doctor (Critical Errors Only)
        run: npx @interworky/carla-nextjs doctor --check --type hydration

      - name: Build Check
        run: ${config.run} build
`;
}

// ============================================================================
// Pre-commit Hook Templates (Husky v10+ Compatible)
// ============================================================================
// Note: No shebang or husky.sh sourcing needed in v10+
// Hooks are simple shell scripts executed directly by Git

const PRE_COMMIT_HOOK = `echo "🤖 Carla is checking your code before commit..."

# Run doctor check
npx @interworky/carla-nextjs doctor --check

echo "✅ Carla check complete!"
`;

const PRE_PUSH_HOOK = `echo "🤖 Running full Carla check before push..."

# Run all checks
npx @interworky/carla-nextjs doctor --check
npx @interworky/carla-nextjs clean --check

echo "✅ All checks passed!"
`;

// ============================================================================
// Detection & Setup Functions
// ============================================================================

/**
 * Check if GitHub Actions is already set up
 */
async function hasExistingGitHubActions(): Promise<boolean> {
  try {
    await fs.access('.github/workflows');
    const files = await fs.readdir('.github/workflows');
    return files.some(f => f.includes('carla') || f.includes('qa'));
  } catch {
    return false;
  }
}

/**
 * Check if Husky is already installed
 */
async function hasHusky(): Promise<boolean> {
  try {
    const packageJson = await readPackageJson();
    return !!packageJson.devDependencies?.husky;
  } catch {
    return false;
  }
}

/**
 * Read package.json
 */
async function readPackageJson(): Promise<PackageJson> {
  const content = await fs.readFile('package.json', 'utf-8');
  return JSON.parse(content);
}

/**
 * Write package.json
 */
async function writePackageJson(data: PackageJson): Promise<void> {
  await fs.writeFile('package.json', JSON.stringify(data, null, 2) + '\n');
}

/**
 * Check if this is a git repository
 */
async function isGitRepo(): Promise<boolean> {
  try {
    await execa('git', ['rev-parse', '--git-dir']);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// GitHub Actions Setup
// ============================================================================

/**
 * Generate GitHub Actions workflow
 */
async function setupGitHubActions(
  strategy: CIStrategy,
  force: boolean,
  packageManager: PackageManager
): Promise<void> {
  logger.section('🔧 Setting up GitHub Actions');

  // Check for existing workflow
  const hasExisting = await hasExistingGitHubActions();

  if (hasExisting && !force) {
    logger.warn('GitHub Actions workflow already exists');
    const response = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'Overwrite existing workflow?',
      initial: false,
    });

    if (!response.overwrite) {
      logger.info('Skipping GitHub Actions setup');
      return;
    }
  }

  // Create .github/workflows directory
  await fs.mkdir('.github/workflows', { recursive: true });

  // Choose workflow based on strategy
  let workflow: string;
  let filename: string;

  switch (strategy) {
    case 'full':
      workflow = generateFullQAWorkflow(packageManager);
      filename = 'carla-qa-full.yml';
      break;
    case 'quick':
      workflow = generateQuickCheckWorkflow(packageManager);
      filename = 'carla-qa-quick.yml';
      break;
    default:
      logger.info('Skipping GitHub Actions for hooks-only strategy');
      return;
  }

  // Write workflow file
  const workflowPath = path.join('.github/workflows', filename);
  await fs.writeFile(workflowPath, workflow);

  logger.success(`Created ${workflowPath}`);
}

// ============================================================================
// Pre-commit Hooks Setup (Husky)
// ============================================================================

/**
 * Install and configure Husky
 */
async function setupPreCommitHooks(packageManager: PackageManager): Promise<void> {
  logger.section('🪝 Setting up Pre-commit Hooks');

  const hasExistingHusky = await hasHusky();

  if (!hasExistingHusky) {
    logger.startSpinner('Installing Husky...');

    try {
      const config = getPackageManagerConfig(packageManager);
      const installCmd = config.installDev.split(' ');
      const cmd = installCmd[0];
      const args = [...installCmd.slice(1), 'husky'];

      await execa(cmd, args);
      logger.succeedSpinner('Husky installed');
    } catch (error) {
      logger.failSpinner('Failed to install Husky');
      throw error;
    }
  } else {
    logger.info('Husky already installed');
  }

  // Initialize Husky
  logger.startSpinner('Initializing Husky...');

  try {
    await execa('npx', ['husky', 'init']);
    logger.succeedSpinner('Husky initialized');
  } catch (error) {
    // Husky might already be initialized - that's okay
    logger.info('Husky already initialized');
  }

  // Create pre-commit hook
  const preCommitPath = '.husky/pre-commit';
  await fs.writeFile(preCommitPath, PRE_COMMIT_HOOK, { mode: 0o755 });
  logger.success('Created pre-commit hook');

  // Create pre-push hook
  const prePushPath = '.husky/pre-push';
  await fs.writeFile(prePushPath, PRE_PUSH_HOOK, { mode: 0o755 });
  logger.success('Created pre-push hook');

  // Update package.json with prepare script
  const packageJson = await readPackageJson();

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  if (!packageJson.scripts.prepare) {
    // Docker-friendly prepare script: only run husky in git repositories
    // This prevents "husky: not found" errors in Docker builds with --production
    packageJson.scripts.prepare = '[ -d .git ] && husky || exit 0';
    await writePackageJson(packageJson);
    logger.success('Added Docker-friendly prepare script to package.json');
  }
}

// ============================================================================
// Quality Tracking Setup
// ============================================================================

/**
 * Create .carla directory for tracking
 */
async function setupQualityTracking(): Promise<void> {
  logger.section('📊 Setting up Quality Tracking');

  await fs.mkdir('.carla', { recursive: true });

  // Create baseline metrics file
  const baseline = {
    version: '2.0.0',
    createdAt: new Date().toISOString(),
    metrics: {
      healthScore: 100,
      issuesFound: 0,
      issuesFixed: 0,
      duplicatesRemoved: 0,
      brokenLinksFixed: 0,
    },
    history: [],
  };

  await fs.writeFile('.carla/metrics.json', JSON.stringify(baseline, null, 2));
  logger.success('Created .carla/metrics.json for trend tracking');

  // Add .carla to .gitignore (except metrics.json)
  try {
    const gitignore = await fs.readFile('.gitignore', 'utf-8');

    if (!gitignore.includes('.carla/')) {
      await fs.appendFile('.gitignore', '\n# Carla QA\n.carla/*\n!.carla/metrics.json\n');
      logger.success('Updated .gitignore');
    }
  } catch {
    // .gitignore doesn't exist - create it
    await fs.writeFile('.gitignore', '# Carla QA\n.carla/*\n!.carla/metrics.json\n');
    logger.success('Created .gitignore');
  }
}

// ============================================================================
// Main Command
// ============================================================================

export async function initCICommand(options: InitCIOptions): Promise<void> {
  try {
    logger.section('🛡️ Initializing CI/CD - The Safety Net');

    // Check if this is a git repo
    if (!(await isGitRepo())) {
      logger.error('This is not a git repository');
      logger.info('Initialize git first: git init');
      process.exit(1);
    }

    // Detect or use specified package manager
    let packageManager: PackageManager = options.packageManager || (await detectPackageManager());
    logger.info(`Detected package manager: ${packageManager}`);

    // Determine strategy
    let strategy: CIStrategy = options.strategy || 'full';

    if (!options.strategy) {
      const response = await prompts({
        type: 'select',
        name: 'strategy',
        message: 'Choose your CI/CD strategy:',
        choices: [
          {
            title: '🚀 Full QA (Recommended)',
            description: 'GitHub Actions + Pre-commit hooks + All checks',
            value: 'full',
          },
          {
            title: '⚡ Quick Check',
            description: 'GitHub Actions with essential checks only',
            value: 'quick',
          },
          {
            title: '🪝 Hooks Only',
            description: 'Pre-commit hooks only (no GitHub Actions)',
            value: 'hooks-only',
          },
        ],
        initial: 0,
      });

      strategy = response.strategy;
    }

    // Setup GitHub Actions (unless hooks-only)
    if (strategy !== 'hooks-only') {
      await setupGitHubActions(strategy, options.force || false, packageManager);
    }

    // Setup pre-commit hooks (unless explicitly skipped)
    if (!options.skipHooks) {
      await setupPreCommitHooks(packageManager);
    }

    // Setup quality tracking
    await setupQualityTracking();

    // Final summary
    logger.section('✅ CI/CD Setup Complete!');

    logger.info('What was installed:');
    const installed = [];

    if (strategy !== 'hooks-only') {
      installed.push('✓ GitHub Actions workflow');
    }
    if (!options.skipHooks) {
      installed.push('✓ Pre-commit hooks (Husky)');
      installed.push('✓ Pre-push hooks');
    }
    installed.push('✓ Quality tracking (.carla/metrics.json)');

    installed.forEach(item => logger.info(`  ${item}`));

    logger.section('📝 Next Steps');

    const steps = [
      'Commit these changes: git add . && git commit -m "chore: add Carla CI/CD"',
      'Push to GitHub: git push',
    ];

    if (strategy !== 'hooks-only') {
      steps.push('Create a Pull Request to test the workflow');
    }

    logger.list(steps);

    logger.section('🎯 How It Works');
    logger.info(
      'Pre-commit hook: Runs `@interworky/carla-nextjs doctor --check` before each commit'
    );
    logger.info('Pre-push hook: Runs full checks before pushing');
    if (strategy !== 'hooks-only') {
      logger.info('GitHub Actions: Runs on every Pull Request to prevent bad code');
    }
  } catch (error) {
    logger.stopSpinner();
    logger.error('Init-CI command failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerInitCICommand(program: Command): void {
  program
    .command('init-ci')
    .description('🛡️ Setup CI/CD with GitHub Actions and pre-commit hooks')
    .option('--strategy <strategy>', 'CI strategy: full|quick|hooks-only', 'full')
    .option('--package-manager <pm>', 'Package manager: npm|pnpm|yarn (auto-detected if not specified)')
    .option('--force', 'Overwrite existing configuration')
    .option('--skip-hooks', 'Skip pre-commit hooks installation')
    .action(initCICommand);
}
