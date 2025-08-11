Get data from https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=&limit=100

Use `fetch`, write to history folder name template: <SYMBOL>-<interval>-<today>.json

Examples:

- BTCUSDT-1d-20250811.json
- ETHUSDT-1d-20250811.json
- SOLUSDT-1d-20250811.json
- BTCUSDT-1h-20250811.json
- SOLUSDT-15m-20250811.json

input:

```typescript
const data = [
  {
    symbol: "BTCUSDT",
    interval: "1d",
    limit: 365,
  },
  {
    symbol: "ETHUSDT",
    interval: "1d",
    limit: 365,
  },
  {
    symbol: "SOLUSDT",
    interval: "1d",
    limit: 365,
  },
  {
    symbol: "BTCUSDT",
    interval: "1h",
    limit: 1 * 24 * 90, // 90 days
  },
  {
    symbol: "SOLUSDT",
    interval: "15m",
    limit: 60 * 0.4 * 24 * 90, // 90 days
  },
];
```
