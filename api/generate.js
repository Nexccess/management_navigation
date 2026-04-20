// ── API切り替えはここだけ変える ──
// 'gemini' → 'claude' に変えるとClaude APIに切り替わる
const PROVIDER = 'gemini';

// ── プロンプト生成 ──
function buildPrompt(industry, company_size, sales_trend, hiring_status, dx_status, structure_level) {
  const system = `あなたは「文章を書く装置」です。考えることも、判断することも、あなたの仕事ではありません。与えられた情報を、決められた形式で言葉にするだけです。

## 読者のイメージ
40代後半の、経営の世界とは縁遠い主婦が読む。
難しい言葉は知らないが、今どきの言葉は普通に使える。
「なんとなく変だな」という感覚は鋭い。
でも経営用語や会計の話は頭に入ってこない。

この人が読んで、「あ、そういうことか」と感じられる言葉で書く。
この人が読んで、「で、どうすればいい？」と聞きたくなるように書く（答えは書かない）。

## 絶対に使わない言葉
「構造」「戦略」「施策」「リソース」「マネジメント」「ガバナンス」「KPI」「PDCA」「オペレーション」「キャパシティ」「スキーム」「フレームワーク」「最適化」「効率化」「強化」「改善」「対策」「解決」「提案」「推奨」「すべき」「必要がある」「重要」「課題」

## 出力形式（この順番で、この構成だけ）

【1. 現状の整理】
（2文。すでに起きていることだけ書く。第三者が外から見ているような書き方で）

【2. このままいくと見えやすい変化】
（2文。意図や努力とは関係なく、自然に起きやすいことを書く。断定しない）

【3. 整理しておくと、見え方が変わること】
（1〜2文。「こうしろ」ではなく「こういう見方がある」という角度で書く）

## 文体
- 敬語なし
- 1文に1つのことだけ
- 全部で300文字以内
- 読んだ後に「で、どうすればいい？」と思わせる「未完成感」を残す

## 良い出力の例

【1. 現状の整理】
売上は横ばいのまま、人を採ることも止まっている。仕事は今いる人たちだけで回している状態が続いている。

【2. このままいくと見えやすい変化】
今いる人たちへの負担が、少しずつ気づかれないまま積み上がっていきやすい。誰かが抜けたときに初めて「実は限界だった」と気づく、ということが起きやすくなる。

【3. 整理しておくと、見え方が変わること】
「今なぜ採用を止めているのか」と「止めた結果として何が起きているのか」を分けて見ると、見えていなかったものが出てくることがある。`;

  const user = `以下の情報をもとに、一次整理コメントを書いてください。

業種：${industry}
従業員の数：${company_size}
売上の流れ：${sales_trend}
採用の状況：${hiring_status}
ITやデジタルの使い方：${dx_status}
この会社のタイプ：${structure_level}

出力形式と文体のルールを必ず守ること。`;

  return { system, user };
}

// ── Gemini呼び出し ──
async function callGemini(system, user) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 700 }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini APIエラー');
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

// ── Claude呼び出し ──
async function callClaude(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude APIエラー');
  return data.content?.[0]?.text;
}

// ── メインハンドラー（CommonJS形式） ──
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { industry, company_size, sales_trend, hiring_status, dx_status, structure_level } = req.body;

  if ([industry, company_size, sales_trend, hiring_status, dx_status, structure_level].some(v => !v)) {
    return res.status(400).json({ error: '入力が不足しています' });
  }

  try {
    const { system, user } = buildPrompt(industry, company_size, sales_trend, hiring_status, dx_status, structure_level);

    let result;
    if (PROVIDER === 'gemini') {
      result = await callGemini(system, user);
    } else {
      result = await callClaude(system, user);
    }

    if (!result) throw new Error('生成結果が空です');
    return res.status(200).json({ result });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: '処理中にエラーが発生しました' });
  }
};
