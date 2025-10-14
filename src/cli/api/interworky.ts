/**
 * Interworky API Client
 *
 * Handles communication with Interworky Core API
 */

import axios, { AxiosInstance } from 'axios';
import { OrganizationMethod, Tool } from '../../types';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface OrganizationResponse {
  organization: {
    id: string;
    organization_name: string;
    organization_website: string;
    creator_user_id: string;
  };
}

export interface AssistantResponse {
  id: string;
  organization_id: string;
  assistant_id: string;
  assistant_name: string;
}

export interface BulkMethodsResponse {
  methods: OrganizationMethod[];
}

export class InterworkyClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'https://api.interworky.com') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Authenticate with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/api/login', {
      email,
      password,
    });

    if (response.data.token) {
      this.setToken(response.data.token);
    }

    return response.data;
  }

  /**
   * Get user's organizations
   */
  async getOrganizations(userId: string): Promise<OrganizationResponse[]> {
    const response = await this.client.get(`/api/organizations/user/${userId}`);
    return response.data;
  }

  /**
   * Get organization by ID
   */
  async getOrganization(orgId: string): Promise<OrganizationResponse> {
    const response = await this.client.get(`/api/organizations/${orgId}`);
    return response.data;
  }

  /**
   * Get assistant info for organization
   */
  async getAssistantInfo(orgId: string): Promise<AssistantResponse> {
    const response = await this.client.get(`/api/assistant-info/${orgId}`);
    return response.data;
  }

  /**
   * Create organization methods in bulk
   */
  async createBulkMethods(
    assistantId: string,
    methods: OrganizationMethod[]
  ): Promise<BulkMethodsResponse> {
    const response = await this.client.post('/api/organization-methods/bulk', {
      assistant_id: assistantId,
      methods,
    });
    return response.data;
  }

  /**
   * Get organization methods
   */
  async getOrganizationMethods(orgId: string): Promise<OrganizationMethod[]> {
    const response = await this.client.get(
      `/api/organization-methods/organization/${orgId}`
    );
    return response.data;
  }

  /**
   * Update a single organization method
   */
  async updateMethod(methodId: string, method: Partial<OrganizationMethod>): Promise<OrganizationMethod> {
    const response = await this.client.put(
      `/api/organization-methods/${methodId}`,
      method
    );
    return response.data;
  }

  /**
   * Delete an organization method
   */
  async deleteMethod(methodId: string): Promise<void> {
    await this.client.delete(`/api/organization-methods/${methodId}`);
  }
}

/**
 * Simplified API client for API key-based authentication
 */
export interface OrganizationInfo {
  organizationId: string;
  organizationName: string;
}

export interface SyncResponse {
  success: boolean;
  synced: number;
  failed: number;
  errors?: string[];
}

export class InterworkyAPI {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string, baseURL: string = 'https://api.interworky.com') {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      timeout: 30000,
    });
  }

  /**
   * Sync tools to Interworky
   */
  async syncTools(tools: Tool[], assistantId: string): Promise<SyncResponse> {
    try {
      // Convert tools to organization methods format
      const methods: OrganizationMethod[] = tools.map(tool => this.toolToMethod(tool));

      const response = await this.client.post('/organization-methods/bulk', {
        assistant_id: assistantId,
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
  async getTools(organizationId: string): Promise<OrganizationMethod[]> {
    try {
      const response = await this.client.get(`/organization-methods/organization/${organizationId}`);
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
      field_type: prop.type,
      field_description: prop.description,
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
