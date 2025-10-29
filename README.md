# PostNotel

PostNotelはカレンダーを中心に日々の記録を残すモダンなノートアプリケーションです。写真付きノート、タグ管理、AIによるワインラベル認識を備え、Cloudflare Workers上で高速に動作します。

## 主な機能

- カレンダードリブンなノート管理: ノート作成・編集・削除とアクセスレベル制御、日付やタグによる絞り込みをサポートします。
- BlockNoteベースのリッチテキストエディタ: マークダウン入力、画像埋め込み、複数画像のプレビューに対応します。
- 画像アップロードと最適化: ブラウザ側で圧縮した画像をアップロードし、R2等のオブジェクトストレージに保存します。
- AIワイン認識: ワインラベル画像から銘柄情報を抽出して専用ノートを生成します。
- レスポンシブUI: スマートフォンからデスクトップまで最適化され、タッチジェスチャーやショートカットも提供します。
- サーバーサイドレンダリング: React Router v7 + Cloudflare Workersによるエッジ配信で高速に描画します。

## 技術スタック

- React Router v7 (SSR) / React 19
- TypeScript / Vite 6
- Cloudflare Workers / Wrangler
- Tailwind CSS v4
- BlockNote, React Hook Form, Zod, Radix UI, Sonner, Framer Motion, date-fns

## ディレクトリ構成

```text
app/
├── components/        # 再利用可能なUIコンポーネント（shadcn/uiは自動生成物）
├── features/          # 機能単位の状態・ロジック（auth, notes, tags, wines, image等）
├── routes/            # ファイルベースのReact RouterルートとBFFエンドポイント
├── layout/            # 画面レイアウト
├── hooks/             # 共通Reactフック
├── lib/               # フェッチャーやユーティリティ
├── constants/         # アプリ定数
├── types/             # 型定義
└── root.tsx           # エントリーポイント
workers/               # Cloudflare Workerエントリ
context/               # API・フロントエンド仕様書
```

## セットアップ

### 前提条件

- Node.js 20以上
- npm
- Cloudflare Wrangler CLI (`npm install -g wrangler`)

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

Cloudflare Workersとローカル開発で利用する環境変数を`.dev.vars`に設定します。

```text
API_BASE_URL="https://api.example.com"
R2_BASE_URL="https://r2.example.com"
# 必要に応じてOAuthやストレージ関連のシークレットを追記してください
```

Wranglerにシークレットを登録する場合は`npx wrangler secret put <NAME>`を使用します。

### 3. 開発サーバー

- `npm run dev`: React Router開発サーバー（HMR、http://localhost:5173）
- `npm run start`: Cloudflare Workersローカルエミュレーション

### 4. ビルド・プレビュー

- `npm run build`: SSRビルドを生成します。
- `npm run preview`: 生成物をローカルで確認します。

### 5. デプロイと検証

- `npm run deploy`: ビルド後にWranglerで本番へデプロイします。
- `npx wrangler versions upload`: プレビュー向けバージョンをアップロードします。
- `npx wrangler versions deploy`: 検証済みバージョンを本番へ昇格します。

### 6. 型検査と整形

- `npm run typecheck`: Worker型生成とTypeScriptビルドをまとめて実行します。
- `npx biome check app --write`: Biomeによるコード整形とLint（必要に応じてディレクトリを調整してください）。

## 仕様とドキュメント

- `context/PostNotel_Frontend_Specification.md`: フロントエンド仕様と画面要件。
- `context/PostNotel_API_Documentation.md`: BFFがアクセスするREST APIの詳細。
- `AGENTS.md` / `CLAUDE.md`: AIエージェント向けのワークフローとリポジトリ運用ルール。

## トラブルシューティング

- API呼び出しで`API_BASE_URL`未設定エラーが発生する場合は`.dev.vars`とWranglerシークレットを確認してください。
- Cloudflare Workersで新しい環境変数を追加した場合は`npm run typecheck`を再実行し、生成された型を利用してください。
- shadcn/ui配下のコンポーネントは自動生成物のため手動で編集しないでください。

## ライセンス

このリポジトリのライセンスは未指定です。必要に応じてプロジェクトオーナーに確認してください。
