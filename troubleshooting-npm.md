# NPMパッケージ トラブルシューティングガイド

このドキュメントは、NPMパッケージ開発・公開時に遭遇した問題と解決策をまとめたものです。

## 目次

1. [npx実行時のエラー](#npx実行時のエラー)
2. [設定ファイルの保存エラー](#設定ファイルの保存エラー)
3. [バージョン管理の問題](#バージョン管理の問題)
4. [CI/CDエラー](#cicdエラー)
5. [別環境での動作確認](#別環境での動作確認)

## npx実行時のエラー

### 問題1: AUTH_SAVE_ERROR

**症状**
```bash
$ npx gemini-cost-tracker@latest config
[ERROR] Unhandled promise rejection: - Context: {"reason":{"code":"AUTH_SAVE_ERROR","name":"AppError"}}
```

**原因**
- npx実行時の一時的な環境では、ホームディレクトリへの書き込み権限が制限される場合がある
- 設定ディレクトリが存在しない

**解決策**

1. **XDG Base Directory仕様の採用**
```typescript
const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
this.configDir = path.join(configHome, 'your-app-name');
```

2. **ディレクトリの自動作成**
```typescript
await fs.mkdir(this.configDir, { recursive: true });
```

3. **環境変数での回避（一時的）**
```bash
export GEMINI_API_KEY="your-key"
export GCP_PROJECT_ID="your-project"
npx your-package@latest
```

### 問題2: キャッシュによる古いバージョンの実行

**症状**
- 新しいバージョンを公開したのに、古いバージョンが実行される

**解決策**
```bash
# 方法1: キャッシュクリア
npx clear-npx-cache

# 方法2: キャッシュディレクトリ削除
rm -rf ~/.npm/_npx

# 方法3: バージョン指定
npx your-package@0.1.2 --version

# 方法4: 強制的に最新版
npx your-package@latest --version
```

## 設定ファイルの保存エラー

### 問題: 個別設定更新時に他の設定が消える

**症状**
```bash
$ npx your-package config --set-api-key KEY1
✅ API key updated

$ npx your-package config --set-project PROJECT1
✅ Project updated

$ npx your-package config --show
API Key: Not set  # 消えている！
Project: PROJECT1
```

**原因**
- 設定更新時に既存の設定を読み込まずに上書きしている

**解決策**
```typescript
async setApiKey(apiKey: string): Promise<void> {
  // 既存設定を読み込む
  await this.loadConfiguration();
  this.credentials.apiKey = apiKey;
  await this.saveConfiguration();
}
```

### 問題: 初期化忘れによる設定読み込みエラー

**症状**
- 設定が保存されているのに読み込まれない

**解決策**
```typescript
// configCommand.ts
const authManager = new AuthManager();
await authManager.initialize(); // 必須！
```

## バージョン管理の問題

### 問題: バージョン更新漏れ

**チェックリスト**
- [ ] package.json のバージョン更新
- [ ] CHANGELOG.md の更新
- [ ] README.md の更新履歴追加
- [ ] git tag の作成（オプション）

**自動化スクリプト例**
```bash
#!/bin/bash
# release.sh
VERSION=$1
npm version $VERSION
git add -A
git commit -m "chore: release v$VERSION"
git tag v$VERSION
git push origin main --tags
npm publish
```

## CI/CDエラー

### 問題: Prettier フォーマットエラー

**症状**
```
[warn] src/services/auth/authManager.ts
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```

**解決策**
```bash
# ローカルで修正
npx prettier --write src/**/*.ts

# コミット
git add .
git commit -m "style: fix Prettier formatting"
git push
```

**予防策**
```json
// package.json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "prepublishOnly": "npm run format:check && npm run build"
  }
}
```

### 問題: TypeScriptコンパイルエラー

**デバッグ方法**
```bash
# 型チェックのみ
npm run type-check

# 詳細なエラー情報
npx tsc --noEmit --listFiles

# 特定ファイルのチェック
npx tsc --noEmit src/problem-file.ts
```

## 別環境での動作確認

### 確認手順

1. **バージョン確認**
```bash
# NPMレジストリの確認
npm view your-package@latest version

# 実行確認
npx your-package@latest --version
```

2. **クリーンな環境でのテスト**
```bash
# Docker使用例
docker run -it node:20 bash
npm install -g your-package@latest
your-package --version
```

3. **異なるOS/Node.jsバージョンでのテスト**
```yaml
# GitHub Actions matrix
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]
```

### トラブルシューティングコマンド集

```bash
# NPM情報確認
npm view your-package
npm view your-package versions --json

# ローカルパッケージ情報
npm list -g your-package

# npxデバッグ
npx --yes your-package@latest --version

# 詳細ログ
npm_config_loglevel=verbose npx your-package@latest

# プロキシ環境
HTTP_PROXY=http://proxy:8080 npx your-package@latest
```

## よくある質問

### Q: npxで最新版が実行されない

A: 以下の順番で試してください：
1. `npx clear-npx-cache`
2. `npx your-package@latest --version`
3. `npm view your-package version` で公開されているか確認

### Q: 設定ファイルはどこに保存される？

A: 優先順位：
1. `$XDG_CONFIG_HOME/your-app-name/`
2. `~/.config/your-app-name/`
3. `~/.your-app-name/` (レガシー)

### Q: Windows環境でパスエラーが出る

A: パス区切り文字に注意：
```typescript
import path from 'path';
// ❌ 'config/file.json'
// ✅ path.join('config', 'file.json')
```

---

最終更新: 2025-01-24