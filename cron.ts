import cron from "node-cron";
import OpenAI from "openai";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
prisma.$connect();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface FetchConfig {
  symbol: string;
  interval: string;
  limit: number;
}

interface TradeState {
  orderNumber: number;
  position: "BUY" | "SELL" | "HOLD" | null;
}

const trades: Record<string, TradeState> = {};
let isRunning = false;

const limit = 50;

cron.schedule("* * * * *", async () => {
  if (isRunning) {
    console.log("Previous job still running... skipping this tick");
    return;
  }
  isRunning = true;

  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Running cron task...`);

    const symbols = ["BTCUSDT"];

    for (const symbol of symbols) {
      const data = await fetchBinanceData({
        symbol,
        interval: "1m",
        limit: limit,
      });
      const prices = data.map((i) => {
        return {
          close: i.close,
          timestamp: i.timestamp,
        };
      });
      const signal = await getSignal(symbol, prices);

      await traceOrderDB(symbol, signal);
    }
  } catch (err) {
    console.error("Error in cron task:", err);
  } finally {
    isRunning = false;
  }
});

async function getSignal(
  symbol: string,
  prices: Array<{ close: number; timestamp: number }>
): Promise<"BUY" | "SELL" | "HOLD"> {
  const prompt = `
    You are a trading signal analyzer for ${symbol}.
    You are given ${limit} 1-minute close prices.
    Decide if the signal should be "BUY", "SELL", or "HOLD".
    Return ONLY the single word: BUY, SELL, or HOLD.
    prices: [${prices}]
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert crypto analyst.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  const raw = response.choices?.[0]?.message?.content?.trim().toUpperCase();
  return raw as "BUY" | "SELL" | "HOLD";
}

async function traceOrderDB(symbol: string, signal: "BUY" | "SELL" | "HOLD") {
  if (!trades[symbol]) {
    trades[symbol] = { orderNumber: 0, position: null };
  }
  const ts = new Date();

  const state = trades[symbol];

  if (state.position === null && signal === "BUY") {
    state.orderNumber++;
    state.position = "BUY";
    console.log(`[${symbol}] BUY order ${state.orderNumber} opened`);

    await prisma.order.create({
      data: {
        symbol,
        orderNumber: state.orderNumber,
        signal: "BUY",
        position: "OPEN",
        timestamp: ts,
      },
    });
  } else if (state.position === "BUY" && signal === "HOLD") {
    console.log(`[${symbol}] HOLD order ${state.orderNumber}`);
    await prisma.order.create({
      data: {
        symbol,
        orderNumber: state.orderNumber,
        signal: "HOLD",
        position: "OPEN",
        timestamp: ts,
      },
    });
  } else if (state.position === "BUY" && signal === "SELL") {
    console.log(`[${symbol}] CLOSE order ${state.orderNumber}`);
    await prisma.order.create({
      data: {
        symbol,
        orderNumber: state.orderNumber,
        signal: "SELL",
        position: "CLOSED",
        timestamp: ts,
      },
    });

    state.position = "SELL";
    state.orderNumber++;
    console.log(`[${symbol}] SELL order ${state.orderNumber} opened`);
    await prisma.order.create({
      data: {
        symbol,
        orderNumber: state.orderNumber,
        signal: "SELL",
        position: "OPEN",
        timestamp: ts,
      },
    });
  } else if (state.position === "SELL" && signal === "BUY") {
    console.log(`[${symbol}] CLOSE order ${state.orderNumber}`);
    await prisma.order.create({
      data: {
        symbol,
        orderNumber: state.orderNumber,
        signal: "BUY",
        position: "CLOSED",
        timestamp: ts,
      },
    });

    state.position = "BUY";
    state.orderNumber++;
    console.log(`[${symbol}] BUY order ${state.orderNumber} opened`);
    await prisma.order.create({
      data: {
        symbol,
        orderNumber: state.orderNumber,
        signal: "BUY",
        position: "OPEN",
        timestamp: ts,
      },
    });
  } else {
    console.log(`[${symbol}] Signal: ${signal} (no state change)`);
    await prisma.order.create({
      data: {
        symbol,
        orderNumber: state.orderNumber,
        signal: signal,
        position: state.position === null ? "OPEN" : state.position,
        timestamp: ts,
      },
    });
  }
}

async function fetchBinanceData(config: FetchConfig): Promise<PriceData[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${config.symbol}&interval=${config.interval}&limit=${config.limit}`;
  console.log(`Fetching ${config.symbol} ${config.interval} data...`);

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

  const rawData = (await resp.json()) as any[];

  const data: PriceData[] = rawData.map((item) => ({
    timestamp: item[0],
    open: +item[1],
    high: +item[2],
    low: +item[3],
    close: +item[4],
    volume: +item[5],
  }));

  return data.sort((a, b) => a.timestamp - b.timestamp);
}
