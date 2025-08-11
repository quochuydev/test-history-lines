import * as fs from "fs";
import * as path from "path";
import { FetchConfig, getTodayString, generateFileName } from "./utils";

const data: FetchConfig[] = [
  // // BTC
  // {
  //   symbol: "BTCUSDT",
  //   interval: "1d",
  //   limit: 365, // 365 days
  // },
  // {
  //   symbol: "BTCUSDT",
  //   interval: "1h",
  //   limit: 1 * 24 * 90, // 90 days
  // },
  // // SOL
  // {
  //   symbol: "SOLUSDT",
  //   interval: "1d",
  //   limit: 365, // 365 days
  // },
  // {
  //   symbol: "SOLUSDT",
  //   interval: "1d",
  //   limit: 30, // 30 days
  // },
  // {
  //   symbol: "SOLUSDT",
  //   interval: "1d",
  //   limit: 60, // 60 days
  // },
  // {
  //   symbol: "SOLUSDT",
  //   interval: "1d",
  //   limit: 90, // 90 days
  // },
  // {
  //   symbol: "SOLUSDT",
  //   interval: "15m",
  //   limit: 15 * 4 * 24 * 30, // 30 days
  // },
  // ETH
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
];

async function fetchBinanceData(config: FetchConfig): Promise<any[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${config.symbol}&interval=${config.interval}&limit=${config.limit}`;

  console.log(`Fetching ${config.symbol} ${config.interval} data...`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as any[];
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${config.symbol}:`, error);
    throw error;
  }
}

async function saveDataToFile(data: any[], fileName: string): Promise<void> {
  const historyDir = path.join(__dirname, "history");

  // Create history directory if it doesn't exist
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

  const filePath = path.join(historyDir, fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${data.length} records to ${fileName}`);
  } catch (error) {
    console.error(`Error saving file ${fileName}:`, error);
    throw error;
  }
}

async function fetchAllData(): Promise<void> {
  console.log("🚀 Starting Binance data fetch...");
  console.log(`📅 Date: ${getTodayString()}`);
  console.log("=".repeat(50));

  let successCount = 0;
  let errorCount = 0;

  for (const config of data) {
    try {
      const klineData = await fetchBinanceData(config);
      const fileName = generateFileName(
        config.symbol,
        config.interval,
        config.limit
      );
      await saveDataToFile(klineData, fileName);
      successCount++;

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(
        `❌ Failed to fetch ${config.symbol} ${config.interval}:`,
        error
      );
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Summary: ${successCount} successful, ${errorCount} failed`);

  if (successCount > 0) {
    console.log(`\n💡 Run 'npm run dev' to analyze the downloaded data`);
  }
}

// Run the fetch if this file is executed directly
if (require.main === module) {
  fetchAllData().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { fetchAllData };
