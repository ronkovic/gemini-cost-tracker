import { Formatter, CostReport } from '../../types/index.js';

export class JSONFormatter implements Formatter {
  format(data: CostReport): string {
    const formattedData = {
      period: {
        start: data.period.start.toISOString(),
        end: data.period.end.toISOString(),
      },
      summary: {
        totalInputTokens: data.summary.totalInputTokens,
        totalOutputTokens: data.summary.totalOutputTokens,
        totalTokens: data.summary.totalInputTokens + data.summary.totalOutputTokens,
        totalCost: data.summary.totalCost,
        currency: data.summary.currency,
      },
      details: data.details.map((detail) => ({
        date: detail.date.toISOString(),
        service: detail.service,
        model: detail.model,
        usage: {
          id: detail.usage.id,
          timestamp: detail.usage.timestamp.toISOString(),
          inputTokens: detail.usage.inputTokens,
          outputTokens: detail.usage.outputTokens,
          totalTokens: detail.usage.inputTokens + detail.usage.outputTokens,
          project: detail.usage.project,
          region: detail.usage.region,
        },
        cost: {
          inputCost: detail.cost.inputCost,
          outputCost: detail.cost.outputCost,
          totalCost: detail.cost.totalCost,
          currency: detail.cost.currency,
          calculatedAt: detail.cost.calculatedAt.toISOString(),
        },
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        recordCount: data.details.length,
        services: this.getUniqueServices(data),
        models: this.getUniqueModels(data),
      },
    };

    return JSON.stringify(formattedData, null, 2);
  }

  private getUniqueServices(data: CostReport): string[] {
    const services = new Set(data.details.map((detail) => detail.service));
    return Array.from(services).sort();
  }

  private getUniqueModels(data: CostReport): string[] {
    const models = new Set(data.details.map((detail) => detail.model));
    return Array.from(models).sort();
  }
}
