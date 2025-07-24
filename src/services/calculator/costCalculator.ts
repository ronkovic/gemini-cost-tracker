import { Usage, Cost, CostReport, AppError, ErrorCode } from '../../types/index.js';
import { getPriceModel, convertPrice } from './priceTable.js';
import { logger } from '../../utils/logger.js';

export class CostCalculator {
  calculateCost(usage: Usage, targetCurrency: string = 'USD'): Cost {
    try {
      const priceModel = getPriceModel(usage.model);

      // Calculate costs in original currency (USD)
      const inputCostUSD = (usage.inputTokens / 1000) * priceModel.inputTokenPrice;
      const outputCostUSD = (usage.outputTokens / 1000) * priceModel.outputTokenPrice;
      const totalCostUSD = inputCostUSD + outputCostUSD;

      // Convert to target currency if needed
      const inputCost = convertPrice(inputCostUSD, 'USD', targetCurrency);
      const outputCost = convertPrice(outputCostUSD, 'USD', targetCurrency);
      const totalCost = convertPrice(totalCostUSD, 'USD', targetCurrency);

      return {
        usageId: usage.id,
        inputCost,
        outputCost,
        totalCost,
        currency: targetCurrency,
        calculatedAt: new Date(),
      };
    } catch (error) {
      throw new AppError(
        ErrorCode.COST_CALCULATION_ERROR,
        `Failed to calculate cost for usage ${usage.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateReport(
    usageData: Usage[],
    period: { start: Date; end: Date },
    currency: string = 'USD'
  ): Promise<CostReport> {
    try {
      logger.info(`Generating cost report for ${usageData.length} usage records`);

      const details: CostReport['details'] = [];
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let totalCost = 0;

      for (const usage of usageData) {
        const cost = this.calculateCost(usage, currency);

        details.push({
          date: usage.timestamp,
          service: usage.service,
          model: usage.model,
          usage,
          cost,
        });

        totalInputTokens += usage.inputTokens;
        totalOutputTokens += usage.outputTokens;
        totalCost += cost.totalCost;
      }

      // Sort details by date (newest first)
      details.sort((a, b) => b.date.getTime() - a.date.getTime());

      const report: CostReport = {
        period: {
          start: period.start,
          end: period.end,
        },
        summary: {
          totalInputTokens,
          totalOutputTokens,
          totalCost,
          currency,
        },
        details,
      };

      logger.info(`Generated report with total cost: ${totalCost.toFixed(4)} ${currency}`);
      return report;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorCode.REPORT_GENERATION_ERROR,
        `Failed to generate cost report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  calculateDailyBreakdown(
    usageData: Usage[],
    currency: string = 'USD'
  ): Record<
    string,
    {
      inputTokens: number;
      outputTokens: number;
      totalCost: number;
      services: Record<string, number>;
    }
  > {
    const breakdown: Record<
      string,
      {
        inputTokens: number;
        outputTokens: number;
        totalCost: number;
        services: Record<string, number>;
      }
    > = {};

    for (const usage of usageData) {
      const dateKey = usage.timestamp.toISOString().split('T')[0];
      const cost = this.calculateCost(usage, currency);

      if (!breakdown[dateKey]) {
        breakdown[dateKey] = {
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0,
          services: {},
        };
      }

      breakdown[dateKey].inputTokens += usage.inputTokens;
      breakdown[dateKey].outputTokens += usage.outputTokens;
      breakdown[dateKey].totalCost += cost.totalCost;
      breakdown[dateKey].services[usage.service] =
        (breakdown[dateKey].services[usage.service] || 0) + cost.totalCost;
    }

    return breakdown;
  }

  calculateModelBreakdown(
    usageData: Usage[],
    currency: string = 'USD'
  ): Record<
    string,
    {
      inputTokens: number;
      outputTokens: number;
      totalCost: number;
      usageCount: number;
    }
  > {
    const breakdown: Record<
      string,
      {
        inputTokens: number;
        outputTokens: number;
        totalCost: number;
        usageCount: number;
      }
    > = {};

    for (const usage of usageData) {
      const cost = this.calculateCost(usage, currency);

      if (!breakdown[usage.model]) {
        breakdown[usage.model] = {
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0,
          usageCount: 0,
        };
      }

      breakdown[usage.model].inputTokens += usage.inputTokens;
      breakdown[usage.model].outputTokens += usage.outputTokens;
      breakdown[usage.model].totalCost += cost.totalCost;
      breakdown[usage.model].usageCount += 1;
    }

    return breakdown;
  }

  getTopExpensiveUsage(
    usageData: Usage[],
    limit: number = 10,
    currency: string = 'USD'
  ): Array<{
    usage: Usage;
    cost: Cost;
  }> {
    const withCosts = usageData.map((usage) => ({
      usage,
      cost: this.calculateCost(usage, currency),
    }));

    return withCosts.sort((a, b) => b.cost.totalCost - a.cost.totalCost).slice(0, limit);
  }
}
