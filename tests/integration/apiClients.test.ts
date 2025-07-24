import { GeminiClient } from '../../src/services/api/geminiClient.js';
import { VertexClient } from '../../src/services/api/vertexClient.js';
import { RealUsageClient } from '../../src/services/api/realUsageClient.js';
import { CostCalculator } from '../../src/services/calculator/costCalculator.js';
import { mockUsageData, mockConfig, mockErrorResponses } from '../fixtures/mockResponses.js';

// Mock external dependencies
jest.mock('@google-cloud/logging');
jest.mock('@google-cloud/monitoring');

describe('API Clients Integration Tests', () => {
  let mockAuthManager: any;
  let geminiClient: GeminiClient;
  let vertexClient: VertexClient;
  let realUsageClient: RealUsageClient;
  let costCalculator: CostCalculator;

  beforeEach(() => {
    // Reset mock functions
    jest.clearAllMocks();
    
    // Create mock AuthManager
    mockAuthManager = {
      initialize: jest.fn().mockResolvedValue(undefined),
      validateCredentials: jest.fn().mockResolvedValue(true),
      getGeminiCredentials: jest.fn().mockResolvedValue({
        apiKey: mockConfig.validCredentials.geminiApiKey
      }),
      getGcpCredentials: jest.fn().mockResolvedValue({
        projectId: mockConfig.validCredentials.gcpProjectId,
        keyFile: mockConfig.validCredentials.gcpKeyFile
      }),
      saveCredentials: jest.fn().mockResolvedValue(undefined),
      getConfigPath: jest.fn().mockReturnValue('/mock/config/path')
    };

    // Initialize clients with mock auth manager
    geminiClient = new GeminiClient(mockAuthManager);
    vertexClient = new VertexClient(mockAuthManager);
    realUsageClient = new RealUsageClient(mockAuthManager);
    costCalculator = new CostCalculator();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GeminiClient Integration', () => {
    it('should retrieve usage data with mock data mode', async () => {
      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z'),
        project: 'test-project',
        model: 'gemini-2.5-pro'
      };

      const usage = await geminiClient.getUsage(params);

      expect(usage).toBeDefined();
      expect(Array.isArray(usage)).toBe(true);
      expect(usage.length).toBeGreaterThan(0);
      
      // Verify usage structure
      if (usage.length > 0) {
        const firstUsage = usage[0];
        expect(firstUsage).toHaveProperty('id');
        expect(firstUsage).toHaveProperty('timestamp');
        expect(firstUsage).toHaveProperty('service', 'gemini');
        expect(firstUsage).toHaveProperty('model');
        expect(firstUsage).toHaveProperty('inputTokens');
        expect(firstUsage).toHaveProperty('outputTokens');
        expect(firstUsage).toHaveProperty('project');
        expect(firstUsage).toHaveProperty('region');
      }
    });

    it('should filter usage data by model', async () => {
      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z'),
        model: 'gemini-2.5-pro'
      };

      const usage = await geminiClient.getUsage(params);

      // All returned usage should be for the specified model
      usage.forEach(u => {
        expect(u.model).toBe('gemini-2.5-pro');
      });
    });

    it('should filter usage data by project', async () => {
      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z'),
        project: 'test-project-1'
      };

      const usage = await geminiClient.getUsage(params);

      // All returned usage should be for the specified project
      usage.forEach(u => {
        expect(u.project).toBe('test-project-1');
      });
    });
  });

  describe('VertexClient Integration', () => {
    it('should retrieve usage data with mock data mode', async () => {
      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z')
      };

      const usage = await vertexClient.getUsage(params);

      expect(usage).toBeDefined();
      expect(Array.isArray(usage)).toBe(true);
      expect(usage.length).toBeGreaterThan(0);
      
      // Verify usage structure
      if (usage.length > 0) {
        const firstUsage = usage[0];
        expect(firstUsage).toHaveProperty('service', 'vertex-ai');
        expect(firstUsage.inputTokens).toBeGreaterThan(0);
        expect(firstUsage.outputTokens).toBeGreaterThan(0);
      }
    });
  });

  describe('RealUsageClient Integration', () => {
    it.skip('should test connections successfully', async () => {
      // Skip this test as it requires actual GCP credentials
      // Mock the Google Cloud clients to return successful connections
      const connections = await realUsageClient.testConnections();

      expect(connections).toHaveProperty('logging');
      expect(connections).toHaveProperty('monitoring');
      expect(typeof connections.logging).toBe('boolean');
      expect(typeof connections.monitoring).toBe('boolean');
    });

    it.skip('should handle real data retrieval with fallback to mock', async () => {
      // Skip this test as it requires actual GCP credentials
      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z')
      };

      // Since we're using mocks, this should fall back to mock data
      const usage = await realUsageClient.getUsage(params);

      expect(Array.isArray(usage)).toBe(true);
      // Should either return real data or fallback mock data
    });
  });

  describe('End-to-End Cost Calculation Workflow', () => {
    it('should complete full workflow: fetch usage -> calculate costs -> generate report', async () => {
      // Step 1: Fetch usage data from both clients
      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z')
      };

      const [geminiUsage, vertexUsage] = await Promise.all([
        geminiClient.getUsage(params),
        vertexClient.getUsage(params)
      ]);

      // Step 2: Combine usage data
      const allUsage = [...geminiUsage, ...vertexUsage];
      expect(allUsage.length).toBeGreaterThan(0);

      // Step 3: Generate cost report
      const report = await costCalculator.generateReport(
        allUsage,
        { start: params.startDate, end: params.endDate },
        'USD'
      );

      // Verify report structure
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');

      expect(report.summary).toHaveProperty('totalInputTokens');
      expect(report.summary).toHaveProperty('totalOutputTokens');
      expect(report.summary).toHaveProperty('totalCost');
      expect(report.summary).toHaveProperty('currency', 'USD');

      expect(report.period.start).toEqual(params.startDate);
      expect(report.period.end).toEqual(params.endDate);

      expect(Array.isArray(report.details)).toBe(true);
      expect(report.details.length).toBe(allUsage.length);

      // Verify cost calculations are reasonable
      expect(report.summary.totalCost).toBeGreaterThan(0);
      expect(report.summary.totalCost).toBeLessThan(1000); // Sanity check

      // Step 4: Test currency conversion
      const reportJPY = await costCalculator.generateReport(
        allUsage,
        { start: params.startDate, end: params.endDate },
        'JPY'
      );

      expect(reportJPY.summary.currency).toBe('JPY');
      expect(reportJPY.summary.totalCost).toBeGreaterThan(report.summary.totalCost); // JPY should be larger number
    });

    it('should handle mixed service types correctly', async () => {
      // Create mixed usage data
      const mixedUsage = [
        ...mockUsageData.filter(u => u.service === 'gemini'),
        ...mockUsageData.filter(u => u.service === 'vertex-ai')
      ];

      const report = await costCalculator.generateReport(
        mixedUsage,
        { 
          start: new Date('2025-01-15T00:00:00Z'), 
          end: new Date('2025-01-15T23:59:59Z') 
        },
        'USD'
      );

      // Verify both service types are represented
      const services = new Set(report.details.map(d => d.usage.service));
      expect(services.has('gemini')).toBe(true);
      expect(services.has('vertex-ai')).toBe(true);

      // Verify breakdown calculations
      const breakdown = costCalculator.calculateModelBreakdown(mixedUsage, 'USD');
      const modelNames = Object.keys(breakdown);
      
      expect(modelNames.length).toBeGreaterThan(1);
      expect(modelNames.some(name => name.includes('gemini'))).toBe(true);
      expect(modelNames.some(name => name.includes('bison') || name.includes('vertex'))).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication failures gracefully', async () => {
      // Mock auth failure
      mockAuthManager.validateCredentials.mockResolvedValue(false);

      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z')
      };

      // Should still work with mock data
      const usage = await geminiClient.getUsage(params);
      expect(Array.isArray(usage)).toBe(true);
    });

    it('should handle network failures with fallback', async () => {
      // Mock credential retrieval failure
      mockAuthManager.getGeminiCredentials.mockRejectedValue(mockErrorResponses.networkError);

      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z')
      };

      // Should fall back to mock data
      const usage = await geminiClient.getUsage(params);
      expect(Array.isArray(usage)).toBe(true);
    });

    it('should handle invalid date ranges', async () => {
      const params = {
        startDate: new Date('2025-01-16T00:00:00Z'), // Later than end date
        endDate: new Date('2025-01-15T00:00:00Z')
      };

      await expect(geminiClient.getUsage(params)).rejects.toThrow();
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle large date ranges efficiently', async () => {
      const startTime = Date.now();
      
      const params = {
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-31T23:59:59Z') // Full month
      };

      const usage = await geminiClient.getUsage(params);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(Array.isArray(usage)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const params = {
        startDate: new Date('2025-01-15T00:00:00Z'),
        endDate: new Date('2025-01-15T23:59:59Z')
      };

      // Make multiple concurrent requests
      const promises = Array.from({ length: 5 }, () => 
        Promise.all([
          geminiClient.getUsage(params),
          vertexClient.getUsage(params)
        ])
      );

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results).toHaveLength(5);
      results.forEach(([geminiUsage, vertexUsage]) => {
        expect(Array.isArray(geminiUsage)).toBe(true);
        expect(Array.isArray(vertexUsage)).toBe(true);
      });
    });
  });
});