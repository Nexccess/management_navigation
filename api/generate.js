export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    industry,
    company_size,
    sales_trend,
    hiring_status,
    dx_status,
    structure_level
  } = req.body;

  // Validate required fields
  const required = [industry, company_size, sales_trend, hiring_status, dx_status, structure_level];
  if (required.some(v => !v)) {
    return res.status(400).json({ error: '入力が不足しています' });
  }

  const systemPrompt = `あなたは経営構造の一次整理コメントを生成する装置です。

【役割の定義】
- 文章を書くことのみを行う
- 判断・診断・評価・助言・提案は一切しない
- 解決策・施策・成功事例を提示しない

【出力構成（順序厳守）】
【1. 現状の整理】
- すでに成立している事実のみを記述する
- 第三者視点で書く
- 2文

【2. 今の状態が続いた場合に見えやすい変化】
- structure_levelを前提に記述する
- 意思とは無関係に起こりやすい変化を記述する
- 断定しない
- 2文

【3. 今後整理しておくと見えやすくなる視点】
- 行動提案なし
- 手法・施策なし
- 考え方の軸のみ
- 1〜2文

【文体ルール】
- 敬語不使用
- 専門用語禁止
- 1文＝1事実
- 全体300文字以内
- 「すべき」「必要がある」「改善」「対策」「強化」「解決」「提案」「推奨」「アドバイス」などの語は使用禁止`;

  const userPrompt = `以下の情報をもとに一次整理コメントを生成する。

業種：${industry}
従業員規模：${company_size}
売上の傾向：${sales_trend}
採用状況：${hiring_status}
IT・DX状況：${dx_status}
構造区分：${structure_level}

上記の出力構成と文体ルールに厳密に従うこと。`;

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 600,
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      throw new Error(data.error?.message || 'OpenAI APIエラー');
    }

    const result = data.choices?.[0]?.message?.content;
    if (!result) throw new Error('生成結果が空です');

    return res.status(200).json({ result });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: '処理中にエラーが発生しました' });
  }
}
