import chalk from 'chalk';
import ora from 'ora';
import { AppError } from '../types/index.js';
import { AuthManager } from '../services/auth/authManager.js';
import { RealUsageClient } from '../services/api/realUsageClient.js';

export async function testCommand(): Promise<void> {
  const spinner = ora('Testing connections...').start();

  try {
    // Initialize authentication
    const authManager = new AuthManager();
    await authManager.initialize();

    // Validate credentials
    spinner.text = 'Validating credentials...';
    const isValid = await authManager.validateCredentials();

    if (!isValid) {
      spinner.stop();
      console.log(chalk.red('❌ Credentials validation failed'));
      console.log(chalk.yellow('Run "gemini-cost-demo config" to set up authentication'));
      return;
    }

    console.log(chalk.green('✅ Credentials validation passed'));

    // Test real usage client connections
    spinner.text = 'Testing Google Cloud API connections...';
    const realUsageClient = new RealUsageClient(authManager);
    const connections = await realUsageClient.testConnections();

    spinner.stop();

    console.log(chalk.bold.blue('\n📊 Connection Test Results:'));

    // Logging API test
    if (connections.logging) {
      console.log(chalk.green('✅ Cloud Logging API: Connected'));
      console.log(chalk.gray('   Can access API usage logs'));
    } else {
      console.log(chalk.yellow('⚠️  Cloud Logging API: Failed'));
      console.log(chalk.gray('   May need to enable Cloud Logging API'));
    }

    // Monitoring API test
    if (connections.monitoring) {
      console.log(chalk.green('✅ Cloud Monitoring API: Connected'));
      console.log(chalk.gray('   Can access usage metrics'));
    } else {
      console.log(chalk.yellow('⚠️  Cloud Monitoring API: Failed'));
      console.log(chalk.gray('   May need to enable Cloud Monitoring API'));
    }

    // Overall status
    console.log(chalk.bold('\n🔍 Overall Status:'));
    if (connections.logging || connections.monitoring) {
      console.log(chalk.green('✅ Real data collection partially available'));
      console.log(chalk.gray('   Use --real-data flag to enable real data collection'));
    } else {
      console.log(chalk.yellow('⚠️  Real data collection not available'));
      console.log(chalk.gray('   Will fall back to mock data'));
    }

    // Recommendations
    console.log(chalk.bold('\n💡 Recommendations:'));

    if (!connections.logging) {
      console.log(chalk.gray('• Enable Cloud Logging API:'));
      console.log(chalk.cyan('  gcloud services enable logging.googleapis.com'));
    }

    if (!connections.monitoring) {
      console.log(chalk.gray('• Enable Cloud Monitoring API:'));
      console.log(chalk.cyan('  gcloud services enable monitoring.googleapis.com'));
    }

    console.log(chalk.gray('• Ensure proper IAM permissions for:'));
    console.log(chalk.cyan('  - Logging Viewer'));
    console.log(chalk.cyan('  - Monitoring Viewer'));
  } catch (error) {
    spinner.stop();

    if (error instanceof AppError) {
      console.log(chalk.red(`❌ Test failed: ${error.message}`));
    } else {
      console.log(
        chalk.red(
          `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  }
}
