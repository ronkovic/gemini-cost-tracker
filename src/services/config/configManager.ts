import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ConfigFile, Currency, Format } from '../../types/index.js';
import { DEFAULT_CONFIG, FILE_PATHS } from '../../utils/constants.js';
import { ErrorHandler } from '../../utils/errorHandler.js';
import { logger } from '../../utils/logger.js';

export class ConfigManager {
  private configDir: string;
  private configPath: string;
  private config: ConfigFile | null = null;

  constructor() {
    this.configDir = path.join(os.homedir(), FILE_PATHS.CONFIG_DIR);
    this.configPath = path.join(this.configDir, FILE_PATHS.CONFIG_FILE);
  }

  async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(this.configDir);
    } catch {
      await fs.mkdir(this.configDir, { recursive: true });
      logger.debug('Created config directory', { path: this.configDir });
    }
  }

  async loadConfig(): Promise<ConfigFile> {
    if (this.config) {
      return this.config;
    }

    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
      logger.debug('Loaded config from file', { path: this.configPath });
      return this.config!;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Config file doesn't exist, return default config
        this.config = this.getDefaultConfig();
        logger.info('Using default configuration');
        return this.config;
      }
      throw ErrorHandler.createFileError(
        `Failed to load config: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async saveConfig(config: ConfigFile): Promise<void> {
    try {
      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
      logger.info('Configuration saved', { path: this.configPath });
    } catch (error) {
      throw ErrorHandler.createFileError(
        `Failed to save config: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async updateConfig(updates: Partial<ConfigFile>): Promise<ConfigFile> {
    const currentConfig = await this.loadConfig();
    const newConfig = { ...currentConfig, ...updates };
    await this.saveConfig(newConfig);
    return newConfig;
  }

  getDefaultConfig(): ConfigFile {
    return {
      defaultCurrency: DEFAULT_CONFIG.CURRENCY,
      defaultFormat: DEFAULT_CONFIG.FORMAT,
    };
  }

  async getDefaultCurrency(): Promise<Currency> {
    const config = await this.loadConfig();
    return config.defaultCurrency || DEFAULT_CONFIG.CURRENCY;
  }

  async getDefaultFormat(): Promise<Format> {
    const config = await this.loadConfig();
    return config.defaultFormat || DEFAULT_CONFIG.FORMAT;
  }

  async getDefaultProject(): Promise<string | undefined> {
    const config = await this.loadConfig();
    return config.defaultProject;
  }

  async setDefaultCurrency(currency: Currency): Promise<void> {
    await this.updateConfig({ defaultCurrency: currency });
  }

  async setDefaultFormat(format: Format): Promise<void> {
    await this.updateConfig({ defaultFormat: format });
  }

  async setDefaultProject(project: string): Promise<void> {
    await this.updateConfig({ defaultProject: project });
  }

  async getGeminiApiKey(): Promise<string | undefined> {
    const config = await this.loadConfig();
    return config.apiKeys?.gemini || process.env.GEMINI_API_KEY;
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    const config = await this.loadConfig();
    await this.updateConfig({
      apiKeys: {
        ...config.apiKeys,
        gemini: apiKey,
      },
    });
  }

  async getGcpProjectId(): Promise<string | undefined> {
    const config = await this.loadConfig();
    return config.gcpSettings?.projectId || process.env.GCP_PROJECT_ID;
  }

  async setGcpProjectId(projectId: string): Promise<void> {
    const config = await this.loadConfig();
    await this.updateConfig({
      gcpSettings: {
        ...config.gcpSettings,
        projectId,
      },
    });
  }

  async getGcpKeyFilePath(): Promise<string | undefined> {
    const config = await this.loadConfig();
    return config.gcpSettings?.keyFilePath || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  async setGcpKeyFilePath(keyFilePath: string): Promise<void> {
    const config = await this.loadConfig();
    await this.updateConfig({
      gcpSettings: {
        ...config.gcpSettings,
        keyFilePath,
      },
    });
  }

  async validateConfig(): Promise<boolean> {
    try {
      const config = await this.loadConfig();

      // Check if at least one API key is configured
      const hasGeminiKey = config.apiKeys?.gemini || process.env.GEMINI_API_KEY;
      const hasGcpProject = config.gcpSettings?.projectId || process.env.GCP_PROJECT_ID;

      if (!hasGeminiKey && !hasGcpProject) {
        logger.warn('No API keys configured');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Config validation failed', {}, error instanceof Error ? error : undefined);
      return false;
    }
  }

  async resetConfig(): Promise<void> {
    this.config = null;
    try {
      await fs.unlink(this.configPath);
      logger.info('Configuration reset');
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
        throw ErrorHandler.createFileError(`Failed to reset config: ${error.message}`);
      }
    }
  }
}
