/**
 * Tool Generator
 *
 * Converts scanned API routes into tool definitions
 */

import { RouteInfo, MethodInfo } from '../scanner/api-routes.js';
import { Tool, Recommendation } from '../../types/index.js';

export interface GenerateResult {
  tools: Tool[];
  recommendations: Recommendation[];
}

export class ToolGenerator {
  /**
   * Generate tools from scanned routes
   */
  generate(routes: RouteInfo[]): GenerateResult {
    const tools: Tool[] = [];
    const recommendations: Recommendation[] = [];

    for (const route of routes) {
      for (const method of route.methods) {
        const tool = this.generateTool(route, method);
        tools.push(tool);

        // Generate recommendations
        const recs = this.generateRecommendations(tool, method);
        recommendations.push(...recs);
      }
    }

    return { tools, recommendations };
  }

  /**
   * Generate a single tool from a method
   */
  private generateTool(route: RouteInfo, method: MethodInfo): Tool {
    const toolName = this.generateToolName(method.endpoint, method.method);
    const description = this.generateDescription(method.endpoint, method.method);
    const instruction = this.generateInstruction(method.endpoint, method.method);

    // Build parameters
    const properties: Record<string, { type: string; description: string }> = {};
    const required: string[] = [];

    // Add path params
    for (const param of method.params) {
      properties[param.name] = {
        type: param.type,
        description: param.description || `The ${param.name} parameter`,
      };
      if (param.required) {
        required.push(param.name);
      }
    }

    // Add body params for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method.method)) {
      for (const param of method.bodyParams) {
        properties[param.name] = {
          type: param.type,
          description: param.description || `The ${param.name} field`,
        };
        if (param.required) {
          required.push(param.name);
        }
      }
    }

    // Determine if tool should be enabled by default
    const enabled = this.shouldEnableByDefault(method.method);

    // Detect issues
    const issues: string[] = [];
    if (method.method === 'DELETE') {
      issues.push('destructive_operation');
    }
    if (!method.hasAuth && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.method)) {
      issues.push('no_authentication_detected');
    }

    return {
      id: toolName,
      name: toolName,
      description,
      instruction,
      source: route.relativePath,
      enabled,
      method: method.method,
      endpoint: method.endpoint,
      parameters: {
        type: 'object',
        properties,
        required,
      },
      auth: method.hasAuth ? 'required' : undefined,
      issues,
    };
  }

  /**
   * Generate tool name from endpoint and method
   */
  private generateToolName(endpoint: string, method: string): string {
    // Remove /api prefix
    let name = endpoint.replace(/^\/api/, '');

    // Remove leading slash
    name = name.replace(/^\//, '');

    // Replace slashes and special chars with underscores
    name = name.replace(/[/:-]/g, '_');

    // Add method prefix
    const methodPrefix = method.toLowerCase();

    // Handle common patterns
    if (name.includes('_id') || name.endsWith('_')) {
      // GET /users/:id -> get_user (singular)
      name = name.replace(/_id$/, '').replace(/_$/, '');
    }

    if (!name) {
      name = 'root';
    }

    // Combine method and name
    const toolName = `${methodPrefix}_${name}`;

    return toolName.replace(/__+/g, '_'); // Remove double underscores
  }

  /**
   * Generate description for tool
   */
  private generateDescription(endpoint: string, method: string): string {
    const resource = this.extractResourceName(endpoint);

    switch (method) {
      case 'GET':
        if (endpoint.includes(':id') || endpoint.includes(':')) {
          return `Get ${resource} by ID`;
        }
        return `List all ${resource}`;
      case 'POST':
        return `Create a new ${resource}`;
      case 'PUT':
        return `Update ${resource} by ID`;
      case 'PATCH':
        return `Partially update ${resource} by ID`;
      case 'DELETE':
        return `Delete ${resource} by ID`;
      default:
        return `${method} ${endpoint}`;
    }
  }

  /**
   * Generate instruction for tool
   */
  private generateInstruction(endpoint: string, method: string): string {
    const resource = this.extractResourceName(endpoint);

    switch (method) {
      case 'GET':
        if (endpoint.includes(':id')) {
          return `Use this tool when the user asks about a specific ${resource}. Requires the ID.`;
        }
        return `Use this tool when the user asks to see all ${resource} or list ${resource}.`;
      case 'POST':
        return `Use this tool when the user wants to create or add a new ${resource}.`;
      case 'PUT':
        return `Use this tool when the user wants to update or modify a ${resource}.`;
      case 'PATCH':
        return `Use this tool when the user wants to make partial updates to a ${resource}.`;
      case 'DELETE':
        return `⚠️ Destructive operation. Only use when user explicitly requests deletion of a ${resource}.`;
      default:
        return `Call this tool for ${method} operations on ${endpoint}`;
    }
  }

  /**
   * Extract resource name from endpoint
   */
  private extractResourceName(endpoint: string): string {
    // Remove /api prefix
    const name = endpoint.replace(/^\/api/, '');

    // Get the last meaningful segment (before :id)
    const segments = name.split('/').filter(s => s && !s.startsWith(':'));

    if (segments.length === 0) {
      return 'resource';
    }

    const resourceName = segments[segments.length - 1];

    // Make singular if it's plural
    if (resourceName.endsWith('s') && resourceName.length > 2) {
      return resourceName.slice(0, -1);
    }

    return resourceName;
  }

  /**
   * Should tool be enabled by default?
   */
  private shouldEnableByDefault(method: string): boolean {
    // Disable DELETE operations by default for safety
    if (method === 'DELETE') {
      return false;
    }

    return true;
  }

  /**
   * Generate recommendations for a tool
   */
  private generateRecommendations(tool: Tool, method: MethodInfo): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Destructive operations
    if (method.method === 'DELETE') {
      recommendations.push({
        type: 'security',
        message: `DELETE operation detected and disabled by default: ${tool.name}`,
        tool: tool.name,
        autoFixAvailable: false,
      });
    }

    // Missing authentication
    if (!method.hasAuth && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.method)) {
      recommendations.push({
        type: 'security',
        message: `No authentication detected for ${method.method} operation: ${tool.name}`,
        tool: tool.name,
        autoFixAvailable: false,
      });
    }

    // Missing parameters
    if (Object.keys(tool.parameters.properties).length === 0) {
      recommendations.push({
        type: 'documentation',
        message: `No parameters detected for ${tool.name}. Consider adding parameter documentation.`,
        tool: tool.name,
        autoFixAvailable: false,
      });
    }

    return recommendations;
  }
}
