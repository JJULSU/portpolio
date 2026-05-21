import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const app = express();
const PORT = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist');

app.use(cors());
app.use(express.static(DIST));


const fetchChart = async (ticker) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  });
  const data = await response.json();
  const hasData = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  return { data, hasData };
};

app.get('/quote', async (req, res) => {
  const { code, market } = req.query;
  if (!code || !market) return res.status(400).json({ error: 'code, market 파라미터 필요' });

  // 지정 suffix 먼저, 실패 시 반대 suffix 시도
  const primary = market === 'KOSPI' ? '.KS' : '.KQ';
  const fallback = market === 'KOSPI' ? '.KQ' : '.KS';

  try {
    let { data, hasData } = await fetchChart(code + primary);
    if (!hasData) ({ data, hasData } = await fetchChart(code + fallback));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA 라우팅: 모든 경로를 index.html로
app.get('*', (req, res) => {
  res.sendFile(join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ 포트폴리오 매니저: http://localhost:${PORT}`);
  console.log('   종료하려면 Ctrl+C');
});
