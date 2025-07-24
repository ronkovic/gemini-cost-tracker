import chalk from 'chalk';
import inquirer from 'inquirer';
import { CLIOptions, AppError, ErrorCode } from '../types/index.js';
import { AuthManager } from '../services/auth/authManager.js';

interface ConfigOptions extends CLIOptions {
  setGeminiKey?: string;
  setProject?: string;
  setKeyFile?: string;
  show?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  try {
    const authManager = new AuthManager();
    await authManager.initialize();

    // Show current configuration
    if (options.show) {
      const config = await authManager.getConfiguration();

      console.log(chalk.blue('📋 Current Configuration:'));
      console.log(
        `Gemini API Key: ${config.geminiApiKey ? maskApiKey(config.geminiApiKey) : chalk.red('Not set')}`
      );
      console.log(`GCP Project ID: ${config.gcpProjectId || chalk.red('Not set')}`);
      console.log(`GCP Key File: ${config.gcpKeyFile || chalk.red('Not set')}`);
      return;
    }

    // Set configuration values
    if (options.setGeminiKey) {
      await authManager.setGeminiApiKey(options.setGeminiKey);
      console.log(chalk.green('✅ Gemini API key updated successfully'));
      return;
    }

    if (options.setProject) {
      await authManager.setGcpProjectId(options.setProject);
      console.log(chalk.green('✅ GCP Project ID updated successfully'));
      return;
    }

    if (options.setKeyFile) {
      await authManager.setGcpKeyFile(options.setKeyFile);
      console.log(chalk.green('✅ GCP Key file path updated successfully'));
      return;
    }

    // Interactive configuration setup
    console.log(chalk.blue('🔧 Interactive Configuration Setup'));
    console.log(
      'This will guide you through setting up authentication for Gemini and Vertex AI.\n'
    );

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'geminiApiKey',
        message: 'Enter your Gemini API key:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Gemini API key is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'gcpProjectId',
        message: 'Enter your Google Cloud Project ID:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'GCP Project ID is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'gcpKeyFile',
        message: 'Enter path to your GCP service account key file (optional):',
      },
    ]);

    // Save configuration
    await authManager.setGeminiApiKey(answers.geminiApiKey);
    await authManager.setGcpProjectId(answers.gcpProjectId);

    if (answers.gcpKeyFile?.trim()) {
      await authManager.setGcpKeyFile(answers.gcpKeyFile);
    }

    console.log(chalk.green('\n✅ Configuration saved successfully!'));

    // Test the configuration
    console.log(chalk.yellow('🔍 Testing configuration...'));
    const isValid = await authManager.validateCredentials();

    if (isValid) {
      console.log(chalk.green('✅ Authentication test passed!'));
    } else {
      console.log(chalk.red('❌ Authentication test failed. Please check your credentials.'));
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.CONFIG_COMMAND_ERROR,
      `Failed to manage configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function maskApiKey(key: string): string {
  if (key.length < 8) return '***';
  return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}
