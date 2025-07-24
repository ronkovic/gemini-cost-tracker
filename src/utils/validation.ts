import { CLIOptions, Period, Format, Currency } from '../types/index.js';
import { ErrorHandler } from './errorHandler.js';
import { ERROR_MESSAGES, SUPPORTED_MODELS } from './constants.js';

export class ValidationUtils {
  static isValidPeriod(period: string): period is Period {
    return ['today', 'week', 'month', 'custom'].includes(period);
  }

  static isValidFormat(format: string): format is Format {
    return ['table', 'json', 'csv', 'chart'].includes(format);
  }

  static isValidCurrency(currency: string): currency is Currency {
    return ['USD', 'JPY'].includes(currency);
  }

  static isValidModel(model: string): boolean {
    const allSupportedModels = [
      ...SUPPORTED_MODELS.GEMINI,
      ...SUPPORTED_MODELS.VERTEX_AI,
    ] as readonly string[];
    return allSupportedModels.includes(model);
  }

  static validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw ErrorHandler.createValidationError('Invalid date format. Use YYYY-MM-DD format.');
    }

    if (start >= end) {
      throw ErrorHandler.createValidationError(ERROR_MESSAGES.INVALID_DATE_RANGE);
    }

    const now = new Date();
    if (end > now) {
      throw ErrorHandler.createValidationError('End date cannot be in the future');
    }
  }

  static validateGcpProjectId(projectId: string): void {
    // GCP project IDs must be 6-30 characters, lowercase letters, digits, and hyphens
    const projectIdRegex = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
    if (!projectIdRegex.test(projectId)) {
      throw ErrorHandler.createValidationError(
        'Invalid GCP project ID format. Must be 6-30 characters, lowercase letters, digits, and hyphens only.'
      );
    }
  }

  static validateApiKey(apiKey: string): void {
    if (!apiKey || apiKey.trim().length === 0) {
      throw ErrorHandler.createValidationError('API key cannot be empty');
    }

    // Basic format check for Gemini API keys (typically start with specific prefixes)
    if (!apiKey.startsWith('AIza') && !apiKey.startsWith('AI39')) {
      throw ErrorHandler.createValidationError(
        'Invalid API key format. Gemini API keys typically start with "AIza" or "AI39".'
      );
    }
  }

  static validateFilePath(filePath: string): void {
    if (!filePath || filePath.trim().length === 0) {
      throw ErrorHandler.createValidationError('File path cannot be empty');
    }

    // Check for potentially dangerous paths
    if (filePath.includes('..') || filePath.includes('~')) {
      throw ErrorHandler.createValidationError('Invalid file path: relative paths not allowed');
    }
  }

  static validateCliOptions(options: CLIOptions): void {
    if (options.period && !this.isValidPeriod(options.period)) {
      throw ErrorHandler.createValidationError(`Invalid period: ${options.period}`);
    }

    if (options.format && !this.isValidFormat(options.format)) {
      throw ErrorHandler.createValidationError(`Invalid format: ${options.format}`);
    }

    if (options.currency && !this.isValidCurrency(options.currency)) {
      throw ErrorHandler.createValidationError(`Invalid currency: ${options.currency}`);
    }

    if (options.model && !this.isValidModel(options.model)) {
      throw ErrorHandler.createValidationError(`Unsupported model: ${options.model}`);
    }

    if (options.period === 'custom') {
      if (!options.startDate || !options.endDate) {
        throw ErrorHandler.createValidationError(
          'Custom period requires both startDate and endDate'
        );
      }
      this.validateDateRange(options.startDate, options.endDate);
    }

    if (options.output) {
      this.validateFilePath(options.output);
    }

    if (options.project) {
      this.validateGcpProjectId(options.project);
    }
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>"'&]/g, '');
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new globalThis.URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
