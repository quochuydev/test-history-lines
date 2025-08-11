import * as fs from "fs";
import * as path from "path";
import { FetchConfig, generateFileName } from "./utils";

const INVESTMENT_AMOUNT = 100; // Default investment amount in USD

const data: FetchConfig[] = [
  {
    symbol: "BTCUSDT",
    interval: "1d",
    limit: 365, // 365 days
  },
  {
    symbol: "BTCUSDT",
    interval: "1h",
    limit: 1 * 24 * 90, // 90 days
  },
  {
    symbol: "ETHUSDT",
    interval: "1d",
    limit: 365, // 365 days
  },
  {
    symbol: "ETHUSDT",
    interval: "15m",
    limit: 15 * 4 * 24 * 30, // 30 days
  },
];

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradeResult {
  buyDate: string;
  sellDate: string;
  buyPrice: number;
  sellPrice: number;
  investmentAmount: number;
  sharesCount: number;
  sellValue: number;
  profit: number;
  profitPercentage: number;
}

function readSingleFile(filePath: string): PriceData[] {
  const rawData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const data: PriceData[] = [];

  for (const item of rawData) {
    data.push({
      timestamp: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    });
  }

  return data.sort((a, b) => a.timestamp - b.timestamp);
}

function findOptimalTrade(
  data: PriceData[],
  investmentAmount: number = INVESTMENT_AMOUNT
): TradeResult {
  let maxProfitPercentage = 0;
  let bestBuy = 0;
  let bestSell = 0;
  let minPrice = data[0].close;
  let minIndex = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i].close < minPrice) {
      minPrice = data[i].close;
      minIndex = i;
    }

    const profitPercentage = ((data[i].close - minPrice) / minPrice) * 100;
    if (profitPercentage > maxProfitPercentage) {
      maxProfitPercentage = profitPercentage;
      bestBuy = minIndex;
      bestSell = i;
    }
  }

  const buyPrice = data[bestBuy].close;
  const sellPrice = data[bestSell].close;
  const sharesCount = investmentAmount / buyPrice;
  const sellValue = sharesCount * sellPrice;
  const profit = sellValue - investmentAmount;
  const profitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;

  return {
    buyDate: new Date(data[bestBuy].timestamp).toISOString().split("T")[0],
    sellDate: new Date(data[bestSell].timestamp).toISOString().split("T")[0],
    buyPrice,
    sellPrice,
    investmentAmount,
    sharesCount,
    sellValue,
    profit,
    profitPercentage,
  };
}

function generateMarkdownContent(
  results: Array<{
    file: string;
    result: TradeResult;
    records: number;
    dateRange: string;
  }>
): string {
  let markdown = `# Crypto Price Analyzer - Finding Optimal Buy/Sell Dates\n\n`;
  markdown += `**Investment Amount:** $${INVESTMENT_AMOUNT.toLocaleString(
    "en-US"
  )}\n`;
  markdown += `**Analysis Date:** ${new Date().toISOString().split("T")[0]}\n`;
  markdown += `**Total Configurations:** ${data.length}\n`;
  markdown += `**Files Successfully Analyzed:** ${results.length}\n\n`;

  markdown += `## Data Configurations\n\n`;
  markdown += `| Symbol | Interval | Limit | Expected File |\n`;
  markdown += `|--------|----------|-------|---------------|\n`;

  for (const config of data) {
    const fileName = generateFileName(
      config.symbol,
      config.interval,
      config.limit
    );
    const analyzed = results.some((r) => r.file === fileName) ? "✅" : "❌";
    markdown += `| ${config.symbol} | ${config.interval} | ${config.limit} | ${fileName} ${analyzed} |\n`;
  }

  markdown += `\n## Analysis Results\n\n`;

  if (results.length > 0) {
    markdown += `| File | Date Range | Buy Date | Buy Price | Sell Date | Sell Price | Shares | Sell Value | Profit | Profit % |\n`;
    markdown += `|------|------------|----------|-----------|-----------|------------|--------|------------|--------|-----------|\n`;

    for (const { file, result, records, dateRange } of results) {
      markdown += `| ${file} | ${dateRange} | ${
        result.buyDate
      } | $${result.buyPrice.toFixed(2)} | ${
        result.sellDate
      } | $${result.sellPrice.toFixed(2)} | ${result.sharesCount.toFixed(
        8
      )} | $${result.sellValue.toFixed(2)} | $${result.profit.toFixed(
        2
      )} | ${result.profitPercentage.toFixed(2)}% |\n`;
    }

    markdown += `\n## Summary\n`;
    markdown += `- **Best Profit:** ${
      results[0].file
    } with $${results[0].result.profit.toFixed(
      2
    )} (${results[0].result.profitPercentage.toFixed(2)}%)\n`;
    markdown += `- **Average Profit:** $${(
      results.reduce((sum, r) => sum + r.result.profit, 0) / results.length
    ).toFixed(2)}\n`;
    markdown += `- **Total Records Processed:** ${results
      .reduce((sum, r) => sum + r.records, 0)
      .toLocaleString()}\n`;
  }

  return markdown;
}

function saveResultsToFile(content: string): string {
  const resultsDir = path.join(__dirname, "results");

  // Create results directory if it doesn't exist
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp =
    new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
    "_" +
    new Date().toISOString().replace(/[:.]/g, "-").split("T")[1].split(".")[0];
  const fileName = `analysis-${timestamp}.md`;
  const filePath = path.join(resultsDir, fileName);

  fs.writeFileSync(filePath, content);
  return fileName;
}

function main() {
  console.log("# Crypto Price Analyzer - Finding Optimal Buy/Sell Dates");
  console.log(
    `**Investment Amount:** $${INVESTMENT_AMOUNT.toLocaleString("en-US")}\n`
  );

  try {
    const historyDir = path.join(__dirname, "history");
    const results: Array<{
      file: string;
      result: TradeResult;
      records: number;
      dateRange: string;
    }> = [];

    // Process files based on the data array configurations
    for (const config of data) {
      const fileName = generateFileName(
        config.symbol,
        config.interval,
        config.limit
      );
      const filePath = path.join(historyDir, fileName);

      try {
        if (!fs.existsSync(filePath)) {
          console.log(
            `⚠️ File not found: ${fileName} (run 'npm run fetch' to download data)`
          );
          continue;
        }

        const priceData = readSingleFile(filePath);

        if (priceData.length === 0) {
          console.log(`⚠️ No price data in ${fileName}`);
          continue;
        }

        const result = findOptimalTrade(priceData);
        const dateRange = `${
          new Date(priceData[0].timestamp).toISOString().split("T")[0]
        } to ${
          new Date(priceData[priceData.length - 1].timestamp)
            .toISOString()
            .split("T")[0]
        }`;

        results.push({
          file: fileName,
          result,
          records: priceData.length,
          dateRange,
        });
      } catch (fileError) {
        console.log(`❌ Error processing ${fileName}: ${fileError}`);
      }
    }

    if (results.length > 0) {
      // Sort by profit percentage descending
      results.sort(
        (a, b) => b.result.profitPercentage - a.result.profitPercentage
      );

      console.log(
        "| File | Date Range | Buy Date | Buy Price | Sell Date | Sell Price | Shares | Sell Value | Profit | Profit % |"
      );
      console.log(
        "|------|------------|----------|-----------|-----------|------------|--------|------------|--------|----------|"
      );

      for (const { file, result, records, dateRange } of results) {
        console.log(
          `| ${file} | ${dateRange} | ${
            result.buyDate
          } | $${result.buyPrice.toFixed(2)} | ${
            result.sellDate
          } | $${result.sellPrice.toFixed(2)} | ${result.sharesCount.toFixed(
            8
          )} | $${result.sellValue.toFixed(2)} | $${result.profit.toFixed(
            2
          )} | ${result.profitPercentage.toFixed(2)}% |`
        );
      }

      // Generate and save markdown file
      const markdownContent = generateMarkdownContent(results);
      const fileName = saveResultsToFile(markdownContent);

      console.log(`\n📄 Results saved to: ./results/${fileName}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (require.main === module) {
  main();
}
