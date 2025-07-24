# 貢献ガイドライン

gemini-cost-trackerプロジェクトへの貢献にご興味をお持ちいただき、ありがとうございます！このドキュメントでは、プロジェクトに貢献するためのガイドラインと手順について説明します。

> **重要**: 2025年7月に大規模なリファクタリングが実施され、アーキテクチャとコーディング規約が大幅に変更されました。リファクタリング後の新しいコードベースに合わせた最新のガイドラインです。

## 📋 目次
- [貢献の種類](#貢献の種類)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [貢献フロー](#貢献フロー)
- [コーディング規約](#コーディング規約)
- [テスト](#テスト)
- [コミットメッセージ](#コミットメッセージ)
- [プルリクエスト](#プルリクエスト)
- [Issue報告](#issue報告)
- [リリースプロセス](#リリースプロセス)

## 🤝 貢献の種類

以下のような貢献を歓迎します：

### 🐛 バグ報告
- バグや問題の報告
- 再現手順の提供
- 修正案の提案

### 💡 機能提案
- 新機能のアイデア
- 既存機能の改善案
- ユーザビリティの向上案

### 📝 ドキュメント
- ドキュメントの改善
- 使用例の追加
- 翻訳（日本語↔英語）

### 🔧 コード貢献
- バグ修正
- 新機能の実装
- パフォーマンス改善
- リファクタリング

### 🧪 テスト
- テストケースの追加
- テストカバレッジの改善
- テストの安定化

## 🛠️ 開発環境のセットアップ

### 必要なツール

- **Node.js**: 18.x以上（推奨: 20.x）
- **npm**: 9.x以上
- **Git**: 2.x以上
- **エディタ**: VS Code推奨（設定ファイル含む）

### セットアップ手順

1. **リポジトリのフォーク**
   ```bash
   # GitHubでフォークを作成後
   git clone https://github.com/your-username/gemini-cost-tracker.git
   cd gemini-cost-tracker
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **開発用設定**
   ```bash
   # 設定ファイルのコピー
   cp .env.example .env
   
   # 認証情報の設定（テスト用）
   npm run config:setup
   ```

4. **ビルドとテストの実行**
   ```bash
   # TypeScript ビルド
   npm run build
   
   # 全テストの実行
   npm test
   
   # リンターの実行
   npm run lint
   
   # フォーマッターの実行
   npm run format
   
   # 型チェックの実行
   npm run type-check
   
   # CIコマンド（ビルド前チェック）
   npm run ci
   ```

5. **開発サーバーの起動**
   ```bash
   # 開発モードで実行
   npm run dev
   ```

### VS Code設定

推奨拡張機能：
- TypeScript and JavaScript Language Features
- ESLint
- Prettier - Code formatter
- Jest
- GitLens

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "jest.autoEnable": true
}
```

## 🔄 貢献フロー

### 1. Issue の作成

新機能やバグ修正を始める前に、Issue を作成してください：

```bash
# バグ報告の場合
- Bug report テンプレートを使用
- 再現手順を詳細に記述
- 環境情報を含める

# 機能提案の場合
- Feature request テンプレートを使用
- 使用ケースを明確に説明
- 実装案があれば提案
```

### 2. ブランチの作成

```bash
# 最新のmainブランチから作成
git checkout main
git pull origin main

# 機能ブランチの作成
git checkout -b feature/add-new-formatter
git checkout -b fix/auth-token-validation
git checkout -b docs/update-usage-guide
```

**ブランチ命名規則:**
- `feature/機能名`: 新機能
- `fix/修正内容`: バグ修正
- `docs/文書名`: ドキュメント更新
- `test/テスト内容`: テスト追加・修正
- `refactor/リファクタ内容`: リファクタリング

### 3. 開発とテスト

```bash
# 開発中の継続的なテスト実行
npm run test:watch

# コードの品質チェック
npm run lint
npm run type-check

# 全体テストの実行
npm run ci
```

### 4. コミット

```bash
# ステージング
git add .

# コミット（Conventional Commitsに従う）
git commit -m "feat: add CSV export formatter

- Add CSVFormatter class
- Support custom delimiter options
- Add CSV export tests
- Update documentation

Closes #123"
```

### 5. プッシュとプルリクエスト

```bash
# フォークリポジトリにプッシュ
git push origin feature/add-new-formatter

# GitHub上でプルリクエストを作成
```

## 📏 コーディング規約（リファクタリング後）

### 🏠 新しいアーキテクチャ規約

リファクタリングにより新しいアーキテクチャルールが導入されました：

#### 1. エラーハンドリング
```typescript
// ✅ 新しいエラーハンドリングパターン
import { ErrorHandler, ErrorCode } from '../utils/errorHandler.js';

// エラーをスローする場合
throw new AppError(ErrorCode.VALIDATION_ERROR, '無効な入力です');

// エラーをキャッチして変換する場合
const appError = ErrorHandler.handle(error, { context: 'userAction', userId: '123' });

// 非同期関数のラッピング
const safeFunction = withErrorHandling(riskyAsyncFunction, { operation: 'dataFetch' });
```

#### 2. ログ出力
```typescript
// ✅ 構造化ログの使用
import { logger } from '../utils/logger.js';

// 情報ログ（コンテキスト付き）
logger.info('ユーザーデータを取得中', { userId: user.id, operation: 'fetchData' });

// エラーログ
logger.error('データベース接続エラー', { database: 'users' }, error);

// アプリエラー
logger.appError('認証失敗', ErrorCode.AUTH_ERROR, error, { userId: user.id });

// ❌ 禁止：直接console使用
console.log('Debug info'); // これはNG！
```

#### 3. バリデーション
```typescript
// ✅ ValidationUtilsの使用
import { ValidationUtils } from '../utils/validation.js';

// CLIオプションのバリデーション
ValidationUtils.validateCliOptions(options);

// 型ガード関数の使用
if (ValidationUtils.isValidCurrency(input)) {
  // inputはここでCurrency型として扱われる
  await setCurrency(input);
}
```

#### 4. 設定管理
```typescript
// ✅ ConfigManagerの使用
import { ConfigManager } from '../services/config/configManager.js';

const configManager = new ConfigManager();
const defaultCurrency = await configManager.getDefaultCurrency();
await configManager.setDefaultCurrency('JPY');

// ❌ 禁止：直接ファイル操作
// const config = JSON.parse(fs.readFileSync('config.json', 'utf8')); // NG！
```

### TypeScript

```typescript
// ✅ 良い例
interface UserOptions {
  readonly name: string;
  readonly age?: number;
}

class UserManager {
  private readonly users: Map<string, User> = new Map();

  public async getUser(id: string): Promise<User | null> {
    // 実装
  }
}

// ❌ 悪い例
interface userOptions {
  name: string;
  age: number;
}

class userManager {
  users: any = {};
  
  getUser(id) {
    // 実装
  }
}
```

### 命名規則

```typescript
// クラス名: PascalCase
class CostCalculator {}

// 関数・変数名: camelCase
const calculateTotalCost = () => {};
const userApiKey = 'abc123';

// 定数: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_CURRENCY = 'USD';

// ファイル名: camelCase
// costCalculator.ts
// apiClient.ts

// インターface: PascalCase
interface CostReport {}
interface ApiResponse {}
```

### コードスタイル

```typescript
// インポートの順序
import { readFile } from 'fs/promises';  // Node.js標準
import axios from 'axios';               // サードパーティ
import { Logger } from '../utils/logger.js';  // 相対パス

// エクスポート
export class MyClass {}
export { helper } from './helper.js';

// 型アノテーション
const users: User[] = [];
const config: Config = loadConfig();

// エラーハンドリング
try {
  const result = await apiCall();
  return result;
} catch (error) {
  logger.error('API call failed', { error });
  throw new AppError('API_ERROR', 'Failed to fetch data');
}
```

### ESLint設定

プロジェクトの`.eslintrc.js`設定に従ってください：

```bash
# リンターの実行
npm run lint

# 自動修正
npm run lint:fix
```

## 🧪 テスト

### テスト種類

1. **単体テスト** (`tests/unit/`)
   ```typescript
   describe('CostCalculator', () => {
     it('should calculate cost correctly', () => {
       const calculator = new CostCalculator();
       const cost = calculator.calculateCost(mockUsage, 'USD');
       expect(cost.totalCost).toBe(1.25);
     });
   });
   ```

2. **統合テスト** (`tests/integration/`)
   ```typescript
   describe('API Integration', () => {
     it('should fetch and calculate costs end-to-end', async () => {
       const result = await fullWorkflow();
       expect(result.summary.totalCost).toBeGreaterThan(0);
     });
   });
   ```

3. **CLIテスト** (`tests/cli/`)
   ```bash
   # CLI統合テスト
   npm run test:integration
   ```

### テスト実行

```bash
# 全テスト実行
npm test

# 監視モード
npm run test:watch

# カバレッジ付き
npm run test:coverage

# 特定のテストファイル
npm test -- costCalculator.test.ts

# 特定のテストケース
npm test -- --testNamePattern="should calculate cost"
```

### テスト作成ガイドライン

```typescript
// ✅ 良いテスト
describe('validateDateRange', () => {
  it('should return valid date range for today period', () => {
    const result = validateDateRange({ period: 'today' });
    
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(result.endDate.getTime()).toBeGreaterThan(result.startDate.getTime());
  });

  it('should throw error for invalid period', () => {
    expect(() => {
      validateDateRange({ period: 'invalid' });
    }).toThrow('Invalid period');
  });
});

// ❌ 悪いテスト
it('should work', () => {
  const result = doSomething();
  expect(result).toBeTruthy();
});
```

## 📝 コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/)に従ってください：

### 形式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 例

```bash
# 新機能
feat: add CSV export functionality

Add CSVFormatter class with support for custom delimiters
and proper escaping of special characters.

Closes #123

# バグ修正
fix(auth): handle expired API keys gracefully

Previously, expired API keys would cause the application to crash.
Now we catch the error and prompt for re-authentication.

Fixes #456

# ドキュメント
docs: update installation instructions

Add Docker installation method and troubleshooting section
for common installation issues.

# リファクタリング
refactor(calculator): extract price lookup logic

Move price lookup logic to separate PriceService class
to improve testability and separation of concerns.

# テスト
test: add edge cases for date validation

Add tests for leap years, timezone boundaries, and
invalid date formats.
```

### Type一覧

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル（機能に影響しない）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他（ビルド、設定など）
- `perf`: パフォーマンス改善
- `ci`: CI/CD関連

## 🔄 プルリクエスト

### PRの作成前チェックリスト

- [ ] Issue が存在し、関連付けされている
- [ ] ブランチ名が命名規則に従っている
- [ ] コードがリンターを通過する
- [ ] 全テストがパスする
- [ ] 新機能にはテストが含まれている
- [ ] ドキュメントが更新されている
- [ ] CHANGELOGが更新されている（機能追加・重要な変更の場合）

### PR作成

1. **適切なテンプレートを使用**
   - 機能追加、バグ修正、ドキュメント更新など

2. **詳細な説明を記述**
   ```markdown
   ## 変更内容
   CSVエクスポート機能を追加しました。

   ## 変更点
   - CSVFormatterクラスの追加
   - カスタム区切り文字のサポート
   - 特殊文字のエスケープ処理
   - CSV出力のテスト追加

   ## テスト
   - [ ] 単体テスト追加
   - [ ] 統合テスト実行
   - [ ] 手動テスト完了

   ## 関連Issue
   Closes #123
   ```

3. **レビューアーの指定**
   - メンテナーまたは関連分野の専門家

### PRレビュープロセス

1. **自動チェック**
   - CI/CDパイプラインの成功
   - コードカバレッジの維持
   - セキュリティスキャンの通過

2. **コードレビュー**
   - 機能的な正確性
   - コード品質
   - 設計の一貫性
   - パフォーマンスへの影響

3. **承認とマージ**
   - 1名以上のメンテナーによる承認
   - 全チェックの通過
   - Squash and mergeでマージ

## 🐛 Issue報告

### バグ報告

適切なテンプレートを使用して以下を含めてください：

```markdown
## 環境情報
- OS: macOS 13.0
- Node.js: 18.17.0
- Package Version: 0.1.0

## 現象
コマンド実行時にエラーが発生する

## 再現手順
1. `gemini-cost-tracker show --period today` を実行
2. 認証情報が正しく設定されている
3. エラーが発生

## 期待する動作
今日の使用量が表示される

## 実際の動作
Error: Network connection failed

## 追加情報
企業ネットワーク環境で実行
```

### 機能提案

```markdown
## 機能の概要
Excel形式でのエクスポート機能

## 動機
既存のCSV出力をExcelで開くと文字化けが発生するため、
直接.xlsx形式で出力できると便利。

## 提案する実装
- ExcelFormatterクラスの追加
- xlsx ライブラリの使用
- スタイル設定のサポート

## 代替案
- CSV出力の改善（BOM付きUTF-8）
- Excelテンプレートの提供
```

## 🚀 リリースプロセス

### バージョニング

[Semantic Versioning](https://semver.org/)に従います：

- `MAJOR`: 破壊的変更
- `MINOR`: 新機能（後方互換性あり）
- `PATCH`: バグ修正

### リリース手順

1. **CHANGELOG.mdの更新**
   ```markdown
   ## [1.2.0] - 2025-01-15
   
   ### Added
   - CSV export functionality
   - Custom delimiter support
   
   ### Fixed
   - Authentication token validation
   - Date parsing edge cases
   
   ### Changed
   - Improved error messages
   ```

2. **バージョンの更新**
   ```bash
   npm version minor  # 1.1.0 -> 1.2.0
   ```

3. **タグの作成とプッシュ**
   ```bash
   git push origin main --tags
   ```

4. **自動リリース**
   - GitHub Actionsが自動実行
   - npm パッケージの公開
   - GitHub Releaseの作成
   - Docker イメージのビルド

## 🎯 貢献のベストプラクティス

### 小さな変更から始める

```bash
# 良い例：小さく明確な変更
- タイポの修正
- ドキュメントの改善
- 単一の小さなバグ修正

# 避ける例：大きすぎる変更
- 複数の機能を含む巨大なPR
- アーキテクチャの大幅な変更
- 複数の無関係な修正
```

### コミュニケーション

1. **Issue での議論**
   - 実装前に方向性を確認
   - 設計についてフィードバックを求める

2. **Draft PR の活用**
   - 作業中の内容を早期に共有
   - フィードバックを受けながら開発

3. **レビューでの建設的な対話**
   - 疑問点があれば積極的に質問
   - 提案された変更の理由を理解する

### 継続的な貢献

1. **定期的な貢献**
   - 小さな改善を継続的に提供
   - コミュニティの議論に参加

2. **専門分野での貢献**
   - 得意分野（UI/UX、パフォーマンス、セキュリティなど）での貢献
   - 特定の機能領域の専門家になる

3. **メンターシップ**
   - 新しい貢献者のサポート
   - Issue のトリアージ支援

## 📄 ライセンスと著作権

### ライセンス同意

このプロジェクトに貢献することで、以下に同意したものとみなされます：

1. **ライセンス継承**: あなたの貢献は MIT License の下で公開されます
2. **著作権の帰属**: 貢献された内容の著作権は ronkovic に帰属します
3. **ライセンス条項の遵守**: MIT License の条項を理解し、遵守します

### 著作権ガイドライン

```typescript
// ✅ 新しいファイルを作成する場合
/**
 * Copyright (c) 2025 ronkovic
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// 既存ファイルの修正の場合はヘッダー追加不要
```

### 第三者コードの使用

- 他のライセンスのコードを含める場合は事前に相談
- Stack Overflow などのコードスニペット使用時は出典を明記
- MIT Compatible なライセンスのみ受け入れ可能

### ライセンス違反の報告

もしライセンス違反を発見した場合は、GitHub Issues で報告してください。

## 📞 サポートとコミュニケーション

### 連絡先

- **GitHub Issues**: バグ報告・機能提案
- **GitHub Discussions**: 一般的な質問・議論
- **Email**: メンテナー直接連絡用

### コードオブコンダクト

すべての貢献者は、礼儀正しく建設的なコミュニケーションを心がけてください：

- 他の参加者を尊重する
- 建設的なフィードバックを提供する
- 異なる意見や経験レベルを歓迎する
- プロジェクトの目標に焦点を当てる

## 🙏 謝辞

このプロジェクトへの貢献に感謝します！あなたの貢献が、多くのユーザーの体験向上に繋がります。

質問や不明な点がございましたら、お気軽にIssueを作成するか、メンテナーまで直接ご連絡ください。

---

*このガイドラインは継続的に改善されます。フィードバックや提案があれば、ぜひお聞かせください！*