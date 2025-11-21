/**
 * Reachability Analyzer Utilities
 *
 * Shared functions for detecting unused code and assets
 * Used by both doctor and clean commands
 */

import fs from 'fs/promises';
import path from 'path';
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { logger } from './logger.js';

// Handle ESM/CommonJS interop
const traverse = (traverseModule as any).default || traverseModule;

export interface ReachabilityResult {
  unreachableFiles: string[];
  unreachableAssets: string[];
  reachableFilesCount: number;
  entryPointsCount: number;
  totalAssetsCount: number;
  referencedAssetsCount: number;
}

/**
 * Discover all assets in the public directory
 */
export async function discoverPublicAssets(): Promise<Set<string>> {
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

    return assets;
  } catch (error: any) {
    logger.error(`Failed to discover public assets: ${error.message}`);
    return assets;
  }
}

/**
 * Find all references to public assets in code
 */
export async function findAssetReferences(): Promise<Set<string>> {
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

    return references;
  } catch (error: any) {
    logger.error(`Failed to find asset references: ${error.message}`);
    return references;
  }
}

/**
 * Extract asset references from JavaScript/TypeScript/JSX content
 */
export function extractAssetReferences(content: string): string[] {
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
export function extractCSSAssetReferences(content: string): string[] {
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
 * Run full reachability analysis
 */
export async function analyzeReachability(): Promise<ReachabilityResult> {
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

  // Step 2: Build reachability tree by following imports
  async function markReachable(filePath: string): Promise<void> {
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

  // Step 5: Check for unused public assets
  const publicAssets = await discoverPublicAssets();
  const unreachableAssets: string[] = [];

  if (publicAssets.size > 0) {
    const assetReferences = await findAssetReferences();

    for (const asset of publicAssets) {
      if (!assetReferences.has(asset)) {
        unreachableAssets.push(asset);
      }
    }
  }

  return {
    unreachableFiles,
    unreachableAssets,
    reachableFilesCount: reachableFiles.size,
    entryPointsCount: entryPoints.length,
    totalAssetsCount: publicAssets.size,
    referencedAssetsCount: publicAssets.size - unreachableAssets.length
  };
}
