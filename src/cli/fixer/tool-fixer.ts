/**
 * Tool Fixer
 *
 * Auto-fixes common issues in tool definitions
 */

import { Tool } from '../../types/index.js';

export interface FixResult {
  tool: Tool;
  fixed: boolean;
  fixes: string[];
}

export class ToolFixer {
  /**
   * Fix all tools
   */
  fixAll(tools: Tool[]): FixResult[] {
    return tools.map(tool => this.fixTool(tool));
  }

  /**
   * Fix a single tool
   */
  fixTool(tool: Tool): FixResult {
    const fixes: string[] = [];
    let fixedTool = { ...tool };

    // Fix missing descriptions
    if (!fixedTool.description || fixedTool.description.trim() === '') {
      fixedTool.description = this.generateDescription(fixedTool);
      fixes.push('Added missing description');
    }

    // Fix missing instructions
    if (!fixedTool.instruction || fixedTool.instruction.trim() === '') {
      fixedTool.instruction = this.generateInstruction(fixedTool);
      fixes.push('Added missing instruction');
    }

    // Fix parameter descriptions
    const paramFixes = this.fixParameterDescriptions(fixedTool);
    if (paramFixes.count > 0) {
      fixedTool = paramFixes.tool;
      fixes.push(`Fixed ${paramFixes.count} parameter descriptions`);
    }

    // Fix naming conventions
    if (this.hasNamingIssues(fixedTool.name)) {
      const oldName = fixedTool.name;
      fixedTool.name = this.fixNaming(fixedTool.name);
      fixedTool.id = fixedTool.name;
      fixes.push(`Fixed naming: ${oldName} → ${fixedTool.name}`);
    }

    // Remove duplicate issues
    if (fixedTool.issues) {
      fixedTool.issues = [...new Set(fixedTool.issues)];
    }

    // Clear resolved issues
    fixedTool.issues = this.filterUnresolvedIssues(fixedTool);

    return {
      tool: fixedTool,
      fixed: fixes.length > 0,
      fixes,
    };
  }

  /**
   * Generate description from tool metadata
   */
  private generateDescription(tool: Tool): string {
    const resource = this.extractResourceName(tool.endpoint);
    const method = tool.method;

    switch (method) {
      case 'GET':
        if (tool.endpoint.includes(':id') || tool.endpoint.includes('{id}')) {
          return `Retrieve ${resource} by ID`;
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
        return `${method} operation on ${resource}`;
    }
  }

  /**
   * Generate instruction from tool metadata
   */
  private generateInstruction(tool: Tool): string {
    const resource = this.extractResourceName(tool.endpoint);
    const method = tool.method;

    switch (method) {
      case 'GET':
        if (tool.endpoint.includes(':id')) {
          return `Use this tool when the user asks about a specific ${resource}. Requires the ID parameter.`;
        }
        return `Use this tool when the user asks to see all ${resource} or list ${resource}.`;
      case 'POST':
        return `Use this tool when the user wants to create or add a new ${resource}.`;
      case 'PUT':
        return `Use this tool when the user wants to completely update a ${resource}.`;
      case 'PATCH':
        return `Use this tool when the user wants to make partial updates to a ${resource}.`;
      case 'DELETE':
        return `⚠️ Destructive operation. Only use when user explicitly requests deletion of a ${resource}. Confirm before executing.`;
      default:
        return `Use this tool for ${method} operations on ${resource}.`;
    }
  }

  /**
   * Fix parameter descriptions
   */
  private fixParameterDescriptions(tool: Tool): { tool: Tool; count: number } {
    let count = 0;
    const fixedTool = { ...tool };
    const properties = { ...tool.parameters.properties };

    for (const [name, prop] of Object.entries(properties)) {
      const typedProp = prop as { type: string; description: string };
      if (
        !typedProp.description ||
        typedProp.description.trim() === '' ||
        typedProp.description === `The ${name} parameter`
      ) {
        properties[name] = {
          ...typedProp,
          description: this.generateParameterDescription(name, typedProp.type, tool),
        };
        count++;
      }
    }

    if (count > 0) {
      fixedTool.parameters = {
        ...tool.parameters,
        properties,
      };
    }

    return { tool: fixedTool, count };
  }

  /**
   * Generate parameter description
   */
  private generateParameterDescription(name: string, type: string, tool: Tool): string {
    // Common parameter patterns
    if (name === 'id') {
      const resource = this.extractResourceName(tool.endpoint);
      return `Unique identifier for the ${resource}`;
    }

    if (name.endsWith('_id') || name.endsWith('Id')) {
      const resourceName = name.replace(/_id|Id$/, '');
      return `Unique identifier for the ${resourceName}`;
    }

    if (name === 'email') {
      return 'Email address';
    }

    if (name === 'password') {
      return 'Password (minimum 8 characters)';
    }

    if (name === 'name') {
      return 'Name';
    }

    if (name === 'description') {
      return 'Description or additional details';
    }

    if (name === 'status') {
      return 'Current status';
    }

    if (name === 'created_at' || name === 'createdAt') {
      return 'Creation timestamp';
    }

    if (name === 'updated_at' || name === 'updatedAt') {
      return 'Last update timestamp';
    }

    // Default based on type
    switch (type) {
      case 'string':
        return `${this.capitalize(name)} (string)`;
      case 'number':
      case 'integer':
        return `${this.capitalize(name)} (numeric value)`;
      case 'boolean':
        return `${this.capitalize(name)} (true/false)`;
      case 'array':
        return `Array of ${name}`;
      case 'object':
        return `${this.capitalize(name)} object`;
      default:
        return this.capitalize(name.replace(/[_-]/g, ' '));
    }
  }

  /**
   * Check if naming has issues
   */
  private hasNamingIssues(name: string): boolean {
    // Check for double underscores
    if (name.includes('__')) return true;

    // Check for trailing/leading underscores
    if (name.startsWith('_') || name.endsWith('_')) return true;

    // Check for inconsistent casing
    if (name !== name.toLowerCase()) return true;

    return false;
  }

  /**
   * Fix naming issues
   */
  private fixNaming(name: string): string {
    // Convert to lowercase
    let fixed = name.toLowerCase();

    // Remove double underscores
    fixed = fixed.replace(/__+/g, '_');

    // Remove leading/trailing underscores
    fixed = fixed.replace(/^_+|_+$/g, '');

    return fixed;
  }

  /**
   * Filter unresolved issues
   */
  private filterUnresolvedIssues(tool: Tool): string[] {
    if (!tool.issues) return [];

    const resolvedIssues = new Set<string>();

    // Check if description issue is resolved
    if (tool.description && tool.description.trim() !== '') {
      resolvedIssues.add('missing_description');
    }

    // Check if parameter issues are resolved
    const allParamsHaveDescriptions = Object.values(tool.parameters.properties).every(
      prop =>
        (prop as { type: string; description: string }).description &&
        (prop as { type: string; description: string }).description.trim() !== ''
    );
    if (allParamsHaveDescriptions) {
      resolvedIssues.add('missing_parameter_descriptions');
    }

    // Filter out resolved issues
    return tool.issues.filter((issue: string) => !resolvedIssues.has(issue));
  }

  /**
   * Extract resource name from endpoint
   */
  private extractResourceName(endpoint: string): string {
    // Remove /api prefix
    const name = endpoint.replace(/^\/api/, '');

    // Get the last meaningful segment (before :id or {id})
    const segments = name.split('/').filter(s => s && !s.startsWith(':') && !s.startsWith('{'));

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
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
