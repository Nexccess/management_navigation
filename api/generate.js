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

  // ── モック：入力内容に応じてパターン分岐 ──
  // 本番切り替え時はこの関数ごとOpenAI/Claude API呼び出しに差し替える

  const salesDown  = ['横ばい','下がっている'].includes(sales_trend);
  const hiringHard = ['苦戦している','停止・未実施'].includes(hiring_status);
  const dxLow      = ['ツールはあるが属人化している','未着手'].includes(dx_status);

  let s1, s2, s3;

  if (salesDown && hiringHard) {
    s1 = `${industry}の${company_size}の会社で、売上が${sales_trend}状態のまま、人を採ることも止まっている。今いる人たちだけで仕事を回している状態が続いている。`;
    s2 = `今いる人への負担が、気づかれないまま少しずつ積み上がっていきやすい。誰かが抜けたとき初めて「実は限界だった」と気づく、ということが起きやすくなる。`;
    s3 = `「今なぜ採用を止めているのか」と「止めた結果として何が起きているか」を分けて見ると、見えていなかったものが出てくることがある。`;
  } else if (salesDown && dxLow) {
    s1 = `${industry}の${company_size}の会社で、売上が${sales_trend}傾向にある。仕事のやり方がまだ「人の頭の中」に入ったままの部分が残っている。`;
    s2 = `売上の流れが変わらないまま、仕事を知っている人への依存がじわじわ深くなっていきやすい。その人が動けなくなったとき、周りが何をすればいいかわからない、という場面が出やすくなる。`;
    s3 = `「売上が動かない理由」と「仕事の流れが人に依存している理由」が、実は同じところにつながっているかどうかを一度見てみると、見え方が変わることがある。`;
  } else if (hiringHard && dxLow) {
    s1 = `${industry}の${company_size}の会社で、採用が${hiring_status}状態にある。仕事のやり方も、まだデジタルよりも人のやり方で動いている部分が多い。`;
    s2 = `人が入ってきにくい状態と、仕事が人に紐づいている状態が重なると、今いる人の「抜けられなさ」が少しずつ強くなっていきやすい。それが長く続くと、辞めたくても辞めづらい空気が生まれやすくなる。`;
    s3 = `「なぜ人が来ないのか」を外から見るとき、給料や条件だけでなく「この会社で働くイメージが湧くかどうか」という角度から見ると、違うものが見えてくることがある。`;
  } else {
    s1 = `${industry}の${company_size}の会社で、売上は${sales_trend}、採用は${hiring_status}という状態にある。全体として今の状態が「安定しているのか、止まっているのか」が外からは判断しにくい状況になっている。`;
    s2 = `今の状態が続くと、変化のきっかけが見えにくいまま時間が過ぎていきやすい。「何かしなきゃ」という感覚だけが先に積み上がって、何から手をつければいいかが見えなくなることがある。`;
    s3 = `「今うまくいっていること」と「たまたまうまくいっていること」を分けて見ると、次に何が起きやすいかが少し見えやすくなることがある。`;
  }

  const result = `【1. 現状の整理】
${s1}

【2. このままいくと見えやすい変化】
${s2}

【3. 整理しておくと、見え方が変わること】
${s3}`;

  // 本番らしさのため少し遅延（削除してOK）
  await new Promise(r => setTimeout(r, 800));

  return res.status(200).json({ result });
}
