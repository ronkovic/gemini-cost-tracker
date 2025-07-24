import { ErrorCode } from '../types/index.js';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private level: LogLevel = LogLevel.WARN;  // デフォルトを WARN に変更
  private format: 'json' | 'text' = 'text';

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setFormat(format: 'json' | 'text'): void {
    this.format = format;
  }

  private formatMessage(entry: LogEntry): string {
    if (this.format === 'json') {
      return JSON.stringify({
        level: LogLevel[entry.level],
        message: entry.message,
        timestamp: entry.timestamp.toISOString(),
        context: entry.context,
        error: entry.error
          ? {
              name: entry.error.name,
              message: entry.error.message,
              stack: entry.error.stack,
            }
          : undefined,
      });
    }

    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    let formatted = `[${timestamp}] [${levelName}] ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` - Context: ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      formatted += ` - Error: ${entry.error.message}`;
    }

    return formatted;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (this.level >= level) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        context,
        error,
      };

      const formatted = this.formatMessage(entry);

      switch (level) {
        case LogLevel.ERROR:
          console.error(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.INFO:
        case LogLevel.DEBUG:
        default:
          console.log(formatted);
          break;
      }
    }
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Convenience method for logging app errors
  appError(
    message: string,
    code: ErrorCode,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.error(message, { ...context, errorCode: code }, error);
  }
}

export const logger = new Logger();

// Set log level from environment variable
const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
if (envLogLevel && envLogLevel in LogLevel) {
  logger.setLevel(LogLevel[envLogLevel as keyof typeof LogLevel]);
}

// Set log format from environment variable
const envLogFormat = process.env.LOG_FORMAT?.toLowerCase();
if (envLogFormat === 'json' || envLogFormat === 'text') {
  logger.setFormat(envLogFormat);
}
