import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { AuthCredentials, AppError, ErrorCode } from '../../types/index.js';

export class AuthManager {
  private configDir: string;
  private configFile: string;
  private credentials: AuthCredentials = {};

  constructor() {
    this.configDir = path.join(os.homedir(), '.gemini-cost-tracker');
    this.configFile = path.join(this.configDir, 'config.json');
  }

  async initialize(): Promise<void> {
    try {
      // Ensure config directory exists
      await fs.mkdir(this.configDir, { recursive: true });

      // Load existing configuration
      await this.loadConfiguration();

      // Also check environment variables
      this.loadFromEnvironment();
    } catch (error) {
      throw new AppError(
        ErrorCode.AUTH_INIT_ERROR,
        `Failed to initialize authentication: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      this.credentials = JSON.parse(configData);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, start with empty credentials
      this.credentials = {};
    }
  }

  private loadFromEnvironment(): void {
    // Override with environment variables if present
    if (process.env.GEMINI_API_KEY) {
      this.credentials.geminiApiKey = process.env.GEMINI_API_KEY;
    }

    if (process.env.GOOGLE_CLOUD_PROJECT) {
      this.credentials.gcpProjectId = process.env.GOOGLE_CLOUD_PROJECT;
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.credentials.gcpKeyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
  }

  private async saveConfiguration(): Promise<void> {
    try {
      const configData = JSON.stringify(this.credentials, null, 2);
      await fs.writeFile(this.configFile, configData, 'utf8');
    } catch (error) {
      throw new AppError(
        ErrorCode.AUTH_SAVE_ERROR,
        `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getConfiguration(): Promise<AuthCredentials> {
    // Reload configuration to get latest values
    await this.loadConfiguration();
    this.loadFromEnvironment();
    return { ...this.credentials };
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    this.credentials.geminiApiKey = apiKey;
    await this.saveConfiguration();
  }

  async setGcpProjectId(projectId: string): Promise<void> {
    this.credentials.gcpProjectId = projectId;
    await this.saveConfiguration();
  }

  async setGcpKeyFile(keyFile: string): Promise<void> {
    // Validate that the file exists
    try {
      await fs.access(keyFile);
      this.credentials.gcpKeyFile = keyFile;
      await this.saveConfiguration();
    } catch {
      throw new AppError(
        ErrorCode.AUTH_KEY_FILE_ERROR,
        `Service account key file not found: ${keyFile}`
      );
    }
  }

  async getGeminiCredentials(): Promise<string> {
    if (!this.credentials.geminiApiKey) {
      throw new AppError(
        ErrorCode.AUTH_MISSING_GEMINI_KEY,
        'Gemini API key not configured. Run "gemini-cost-tracker config" to set it up.'
      );
    }
    return this.credentials.geminiApiKey;
  }

  async getGcpCredentials(): Promise<{ projectId: string; keyFile?: string }> {
    if (!this.credentials.gcpProjectId) {
      throw new AppError(
        ErrorCode.AUTH_MISSING_GCP_PROJECT,
        'Google Cloud Project ID not configured. Run "gemini-cost-tracker config" to set it up.'
      );
    }

    return {
      projectId: this.credentials.gcpProjectId,
      keyFile: this.credentials.gcpKeyFile,
    };
  }

  async validateCredentials(): Promise<boolean> {
    try {
      // Basic validation - check if required credentials are present
      const hasGeminiKey = !!this.credentials.geminiApiKey;
      const hasGcpProject = !!this.credentials.gcpProjectId;

      if (!hasGeminiKey || !hasGcpProject) {
        return false;
      }

      // If GCP key file is specified, validate it exists
      if (this.credentials.gcpKeyFile) {
        try {
          await fs.access(this.credentials.gcpKeyFile);
        } catch {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async clearConfiguration(): Promise<void> {
    this.credentials = {};
    try {
      await fs.unlink(this.configFile);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
        throw new AppError(
          ErrorCode.AUTH_CLEAR_ERROR,
          `Failed to clear configuration: ${error.message}`
        );
      }
    }
  }
}
