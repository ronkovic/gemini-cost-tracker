import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { CLIOptions, AppError, ErrorCode } from '../types/index.js';
import { PriceUpdater } from '../services/calculator/priceUpdater.js';

interface UpdatePricingOptions extends CLIOptions {
  dry?: boolean;
  report?: boolean;
  output?: string;
}

export async function updatePricingCommand(options: UpdatePricingOptions): Promise<void> {
  const spinner = ora('Fetching latest pricing information...').start();

  try {
    const updater = new PriceUpdater();

    // Fetch latest pricing data
    spinner.text = 'Fetching pricing from Google APIs...';
    const pricingUpdate = await updater.updatePricing();

    spinner.text = 'Processing pricing data...';

    if (options.report) {
      // Generate comparison report
      const report = await updater.getModelComparisonReport(pricingUpdate);
      const reportPath = options.output || 'pricing-report.md';

      await fs.writeFile(reportPath, report, 'utf8');

      spinner.stop();
      console.log(chalk.green('✅ Pricing report generated!'));
      console.log(`Report saved to: ${chalk.cyan(reportPath)}`);
      console.log(`\nGemini models updated: ${Object.keys(pricingUpdate.geminiModels).length}`);
      console.log(`Vertex AI models updated: ${Object.keys(pricingUpdate.vertexModels).length}`);
      return;
    }

    // Generate updated price table
    const updatedPriceTable = await updater.generateUpdatedPriceTable(pricingUpdate);

    if (options.dry) {
      // Dry run - show what would be updated
      spinner.stop();
      console.log(chalk.yellow('🔍 Dry run - Price table preview:'));
      console.log(chalk.gray('='.repeat(60)));
      console.log(updatedPriceTable.substring(0, 1000) + '...');
      console.log(chalk.gray('='.repeat(60)));
      console.log(
        `\n${chalk.green('✅')} Found ${Object.keys(pricingUpdate.geminiModels).length} Gemini models`
      );
      console.log(
        `${chalk.green('✅')} Found ${Object.keys(pricingUpdate.vertexModels).length} Vertex AI models`
      );
      console.log(chalk.yellow('\nTo apply changes, run without --dry flag'));
      return;
    }

    // Update the actual price table file
    spinner.text = 'Updating price table...';
    const priceTablePath = path.join(process.cwd(), 'src/services/calculator/priceTable.ts');

    // Backup existing file
    try {
      const existingContent = await fs.readFile(priceTablePath, 'utf8');
      const backupPath = `${priceTablePath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, existingContent, 'utf8');
      console.log(chalk.gray(`Backup created: ${path.relative(process.cwd(), backupPath)}`));
    } catch {
      console.log(chalk.yellow('No existing price table found, creating new one'));
    }

    // Write updated price table
    await fs.writeFile(priceTablePath, updatedPriceTable, 'utf8');

    spinner.stop();

    console.log(chalk.green('✅ Pricing information updated successfully!'));
    console.log(`Updated: ${chalk.cyan(path.relative(process.cwd(), priceTablePath))}`);
    console.log(`\nModels updated:`);
    console.log(
      `  ${chalk.blue('Gemini API:')} ${Object.keys(pricingUpdate.geminiModels).length} models`
    );
    console.log(
      `  ${chalk.blue('Vertex AI:')} ${Object.keys(pricingUpdate.vertexModels).length} models`
    );

    // Show newly discovered models
    const allCurrentModels = { ...pricingUpdate.geminiModels, ...pricingUpdate.vertexModels };
    const newModelNames = Object.keys(allCurrentModels);
    console.log(
      `\n${chalk.bold('📈 Model Coverage:')} ${newModelNames.length} total models supported`
    );

    // Show some example models
    const allModels = { ...pricingUpdate.geminiModels, ...pricingUpdate.vertexModels };
    const sampleModels = Object.entries(allModels).slice(0, 3);

    if (sampleModels.length > 0) {
      console.log(`\n${chalk.bold('Sample pricing:')}`);
      for (const [name, model] of sampleModels) {
        const inputCost = (model.inputTokenPrice * 1000).toFixed(6);
        const outputCost = (model.outputTokenPrice * 1000).toFixed(6);
        console.log(`  ${name}: $${inputCost}/$${outputCost} per 1K tokens (input/output)`);
      }
    }

    console.log(chalk.gray('\n💡 Remember to rebuild the project: npm run build'));
  } catch (error) {
    spinner.stop();

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.UPDATE_PRICING_ERROR,
      `Failed to update pricing: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
