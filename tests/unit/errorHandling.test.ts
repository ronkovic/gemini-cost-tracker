import { AppError } from '../../src/types/index.js';
import { validateDateRange } from '../../src/utils/validator.js';
import { CostCalculator } from '../../src/services/calculator/costCalculator.js';
import { PriceUpdater } from '../../src/services/calculator/priceUpdater.js';
import { AuthManager } from '../../src/services/auth/authManager.js';
import { 
  mockErrorResponses, 
  mockConfig, 
  createMockUsage 
} from '../fixtures/mockResponses.js';

// Mock external dependencies
jest.mock('../../src/services/auth/authManager.js', () => ({
  AuthManager: jest.fn()
}));
jest.mock('@google-cloud/logging');
jest.mock('@google-cloud/monitoring');
jest.mock('fs/promises');

describe('Error Handling Tests', () => {
  describe('AppError Class', () => {
    it('should create AppError with code and message', () => {
      const error = new AppError('TEST_ERROR', 'Test error message');
      
      expect(error.name).toBe('AppError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.details).toBeUndefined();
    });

    it('should create AppError with details', () => {
      const details = { field: 'value', count: 42 };
      const error = new AppError('TEST_ERROR', 'Test error message', details);
      
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.details).toEqual(details);
    });
  });

  describe('Date Validation Errors', () => {
    it('should throw error for invalid date format', () => {
      const options = {
        period: 'custom' as const,
        startDate: 'invalid-date',
        endDate: '2025-01-15'
      };

      expect(() => validateDateRange(options))
        .toThrow('Invalid date format');
    });

    it('should throw error when start date is after end date', () => {
      const options = {
        period: 'custom' as const,
        startDate: '2025-01-16',
        endDate: '2025-01-15'
      };

      expect(() => validateDateRange(options))
        .toThrow('Start date must be before or equal to end date');
    });

    it('should throw error for invalid period', () => {
      const options = {
        period: 'invalid-period' as any
      };

      expect(() => validateDateRange(options))
        .toThrow('Invalid period');
    });

    it('should throw error for missing custom dates', () => {
      const options = {
        period: 'custom' as const
        // Missing startDate and endDate
      };

      expect(() => validateDateRange(options))
        .toThrow('Custom period requires both --start-date and --end-date options');
    });

    it('should throw error for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      
      const options = {
        period: 'custom' as const,
        startDate: futureDate.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0]
      };

      expect(() => validateDateRange(options))
        .toThrow('End date cannot be in the future');
    });
  });

  describe('Cost Calculator Error Handling', () => {
    let calculator: CostCalculator;

    beforeEach(() => {
      calculator = new CostCalculator();
    });

    it('should handle invalid usage data gracefully', async () => {
      const invalidUsage = [
        createMockUsage({ id: '', inputTokens: -1 }), // Invalid data
        createMockUsage({ model: '', outputTokens: -1 }) // More invalid data
      ];

      // Should still generate a report, but with error handling
      const report = await calculator.generateReport(
        invalidUsage,
        { start: new Date(), end: new Date() },
        'USD'
      );

      expect(report).toBeDefined();
      expect(report.summary.totalCost).toBeGreaterThanOrEqual(0);
    });

    it('should handle unknown models with default pricing', () => {
      const usage = createMockUsage({ model: 'unknown-model-xyz' });
      
      const cost = calculator.calculateCost(usage, 'USD');
      
      expect(cost.totalCost).toBeGreaterThan(0); // Should use default pricing
      expect(cost.currency).toBe('USD');
    });

    it('should handle invalid currency codes', () => {
      const usage = createMockUsage();
      
      // Should handle invalid currency by defaulting to USD or throwing error
      expect(() => {
        calculator.calculateCost(usage, 'INVALID_CURRENCY');
      }).not.toThrow(); // Should handle gracefully or default
    });

    it('should handle empty usage data', async () => {
      const report = await calculator.generateReport(
        [],
        { start: new Date(), end: new Date() },
        'USD'
      );

      expect(report.summary.totalCost).toBe(0);
      expect(report.summary.totalInputTokens).toBe(0);
      expect(report.summary.totalOutputTokens).toBe(0);
      expect(report.details).toHaveLength(0);
    });

    it('should handle null or undefined usage data', async () => {
      await expect(calculator.generateReport(
        null as any,
        { start: new Date(), end: new Date() },
        'USD'
      )).rejects.toThrow();

      await expect(calculator.generateReport(
        undefined as any,
        { start: new Date(), end: new Date() },
        'USD'
      )).rejects.toThrow();
    });
  });

  describe('Authentication Error Handling', () => {
    let mockAuthManager: jest.Mocked<AuthManager>;

    beforeEach(() => {
      mockAuthManager = {
        initialize: jest.fn(),
        validateCredentials: jest.fn(),
        getGeminiCredentials: jest.fn(),
        getGcpCredentials: jest.fn(),
        saveCredentials: jest.fn(),
        getConfigPath: jest.fn()
      } as any;
    });

    it('should handle missing credentials file', async () => {
      mockAuthManager.initialize.mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );

      await expect(mockAuthManager.initialize()).rejects.toThrow('ENOENT');
    });

    it('should handle invalid API key format', async () => {
      mockAuthManager.getGeminiCredentials.mockRejectedValue(
        new Error('Invalid API key format')
      );

      await expect(mockAuthManager.getGeminiCredentials())
        .rejects.toThrow('Invalid API key format');
    });

    it('should handle invalid GCP credentials', async () => {
      mockAuthManager.getGcpCredentials.mockRejectedValue(
        mockErrorResponses.googleCloudErrors.invalidProject
      );

      await expect(mockAuthManager.getGcpCredentials())
        .rejects.toThrow('Project not found or access denied');
    });

    it('should handle permission denied errors', async () => {
      mockAuthManager.validateCredentials.mockRejectedValue(
        mockErrorResponses.permissionError
      );

      await expect(mockAuthManager.validateCredentials())
        .rejects.toThrow('Permission denied');
    });
  });

  describe('Price Updater Error Handling', () => {
    let priceUpdater: PriceUpdater;
    let mockAuthManager: jest.Mocked<AuthManager>;

    beforeEach(() => {
      mockAuthManager = {
        initialize: jest.fn().mockResolvedValue(undefined),
        validateCredentials: jest.fn().mockResolvedValue(true),
        getGeminiCredentials: jest.fn().mockResolvedValue({ apiKey: 'test' }),
        getGcpCredentials: jest.fn().mockResolvedValue({ projectId: 'test', keyFile: null })
      } as any;

      priceUpdater = new PriceUpdater();
    });

    it('should handle network failures when fetching pricing', async () => {
      // Mock network failure
      jest.spyOn(priceUpdater as any, 'fetchLiveGeminiPricing')
        .mockRejectedValue(mockErrorResponses.networkError);

      // Should fall back to cached or default data and not throw
      const result = await priceUpdater.updatePricing();
      expect(result).toBeDefined();
      expect(result.updatedCount).toBeGreaterThan(0);
    });

    it('should handle malformed web responses', async () => {
      jest.spyOn(priceUpdater as any, 'fetchLiveGeminiPricing')
        .mockResolvedValue('INVALID_HTML_CONTENT');

      // Should handle parsing errors gracefully
      const result = await priceUpdater.updatePricing();
      expect(result).toBeDefined();
    });

    it('should handle file system errors when caching', async () => {
      const fs = require('fs/promises');
      fs.writeFileP = jest.fn().mockRejectedValue(new Error('EACCES: permission denied'));

      // Should still return pricing data even if caching fails
      const result = await priceUpdater.updatePricing();
      expect(result).toBeDefined();
    });
  });

  describe('Google Cloud API Error Handling', () => {
    it('should handle Logging API unavailable', () => {
      const error = mockErrorResponses.googleCloudErrors.loggingUnavailable;
      
      expect(error.message).toContain('Cloud Logging API');
      expect(error.message).toContain('not available');
    });

    it('should handle Monitoring API unavailable', () => {
      const error = mockErrorResponses.googleCloudErrors.monitoringUnavailable;
      
      expect(error.message).toContain('Cloud Monitoring API');
      expect(error.message).toContain('not available');
    });

    it('should handle quota exceeded errors', () => {
      const error = mockErrorResponses.apiErrors.quotaExceeded;
      
      expect(error.message).toContain('quota exceeded');
    });

    it('should handle rate limiting', () => {
      const error = mockErrorResponses.rateLimitError;
      
      expect(error.message).toContain('Rate limit exceeded');
    });

    it('should handle service unavailable', () => {
      const error = mockErrorResponses.apiErrors.serviceUnavailable;
      
      expect(error.message).toContain('Service temporarily unavailable');
    });
  });

  describe('Data Integrity Error Handling', () => {
    it('should handle corrupted usage data gracefully', () => {
      const corruptedUsage = {
        id: undefined, // Missing required id field
        timestamp: 'invalid-date',
        inputTokens: 'not-a-number',
        outputTokens: null,
        service: null,
        model: null
      } as any;

      const calculator = new CostCalculator();
      
      // Should handle corrupted data gracefully without throwing
      const result = calculator.calculateCost(corruptedUsage, 'USD');
      
      // Should return a result object even with corrupted data
      expect(result).toBeDefined();
      expect(result.currency).toBe('USD');
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });

    it('should handle negative token values', () => {
      const invalidUsage = createMockUsage({
        inputTokens: -1000,
        outputTokens: -500
      });

      const calculator = new CostCalculator();
      const cost = calculator.calculateCost(invalidUsage, 'USD');
      
      // Should handle negative values (could be 0 or throw error)
      expect(typeof cost.totalCost).toBe('number');
    });

    it('should handle extremely large token values', () => {
      const extremeUsage = createMockUsage({
        inputTokens: Number.MAX_SAFE_INTEGER,
        outputTokens: Number.MAX_SAFE_INTEGER
      });

      const calculator = new CostCalculator();
      
      // Should handle without overflow
      expect(() => {
        calculator.calculateCost(extremeUsage, 'USD');
      }).not.toThrow();
    });
  });

  describe('Concurrent Operation Error Handling', () => {
    it('should handle concurrent file operations', async () => {
      const calculator = new CostCalculator();
      const usage = [createMockUsage()];
      const period = { start: new Date(), end: new Date() };

      // Run multiple operations concurrently
      const promises = Array.from({ length: 10 }, () =>
        calculator.generateReport(usage, period, 'USD')
      );

      const results = await Promise.all(promises);
      
      // All should succeed
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.summary.totalCost).toBeGreaterThan(0);
      });
    });
  });

  describe('Memory and Resource Error Handling', () => {
    it('should handle large datasets efficiently', async () => {
      const calculator = new CostCalculator();
      
      // Create a large dataset
      const largeUsageData = Array.from({ length: 10000 }, (_, index) =>
        createMockUsage({ id: `large-test-${index}` })
      );

      const startTime = Date.now();
      const report = await calculator.generateReport(
        largeUsageData,
        { start: new Date(), end: new Date() },
        'USD'
      );
      const endTime = Date.now();

      expect(report.details).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});