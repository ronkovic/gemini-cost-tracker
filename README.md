# gemini-cost-tracker

CLI tool to track token usage and costs for Gemini and Vertex AI

## 概要

gemini-cost-trackerは、Google CloudのGemini APIとVertex AIの利用状況とコストを簡単に追跡・確認できるコマンドラインツールです。

## 特徴

- 📊 トークン使用量の表示（入力・出力別）
- 💰 リアルタイムコスト計算（35+モデル対応）
- 📅 期間指定（今日・週・月・カスタム期間）
- 🔧 複数のフォーマット対応（テーブル・JSON・CSV・グラフ）
- 🌍 通貨変換対応（USD・JPY）
- 🔒 安全な認証情報管理
- 📝 構造化ログとエラーハンドリング
- ⚙️ 設定管理とバリデーション機能
- 🧪 リアルAPIデータとモックデータの両対応

## インストール

### npx使用（推奨）
```bash
npx gemini-cost-tracker@latest
```

### グローバルインストール
```bash
npm install -g gemini-cost-tracker
gemini-cost-tracker --help
```

## 初期設定

初回実行時に認証情報を設定してください：

```bash
npx gemini-cost-tracker@latest config
```

対話形式で以下の情報を入力します：
- Gemini API Key
- Google Cloud Project ID
- Google Cloud Service Account Key File（オプション）

### 環境変数での設定

環境変数でも認証情報を設定できます：

```bash
export GEMINI_API_KEY="your-api-key"
export GCP_PROJECT_ID="your-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# ログレベル設定（optional）
export LOG_LEVEL="INFO"  # ERROR, WARN, INFO, DEBUG
export LOG_FORMAT="text" # text, json
```

## 使用方法

### 基本的な使用例

```bash
# 今日の使用量を表示
npx gemini-cost-tracker@latest show

# 過去1週間の使用量を表示
npx gemini-cost-tracker@latest show --period week

# 過去1ヶ月の使用量を表示
npx gemini-cost-tracker@latest show --period month

# カスタム期間を指定
npx gemini-cost-tracker@latest show --period custom --start-date 2025-01-01 --end-date 2025-01-31
```

### フィルタリングオプション

```bash
# プロジェクト別に表示
npx gemini-cost-tracker@latest show --project my-project

# モデル別に表示
npx gemini-cost-tracker@latest show --model gemini-pro

# 日本円で表示
npx gemini-cost-tracker@latest show --currency JPY

# グラフ形式で表示
npx gemini-cost-tracker@latest show --format chart

# 週間データをグラフで表示
npx gemini-cost-tracker@latest show --period week --format chart
```

### データエクスポート

```bash
# JSONファイルにエクスポート
npx gemini-cost-tracker@latest export --format json --output usage-report.json

# CSVファイルにエクスポート
npx gemini-cost-tracker@latest export --format csv --output usage-report.csv

# 過去1ヶ月のデータをエクスポート
npx gemini-cost-tracker@latest export --period month --format json
```

## コマンドリファレンス

### `show` - 使用量とコストの表示

```bash
npx gemini-cost-tracker@latest show [options]
```

オプション：
- `-p, --period <period>`: 期間指定 (today|week|month|custom)
- `-s, --start-date <date>`: 開始日 (YYYY-MM-DD)
- `-e, --end-date <date>`: 終了日 (YYYY-MM-DD)
- `--project <project>`: プロジェクトID
- `--model <model>`: モデル名（35+モデルサポート）
- `-f, --format <format>`: 出力形式 (table|json|chart)
- `-c, --currency <currency>`: 通貨 (USD|JPY)
- `--real-data`: 実際のAPI使用データを取得（デフォルトはモックデータ）

### `export` - データのエクスポート

```bash
npx gemini-cost-tracker@latest export [options]
```

オプション：
- `-p, --period <period>`: 期間指定 (today|week|month|custom)
- `-s, --start-date <date>`: 開始日 (YYYY-MM-DD)
- `-e, --end-date <date>`: 終了日 (YYYY-MM-DD)
- `--project <project>`: プロジェクトID
- `--model <model>`: モデル名
- `-f, --format <format>`: エクスポート形式 (json|csv)
- `-o, --output <file>`: 出力ファイルパス
- `-c, --currency <currency>`: 通貨 (USD|JPY)

### `config` - 設定管理

```bash
npx gemini-cost-tracker@latest config [options]
```

オプション：
- `--set-gemini-key <key>`: Gemini APIキーを設定
- `--set-project <project>`: デフォルトプロジェクトIDを設定
- `--set-key-file <file>`: サービスアカウントキーファイルパスを設定
- `--show`: 現在の設定を表示

### `test` - 接続テスト

```bash
npx gemini-cost-tracker@latest test
```

認証情報とGoogle Cloud APIへの接続をテストします。

### `update-pricing` - 料金情報更新

```bash
npx gemini-cost-tracker@latest update-pricing [options]
```

オプション：
- `--dry`: プレビューモード（更新内容を表示のみ）
- `--report`: 料金比較レポートを生成
- `-o, --output <file>`: レポート出力ファイル

## サポート対象モデル（35+モデル）

### Gemini API Models
- **Gemini 2.5 Series**: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`
- **Gemini 2.0 Series**: `gemini-2.0-flash`, `gemini-2.0-flash-lite`
- **Gemini 1.5 Series**: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-1.5-flash-8b`
- **Classic Models**: `gemini-pro`, `gemini-pro-vision`
- **Extended Models**: `gemini-1.5-pro-extended`, `gemini-2.5-pro-extended`
- **Audio Models**: `gemini-2.5-flash-audio`, `gemini-2.5-flash-native-audio`
- **Specialized**: `gemini-2.5-flash-thinking`

### Vertex AI Models
- **PaLM 2 Text**: `text-bison-001`, `text-bison-002`
- **PaLM 2 Chat**: `chat-bison-001`, `chat-bison-002`
- **PaLM 2 Code**: `codechat-bison-001`, `codechat-bison-002`
- **Gemini on Vertex**: `gemini-1.5-pro-vertex`, `gemini-1.5-flash-vertex`, `gemini-2.5-pro-vertex`, `gemini-2.5-flash-vertex`

> 最新のモデル情報は `update-pricing` コマンドで自動更新されます。

## 料金情報

料金は2025年1月時点の公式価格に基づいて計算されます。最新の料金については、各サービスの公式ドキュメントをご確認ください。

- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)

## アーキテクチャ

リファクタリング後の新しいアーキテクチャ構成：

```
src/
├── types/index.ts          # 型定義とErrorCode列挙型（26+エラーコード）
├── utils/
│   ├── constants.ts        # アプリケーション定数
│   ├── errorHandler.ts     # 集約エラーハンドリング
│   ├── logger.ts          # 構造化ログシステム
│   └── validation.ts      # 入力バリデーション
└── services/
    └── config/
        └── configManager.ts # 設定管理システム
```

### 主な改善点
- ⚙️ **エラーハンドリングの統一**: 26種類のErrorCodeで一貫したエラー管理
- 📝 **構造化ログ**: JSON/テキスト形式、コンテキスト対応
- 🛡️ **入力バリデーション**: 包括的なパラメータ検証
- 📁 **設定管理**: ファイルベースの設定とデフォルト値管理

## トラブルシューティング

### 認証エラー
```
Error: AUTH_MISSING_GEMINI_KEY - Gemini API key not configured
```
→ `gemini-cost-tracker config`で認証情報を設定してください。

### プロジェクトアクセスエラー
```
Error: AUTH_MISSING_GCP_PROJECT - Google Cloud Project ID not configured
```
→ 正しいプロジェクトIDが設定されているか確認してください。

### APIエラー
- APIキーの権限を確認
- プロジェクトでのAPI有効化を確認
- 利用制限に達していないか確認

## 開発

### 要件
- Node.js 16.x以上
- TypeScript 5.x

### セットアップ
```bash
git clone https://github.com/username/gemini-cost-tracker.git
cd gemini-cost-tracker
npm install
npm run build
```

### 開発コマンド
```bash
npm run dev      # 開発モードで実行
npm run build    # ビルド
npm run test     # テスト実行
npm run lint     # リント
npm run format   # フォーマット
```

## ライセンス

MIT License

## 📚 ドキュメント

詳細な使用方法やトラブルシューティングについては、以下のドキュメントを参照してください：

- **[使用方法ガイド](./docs/usage.md)** - 詳細な使用方法と実用例
- **[APIリファレンス](./docs/api-reference.md)** - プログラマティックな使用方法
- **[トラブルシューティング](./docs/troubleshooting.md)** - よくある問題と解決方法
- **[貢献ガイドライン](./CONTRIBUTING.md)** - プロジェクトへの貢献方法

## 🤝 貢献

バグ報告や機能要望は、GitHubのIssuesからお願いします。プロジェクトへの貢献については、[貢献ガイドライン](./CONTRIBUTING.md)をご確認ください。

## 更新履歴

### v0.1.0
- 初回リリース
- 基本的な使用量表示機能
- コスト計算機能
- 設定管理機能
- データエクスポート機能