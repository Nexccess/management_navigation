# 経営構造 一次整理 — デプロイ手順

## ファイル構成

```
/
├── index.html          # LP・フォーム・結果表示
├── api/
│   └── generate.js     # Vercelサーバーレス関数（スコアリング＋OpenAI呼び出し）
├── vercel.json         # Vercel設定
└── README.md
```

---

## デプロイ手順

### 1. GitHubリポジトリ作成

1. GitHub で新しいリポジトリを作成（例：`keiei-seiri`）
2. このフォルダの内容をすべてプッシュ

```bash
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/keiei-seiri.git
git push -u origin main
```

### 2. Vercelと連携

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. 「Add New Project」→ 作成したリポジトリを選択
3. 設定はデフォルトのまま「Deploy」

### 3. 環境変数の設定（重要）

Vercel ダッシュボード → プロジェクト → **Settings → Environment Variables**

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | `sk-...` あなたのOpenAI APIキー |

設定後、**Deployments → 最新のデプロイ → Redeploy** を実行。

### 4. 独自ドメインの設定

1. Vercel → Settings → **Domains**
2. 取得したドメインを入力して「Add」
3. ドメインのDNS設定に表示されるレコードを追加
   - Aレコード：`76.76.19.61`（Vercelの指示に従う）
   - CNAMEレコード：`cname.vercel-dns.com`

**ドメイン取得先おすすめ：**
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)（管理費のみ・最安値）
- お名前.com

---

## 動作確認

デプロイ後、以下を確認：
- [ ] 5項目すべて選択すると「整理する」ボタンが有効になる
- [ ] ボタン押下後、ローディング表示 → 結果表示
- [ ] 結果が3セクションに分かれて表示される

---

## 注意

- OpenAIのモデル `gpt-4.1-mini` を使用（仕様書に準拠）
- APIキーはVercelの環境変数に保管。コードには含めない
- スコアリングはフロントエンド＋サーバー両側で完結
