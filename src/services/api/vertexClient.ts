import axios, { AxiosInstance } from 'axios';
import { APIClient, Usage, UsageParams, AppError, ErrorCode } from '../../types/index.js';
import { AuthManager } from '../auth/authManager.js';
import { RealUsageClient } from './realUsageClient.js';
import { logger } from '../../utils/logger.js';

export class VertexClient implements APIClient {
  private httpClient: AxiosInstance;
  private authManager: AuthManager;
  private projectId?: string;
  private realUsageClient?: RealUsageClient;
  private useRealData: boolean;

  constructor(authManager: AuthManager, useRealData: boolean = false) {
    this.authManager = authManager;
    this.useRealData = useRealData;

    if (this.useRealData) {
      this.realUsageClient = new RealUsageClient(authManager);
    }
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Vertex AI API error:', error.response?.data || error.message);
        throw new AppError(
          ErrorCode.VERTEX_API_ERROR,
          `Vertex AI API request failed: ${error.response?.data?.error?.message || error.message}`
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
      logger.info('Fetching Vertex AI usage data', {
        useRealData: this.useRealData,
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString(),
      });

      const gcpCredentials = await this.authManager.getGcpCredentials();
      this.projectId = gcpCredentials.projectId;

      if (this.useRealData && this.realUsageClient) {
        logger.info('Using real usage data from Cloud APIs');
        const realUsage = await this.realUsageClient.getUsage(params);
        return realUsage.filter((usage) => usage.service === 'vertex-ai');
      } else {
        logger.debug('Using mock data - real data not enabled');
        return this.generateMockUsageData(params);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorCode.VERTEX_USAGE_ERROR,
        `Failed to fetch Vertex AI usage data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private generateMockUsageData(params: UsageParams): Usage[] {
    const mockData: Usage[] = [];
    const daysDiff = Math.ceil(
      (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < Math.min(daysDiff, 8); i++) {
      const date = new Date(params.startDate);
      date.setDate(date.getDate() + i);

      // Generate different model usage
      const models = ['text-bison-001', 'chat-bison-001', 'code-bison-001'];
      const model = params.model || models[i % models.length];

      mockData.push({
        id: `vertex-${date.toISOString().split('T')[0]}-${i}`,
        timestamp: date,
        service: 'vertex-ai',
        model,
        inputTokens: Math.floor(Math.random() * 8000) + 800,
        outputTokens: Math.floor(Math.random() * 4000) + 400,
        project: params.project || this.projectId,
        region: 'us-central1',
      });
    }

    logger.debug(`Generated ${mockData.length} mock Vertex AI usage records`);
    return mockData;
  }

  async testConnection(): Promise<boolean> {
    try {
      const gcpCredentials = await this.authManager.getGcpCredentials();
      this.projectId = gcpCredentials.projectId;

      // Test with a simple project info request
      // This would need proper authentication setup
      logger.info('Testing Vertex AI connection...');
      return true; // Mock success for now
    } catch (error) {
      logger.error('Vertex AI connection test failed:', error as Record<string, unknown>);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // This would typically call the Vertex AI models API
    return [
      'text-bison-001',
      'text-bison-002',
      'chat-bison-001',
      'chat-bison-002',
      'code-bison-001',
      'code-bison-002',
      'codechat-bison-001',
      'codechat-bison-002',
    ];
  }
}
