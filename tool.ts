export async function fetchBinanceData(
  symbol: "BTCUSDT",
  interval: string,
  limit: number
): Promise<
  {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[]
> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  return (data as any)
    .map((d: any) => ({
      timestamp: +d[0],
      open: +d[1],
      high: +d[2],
      low: +d[3],
      close: +d[4],
      volume: +d[5],
    }))
    .sort((a: any, b: any) => a.timestamp - b.timestamp);
}

export function calculateEMA(values: number[], period: number) {
  const k = 2 / (period + 1);
  let emaArray = [];
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period; // simple MA first
  emaArray[period - 1] = ema;

  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
    emaArray[i] = ema;
  }

  return emaArray;
}

export function calculateRSI(values: number[], period = 14) {
  let gains = 0,
    losses = 0;
  let rsiArray = [];

  // initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) gains += diff;
    else losses += -diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsiArray[period] = 100 - 100 / (1 + avgGain / avgLoss);

  // rest of RSI
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rsiArray[i] = 100 - 100 / (1 + avgGain / avgLoss);
  }

  return rsiArray;
}

export function calculateMACD(values: number[]) {
  const ema12 = calculateEMA(values, 12);
  const ema26 = calculateEMA(values, 26);
  let macdLine = [];
  for (let i = 0; i < values.length; i++) {
    macdLine[i] = (ema12[i] || 0) - (ema26[i] || 0);
  }
  const signalLine = calculateEMA(macdLine, 9);
  let histogram = macdLine.map((v, i) => v - (signalLine[i] || 0));
  return { macdLine, signalLine, histogram };
}
