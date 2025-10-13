import "dotenv/config";
import express from "express";
import fs from "fs";
import { Liquid } from "liquidjs";
// import OpenAI from "openai";
import { createOllamaService } from "./ollama";
import {
  calculateEMA,
  calculateMACD,
  calculateRSI,
  fetchBinanceData,
} from "./tool";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ollama = createOllamaService("llama3.1:8b");

const SYMBOL = "BTCUSDT";
const INTERVAL = "5m";
const CANDLE_LIMIT = 70;

async function computeIndicators(
  prices: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>
): Promise<{
  emaShort: number;
  emaLong: number;
  rsi: number;
  macd: number;
}> {
  const closes = prices.map((c) => c.close);
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

async function getSignal(params: {
  prices: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  indicators: {
    emaShort: number;
    emaLong: number;
    rsi: number;
    macd: number;
  };
  sentimentScore: number;
}) {
  const { prices, indicators } = params;

  const prompt = `
You are a crypto trading assistant. Based on the data below, provide a short-term BTCUSDT trading signal.
- Forex MetaTrader 5
- Sort term trading in chart ${INTERVAL}

Return **ONLY** JSON in the exact format:

{
  "signal": "HOLD" | "OPEN_BUY" | "CLOSE_BUY" | "OPEN_SELL" | "CLOSE_SELL"
  "confidence": 0-100,       // Integer representing confidence percentage
  "TP": number,              // Take profit
  "reason": "Explanation of the signal using indicators and sentiment"
}

Prices: ${JSON.stringify(
    prices.map((p) => ({ timestamp: p.timestamp, close: p.close }))
  )}
Indicators: ${JSON.stringify(indicators)}

Rules:
1. Do not add any text outside the JSON.
2. Always include all three fields: signal, confidence, reason.
3. Choose "HOLD" if there is no clear trade.
4. Confidence must be a number between 0 and 100.
5. Reason must explain the signal using the provided indicators and sentiment.
`;

  fs.writeFileSync(`./prompts/${Date.now()}.txt`, prompt);

  console.time("start");
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4-turbo",
  //   messages: [{ role: "user", content: prompt }],
  //   temperature: 0.3,
  // });
  // const content = response.choices[0].message.content
  const content = await ollama.generateAnswer("", prompt);
  console.timeEnd("start");
  console.log(content);

  try {
    const json = JSON.parse(content || "");
    return json;
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return { signal: "HOLD", confidence: 0, reason: "Parsing error" };
  }
}

async function run() {
  try {
    const prices = await fetchBinanceData(SYMBOL, INTERVAL, CANDLE_LIMIT);
    const indicators = await computeIndicators(prices);
    const sentimentScore = 0;
    const signal = await getSignal({ indicators, sentimentScore, prices });
    broadcastAlert(signal);
  } catch (err) {
    console.error("Error in run loop:", err);
  }
}

run();
setInterval(run, 1000 * 60 * 5);

const app = express();
const PORT = 3333;
const engine = new Liquid();

app.engine("liquid", engine.express());
app.set("views", "./views"); // folder for Liquid templates
app.set("view engine", "liquid");

const clients: any[] = [];

app.get("/", (req, res) => {
  res.render("dashboard", { title: "Trading Alerts" });
});

app.get("/alerts", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });
});

export function broadcastAlert(signal: any) {
  const data = `data: ${JSON.stringify(signal)}\n\n`;
  clients.forEach((res) => res.write(data));
}

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
