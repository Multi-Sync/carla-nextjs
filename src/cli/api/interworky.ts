/**
 * Interworky API Client
 *
 * Handles communication with Interworky Core API using hardcoded authentication
 */

import axios, { AxiosInstance } from 'axios';
import { OrganizationMethod, Tool } from '../../types/index.js';
import { CARLA_ACCESS_TOKEN, INTERWORKY_API_URL } from '../../config/auth.js';

export interface SyncResponse {
  success: boolean;
  synced: number;
  failed: number;
  errors?: string[];
}

export class InterworkyAPI {
  private client: AxiosInstance;
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;

    this.client = axios.create({
      baseURL: INTERWORKY_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CARLA_ACCESS_TOKEN}`,
      },
      timeout: 30000,
    });
  }

  /**
   * Get organization ID
   */
  getOrganizationId(): string {
    return this.organizationId;
  }

  /**
   * Sync tools to Interworky
   */
  async syncTools(tools: Tool[]): Promise<SyncResponse> {
    try {
      // Convert tools to organization methods format
      const methods: OrganizationMethod[] = tools.map(tool => this.toolToMethod(tool));

      const response = await this.client.post('/organization-methods/bulk', {
        organization_id: this.organizationId,
        methods,
      });

      return {
        success: true,
        synced: response.data.synced || methods.length,
        failed: response.data.failed || 0,
        errors: response.data.errors || [],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to sync tools');
      }
      throw error;
    }
  }

  /**
   * Get synced tools from Interworky
   */
  async getTools(): Promise<OrganizationMethod[]> {
    try {
      const response = await this.client.get(
        `/organization-methods/organization/${this.organizationId}`
      );
      return response.data.methods || response.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tools');
      }
      throw error;
    }
  }

  /**
   * Update a specific tool
   */
  async updateTool(toolId: string, updates: Partial<OrganizationMethod>): Promise<void> {
    try {
      await this.client.put(`/organization-methods/${toolId}`, updates);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update tool');
      }
      throw error;
    }
  }

  /**
   * Delete a tool
   */
  async deleteTool(toolId: string): Promise<void> {
    try {
      await this.client.delete(`/organization-methods/${toolId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete tool');
      }
      throw error;
    }
  }

  /**
   * Convert Tool to OrganizationMethod format
   */
  private toolToMethod(tool: Tool): OrganizationMethod {
    // Convert parameters to dynamic_params format
    const dynamic_params = Object.entries(tool.parameters.properties).map(([name, prop]) => ({
      field_name: name,
      field_type: (prop as { type: string; description: string }).type,
      field_description: (prop as { type: string; description: string }).description,
      field_required: tool.parameters.required.includes(name),
    }));

    return {
      method_name: tool.name,
      method_description: tool.description,
      method_instruction: tool.instruction,
      method_verb: tool.method,
      method_endpoint: tool.endpoint,
      dynamic_params,
      fixed_params: tool.fixed_params || [],
      auth: tool.auth,
      public: tool.enabled,
    };
  }

  /**
   * Convert OrganizationMethod to Tool format
   */
  methodToTool(method: OrganizationMethod): Tool {
    // Convert dynamic_params to parameters format
    const properties: Record<string, { type: string; description: string }> = {};
    const required: string[] = [];

    for (const param of method.dynamic_params) {
      properties[param.field_name] = {
        type: param.field_type,
        description: param.field_description,
      };
      if (param.field_required) {
        required.push(param.field_name);
      }
    }

    return {
      id: method.id || method.method_name,
      name: method.method_name,
      description: method.method_description,
      instruction: method.method_instruction,
      source: 'synced',
      enabled: method.public !== false,
      method: method.method_verb,
      endpoint: method.method_endpoint,
      parameters: {
        type: 'object',
        properties,
        required,
      },
      fixed_params: method.fixed_params,
      auth: method.auth,
    };
  }
}
