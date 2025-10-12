import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import {
  fetchBinanceData,
  calculateEMA,
  calculateRSI,
  calculateMACD,
} from "./tool";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYMBOL = "BTCUSDT";
const INTERVAL = "1m";
const CANDLE_LIMIT = 200;

async function fetchCandles() {
  const prices = await fetchBinanceData(SYMBOL, INTERVAL, CANDLE_LIMIT);

  for (const c of prices) {
    await prisma.candle.upsert({
      where: { timestamp: new Date(c.timestamp) },
      update: {},
      create: {
        timestamp: new Date(c.timestamp),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      },
    });
  }
  console.log("Candles updated");
}

// 2. Compute indicators
async function computeIndicators(): Promise<{
  emaShort: number;
  emaLong: number;
  rsi: number;
  macd: number;
}> {
  const candles = await prisma.candle.findMany({
    orderBy: { timestamp: "asc" },
  });
  const closes = candles.map((c) => c.close);

  const emaShort = calculateEMA(closes, 9);
  const emaLong = calculateEMA(closes, 21);
  const rsi = calculateRSI(closes, 14);

  const macd = calculateMACD(closes);

  return {
    emaShort: emaShort.slice(-1)[0],
    emaLong: emaLong.slice(-1)[0],
    rsi: rsi.slice(-1)[0],
    macd: macd.macdLine.slice(-1)[0],
  };
}

// 3. Get AI signal from OpenAI
async function getSignal(
  indicators: {
    emaShort: number;
    emaLong: number;
    rsi: number;
    macd: number;
  },
  sentimentScore = 0
) {
  const prompt = `
You are a crypto trading assistant. Based on the data below, provide a short-term BTCUSDT trading signal.
Return **ONLY** JSON in the exact format:

{
  "signal": "HOLD" | "OPEN_BUY_1" | "CLOSE_BUY_1" | "OPEN_BUY_2" | "CLOSE_BUY_2" |
            "OPEN_BUY_3" | "CLOSE_BUY_3" | "OPEN_BUY_4" | "CLOSE_BUY_4" |
            "OPEN_SELL_1" | "CLOSE_SELL_1" | "OPEN_SELL_2" | "CLOSE_SELL_2" |
            "OPEN_SELL_3" | "CLOSE_SELL_3" | "OPEN_SELL_4" | "CLOSE_SELL_4",
  "confidence": 0-100,       // integer representing confidence percentage
  "reason": "Explanation of the signal using indicators and sentiment"
}

Indicators: ${JSON.stringify(indicators)}
Sentiment score: ${sentimentScore}

Rules:
1. Do not add any text outside the JSON.
2. Always include all three fields: signal, confidence, reason.
3. Choose "HOLD" if there is no clear trade.
4. Confidence must be a number between 0 and 100.
5. Reason must explain the signal using the provided indicators and sentiment.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  console.log(response.choices[0].message.content);

  try {
    const json = JSON.parse(response.choices[0].message.content || "");
    return json;
  } catch (e) {
    console.error(
      "Failed to parse AI response:",
      response.choices[0].message.content
    );
    return { signal: "HOLD", confidence: 0, reason: "Parsing error" };
  }
}

// 4. Save signal to DB
async function saveSignal(signalData: {
  signal: string;
  confidence: number;
  reason: string;
}) {
  await prisma.signal.create({
    data: {
      timestamp: new Date(),
      signal: signalData.signal,
      confidence: signalData.confidence,
      reason: signalData.reason,
    },
  });
}

// 5. Main loop
async function run() {
  try {
    await fetchCandles();
    const indicators = await computeIndicators();
    const sentimentScore = 0; // placeholder, can add news scraping later
    const signal = await getSignal(indicators, sentimentScore);
    await saveSignal(signal);
  } catch (err) {
    console.error("Error in run loop:", err);
  }
}

// Run every 1 minute
run(); // first run immediately
setInterval(run, 120_000);
