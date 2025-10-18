/**
 * API Route Scanner
 *
 * Scans Next.js API routes and extracts information about endpoints
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import * as ts from 'typescript';

export interface RouteInfo {
  filePath: string;
  relativePath: string;
  methods: MethodInfo[];
}

export interface MethodInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  params: ParamInfo[];
  bodyParams: ParamInfo[];
  hasAuth: boolean;
}

export interface ParamInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export class ApiRouteScanner {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Scan all API routes in the project
   */
  async scan(): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = [];

    // Look for both App Router and Pages Router patterns
    const patterns = [
      'app/api/**/route.{ts,js,tsx,jsx}',
      'src/app/api/**/route.{ts,js,tsx,jsx}',
      'pages/api/**/*.{ts,js,tsx,jsx}',
      'src/pages/api/**/*.{ts,js,tsx,jsx}',
    ];

    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: this.projectRoot,
        absolute: false,
      });

      for (const file of files) {
        const route = await this.scanRoute(file);
        if (route && route.methods.length > 0) {
          routes.push(route);
        }
      }
    }

    return routes;
  }

  /**
   * Scan a single route file
   */
  private async scanRoute(relativePath: string): Promise<RouteInfo | null> {
    const filePath = path.join(this.projectRoot, relativePath);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const source = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

    const methods = this.extractMethods(sourceFile, relativePath);

    if (methods.length === 0) {
      return null;
    }

    return {
      filePath,
      relativePath,
      methods,
    };
  }

  /**
   * Extract HTTP methods from source file
   */
  private extractMethods(sourceFile: ts.SourceFile, relativePath: string): MethodInfo[] {
    const methods: MethodInfo[] = [];
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    const visit = (node: ts.Node) => {
      // Look for exported functions named after HTTP methods
      if (ts.isFunctionDeclaration(node) && node.name) {
        const methodName = node.name.text;

        if (httpMethods.includes(methodName)) {
          const endpoint = this.pathToEndpoint(relativePath);
          const params = this.extractParams(node, relativePath);
          const bodyParams = this.extractBodyParams(node);
          const hasAuth = this.detectAuth(node, sourceFile);

          methods.push({
            method: methodName as any,
            endpoint,
            params,
            bodyParams,
            hasAuth,
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return methods;
  }

  /**
   * Convert file path to API endpoint
   */
  private pathToEndpoint(relativePath: string): string {
    // Remove file extension and 'route' filename
    let endpoint = relativePath
      .replace(/\.(ts|js|tsx|jsx)$/, '')
      .replace(/\/route$/, '')
      .replace(/\/index$/, '');

    // Remove app/api or pages/api prefix
    endpoint = endpoint.replace(/^(src\/)?app\/api\//, '/').replace(/^(src\/)?pages\/api\//, '/');

    // Convert [param] to :param
    endpoint = endpoint.replace(/\[([^\]]+)\]/g, ':$1');

    // Ensure it starts with /api
    if (!endpoint.startsWith('/api')) {
      endpoint = '/api' + endpoint;
    }

    return endpoint || '/api';
  }

  /**
   * Extract path parameters from function
   */
  private extractParams(node: ts.FunctionDeclaration, relativePath: string): ParamInfo[] {
    const params: ParamInfo[] = [];

    // Extract from path
    const matches = relativePath.matchAll(/\[([^\]]+)\]/g);
    for (const match of matches) {
      const paramName = match[1];
      params.push({
        name: paramName,
        type: 'string',
        required: true,
        description: `The ${paramName} parameter`,
      });
    }

    return params;
  }

  /**
   * Extract body parameters from function
   */
  private extractBodyParams(node: ts.FunctionDeclaration): ParamInfo[] {
    const params: ParamInfo[] = [];

    // Look for await request.json() or request.body patterns
    const visit = (n: ts.Node) => {
      if (ts.isAwaitExpression(n)) {
        const expression = n.expression;
        if (ts.isCallExpression(expression)) {
          const text = expression.expression.getText();
          if (text.includes('request.json') || text.includes('req.json')) {
            // Try to find destructuring after this
            // This is simplified - real implementation would need more AST traversal
          }
        }
      }
      ts.forEachChild(n, visit);
    };

    visit(node);
    return params;
  }

  /**
   * Detect if route has authentication
   */
  private detectAuth(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): boolean {
    const source = sourceFile.getText();

    // Look for common auth patterns
    const authPatterns = [
      'getServerSession',
      'auth()',
      'authenticate',
      'verifyToken',
      'checkAuth',
      'requireAuth',
      'Authorization',
      'Bearer',
    ];

    return authPatterns.some(pattern => source.includes(pattern));
  }
}
