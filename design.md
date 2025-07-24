# 設計書

## アーキテクチャ概要

> **注意**: このドキュメントは2025年7月のリファクタリングにより大幅に更新されました。

## 🔄 リファクタリングの主な改善点

### 1. 型安全性の向上
- **ErrorCode列挙型**: 26種類のエラーコードで一貫したエラー管理
- **型エイリアス**: `Period`, `Format`, `Currency`, `Service`で型安全性向上
- **厳密な型チェック**: unknown型の減少と適切な型キャスト

### 2. エラーハンドリングの統一
- **ErrorHandlerクラス**: 集約エラー処理とファクトリーメソッド
- **withErrorHandling**: 非同期関数用エラーラッピング
- **一貫したエラーメッセージ**: コード付きエラーメッセージ

### 3. 構造化ログシステム
- **JSON/テキスト形式**: 環境変数で切り替え可能
- **コンテキスト対応**: ログに関連情報を含める
- **ログレベル制御**: ERROR, WARN, INFO, DEBUGの4段階

### 4. 設定管理の改善
- **ConfigManager**: ファイルベースの設定管理
- **デフォルト値管理**: アプリケーションレベルのデフォルト設定
- **環境変数フォールバック**: 設定ファイルと環境変数の統合

### 5. 入力バリデーション
- **ValidationUtils**: 包括的な入力検証ユーティリティ
- **型ガード関数**: TypeScriptの型システムと連携
- **早期バリデーション**: コマンド実行前のパラメータ検証

### システム構成図
```
┌─────────────────┐
│   CLI Entry     │
│  (index.ts)     │
└────────┬────────┘
         │
┌────────▼────────┐
│ Command Parser  │
│ (commander.js)  │
└────────┬────────┘
         │
┌────────▼────────┐
│  Core Services  │
├─────────────────┤
│ • Auth Manager  │
│ • API Client    │
│ • Cost Calc     │
│ • Data Format   │
└────────┬────────┘
         │
┌────────▼────────┐
│  External APIs  │
├─────────────────┤
│ • Gemini API    │
│ • Vertex AI     │
│ • Billing API   │
└─────────────────┘
```

## ディレクトリ構造（リファクタリング後）
```
gemini-cost-tracker/
├── src/
│   ├── index.ts              # CLIエントリーポイント
│   ├── commands/             # コマンド実装
│   │   ├── show.ts          # 表示コマンド
│   │   ├── export.ts        # エクスポートコマンド
│   │   ├── config.ts        # 設定コマンド
│   │   ├── test.ts          # 接続テストコマンド
│   │   └── updatePricing.ts # 料金情報更新コマンド
│   ├── services/            # ビジネスロジック
│   │   ├── auth/            # 認証関連
│   │   │   └── authManager.ts   # 認証管理
│   │   ├── config/          # 設定管理 ← 新設！
│   │   │   └── configManager.ts # 設定ファイル管理
│   │   ├── api/             # API通信
│   │   │   ├── geminiClient.ts  # Gemini APIクライアント
│   │   │   ├── vertexClient.ts  # Vertex AIクライアント
│   │   │   └── realUsageClient.ts # 実際API使用データ取得
│   │   │   ├── calculator/      # コスト計算
│   │   │   ├── costCalculator.ts # コスト計算エンジン
│   │   │   ├── priceTable.ts     # 料金テーブル
│   │   │   └── priceUpdater.ts   # 料金情報更新
│   │   └── formatter/       # データ整形
│   │       ├── tableFormatter.ts
│   │       ├── csvFormatter.ts
│   │       ├── jsonFormatter.ts
│   │       └── chartFormatter.ts # グラフ表示
│   ├── utils/               # ユーティリティ ← 大幅強化！
│   │   ├── constants.ts     # アプリケーション定数 ← 新設！
│   │   ├── errorHandler.ts  # 集約エラーハンドリング ← 新設！
│   │   ├── logger.ts        # 構造化ログシステム ← 強化！
│   │   ├── validation.ts    # 入力バリデーション ← 新設！
│   │   ├── dateHelper.ts    # 日付ユーティリティ
│   │   └── validator.ts     # 既存バリデータ（互換性のため保持）
│   └── types/               # TypeScript型定義 ← 大幅強化！
│       └── index.ts         # 型エイリアス、ErrorCode列挙型、統合インターフェース
├── tests/                   # テスト
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── bin/                     # 実行可能ファイル
│   └── gemini-cost-tracker
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── README.md
├── tasks.md
├── requirements.md
└── design.md
```

## 主要コンポーネント設計

### 1. CLI Entry Point (index.ts)
```typescript
// リファクタリング後の型定義
type Period = 'today' | 'week' | 'month' | 'custom';
type Format = 'table' | 'json' | 'csv' | 'chart';
type Currency = 'USD' | 'JPY';
type Service = 'gemini' | 'vertex-ai';

interface CLIOptions {
  period?: Period;
  startDate?: string;
  endDate?: string;
  project?: string;
  model?: string;
  format?: Format;
  output?: string;
  currency?: Currency;
  realData?: boolean; // 新追加！
}
```

## 🔄 リファクタリング後の新コンポーネント

### 1. ErrorHandler (集約エラー管理)
```typescript
enum ErrorCode {
  INVALID_CONFIG = 'INVALID_CONFIG',
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  // ... 26種類のエラーコード
}

class ErrorHandler {
  static handle(error: unknown, context?: Record<string, unknown>): AppError;
  static createValidationError(message: string, details?: unknown): AppError;
  static createAuthError(message?: string, details?: unknown): AppError;
  static createNetworkError(message?: string, details?: unknown): AppError;
}

// ラッパー関数
function withErrorHandling<T>(
  fn: (...args: any[]) => Promise<T>,
  context?: Record<string, unknown>
): (...args: any[]) => Promise<T>;
```

### 2. ConfigManager (設定管理)
```typescript
interface ConfigFile {
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

class ConfigManager {
  async loadConfig(): Promise<ConfigFile>;
  async saveConfig(config: ConfigFile): Promise<void>;
  async updateConfig(updates: Partial<ConfigFile>): Promise<ConfigFile>;
  
  // デフォルト値管理
  async getDefaultCurrency(): Promise<Currency>;
  async setDefaultCurrency(currency: Currency): Promise<void>;
  async getDefaultFormat(): Promise<Format>;
  async setDefaultFormat(format: Format): Promise<void>;
  
  // 認証情報管理
  async getGeminiApiKey(): Promise<string | undefined>;
  async setGeminiApiKey(apiKey: string): Promise<void>;
  async getGcpProjectId(): Promise<string | undefined>;
  async setGcpProjectId(projectId: string): Promise<void>;
}
```

### 3. Logger (構造化ログ)
```typescript
enum LogLevel {
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
  setLevel(level: LogLevel): void;
  setFormat(format: 'json' | 'text'): void;
  
  error(message: string, context?: Record<string, unknown>, error?: Error): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  
  // アプリエラー用
  appError(message: string, code: ErrorCode, error?: Error, context?: Record<string, unknown>): void;
}
```

### 4. ValidationUtils (入力バリデーション)
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
  static validateCliOptions(options: CLIOptions): void;
  
  // ユーティリティ
  static sanitizeInput(input: string): string;
  static isValidEmail(email: string): boolean;
  static isValidUrl(url: string): boolean;
}
```

### 2. Authentication Manager
```typescript
interface AuthCredentials {
  geminiApiKey?: string;
  gcpProjectId?: string;
  gcpKeyFile?: string;
}

class AuthManager {
  // 設定ファイルの保存場所（XDG Base Directory準拠）
  // - macOS/Linux: ~/.config/gemini-cost-tracker/config.json
  // - XDG_CONFIG_HOME設定時: $XDG_CONFIG_HOME/gemini-cost-tracker/config.json
  // - Windows: %APPDATA%\gemini-cost-tracker\config.json
  
  async initialize(): Promise<void>;
  async getGeminiCredentials(): Promise<string>;
  async getVertexCredentials(): Promise<GoogleAuth>;
  async validateCredentials(): Promise<boolean>;
  
  // 設定値の個別更新（既存値を保持）
  async setGeminiApiKey(apiKey: string): Promise<void>;
  async setGcpProjectId(projectId: string): Promise<void>;
  async setGcpKeyFile(keyFile: string): Promise<void>;
}
```

### 3. API Clients
```typescript
interface UsageData {
  date: Date;
  inputTokens: number;
  outputTokens: number;
  model: string;
  project?: string;
}

interface APIClient {
  async getUsage(params: UsageParams): Promise<UsageData[]>;
}

class GeminiClient implements APIClient {
  // Gemini API実装
}

class VertexClient implements APIClient {
  // Vertex AI API実装
}
```

### 4. Cost Calculator
```typescript
interface PriceModel {
  inputTokenPrice: number;
  outputTokenPrice: number;
  currency: 'USD' | 'JPY';
  model: string;
}

class CostCalculator {
  calculateCost(usage: UsageData, priceModel: PriceModel): Cost;
  convertCurrency(amount: number, from: string, to: string): number;
}
```

### 5. Data Formatters
```typescript
interface Formatter {
  format(data: CostReport): string;
}

class TableFormatter implements Formatter {
  // ターミナルテーブル表示
  // Usage Details は降順表示（最新が上）
  // v0.1.2以降: sortedDetails = [...data.details].sort((a, b) => b.date.getTime() - a.date.getTime())
}

class CSVFormatter implements Formatter {
  // CSV形式出力
}

class JSONFormatter implements Formatter {
  // JSON形式出力
}
```

## データモデル

### Usage Model
```typescript
interface Usage {
  id: string;
  timestamp: Date;
  service: 'gemini' | 'vertex-ai';
  model: string;
  inputTokens: number;
  outputTokens: number;
  project?: string;
  region?: string;
}
```

### Cost Model
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

### Report Model
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

## API設計

### Gemini API Integration
- エンドポイント: `https://generativelanguage.googleapis.com/v1/`
- 認証: APIキー
- レート制限対応: exponential backoff

### Vertex AI Integration
- エンドポイント: リージョン別
- 認証: サービスアカウント or ADC
- ページネーション対応

### Billing API Integration
- Cloud Billing API v1
- コスト情報の取得
- 予算アラート情報

## エラーハンドリング

### エラー種別
1. **認証エラー**
   - APIキー無効
   - 権限不足
   - 認証情報未設定

2. **API通信エラー**
   - ネットワークエラー
   - タイムアウト
   - レート制限

3. **データエラー**
   - 不正なデータ形式
   - 期間指定エラー
   - データ不足

### エラー処理フロー
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// エラーハンドラー
function handleError(error: AppError): void {
  logger.error(error);
  
  switch (error.code) {
    case 'AUTH_ERROR':
      console.error('認証エラー:', error.message);
      console.log('認証情報を確認してください');
      break;
    case 'API_ERROR':
      console.error('API通信エラー:', error.message);
      break;
    default:
      console.error('エラー:', error.message);
  }
  
  process.exit(1);
}
```

## セキュリティ設計

### 認証情報の管理
1. 環境変数での管理
2. dotenvファイルの使用（.gitignore必須）
3. キーチェーンへの保存（オプション）

### APIキーの保護
```typescript
// マスキング表示
function maskApiKey(key: string): string {
  if (key.length < 8) return '***';
  return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}
```

## パフォーマンス最適化

### キャッシング戦略
1. API結果の一時キャッシュ（TTL: 5分）
2. 料金表のローカルキャッシュ
3. 認証トークンのキャッシュ

### 並列処理
```typescript
// 複数APIの並列呼び出し
async function fetchAllUsage(params: UsageParams): Promise<UsageData[]> {
  const [geminiData, vertexData] = await Promise.all([
    geminiClient.getUsage(params),
    vertexClient.getUsage(params)
  ]);
  
  return [...geminiData, ...vertexData];
}
```

## テスト戦略

### 単体テスト
- 各サービスクラスのテスト
- コスト計算ロジックのテスト
- フォーマッターのテスト

### 統合テスト
- CLI コマンドのE2Eテスト
- APIモックを使用した統合テスト

### テストカバレッジ目標
- 単体テスト: 80%以上
- 統合テスト: 主要シナリオ100%

## CI/CD設計

### GitHub Actions
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    # テスト実行
  build:
    # ビルド
  publish:
    # npm publish (タグプッシュ時)
```

## バージョニング戦略
- セマンティックバージョニング採用
- Breaking changes: メジャーバージョン
- 新機能: マイナーバージョン
- バグ修正: パッチバージョン