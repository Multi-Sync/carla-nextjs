/**
 * Type definitions for carla-nextjs
 */

export interface DynamicParam {
  field_name: string;
  field_type: string;
  field_description: string;
  field_required: boolean;
}

export interface FixedParam {
  field_name: string;
  field_value: any;
}

export interface OrganizationMethod {
  id?: string;
  organization_id?: string;
  assistant_id?: string;
  method_name: string;
  method_description: string;
  method_instruction: string;
  method_verb: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  method_endpoint: string;
  dynamic_params: DynamicParam[];
  fixed_params: FixedParam[];
  auth?: string;
  public?: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  instruction: string;
  source: string;
  enabled: boolean;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required: string[];
  };
  fixed_params?: FixedParam[];
  auth?: string;
  issues?: string[];
}

export interface ToolsConfig {
  version: string;
  generatedAt: string;
  tools: Tool[];
  settings: {
    mcpEndpoint: string;
  };
}

export interface CarlaConfig {
  accessToken: string;
  apiUrl: string;
  organizationId: string;
  lastSync: string | null;
}

export interface ScanResult {
  success: boolean;
  filesScanned: number;
  toolsGenerated: number;
  toolsEnabled: number;
  toolsDisabled: number;
  tools: Tool[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  type: 'security' | 'performance' | 'naming' | 'documentation';
  message: string;
  tool?: string;
  autoFixAvailable: boolean;
}

export interface SyncResult {
  success: boolean;
  toolsSynced: number;
  errors: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}
