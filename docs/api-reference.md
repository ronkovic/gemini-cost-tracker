# APIリファレンス

## 📋 目次
- [概要](#概要)
- [型定義](#型定義)
- [コアクラス](#コアクラス)
- [サービスクラス](#サービスクラス)
- [ユーティリティ関数](#ユーティリティ関数)
- [設定オプション](#設定オプション)
- [エラーハンドリング](#エラーハンドリング)
- [ログシステム](#ログシステム)
- [バリデーション](#バリデーション)

## 🔍 概要

このAPIリファレンスでは、gemini-cost-trackerの内部APIとプログラマティックな使用方法について説明します。

## 📝 型定義

### Usage

使用量データを表すインターface：

```typescript
// 新しい型エイリアス
type Service = 'gemini' | 'vertex-ai';
type Period = 'today' | 'week' | 'month' | 'custom';
type Format = 'table' | 'json' | 'csv' | 'chart';
type Currency = 'USD' | 'JPY';

interface Usage {
  id: string;
  timestamp: Date;
  service: Service;
  model: string;
  inputTokens: number;
  outputTokens: number;
  project?: string;
  region?: string;
}
```

### Cost

コスト情報を表すインターface：

```typescript
interface Cost {
  usageId: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
  calculatedAt: Date;
}
```

### CostReport

コストレポートを表すインターface：

```typescript
interface CostReport {
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
```

### DateRange

日付範囲を表すインターface：

```typescript
interface DateRange {
  startDate: Date;
  endDate: Date;
}
```

### PriceModel

価格モデルを表すインターface：

```typescript
interface PriceModel {
  model: string;
  inputTokenPrice: number;
  outputTokenPrice: number;
  currency: string;
}
```

### AppError

アプリケーション固有のエラーを表すクラス（リファクタリング後）：

```typescript
// 新しいErrorCode列挙型（26種類）
enum ErrorCode {
  INVALID_CONFIG = 'INVALID_CONFIG',
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  // コマンド固有エラー
  CONFIG_COMMAND_ERROR = 'CONFIG_COMMAND_ERROR',
  EXPORT_COMMAND_ERROR = 'EXPORT_COMMAND_ERROR',
  SHOW_COMMAND_ERROR = 'SHOW_COMMAND_ERROR',
  // ... 他にも多数
}

class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  );
}
```

### 新しいアーキテクチャコンポーネント

#### ConfigManager

設定管理を担当する新しいクラス：

```typescript
class ConfigManager {
  async loadConfig(): Promise<ConfigFile>;
  async saveConfig(config: ConfigFile): Promise<void>;
  async updateConfig(updates: Partial<ConfigFile>): Promise<ConfigFile>;
  async getDefaultCurrency(): Promise<Currency>;
  async setDefaultCurrency(currency: Currency): Promise<void>;
  // ... 他のメソッド
}
```

#### ErrorHandler

エラーハンドリング用ユーティリティ：

```typescript
class ErrorHandler {
  static handle(error: unknown, context?: Record<string, unknown>): AppError;
  static createValidationError(message: string, details?: unknown): AppError;
  static createAuthError(message?: string, details?: unknown): AppError;
  static createNetworkError(message?: string, details?: unknown): AppError;
}

// ラッパー関数
function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, unknown>
): (...args: T) => Promise<R>;
```

#### ValidationUtils

入力バリデーション用ユーティリティ：

```typescript
class ValidationUtils {
  static isValidPeriod(period: string): period is Period;
  static isValidFormat(format: string): format is Format;
  static isValidCurrency(currency: string): currency is Currency;
  static validateDateRange(startDate: string, endDate: string): void;
  static validateGcpProjectId(projectId: string): void;
  static validateApiKey(apiKey: string): void;
  static validateCliOptions(options: CLIOptions): void;
}
```

## 🏗️ コアクラス

### CostCalculator

コスト計算の中心となるクラス：

```typescript
class CostCalculator {
  /**
   * 使用量データからコストを計算
   */
  calculateCost(usage: Usage, currency: string): Cost;

  /**
   * コストレポートを生成
   */
  generateReport(
    usageData: Usage[],
    period: DateRange,
    currency: string
  ): Promise<CostReport>;

  /**
   * モデル別の内訳を計算
   */
  calculateModelBreakdown(
    usageData: Usage[],
    currency: string
  ): Record<string, { totalCost: number; totalTokens: number }>;

  /**
   * サービス別の内訳を計算
   */
  calculateServiceBreakdown(
    usageData: Usage[],
    currency: string
  ): Record<string, { totalCost: number; totalTokens: number }>;
}
```

**使用例:**
```typescript
import { CostCalculator } from './services/calculator/costCalculator.js';

const calculator = new CostCalculator();
const cost = calculator.calculateCost(usageData, 'USD');
const report = await calculator.generateReport(usageArray, dateRange, 'USD');
```

### AuthManager

認証情報の管理を行うクラス：

```typescript
class AuthManager {
  /**
   * 認証情報の初期化
   */
  initialize(): Promise<void>;

  /**
   * 認証情報の検証
   */
  validateCredentials(): Promise<boolean>;

  /**
   * Gemini認証情報の取得
   */
  getGeminiCredentials(): Promise<{ apiKey: string }>;

  /**
   * GCP認証情報の取得
   */
  getGcpCredentials(): Promise<{
    projectId: string;
    keyFile: string | null;
  }>;

  /**
   * 認証情報の保存
   */
  saveCredentials(credentials: any): Promise<void>;

  /**
   * 設定ファイルのパスを取得
   */
  getConfigPath(): string;
}
```

## 📋 ログシステム

新しい構造化ログシステム：

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  setLevel(level: LogLevel): void;
  setFormat(format: 'json' | 'text'): void;
  
  error(message: string, context?: Record<string, unknown>, error?: Error): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  
  // アプリエラー用
  appError(message: string, code: ErrorCode, error?: Error, context?: Record<string, unknown>): void;
}

// グローバルインスタンス
export const logger: Logger;
```

**使用例:**

```typescript
import { logger } from '../utils/logger.js';
import { ErrorCode } from '../types/index.js';

// 基本的なログ
logger.info('ユーザーデータを取得中', { userId: '123', service: 'gemini' });

// エラーログ
logger.error('リクエストが失敗しました', { url: '/api/data', status: 404 });

// アプリエラー
logger.appError('認証に失敗しました', ErrorCode.AUTH_ERROR, error, { userId: '123' });
```

## 🛡️ バリデーション

入力バリデーションユーティリティ：

```typescript
class ValidationUtils {
  // 型ガード関数
  static isValidPeriod(period: string): period is Period;
  static isValidFormat(format: string): format is Format;
  static isValidCurrency(currency: string): currency is Currency;
  static isValidModel(model: string): boolean;
  
  // 検証関数
  static validateDateRange(startDate: string, endDate: string): void;
  static validateGcpProjectId(projectId: string): void;
  static validateApiKey(apiKey: string): void;
  static validateFilePath(filePath: string): void;
  static validateCliOptions(options: CLIOptions): void;
  
  // ユーティリティ
  static sanitizeInput(input: string): string;
  static isValidEmail(email: string): boolean;
  static isValidUrl(url: string): boolean;
}
```

**使用例:**
```typescript
import { AuthManager } from './services/auth/authManager.js';

const authManager = new AuthManager();
await authManager.initialize();
const geminiCreds = await authManager.getGeminiCredentials();
```

## 🔧 サービスクラス

### GeminiClient

Gemini APIとの通信を行うクラス：

```typescript
class GeminiClient {
  constructor(authManager: AuthManager);

  /**
   * 使用量データの取得
   */
  getUsage(params: {
    startDate?: Date;
    endDate?: Date;
    project?: string;
    model?: string;
  }): Promise<Usage[]>;
}
```

**使用例:**
```typescript
import { GeminiClient } from './services/api/geminiClient.js';

const client = new GeminiClient(authManager);
const usage = await client.getUsage({
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  model: 'gemini-2.5-pro'
});
```

### VertexClient

Vertex AI APIとの通信を行うクラス：

```typescript
class VertexClient {
  constructor(authManager: AuthManager);

  /**
   * 使用量データの取得
   */
  getUsage(params: {
    startDate?: Date;
    endDate?: Date;
    project?: string;
    model?: string;
  }): Promise<Usage[]>;
}
```

### RealUsageClient

実際のGoogle Cloud APIから使用量を取得するクラス：

```typescript
class RealUsageClient {
  constructor(authManager: AuthManager);

  /**
   * 使用量データの取得（実API）
   */
  getUsage(params: {
    startDate?: Date;
    endDate?: Date;
    project?: string;
  }): Promise<Usage[]>;

  /**
   * 接続テスト
   */
  testConnections(): Promise<{
    logging: boolean;
    monitoring: boolean;
  }>;
}
```

### PriceUpdater

価格情報の更新を行うクラス：

```typescript
class PriceUpdater {
  /**
   * 価格情報の更新
   */
  updatePricing(): Promise<{
    geminiModels: number;
    vertexModels: number;
    updatedModels: number;
  }>;

  /**
   * 価格比較レポートの生成
   */
  generateComparisonReport(): Promise<string>;
}
```

**使用例:**
```typescript
import { PriceUpdater } from './services/calculator/priceUpdater.js';

const updater = new PriceUpdater();
const result = await updater.updatePricing();
console.log(`Updated ${result.updatedModels} models`);
```

## 📊 フォーマッター

### Formatter インターface

```typescript
interface Formatter {
  format(report: CostReport): string;
}
```

### TableFormatter

テーブル形式での出力：

```typescript
class TableFormatter implements Formatter {
  format(report: CostReport): string;
}
```

### JSONFormatter

JSON形式での出力：

```typescript
class JSONFormatter implements Formatter {
  format(report: CostReport): string;
}
```

### CSVFormatter

CSV形式での出力：

```typescript
class CSVFormatter implements Formatter {
  format(report: CostReport): string;
}
```

### ChartFormatter

チャート形式での出力：

```typescript
class ChartFormatter implements Formatter {
  format(report: CostReport): string;
}
```

**使用例:**
```typescript
import { TableFormatter } from './services/formatter/tableFormatter.js';

const formatter = new TableFormatter();
const output = formatter.format(report);
console.log(output);
```

## 🛠️ ユーティリティ関数

### 日付ユーティリティ

```typescript
/**
 * 日付範囲の検証
 */
export function validateDateRange(options: {
  period?: string;
  startDate?: string;
  endDate?: string;
}): DateRange;

/**
 * 日付のフォーマット
 */
export function formatDate(date: Date, format?: string): string;

/**
 * 相対日付の計算
 */
export function getRelativeDate(period: 'today' | 'week' | 'month'): DateRange;
```

**使用例:**
```typescript
import { validateDateRange, formatDate } from './utils/dateHelper.js';

const range = validateDateRange({
  period: 'custom',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

const formatted = formatDate(new Date(), 'YYYY-MM-DD');
```

### ロガー

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  constructor(level: LogLevel = LogLevel.INFO);
  
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}
```

**使用例:**
```typescript
import { Logger, LogLevel } from './utils/logger.js';

const logger = new Logger(LogLevel.DEBUG);
logger.info('Processing usage data');
logger.error('Failed to fetch data', error);
```

## ⚙️ 設定オプション

### 環境変数

```typescript
// 環境変数の取得
const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpKeyFile: process.env.GCP_KEY_FILE,
  currency: process.env.GEMINI_COST_CURRENCY || 'USD',
  useRealData: process.env.GEMINI_COST_USE_REAL_DATA === 'true'
};
```

### 設定ファイル形式

```typescript
interface Config {
  gemini: {
    apiKey: string;
  };
  gcp: {
    projectId: string;
    keyFile: string;
  };
  defaults: {
    currency: 'USD' | 'JPY';
    useRealData: boolean;
  };
}
```

## ❌ エラーハンドリング

### AppError の使用

```typescript
import { AppError } from './types/index.js';

// エラーの投げ方
throw new AppError(
  'VALIDATION_ERROR',
  'Invalid date format',
  { providedDate: 'invalid-date' }
);

// エラーのキャッチ
try {
  await someOperation();
} catch (error) {
  if (error instanceof AppError) {
    console.error(`${error.code}: ${error.message}`);
    console.error('Details:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### エラーコード一覧

| コード | 説明 |
|--------|------|
| `VALIDATION_ERROR` | 入力値の検証エラー |
| `AUTH_ERROR` | 認証エラー |
| `API_ERROR` | API通信エラー |
| `CONFIG_ERROR` | 設定エラー |
| `CALCULATION_ERROR` | 計算エラー |
| `FILE_ERROR` | ファイル操作エラー |
| `NETWORK_ERROR` | ネットワークエラー |

## 🔧 プログラマティックな使用例

### 基本的な使用例

```typescript
import { 
  AuthManager, 
  GeminiClient, 
  CostCalculator, 
  TableFormatter 
} from 'gemini-cost-tracker';

async function generateReport() {
  // 認証の初期化
  const authManager = new AuthManager();
  await authManager.initialize();

  // クライアントの作成
  const geminiClient = new GeminiClient(authManager);
  const calculator = new CostCalculator();
  const formatter = new TableFormatter();

  // データの取得
  const usage = await geminiClient.getUsage({
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31')
  });

  // レポートの生成
  const report = await calculator.generateReport(
    usage,
    { 
      startDate: new Date('2025-01-01'), 
      endDate: new Date('2025-01-31') 
    },
    'USD'
  );

  // 出力
  console.log(formatter.format(report));
}

generateReport().catch(console.error);
```

### カスタムフォーマッターの作成

```typescript
import { Formatter, CostReport } from 'gemini-cost-tracker';

class CustomFormatter implements Formatter {
  format(report: CostReport): string {
    const { summary } = report;
    return `Total Cost: $${summary.totalCost.toFixed(2)} (${summary.totalInputTokens + summary.totalOutputTokens} tokens)`;
  }
}

// 使用
const formatter = new CustomFormatter();
const output = formatter.format(report);
```

### バッチ処理の例

```typescript
import { 
  AuthManager, 
  GeminiClient, 
  VertexClient, 
  CostCalculator,
  CSVFormatter 
} from 'gemini-cost-tracker';

async function monthlyBatchProcess() {
  const authManager = new AuthManager();
  await authManager.initialize();

  const geminiClient = new GeminiClient(authManager);
  const vertexClient = new VertexClient(authManager);
  const calculator = new CostCalculator();
  const csvFormatter = new CSVFormatter();

  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');

  // 並列でデータ取得
  const [geminiUsage, vertexUsage] = await Promise.all([
    geminiClient.getUsage({ startDate, endDate }),
    vertexClient.getUsage({ startDate, endDate })
  ]);

  // データの統合
  const allUsage = [...geminiUsage, ...vertexUsage];

  // レポート生成
  const report = await calculator.generateReport(
    allUsage,
    { startDate, endDate },
    'USD'
  );

  // CSV出力
  const csvOutput = csvFormatter.format(report);
  
  // ファイルに保存
  await fs.writeFile('monthly-report.csv', csvOutput);
  
  return {
    totalRecords: allUsage.length,
    totalCost: report.summary.totalCost,
    reportFile: 'monthly-report.csv'
  };
}
```

## 📚 関連ドキュメント

- [使用方法ガイド](./usage.md)
- [トラブルシューティングガイド](./troubleshooting.md)
- [貢献ガイドライン](../CONTRIBUTING.md)