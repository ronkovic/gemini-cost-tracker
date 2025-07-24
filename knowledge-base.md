# gemini-cost-tracker 開発ナレッジベース

このドキュメントは、gemini-cost-tracker の開発過程で得られた知識をまとめたものです。
他のCLIツールやNPMパッケージの開発にも応用できます。

## 目次

1. [NPMパッケージの公開手順](#npmパッケージの公開手順)
2. [npx実行時の設定ファイル管理](#npx実行時の設定ファイル管理)
3. [テーブル表示の時系列ソート実装](#テーブル表示の時系列ソート実装)
4. [バージョン管理とリリースフロー](#バージョン管理とリリースフロー)
5. [GitHub Actions CI/CD設定](#github-actions-cicd設定)

## NPMパッケージの公開手順

### 初回公開

1. **NPMアカウントの作成**
   ```bash
   # NPMウェブサイトでアカウント作成後
   npm login
   ```

2. **package.jsonの設定**
   ```json
   {
     "name": "your-package-name",
     "version": "0.1.0",
     "bin": {
       "your-command": "./bin/your-command"
     },
     "files": [
       "dist/**/*",
       "bin/**/*",
       "README.md",
       "LICENSE"
     ],
     "prepublishOnly": "npm run ci"
   }
   ```

3. **.npmignoreの作成**
   ```
   # Source files
   src/
   tests/
   
   # Development files
   .github/
   .env*
   *.log
   node_modules/
   
   # Documentation (except essential ones)
   *.md
   !README.md
   !CHANGELOG.md
   !LICENSE
   ```

4. **公開コマンド**
   ```bash
   npm publish
   ```

### バージョン更新時の手順

1. package.json のバージョンを更新
2. CHANGELOG.md を更新
3. README.md の更新履歴を更新
4. `npm publish` を実行

## npx実行時の設定ファイル管理

### 問題：AUTH_SAVE_ERROR

npx実行時に設定ファイルの保存でエラーが発生する問題の解決方法。

### 解決策：XDG Base Directory仕様の採用

```typescript
// authManager.ts
constructor() {
  // XDG_CONFIG_HOME を優先、なければ ~/.config を使用
  const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  this.configDir = path.join(configHome, 'your-app-name');
  this.configFile = path.join(this.configDir, 'config.json');
}

async saveConfiguration(): Promise<void> {
  try {
    // ディレクトリを再帰的に作成
    await fs.mkdir(this.configDir, { recursive: true });
    await fs.writeFile(this.configFile, configData, 'utf8');
  } catch (error) {
    // エラーハンドリング
  }
}
```

### 重要なポイント

1. **初期化処理を忘れない**
   ```typescript
   const authManager = new AuthManager();
   await authManager.initialize(); // これを忘れると設定が読み込まれない
   ```

2. **個別設定更新時の既存値保持**
   ```typescript
   async setApiKey(apiKey: string): Promise<void> {
     // 既存の設定を読み込んでから更新
     await this.loadConfiguration();
     this.credentials.apiKey = apiKey;
     await this.saveConfiguration();
   }
   ```

## テーブル表示の時系列ソート実装

### 降順ソート（最新が上）の実装

```typescript
// tableFormatter.ts
// データを降順でソートしてから表示
const sortedDetails = [...data.details].sort((a, b) => b.date.getTime() - a.date.getTime());
const recentDetails = sortedDetails.slice(0, 20);
```

### チャート表示での考慮事項

- 日別トレンドグラフは昇順（古い→新しい）が自然
- コスト比較チャートは降順（高い→低い）が見やすい

```typescript
// 日別トレンド用（昇順）
const dates = Object.keys(dailyCosts).sort();

// コスト比較用（降順）
const services = Object.entries(serviceBreakdown).sort(([, a], [, b]) => b - a);
```

## バージョン管理とリリースフロー

### セマンティックバージョニング

- **パッチバージョン（0.0.x）**: バグ修正
- **マイナーバージョン（0.x.0）**: 新機能（後方互換性あり）
- **メジャーバージョン（x.0.0）**: 破壊的変更

### リリース手順

1. **コード修正とテスト**
   ```bash
   npm run build
   npm test
   ./bin/your-command test  # ローカルテスト
   ```

2. **バージョン更新**
   - package.json
   - CHANGELOG.md
   - README.md

3. **Git操作**
   ```bash
   git add -A
   git commit -m "fix: 修正内容の説明"
   git push origin main
   ```

4. **NPM公開**
   ```bash
   npm publish
   ```

5. **動作確認**
   ```bash
   # 別ターミナルまたは別PCで
   npx your-package@latest --version
   ```

## GitHub Actions CI/CD設定

### Prettier/ESLintチェック

```yaml
# .github/workflows/ci.yml
- name: Check code formatting
  run: npx prettier --check "src/**/*.ts"

- name: Run ESLint
  run: npm run lint
```

### エラー対処

1. **Prettier エラー**
   ```bash
   npx prettier --write src/**/*.ts
   git add .
   git commit -m "style: fix Prettier formatting"
   git push
   ```

## トラブルシューティングのヒント

### npxキャッシュ問題

```bash
# キャッシュクリア方法
npx clear-npx-cache
# または
rm -rf ~/.npm/_npx
```

### 環境変数での回避策

設定ファイル保存エラーの一時的な回避：
```bash
export GEMINI_API_KEY="your-key"
export GCP_PROJECT_ID="your-project"
npx your-package@latest
```

## ベストプラクティス

1. **エラーメッセージは具体的に**
   ```typescript
   throw new AppError(
     ErrorCode.AUTH_SAVE_ERROR,
     `Failed to save configuration to ${this.configFile}: ${errorMessage} (code: ${errorCode})`
   );
   ```

2. **ログ出力の活用**
   ```typescript
   logger.info('Processing data', { count: data.length, startDate, endDate });
   ```

3. **型安全性の確保**
   - TypeScriptの厳密な型定義
   - 入力値のバリデーション

4. **テスト可能な設計**
   - 依存性の注入
   - モックデータの活用

---

最終更新: 2025-01-24