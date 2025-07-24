import Table from 'cli-table3';
import chalk from 'chalk';
import { Formatter, CostReport } from '../../types/index.js';
import { formatDate } from '../../utils/dateHelper.js';

export class TableFormatter implements Formatter {
  format(data: CostReport): string {
    let output = '';

    // Header with period information
    output += chalk.bold.blue('📊 Cost Report\n');
    output += chalk.gray(
      `Period: ${formatDate(data.period.start)} to ${formatDate(data.period.end)}\n\n`
    );

    // Summary table
    const summaryTable = new Table({
      head: [chalk.cyan('Metric'), chalk.cyan('Value')],
      style: {
        head: [],
        border: [],
      },
    });

    summaryTable.push(
      ['Total Input Tokens', data.summary.totalInputTokens.toLocaleString()],
      ['Total Output Tokens', data.summary.totalOutputTokens.toLocaleString()],
      [
        'Total Tokens',
        (data.summary.totalInputTokens + data.summary.totalOutputTokens).toLocaleString(),
      ],
      ['Total Cost', `${data.summary.totalCost.toFixed(4)} ${data.summary.currency}`]
    );

    output += chalk.bold('📈 Summary\n');
    output += summaryTable.toString() + '\n\n';

    // Detailed usage table
    if (data.details.length > 0) {
      const detailsTable = new Table({
        head: [
          chalk.cyan('Date'),
          chalk.cyan('Service'),
          chalk.cyan('Model'),
          chalk.cyan('Input Tokens'),
          chalk.cyan('Output Tokens'),
          chalk.cyan('Cost'),
        ],
        style: {
          head: [],
          border: [],
        },
        colWidths: [12, 12, 20, 15, 15, 12],
      });

      // Show up to 20 most recent entries (sorted by date descending)
      const sortedDetails = [...data.details].sort((a, b) => b.date.getTime() - a.date.getTime());
      const recentDetails = sortedDetails.slice(0, 20);

      for (const detail of recentDetails) {
        const serviceColor = detail.service === 'gemini' ? chalk.green : chalk.blue;
        const costFormatted = `${detail.cost.totalCost.toFixed(4)} ${detail.cost.currency}`;

        detailsTable.push([
          formatDate(detail.date),
          serviceColor(detail.service),
          chalk.yellow(detail.model),
          detail.usage.inputTokens.toLocaleString(),
          detail.usage.outputTokens.toLocaleString(),
          chalk.bold(costFormatted),
        ]);
      }

      output += chalk.bold('📋 Usage Details');
      if (data.details.length > 20) {
        output += chalk.gray(` (showing latest 20 of ${data.details.length})`);
      }
      output += '\n';
      output += detailsTable.toString() + '\n\n';
    }

    // Service breakdown
    const serviceBreakdown = this.calculateServiceBreakdown(data);
    if (Object.keys(serviceBreakdown).length > 1) {
      const serviceTable = new Table({
        head: [chalk.cyan('Service'), chalk.cyan('Usage Count'), chalk.cyan('Total Cost')],
        style: {
          head: [],
          border: [],
        },
      });

      for (const [service, stats] of Object.entries(serviceBreakdown)) {
        const serviceColor = service === 'gemini' ? chalk.green : chalk.blue;
        serviceTable.push([
          serviceColor(service),
          stats.count.toString(),
          `${stats.totalCost.toFixed(4)} ${data.summary.currency}`,
        ]);
      }

      output += chalk.bold('🔧 Service Breakdown\n');
      output += serviceTable.toString() + '\n\n';
    }

    // Model breakdown (top 5)
    const modelBreakdown = this.calculateModelBreakdown(data);
    const topModels = Object.entries(modelBreakdown)
      .sort(([, a], [, b]) => b.totalCost - a.totalCost)
      .slice(0, 5);

    if (topModels.length > 0) {
      const modelTable = new Table({
        head: [chalk.cyan('Model'), chalk.cyan('Usage Count'), chalk.cyan('Total Cost')],
        style: {
          head: [],
          border: [],
        },
      });

      for (const [model, stats] of topModels) {
        modelTable.push([
          chalk.yellow(model),
          stats.count.toString(),
          `${stats.totalCost.toFixed(4)} ${data.summary.currency}`,
        ]);
      }

      output += chalk.bold('🤖 Top Models by Cost\n');
      output += modelTable.toString() + '\n';
    }

    return output;
  }

  private calculateServiceBreakdown(
    data: CostReport
  ): Record<string, { count: number; totalCost: number }> {
    const breakdown: Record<string, { count: number; totalCost: number }> = {};

    for (const detail of data.details) {
      if (!breakdown[detail.service]) {
        breakdown[detail.service] = { count: 0, totalCost: 0 };
      }
      breakdown[detail.service].count += 1;
      breakdown[detail.service].totalCost += detail.cost.totalCost;
    }

    return breakdown;
  }

  private calculateModelBreakdown(
    data: CostReport
  ): Record<string, { count: number; totalCost: number }> {
    const breakdown: Record<string, { count: number; totalCost: number }> = {};

    for (const detail of data.details) {
      if (!breakdown[detail.model]) {
        breakdown[detail.model] = { count: 0, totalCost: 0 };
      }
      breakdown[detail.model].count += 1;
      breakdown[detail.model].totalCost += detail.cost.totalCost;
    }

    return breakdown;
  }
}
