export type Period = 'today' | 'week' | 'month' | 'custom';
export type Format = 'table' | 'json' | 'csv' | 'chart';
export type Currency = 'USD' | 'JPY';
export type Service = 'gemini' | 'vertex-ai';

export interface CLIOptions {
  period?: Period;
  startDate?: string;
  endDate?: string;
  project?: string;
  model?: string;
  format?: Format;
  output?: string;
  currency?: Currency;
  realData?: boolean;
}

export interface Usage {
  id: string;
  timestamp: Date;
  service: Service;
  model: string;
  inputTokens: number;
  outputTokens: number;
  project?: string;
  region?: string;
}

export interface Cost {
  usageId: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
  calculatedAt: Date;
}

export interface CostReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    currency: string;
  };
  details: Array<{
    date: Date;
    service: string;
    model: string;
    usage: Usage;
    cost: Cost;
  }>;
}

export interface AuthCredentials {
  geminiApiKey?: string;
  gcpProjectId?: string;
  gcpKeyFile?: string;
}

export interface PriceModel {
  inputTokenPrice: number;
  outputTokenPrice: number;
  currency: Currency;
  model: string;
}

export interface UsageParams {
  startDate: Date;
  endDate: Date;
  project?: string;
  model?: string;
}

export interface APIClient {
  getUsage(params: UsageParams): Promise<Usage[]>;
}

export interface Formatter {
  format(data: CostReport): string;
}

export enum ErrorCode {
  INVALID_CONFIG = 'INVALID_CONFIG',
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  // Command specific errors
  CONFIG_COMMAND_ERROR = 'CONFIG_COMMAND_ERROR',
  EXPORT_COMMAND_ERROR = 'EXPORT_COMMAND_ERROR',
  SHOW_COMMAND_ERROR = 'SHOW_COMMAND_ERROR',
  UPDATE_PRICING_ERROR = 'UPDATE_PRICING_ERROR',
  // API specific errors
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  GEMINI_USAGE_ERROR = 'GEMINI_USAGE_ERROR',
  VERTEX_API_ERROR = 'VERTEX_API_ERROR',
  VERTEX_USAGE_ERROR = 'VERTEX_USAGE_ERROR',
  REAL_USAGE_INIT_ERROR = 'REAL_USAGE_INIT_ERROR',
  // Auth specific errors
  AUTH_INIT_ERROR = 'AUTH_INIT_ERROR',
  AUTH_SAVE_ERROR = 'AUTH_SAVE_ERROR',
  AUTH_KEY_FILE_ERROR = 'AUTH_KEY_FILE_ERROR',
  AUTH_MISSING_GEMINI_KEY = 'AUTH_MISSING_GEMINI_KEY',
  AUTH_MISSING_GCP_PROJECT = 'AUTH_MISSING_GCP_PROJECT',
  AUTH_CLEAR_ERROR = 'AUTH_CLEAR_ERROR',
  // Calculator specific errors
  COST_CALCULATION_ERROR = 'COST_CALCULATION_ERROR',
  REPORT_GENERATION_ERROR = 'REPORT_GENERATION_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ConfigFile {
  defaultProject?: string;
  defaultCurrency?: Currency;
  defaultFormat?: Format;
  apiKeys?: {
    gemini?: string;
    vertexAI?: string;
  };
  gcpSettings?: {
    projectId?: string;
    keyFilePath?: string;
  };
}

export interface LoggerConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'text';
  output: 'console' | 'file';
  filePath?: string;
}
