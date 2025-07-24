# トラブルシューティングガイド

## 📋 目次
- [一般的な問題](#一般的な問題)
- [インストール関連](#インストール関連)
- [認証関連](#認証関連)
- [API接続関連](#api接続関連)
- [設定関連](#設定関連)
- [データ取得関連](#データ取得関連)
- [出力・エクスポート関連](#出力エクスポート関連)
- [パフォーマンス関連](#パフォーマンス関連)
- [開発環境関連](#開発環境関連)
- [ログとデバッグ](#ログとデバッグ)
- [リファクタリング後の新しいエラー](#リファクタリング後の新しいエラー)

## 🔧 一般的な問題

### Q: コマンドが見つからない（command not found）

**症状:**
```bash
$ npx gemini-cost-tracker@latest --help
bash: npx gemini-cost-tracker@latest: command not found
```

**解決方法:**

1. **グローバルインストールの確認:**
   ```bash
   npm list -g npx gemini-cost-tracker@latest
   ```

2. **再インストール:**
   ```bash
   npm uninstall -g npx gemini-cost-tracker@latest
   npm install -g npx gemini-cost-tracker@latest
   ```

3. **npx を使用（推奨）:**
   ```bash
   npx npx gemini-cost-tracker@latest@latest --help
   ```

4. **PATH の確認:**
   ```bash
   echo $PATH
   npm config get prefix
   ```

### Q: Permission denied エラー

**症状:**
```bash
Error: EACCES: permission denied, open '/usr/local/lib/node_modules/...'
```

**解決方法:**

1. **npm の権限設定変更:**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
   source ~/.profile
   ```

2. **sudo を使用（非推奨）:**
   ```bash
   sudo npm install -g npx gemini-cost-tracker@latest
   ```

## 📦 インストール関連

### Q: Node.js バージョンエラー

**症状:**
```bash
error npx gemini-cost-tracker@latest@0.1.0: The engine "node" is incompatible with this module.
```

**解決方法:**

1. **Node.js バージョンの確認:**
   ```bash
   node --version
   ```

2. **Node.js 16以上にアップデート:**
   ```bash
   # nvm を使用
   nvm install 20
   nvm use 20
   
   # または公式サイトからダウンロード
   # https://nodejs.org/
   ```

### Q: 依存関係のインストールエラー

**症状:**
```bash
npm ERR! peer dep missing: typescript@>=4.0.0
```

**解決方法:**

1. **npm キャッシュのクリア:**
   ```bash
   npm cache clean --force
   ```

2. **依存関係の強制インストール:**
   ```bash
   npm install -g npx gemini-cost-tracker@latest --force
   ```

3. **yarn を使用:**
   ```bash
   yarn global add npx gemini-cost-tracker@latest
   ```

## 🔐 認証関連

### Q: Gemini API キーが無効

**症状:**
```bash
Error: Invalid API key format
Authentication failed: Invalid API key
```

**解決方法:**

1. **API キーの形式確認:**
   - Gemini API キーは `AI...` で始まる形式である必要があります
   - 空白や改行文字が含まれていないか確認

2. **API キーの再生成:**
   ```bash
   # Google AI Studio でAPI キーを再生成
   # https://aistudio.google.com/app/apikey
   ```

3. **設定の再実行:**
   ```bash
   npx npx gemini-cost-tracker@latest@latest config
   ```

### Q: GCP 認証エラー

**症状:**
```bash
Error: Project not found or access denied
Error: Service account key file not found
```

**解決方法:**

1. **プロジェクトIDの確認:**
   ```bash
   gcloud config get-value project
   ```

2. **サービスアカウントキーの確認:**
   ```bash
   # キーファイルの存在確認
   ls -la /path/to/service-account-key.json
   
   # キーファイルの形式確認（JSON形式である必要があります）
   head -n 5 /path/to/service-account-key.json
   ```

3. **必要な権限の確認:**
   サービスアカウントに以下の権限が必要です：
   - Cloud Logging Viewer
   - Cloud Monitoring Viewer
   - Cloud Billing Account Viewer

4. **認証情報の再設定:**
   ```bash
   npx npx gemini-cost-tracker@latest@latest config
   ```

### Q: 環境変数が認識されない

**症状:**
```bash
Warning: No credentials found, using mock data
```

**解決方法:**

1. **環境変数の確認:**
   ```bash
   echo $GEMINI_API_KEY
   echo $GCP_PROJECT_ID
   echo $GCP_KEY_FILE
   ```

2. **環境変数の設定:**
   ```bash
   export GEMINI_API_KEY="your-api-key"
   export GCP_PROJECT_ID="your-project-id"
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
   ```

3. **永続化（.bashrc や .zshrc に追加）:**
   ```bash
   echo 'export GEMINI_API_KEY="your-api-key"' >> ~/.bashrc
   source ~/.bashrc
   ```

## 🌐 API接続関連

### Q: ネットワーク接続エラー

**症状:**
```bash
Error: Network connection failed
Error: ENOTFOUND api.google.com
```

**解決方法:**

1. **インターネット接続の確認:**
   ```bash
   ping google.com
   curl -I https://api.google.com
   ```

2. **プロキシ設定の確認:**
   ```bash
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   
   # npmプロキシ設定
   npm config get proxy
   npm config get https-proxy
   ```

3. **ファイアウォール設定の確認:**
   - 企業ネットワークの場合、IT部門に確認
   - 必要なドメイン: `*.googleapis.com`, `ai.google.dev`

### Q: Rate Limit エラー

**症状:**
```bash
Error: Rate limit exceeded. Please try again later.
Error: Quota exceeded
```

**解決方法:**

1. **待機してリトライ:**
   ```bash
   # 数分待ってから再実行
   sleep 300
   npx npx gemini-cost-tracker@latest@latest show --period today
   ```

2. **リクエスト頻度の調整:**
   - 大量データ取得時は期間を分割
   - 並列リクエストを避ける

3. **API クォータの確認:**
   ```bash
   # Google Cloud Console でクォータ使用量を確認
   # https://console.cloud.google.com/apis/api/logging.googleapis.com/quotas
   ```

### Q: APIレスポンスが空

**症状:**
```bash
No usage data found for the specified period
Total cost: $0.00
```

**解決方法:**

1. **期間の確認:**
   ```bash
   # より広い期間で試行
   npx npx gemini-cost-tracker@latest@latest show --period month
   ```

2. **プロジェクトの確認:**
   ```bash
   # プロジェクトフィルタを削除
   npx npx gemini-cost-tracker@latest@latest show --period week
   ```

3. **実データモードの確認:**
   ```bash
   # 実データモードが有効になっているか確認
   npx npx gemini-cost-tracker@latest@latest config --show
   ```

## ⚙️ 設定関連

### Q: npx実行時の設定ファイル保存エラー

**症状:**
```bash
$ npx npx gemini-cost-tracker@latest@latest config
[ERROR] Unhandled promise rejection: - Context: {"reason":{"code":"AUTH_SAVE_ERROR","name":"AppError"}}
```

**解決方法:**

1. **最新バージョンを使用（v0.1.1以降）:**
   ```bash
   npx npx gemini-cost-tracker@latest@latest config
   ```

2. **環境変数での回避（一時的）:**
   ```bash
   export GEMINI_API_KEY="your-api-key"
   export GCP_PROJECT_ID="your-project-id"
   npx npx gemini-cost-tracker@latest@latest show
   ```

3. **設定ディレクトリの権限確認:**
   ```bash
   ls -la ~/.config/
   # 必要に応じて権限を修正
   chmod 755 ~/.config/
   ```

### Q: 設定ファイルが見つからない

**症状:**
```bash
Error: Configuration file not found
```

**解決方法:**

1. **設定ファイルの場所確認:**
   ```bash
   # macOS/Linux
   ls -la ~/.config/npx gemini-cost-tracker@latest/
   
   # XDG_CONFIG_HOMEが設定されている場合
   ls -la $XDG_CONFIG_HOME/npx gemini-cost-tracker@latest/
   
   # Windows
   dir %APPDATA%\npx gemini-cost-tracker@latest\
   ```

2. **設定の初期化:**
   ```bash
   npx npx gemini-cost-tracker@latest@latest config
   ```

3. **手動での設定ファイル作成:**
   ```json
   {
     "geminiApiKey": "your-api-key",
     "gcpProjectId": "your-project-id",
     "gcpKeyFile": "/path/to/key.json"
   }
   ```

### Q: 設定が保存されない

**症状:**
```bash
Settings saved successfully
# しかし次回実行時に設定が消えている
```

**解決方法:**

1. **ディレクトリの権限確認:**
   ```bash
   # macOS/Linux
   ls -la ~/.config/
   ```

2. **手動でディレクトリ作成:**
   ```bash
   # macOS/Linux
   mkdir -p ~/.config/npx gemini-cost-tracker@latest/
   
   # XDG_CONFIG_HOMEを使用する場合
   mkdir -p ${XDG_CONFIG_HOME:-~/.config}/npx gemini-cost-tracker@latest/
   ```

3. **権限の修正:**
   ```bash
   chmod 755 ~/.config/npx gemini-cost-tracker@latest/
   chmod 644 ~/.config/npx gemini-cost-tracker@latest/config.json
   ```

## 📊 データ取得関連

### Q: データが古い/更新されない

**症状:**
```bash
# 最新のデータが反映されない
Last updated: 2025-01-15 (2 days ago)
```

**解決方法:**

1. **キャッシュのクリア:**
   ```bash
   # 価格キャッシュファイルの削除
   rm -f pricing-cache.json
   ```

2. **強制更新:**
   ```bash
   npx gemini-cost-tracker@latest update-pricing
   ```

3. **実データモードの有効化:**
   ```bash
   # 環境変数で設定
   export GEMINI_COST_USE_REAL_DATA=true
   ```

### Q: データの不整合

**症状:**
```bash
Warning: Token count mismatch detected
Error: Invalid usage data format
```

**解決方法:**

1. **データ検証の実行:**
   ```bash
   npx gemini-cost-tracker@latest test --verbose
   ```

2. **期間を狭めて再試行:**
   ```bash
   npx gemini-cost-tracker@latest show --period today
   ```

3. **ログ出力でデバッグ:**
   ```bash
   DEBUG=* npx gemini-cost-tracker@latest show --period week
   ```

## 📁 出力・エクスポート関連

### Q: ファイルエクスポートエラー

**症状:**
```bash
Error: EACCES: permission denied, open 'report.csv'
Error: ENOENT: no such file or directory
```

**解決方法:**

1. **出力ディレクトリの確認:**
   ```bash
   # 出力先ディレクトリが存在するか確認
   ls -la /path/to/output/directory/
   ```

2. **権限の確認:**
   ```bash
   # 書き込み権限があるか確認
   touch test-file.txt
   rm test-file.txt
   ```

3. **絶対パスの使用:**
   ```bash
   npx gemini-cost-tracker@latest export --output /absolute/path/to/report.csv
   ```

### Q: 文字化け問題

**症状:**
```bash
# CSV出力時に日本語が文字化け
???,???-???-???,usage-1
```

**解決方法:**

1. **UTF-8エンコーディングの確認:**
   ```bash
   file report.csv
   ```

2. **環境変数の設定:**
   ```bash
   export LANG=ja_JP.UTF-8
   export LC_ALL=ja_JP.UTF-8
   ```

3. **Excel で開く場合:**
   - CSV ファイルをテキストエディタで開き、BOM付きUTF-8で保存
   - または Power Query を使用してインポート

## 🚀 パフォーマンス関連

### Q: 処理が遅い

**症状:**
```bash
# 長期間のデータ取得に時間がかかる
Processing... (this may take a while)
```

**解決方法:**

1. **期間の分割:**
   ```bash
   # 月単位で分割
   npx gemini-cost-tracker@latest show --start-date 2025-01-01 --end-date 2025-01-31
   npx gemini-cost-tracker@latest show --start-date 2025-02-01 --end-date 2025-02-28
   ```

2. **フィルタの活用:**
   ```bash
   # 特定のサービスやモデルに限定
   npx gemini-cost-tracker@latest show --service gemini --model gemini-2.5-pro
   ```

3. **並列処理の回避:**
   ```bash
   # 複数のコマンドを同時実行しない
   ```

### Q: メモリ不足エラー

**症状:**
```bash
Error: JavaScript heap out of memory
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**解決方法:**

1. **Node.js のメモリ制限拡張:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npx npx gemini-cost-tracker@latest@latest show --period month
   ```

2. **データ量の削減:**
   ```bash
   # 期間を短縮
   npx gemini-cost-tracker@latest show --period week
   
   # 特定のプロジェクトに限定
   npx gemini-cost-tracker@latest show --project specific-project
   ```

## 🔧 開発環境関連

### Q: TypeScript コンパイルエラー

**症状:**
```bash
error TS2307: Cannot find module './types/index.js'
error TS2305: Module has no exported member
```

**解決方法:**

1. **依存関係の再インストール:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript設定の確認:**
   ```bash
   npx tsc --noEmit
   ```

3. **型定義の確認:**
   ```bash
   npm run type-check
   ```

### Q: テスト実行エラー

**症状:**
```bash
Jest encountered an unexpected token
Cannot use import statement outside a module
```

**解決方法:**

1. **Jest設定の確認:**
   ```bash
   # jest.config.cjs の設定確認
   cat jest.config.cjs
   ```

2. **テストの個別実行:**
   ```bash
   npm test -- tests/unit/validator.test.ts
   ```

3. **ESMモジュールの問題:**
   ```bash
   npm test -- --experimental-vm-modules
   ```

## 📋 ログとデバッグ

### デバッグモードの有効化

```bash
# 環境変数でデバッグレベル設定
export DEBUG=npx gemini-cost-tracker@latest:*
export LOG_LEVEL=debug

# 詳細ログ出力
npx gemini-cost-tracker@latest show --period today
```

### ログファイルの場所

```bash
# macOS
~/Library/Logs/npx gemini-cost-tracker@latest/

# Linux
~/.local/share/npx gemini-cost-tracker@latest/logs/

# Windows
%USERPROFILE%\AppData\Local\npx gemini-cost-tracker@latest\logs\
```

### よく使用するデバッグコマンド

```bash
# 設定情報の確認
npx gemini-cost-tracker@latest config --show

# 接続テスト
npx gemini-cost-tracker@latest test --verbose

# バージョン情報
npx gemini-cost-tracker@latest --version

# ヘルプ情報
npx gemini-cost-tracker@latest --help

# 環境情報の出力
node --version
npm --version
echo $NODE_ENV
```

## 🆘 サポートとヘルプ

### 問題が解決しない場合

1. **GitHub Issues で報告:**
   - リポジトリ: https://github.com/your-username/npx gemini-cost-tracker@latest
   - 以下の情報を含めてください：
     - OS とバージョン
     - Node.js バージョン
     - パッケージバージョン
     - エラーメッセージの全文
     - 実行したコマンド

2. **ログの収集:**
   ```bash
   # デバッグログを有効にして実行
   DEBUG=* npx gemini-cost-tracker@latest show --period today 2>&1 | tee debug.log
   ```

3. **設定情報の収集（機密情報を除く）:**
   ```bash
   npx gemini-cost-tracker@latest config --show > config-info.txt
   ```

### バグレポートテンプレート

```markdown
## 環境情報
- OS: [e.g. macOS 13.0, Ubuntu 20.04]
- Node.js: [e.g. 18.17.0]
- Package Version: [e.g. 0.1.0]

## 問題の詳細
### 期待する動作
[期待していた動作を記述]

### 実際の動作
[実際に起こった動作を記述]

### 再現手順
1. [手順1]
2. [手順2]
3. [エラーが発生]

### エラーメッセージ
```
[エラーメッセージをここに貼り付け]
```

### 追加情報
[その他の関連情報]
```

## 🔄 リファクタリング後の新しいエラー

リファクタリング後、エラーメッセージの形式が変更されました。

### 新しいエラーコードシステム

**旧形式:**
```
Error: Gemini API key not configured
```

**新形式:**
```
Error: AUTH_MISSING_GEMINI_KEY - Gemini API key not configured. Run "npx gemini-cost-tracker@latest config" to set it up.
```

### 主なErrorCode一覧

| エラーコード | 説明 | 解決方法 |
|---|---|---|
| `AUTH_MISSING_GEMINI_KEY` | Gemini APIキーが未設定 | `config`コマンドで設定 |
| `AUTH_MISSING_GCP_PROJECT` | GCPプロジェクトIDが未設定 | `config`コマンドで設定 |
| `VALIDATION_ERROR` | 入力パラメータエラー | コマンドオプションを確認 |
| `NETWORK_ERROR` | ネットワーク接続エラー | ネットワーク接続を確認 |
| `API_ERROR` | APIリクエストエラー | APIキーと権限を確認 |
| `FILE_ERROR` | ファイル操作エラー | ファイルパスと権限を確認 |

### 構造化ログの活用

リファクタリング後は構造化ログが利用できます：

```bash
# ログレベルをDEBUGに設定
export LOG_LEVEL=DEBUG

# JSON形式でログ出力
export LOG_FORMAT=json

# コマンド実行
npx gemini-cost-tracker@latest show --period today
```

**JSONログ出力例:**
```json
{
  "level": "ERROR",
  "message": "Authentication failed",
  "timestamp": "2025-07-23T16:30:00.000Z",
  "context": {
    "errorCode": "AUTH_MISSING_GEMINI_KEY",
    "command": "show",
    "options": { "period": "today" }
  },
  "error": {
    "name": "AppError",
    "message": "Gemini API key not configured",
    "stack": "..."
  }
}
```

### デバッグのベストプラクティス

1. **ログレベルを上げる:**
   ```bash
   export LOG_LEVEL=DEBUG
   export LOG_FORMAT=json
   ```

2. **エラーコードで問題を特定:**
   エラーメッセージの最初に表示されるコードを確認

3. **コンテキスト情報を活用:**
   ログの`context`フィールドに問題の詳細情報が含まれています

## 📚 関連ドキュメント

- [使用方法ガイド](./usage.md)
- [APIリファレンス](./api-reference.md)
- [貢献ガイドライン](../CONTRIBUTING.md)