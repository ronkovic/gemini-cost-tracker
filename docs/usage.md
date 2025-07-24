# 使用方法ガイド

## 📋 目次
- [インストール](#インストール)
- [初期設定](#初期設定)
- [基本的な使用方法](#基本的な使用方法)
- [コマンドリファレンス](#コマンドリファレンス)
- [設定オプション](#設定オプション)
- [出力フォーマット](#出力フォーマット)
- [使用例とシナリオ](#使用例とシナリオ)

## 🚀 インストール

### NPM経由でのインストール

```bash
# グローバルインストール
npm install -g gemini-cost-tracker

# または npx での一時実行
npx gemini-cost-tracker@latest --help
```

### Docker経由での使用

```bash
# Docker Hub からプル
docker pull your-username/gemini-cost-tracker

# 実行
docker run --rm -v ~/.config/gemini-cost-tracker:/app/.config gemini-cost-tracker --help
```

## ⚙️ 初期設定

### 1. 認証情報の設定

最初に認証情報を設定する必要があります：

```bash
gemini-cost-tracker config --setup
```

このコマンドを実行すると、以下の情報の入力を求められます：

- **Gemini API Key**: Google AI Studio で取得したAPIキー
- **GCP Project ID**: Google Cloud Platform のプロジェクID
- **GCP Service Account Key**: サービスアカウントキーファイルのパス

### 2. 設定の確認

```bash
gemini-cost-tracker config --show
```

### 3. 接続テスト

```bash
gemini-cost-tracker test
```

## 📖 基本的な使用方法

### コストと使用量の表示

```bash
# 今日の使用量とコストを表示
gemini-cost-tracker show --period today

# 過去7日間の使用量を表示
gemini-cost-tracker show --period week

# 特定の期間を指定
gemini-cost-tracker show --period custom --start-date 2025-01-01 --end-date 2025-01-15
```

### データのエクスポート

```bash
# JSON形式でエクスポート
gemini-cost-tracker export --format json --output usage-report.json

# CSV形式でエクスポート
gemini-cost-tracker export --format csv --output usage-report.csv
```

## 📚 コマンドリファレンス

### `show` - 使用量とコストの表示

```bash
gemini-cost-tracker show [options]
```

**オプション:**
- `--period <period>`: 期間指定 (today, week, month, custom)
- `--start-date <date>`: 開始日 (YYYY-MM-DD形式)
- `--end-date <date>`: 終了日 (YYYY-MM-DD形式)
- `--service <service>`: サービス指定 (gemini, vertex-ai)
- `--model <model>`: モデル指定
- `--project <project>`: プロジェクト指定
- `--format <format>`: 出力形式 (table, json, csv, chart)
- `--currency <currency>`: 通貨指定 (USD, JPY)

**使用例:**
```bash
# 今週のGeminiの使用量を表示
gemini-cost-tracker show --period week --service gemini

# 特定のモデルの使用量をJSONで表示
gemini-cost-tracker show --model gemini-2.5-pro --format json

# 特定のプロジェクトの月次レポートをチャート形式で表示
gemini-cost-tracker show --period month --project my-project --format chart
```

### `export` - データのエクスポート

```bash
gemini-cost-tracker export [options]
```

**オプション:**
- `--output <file>`: 出力ファイル名
- `--format <format>`: 出力形式 (json, csv)
- その他のオプションは `show` コマンドと同じ

**使用例:**
```bash
# 月次レポートをCSVでエクスポート
gemini-cost-tracker export --period month --format csv --output monthly-report.csv

# 特定期間のJSONレポートをエクスポート
gemini-cost-tracker export --start-date 2025-01-01 --end-date 2025-01-31 --format json --output january-report.json
```

### `config` - 設定管理

```bash
gemini-cost-tracker config [options]
```

**オプション:**
- `--setup`: 初期設定を行う
- `--show`: 現在の設定を表示
- `--reset`: 設定をリセット

### `test` - 接続テスト

```bash
gemini-cost-tracker test [options]
```

**オプション:**
- `--verbose`: 詳細な出力を表示

### `update-pricing` - 価格情報の更新

```bash
gemini-cost-tracker update-pricing [options]
```

**オプション:**
- `--dry`: ドライラン（実際には更新しない）
- `--report`: 価格比較レポートを生成
- `--output <file>`: レポートの出力先

## ⚙️ 設定オプション

### 設定ファイルの場所

設定ファイルは以下の場所に保存されます：
- **macOS**: `~/Library/Application Support/gemini-cost-tracker/config.json`
- **Linux**: `~/.config/gemini-cost-tracker/config.json`
- **Windows**: `%APPDATA%\\gemini-cost-tracker\\config.json`

### 設定項目

```json
{
  "gemini": {
    "apiKey": "your-gemini-api-key"
  },
  "gcp": {
    "projectId": "your-gcp-project-id",
    "keyFile": "/path/to/service-account-key.json"
  },
  "defaults": {
    "currency": "USD",
    "useRealData": false
  }
}
```

### 環境変数

以下の環境変数で設定を上書きできます：

```bash
export GEMINI_API_KEY="your-api-key"
export GCP_PROJECT_ID="your-project-id"
export GCP_KEY_FILE="/path/to/key.json"
export GEMINI_COST_CURRENCY="JPY"
export GEMINI_COST_USE_REAL_DATA="true"
```

## 📊 出力フォーマット

### Table形式（デフォルト）

```
📊 Cost Report (2025-01-01 to 2025-01-31)

📈 Summary
┌─────────────────────┬──────────┐
│ Total Input Tokens  │ 125,000  │
│ Total Output Tokens │ 85,000   │
│ Total Cost          │ $15.50   │
└─────────────────────┴──────────┘

🔧 Service Breakdown
┌────────────┬─────────────┬─────────────┬───────────┐
│ Service    │ Input       │ Output      │ Cost      │
├────────────┼─────────────┼─────────────┼───────────┤
│ gemini     │ 75,000      │ 50,000      │ $9.25     │
│ vertex-ai  │ 50,000      │ 35,000      │ $6.25     │
└────────────┴─────────────┴─────────────┴───────────┘
```

### JSON形式

```json
{
  "period": {
    "start": "2025-01-01T00:00:00.000Z",
    "end": "2025-01-31T23:59:59.000Z"
  },
  "summary": {
    "totalInputTokens": 125000,
    "totalOutputTokens": 85000,
    "totalTokens": 210000,
    "totalCost": 15.50,
    "currency": "USD"
  },
  "details": [
    {
      "date": "2025-01-15T10:30:00.000Z",
      "service": "gemini",
      "model": "gemini-2.5-pro",
      "usage": {
        "id": "usage-1",
        "inputTokens": 2000,
        "outputTokens": 1000,
        "project": "my-project",
        "region": "us-central1"
      },
      "cost": {
        "inputCost": 0.25,
        "outputCost": 0.375,
        "totalCost": 0.625,
        "currency": "USD"
      }
    }
  ]
}
```

### CSV形式

```csv
Date,Service,Model,Usage ID,Input Tokens,Output Tokens,Total Tokens,Input Cost,Output Cost,Total Cost,Currency,Project,Region
2025-01-15 10:30:00,gemini,gemini-2.5-pro,usage-1,2000,1000,3000,0.250000,0.375000,0.625000,USD,my-project,us-central1
```

### Chart形式

```
📊 Cost Report (2025-01-01 to 2025-01-31)

📈 Daily Cost Trend
    15.50 ┤                                              ╭─
    14.00 ┤                                        ╭─────╯
    12.50 ┤                                  ╭─────╯
    11.00 ┤                            ╭─────╯
     9.50 ┤                      ╭─────╯
     8.00 ┤                ╭─────╯
     6.50 ┤          ╭─────╯
     5.00 ┤    ╭─────╯
     3.50 ┤╭───╯
     2.00 ┼╯
          └┬────┬────┬────┬────┬────┬────┬────┬────┬────┬
           01   05   10   15   20   25   30
```

## 🎯 使用例とシナリオ

### シナリオ1: 月次コスト分析

```bash
# 1. 先月の全体的な使用量を確認
gemini-cost-tracker show --period month --format table

# 2. サービス別の詳細分析
gemini-cost-tracker show --period month --service gemini --format json > gemini-monthly.json
gemini-cost-tracker show --period month --service vertex-ai --format json > vertex-monthly.json

# 3. CSVでエクスポートして詳細分析
gemini-cost-tracker export --period month --format csv --output monthly-detailed.csv
```

### シナリオ2: プロジェクト別コスト追跡

```bash
# 特定のプロジェクトの使用量を追跡
gemini-cost-tracker show --project production-app --period week --format chart

# 複数プロジェクトの比較用にデータエクスポート
gemini-cost-tracker export --project production-app --format csv --output production-costs.csv
gemini-cost-tracker export --project staging-app --format csv --output staging-costs.csv
```

### シナリオ3: モデル別パフォーマンス分析

```bash
# モデル別の使用量比較
gemini-cost-tracker show --model gemini-2.5-pro --period month --format json
gemini-cost-tracker show --model gemini-2.5-flash --period month --format json

# コスト効率の比較レポート生成
gemini-cost-tracker export --period month --format csv --output model-comparison.csv
```

### シナリオ4: リアルタイム監視

```bash
# 今日の使用量を定期的にチェック
gemini-cost-tracker show --period today --format table

# 閾値監視のためのJSON出力
gemini-cost-tracker show --period today --format json | jq '.summary.totalCost'
```

### シナリオ5: 価格情報の管理

```bash
# 最新の価格情報に更新
gemini-cost-tracker update-pricing

# 価格変更の影響分析
gemini-cost-tracker update-pricing --report --output pricing-comparison.md
```

## 💡 ベストプラクティス

### 1. 定期的な監視

```bash
# 毎日の使用量チェック
gemini-cost-tracker show --period today

# 週次レポートの生成
gemini-cost-tracker export --period week --format csv --output "weekly-$(date +%Y%m%d).csv"
```

### 2. アラート設定

シェルスクリプトを使用した簡単なアラート例：

```bash
#!/bin/bash
COST=$(gemini-cost-tracker show --period today --format json | jq '.summary.totalCost')
THRESHOLD=50.0

if (( $(echo "$COST > $THRESHOLD" | bc -l) )); then
    echo "Alert: Daily cost $COST exceeds threshold $THRESHOLD"
    # Send notification
fi
```

### 3. データバックアップ

```bash
# 月次データの自動バックアップ
gemini-cost-tracker export --period month --format json --output "backup/$(date +%Y-%m)-backup.json"
```

## 🔧 トラブルシューティング

一般的な問題については、[トラブルシューティングガイド](./troubleshooting.md)を参照してください。

## 📚 詳細情報

- [APIリファレンス](./api-reference.md)
- [トラブルシューティングガイド](./troubleshooting.md)
- [貢献ガイドライン](../CONTRIBUTING.md)