# PostNotel フロントエンドアプリケーション仕様書

## プロジェクト概要

PostNotelは、カレンダーベースの日記・ノートアプリケーションです。日々の記録を写真と共に保存し、AIワイン認識機能を備えた現代的なパーソナルノートアプリです。

### 基本情報
- **アプリケーション名**: PostNotel
- **バージョン**: 1.0.0
- **開発者**: Megumu Niihara
- **デプロイ環境**: Cloudflare Workers
- **ベースURL**: `https://postnotel.megumu.me`

## 技術スタック

### コア技術
- **React Router v7**: フルスタックReactフレームワーク（SSR対応）
- **React 19**: 最新のReact（Concurrent Features対応）
- **TypeScript**: 型安全な開発環境
- **Tailwind CSS v4**: ユーティリティファーストCSS
- **Cloudflare Workers**: エッジコンピューティング基盤
- **Vite**: 高速ビルドツール

### 主要依存関係
- **BlockNote**: リッチテキストエディタ（`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`）
- **Radix UI**: ヘッドレスUIコンポーネント
- **Framer Motion**: アニメーションライブラリ
- **date-fns**: 日付操作ライブラリ
- **Sonner**: トースト通知

## アプリケーション構造

### ディレクトリ構成
```
app/
├── components/           # 再利用可能UIコンポーネント
│   ├── ui/              # Shadcn/ui系コンポーネント
│   └── common/          # アプリ固有コンポーネント
├── features/            # 機能別モジュール
│   ├── auth/           # 認証機能
│   ├── notes/          # ノート管理機能
│   └── image/          # 画像ハンドリング
├── routes/             # ルートコンポーネント
│   ├── auth/          # 認証関連ルート
│   ├── notes/         # ノート関連ルート
│   ├── wines/         # ワイン機能ルート
│   └── top.tsx        # ホームページ
├── layout/            # レイアウトコンポーネント
├── hooks/             # カスタムReactフック
├── lib/               # ユーティリティライブラリ
├── constants/         # アプリケーション定数
├── types/             # TypeScript型定義
└── root.tsx           # アプリケーションルート
```

## 主要機能

### 1. 認証システム
- **Google OAuth認証**: Googleアカウントによるシングルサインオン
- **セッション管理**: Cookieベースのセッション管理
- **保護されたルート**: 認証が必要なページへのアクセス制御

#### 認証フロー
1. `/auth/login` - Googleログインページへリダイレクト
2. Google OAuth承認後、コールバック処理
3. ユーザー情報をセッションに保存
4. `/notes`ページへリダイレクト

### 2. ノートシステム（メイン機能）

#### カレンダーベースナビゲーション
- **月次カレンダー表示**: その月のノートがある日付をハイライト表示
- **日付選択**: カレンダーから日付を選択してその日のノートを表示
- **スワイプナビゲーション**: 左右スワイプで前後の日付に移動
- **キーボードナビゲーション**: 矢印キーでの日付移動

#### ノート管理機能
- **ノート一覧表示**: 選択した日付のノート一覧表示
- **ノート詳細表示**: 個別ノートの詳細表示と編集
- **ノート作成**: 新しいノートの作成
- **ノート編集**: 既存ノートの編集
- **ノート削除**: ノートの削除
- **アクセスレベル**: Public/Privateの設定

#### リッチテキストエディタ
- **BlockNote統合**: 高機能なリッチテキストエディタ
- **マークダウン記法対応**: マークダウンでの入力サポート
- **画像埋め込み**: エディタ内での画像表示

#### 画像機能
- **画像アップロード**: ドラッグ&ドロップまたはファイル選択
- **画像圧縮**: ブラウザサイドでの画像圧縮
- **複数画像対応**: 1つのノートに複数画像を添付可能
- **画像プレビュー**: サムネイル表示と拡大表示

#### タグ機能
- **タグ作成**: 新しいタグの作成
- **タグ選択**: ノートへのタグ付け
- **タグフィルタリング**: タグによるノートの絞り込み

### 3. ワイン認識機能
- **AI画像認識**: ワインラベルの画像から情報を自動抽出
- **ワイン専用ノート**: 認識結果を基にした専用ノート作成
- **ワインギャラリー**: ワイン関連ノートの一覧表示

### 4. レスポンシブデザイン
- **モバイルファースト**: スマートフォン最適化
- **タッチジェスチャー**: スワイプ、ピンチ、タップ操作
- **デスクトップ対応**: PCでの快適な操作
- **ダークモード**: システム設定に応じたテーマ切り替え

## ユーザーインターフェース

### レイアウト構造

#### メインレイアウト（`withPost.tsx`）
- **ヘッダー**: タイトル、ユーザー情報、設定メニュー
- **カレンダーエリア**: 月次カレンダー表示
- **コンテンツエリア**: ノート一覧・詳細表示
- **フローティングアクションボタン**: 新規ノート作成、編集、削除

#### ナビゲーション
- **スワイプナビゲーション**: 左右スワイプで日付移動
- **キーボードショートカット**: 矢印キーでの日付移動
- **カレンダークリック**: 直接日付選択

### UIコンポーネント

#### 共通コンポーネント
- **Button**: 各種ボタン（Primary, Secondary, Ghost等）
- **Dialog**: モーダルダイアログ
- **Avatar**: ユーザーアバター表示
- **Calendar**: カレンダーピッカー
- **DropdownMenu**: ドロップダウンメニュー
- **Sonner**: トースト通知

#### ノート固有コンポーネント
- **NoteEditor**: BlockNoteエディタラッパー
- **ImageUpload**: 画像アップロードコンポーネント
- **TagSelector**: タグ選択コンポーネント
- **AccessLevelToggle**: アクセスレベル切り替え

## データモデル

### Note（ノート）
```typescript
interface Note {
  id: string;           // UUID
  content: string;      // リッチテキストコンテンツ
  accessLevel: 'public' | 'private';
  contentType: 'note' | 'post' | 'winebyAI';
  generationStatus: 'pending' | 'done' | 'error';
  noteDay: string;      // YYYY-MM-DD形式
  tagIds: string[];     // タグID配列
  images: string[];     // 画像URL配列
  createdAt: string;    // ISO 8601形式
  updatedAt: string;    // ISO 8601形式
}
```

### Tag（タグ）
```typescript
interface Tag {
  id: string;    // UUID
  name: string;  // タグ名
  createdAt: string;
  updatedAt: string;
}
```

### User（ユーザー）
```typescript
interface User {
  id: string;        // UUID
  name: string;      // 表示名
  email: string;     // メールアドレス
  googleId: string;  // Google ID
  avatarUrl: string; // アバター画像URL
}
```

### NoteDay（ノート日）
```typescript
interface NoteDay {
  noteDate: string;  // YYYY-MM-DD形式
  hasNotes: boolean; // その日にノートが存在するか
}
```

## API統合

### エンドポイント仕様

#### 認証関連
- `GET /v1/auth/google/login` - Google OAuth開始
- `GET /v1/auth/google/callback` - OAuth コールバック
- `POST /v1/auth/logout` - ログアウト
- `GET /v1/users/me` - 現在のユーザー情報取得

#### ノート関連
- `GET /v1/notes` - ノート一覧取得（フィルタリング、ページネーション対応）
- `GET /v1/notes/days` - 指定期間のノート存在日取得
- `GET /v1/notes/:id` - 特定ノート取得
- `POST /v1/notes` - ノート作成
- `PATCH /v1/notes/:id` - ノート更新
- `DELETE /v1/notes/:id` - ノート削除

#### タグ関連
- `GET /v1/tags` - 全タグ取得
- `GET /v1/tags/:id` - 特定タグ取得
- `POST /v1/tags` - タグ作成
- `PUT /v1/tags/:id` - タグ更新
- `DELETE /v1/tags/:id` - タグ削除

#### 画像関連
- `GET /v1/image/upload-url` - アップロード用URL取得

#### ワイン関連
- `POST /v1/wine-labels/recognize` - ワインラベル認識

### データフェッチング戦略
- **React Router Loaders**: サーバーサイドでのデータプリフェッチ
- **Optimistic Updates**: 楽観的UI更新
- **Error Handling**: エラー境界とフォールバック

## パフォーマンス最適化

### ビルド最適化
- **コード分割**: ルートベースの動的インポート
- **Tree Shaking**: 未使用コードの除去
- **バンドル最適化**: Viteによる最適化

### ランタイム最適化
- **React Suspense**: 非同期コンポーネントの遅延読み込み
- **画像遅延読み込み**: Intersection Observer API
- **仮想化**: 大量データの効率的レンダリング

### ネットワーク最適化
- **SSR**: サーバーサイドレンダリング
- **キャッシュ戦略**: ブラウザキャッシュとCDN
- **画像最適化**: WebP形式、適切なサイズ

## セキュリティ

### 認証・認可
- **OAuth 2.0**: Googleアカウント認証
- **セッション管理**: HTTPOnlyクッキー
- **CSRF保護**: トークンベース保護

### データ保護
- **XSS対策**: React のビルトイン保護
- **入力サニタイズ**: Zodによるバリデーション
- **アクセス制御**: Private/Publicノート

### セキュリティヘッダー
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options

## デプロイメント

### Cloudflare Workers
- **エッジデプロイ**: 世界中のエッジサーバーでの配信
- **無限スケーリング**: サーバーレスアーキテクチャ
- **高速起動**: コールドスタート最適化

### CI/CD
- **自動デプロイ**: Wranglerを使用した自動デプロイ
- **環境分離**: 開発・本番環境の分離
- **ヘルスチェック**: デプロイ後の動作確認

## 開発環境

### 開発サーバー
```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run deploy     # Cloudflareへデプロイ
npm run typecheck  # 型チェック
```

### コード品質
- **Biome**: コードフォーマッタとリンタ
- **TypeScript**: 厳密な型チェック
- **Zod**: ランタイム型バリデーション

### 設定ファイル
- `vite.config.ts` - Vite設定
- `react-router.config.ts` - React Router設定
- `wrangler.toml` - Cloudflare Workers設定
- `biome.json` - Biome設定
- `tsconfig.json` - TypeScript設定

## 今後の拡張予定

### 機能追加
- オフライン対応（PWA）
- ノート共有機能
- 全文検索機能
- エクスポート機能（PDF、Markdown）
- 統計・分析機能

### 技術的改善
- パフォーマンス最適化
- アクセシビリティ向上
- テスト自動化
- 国際化（i18n）対応

## トラブルシューティング

### よくある問題
1. **認証エラー**: Googleアカウント設定確認
2. **画像アップロード失敗**: ファイルサイズとフォーマット確認
3. **日付表示問題**: タイムゾーン設定確認
4. **パフォーマンス問題**: ブラウザキャッシュクリア

### デバッグツール
- React Developer Tools
- Chrome DevTools
- Cloudflare Wrangler CLI

---

この仕様書は、PostNotelフロントエンドアプリケーションの包括的な技術仕様とユーザー機能を記述しています。開発・運用・拡張の際の参考資料としてご活用ください。