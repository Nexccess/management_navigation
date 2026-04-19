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

  const required = [industry, company_size, sales_trend, hiring_status, dx_status, structure_level];
  if (required.some(v => !v)) {
    return res.status(400).json({ error: '入力が不足しています' });
  }

  const systemPrompt = `あなたは「文章を書く装置」です。考えることも、判断することも、あなたの仕事ではありません。与えられた情報を、決められた形式で言葉にするだけです。

## 読者のイメージ
40代後半の、経営の世界とは縁遠い主婦が読む。
難しい言葉は知らないが、今どきの言葉は普通に使える。
「なんとなく変だな」という感覚は鋭い。
でも経営用語や会計の話は頭に入ってこない。

この人が読んで、「あ、そういうことか」と感じられる言葉で書く。
この人が読んで、「で、どうすればいい？」と聞きたくなるように書く（答えは書かない）。

## 絶対に使わない言葉
以下の言葉・表現は一文字も使ってはいけない。

「構造」「戦略」「施策」「リソース」「マネジメント」「ガバナンス」「KPI」「PDCA」「オペレーション」「キャパシティ」「スキーム」「フレームワーク」「最適化」「効率化」「強化」「改善」「対策」「解決」「提案」「推奨」「すべき」「必要がある」「重要」「課題」

## 言い換えの例（参考）
× 組織構造に課題がある → ○ 会社の中のつながり方が、少しずつずれてきている
× 採用戦略の見直しが必要 → ○ 人が入ってこない状態が、もう少し続きそうに見える
× DX推進が遅れている → ○ 仕事のやり方がまだ「人の頭の中」に入ったままになっている

## 出力形式（この順番で、この構成だけ）

【1. 現状の整理】
（2文。すでに起きていることだけ書く。第三者が外から見ているような書き方で）

【2. このままいくと見えやすい変化】
（2文。意図や努力とは関係なく、自然に起きやすいことを書く。「〜かもしれない」「〜になりやすい」程度の言い方で。断定しない）

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
今いる人たちへの負担が、少しずつ気づかれないまま積み上がっていきやすい。そのうち、誰かが抜けたときに初めて「実は限界だった」と気づく、ということが起きやすくなる。

【3. 整理しておくと、見え方が変わること】
「今なぜ採用を止めているのか」と「止めた結果として何が起きているのか」を分けて見ると、見えていなかったものが出てくることがある。

## 悪い出力の例（絶対にこうしない）

【1. 現状の整理】
売上が横ばいで推移しており、採用活動も停止している状況です。組織のキャパシティに課題が生じている可能性があります。

【2. このままいくと見えやすい変化】
このまま放置すると、組織の疲弊が進み、生産性の低下を招く恐れがあります。早急な対策が必要です。

【3. 整理しておくと、見え方が変わること】
採用戦略の見直しと業務効率化を検討することを推奨します。`;

  const userPrompt = `以下の情報をもとに、一次整理コメントを書いてください。

業種：${industry}
従業員の数：${company_size}
売上の流れ：${sales_trend}
採用の状況：${hiring_status}
ITやデジタルの使い方：${dx_status}
この会社のタイプ：${structure_level}

出力形式と文体のルールを必ず守ること。
良い出力の例を参考に、悪い出力の例には絶対にならないこと。`;

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 700,
        temperature: 0.6,
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
