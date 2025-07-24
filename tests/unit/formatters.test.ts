import { TableFormatter } from '../../src/services/formatter/tableFormatter.js';
import { JSONFormatter } from '../../src/services/formatter/jsonFormatter.js';
import { CSVFormatter } from '../../src/services/formatter/csvFormatter.js';
import { ChartFormatter } from '../../src/services/formatter/chartFormatter.js';
import { CostReport } from '../../src/types/index.js';
import { createMockUsage } from '../fixtures/mockResponses.js';

describe('Formatters', () => {
  const mockReport: CostReport = {
    period: {
      start: new Date('2025-01-01T00:00:00Z'),
      end: new Date('2025-01-31T23:59:59Z'),
    },
    summary: {
      totalInputTokens: 5000,
      totalOutputTokens: 2500,
      totalCost: 3.5,
      currency: 'USD',
    },
    details: [
      {
        date: new Date('2025-01-15T10:30:00Z'),
        service: 'gemini',
        model: 'gemini-pro',
        usage: {
          id: 'usage-1',
          timestamp: new Date('2025-01-15T10:30:00Z'),
          service: 'gemini',
          model: 'gemini-pro',
          inputTokens: 2000,
          outputTokens: 1000,
          project: 'test-project',
          region: 'us-central1',
        },
        cost: {
          usageId: 'usage-1',
          inputCost: 0.25,
          outputCost: 0.375,
          totalCost: 0.625,
          currency: 'USD',
          calculatedAt: new Date('2025-01-15T10:31:00Z'),
        },
      },
      {
        date: new Date('2025-01-14T14:20:00Z'),
        service: 'vertex-ai',
        model: 'text-bison-001',
        usage: {
          id: 'usage-2',
          timestamp: new Date('2025-01-14T14:20:00Z'),
          service: 'vertex-ai',
          model: 'text-bison-001',
          inputTokens: 3000,
          outputTokens: 1500,
          project: 'test-project',
          region: 'us-central1',
        },
        cost: {
          usageId: 'usage-2',
          inputCost: 3.0,
          outputCost: 1.5,
          totalCost: 4.5,
          currency: 'USD',
          calculatedAt: new Date('2025-01-14T14:21:00Z'),
        },
      },
    ],
  };

  describe('TableFormatter', () => {
    let formatter: TableFormatter;

    beforeEach(() => {
      formatter = new TableFormatter();
    });

    it('should format report as table', () => {
      const result = formatter.format(mockReport);

      expect(result).toContain('📊 Cost Report');
      expect(result).toContain('Period: 2025-01-01 to 2025-01-31');
      expect(result).toContain('📈 Summary');
      expect(result).toContain('Total Input Tokens');
      expect(result).toContain('5,000');
      expect(result).toContain('Total Output Tokens');
      expect(result).toContain('2,500');
      expect(result).toContain('Total Cost');
      expect(result).toContain('3.5000 USD');
      expect(result).toContain('📋 Usage Details');
      expect(result).toContain('gemini-pro');
      expect(result).toContain('text-bison-001');
    });

    it('should include service breakdown when multiple services', () => {
      const result = formatter.format(mockReport);

      expect(result).toContain('🔧 Service Breakdown');
      expect(result).toContain('gemini');
      expect(result).toContain('vertex-ai');
    });

    it('should include model breakdown', () => {
      const result = formatter.format(mockReport);

      expect(result).toContain('🤖 Top Models by Cost');
      expect(result).toContain('gemini-pro');
      expect(result).toContain('text-bison-001');
    });
  });

  describe('JSONFormatter', () => {
    let formatter: JSONFormatter;

    beforeEach(() => {
      formatter = new JSONFormatter();
    });

    it('should format report as JSON', () => {
      const result = formatter.format(mockReport);
      const parsed = JSON.parse(result);

      expect(parsed.period.start).toBe('2025-01-01T00:00:00.000Z');
      expect(parsed.period.end).toBe('2025-01-31T23:59:59.000Z');
      expect(parsed.summary.totalInputTokens).toBe(5000);
      expect(parsed.summary.totalOutputTokens).toBe(2500);
      expect(parsed.summary.totalTokens).toBe(7500);
      expect(parsed.summary.totalCost).toBe(3.5);
      expect(parsed.summary.currency).toBe('USD');
      expect(parsed.details).toHaveLength(2);
    });

    it('should include metadata', () => {
      const result = formatter.format(mockReport);
      const parsed = JSON.parse(result);

      expect(parsed.metadata.recordCount).toBe(2);
      expect(parsed.metadata.services).toContain('gemini');
      expect(parsed.metadata.services).toContain('vertex-ai');
      expect(parsed.metadata.models).toContain('gemini-pro');
      expect(parsed.metadata.models).toContain('text-bison-001');
      expect(parsed.metadata.generatedAt).toBeDefined();
    });

    it('should format dates as ISO strings', () => {
      const result = formatter.format(mockReport);
      const parsed = JSON.parse(result);

      expect(parsed.details[0].date).toBe('2025-01-15T10:30:00.000Z');
      expect(parsed.details[0].usage.timestamp).toBe('2025-01-15T10:30:00.000Z');
      expect(parsed.details[0].cost.calculatedAt).toBe('2025-01-15T10:31:00.000Z');
    });
  });

  describe('CSVFormatter', () => {
    let formatter: CSVFormatter;

    beforeEach(() => {
      formatter = new CSVFormatter();
    });

    it('should format report as CSV', () => {
      const result = formatter.format(mockReport);
      const lines = result.split('\n');

      // Check header
      expect(lines[0]).toContain('Date,Service,Model,Usage ID');
      expect(lines[0]).toContain('Input Tokens,Output Tokens,Total Tokens');
      expect(lines[0]).toContain('Input Cost,Output Cost,Total Cost,Currency');

      // Check data rows
      expect(lines[1]).toContain('2025-01-15 10:30:00,gemini,gemini-pro,usage-1');
      expect(lines[1]).toContain('2000,1000,3000');
      expect(lines[1]).toContain('0.250000,0.375000,0.625000,USD');

      expect(lines[2]).toContain('2025-01-14 14:20:00,vertex-ai,text-bison-001,usage-2');
      expect(lines[2]).toContain('3000,1500,4500');
      expect(lines[2]).toContain('3.000000,1.500000,4.500000,USD');
    });

    it('should properly escape CSV values with commas', () => {
      const reportWithCommas: CostReport = {
        ...mockReport,
        details: [
          {
            ...mockReport.details[0],
            usage: {
              ...mockReport.details[0].usage,
              project: 'test-project,with-comma',
            },
          },
        ],
      };

      const result = new CSVFormatter().format(reportWithCommas);
      expect(result).toContain('"test-project,with-comma"');
    });

    it('should handle empty project and region values', () => {
      const reportWithEmptyValues: CostReport = {
        ...mockReport,
        details: [
          {
            ...mockReport.details[0],
            usage: {
              ...mockReport.details[0].usage,
              project: undefined,
              region: undefined,
            },
          },
        ],
      };

      const result = new CSVFormatter().format(reportWithEmptyValues);
      const lines = result.split('\n');
      expect(lines[1]).toContain(',,'); // Empty project and region
    });
  });

  describe('ChartFormatter', () => {
    let formatter: ChartFormatter;

    beforeEach(() => {
      formatter = new ChartFormatter();
    });

    it('should format report as chart', () => {
      const result = formatter.format(mockReport);

      expect(result).toContain('📊 Cost Report');
      expect(result).toContain('💰 Daily Cost Trend');
      expect(result).toContain('🔧 Service Cost Comparison');
      expect(result).toContain('🤖 Model Cost Comparison');
    });

    it('should handle single day data', () => {
      const singleDayReport: CostReport = {
        ...mockReport,
        details: [mockReport.details[0]]
      };

      const result = formatter.format(singleDayReport);
      expect(result).toBeDefined();
      expect(result).toContain('📊 Cost Report');
    });

    it('should handle empty data gracefully', () => {
      const emptyReport: CostReport = {
        ...mockReport,
        details: [],
        summary: {
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalCost: 0,
          currency: 'USD'
        }
      };

      const result = formatter.format(emptyReport);
      expect(result).toBeDefined();
      expect(result).toContain('📊 Cost Report - Chart View');
      expect(result).toContain('Total Cost: 0.0000 USD');
    });
  });

  describe('Error Handling', () => {
    describe('Null/Undefined Data', () => {
      it('should handle null report gracefully', () => {
        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter(),
          new ChartFormatter()
        ];

        formatters.forEach(formatter => {
          expect(() => formatter.format(null as any)).toThrow();
        });
      });

      it('should handle undefined report gracefully', () => {
        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter(),
          new ChartFormatter()
        ];

        formatters.forEach(formatter => {
          expect(() => formatter.format(undefined as any)).toThrow();
        });
      });
    });

    describe('Malformed Data', () => {
      it('should handle missing period data', () => {
        const malformedReport = {
          ...mockReport,
          period: null
        } as any;

        const formatter = new TableFormatter();
        expect(() => formatter.format(malformedReport)).toThrow();
      });

      it('should handle missing summary data', () => {
        const malformedReport = {
          ...mockReport,
          summary: null
        } as any;

        const formatter = new JSONFormatter();
        expect(() => formatter.format(malformedReport)).toThrow();
      });

      it('should handle corrupted usage details', () => {
        const malformedReport: CostReport = {
          ...mockReport,
          details: [
            {
              date: null as any,
              service: '',
              model: '',
              usage: null as any,
              cost: null as any
            }
          ]
        };

        const formatter = new CSVFormatter();
        // Should handle gracefully or throw meaningful error
        expect(() => formatter.format(malformedReport)).not.toThrow();
      });
    });

    describe('Large Dataset Handling', () => {
      it('should handle large reports efficiently', () => {
        // Create a large report with many details
        const largeUsageArray = Array.from({ length: 1000 }, (_, index) => 
          createMockUsage({ id: `large-usage-${index}` })
        );

        const largeReport: CostReport = {
          period: {
            start: new Date('2025-01-01'),
            end: new Date('2025-01-31')
          },
          summary: {
            totalInputTokens: 1000000,
            totalOutputTokens: 500000,
            totalCost: 1500.0,
            currency: 'USD'
          },
          details: largeUsageArray.map(usage => ({
            date: usage.timestamp,
            service: usage.service,
            model: usage.model,
            usage,
            cost: {
              usageId: usage.id,
              inputCost: usage.inputTokens * 0.001,
              outputCost: usage.outputTokens * 0.001,
              totalCost: (usage.inputTokens + usage.outputTokens) * 0.001,
              currency: 'USD',
              calculatedAt: new Date()
            }
          }))
        };

        const startTime = Date.now();
        
        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter()
        ];

        formatters.forEach(formatter => {
          const result = formatter.format(largeReport);
          expect(result).toBeDefined();
          expect(result.length).toBeGreaterThan(0);
        });

        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });

    describe('Special Characters and Encoding', () => {
      it('should handle special characters in model names', () => {
        const specialCharReport: CostReport = {
          ...mockReport,
          details: [{
            ...mockReport.details[0],
            model: 'gemini-pro-🤖-test',
            usage: {
              ...mockReport.details[0].usage,
              model: 'gemini-pro-🤖-test',
              project: 'test-project-with-特殊文字'
            }
          }]
        };

        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter()
        ];

        formatters.forEach(formatter => {
          const result = formatter.format(specialCharReport);
          expect(result).toBeDefined();
          expect(result).toContain('🤖');
          // TableFormatter doesn't show project name, only CSV and JSON do
          if (formatter instanceof CSVFormatter || formatter instanceof JSONFormatter) {
            expect(result).toContain('特殊文字');
          }
        });
      });

      it('should handle very long text values', () => {
        const longText = 'a'.repeat(1000);
        const longTextReport: CostReport = {
          ...mockReport,
          details: [{
            ...mockReport.details[0],
            usage: {
              ...mockReport.details[0].usage,
              project: longText
            }
          }]
        };

        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter()
        ];

        formatters.forEach(formatter => {
          expect(() => formatter.format(longTextReport)).not.toThrow();
        });
      });
    });

    describe('Currency and Numeric Handling', () => {
      it('should handle zero costs', () => {
        const zeroCostReport: CostReport = {
          ...mockReport,
          summary: {
            ...mockReport.summary,
            totalCost: 0
          },
          details: [{
            ...mockReport.details[0],
            cost: {
              ...mockReport.details[0].cost,
              inputCost: 0,
              outputCost: 0,
              totalCost: 0
            }
          }]
        };

        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter()
        ];

        formatters.forEach(formatter => {
          const result = formatter.format(zeroCostReport);
          expect(result).toContain('0');
        });
      });

      it('should handle very large costs', () => {
        const largeCostReport: CostReport = {
          ...mockReport,
          summary: {
            ...mockReport.summary,
            totalCost: 999999.99
          },
          details: [
            {
              ...mockReport.details[0],
              cost: {
                ...mockReport.details[0].cost,
                totalCost: 500000.00
              }
            },
            {
              ...mockReport.details[1],
              cost: {
                ...mockReport.details[1].cost,
                totalCost: 499999.99
              }
            }
          ]
        };

        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter()
        ];

        formatters.forEach(formatter => {
          const result = formatter.format(largeCostReport);
          // TableFormatter and JSONFormatter show summary total, CSV shows individual records
          if (formatter instanceof CSVFormatter) {
            expect(result).toContain('499999.99');
          } else {
            expect(result).toContain('999999');
          }
        });
      });

      it('should handle different currencies', () => {
        const jpyReport: CostReport = {
          ...mockReport,
          summary: {
            ...mockReport.summary,
            currency: 'JPY',
            totalCost: 525.0
          },
          details: mockReport.details.map(detail => ({
            ...detail,
            cost: {
              ...detail.cost,
              currency: 'JPY'
            }
          }))
        };

        const formatters = [
          new TableFormatter(),
          new JSONFormatter(),
          new CSVFormatter()
        ];

        formatters.forEach(formatter => {
          const result = formatter.format(jpyReport);
          expect(result).toContain('JPY');
        });
      });
    });
  });
});