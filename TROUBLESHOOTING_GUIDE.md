# トラブルシューティングガイド - gemini-cost-tracker

このドキュメントは、`gemini-cost-tracker` の使用中に発生する可能性のある問題とその解決方法をまとめたガイドです。症状別、エラー別に整理されており、迅速な問題解決を支援します。

## 📋 目次

1. [クイック診断チェックリスト](#クイック診断チェックリスト)
2. [症状別トラブルシューティング](#症状別トラブルシューティング)
3. [エラーコード別解決方法](#エラーコード別解決方法)
4. [環境別問題と対策](#環境別問題と対策)
5. [Claude Code セッション関連](#claude-code-セッション関連)
6. [よくある質問（FAQ）](#よくある質問faq)
7. [デバッグ手順](#デバッグ手順)
8. [サポートとエスカレーション](#サポートとエスカレーション)

---

## クイック診断チェックリスト

問題が発生した場合、まず以下を確認してください：

### ⚡ 即座に確認すべき項目

- [ ] **バージョン確認**: `npx gemini-cost-tracker@latest --version`
- [ ] **Node.js バージョン**: `node --version` (>=20.0.0 required)
- [ ] **ネットワーク接続**: インターネット接続の確認
- [ ] **認証情報**: API キー・プロジェクトIDの設定確認
- [ ] **権限**: ファイルシステムの読み書き権限

### 🔄 基本的な復旧手順

1. **キャッシュクリア**
   ```bash
   npx clear-npx-cache
   ```

2. **最新版の強制取得**
   ```bash
   npx gemini-cost-tracker@latest --version
   ```

3. **設定の再初期化**
   ```bash
   npx gemini-cost-tracker@latest config
   ```

4. **環境変数での一時回避**
   ```bash
   export GEMINI_API_KEY="your-api-key"
   export GCP_PROJECT_ID="your-project-id"
   npx gemini-cost-tracker@latest show
   ```

---

## 症状別トラブルシューティング

### 🚫 コマンドが実行されない

#### 症状: `npx gemini-cost-tracker` で何も起こらない

**考えられる原因:**
- パッケージ名の誤り
- ネットワーク接続問題
- npx キャッシュの破損

**解決手順:**
```bash
# 1. パッケージ名の確認
npm view gemini-cost-tracker@latest

# 2. キャッシュクリア
npx clear-npx-cache

# 3. 完全なパッケージ名での実行
npx gemini-cost-tracker@latest --help

# 4. ローカルインストールで確認
npm install -g gemini-cost-tracker
gemini-cost-tracker --help
```

#### 症状: Permission denied エラー

**解決方法:**
```bash
# macOS/Linux
sudo chown -R $(whoami) ~/.npm
chmod +x ~/.npm/_npx/*/bin/*

# Windows (PowerShell を管理者権限で実行)
Remove-Item -Recurse -Force $env:APPDATA\npm-cache\_npx
```

### 📊 データが表示されない

#### 症状: "No usage data found" メッセージ

**原因と対策:**

1. **認証問題**
   ```bash
   # 設定確認
   npx gemini-cost-tracker@latest config --show
   
   # 認証情報の再設定
   npx gemini-cost-tracker@latest config
   ```

2. **期間指定の問題**
   ```bash
   # より広い期間で確認
   npx gemini-cost-tracker@latest show --period month
   
   # カスタム期間での確認
   npx gemini-cost-tracker@latest show --start-date 2025-01-01 --end-date 2025-01-31
   ```

3. **API 権限の問題**
   - Gemini API の有効化確認
   - Vertex AI API の有効化確認
   - Cloud Monitoring API の有効化確認

#### 症状: モックデータのみ表示される

**解決方法:**
```bash
# デバッグログで確認
LOG_LEVEL=DEBUG npx gemini-cost-tracker@latest show

# リアルデータの有効化（認証情報が正しく設定されていることを確認）
npx gemini-cost-tracker@latest show --real-data
```

### 🔧 設定関連の問題

#### 症状: 設定が保存されない

**エラーコード**: `AUTH_SAVE_ERROR`

**根本原因:**
- 設定ディレクトリの権限問題
- XDG Base Directory の権限制限
- ディスク容量不足

**解決手順:**
```bash
# 1. 設定ディレクトリの確認・作成
mkdir -p ~/.config/gemini-cost-tracker
chmod 755 ~/.config/gemini-cost-tracker

# 2. 権限の確認
ls -la ~/.config/gemini-cost-tracker/

# 3. 手動での設定ファイル作成（緊急時）
cat > ~/.config/gemini-cost-tracker/config.json << 'EOF'
{
  "geminiApiKey": "your-api-key",
  "gcpProjectId": "your-project-id",
  "defaultCurrency": "USD",
  "version": "1.0"
}
EOF
chmod 600 ~/.config/gemini-cost-tracker/config.json

# 4. 環境変数での一時回避
export GEMINI_API_KEY="your-api-key"
export GCP_PROJECT_ID="your-project-id"
```

#### 症状: 設定が読み込まれない

**解決方法:**
```bash
# 設定ファイルの存在確認
ls -la ~/.config/gemini-cost-tracker/config.json

# 設定ファイルの内容確認
cat ~/.config/gemini-cost-tracker/config.json

# JSON フォーマットの検証
python3 -m json.tool ~/.config/gemini-cost-tracker/config.json

# 設定の初期化
npx gemini-cost-tracker@latest config --reset
```

### 📈 フォーマット・表示の問題

#### 症状: テーブルが崩れる・文字化けする

**原因:**
- ターミナルの文字エンコーディング
- ターミナルの幅不足
- フォントの対応問題

**解決方法:**
```bash
# 1. 別フォーマットでの確認
npx gemini-cost-tracker@latest show --format json
npx gemini-cost-tracker@latest show --format csv

# 2. ターミナル幅の拡張
# ターミナルウィンドウを広げる

# 3. 文字エンコーディングの確認
echo $LANG
export LANG=en_US.UTF-8

# 4. シンプルフォーマットでの確認
npx gemini-cost-tracker@latest show --format table --no-colors
```

#### 症状: グラフが表示されない

**解決方法:**
```bash
# ASCII チャート対応の確認
npx gemini-cost-tracker@latest show --format chart --period week

# フォント・ターミナル対応の確認
echo "▀▄█▌▐░▒▓"  # 特殊文字の表示確認

# 代替フォーマットの使用
npx gemini-cost-tracker@latest show --format table --show-trends
```

---

## エラーコード別解決方法

### ❌ AUTH_ERROR

```bash
Error: AUTH_ERROR - Invalid or missing API credentials
```

**原因:**
- API キーの有効期限切れ
- 不正なAPI キー形式
- API の無効化

**解決手順:**
1. **API キーの確認**
   ```bash
   # Google AI Studio で新しいAPIキーを生成
   # https://aistudio.google.com/app/apikey
   ```

2. **API キーの再設定**
   ```bash
   npx gemini-cost-tracker@latest config
   ```

3. **API の有効化確認**
   - Google Cloud Console でGemini API が有効か確認
   - 課金アカウントの設定確認

### ❌ VALIDATION_ERROR

```bash
Error: VALIDATION_ERROR - Invalid date range specified
```

**原因:**
- 無効な日付形式
- 未来の日付指定
- 開始日 > 終了日

**解決方法:**
```bash
# 正しい日付形式での指定
npx gemini-cost-tracker@latest show --start-date 2025-01-01 --end-date 2025-01-31

# 事前定義された期間の使用
npx gemini-cost-tracker@latest show --period today
npx gemini-cost-tracker@latest show --period week
npx gemini-cost-tracker@latest show --period month
```

### ❌ API_ERROR

```bash
Error: API_ERROR - Failed to fetch usage data
```

**トラブルシューティング:**

1. **ネットワーク接続の確認**
   ```bash
   curl -I https://generativelanguage.googleapis.com/
   ping google.com
   ```

2. **プロキシ設定の確認**
   ```bash
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   
   # プロキシ環境での実行
   HTTP_PROXY=http://proxy:8080 npx gemini-cost-tracker@latest show
   ```

3. **API レート制限の確認**
   ```bash
   # 少し待ってから再実行
   sleep 60
   npx gemini-cost-tracker@latest show
   ```

4. **デバッグモードでの詳細確認**
   ```bash
   LOG_LEVEL=DEBUG npx gemini-cost-tracker@latest show
   ```

### ❌ CONFIG_ERROR

```bash
Error: CONFIG_ERROR - Configuration file is corrupted
```

**解決方法:**
```bash
# 1. 設定ファイルのバックアップ
cp ~/.config/gemini-cost-tracker/config.json ~/.config/gemini-cost-tracker/config.json.backup

# 2. 設定ファイルの削除・再作成
rm ~/.config/gemini-cost-tracker/config.json
npx gemini-cost-tracker@latest config

# 3. 手動での設定修正
nano ~/.config/gemini-cost-tracker/config.json
```

---

## 環境別問題と対策

### 🪟 Windows 環境

#### 問題: PowerShell での実行エラー

**症状:**
```powershell
npx : The term 'npx' is not recognized
```

**解決方法:**
```powershell
# Node.js とnpmの再インストール
# https://nodejs.org/ から最新版をダウンロード

# PowerShell の実行ポリシー確認
Get-ExecutionPolicy

# 必要に応じて実行ポリシーを変更
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 環境変数 PATH の確認
$env:PATH -split ';' | Where-Object { $_ -match 'nodejs' }
```

#### 問題: Windows Defender による実行阻止

**解決方法:**
```powershell
# npm キャッシュディレクトリを Windows Defender の除外に追加
Add-MpPreference -ExclusionPath "$env:APPDATA\npm-cache"
Add-MpPreference -ExclusionPath "$env:LOCALAPPDATA\npm-cache"
```

### 🍎 macOS 環境

#### 問題: Gatekeeper による実行阻止

**症状:**
```
"gemini-cost-tracker" cannot be opened because the developer cannot be verified.
```

**解決方法:**
```bash
# 1. 一時的な許可
sudo spctl --master-disable

# 2. 特定ファイルの許可
sudo xattr -rd com.apple.quarantine ~/.npm/_npx/*/bin/gemini-cost-tracker

# 3. Homebrew 経由での Node.js 使用（推奨）
brew install node
npx gemini-cost-tracker@latest --version
```

#### 問題: SIP (System Integrity Protection) 関連

**解決方法:**
```bash
# ユーザー権限でのインストール確認
npm config get prefix

# ユーザー権限でのインストール設定
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 🐧 Linux 環境

#### 問題: 権限エラー

**解決方法:**
```bash
# npm のグローバルディレクトリ設定
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 権限修正
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### 問題: 古いNode.jsバージョン

**解決方法:**
```bash
# Node Version Manager (nvm) を使用
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 🐳 Docker/コンテナ環境

#### 問題: ファイルシステムの権限

**解決方法:**
```dockerfile
# Dockerfile での設定
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# 実行時のボリュームマウント
docker run -v ~/.config:/home/node/.config node:20 npx gemini-cost-tracker@latest show
```

---

## GitHub Actions CI/CD エラー

### 💥 エラー: CI lint ジョブ失敗 (Prettier フォーマットエラー)

**発生状況:**
- GitHub Actions の CI パイプラインで lint ジョブが失敗
- Prettier コードフォーマットチェックでエラー
- ローカルでは問題なくてもCI環境で検出される場合

**症状:**
```bash
lint	Check code formatting	[warn] src/utils/logger.ts
lint	Check code formatting	[warn] Code style issues found in the above file. Run Prettier with --write to fix.
lint	Check code formatting	##[error]Process completed with exit code 1.
```

**GitHub Actions ワークフロー構成:**
```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    - name: Check code formatting
      run: npx prettier --check "src/**/*.ts"
```

**調査手順:**

1. **CI ログの確認**
   ```bash
   # 最新のCI実行状況確認
   gh run list --workflow=ci.yml --limit=5
   
   # 失敗したランのログ詳細確認
   gh run view <RUN_ID> --log-failed
   ```

2. **ローカルでの再現確認**
   ```bash
   # 問題のあるファイルの特定
   npx prettier --check "src/**/*.ts"
   
   # 特定ファイルの確認
   npx prettier --check src/utils/logger.ts
   ```

**解決手順:**

1. **フォーマット修正**
   ```bash
   # 特定ファイルの修正
   npx prettier --write src/utils/logger.ts
   
   # 全ファイルの一括修正（必要に応じて）
   npx prettier --write "src/**/*.ts"
   ```

2. **修正確認**
   ```bash
   # 全ファイルのフォーマットチェック
   npx prettier --check "src/**/*.ts"
   # 期待される出力: "All matched files use Prettier code style!"
   ```

3. **修正のコミット・プッシュ**
   ```bash
   git add .
   git commit -m "style: fix Prettier formatting in logger.ts"
   git push origin main
   ```

4. **CI成功確認**
   ```bash
   # 新しいCI実行の確認（30-60秒待機後）
   gh run list --workflow=ci.yml --limit=1
   # 期待される結果: "completed success"
   ```

**実際の修正例 (2025-01-24):**

**問題のコード:**
```typescript
// ❌ Prettierエラーとなるコード
private level: LogLevel = LogLevel.WARN;  // デフォルトを WARN に変更
```

**修正後のコード:**
```typescript
// ✅ Prettier準拠のコード  
private level: LogLevel = LogLevel.WARN; // デフォルトを WARN に変更
```

**修正内容**: コメント前の不要なスペースを削除

**CI実行結果:**
- **修正前**: `completed failure` (lint ジョブでエラー)
- **修正後**: `completed success` (全ジョブ通過、実行時間1分20秒)

**よくある原因:**
- コメント前後のスペーシング
- インデントの不整合（タブとスペースの混在）
- 行末の不要なスペース
- セミコロンの前後のスペース

**予防策:**

1. **開発環境での事前チェック**
   ```bash
   # コミット前の必須チェック
   npm run format:check
   npm run lint
   ```

2. **VS Code 設定**
   ```json
   // .vscode/settings.json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     }
   }
   ```

3. **pre-commit フック設定（推奨）**
   ```bash
   # package.json に追加
   "husky": {
     "hooks": {
       "pre-commit": "npm run format:check && npm run lint"
     }
   }
   ```

**参考コマンド:**
```bash
# 修正可能な項目の確認
npx prettier --list-different "src/**/*.ts"

# 修正内容のプレビュー  
npx prettier --check --debug-check "src/**/*.ts"
```

---

## Claude Code セッション関連

### 🤖 Claude API 制限エラー

#### エラー: `/upgrade to increase your usage limit.`

**症状:**
```
Claude AI usage limit reached|1753369200
/upgrade to increase your usage limit.
```

**対応プロンプト例:**

1. **セッション継続**
   ```
   前回のセッションから継続してgemini-cost-trackerプロジェクトの作業を続けてください。
   現在の進捗: [具体的な状況]
   次に必要な作業: [次のステップ]
   ```

2. **エラー修正継続**
   ```
   gemini-cost-trackerで発生していたAUTH_SAVE_ERRORの修正を継続してください。
   前回まで：authManager.tsのディレクトリ作成処理を修正中
   残作業：設定ファイル保存の権限設定とテスト
   ```

3. **ファイル作成継続**
   ```
   PROJECT_ARCHITECTURE_KNOWLEDGE.mdファイルの作成を継続してください。
   前回の進捗：技術スタック・アーキテクチャ設計まで完了
   残り作業：テスト戦略とデプロイメント部分
   ```

### 🔄 セッション引き継ぎのベストプラクティス

1. **作業ログの保持**
   - `claude-code-knowledge.md` への記録
   - 重要な変更はすぐにコミット

2. **具体的な継続指示**
   - ファイル名と行番号の指定
   - 前回の作業内容の要約
   - 次のステップの明確化

3. **プロジェクト状況の記録**
   - Git の状態（ブランチ、コミット状況）
   - 設定ファイルの状態
   - 実行環境の情報

---

## よくある質問（FAQ）

### ❓ インストール・実行関連

**Q: npx で最新版が実行されない**
```bash
A: npx clear-npx-cache
   npx gemini-cost-tracker@latest --version
```

**Q: グローバルインストールとnpxはどちらが良い？**
```
A: npx を推奨。常に最新版を使用でき、システムを汚染しません。
   頻繁に使用する場合のみグローバルインストールを検討。
```

**Q: offline環境での使用は可能？**
```
A: 不可。Google Cloud APIs へのネットワーク接続が必須です。
```

### ❓ 設定・認証関連

**Q: 設定ファイルはどこに保存される？**
```bash
A: ~/.config/gemini-cost-tracker/config.json (macOS/Linux)
   %APPDATA%\gemini-cost-tracker\config.json (Windows)
```

**Q: API キーの取得方法は？**
```
A: Google AI Studio (https://aistudio.google.com/app/apikey) で生成。
   Google Cloud Console でのプロジェクト設定も必要。
```

**Q: 複数のプロジェクトを管理したい**
```bash
A: 現在は未対応。プロジェクトごとに環境変数を使用：
   GCP_PROJECT_ID=project1 npx gemini-cost-tracker@latest show
   GCP_PROJECT_ID=project2 npx gemini-cost-tracker@latest show
```

### ❓ データ・表示関連

**Q: リアルタイムのデータを表示したい**
```bash
A: 現在はモックデータがデフォルト。リアルデータの有効化：
   npx gemini-cost-tracker@latest show --real-data
```

**Q: データの精度について**
```
A: Google Cloud Monitoring API からの取得データです。
   リアルタイム性: 5-15分の遅延あり
   精度: Google の公式データに準拠
```

**Q: 過去のデータはどこまで取得可能？**
```
A: Google Cloud の保持期間に依存。通常は過去90日間。
```

### ❓ 課金・コスト関連

**Q: ツール自体の使用料金は？**
```
A: ツール自体は無料。ただし以下のコストが発生する可能性：
   - Gemini API 使用料（少額）
   - Cloud Monitoring API 使用料（通常無料枠内）
```

**Q: 表示される料金の正確性は？**
```
A: 公式料金表に基づく計算ですが：
   - 実際の請求額とは多少の差異がある可能性
   - 目安として使用し、詳細は Google Cloud Console で確認
```

---

## デバッグ手順

### 🔍 段階的デバッグアプローチ

#### レベル1: 基本情報の収集

```bash
# 環境情報の収集
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -a)"
echo "Current directory: $(pwd)"

# パッケージ情報
npm view gemini-cost-tracker@latest version
npx gemini-cost-tracker@latest --version
```

#### レベル2: 設定状況の確認

```bash
# 設定ファイルの確認
ls -la ~/.config/gemini-cost-tracker/
cat ~/.config/gemini-cost-tracker/config.json

# 環境変数の確認
echo "GEMINI_API_KEY: ${GEMINI_API_KEY:0:10}..." # 最初の10文字のみ表示
echo "GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo "LOG_LEVEL: $LOG_LEVEL"
```

#### レベル3: ネットワーク・API確認

```bash
# ネットワーク接続テスト
curl -I https://generativelanguage.googleapis.com/
curl -I https://monitoring.googleapis.com/

# DNS解決テスト
nslookup generativelanguage.googleapis.com
```

#### レベル4: 詳細ログでの実行

```bash
# デバッグログを有効にして実行
LOG_LEVEL=DEBUG LOG_FORMAT=json npx gemini-cost-tracker@latest show > debug.log 2>&1

# ログファイルの分析
grep "ERROR" debug.log
grep "API" debug.log
```

### 🔬 ログ分析のポイント

#### 重要なログエントリ

1. **認証関連**
   ```json
   {"level":"DEBUG","message":"Loading configuration","configPath":"..."}
   {"level":"ERROR","message":"AUTH_ERROR","details":"..."}
   ```

2. **API呼び出し**
   ```json
   {"level":"INFO","message":"Fetching usage data","service":"gemini"}
   {"level":"ERROR","message":"API request failed","statusCode":401}
   ```

3. **データ処理**
   ```json
   {"level":"DEBUG","message":"Processing usage data","count":15}
   {"level":"WARN","message":"Using mock data","reason":"no real data"}
   ```

#### ログレベルの使い分け

| レベル | 用途 | 実行方法 |
|--------|------|----------|
| **ERROR** | エラーのみ | `LOG_LEVEL=ERROR` |
| **WARN** | 警告以上 | `LOG_LEVEL=WARN` (デフォルト) |
| **INFO** | 一般情報 | `LOG_LEVEL=INFO` |
| **DEBUG** | 詳細情報 | `LOG_LEVEL=DEBUG` |

### 🧪 テスト実行によるデバッグ

```bash
# テストコマンドでの動作確認
npx gemini-cost-tracker@latest test

# モックデータでの動作確認
npx gemini-cost-tracker@latest show --mock

# 各フォーマットでの出力テスト
npx gemini-cost-tracker@latest show --format table
npx gemini-cost-tracker@latest show --format json
npx gemini-cost-tracker@latest show --format csv
```

---

## サポートとエスカレーション

### 📞 問題解決のフロー

#### 1. セルフサポート（推奨所要時間: 5-10分）
- [ ] このガイドの該当セクションを確認
- [ ] FAQ を確認
- [ ] クイック診断チェックリストを実行

#### 2. コミュニティサポート（推奨所要時間: 1-2時間）
- [ ] GitHub Issues で類似の問題を検索
- [ ] GitHub Discussions での質問投稿

#### 3. バグ報告（解決時間: 1-7日）
- [ ] 再現手順を整理
- [ ] 環境情報を収集
- [ ] GitHub Issues でバグ報告

### 🐛 バグ報告テンプレート

```markdown
## 環境情報
- OS: [macOS 13.0 / Windows 11 / Ubuntu 22.04]
- Node.js: [20.10.0]
- パッケージバージョン: [0.1.3]
- 実行方法: [npx / global install]

## 問題の説明
[問題の詳細説明]

## 再現手順
1. `npx gemini-cost-tracker@latest config` を実行
2. API キーを設定
3. `npx gemini-cost-tracker@latest show` を実行
4. エラーが発生

## 期待する動作
[期待される結果]

## 実際の動作
[実際に起こった結果]

## エラーメッセージ
```
[エラーメッセージをここに貼り付け]
```

## 追加情報
[その他の関連情報]
```

### 🔧 緊急時の回避策

#### 完全に動作しない場合

1. **Docker での実行**
   ```bash
   docker run -it --rm node:20 bash
   npx gemini-cost-tracker@latest --version
   ```

2. **ソースからのビルド**
   ```bash
   git clone https://github.com/ronkovic/gemini-cost-tracker.git
   cd gemini-cost-tracker
   npm install
   npm run build
   ./bin/gemini-cost-tracker --help
   ```

3. **代替ツールの使用**
   - Google Cloud Console での直接確認
   - `gcloud` CLI での usage 取得
   - Cloud Monitoring Dashboard の利用

### 📧 直接サポート連絡先

**GitHub Repository**: https://github.com/ronkovic/gemini-cost-tracker  
**Issues**: https://github.com/ronkovic/gemini-cost-tracker/issues  
**Discussions**: https://github.com/ronkovic/gemini-cost-tracker/discussions

---

## 📋 問題解決チェックシート

使用前・使用後の確認用チェックシートです。

### 事前確認チェックシート

- [ ] Node.js 20.0.0 以上がインストールされている
- [ ] インターネット接続が正常
- [ ] Gemini API キーを取得済み
- [ ] Google Cloud プロジェクトが作成済み
- [ ] 必要なAPIが有効化済み

### 問題発生時チェックシート

- [ ] エラーメッセージを記録した
- [ ] `LOG_LEVEL=DEBUG` でのログを取得した
- [ ] 環境情報を収集した
- [ ] このガイドの該当セクションを確認した
- [ ] 基本的な回避策を試した

### 解決後チェックシート

- [ ] 問題が完全に解決した
- [ ] 設定ファイルが正しく保存された
- [ ] 通常操作が正常に動作する
- [ ] 学んだ内容をメモした

---

**最終更新**: 2025年1月24日  
**作成者**: Claude Code + ronkovic  
**バージョン**: 1.0  
**次回レビュー**: 2025年4月24日

> 問題が解決しない場合や新しい問題を発見した場合は、GitHub Issues で報告してください。このガイドも随時更新され、コミュニティの知識が蓄積されています。