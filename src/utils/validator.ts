import { CLIOptions, AppError, ErrorCode } from '../types/index.js';

export function validateDateRange(options: CLIOptions): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now);

  switch (options.period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'month':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'custom':
      if (!options.startDate || !options.endDate) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Custom period requires both --start-date and --end-date options'
        );
      }

      startDate = parseDate(options.startDate);
      endDate = parseDate(options.endDate);

      if (startDate > endDate) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Start date must be before or equal to end date'
        );
      }

      if (endDate > now) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'End date cannot be in the future');
      }
      break;

    default:
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Invalid period: ${options.period}. Must be one of: today, week, month, custom`
      );
  }

  return { startDate, endDate };
}

export function parseDate(dateString: string): Date {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Invalid date format: ${dateString}. Expected format: YYYY-MM-DD`
    );
  }

  return date;
}

export function validateCurrency(currency: string): 'USD' | 'JPY' {
  if (currency !== 'USD' && currency !== 'JPY') {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Invalid currency: ${currency}. Must be either USD or JPY`
    );
  }
  return currency;
}

export function validateFormat(format: string): 'table' | 'json' | 'csv' | 'chart' {
  if (!['table', 'json', 'csv', 'chart'].includes(format)) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Invalid format: ${format}. Must be one of: table, json, csv, chart`
    );
  }
  return format as 'table' | 'json' | 'csv' | 'chart';
}
