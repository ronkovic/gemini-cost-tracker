import { AppError, ErrorCode } from '../types/index.js';
import { logger } from './logger.js';
import { ERROR_MESSAGES } from './constants.js';

export class ErrorHandler {
  static handle(error: unknown, context?: Record<string, unknown>): AppError {
    if (error instanceof AppError) {
      logger.appError(error.message, error.code, error, context);
      return error;
    }

    if (error instanceof Error) {
      const appError = new AppError(ErrorCode.API_ERROR, error.message, {
        originalError: error.name,
        ...context,
      });
      logger.appError(appError.message, appError.code, error, context);
      return appError;
    }

    const unknownError = new AppError(ErrorCode.API_ERROR, 'An unknown error occurred', {
      originalError: String(error),
      ...context,
    });
    logger.appError(unknownError.message, unknownError.code, undefined, context);
    return unknownError;
  }

  static createValidationError(message: string, details?: unknown): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, details);
  }

  static createAuthError(
    message: string = ERROR_MESSAGES.AUTHENTICATION_FAILED,
    details?: unknown
  ): AppError {
    return new AppError(ErrorCode.AUTH_ERROR, message, details);
  }

  static createNetworkError(
    message: string = ERROR_MESSAGES.NETWORK_ERROR,
    details?: unknown
  ): AppError {
    return new AppError(ErrorCode.NETWORK_ERROR, message, details);
  }

  static createFileError(
    message: string = ERROR_MESSAGES.FILE_NOT_FOUND,
    details?: unknown
  ): AppError {
    return new AppError(ErrorCode.FILE_ERROR, message, details);
  }

  static createConfigError(message: string, details?: unknown): AppError {
    return new AppError(ErrorCode.INVALID_CONFIG, message, details);
  }

  static isNetworkError(error: Error): boolean {
    return (
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('timeout') ||
      error.message.includes('Network Error')
    );
  }

  static isAuthError(error: Error): boolean {
    return (
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('Authentication failed')
    );
  }
}

export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, unknown>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw ErrorHandler.handle(error, context);
    }
  };
}

export function withSyncErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => R,
  context?: Record<string, unknown>
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      throw ErrorHandler.handle(error, context);
    }
  };
}
