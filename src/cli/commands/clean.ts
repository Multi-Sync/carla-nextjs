/**
 * Clean Command - The Janitor
 *
 * Finds and removes:
 * - Unused files, exports, and dependencies
 * - Duplicate components (AI-generated Button.tsx, NewButton.tsx, etc.)
 * - Zombie code that's imported but never used
 *
 * REFINEMENTS:
 * - Visual diff preview before deletion
 * - Duplicate detection via structural hashing
 * - Git-aware (only check uncommitted files option)
 */

import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { execa } from 'execa';
import prompts from 'prompts';
import fs from 'fs/promises';
import path from 'path';
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import { analyzeReachability } from '../utils/reachability.js';

// Handle ESM/CommonJS interop
const traverse = (traverseModule as any).default || traverseModule;
const generate = (generateModule as any).default || generateModule;
import hash from 'object-hash';
import chalk from 'chalk';

// ============================================================================
// Types
// ============================================================================

export interface CleanOptions {
  check?: boolean; // CI mode - only check, don't prompt
  autoFix?: boolean; // Auto-delete without prompts
  type?: 'files' | 'exports' | 'deps' | 'duplicates' | 'all';
  gitOnly?: boolean; // Only check git-tracked files
}

interface UnusedItem {
  type: 'file' | 'export' | 'dependency';
  path: string;
  name: string;
  reason: string;
  size?: number; // File size in bytes
  line?: number; // Line number for exports
  exportType?: 'function' | 'const' | 'class' | 'default';
}

interface DuplicateGroup {
  signature: string;
  components: ComponentInfo[];
  recommendation: string;
}

interface ComponentInfo {
  filePath: string;
  name: string;
  ast: any;
  jsxStructure: string;
  imports: string[];
  exports: string[];
}

// ============================================================================
// Reachability-Based Unused Code Detection
// ============================================================================

/**
 * Find unused code using reachability analysis
 */
async function findUnusedCode(): Promise<UnusedItem[]> {
  logger.startSpinner('Scanning for unused code via reachability analysis...');

  try {
    const result = await analyzeReachability();
    const unused: UnusedItem[] = [];

    // Add unreachable files
    for (const file of result.unreachableFiles) {
      try {
        const stats = await fs.stat(file);
        unused.push({
          type: 'file',
          path: file,
          name: path.basename(file),
          reason: 'Not reachable from any Next.js entry point',
          size: stats.size,
        });
      } catch {
        // File might not exist anymore
      }
    }

    // Add unreachable assets
    for (const asset of result.unreachableAssets) {
      const publicPath = 'public' + asset;
      try {
        const stats = await fs.stat(publicPath);
        unused.push({
          type: 'file',
          path: publicPath,
          name: path.basename(asset),
          reason: 'Public asset not referenced in any code',
          size: stats.size,
        });
      } catch {
        // Asset might not exist anymore
      }
    }

    logger.succeedSpinner(
      `Found ${result.unreachableFiles.length} unreachable files and ${result.unreachableAssets.length} unreachable assets`
    );
    return unused;
  } catch (error: any) {
    logger.failSpinner(`Reachability analysis failed: ${error.message}`);
    return [];
  }
}

// ============================================================================
// Unused Exports Detection
// ============================================================================

interface ExportInfo {
  name: string;
  type: 'function' | 'const' | 'class' | 'default' | 'type';
  filePath: string;
  line: number;
  code: string;
  usedInDefaultExport?: boolean; // True if this named export is used as default export value
}

interface ImportInfo {
  importedName: string;
  localName: string;
  source: string;
  filePath: string;
}

interface RenameInfo {
  originalFile: string; // File where the original export lives
  originalName: string; // Original export name
  aliasName: string; // Renamed export name
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
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    traverse(ast, {
      ExportNamedDeclaration(path: any) {
        if (t.isFunctionDeclaration(path.node.declaration)) {
          const funcNode = path.node.declaration;
          if (funcNode.id) {
            exports.push({
              name: funcNode.id.name,
              type: 'function',
              filePath,
              line: path.node.loc?.start.line || 0,
              code: generate(funcNode).code.split('\n')[0],
            });
          }
        }

        if (t.isVariableDeclaration(path.node.declaration)) {
          path.node.declaration.declarations.forEach((decl: any) => {
            if (t.isIdentifier(decl.id)) {
              const isFunction =
                t.isArrowFunctionExpression(decl.init) || t.isFunctionExpression(decl.init);
              exports.push({
                name: decl.id.name,
                type: isFunction ? 'function' : 'const',
                filePath,
                line: path.node.loc?.start.line || 0,
                code: generate(decl).code.split('\n')[0],
              });
            }
          });
        }

        if (t.isClassDeclaration(path.node.declaration)) {
          const classNode = path.node.declaration;
          if (classNode.id) {
            exports.push({
              name: classNode.id.name,
              type: 'class',
              filePath,
              line: path.node.loc?.start.line || 0,
              code: `class ${classNode.id.name} { ... }`,
            });
          }
        }

        if (
          t.isTSTypeAliasDeclaration(path.node.declaration) ||
          t.isTSInterfaceDeclaration(path.node.declaration)
        ) {
          const typeNode = path.node.declaration;
          exports.push({
            name: typeNode.id.name,
            type: 'type',
            filePath,
            line: path.node.loc?.start.line || 0,
            code: generate(typeNode).code.split('\n')[0],
          });
        }

        if (!path.node.declaration && path.node.specifiers) {
          path.node.specifiers.forEach((spec: any) => {
            if (t.isExportSpecifier(spec)) {
              const exportedName = t.isIdentifier(spec.exported)
                ? spec.exported.name
                : spec.exported.value;
              exports.push({
                name: exportedName,
                type: 'const',
                filePath,
                line: path.node.loc?.start.line || 0,
                code: `export { ${exportedName} }`,
              });
            }
          });
        }
      },

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
          code: generate(path.node).code.split('\n')[0],
        });
      },
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
      },
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
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
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
          if (
            (t.isFunctionDeclaration(parent) || t.isClassDeclaration(parent)) &&
            parent.id === path.node
          ) {
            return;
          }

          // Skip if this is the exported identifier in export specifier
          // export { foo } <- skip the foo here
          if (
            t.isExportSpecifier(parent) &&
            (parent.exported === path.node || parent.local === path.node)
          ) {
            return;
          }

          // Skip if this is a property key (e.g., { PLAN_CONFIG: value })
          if (t.isObjectProperty(parent) && parent.key === path.node && !parent.computed) {
            return;
          }

          // Count this as a usage
          usageCount++;
        }
      },
    });

    // If used at least once outside the export declaration, it's used internally
    return usageCount > 0;
  } catch (error) {
    // If we can't parse the file, assume not used
    return false;
  }
}

/**
 * Extract all imports from a file
 */
async function extractImports(filePath: string): Promise<ImportInfo[]> {
  const imports: ImportInfo[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    traverse(ast, {
      ImportDeclaration(path: any) {
        const source = path.node.source.value;

        path.node.specifiers.forEach((spec: any) => {
          if (t.isImportSpecifier(spec)) {
            const importedName = t.isIdentifier(spec.imported)
              ? spec.imported.name
              : spec.imported.value;
            imports.push({
              importedName,
              localName: spec.local.name,
              source,
              filePath,
            });
          } else if (t.isImportDefaultSpecifier(spec)) {
            imports.push({
              importedName: 'default',
              localName: spec.local.name,
              source,
              filePath,
            });
          } else if (t.isImportNamespaceSpecifier(spec)) {
            imports.push({
              importedName: '*',
              localName: spec.local.name,
              source,
              filePath,
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
          const parent = astPath.parent;

          // Check if this is part of a variable declaration with destructuring
          if (t.isVariableDeclarator(parent) && t.isObjectPattern(parent.id)) {
            // Extract destructured identifiers: const { Conversation, X } = require('./file')
            parent.id.properties.forEach((prop: any) => {
              if (
                t.isObjectProperty(prop) &&
                t.isIdentifier(prop.key) &&
                t.isIdentifier(prop.value)
              ) {
                const importedName = prop.key.name;
                const localName = prop.value.name;

                imports.push({
                  importedName,
                  localName,
                  source,
                  filePath,
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
        });
      },
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
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
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
                    reexportedFromFile: filePath,
                  });
                }
              }
            }
          });
        }
      },
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
  if (
    !importSource.startsWith('.') &&
    !importSource.startsWith('/') &&
    !importSource.startsWith('@/')
  ) {
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
 * Resolve import path to match target file
 */
function resolveImportPath(
  importSource: string,
  importerFile: string,
  targetFile: string
): string | null {
  if (
    !importSource.startsWith('.') &&
    !importSource.startsWith('/') &&
    !importSource.startsWith('@/')
  ) {
    return null;
  }

  const importerDir = path.dirname(importerFile);
  const resolveCandidates: string[] = [];

  // Handle @/ alias - try multiple base paths
  if (importSource.startsWith('@/')) {
    const withoutAlias = importSource.replace('@/', '');

    // Try multiple base directories for @/ alias
    // In Next.js, @/ can resolve to different bases depending on tsconfig.json
    resolveCandidates.push(`src/${withoutAlias}`); // Most common: @/ → src/
    resolveCandidates.push(withoutAlias); // Alternative: @/ → project root
    resolveCandidates.push(`app/${withoutAlias}`); // Alternative: @/ → app/
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
    'page.tsx',
    'page.ts',
    'page.jsx',
    'page.js',
    'layout.tsx',
    'layout.ts',
    'layout.jsx',
    'layout.js',
    'route.tsx',
    'route.ts',
    'route.jsx',
    'route.js',
    'loading.tsx',
    'loading.ts',
    'loading.jsx',
    'loading.js',
    'error.tsx',
    'error.ts',
    'error.jsx',
    'error.js',
    'not-found.tsx',
    'not-found.ts',
    'not-found.jsx',
    'not-found.js',
    'global-error.tsx',
    'global-error.ts',
    'global-error.jsx',
    'global-error.js',
    'template.tsx',
    'template.ts',
    'template.jsx',
    'template.js',
    'default.tsx',
    'default.ts',
    'default.jsx',
    'default.js',

    // Metadata files (consumed by Next.js for SEO/metadata generation)
    'opengraph-image.tsx',
    'opengraph-image.ts',
    'opengraph-image.jsx',
    'opengraph-image.js',
    'twitter-image.tsx',
    'twitter-image.ts',
    'twitter-image.jsx',
    'twitter-image.js',
    'icon.tsx',
    'icon.ts',
    'icon.jsx',
    'icon.js',
    'apple-icon.tsx',
    'apple-icon.ts',
    'apple-icon.jsx',
    'apple-icon.js',
    'sitemap.ts',
    'sitemap.js',
    'robots.ts',
    'robots.js',
    'manifest.ts',
    'manifest.js',

    // Middleware and instrumentation (consumed by Next.js runtime)
    'middleware.ts',
    'middleware.js',
    'instrumentation.ts',
    'instrumentation.js',
    'instrumentation-client.ts',
    'instrumentation-client.js',

    // Configuration files
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'mdx-components.tsx',
    'mdx-components.ts',
    'mdx-components.jsx',
    'mdx-components.js',
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
    if (
      ['middleware.ts', 'middleware.js', 'instrumentation.ts', 'instrumentation.js'].includes(
        fileName
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Detect unused exports in used files
 */
async function detectUnusedExports(
  unusedFilePaths: Set<string> = new Set()
): Promise<UnusedItem[]> {
  const unused: UnusedItem[] = [];

  try {
    // IMPORTANT: unusedFilePaths is passed in to exclude them from export scanning
    // This prevents double-detection where a file is marked as unused AND its exports are marked as unused
    // If a file will be deleted entirely, no point checking its individual exports
    logger.info(`Excluding ${unusedFilePaths.size} unused files from export analysis`);

    const glob = await import('fast-glob');

    const allFiles = await glob.default(['src/**/*.{js,jsx,ts,tsx}'], {
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
        '**/*.d.ts',
      ],
    });

    // Filter out files that are themselves unused (will be deleted entirely)
    const reachableFiles = allFiles.filter(file => !unusedFilePaths.has(file));

    logger.info(
      `Scanning ${reachableFiles.length} reachable files for exports (${allFiles.length - reachableFiles.length} unused files excluded)...`
    );
    const exportMap = new Map<string, ExportInfo[]>();

    for (const file of reachableFiles) {
      const exports = await extractExports(file);
      if (exports.length > 0) {
        exportMap.set(file, exports);
      }
    }

    const totalExports = Array.from(exportMap.values()).reduce((sum, arr) => sum + arr.length, 0);
    logger.info(`Found ${totalExports} exports`);

    logger.info('Building import dependency graph...');
    const allImports: ImportInfo[] = [];

    for (const file of reachableFiles) {
      const imports = await extractImports(file);
      allImports.push(...imports);
    }

    logger.info(`Found ${allImports.length} import statements`);

    // Build rename map (handle export-as-rename chains)
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

    let unusedCount = 0;

    for (const [filePath, exports] of exportMap) {
      // Skip barrel files (index files re-export and may look unused)
      if (
        filePath.endsWith('/index.ts') ||
        filePath.endsWith('/index.tsx') ||
        filePath.endsWith('/index.js') ||
        filePath.endsWith('/index.jsx')
      ) {
        continue;
      }

      // Skip Next.js framework convention files (exports consumed by framework)
      if (isFrameworkConventionFile(filePath)) {
        continue;
      }

      for (const exportInfo of exports) {
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
          const resolvedSource = resolveImportPath(imp.source, imp.filePath, filePath);
          return (
            resolvedSource === filePath &&
            (imp.importedName === exportInfo.name ||
              aliases.includes(imp.importedName) ||
              (imp.importedName === 'default' && exportInfo.name === 'default') ||
              imp.importedName === '*')
          );
        });

        // Check if used internally within the same file
        const isUsedLocally = await isExportUsedWithinFile(filePath, exportInfo.name);

        if (!isImported && !isUsedLocally) {
          unusedCount++;
          unused.push({
            type: 'export',
            path: filePath,
            name: exportInfo.name,
            reason: `Exported ${exportInfo.type} never imported`,
            line: exportInfo.line,
            exportType: exportInfo.type,
          });
        }
      }
    }

    logger.info(`Found ${unusedCount} unused exports`);
  } catch (error: any) {
    logger.error(`Unused exports detection failed: ${error.message}`);
  }

  return unused;
}

/**
 * Remove a specific export from a file using AST
 */
async function removeExportFromFile(
  filePath: string,
  exportName: string,
  line: number
): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });

    let modified = false;

    traverse(ast, {
      ExportNamedDeclaration(path: any) {
        // Check if this is the export we want to remove
        if (path.node.loc?.start.line === line) {
          path.remove();
          modified = true;
        }

        // Also handle export { foo, bar }
        else if (path.node.specifiers && path.node.specifiers.length > 0) {
          const remainingSpecifiers = path.node.specifiers.filter((spec: any) => {
            if (t.isExportSpecifier(spec)) {
              const name = t.isIdentifier(spec.exported) ? spec.exported.name : spec.exported.value;
              return name !== exportName;
            }
            return true;
          });

          if (remainingSpecifiers.length === 0) {
            path.remove();
            modified = true;
          } else if (remainingSpecifiers.length !== path.node.specifiers.length) {
            path.node.specifiers = remainingSpecifiers;
            modified = true;
          }
        }
      },

      ExportDefaultDeclaration(path: any) {
        if (exportName === 'default' && path.node.loc?.start.line === line) {
          path.remove();
          modified = true;
        }
      },
    });

    if (modified) {
      const newCode = generate(ast as any, {
        retainLines: true,
        comments: true,
      }).code;
      await fs.writeFile(filePath, newCode);
      return true;
    }

    return false;
  } catch (error: any) {
    logger.error(`Failed to remove export from ${filePath}: ${error.message}`);
    return false;
  }
}

// ============================================================================
// Duplicate Component Detection (The Killer Feature)
// ============================================================================

/**
 * Find duplicate components via structural hashing
 *
 * REFINEMENT: Uses AST to detect components with identical JSX structure
 * but different names (e.g., Button.tsx and NewButton.tsx)
 */
async function findDuplicateComponents(): Promise<DuplicateGroup[]> {
  logger.startSpinner('Detecting duplicate components...');

  const glob = await import('fast-glob');
  const componentFiles = await glob.default(['**/*.{tsx,jsx}'], {
    cwd: process.cwd(),
    ignore: ['node_modules', '.next', 'dist', '.git'],
  });

  const componentsBySignature = new Map<string, ComponentInfo[]>();

  for (const file of componentFiles) {
    const content = await fs.readFile(file, 'utf-8');

    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy'],
      });

      let hasComponent = false;
      const imports: string[] = [];
      const exports: string[] = [];
      let jsxStructure = '';

      traverse(ast, {
        ImportDeclaration(path: any) {
          imports.push(generate(path.node).code);
        },

        ExportNamedDeclaration(path: any) {
          if (path.node.declaration) {
            exports.push(generate(path.node.declaration).code);
          }
        },

        ExportDefaultDeclaration(path: any) {
          exports.push(generate(path.node).code);
        },

        // Find React components (functions returning JSX)
        FunctionDeclaration(path: any) {
          const name = path.node.id?.name;
          if (name && /^[A-Z]/.test(name)) {
            hasComponent = true;
            // Extract JSX structure only (ignore props, text content)
            const structureAst = normalizeJSX(path.node);
            jsxStructure = generate(structureAst).code;
          }
        },

        ArrowFunctionExpression(path: any) {
          const parent = path.parent;
          if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
            const name = parent.id.name;
            if (/^[A-Z]/.test(name)) {
              hasComponent = true;
              const structureAst = normalizeJSX(path.node);
              jsxStructure = generate(structureAst).code;
            }
          }
        },
      });

      if (hasComponent && jsxStructure) {
        // Generate structural hash (ignoring variable names and content)
        const signature = hash(jsxStructure);

        if (!componentsBySignature.has(signature)) {
          componentsBySignature.set(signature, []);
        }

        componentsBySignature.get(signature)!.push({
          filePath: file,
          name: path.basename(file, path.extname(file)),
          ast,
          jsxStructure,
          imports,
          exports,
        });
      }
    } catch (error) {
      // Parse error - skip
      continue;
    }
  }

  // Find groups with duplicates (2+ components with same signature)
  const duplicateGroups: DuplicateGroup[] = [];

  for (const [signature, components] of componentsBySignature.entries()) {
    if (components.length > 1) {
      // Determine which to keep (prefer shorter name, fewer dependencies)
      const sorted = components.sort((a, b) => {
        if (a.name.length !== b.name.length) {
          return a.name.length - b.name.length;
        }
        return a.imports.length - b.imports.length;
      });

      duplicateGroups.push({
        signature,
        components,
        recommendation: `Keep ${sorted[0].name}, remove others`,
      });
    }
  }

  logger.succeedSpinner(`Found ${duplicateGroups.length} duplicate groups`);
  return duplicateGroups;
}

/**
 * Normalize JSX AST to only structural elements (ignore props, text)
 */
function normalizeJSX(node: any): any {
  const cloned = t.cloneNode(node, true, true);

  traverse(
    cloned as any,
    {
      JSXElement(path: any) {
        // Remove all attributes
        if (path.node.openingElement) {
          path.node.openingElement.attributes = [];
        }
      },

      JSXText(path: any) {
        // Replace all text with placeholder
        path.node.value = 'TEXT';
      },

      StringLiteral(path: any) {
        // Normalize string literals
        path.node.value = 'STRING';
      },

      NumericLiteral(path: any) {
        // Normalize numbers
        path.node.value = 0;
      },
    },
    undefined,
    undefined,
    undefined
  );

  return cloned;
}

// ============================================================================
// Interactive Cleanup
// ============================================================================

interface CleanupStats {
  filesDeleted: number;
  duplicatesDeleted: number;
  exportsRemoved: number;
  dependenciesRemoved: number;
  diskSpaceSaved: number; // in bytes
  deletedFiles: string[];
}

/**
 * Interactive cleanup with diff preview
 */
async function interactiveClean(
  unused: UnusedItem[],
  duplicates: DuplicateGroup[]
): Promise<CleanupStats> {
  const stats: CleanupStats = {
    filesDeleted: 0,
    duplicatesDeleted: 0,
    exportsRemoved: 0,
    dependenciesRemoved: 0,
    diskSpaceSaved: 0,
    deletedFiles: [],
  };
  const fileItems = unused.filter(i => i.type === 'file');
  const exportItems = unused.filter(i => i.type === 'export');
  const depItems = unused.filter(i => i.type === 'dependency');

  logger.section('🗑️  Cleanup Summary');

  if (fileItems.length > 0) {
    logger.info(`📄 ${fileItems.length} unused files`);
  }
  if (exportItems.length > 0) {
    logger.info(`📤 ${exportItems.length} unused exports`);
  }
  if (depItems.length > 0) {
    logger.info(`📦 ${depItems.length} unused dependencies`);
  }
  if (duplicates.length > 0) {
    logger.info(`🔄 ${duplicates.length} duplicate component groups`);
  }

  // Handle duplicates first
  if (duplicates.length > 0) {
    logger.section('🔄 Duplicate Components');

    for (const group of duplicates) {
      console.log('\n' + '='.repeat(70));
      logger.warn(`Found ${group.components.length} identical components:`);

      group.components.forEach((comp, idx) => {
        console.log(`  ${idx + 1}. ${chalk.cyan(comp.filePath)}`);
      });

      logger.info(`💡 Recommendation: ${group.recommendation}`);

      const response = await prompts({
        type: 'select',
        name: 'action',
        message: 'What should I do?',
        choices: [
          { title: '📋 Show diff between components', value: 'diff' },
          { title: '✅ Keep first, delete others', value: 'delete' },
          { title: '⏭️  Skip this group', value: 'skip' },
        ],
      });

      if (response.action === 'diff') {
        // Show side-by-side diff
        const first = group.components[0];
        const second = group.components[1];

        const firstContent = await fs.readFile(first.filePath, 'utf-8');
        const secondContent = await fs.readFile(second.filePath, 'utf-8');

        console.log('\n' + chalk.bold('Diff:'));
        console.log(chalk.green(`+++ ${first.filePath}`));
        console.log(chalk.red(`--- ${second.filePath}`));

        // Simple line-by-line diff
        const lines1 = firstContent.split('\n');
        const lines2 = secondContent.split('\n');
        const maxLines = Math.max(lines1.length, lines2.length);

        for (let i = 0; i < Math.min(maxLines, 20); i++) {
          const line1 = lines1[i] || '';
          const line2 = lines2[i] || '';

          if (line1 !== line2) {
            console.log(chalk.red(`- ${line2}`));
            console.log(chalk.green(`+ ${line1}`));
          }
        }

        // Ask again
        const deleteResponse = await prompts({
          type: 'confirm',
          name: 'delete',
          message: 'Delete duplicates and keep first?',
          initial: false,
        });

        if (deleteResponse.delete) {
          for (let i = 1; i < group.components.length; i++) {
            await fs.unlink(group.components[i].filePath);
            stats.duplicatesDeleted++;
            stats.filesDeleted++;
            stats.deletedFiles.push(group.components[i].filePath);
            logger.success(`Deleted: ${group.components[i].filePath}`);
          }
        }
      } else if (response.action === 'delete') {
        for (let i = 1; i < group.components.length; i++) {
          await fs.unlink(group.components[i].filePath);
          stats.duplicatesDeleted++;
          stats.filesDeleted++;
          stats.deletedFiles.push(group.components[i].filePath);
          logger.success(`Deleted: ${group.components[i].filePath}`);
        }
      }
    }
  }

  // Delete unused files
  if (fileItems.length > 0) {
    logger.section('📄 Unused Files');

    // Show top 10
    fileItems.slice(0, 10).forEach(item => {
      const sizeKB = item.size ? (item.size / 1024).toFixed(2) : '0';
      logger.info(`  ${item.path} (${sizeKB} KB) - ${item.reason}`);
    });

    if (fileItems.length > 10) {
      logger.info(`  ... and ${fileItems.length - 10} more`);
    }

    const response = await prompts({
      type: 'confirm',
      name: 'deleteFiles',
      message: `Delete ${fileItems.length} unused files?`,
      initial: false,
    });

    if (response.deleteFiles) {
      for (const item of fileItems) {
        try {
          await fs.unlink(item.path);
          stats.filesDeleted++;
          stats.diskSpaceSaved += item.size || 0;
          stats.deletedFiles.push(item.path);
          logger.success(`Deleted: ${item.path}`);
        } catch (error) {
          logger.error(`Failed to delete: ${item.path}`);
        }
      }
    }
  }

  // Uninstall dependencies
  if (depItems.length > 0) {
    logger.section('📦 Unused Dependencies');

    depItems.forEach(item => {
      logger.info(`  ${item.name} - ${item.reason}`);
    });

    const response = await prompts({
      type: 'confirm',
      name: 'uninstallDeps',
      message: `Uninstall ${depItems.length} unused dependencies?`,
      initial: false,
    });

    if (response.uninstallDeps) {
      logger.startSpinner('Uninstalling dependencies...');

      try {
        await execa('npm', ['uninstall', ...depItems.map(d => d.name)]);
        stats.dependenciesRemoved = depItems.length;
        logger.succeedSpinner('Dependencies removed');
      } catch (error) {
        logger.failSpinner('Failed to uninstall dependencies');
      }
    }
  }

  // Remove unused exports
  if (exportItems.length > 0) {
    logger.section('📤 Unused Exports');

    // Group exports by file
    const exportsByFile = new Map<string, UnusedItem[]>();
    exportItems.forEach(item => {
      if (!exportsByFile.has(item.path)) {
        exportsByFile.set(item.path, []);
      }
      exportsByFile.get(item.path)!.push(item);
    });

    logger.info(`Found ${exportItems.length} unused exports in ${exportsByFile.size} files\n`);

    for (const [filePath, exports] of exportsByFile) {
      console.log(chalk.cyan(`\n${filePath}:`));
      exports.forEach((exp, idx) => {
        const typeIcon =
          exp.exportType === 'function' ? 'ƒ' : exp.exportType === 'class' ? 'C' : '∙';
        console.log(
          `  ${chalk.gray(`${idx + 1}.`)} ${typeIcon} ${chalk.yellow(exp.name)} ${chalk.gray(`(line ${exp.line})`)}`
        );
      });

      const response = await prompts({
        type: 'select',
        name: 'action',
        message: `Remove ${exports.length} export(s) from this file?`,
        choices: [
          { title: '✅ Yes, remove all exports from this file', value: 'remove' },
          { title: '📋 Show file preview first', value: 'preview' },
          { title: '⏭️  Skip this file', value: 'skip' },
        ],
      });

      if (response.action === 'preview') {
        // Show file content around the exports
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n');

          console.log(chalk.gray('\n─'.repeat(70)));
          console.log(chalk.bold(`Preview of ${filePath}:`));
          console.log(chalk.gray('─'.repeat(70)));

          for (const exp of exports.slice(0, 3)) {
            const line = exp.line || 1;
            const start = Math.max(0, line - 3);
            const end = Math.min(lines.length, line + 2);

            console.log(chalk.gray(`\nAround line ${line}:`));
            for (let i = start; i < end; i++) {
              const prefix = i === line - 1 ? chalk.red('→ ') : '  ';
              console.log(`${prefix}${chalk.gray(`${i + 1}:`)} ${lines[i]}`);
            }
          }

          if (exports.length > 3) {
            console.log(chalk.gray(`\n... and ${exports.length - 3} more exports`));
          }

          console.log(chalk.gray('─'.repeat(70) + '\n'));

          // Ask again after preview
          const confirmResponse = await prompts({
            type: 'confirm',
            name: 'remove',
            message: 'Remove these exports?',
            initial: false,
          });

          if (!confirmResponse.remove) {
            continue;
          }
        } catch (error) {
          logger.error(`Failed to read file: ${error}`);
          continue;
        }
      } else if (response.action === 'skip') {
        continue;
      }

      // Remove each export
      let removed = 0;
      for (const exp of exports) {
        const success = await removeExportFromFile(filePath, exp.name, exp.line || 0);
        if (success) {
          removed++;
          stats.exportsRemoved++;
          logger.success(`Removed ${exp.name} from ${filePath}`);
        }
      }

      if (removed > 0) {
        logger.success(`✅ Removed ${removed}/${exports.length} exports from ${filePath}`);
      }
    }
  }

  return stats;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// Main Command
// ============================================================================

export async function cleanCommand(options: CleanOptions): Promise<void> {
  try {
    logger.section('🧹 The Janitor - Cleaning AI-Generated Mess');

    let unused: UnusedItem[] = [];
    let duplicates: DuplicateGroup[] = [];

    // Find unused code (files) - run this first to get unused file paths
    if (options.type === 'all' || options.type === 'files' || !options.type) {
      unused = await findUnusedCode();
    }

    // Extract unused file paths to pass to detectUnusedExports
    const unusedFilePaths = new Set(
      unused.filter(item => item.type === 'file').map(item => item.path)
    );

    // Find unused exports (functions/constants/classes)
    if (options.type === 'all' || options.type === 'exports' || !options.type) {
      logger.startSpinner('Detecting unused exports...');
      const unusedExports = await detectUnusedExports(unusedFilePaths);
      unused = [...unused, ...unusedExports];
      logger.succeedSpinner(`Found ${unusedExports.length} unused exports`);
    }

    // Find duplicates
    if (options.type === 'all' || options.type === 'duplicates' || !options.type) {
      duplicates = await findDuplicateComponents();
    }

    if (unused.length === 0 && duplicates.length === 0) {
      logger.success('✨ Your codebase is clean! No unused code or duplicates found.');
      return;
    }

    // CI mode - just report and exit with error if found
    if (options.check) {
      logger.error(`Found ${unused.length} unused items and ${duplicates.length} duplicate groups`);
      process.exit(1);
    }

    // Interactive mode
    const stats = await interactiveClean(unused, duplicates);

    // Display beautiful colored summary
    if (
      stats.filesDeleted > 0 ||
      stats.exportsRemoved > 0 ||
      stats.dependenciesRemoved > 0 ||
      stats.duplicatesDeleted > 0
    ) {
      console.log('\n' + '='.repeat(70));
      logger.section('✨ Cleanup Impact Summary');

      if (stats.filesDeleted > 0) {
        console.log(chalk.green(`  ✓ ${stats.filesDeleted} files deleted`));
      }

      if (stats.exportsRemoved > 0) {
        console.log(chalk.green(`  ✓ ${stats.exportsRemoved} unused exports removed`));
      }

      if (stats.diskSpaceSaved > 0) {
        console.log(chalk.green(`  ✓ ${formatBytes(stats.diskSpaceSaved)} disk space recovered`));
      }

      if (stats.duplicatesDeleted > 0) {
        console.log(chalk.cyan(`  ✓ ${stats.duplicatesDeleted} duplicate components removed`));
      }

      if (stats.dependenciesRemoved > 0) {
        console.log(chalk.cyan(`  ✓ ${stats.dependenciesRemoved} dependencies uninstalled`));
      }

      console.log('='.repeat(70) + '\n');
    }

    logger.section('✅ Cleanup Complete');
    logger.list([
      'Run tests: npm test',
      'Check build: npm run build',
      'Commit changes: git add . && git commit -m "chore: remove unused code"',
    ]);
  } catch (error) {
    logger.stopSpinner();
    logger.error('Clean command failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function registerCleanCommand(program: Command): void {
  program
    .command('clean')
    .description('🧹 Find and remove unused files, exports, dependencies, and duplicates')
    .option('--check', 'CI mode - check only, exit 1 if issues found')
    .option('--auto-fix', 'Auto-delete without prompts (dangerous!)')
    .option('--type <type>', 'Clean specific type: files|exports|deps|duplicates|all', 'all')
    .option('--git-only', 'Only check git-tracked files')
    .action(cleanCommand);
}
