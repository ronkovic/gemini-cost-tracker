import { CostCalculator } from '../../src/services/calculator/costCalculator.js';
import { Usage } from '../../src/types/index.js';

describe('CostCalculator', () => {
  let calculator: CostCalculator;

  beforeEach(() => {
    calculator = new CostCalculator();
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for Gemini Pro model in USD', () => {
      const usage: Usage = {
        id: 'test-1',
        timestamp: new Date(),
        service: 'gemini',
        model: 'gemini-pro',
        inputTokens: 1000,
        outputTokens: 500,
        project: 'test-project',
        region: 'us-central1',
      };

      const cost = calculator.calculateCost(usage, 'USD');

      expect(cost.usageId).toBe('test-1');
      expect(cost.currency).toBe('USD');
      expect(cost.inputCost).toBe(0.000125); // (1000 tokens / 1000) * 0.000125
      expect(cost.outputCost).toBe(0.0001875); // (500 tokens / 1000) * 0.000375
      expect(cost.totalCost).toBe(0.0003125);
    });

    it('should calculate cost correctly for Vertex AI model in USD', () => {
      const usage: Usage = {
        id: 'test-2',
        timestamp: new Date(),
        service: 'vertex-ai',
        model: 'text-bison-001',
        inputTokens: 2000,
        outputTokens: 1000,
        project: 'test-project',
        region: 'us-central1',
      };

      const cost = calculator.calculateCost(usage, 'USD');

      expect(cost.usageId).toBe('test-2');
      expect(cost.currency).toBe('USD');
      expect(cost.inputCost).toBe(0.002); // (2000 tokens / 1000) * 0.001
      expect(cost.outputCost).toBe(0.001); // (1000 tokens / 1000) * 0.001
      expect(cost.totalCost).toBe(0.003);
    });

    it('should convert currency correctly', () => {
      const usage: Usage = {
        id: 'test-3',
        timestamp: new Date(),
        service: 'gemini',
        model: 'gemini-pro',
        inputTokens: 1000,
        outputTokens: 500,
        project: 'test-project',
        region: 'us-central1',
      };

      const cost = calculator.calculateCost(usage, 'JPY');

      expect(cost.currency).toBe('JPY');
      expect(cost.totalCost).toBe(0.0003125 * 150); // USD to JPY conversion
    });

    it('should handle unknown models with default pricing', () => {
      const usage: Usage = {
        id: 'test-4',
        timestamp: new Date(),
        service: 'gemini',
        model: 'unknown-model',
        inputTokens: 1000,
        outputTokens: 1000,
        project: 'test-project',
        region: 'us-central1',
      };

      const cost = calculator.calculateCost(usage, 'USD');

      expect(cost.totalCost).toBe(0.002); // Default 0.001 per token (1000+1000 tokens / 1000) * 0.001
    });
  });

  describe('generateReport', () => {
    it('should generate a complete report', async () => {
      const usageData: Usage[] = [
        {
          id: 'test-1',
          timestamp: new Date('2025-01-01'),
          service: 'gemini',
          model: 'gemini-pro',
          inputTokens: 1000,
          outputTokens: 500,
          project: 'test-project',
          region: 'us-central1',
        },
        {
          id: 'test-2',
          timestamp: new Date('2025-01-02'),
          service: 'vertex-ai',
          model: 'text-bison-001',
          inputTokens: 2000,
          outputTokens: 1000,
          project: 'test-project',
          region: 'us-central1',
        },
      ];

      const period = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-02'),
      };

      const report = await calculator.generateReport(usageData, period, 'USD');

      expect(report.summary.totalInputTokens).toBe(3000);
      expect(report.summary.totalOutputTokens).toBe(1500);
      expect(report.summary.totalCost).toBe(0.0033125); // 0.0003125 + 0.003
      expect(report.summary.currency).toBe('USD');
      expect(report.details).toHaveLength(2);
      expect(report.period.start).toEqual(period.start);
      expect(report.period.end).toEqual(period.end);
    });

    it('should sort details by date (newest first)', async () => {
      const usageData: Usage[] = [
        {
          id: 'test-1',
          timestamp: new Date('2025-01-01'),
          service: 'gemini',
          model: 'gemini-pro',
          inputTokens: 1000,
          outputTokens: 500,
        } as Usage,
        {
          id: 'test-2',
          timestamp: new Date('2025-01-03'),
          service: 'vertex-ai',
          model: 'text-bison-001',
          inputTokens: 2000,
          outputTokens: 1000,
        } as Usage,
        {
          id: 'test-3',
          timestamp: new Date('2025-01-02'),
          service: 'gemini',
          model: 'gemini-pro',
          inputTokens: 1500,
          outputTokens: 750,
        } as Usage,
      ];

      const period = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-03'),
      };

      const report = await calculator.generateReport(usageData, period, 'USD');

      expect(report.details[0].usage.id).toBe('test-2'); // 2025-01-03
      expect(report.details[1].usage.id).toBe('test-3'); // 2025-01-02
      expect(report.details[2].usage.id).toBe('test-1'); // 2025-01-01
    });
  });

  describe('calculateModelBreakdown', () => {
    it('should calculate model breakdown correctly', () => {
      const usageData: Usage[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          service: 'gemini',
          model: 'gemini-pro',
          inputTokens: 1000,
          outputTokens: 500,
        } as Usage,
        {
          id: 'test-2',
          timestamp: new Date(),
          service: 'gemini',
          model: 'gemini-pro',
          inputTokens: 2000,
          outputTokens: 1000,
        } as Usage,
        {
          id: 'test-3',
          timestamp: new Date(),
          service: 'vertex-ai',
          model: 'text-bison-001',
          inputTokens: 1000,
          outputTokens: 1000,
        } as Usage,
      ];

      const breakdown = calculator.calculateModelBreakdown(usageData, 'USD');

      expect(breakdown['gemini-pro'].inputTokens).toBe(3000);
      expect(breakdown['gemini-pro'].outputTokens).toBe(1500);
      expect(breakdown['gemini-pro'].usageCount).toBe(2);
      expect(breakdown['gemini-pro'].totalCost).toBe(0.0009375); // (3000/1000 * 0.000125) + (1500/1000 * 0.000375)

      expect(breakdown['text-bison-001'].inputTokens).toBe(1000);
      expect(breakdown['text-bison-001'].outputTokens).toBe(1000);
      expect(breakdown['text-bison-001'].usageCount).toBe(1);
      expect(breakdown['text-bison-001'].totalCost).toBe(0.002); // (1000/1000 * 0.001) + (1000/1000 * 0.001)
    });
  });
});