import { FetchConfig } from "./utils";

export const data: FetchConfig[] = [
  {
    symbol: "BTCUSDT",
    interval: "1h",
    limit: 1 * 24 * 90, // 90 days
  },
  {
    symbol: "BTCUSDT",
    interval: "1d",
    limit: 365, // 365 days
  },
  {
    symbol: "ETHUSDT",
    interval: "15m",
    limit: 15 * 4 * 24 * 30, // 30 days
  },
  {
    symbol: "ETHUSDT",
    interval: "1d",
    limit: 30, // 30 days
  },
  {
    symbol: "ETHUSDT",
    interval: "1d",
    limit: 60, // 60 days
  },
  {
    symbol: "ETHUSDT",
    interval: "1d",
    limit: 90, // 90 days
  },
  {
    symbol: "ETHUSDT",
    interval: "1d",
    limit: 365, // 365 days
  },
  {
    symbol: "SOLUSDT",
    interval: "15m",
    limit: 15 * 4 * 24 * 30, // 30 days
  },
  {
    symbol: "SOLUSDT",
    interval: "1d",
    limit: 30, // 30 days
  },
  {
    symbol: "SOLUSDT",
    interval: "1d",
    limit: 60, // 60 days
  },
  {
    symbol: "SOLUSDT",
    interval: "1d",
    limit: 90, // 90 days
  },
  {
    symbol: "SOLUSDT",
    interval: "1d",
    limit: 365, // 365 days
  },
];
