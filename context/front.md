# PostNotel フロントエンド要件定義

## 概要

PostNotel は日記・ノート・記事の投稿・管理を行うウェブアプリケーションです。本ドキュメントでは、React＋Vite＋TypeScript をベースとしたフロントエンドの要件を定義します。

---

## 目的

* ユーザーがシームレスに日記やノート、記事を投稿・編集・閲覧できること。
* 投稿時刻に応じた自動日付管理と、タグ・カテゴリによる整理機能を提供。
* 画像アップロードやAI要約などの機能を直感的に使えるUIを実現。

---

## 対象環境

* **ブラウザ**: Chrome, Firefox, Safari, Edge（最新2バージョン）
* **デバイス**: デスクトップ／モバイル（レスポンシブ対応）

---

## 技術スタック

* **フレームワーク**: React (Vite + TypeScript)
* **UI**: Tailwind CSS + shadcn/ui ([インストールガイド](https://ui.shadcn.com/docs/installation))
* **ルーティング**: React Router v7 ([ドキュメント](https://reactrouter.com/home#react-router-home))
* **状態管理**: React Query（サーバー状態）、Zustand（クライアント状態）
* **フォーム**: React Hook Form
* **API 通信**: fetch
* **認証**: Google OAuth 対応（バックエンド経由）

---

## 機能要件

### 認証・認可

* Google OAuth を利用したログイン/ログアウト。
* 認証後、アクセストークンを保持し API リクエストに付与。

### ノート・日記管理

* **自動日付割当**: 投稿時刻を基にノート日（`note_day`）を自動設定。
* **画像アップロード**: プレサインド URL 取得後、直接 PUT → プレビュー表示。
* **タグ／カテゴリ**: 既存タグ・カテゴリの選択および新規作成。

### 記事管理

* **コンテンツブロック**: Markdown テキスト、画像など複数ブロックの挿入・並び替え。

### AI 連携

* **要約・感情分析**: ボタン操作で AI 要約結果を取得し、ノートに追加保存。
* **Prompt テンプレート**: Markdown テンプレートをベースにプロンプトを組み立て。

### 検索・フィルタリング

* ノート・記事のキーワード検索。
* 日付／タグ／カテゴリによる絞込み。

---

## 非機能要件

* **パフォーマンス**: 初期表示 1 秒以内、API レイテンシ 200ms 以下目標。
* **アクセシビリティ**: WCAG 2.1 AA 準拠（キーボード操作、ARIA 属性）。
* **セキュリティ**: CSP 設定、XSS/CSRF 対策、HTTPS 強制。
* **レスポンシブ対応**: モバイルファースト設計。
* **信頼性**: e2e テスト（Playwright）による主要フローの自動検証。

---

## UI/UX 要件

* **デザインシステム**: shadcn/ui のコンポーネントを統一的に使用。
* **ダークモード**: OS 設定に追従。
* **トースト通知**: 操作結果をユーザーにフィードバック。
* **ローディング状態**: ボタン・リスト読み込み時にスピナー表示。

---

## API 連携仕様

```
GET    /notes/:day         # 指定日ノート一覧
GET    /notes/:id          # ノート詳細
POST   /notes              # ノート作成
PUT    /notes/:id          # ノート更新
DELETE /notes/:id          # ノート削除

GET    /articles           # 記事一覧
GET    /articles/:id       # 記事詳細
POST   /articles           # 記事作成
PUT    /articles/:id       # 記事更新
DELETE /articles/:id       # 記事削除

GET    /categories         # 全カテゴリ
POST   /categories         # カテゴリ作成
PATCH  /categories/:id     # カテゴリ更新
DELETE /categories/:id     # カテゴリ削除

GET    /tags               # 全タグ
POST   /tags               # タグ作成
PATCH  /tags/:id           # タグ更新
DELETE /tags/:id           # タグ削除
```
