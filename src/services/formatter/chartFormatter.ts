import chalk from 'chalk';
import { Formatter, CostReport } from '../../types/index.js';
import { formatDate } from '../../utils/dateHelper.js';

export class ChartFormatter implements Formatter {
  format(data: CostReport): string {
    let output = '';

    // Header
    output += chalk.bold.blue('📊 Cost Report - Chart View\n');
    output += chalk.gray(
      `Period: ${formatDate(data.period.start)} to ${formatDate(data.period.end)}\n\n`
    );

    // Daily cost chart
    const dailyCosts = this.calculateDailyCosts(data);
    if (Object.keys(dailyCosts).length > 1) {
      output += this.renderDailyCostChart(dailyCosts, data.summary.currency);
      output += '\n\n';
    }

    // Service comparison chart
    const serviceBreakdown = this.calculateServiceBreakdown(data);
    if (Object.keys(serviceBreakdown).length > 1) {
      output += this.renderServiceChart(serviceBreakdown, data.summary.currency);
      output += '\n\n';
    }

    // Model comparison chart
    const modelBreakdown = this.calculateModelBreakdown(data);
    if (Object.keys(modelBreakdown).length > 1) {
      output += this.renderModelChart(modelBreakdown, data.summary.currency);
      output += '\n\n';
    }

    // Token usage trend
    const dailyTokens = this.calculateDailyTokens(data);
    if (Object.keys(dailyTokens).length > 1) {
      output += this.renderTokenTrendChart(dailyTokens);
      output += '\n\n';
    }

    // Summary
    output += chalk.bold.green('📈 Summary:\n');
    output += `Total Cost: ${chalk.bold(data.summary.totalCost.toFixed(4))} ${data.summary.currency}\n`;
    output += `Total Tokens: ${chalk.bold((data.summary.totalInputTokens + data.summary.totalOutputTokens).toLocaleString())}\n`;
    output += `Average Cost per 1K Tokens: ${chalk.bold((data.summary.totalCost / ((data.summary.totalInputTokens + data.summary.totalOutputTokens) / 1000)).toFixed(6))} ${data.summary.currency}\n`;

    return output;
  }

  private calculateDailyCosts(data: CostReport): Record<string, number> {
    const dailyCosts: Record<string, number> = {};

    for (const detail of data.details) {
      const dateKey = formatDate(detail.date);
      if (!dailyCosts[dateKey]) {
        dailyCosts[dateKey] = 0;
      }
      dailyCosts[dateKey] += detail.cost.totalCost;
    }

    return dailyCosts;
  }

  private calculateServiceBreakdown(data: CostReport): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const detail of data.details) {
      if (!breakdown[detail.service]) {
        breakdown[detail.service] = 0;
      }
      breakdown[detail.service] += detail.cost.totalCost;
    }

    return breakdown;
  }

  private calculateModelBreakdown(data: CostReport): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const detail of data.details) {
      if (!breakdown[detail.model]) {
        breakdown[detail.model] = 0;
      }
      breakdown[detail.model] += detail.cost.totalCost;
    }

    return breakdown;
  }

  private calculateDailyTokens(
    data: CostReport
  ): Record<string, { input: number; output: number }> {
    const dailyTokens: Record<string, { input: number; output: number }> = {};

    for (const detail of data.details) {
      const dateKey = formatDate(detail.date);
      if (!dailyTokens[dateKey]) {
        dailyTokens[dateKey] = { input: 0, output: 0 };
      }
      dailyTokens[dateKey].input += detail.usage.inputTokens;
      dailyTokens[dateKey].output += detail.usage.outputTokens;
    }

    return dailyTokens;
  }

  private renderDailyCostChart(dailyCosts: Record<string, number>, currency: string): string {
    let output = chalk.bold('💰 Daily Cost Trend\n');

    const dates = Object.keys(dailyCosts).sort();
    const maxCost = Math.max(...Object.values(dailyCosts));
    const maxBarLength = 50;

    for (const date of dates) {
      const cost = dailyCosts[date];
      const barLength = Math.round((cost / maxCost) * maxBarLength);
      const bar = '█'.repeat(barLength);
      const spaces = ' '.repeat(Math.max(0, maxBarLength - barLength));

      output += `${date} │${chalk.blue(bar)}${spaces}│ ${cost.toFixed(4)} ${currency}\n`;
    }

    return output;
  }

  private renderServiceChart(serviceBreakdown: Record<string, number>, currency: string): string {
    let output = chalk.bold('🔧 Service Cost Comparison\n');

    const services = Object.entries(serviceBreakdown).sort(([, a], [, b]) => b - a);
    const maxCost = Math.max(...Object.values(serviceBreakdown));
    const maxBarLength = 40;

    for (const [service, cost] of services) {
      const barLength = Math.round((cost / maxCost) * maxBarLength);
      const serviceColor = service === 'gemini' ? chalk.green : chalk.blue;
      const bar = '█'.repeat(barLength);
      const spaces = ' '.repeat(Math.max(0, maxBarLength - barLength));

      output += `${serviceColor(service.padEnd(10))} │${chalk.yellow(bar)}${spaces}│ ${cost.toFixed(4)} ${currency}\n`;
    }

    return output;
  }

  private renderModelChart(modelBreakdown: Record<string, number>, currency: string): string {
    let output = chalk.bold('🤖 Model Cost Comparison\n');

    const models = Object.entries(modelBreakdown).sort(([, a], [, b]) => b - a);
    const maxCost = Math.max(...Object.values(modelBreakdown));
    const maxBarLength = 35;

    for (const [model, cost] of models) {
      const barLength = Math.round((cost / maxCost) * maxBarLength);
      const bar = '█'.repeat(barLength);
      const spaces = ' '.repeat(Math.max(0, maxBarLength - barLength));

      output += `${chalk.cyan(model.padEnd(18))} │${chalk.magenta(bar)}${spaces}│ ${cost.toFixed(4)} ${currency}\n`;
    }

    return output;
  }

  private renderTokenTrendChart(
    dailyTokens: Record<string, { input: number; output: number }>
  ): string {
    let output = chalk.bold('📊 Daily Token Usage Trend\n');

    const dates = Object.keys(dailyTokens).sort();
    const maxTokens = Math.max(
      ...dates.map((date) => dailyTokens[date].input + dailyTokens[date].output)
    );
    const maxBarLength = 45;

    for (const date of dates) {
      const tokens = dailyTokens[date];
      const totalTokens = tokens.input + tokens.output;
      const inputRatio = tokens.input / totalTokens;
      // const outputRatio = tokens.output / totalTokens;

      const totalBarLength = Math.round((totalTokens / maxTokens) * maxBarLength);
      const inputBarLength = Math.round(totalBarLength * inputRatio);
      const outputBarLength = totalBarLength - inputBarLength;

      const inputBar = '█'.repeat(inputBarLength);
      const outputBar = '█'.repeat(outputBarLength);
      const spaces = ' '.repeat(Math.max(0, maxBarLength - totalBarLength));

      output += `${date} │${chalk.green(inputBar)}${chalk.red(outputBar)}${spaces}│ ${totalTokens.toLocaleString()}\n`;
    }

    output += `\nLegend: ${chalk.green('█')} Input Tokens  ${chalk.red('█')} Output Tokens\n`;

    return output;
  }

  // Utility method for sparkline charts (future enhancement)
  // private renderSparkline(values: number[]): string {
  //   if (values.length === 0) return '';

  //   const min = Math.min(...values);
  //   const max = Math.max(...values);
  //   const range = max - min;

  //   if (range === 0) return '▁'.repeat(values.length);

  //   const sparkChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  //   return values.map(value => {
  //     const normalized = (value - min) / range;
  //     const charIndex = Math.min(Math.floor(normalized * sparkChars.length), sparkChars.length - 1);
  //     return sparkChars[charIndex];
  //   }).join('');
  // }

  // Utility method for future enhancements
  // private renderMiniChart(data: Record<string, number>, title: string, color: (str: string) => string): string {
  //   let output = chalk.bold(`${title}\n`);

  //   const entries = Object.entries(data).sort(([,a], [,b]) => b - a);
  //   const values = entries.map(([,value]) => value);
  //   const sparkline = this.renderSparkline(values);

  //   output += color(sparkline) + '\n';

  //   // Show top 3 entries
  //   entries.slice(0, 3).forEach(([key, value], index) => {
  //     const indicator = ['🥇', '🥈', '🥉'][index];
  //     output += `${indicator} ${key}: ${value.toFixed(4)}\n`;
  //   });

  //   return output;
  // }
}
