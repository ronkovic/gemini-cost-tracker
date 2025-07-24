import chalk from 'chalk';
import ora from 'ora';
import { CLIOptions, AppError, ErrorCode } from '../types/index.js';
import { validateDateRange } from '../utils/validator.js';
import { AuthManager } from '../services/auth/authManager.js';
import { GeminiClient } from '../services/api/geminiClient.js';
import { VertexClient } from '../services/api/vertexClient.js';
import { CostCalculator } from '../services/calculator/costCalculator.js';
import { TableFormatter } from '../services/formatter/tableFormatter.js';
import { JSONFormatter } from '../services/formatter/jsonFormatter.js';
import { ChartFormatter } from '../services/formatter/chartFormatter.js';

export async function showCommand(options: CLIOptions): Promise<void> {
  const spinner = ora('Loading usage data...').start();

  try {
    // Validate options
    const { startDate, endDate } = validateDateRange(options);

    // Initialize authentication
    const authManager = new AuthManager();
    await authManager.initialize();

    // Initialize API clients
    const useRealData = options.realData || false;
    const geminiClient = new GeminiClient(authManager, useRealData);
    const vertexClient = new VertexClient(authManager, useRealData);

    // Fetch usage data
    spinner.text = 'Fetching Gemini usage data...';
    const geminiUsage = await geminiClient.getUsage({
      startDate,
      endDate,
      project: options.project,
      model: options.model,
    });

    spinner.text = 'Fetching Vertex AI usage data...';
    const vertexUsage = await vertexClient.getUsage({
      startDate,
      endDate,
      project: options.project,
      model: options.model,
    });

    // Calculate costs
    spinner.text = 'Calculating costs...';
    const calculator = new CostCalculator();
    const report = await calculator.generateReport(
      [...geminiUsage, ...vertexUsage],
      { start: startDate, end: endDate },
      options.currency || 'USD'
    );

    spinner.stop();

    // Format and display results
    let formatter;
    switch (options.format) {
      case 'json':
        formatter = new JSONFormatter();
        break;
      case 'chart':
        formatter = new ChartFormatter();
        break;
      case 'table':
      default:
        formatter = new TableFormatter();
        break;
    }

    const output = formatter.format(report);
    console.log(output);

    // Display summary
    console.log(chalk.green('\n✨ Summary:'));
    console.log(`Total Input Tokens: ${report.summary.totalInputTokens.toLocaleString()}`);
    console.log(`Total Output Tokens: ${report.summary.totalOutputTokens.toLocaleString()}`);
    console.log(`Total Cost: ${report.summary.totalCost.toFixed(4)} ${report.summary.currency}`);
  } catch (error) {
    spinner.stop();

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.SHOW_COMMAND_ERROR,
      `Failed to retrieve usage data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
