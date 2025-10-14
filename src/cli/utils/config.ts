/**
 * Configuration utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { CarlaConfig, ToolsConfig } from '../../types/index.js';

const CONFIG_DIR = '.carla';
const CONFIG_FILE = 'config.json';
const TOOLS_FILE = 'carla-tools.json';

export class ConfigManager {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Get the config directory path
   */
  private getConfigDir(): string {
    return path.join(this.projectRoot, CONFIG_DIR);
  }

  /**
   * Ensure config directory exists
   */
  private ensureConfigDir(): void {
    const configDir = this.getConfigDir();
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  /**
   * Load Carla configuration
   */
  loadConfig(): CarlaConfig | null {
    try {
      const configPath = path.join(this.getConfigDir(), CONFIG_FILE);
      if (!fs.existsSync(configPath)) {
        return null;
      }
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save Carla configuration
   */
  saveConfig(config: CarlaConfig): void {
    this.ensureConfigDir();
    const configPath = path.join(this.getConfigDir(), CONFIG_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Load tools configuration
   */
  loadTools(): ToolsConfig | null {
    try {
      const toolsPath = path.join(this.projectRoot, TOOLS_FILE);
      if (!fs.existsSync(toolsPath)) {
        return null;
      }
      const data = fs.readFileSync(toolsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save tools configuration
   */
  saveTools(tools: ToolsConfig): void {
    const toolsPath = path.join(this.projectRoot, TOOLS_FILE);
    fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
  }

  /**
   * Check if project is initialized
   */
  isInitialized(): boolean {
    return this.loadConfig() !== null;
  }

  /**
   * Check if tools have been scanned
   */
  hasTools(): boolean {
    return this.loadTools() !== null;
  }

  /**
   * Get project root
   */
  getProjectRoot(): string {
    return this.projectRoot;
  }

  /**
   * Check if credentials exist
   */
  hasCredentials(): boolean {
    const config = this.loadConfig();
    return config !== null && !!config.accessToken;
  }

  /**
   * Save credentials
   */
  saveCredentials(credentials: {
    accessToken: string;
    apiUrl: string;
    organizationId: string;
  }): void {
    const config: CarlaConfig = {
      accessToken: credentials.accessToken,
      apiUrl: credentials.apiUrl,
      organizationId: credentials.organizationId,
      lastSync: null,
    };
    this.saveConfig(config);
  }

  /**
   * Get credentials
   */
  getCredentials(): { accessToken: string; apiUrl: string; organizationId: string } | null {
    const config = this.loadConfig();
    if (!config || !config.accessToken) {
      return null;
    }
    return {
      accessToken: config.accessToken,
      apiUrl: config.apiUrl,
      organizationId: config.organizationId,
    };
  }

  /**
   * Update last sync time
   */
  updateLastSync(timestamp: string): void {
    const config = this.loadConfig();
    if (config) {
      config.lastSync = timestamp;
      this.saveConfig(config);
    }
  }

  /**
   * Get last sync time
   */
  getLastSync(): string | null {
    const config = this.loadConfig();
    return config?.lastSync || null;
  }
}
