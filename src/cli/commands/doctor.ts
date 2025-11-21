/**
 * Doctor Command - The Hydration Healer
 *
 * Detection of:
 * - Hydration mismatches
 * - Server/Client component errors
 * - Missing TypeScript types
 * - Hardcoded values that should be env vars
 * - Common Next.js antipatterns
 * - Unused code (files, assets, exports)
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

// Handle ESM/CommonJS interop
const traverse = (traverseModule as any).default || traverseModule;
const generate = (generateModule as any).default || generateModule;
import chalk from 'chalk';

// ============================================================================
// Types
// ============================================================================

export interface DoctorOptions {
  check?: boolean;        // CI mode - only check, exit with code 1 if issues found
  type?: 'hydration' | 'types' | 'hardcoded' | 'unused' | 'all';
}

interface HealthIssue {
  type: 'hydration' | 'server-client' | 'missing-types' | 'hardcoded-value' | 'unused-code' | 'performance';
  severity: 'critical' | 'warning' | 'info';
  file: string;
  line: number;
  column?: number;
  message: string;
  code: string;
}

// ============================================================================
// Code Context Helper
// ============================================================================

/**
 * Get code context around a specific line
 */
async function getCodeContext(filePath: string, lineNumber: number): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - 5);
    const end = Math.min(lines.length, lineNumber + 5);
    return lines.slice(start, end).join('\n');
  } catch {
    return '';
  }
}

// ============================================================================
// Issue Detection
// ============================================================================

/**
 * Run Next.js build to detect runtime errors
 */
async function runBuildCheck(): Promise<HealthIssue[]> {
  logger.startSpinner('Running Next.js build to detect errors...');

  const issues: HealthIssue[] = [];

  try {
    const result = await execa('npm', ['run', 'build'], {
      reject: false,
      all: true
    });

    const output = result.all || '';

    // Parse hydration errors
    const hydrationRegex = /Error: Hydration failed.*?\n.*?at (.*?):(\d+):(\d+)/gs;
    const matches = output.matchAll(hydrationRegex);

    for (const match of matches) {
      const filePath = match[1];
      const line = parseInt(match[2]);
      const column = parseInt(match[3]);

      issues.push({
        type: 'hydration',
        severity: 'critical',
        file: filePath,
        line,
        column,
        message: 'Hydration mismatch detected',
        code: await getCodeContext(filePath, line)
      });
    }

    logger.succeedSpinner(`Build check complete - found ${issues.length} issues`);

  } catch (error: any) {
    logger.failSpinner('Build check failed');
    // Still parse the output for errors
  }

  return issues;
}

/**
 * AST-based static analysis for common issues
 */
async function staticAnalysis(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];
  const glob = await import('fast-glob');

  const files = await glob.default(['**/*.{tsx,jsx}'], {
    cwd: process.cwd(),
    ignore: ['node_modules', '.next', 'dist']
  });

  for (const file of files) {
    const code = await fs.readFile(file, 'utf-8');
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    });

    const hasUseClient = code.includes('"use client"') || code.includes("'use client'");

    traverse(ast, {
      // 1. Invalid nesting: <div> inside <p>
      JSXElement(astPath: any) {
        const parent = astPath.parent;
        if (
          t.isJSXElement(parent) &&
          t.isJSXIdentifier(parent.openingElement.name) &&
          parent.openingElement.name.name === 'p' &&
          t.isJSXIdentifier(astPath.node.openingElement.name) &&
          astPath.node.openingElement.name.name === 'div'
        ) {
          issues.push({
            type: 'hydration',
            severity: 'critical',
            file,
            line: astPath.node.loc?.start.line || 0,
            message: 'Invalid HTML nesting: <div> cannot be child of <p> (causes hydration errors)',
            code: generate(astPath.node).code
          });
        }
      },

      // 2. window/document in Server Components
      MemberExpression(astPath: any) {
        if (
          t.isIdentifier(astPath.node.object) &&
          ['window', 'document', 'localStorage', 'sessionStorage'].includes(astPath.node.object.name) &&
          !hasUseClient
        ) {
          issues.push({
            type: 'server-client',
            severity: 'critical',
            file,
            line: astPath.node.loc?.start.line || 0,
            message: `Using ${astPath.node.object.name} in Server Component. Add "use client" directive.`,
            code: generate(astPath.node).code
          });
        }
      },

      // 3. Missing TypeScript types (any usage)
      TSAnyKeyword(astPath: any) {
        issues.push({
          type: 'missing-types',
          severity: 'warning',
          file,
          line: astPath.node.loc?.start.line || 0,
          message: 'Using "any" type. TypeScript type should be inferred or declared.',
          code: generate(astPath.parentPath.node).code
        });
      },

      // 4. Hardcoded values in API calls
      CallExpression(astPath: any) {
        if (
          t.isIdentifier(astPath.node.callee) &&
          astPath.node.callee.name === 'fetch' &&
          astPath.node.arguments.length > 0
        ) {
          const firstArg = astPath.node.arguments[0];
          if (t.isStringLiteral(firstArg) && firstArg.value.startsWith('http')) {
            issues.push({
              type: 'hardcoded-value',
              severity: 'warning',
              file,
              line: astPath.node.loc?.start.line || 0,
              message: `Hardcoded API URL: "${firstArg.value}". Consider using environment variable.`,
              code: generate(astPath.node).code
            });
          }
        }
      }
    });
  }

  return issues;
}

/**
 * Discover all assets in the public directory
 */
async function discoverPublicAssets(): Promise<Set<string>> {
  const assets = new Set<string>();

  try {
    const glob = await import('fast-glob');

    // Check if public directory exists
    try {
      await fs.access('public');
    } catch {
      return assets; // No public directory
    }

    // Find all files in public directory
    const publicFiles = await glob.default(['public/**/*'], {
      cwd: process.cwd(),
      absolute: false,
      onlyFiles: true,
      ignore: ['**/node_modules/**', '**/.DS_Store', '**/Thumbs.db']
    });

    // Normalize paths (remove 'public/' prefix and add leading '/')
    for (const file of publicFiles) {
      const normalizedPath = '/' + file.replace(/^public\//, '');
      assets.add(normalizedPath);
    }

    logger.info(`Found ${assets.size} assets in public directory`);
    return assets;
  } catch (error: any) {
    logger.error(`Failed to discover public assets: ${error.message}`);
    return assets;
  }
}

/**
 * Find all references to public assets in code
 */
async function findAssetReferences(): Promise<Set<string>> {
  const references = new Set<string>();

  try {
    const glob = await import('fast-glob');

    // Scan JavaScript/TypeScript files
    const codeFiles = await glob.default([
      'src/**/*.{js,jsx,ts,tsx}',
      '!**/node_modules/**',
      '!**/.next/**',
      '!**/dist/**'
    ], {
      cwd: process.cwd(),
      absolute: false
    });

    for (const file of codeFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');

        // Extract references from code
        const fileRefs = extractAssetReferences(content);
        fileRefs.forEach(ref => references.add(ref));
      } catch {
        // Skip files that can't be read
      }
    }

    // Scan CSS files
    const cssFiles = await glob.default([
      'src/**/*.{css,scss,sass,less}',
      '!**/node_modules/**',
      '!**/.next/**'
    ], {
      cwd: process.cwd(),
      absolute: false
    });

    for (const file of cssFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const cssRefs = extractCSSAssetReferences(content);
        cssRefs.forEach(ref => references.add(ref));
      } catch {
        // Skip files that can't be read
      }
    }

    logger.info(`Found ${references.size} asset references in code`);
    return references;
  } catch (error: any) {
    logger.error(`Failed to find asset references: ${error.message}`);
    return references;
  }
}

/**
 * Extract asset references from JavaScript/TypeScript/JSX content
 */
function extractAssetReferences(content: string): string[] {
  const references: string[] = [];

  // Pattern 1: JSX/HTML attributes (src, href, data, poster, etc.)
  // Matches: src="/path", href='/path', data="/path"
  const jsxAttrPattern = /(?:src|href|data|poster|srcSet|content)=["']([/][^"']+)["']/g;
  let match;
  while ((match = jsxAttrPattern.exec(content)) !== null) {
    references.push(match[1]);
  }

  // Pattern 2: String literals with public paths
  // Matches: "/images/logo.png", '/videos/demo.mp4'
  const stringLiteralPattern = /["']([/](?:images?|videos?|assets?|fonts?|icons?|files?|documents?|media|static|public|maps?|blogs?|landing)[^"']+)["']/g;
  while ((match = stringLiteralPattern.exec(content)) !== null) {
    references.push(match[1]);
  }

  // Pattern 3: Template literals with paths
  // Matches: `${base}/image.png` -> extract /image.png
  const templateLiteralPattern = /`[^`]*\/([^`/]+\.[a-z0-9]+)[^`]*`/gi;
  while ((match = templateLiteralPattern.exec(content)) !== null) {
    // Try to extract simple paths from template literals
    const innerMatch = content.slice(match.index, match.index + match[0].length).match(/\/([a-zA-Z0-9_\-./]+)/);
    if (innerMatch) {
      references.push(innerMatch[0]);
    }
  }

  // Pattern 4: Common static file extensions in strings
  // Matches: "/file.pdf", "/doc.zip", etc.
  const extensionPattern = /["']([/][^"']+\.(?:png|jpg|jpeg|gif|svg|webp|mp4|webm|mov|pdf|zip|json|xml|txt|woff|woff2|ttf|eot|ico|mp3|wav|ogg|csv))["']/gi;
  while ((match = extensionPattern.exec(content)) !== null) {
    references.push(match[1]);
  }

  return references;
}

/**
 * Extract asset references from CSS content
 */
function extractCSSAssetReferences(content: string): string[] {
  const references: string[] = [];

  // Pattern: url('/path') or url("/path") or url(/path)
  const urlPattern = /url\s*\(\s*["']?([/][^)"']+)["']?\s*\)/gi;
  let match;
  while ((match = urlPattern.exec(content)) !== null) {
    references.push(match[1]);
  }

  return references;
}

/**
 * Custom reachability analyzer for Next.js App Router
 *
 * Strategy:
 * 1. Find all entry points (page.js, route.js, layout.js, etc.)
 * 2. Build dependency graph by parsing imports recursively
 * 3. Mark all reachable files
 * 4. Compare against all project files
 * 5. Report unreachable files as truly unused
 * 6. Discover public assets and find unused ones
 */
async function detectUnusedCodeViaReachability(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];

  try {
    logger.info('Building reachability tree from Next.js entry points...');

    const glob = await import('fast-glob');
    const reachableFiles = new Set<string>();
    const visitedFiles = new Set<string>();

    // Step 1: Find all Next.js entry points
    const entryPoints = await glob.default([
      // Core route files
      'src/app/**/page.{js,jsx,ts,tsx}',
      'src/app/**/route.{js,ts}',
      'src/app/**/layout.{js,jsx,ts,tsx}',
      'src/app/**/template.{js,jsx,ts,tsx}',
      'src/app/**/default.{js,jsx,ts,tsx}',

      // UI files
      'src/app/**/loading.{js,jsx,ts,tsx}',

      // Error handling files
      'src/app/**/error.{js,jsx,ts,tsx}',
      'src/app/**/not-found.{js,jsx,ts,tsx}',
      'src/app/**/global-error.{js,jsx,ts,tsx}',
      'src/app/**/forbidden.{js,jsx,ts,tsx}',
      'src/app/**/unauthorized.{js,jsx,ts,tsx}',

      // Metadata files (executed at build time)
      'src/app/**/opengraph-image.{js,ts,jsx,tsx}',
      'src/app/**/twitter-image.{js,ts,jsx,tsx}',
      'src/app/**/icon.{js,ts,jsx,tsx}',
      'src/app/**/apple-icon.{js,ts,jsx,tsx}',
      'src/app/**/sitemap.{js,ts}',
      'src/app/**/robots.{js,ts}',
      'src/app/**/manifest.{js,ts}',

      // Middleware and instrumentation
      'src/middleware.{js,ts}',
      'middleware.{js,ts}', // Can be at root
      'src/proxy.{js,ts}', // Next.js 16+ middleware name
      'proxy.{js,ts}', // Can be at root
      'src/instrumentation.{js,ts}',
      'instrumentation.{js,ts}', // Can be at root
      'src/instrumentation-client.{js,ts}',
      'instrumentation-client.{js,ts}', // Can be at root

      // MDX configuration
      'src/mdx-components.{js,ts,jsx,tsx}',
      'mdx-components.{js,ts,jsx,tsx}', // Can be at root

      // Root layout (important)
      'src/app/layout.{js,jsx,ts,tsx}',

      // Pages Router support
      'src/pages/**/*.{js,jsx,ts,tsx}',
    ], {
      cwd: process.cwd(),
      absolute: false
    });

    logger.info(`Found ${entryPoints.length} entry points (pages, routes, layouts)`);

    // Step 2: Build reachability tree by following imports
    async function markReachable(filePath: string): Promise<void> {
      // Normalize path
      const normalizedPath = filePath.replace(/\\/g, '/');

      if (visitedFiles.has(normalizedPath)) return;
      visitedFiles.add(normalizedPath);
      reachableFiles.add(normalizedPath);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const ast = parser.parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript', 'decorators-legacy']
        });

        // Extract all imports AND re-exports
        const imports: string[] = [];
        traverse(ast, {
          ImportDeclaration(astPath: any) {
            const source = astPath.node.source.value;
            imports.push(source);
          },

          // Handle dynamic imports AND require()
          CallExpression(astPath: any) {
            // Dynamic import: import('./Y')
            if (
              t.isImport(astPath.node.callee) &&
              astPath.node.arguments.length > 0 &&
              t.isStringLiteral(astPath.node.arguments[0])
            ) {
              imports.push(astPath.node.arguments[0].value);
            }

            // CommonJS require: require('./Y')
            if (
              t.isIdentifier(astPath.node.callee) &&
              astPath.node.callee.name === 'require' &&
              astPath.node.arguments.length > 0 &&
              t.isStringLiteral(astPath.node.arguments[0])
            ) {
              imports.push(astPath.node.arguments[0].value);
            }

            // Next.js dynamic: dynamic(() => import('./Y'))
            if (
              t.isIdentifier(astPath.node.callee) &&
              astPath.node.callee.name === 'dynamic' &&
              astPath.node.arguments.length > 0
            ) {
              const firstArg = astPath.node.arguments[0];

              // Check if it's an arrow function or regular function
              if (t.isArrowFunctionExpression(firstArg) || t.isFunctionExpression(firstArg)) {
                const body = firstArg.body;

                // Case 1: () => import('./Y')  (implicit return)
                if (t.isCallExpression(body) && t.isImport(body.callee)) {
                  if (body.arguments[0] && t.isStringLiteral(body.arguments[0])) {
                    imports.push(body.arguments[0].value);
                  }
                }

                // Case 2: () => { return import('./Y') }  (explicit return)
                if (t.isBlockStatement(body)) {
                  // Find ReturnStatement in the block
                  const returnStmt = body.body.find((stmt: any) => t.isReturnStatement(stmt));
                  if (returnStmt && t.isReturnStatement(returnStmt)) {
                    const returnArg = (returnStmt as any).argument;
                    if (t.isCallExpression(returnArg) && t.isImport(returnArg.callee)) {
                      if (returnArg.arguments[0] && t.isStringLiteral(returnArg.arguments[0])) {
                        imports.push(returnArg.arguments[0].value);
                      }
                    }
                  }
                }
              }
            }
          },

          // Handle re-exports: export { X } from './Y'
          ExportNamedDeclaration(astPath: any) {
            if (astPath.node.source && astPath.node.source.value) {
              imports.push(astPath.node.source.value);
            }
          },

          // Handle re-export all: export * from './Y'
          ExportAllDeclaration(astPath: any) {
            if (astPath.node.source && astPath.node.source.value) {
              imports.push(astPath.node.source.value);
            }
          }
        });

        // Resolve and follow each import
        for (const importPath of imports) {
          const resolved = await resolveImport(importPath, filePath);
          if (resolved) {
            await markReachable(resolved);
          }
        }
      } catch (error) {
        // Skip files that can't be parsed
      }
    }

    // Helper to resolve import paths
    async function resolveImport(importPath: string, fromFile: string): Promise<string | null> {
      // Skip external packages
      if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/')) {
        return null;
      }

      const fromDir = path.dirname(fromFile);
      const resolveCandidates: string[] = [];

      // Handle @/ alias - try multiple base paths
      if (importPath.startsWith('@/')) {
        const withoutAlias = importPath.replace('@/', '');

        // Try multiple base directories for @/ alias
        // In Next.js, @/ can resolve to different bases depending on tsconfig.json
        resolveCandidates.push(`src/${withoutAlias}`);  // Most common: @/ → src/
        resolveCandidates.push(withoutAlias);            // Alternative: @/ → project root
        resolveCandidates.push(`app/${withoutAlias}`);  // Alternative: @/ → app/
      } else if (importPath.startsWith('/')) {
        resolveCandidates.push(importPath.slice(1));
      } else {
        resolveCandidates.push(path.join(fromDir, importPath));
      }

      // Try each candidate with different extensions
      for (let resolved of resolveCandidates) {
        // Normalize to forward slashes
        resolved = resolved.replace(/\\/g, '/');

        // Try different extensions
        const extensions = ['.js', '.jsx', '.ts', '.tsx', ''];
        for (const ext of extensions) {
          const candidate = resolved + ext;
          try {
            const stats = await fs.stat(candidate);
            if (stats.isFile()) {
              return candidate.replace(/\\/g, '/');
            }
          } catch {
            // Try next extension
          }
        }

        // Try index files
        for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
          const indexPath = path.join(resolved, `index${ext}`).replace(/\\/g, '/');
          try {
            const stats = await fs.stat(indexPath);
            if (stats.isFile()) {
              return indexPath;
            }
          } catch {
            // Try next
          }
        }
      }

      return null;
    }

    // Mark all entry points and their dependencies as reachable
    for (const entryPoint of entryPoints) {
      await markReachable(entryPoint);
    }

    logger.info(`Reachability analysis complete: ${reachableFiles.size} files reachable from entry points`);

    // Step 3: Find all project files
    const allFiles = await glob.default([
      'src/**/*.{js,jsx,ts,tsx}'
    ], {
      cwd: process.cwd(),
      absolute: false,
      ignore: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/__tests__/**',
        '**/__mocks__/**'
      ]
    });

    // Step 4: Find unreachable files
    const unreachableFiles: string[] = [];
    for (const file of allFiles) {
      const normalized = file.replace(/\\/g, '/');
      if (!reachableFiles.has(normalized)) {
        unreachableFiles.push(file);
      }
    }

    logger.info(`Found ${unreachableFiles.length} unreachable files (not used by any page/route)`);

    // Step 5: Create issues for unreachable files
    for (const file of unreachableFiles) {
      issues.push({
        type: 'unused-code',
        severity: 'info',
        file,
        line: 1,
        message: `File is not reachable from any Next.js page or route. Consider removing it.`,
        code: `Unreachable file: ${file}`
      });
    }

    // Step 6: Check for unused public assets
    logger.info('Analyzing public directory for unused assets...');
    const publicAssets = await discoverPublicAssets();

    if (publicAssets.size > 0) {
      const assetReferences = await findAssetReferences();

      // Find unreachable assets
      const unreachableAssets: string[] = [];
      for (const asset of publicAssets) {
        if (!assetReferences.has(asset)) {
          unreachableAssets.push(asset);
        }
      }

      logger.info(`Found ${unreachableAssets.length} unreachable assets in public directory`);

      // Create issues for unreachable assets
      for (const asset of unreachableAssets) {
        const publicPath = 'public' + asset; // Convert /path -> public/path for reporting
        issues.push({
          type: 'unused-code',
          severity: 'info',
          file: publicPath,
          line: 1,
          message: `Public asset is not referenced in any code. Consider removing it.`,
          code: `Unreachable asset: ${asset}`
        });
      }
    } else {
      logger.info('No public directory found or it is empty');
    }

    return issues;

  } catch (error: any) {
    logger.error(`Reachability analysis failed: ${error.message}`);
    return [];
  }
}

/**
 * Detect unused code using custom reachability analysis
 *
 * NOTE: This identifies unused code as health issues.
 * Use `carla clean` to actually remove them.
 */
async function detectUnusedCode(): Promise<HealthIssue[]> {
  return detectUnusedCodeViaReachability();
}

// ============================================================================
// Unused Exports Detection (Functions within used files)
// ============================================================================

interface ExportInfo {
  name: string;
  type: 'function' | 'const' | 'class' | 'default' | 'type';
  filePath: string;
  line: number;
  code: string;
  usedInDefaultExport?: boolean;  // True if this named export is used as default export value
}

interface ImportInfo {
  importedName: string;
  localName: string;
  source: string;
  filePath: string;
  isUsed: boolean;
}

interface RenameInfo {
  originalFile: string;      // File where the original export lives
  originalName: string;      // Original export name
  aliasName: string;         // Renamed export name
  reexportedFromFile: string; // File doing the re-export (barrel file)
}

/**
 * Extract all exports from a file using AST
 */
async function extractExports(filePath: string): Promise<ExportInfo[]> {
  const exports: ExportInfo[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    });

    traverse(ast, {
      // export function foo() {}
      // export const foo = 1
      ExportNamedDeclaration(path: any) {
        // Function declarations
        if (t.isFunctionDeclaration(path.node.declaration)) {
          const funcNode = path.node.declaration;
          if (funcNode.id) {
            exports.push({
              name: funcNode.id.name,
              type: 'function',
              filePath,
              line: path.node.loc?.start.line || 0,
              code: generate(funcNode).code.split('\n')[0] // First line only
            });
          }
        }

        // Variable declarations (const, let, var)
        if (t.isVariableDeclaration(path.node.declaration)) {
          path.node.declaration.declarations.forEach((decl: any) => {
            if (t.isIdentifier(decl.id)) {
              // Determine if it's a function or constant
              const isFunction = t.isArrowFunctionExpression(decl.init) ||
                                t.isFunctionExpression(decl.init);

              exports.push({
                name: decl.id.name,
                type: isFunction ? 'function' : 'const',
                filePath,
                line: path.node.loc?.start.line || 0,
                code: generate(decl).code.split('\n')[0] // First line only
              });
            }
          });
        }

        // Class declarations
        if (t.isClassDeclaration(path.node.declaration)) {
          const classNode = path.node.declaration;
          if (classNode.id) {
            exports.push({
              name: classNode.id.name,
              type: 'class',
              filePath,
              line: path.node.loc?.start.line || 0,
              code: `class ${classNode.id.name} { ... }`
            });
          }
        }

        // Type/Interface exports (TypeScript)
        if (t.isTSTypeAliasDeclaration(path.node.declaration) ||
            t.isTSInterfaceDeclaration(path.node.declaration)) {
          const typeNode = path.node.declaration;
          exports.push({
            name: typeNode.id.name,
            type: 'type',
            filePath,
            line: path.node.loc?.start.line || 0,
            code: generate(typeNode).code.split('\n')[0]
          });
        }

        // export { foo, bar }
        if (!path.node.declaration && path.node.specifiers) {
          path.node.specifiers.forEach((spec: any) => {
            if (t.isExportSpecifier(spec)) {
              // spec.exported can be Identifier or StringLiteral
              const exportedName = t.isIdentifier(spec.exported)
                ? spec.exported.name
                : spec.exported.value;

              exports.push({
                name: exportedName,
                type: 'const', // Unknown type, assume const
                filePath,
                line: path.node.loc?.start.line || 0,
                code: `export { ${exportedName} }`
              });
            }
          });
        }
      },

      // export default function() {} or export default Foo
      ExportDefaultDeclaration(path: any) {
        // IMPORTANT: Always use 'default' as the name for default exports
        // Even when the declaration has a name (e.g., export default function Foo())
        // The import uses the default export, not the function name
        // Pattern: import X from './file'  ← imports the 'default' export, not 'Foo'
        const name = 'default';
        let type: ExportInfo['type'] = 'const';

        // Detect type based on declaration
        if (t.isFunctionDeclaration(path.node.declaration)) {
          type = 'function';
        } else if (t.isClassDeclaration(path.node.declaration)) {
          type = 'class';
        }

        exports.push({
          name,
          type,
          filePath,
          line: path.node.loc?.start.line || 0,
          code: generate(path.node).code.split('\n')[0]
        });
      }
    });

    // Second pass: Check if any named export is used as the value of default export
    // Pattern: export function Foo() {} ... export default Foo
    //
    // This prevents false positives where a named export appears unused but is actually
    // the value being exported as default. This is a common React component pattern.
    //
    // Handles:
    //   ✓ export function Foo() {} ... export default Foo
    //   ✓ export const Bar = () => {} ... export default Bar
    //   ✓ export class Baz {} ... export default Baz
    //
    // Edge cases NOT handled (acceptable - users can manually verify):
    //   ✗ export default withAuth(View)  - wrapped/HOC pattern
    //   ✗ export default memo(Component) - memoized components
    //   These are rare and would require complex dataflow analysis
    const namedExportNames = new Set(exports.filter(e => e.name !== 'default').map(e => e.name));

    traverse(ast, {
      ExportDefaultDeclaration(path: any) {
        // Check if default export is just an identifier (export default Foo)
        if (t.isIdentifier(path.node.declaration)) {
          const referencedName = path.node.declaration.name;

          // If this identifier matches a named export, mark it as used in default export
          if (namedExportNames.has(referencedName)) {
            const matchingExport = exports.find(e => e.name === referencedName);
            if (matchingExport) {
              matchingExport.usedInDefaultExport = true;
            }
          }
        }
      }
    });

  } catch (error) {
    // Skip files that can't be parsed
  }

  return exports;
}

/**
 * Check if an export is used within its own file (internal usage)
 * This catches cases like: export const PLAN_CONFIG used by export function getCheckoutUrl
 */
async function isExportUsedWithinFile(filePath: string, exportName: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    });

    let usageCount = 0;

    traverse(ast, {
      // Count identifier references
      Identifier(path: any) {
        if (path.node.name === exportName) {
          const parent = path.parent;

          // Skip if this is the identifier in the export declaration itself
          // export const PLAN_CONFIG = {...} <- skip the PLAN_CONFIG here
          if (t.isVariableDeclarator(parent) && parent.id === path.node) {
            return;
          }

          // Skip if this is a function/class name in export declaration
          // export function foo() <- skip the foo here
          if ((t.isFunctionDeclaration(parent) || t.isClassDeclaration(parent)) && parent.id === path.node) {
            return;
          }

          // Skip if this is the exported identifier in export specifier
          // export { foo } <- skip the foo here
          if (t.isExportSpecifier(parent) && (parent.exported === path.node || parent.local === path.node)) {
            return;
          }

          // Skip if this is a property key (e.g., { PLAN_CONFIG: value })
          if (t.isObjectProperty(parent) && parent.key === path.node && !parent.computed) {
            return;
          }

          // Count this as a usage
          usageCount++;
        }
      }
    });

    // If used at least once outside the export declaration, it's used internally
    return usageCount > 0;
  } catch (error) {
    // If we can't parse the file, assume not used
    return false;
  }
}

/**
 * Extract all imports from a file and check if they're used
 */
async function extractImports(filePath: string): Promise<ImportInfo[]> {
  const imports: ImportInfo[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    });

    // First pass: collect all imports AND re-exports
    traverse(ast, {
      ImportDeclaration(path: any) {
        const source = path.node.source.value;

        path.node.specifiers.forEach((spec: any) => {
          if (t.isImportSpecifier(spec)) {
            // import { foo } from './bar'
            // spec.imported can be Identifier or StringLiteral
            const importedName = t.isIdentifier(spec.imported)
              ? spec.imported.name
              : spec.imported.value;

            imports.push({
              importedName,
              localName: spec.local.name,
              source,
              filePath,
              isUsed: false
            });
          } else if (t.isImportDefaultSpecifier(spec)) {
            // import Foo from './bar'
            imports.push({
              importedName: 'default',
              localName: spec.local.name,
              source,
              filePath,
              isUsed: false
            });
          } else if (t.isImportNamespaceSpecifier(spec)) {
            // import * as foo from './bar'
            imports.push({
              importedName: '*',
              localName: spec.local.name,
              source,
              filePath,
              isUsed: false
            });
          }
        });
      },

      // Handle dynamic imports (import() and dynamic(() => import()))
      CallExpression(astPath: any) {
        // Dynamic import: import('./Y')
        if (
          t.isImport(astPath.node.callee) &&
          astPath.node.arguments.length > 0 &&
          t.isStringLiteral(astPath.node.arguments[0])
        ) {
          const source = astPath.node.arguments[0].value;
          // Dynamic imports always import the default export
          imports.push({
            importedName: 'default',
            localName: '', // No local binding name for dynamic imports
            source,
            filePath,
            isUsed: true // Dynamic imports are always considered "used"
          });
        }

        // Next.js dynamic: dynamic(() => import('./Y'))
        if (
          t.isIdentifier(astPath.node.callee) &&
          astPath.node.callee.name === 'dynamic' &&
          astPath.node.arguments.length > 0
        ) {
          const firstArg = astPath.node.arguments[0];

          if (t.isArrowFunctionExpression(firstArg) || t.isFunctionExpression(firstArg)) {
            const body = firstArg.body;

            // Case 1: () => import('./Y')  (implicit return)
            if (t.isCallExpression(body) && t.isImport(body.callee)) {
              if (body.arguments[0] && t.isStringLiteral(body.arguments[0])) {
                const source = body.arguments[0].value;
                imports.push({
                  importedName: 'default',
                  localName: '',
                  source,
                  filePath,
                  isUsed: true
                });
              }
            }

            // Case 2: () => { return import('./Y') }  (explicit return)
            if (t.isBlockStatement(body)) {
              const returnStmt = body.body.find((stmt: any) => t.isReturnStatement(stmt));
              if (returnStmt && t.isReturnStatement(returnStmt)) {
                const returnArg = (returnStmt as any).argument;
                if (t.isCallExpression(returnArg) && t.isImport(returnArg.callee)) {
                  if (returnArg.arguments[0] && t.isStringLiteral(returnArg.arguments[0])) {
                    const source = returnArg.arguments[0].value;
                    imports.push({
                      importedName: 'default',
                      localName: '',
                      source,
                      filePath,
                      isUsed: true
                    });
                  }
                }
              }
            }
          }
        }

        // CommonJS require() with destructuring: const { X, Y } = require('./file')
        if (
          t.isIdentifier(astPath.node.callee) &&
          astPath.node.callee.name === 'require' &&
          astPath.node.arguments.length > 0 &&
          t.isStringLiteral(astPath.node.arguments[0])
        ) {
          const source = astPath.node.arguments[0].value;

          // Skip external packages (only process local files)
          if (!source.startsWith('.') && !source.startsWith('/') && !source.startsWith('@/')) {
            return; // External package, skip
          }

          const parent = astPath.parent;

          // Check if this is part of a variable declaration with destructuring
          if (t.isVariableDeclarator(parent) && t.isObjectPattern(parent.id)) {
            // Extract destructured identifiers: const { Conversation, X } = require('./file')
            parent.id.properties.forEach((prop: any) => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && t.isIdentifier(prop.value)) {
                const importedName = prop.key.name;
                const localName = prop.value.name;

                imports.push({
                  importedName,
                  localName,
                  source,
                  filePath,
                  isUsed: false // Will check usage later
                });
              }
            });
          } else {
            // No destructuring, just: const x = require('./file')
            // This imports everything (like import * as x)
            // We'll track it but won't check specific exports
          }
        }
      },

      // Handle re-exports: export { foo } from './bar'
      ExportNamedDeclaration(path: any) {
        if (path.node.source) {
          const source = path.node.source.value;

          path.node.specifiers.forEach((spec: any) => {
            if (t.isExportSpecifier(spec)) {
              // export { foo } from './bar' or export { foo as bar } from './bar'
              // or export { default as Foo } from './bar'
              const importedName = spec.local.name; // What we're importing
              const exportedName = t.isIdentifier(spec.exported)
                ? spec.exported.name
                : spec.exported.value; // What we're exporting as

              // This counts as using the import
              imports.push({
                importedName,
                localName: exportedName,
                source,
                filePath,
                isUsed: true // Re-exports are always "used"
              });
            }
          });
        }
      },

      // Handle re-export all: export * from './bar'
      ExportAllDeclaration(path: any) {
        const source = path.node.source.value;
        imports.push({
          importedName: '*',
          localName: '*',
          source,
          filePath,
          isUsed: true // Re-exports are always "used"
        });
      }
    });

    // Second pass: check if imported names are used
    const usedIdentifiers = new Set<string>();
    traverse(ast, {
      Identifier(path: any) {
        // Skip the import declarations themselves
        const parent = path.parent;
        if (!t.isImportSpecifier(parent) &&
            !t.isImportDefaultSpecifier(parent) &&
            !t.isImportNamespaceSpecifier(parent)) {
          usedIdentifiers.add(path.node.name);
        }
      }
    });

    // Mark imports as used if their local name appears in the code
    imports.forEach(imp => {
      imp.isUsed = usedIdentifiers.has(imp.localName);
    });

  } catch (error) {
    // Skip files that can't be parsed
  }

  return imports;
}

/**
 * Extract re-exports with renames (export { foo as bar } from './file')
 * This builds a map of original export names to their aliases
 */
async function extractReexportsWithRenames(filePath: string): Promise<RenameInfo[]> {
  const renames: RenameInfo[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    });

    traverse(ast, {
      // Handle: export { foo as bar } from './file'
      ExportNamedDeclaration(path: any) {
        if (path.node.source && path.node.specifiers) {
          const source = path.node.source.value;

          path.node.specifiers.forEach((spec: any) => {
            if (t.isExportSpecifier(spec)) {
              // spec.local = what we're importing (original name)
              // spec.exported = what we're exporting as (alias name)
              const originalName = spec.local.name;
              const aliasName = t.isIdentifier(spec.exported)
                ? spec.exported.name
                : spec.exported.value;

              // Only track if there's a rename (not just re-export)
              if (originalName !== aliasName) {
                // Resolve the source file path
                const resolvedSource = resolveImportPathForRename(source, filePath);

                if (resolvedSource) {
                  renames.push({
                    originalFile: resolvedSource,
                    originalName,
                    aliasName,
                    reexportedFromFile: filePath
                  });
                }
              }
            }
          });
        }
      }
    });
  } catch (error) {
    // Skip files that can't be parsed
  }

  return renames;
}

/**
 * Resolve import path for rename tracking
 */
function resolveImportPathForRename(importSource: string, importerFile: string): string | null {
  if (!importSource.startsWith('.') && !importSource.startsWith('/') && !importSource.startsWith('@/')) {
    return null;
  }

  const importerDir = path.dirname(importerFile);
  let resolved: string;

  if (importSource.startsWith('@/')) {
    resolved = importSource.replace('@/', 'src/');
  } else if (importSource.startsWith('/')) {
    resolved = importSource.slice(1);
  } else {
    resolved = path.join(importerDir, importSource);
  }

  resolved = resolved.replace(/\\/g, '/');

  // Try different extensions
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    // Return the candidate path (we'll validate existence later if needed)
    // For now, just return the normalized path
    return candidate;
  }

  // Try index files
  for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
    const indexPath = path.join(resolved, `index${ext}`).replace(/\\/g, '/');
    return indexPath;
  }

  return resolved;
}

/**
 * Detect unused exports in files that are reachable/used
 *
 * This finds exports within used files that are never imported anywhere
 */
async function detectUnusedExports(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];

  try {
    logger.info('Analyzing used files for unused exports...');

    const glob = await import('fast-glob');

    // Get all reachable files (used files)
    const reachableFiles = await glob.default([
      'src/**/*.{js,jsx,ts,tsx}'
    ], {
      cwd: process.cwd(),
      absolute: false,
      ignore: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/*.d.ts', // Skip type definition files
      ]
    });

    // Step 1: Build export map (file -> exports)
    logger.info(`Scanning ${reachableFiles.length} files for exports...`);
    const exportMap = new Map<string, ExportInfo[]>();

    for (const file of reachableFiles) {
      const exports = await extractExports(file);
      if (exports.length > 0) {
        exportMap.set(file, exports);
      }
    }

    const totalExports = Array.from(exportMap.values()).reduce((sum, arr) => sum + arr.length, 0);
    logger.info(`Found ${totalExports} exports across ${exportMap.size} files`);

    // Step 2: Build import map (what imports what)
    logger.info('Building import dependency graph...');
    const allImports: ImportInfo[] = [];

    for (const file of reachableFiles) {
      const imports = await extractImports(file);
      allImports.push(...imports);
    }

    logger.info(`Found ${allImports.length} import statements`);

    // Step 2.5: Build rename map (handle export-as-rename chains)
    logger.info('Building export rename map...');
    const allRenames: RenameInfo[] = [];

    for (const file of reachableFiles) {
      const renames = await extractReexportsWithRenames(file);
      allRenames.push(...renames);
    }

    // Build a lookup map: file -> export name -> list of aliases
    const renameMap = new Map<string, Map<string, string[]>>();

    for (const rename of allRenames) {
      if (!renameMap.has(rename.originalFile)) {
        renameMap.set(rename.originalFile, new Map());
      }

      const fileRenames = renameMap.get(rename.originalFile)!;
      if (!fileRenames.has(rename.originalName)) {
        fileRenames.set(rename.originalName, []);
      }

      fileRenames.get(rename.originalName)!.push(rename.aliasName);
    }

    logger.info(`Found ${allRenames.length} export renames (aliases)`);

    // Step 3: Check each export to see if it's imported anywhere
    let unusedCount = 0;

    for (const [filePath, exports] of exportMap) {
      // Skip barrel files (index files re-export and may look unused)
      if (filePath.endsWith('/index.ts') || filePath.endsWith('/index.tsx') ||
          filePath.endsWith('/index.js') || filePath.endsWith('/index.jsx')) {
        continue;
      }

      // Skip Next.js framework convention files (exports consumed by framework)
      if (isFrameworkConventionFile(filePath)) {
        continue;
      }

      for (const exportInfo of exports) {
        // Skip type exports (they're compile-time only)
        if (exportInfo.type === 'type') {
          continue;
        }

        // Skip named exports that are used as default export value
        // Pattern: export function Foo() {} ... export default Foo
        // IMPORTANT: These are NEVER flagged as unused to prevent accidental deletion
        if (exportInfo.usedInDefaultExport) {
          continue;
        }

        // Get aliases for this export (if any)
        const aliases: string[] = [];
        if (renameMap.has(filePath) && renameMap.get(filePath)!.has(exportInfo.name)) {
          aliases.push(...renameMap.get(filePath)!.get(exportInfo.name)!);
        }

        // Check if this export (or any of its aliases) is imported anywhere
        const isImported = allImports.some(imp => {
          // Resolve the import source to match the export file
          const resolvedSource = resolveImportPath(imp.source, imp.filePath, filePath);

          // Check if the import matches this export (original name or any alias)
          return resolvedSource === filePath &&
                 (imp.importedName === exportInfo.name ||
                  aliases.includes(imp.importedName) ||
                  imp.importedName === 'default' && exportInfo.name === 'default' ||
                  imp.importedName === '*'); // Namespace imports count as used
        });

        // Check if used internally within the same file
        const isUsedLocally = await isExportUsedWithinFile(filePath, exportInfo.name);

        if (!isImported && !isUsedLocally) {
          unusedCount++;
          issues.push({
            type: 'unused-code',
            severity: 'info',
            file: filePath,
            line: exportInfo.line,
            message: `Exported ${exportInfo.type} '${exportInfo.name}' is never imported. Consider removing it.`,
            code: exportInfo.code
          });
        }
      }
    }

    logger.info(`Found ${unusedCount} unused exports`);

  } catch (error: any) {
    logger.error(`Unused exports detection failed: ${error.message}`);
  }

  return issues;
}

/**
 * Check if a file is a Next.js framework convention file
 * These files have exports consumed by the framework, not by user code
 */
function isFrameworkConventionFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Framework files that are consumed by Next.js itself
  const frameworkFiles = [
    // Core routing files (App Router)
    'page.tsx', 'page.ts', 'page.jsx', 'page.js',
    'layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js',
    'route.tsx', 'route.ts', 'route.jsx', 'route.js',
    'loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js',
    'error.tsx', 'error.ts', 'error.jsx', 'error.js',
    'not-found.tsx', 'not-found.ts', 'not-found.jsx', 'not-found.js',
    'global-error.tsx', 'global-error.ts', 'global-error.jsx', 'global-error.js',
    'template.tsx', 'template.ts', 'template.jsx', 'template.js',
    'default.tsx', 'default.ts', 'default.jsx', 'default.js',

    // Metadata files (consumed by Next.js for SEO/metadata generation)
    'opengraph-image.tsx', 'opengraph-image.ts', 'opengraph-image.jsx', 'opengraph-image.js',
    'twitter-image.tsx', 'twitter-image.ts', 'twitter-image.jsx', 'twitter-image.js',
    'icon.tsx', 'icon.ts', 'icon.jsx', 'icon.js',
    'apple-icon.tsx', 'apple-icon.ts', 'apple-icon.jsx', 'apple-icon.js',
    'sitemap.ts', 'sitemap.js',
    'robots.ts', 'robots.js',
    'manifest.ts', 'manifest.js',

    // Middleware and instrumentation (consumed by Next.js runtime)
    'middleware.ts', 'middleware.js',
    'instrumentation.ts', 'instrumentation.js',
    'instrumentation-client.ts', 'instrumentation-client.js',

    // Configuration files
    'next.config.js', 'next.config.mjs', 'next.config.ts',
    'mdx-components.tsx', 'mdx-components.ts', 'mdx-components.jsx', 'mdx-components.js',
  ];

  // Check exact filename match
  if (frameworkFiles.includes(fileName)) {
    return true;
  }

  // Check if it's in app directory (App Router files)
  if (normalizedPath.includes('/app/') && frameworkFiles.includes(fileName)) {
    return true;
  }

  // Check if it's at root level for middleware/instrumentation
  if (!normalizedPath.includes('/') || normalizedPath.split('/').length <= 2) {
    if (['middleware.ts', 'middleware.js', 'instrumentation.ts', 'instrumentation.js'].includes(fileName)) {
      return true;
    }
  }

  return false;
}

/**
 * Resolve import path to absolute file path
 */
function resolveImportPath(importSource: string, importerFile: string, targetFile: string): string | null {
  // Skip external packages
  if (!importSource.startsWith('.') && !importSource.startsWith('/') && !importSource.startsWith('@/')) {
    return null;
  }

  const importerDir = path.dirname(importerFile);
  const resolveCandidates: string[] = [];

  // Handle @/ alias - try multiple base paths
  if (importSource.startsWith('@/')) {
    const withoutAlias = importSource.replace('@/', '');

    // Try multiple base directories for @/ alias
    // In Next.js, @/ can resolve to different bases depending on tsconfig.json
    resolveCandidates.push(`src/${withoutAlias}`);  // Most common: @/ → src/
    resolveCandidates.push(withoutAlias);            // Alternative: @/ → project root
    resolveCandidates.push(`app/${withoutAlias}`);  // Alternative: @/ → app/
  } else if (importSource.startsWith('/')) {
    resolveCandidates.push(importSource.slice(1));
  } else {
    // Relative import
    resolveCandidates.push(path.join(importerDir, importSource));
  }

  // Normalize and try to match against target
  for (let resolved of resolveCandidates) {
    // Normalize to forward slashes
    resolved = resolved.replace(/\\/g, '/');

    // Try different extensions
    const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
    for (const ext of extensions) {
      const candidate = resolved + ext;
      if (candidate === targetFile) {
        return targetFile;
      }
    }

    // Try index files
    for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
      const indexPath = path.join(resolved, `index${ext}`).replace(/\\/g, '/');
      if (indexPath === targetFile) {
        return targetFile;
      }
    }
  }

  return null;
}

// ============================================================================
// Enhanced Reporting
// ============================================================================

/**
 * Helper to print a table row with proper column alignment
 */
function printTableRow(columns: string[], widths: number[], colors?: ('cyan' | 'yellow' | 'red' | 'gray')[]): void {
  const row = columns.map((col, i) => {
    const padded = col.padEnd(widths[i]);
    if (colors && colors[i]) {
      const color = colors[i];
      return color === 'cyan' ? chalk.cyan(padded) :
             color === 'yellow' ? chalk.yellow(padded) :
             color === 'red' ? chalk.red(padded) :
             color === 'gray' ? chalk.gray(padded) : padded;
    }
    return padded;
  }).join(' │ ');
  console.log(`│ ${row} │`);
}

/**
 * Helper to print table separator
 */
function printTableSeparator(widths: number[], type: 'top' | 'middle' | 'bottom'): void {
  const chars = {
    top: { left: '┌', middle: '┬', right: '┐', line: '─' },
    middle: { left: '├', middle: '┼', right: '┤', line: '─' },
    bottom: { left: '└', middle: '┴', right: '┘', line: '─' }
  };
  const char = chars[type];
  const parts = widths.map(w => char.line.repeat(w + 2));
  console.log(char.left + parts.join(char.middle) + char.right);
}

/**
 * Print enhanced report with clean table format
 */
function printEnhancedReport(
  allIssues: HealthIssue[],
  buildIssues: HealthIssue[],
  staticIssues: HealthIssue[],
  unusedCodeIssues: HealthIssue[],
  unusedExportsIssues: HealthIssue[]
): void {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log(chalk.bold.cyan('                           📊 DOCTOR REPORT SUMMARY'));
  console.log('═'.repeat(80));
  console.log('');

  // Summary statistics
  const unusedFiles = unusedCodeIssues.filter(i => i.message.includes('File is not reachable'));
  const unusedAssets = unusedCodeIssues.filter(i => i.message.includes('Public asset'));

  const stats = {
    build: buildIssues.length,
    static: staticIssues.length,
    unusedFiles: unusedFiles.length,
    unusedAssets: unusedAssets.length,
    unusedExports: unusedExportsIssues.length,
    total: allIssues.length
  };

  console.log(`  ${chalk.bold('Total Issues:')} ${chalk.red.bold(stats.total)}`);
  console.log('');
  if (stats.build > 0) console.log(`    ${chalk.yellow('⚠️  Build Errors:')}     ${chalk.yellow.bold(stats.build)}`);
  if (stats.static > 0) console.log(`    ${chalk.yellow('🔍 Static Issues:')}    ${chalk.yellow.bold(stats.static)}`);
  if (stats.unusedFiles > 0) console.log(`    ${chalk.cyan('📄 Unused Files:')}     ${chalk.cyan.bold(stats.unusedFiles)}`);
  if (stats.unusedAssets > 0) console.log(`    ${chalk.cyan('🖼️  Unused Assets:')}    ${chalk.cyan.bold(stats.unusedAssets)}`);
  if (stats.unusedExports > 0) console.log(`    ${chalk.cyan('📦 Unused Exports:')}   ${chalk.cyan.bold(stats.unusedExports)}`);
  console.log('');

  // Group 1: Build and Static Issues (Critical)
  const criticalIssues = [...buildIssues, ...staticIssues];
  if (criticalIssues.length > 0) {
    console.log('═'.repeat(80));
    console.log(chalk.red.bold('⚠️  CRITICAL ISSUES'));
    console.log('═'.repeat(80));
    console.log('');

    const widths = [50, 10, 10];
    printTableSeparator(widths, 'top');
    printTableRow(['Issue', 'Severity', 'Line'], widths, ['cyan', 'cyan', 'cyan']);
    printTableSeparator(widths, 'middle');

    criticalIssues.forEach(issue => {
      const fileName = issue.file.length > 50 ? '...' + issue.file.slice(-47) : issue.file;
      printTableRow([
        issue.message.slice(0, 50),
        issue.severity,
        String(issue.line)
      ], widths);
    });

    printTableSeparator(widths, 'bottom');
    console.log('');
  }

  // Group 2: Unused Files
  if (unusedFiles.length > 0) {
    console.log('═'.repeat(80));
    console.log(chalk.cyan.bold('📄 UNUSED FILES'));
    console.log(chalk.gray('Files not imported or used by any Next.js page/route'));
    console.log('═'.repeat(80));
    console.log('');

    const widths = [5, 65];
    printTableSeparator(widths, 'top');
    printTableRow(['#', 'File Path'], widths, ['cyan', 'cyan']);
    printTableSeparator(widths, 'middle');

    unusedFiles.forEach((issue, idx) => {
      const filePath = issue.file.length > 65 ? '...' + issue.file.slice(-62) : issue.file;
      printTableRow([
        String(idx + 1),
        filePath
      ], widths);
    });

    printTableSeparator(widths, 'bottom');
    console.log('');
    console.log(`  ${chalk.gray('Action:')} Run ${chalk.cyan.bold('carla clean')} to remove these files`);
    console.log('');
  }

  // Group 3: Unused Assets
  if (unusedAssets.length > 0) {
    console.log('═'.repeat(80));
    console.log(chalk.cyan.bold('🖼️  UNUSED PUBLIC ASSETS'));
    console.log(chalk.gray('Assets in /public not referenced anywhere in your code'));
    console.log('═'.repeat(80));
    console.log('');

    const widths = [5, 65];
    printTableSeparator(widths, 'top');
    printTableRow(['#', 'Asset Path'], widths, ['cyan', 'cyan']);
    printTableSeparator(widths, 'middle');

    unusedAssets.forEach((issue, idx) => {
      const assetPath = issue.file.replace('public/', '');
      printTableRow([
        String(idx + 1),
        assetPath
      ], widths);
    });

    printTableSeparator(widths, 'bottom');
    console.log('');
    console.log(`  ${chalk.gray('Action:')} Run ${chalk.cyan.bold('carla clean')} to remove these assets`);
    console.log('');
  }

  // Group 4: Unused Exports (Functions, Constants, Classes)
  if (unusedExportsIssues.length > 0) {
    console.log('═'.repeat(80));
    console.log(chalk.cyan.bold('📦 UNUSED EXPORTS (FUNCTIONS/CONSTANTS/CLASSES)'));
    console.log(chalk.gray('Exports defined but never imported anywhere in the codebase'));
    console.log('═'.repeat(80));
    console.log('');

    const widths = [5, 45, 20, 6];
    printTableSeparator(widths, 'top');
    printTableRow(['#', 'File Path', 'Export', 'Line'], widths, ['cyan', 'cyan', 'cyan', 'cyan']);
    printTableSeparator(widths, 'middle');

    unusedExportsIssues.forEach((issue, idx) => {
      // Extract export name and type from message
      const match = issue.message.match(/Exported (function|const|class) '([^']+)'/);
      const exportName = match ? match[2] : 'unknown';
      const exportType = match ? match[1] : '';
      const typeIcon = exportType === 'function' ? 'ƒ' : exportType === 'class' ? 'C' : '∙';

      const filePath = issue.file.length > 45 ? '...' + issue.file.slice(-42) : issue.file;
      const exportDisplay = `${typeIcon} ${exportName}`;
      const exportTruncated = exportDisplay.length > 20 ? exportDisplay.slice(0, 17) + '...' : exportDisplay;

      printTableRow([
        String(idx + 1),
        filePath,
        exportTruncated,
        String(issue.line)
      ], widths);
    });

    printTableSeparator(widths, 'bottom');
    console.log('');
    console.log(`  ${chalk.gray('Legend:')} ${chalk.cyan('ƒ')} = function  ${chalk.cyan('C')} = class  ${chalk.cyan('∙')} = constant`);
    console.log(`  ${chalk.gray('Action:')} Consider removing these unused exports to clean up your code`);
    console.log('');
  }

  console.log('═'.repeat(80));
  console.log(chalk.red.bold('❌ Health check failed - Fix the issues above'));
  console.log('═'.repeat(80));
  console.log('');
}

// ============================================================================
// Main Command
// ============================================================================

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  try {
    logger.section('👨‍⚕️ The Hydration Healer - Health Check');

    // Step 1: Build check
    const buildIssues = await runBuildCheck();

    // Step 2: Static analysis
    logger.startSpinner('Running static analysis...');
    const staticIssues = await staticAnalysis();
    logger.succeedSpinner(`Found ${staticIssues.length} potential issues via AST`);

    // Step 3: Unused code detection (files and assets)
    logger.startSpinner('Checking for unused code...');
    const unusedCodeIssues = await detectUnusedCode();
    logger.succeedSpinner(`Found ${unusedCodeIssues.length} unused files/assets`);

    // Step 4: Unused exports detection (functions within used files)
    logger.startSpinner('Checking for unused exports in used files...');
    const unusedExportsIssues = await detectUnusedExports();
    logger.succeedSpinner(`Found ${unusedExportsIssues.length} unused exports`);

    const allIssues = [...buildIssues, ...staticIssues, ...unusedCodeIssues, ...unusedExportsIssues];

    if (allIssues.length === 0) {
      logger.success('✨ Your app is healthy! No issues found.');
      return;
    }

    // Print report
    printEnhancedReport(allIssues, buildIssues, staticIssues, unusedCodeIssues, unusedExportsIssues);

    // Exit with error code if issues found (for CI)
    if (options.check) {
      process.exit(1);
    }

  } catch (error) {
    logger.stopSpinner();
    logger.error('Doctor command failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('👨‍⚕️ Detection of hydration errors, unused code, type issues, and antipatterns')
    .option('--check', 'CI mode - check only, exit 1 if issues found')
    .option('--type <type>', 'Check specific type: hydration|types|hardcoded|unused|all', 'all')
    .action(doctorCommand);
}
