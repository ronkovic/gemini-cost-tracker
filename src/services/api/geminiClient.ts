import axios, { AxiosInstance } from 'axios';
import { APIClient, Usage, UsageParams, AppError, ErrorCode } from '../../types/index.js';
import { AuthManager } from '../auth/authManager.js';
import { RealUsageClient } from './realUsageClient.js';
import { logger } from '../../utils/logger.js';

export class GeminiClient implements APIClient {
  private httpClient: AxiosInstance;
  private authManager: AuthManager;
  private realUsageClient?: RealUsageClient;
  private useRealData: boolean;

  constructor(authManager: AuthManager, useRealData: boolean = false) {
    this.authManager = authManager;
    this.useRealData = useRealData;

    if (this.useRealData) {
      this.realUsageClient = new RealUsageClient(authManager);
    }
    this.httpClient = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1/',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(async (config) => {
      const apiKey = await this.authManager.getGeminiCredentials();
      config.params = { ...config.params, key: apiKey };
      return config;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Gemini API error:', error.response?.data || error.message);
        throw new AppError(
          ErrorCode.GEMINI_API_ERROR,
          `Gemini API request failed: ${error.response?.data?.error?.message || error.message}`
        );
      }
    );
  }

  async getUsage(params: UsageParams): Promise<Usage[]> {
    // Validate date range
    if (params.startDate >= params.endDate) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Start date must be before end date');
    }

    try {
      logger.info('Fetching Gemini usage data', {
        useRealData: this.useRealData,
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString(),
      });

      if (this.useRealData && this.realUsageClient) {
        logger.info('Using real usage data from Cloud APIs');
        const realUsage = await this.realUsageClient.getUsage(params);
        return realUsage.filter((usage) => usage.service === 'gemini');
      } else {
        logger.warn('Using mock data - real data not enabled');
        return this.generateMockUsageData(params);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorCode.GEMINI_USAGE_ERROR,
        `Failed to fetch Gemini usage data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private generateMockUsageData(params: UsageParams): Usage[] {
    const mockData: Usage[] = [];
    const daysDiff = Math.ceil(
      (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < Math.min(daysDiff, 10); i++) {
      const date = new Date(params.startDate);
      date.setDate(date.getDate() + i);

      mockData.push({
        id: `gemini-${date.toISOString().split('T')[0]}-${i}`,
        timestamp: date,
        service: 'gemini',
        model: params.model || 'gemini-pro',
        inputTokens: Math.floor(Math.random() * 10000) + 1000,
        outputTokens: Math.floor(Math.random() * 5000) + 500,
        project: params.project,
        region: 'us-central1',
      });
    }

    logger.debug(`Generated ${mockData.length} mock Gemini usage records`);
    return mockData;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple models list request
      await this.httpClient.get('models');
      return true;
    } catch (error) {
      logger.error('Gemini connection test failed:', error as Record<string, unknown>);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.httpClient.get('models');
      return response.data.models?.map((model: { name: string }) => model.name) || [];
    } catch (error) {
      logger.error('Failed to fetch Gemini models:', error as Record<string, unknown>);
      return ['gemini-pro', 'gemini-pro-vision']; // fallback
    }
  }
}
