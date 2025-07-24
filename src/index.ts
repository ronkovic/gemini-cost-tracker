#!/usr/bin/env node

import { Command } from 'commander';
import { showCommand } from './commands/show.js';
import { exportCommand } from './commands/export.js';
import { configCommand } from './commands/config.js';
import { testCommand } from './commands/test.js';
import { updatePricingCommand } from './commands/updatePricing.js';
import { logger } from './utils/logger.js';
import { ErrorHandler } from './utils/errorHandler.js';

const program = new Command();

program
  .name('gemini-cost-tracker')
  .description('CLI tool to track token usage and costs for Gemini and Vertex AI')
  .version('0.1.0');

program
  .command('show')
  .description('Display token usage and cost information')
  .option('-p, --period <period>', 'Time period (today|week|month|custom)', 'today')
  .option('-s, --start-date <date>', 'Start date for custom period (YYYY-MM-DD)')
  .option('-e, --end-date <date>', 'End date for custom period (YYYY-MM-DD)')
  .option('--project <project>', 'Filter by Google Cloud project ID')
  .option('--model <model>', 'Filter by model name')
  .option('-f, --format <format>', 'Output format (table|json|csv|chart)', 'table')
  .option('-c, --currency <currency>', 'Currency (USD|JPY)', 'USD')
  .option('--real-data', 'Use real API usage data from Google Cloud APIs')
  .action(showCommand);

program
  .command('export')
  .description('Export usage data to file')
  .option('-p, --period <period>', 'Time period (today|week|month|custom)', 'month')
  .option('-s, --start-date <date>', 'Start date for custom period (YYYY-MM-DD)')
  .option('-e, --end-date <date>', 'End date for custom period (YYYY-MM-DD)')
  .option('--project <project>', 'Filter by Google Cloud project ID')
  .option('--model <model>', 'Filter by model name')
  .option('-f, --format <format>', 'Export format (json|csv)', 'json')
  .option('-o, --output <file>', 'Output file path')
  .option('-c, --currency <currency>', 'Currency (USD|JPY)', 'USD')
  .option('--real-data', 'Use real API usage data from Google Cloud APIs')
  .action(exportCommand);

program
  .command('config')
  .description('Manage configuration and authentication')
  .option('--set-gemini-key <key>', 'Set Gemini API key')
  .option('--set-project <project>', 'Set default Google Cloud project ID')
  .option('--set-key-file <file>', 'Set path to Google Cloud service account key file')
  .option('--show', 'Show current configuration')
  .action(configCommand);

program
  .command('test')
  .description('Test Google Cloud API connections and permissions')
  .action(testCommand);

program
  .command('update-pricing')
  .description('Update model pricing information from Google documentation')
  .option('--dry', 'Show what would be updated without making changes')
  .option('--report', 'Generate pricing comparison report instead of updating code')
  .option('-o, --output <file>', 'Output file path for report (default: pricing-report.md)')
  .action(updatePricingCommand);

// Global error handler
process.on('uncaughtException', (error: Error) => {
  const appError = ErrorHandler.handle(error, { context: 'uncaughtException' });
  logger.error(`Error: ${appError.message}`, { code: appError.code, details: appError.details });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection:', { reason });
  process.exit(1);
});

// Parse command line arguments
program.parse();
