import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { CLIOptions, AppError, ErrorCode } from '../types/index.js';
import { validateDateRange } from '../utils/validator.js';
import { AuthManager } from '../services/auth/authManager.js';
import { GeminiClient } from '../services/api/geminiClient.js';
import { VertexClient } from '../services/api/vertexClient.js';
import { CostCalculator } from '../services/calculator/costCalculator.js';
import { JSONFormatter } from '../services/formatter/jsonFormatter.js';
import { CSVFormatter } from '../services/formatter/csvFormatter.js';

export async function exportCommand(options: CLIOptions): Promise<void> {
  const spinner = ora('Preparing export...').start();

  try {
    // Validate options
    const { startDate, endDate } = validateDateRange(options);

    if (!options.output) {
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = options.format === 'csv' ? 'csv' : 'json';
      options.output = `gemini-cost-report-${timestamp}.${extension}`;
    }

    // Initialize authentication
    const authManager = new AuthManager();
    await authManager.initialize();

    // Initialize API clients
    const useRealData = options.realData || false;
    const geminiClient = new GeminiClient(authManager, useRealData);
    const vertexClient = new VertexClient(authManager, useRealData);

    // Fetch usage data
    spinner.text = 'Fetching usage data...';
    const geminiUsage = await geminiClient.getUsage({
      startDate,
      endDate,
      project: options.project,
      model: options.model,
    });

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

    // Format data
    spinner.text = 'Formatting data...';
    let formatter;
    switch (options.format) {
      case 'csv':
        formatter = new CSVFormatter();
        break;
      case 'json':
      default:
        formatter = new JSONFormatter();
        break;
    }

    const output = formatter.format(report);

    // Write to file
    spinner.text = 'Writing to file...';
    const outputPath = path.resolve(options.output);
    await fs.writeFile(outputPath, output, 'utf8');

    spinner.stop();

    console.log(chalk.green('✅ Export completed successfully!'));
    console.log(`File saved to: ${chalk.cyan(outputPath)}`);
    console.log(`Format: ${options.format?.toUpperCase()}`);
    console.log(`Records: ${report.details.length}`);
    console.log(`Total Cost: ${report.summary.totalCost.toFixed(4)} ${report.summary.currency}`);
  } catch (error) {
    spinner.stop();

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.EXPORT_COMMAND_ERROR,
      `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
