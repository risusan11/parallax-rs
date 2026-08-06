# PARALLAX-RS

2〜4人用・2D協力型・数学謎解き脱出ゲーム。各プレイヤーは同じマップを歩くが「観測層」が
異なり、情報を組み合わせないと数学的構造が見えない。

- `packages/core` — 純粋ロジック(数学・判定・ステージ定義)
- `packages/server` — Colyseus ルームサーバー
- `packages/client` — Phaser 3 クライアント(Vite)

## 開発

```bash
npm ci
npm test        # 全パッケージのテスト
npm run lint
npm run build    # 全パッケージのビルド
```

クライアントをローカルで動かす場合:

```bash
npm run dev --workspace=@parallax-rs/client
```

サーバーをローカルで動かす場合(別ターミナル):

```bash
npm run build --workspace=@parallax-rs/core
npm run build --workspace=@parallax-rs/server
npm run start --workspace=@parallax-rs/server
```

デフォルトではサーバーは `ws://localhost:2567` で待ち受け、クライアントもそのURLに
接続する(`VITE_SERVER_URL` 未設定時のデフォルト)。

## デプロイ

サーバー(Node ホスティング)とクライアント(静的ホスティング)を別々にデプロイする。
**サーバーを先にデプロイして公開URLを確定させてから**、そのURLを使ってクライアントを
ビルドする。

### サーバー: Node ホスティング

Render / Railway / Fly.io など、Node.js プロセスを起動できるホスティングであればよい。
このリポジトリは npm workspaces のモノレポなので、ビルド・起動コマンドはリポジトリ
ルートから実行する。

- ビルドコマンド: `npm ci && npm run build --workspace=@parallax-rs/core && npm run build --workspace=@parallax-rs/server`
- 起動コマンド: `npm run start --workspace=@parallax-rs/server`(リポジトリルートでは
  `npm start` でも同じコマンドが実行される)
- 環境変数: `PORT` — ホスティング側が割り当てるポート番号。未設定時は `2567` で待ち受ける
  (`packages/server/src/index.ts`)

起動後、`wss://<割り当てられたホスト名>` がクライアントから接続する先のURLになる
(WebSocketなので `ws://` ではなく TLS 終端後の `wss://` になっているか、ホスティング側の
ドキュメントで確認すること)。

### クライアント: 静的ホスティング

Netlify / Vercel / Cloudflare Pages / GitHub Pages など、静的ファイルを配信できる
ホスティングであればよい。

- ビルドコマンド: `npm ci && npm run build --workspace=@parallax-rs/client`
- 公開ディレクトリ: `packages/client/dist`
- 環境変数(ビルド時): `VITE_SERVER_URL` — 上記でデプロイしたサーバーのURL
  (例: `wss://parallax-rs-server.example.com`)。未設定の場合は `ws://localhost:2567`
  にフォールバックする(`packages/client/src/room-connection.ts`)ため、本番ビルドでは
  必ず設定すること

## 動作確認について

CI環境ではブラウザを使ったE2E確認ができないため、このリポジトリでは以下をもって
動作確認とする。

- `npm run build` が全パッケージで成功すること(型チェック含む)
- `npm test` が全パッケージで成功すること
