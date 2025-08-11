import * as fs from 'fs';
import * as path from 'path';

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
  profit: number;
  profitPercentage: number;
}

function readSingleFile(filePath: string): PriceData[] {
  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const data: PriceData[] = [];
  
  for (const item of rawData) {
    data.push({
      timestamp: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5])
    });
  }

  return data.sort((a, b) => a.timestamp - b.timestamp);
}

function getHistoryFiles(historyDir: string): string[] {
  return fs.readdirSync(historyDir).filter(file => file.endsWith('.json'));
}

function findOptimalTrade(data: PriceData[]): TradeResult {
  let maxProfit = 0;
  let bestBuy = 0;
  let bestSell = 0;
  let minPrice = data[0].close;
  let minIndex = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i].close < minPrice) {
      minPrice = data[i].close;
      minIndex = i;
    }

    const profit = data[i].close - minPrice;
    if (profit > maxProfit) {
      maxProfit = profit;
      bestBuy = minIndex;
      bestSell = i;
    }
  }

  const buyPrice = data[bestBuy].close;
  const sellPrice = data[bestSell].close;
  const profitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;

  return {
    buyDate: new Date(data[bestBuy].timestamp).toISOString().split('T')[0],
    sellDate: new Date(data[bestSell].timestamp).toISOString().split('T')[0],
    buyPrice,
    sellPrice,
    profit: maxProfit,
    profitPercentage
  };
}

function main() {
  console.log("Crypto Price Analyzer - Finding Optimal Buy/Sell Dates");
  console.log("=" .repeat(60));

  try {
    const historyDir = path.join(__dirname, 'history');
    const files = getHistoryFiles(historyDir);
    
    if (files.length === 0) {
      console.log("No JSON files found in history folder");
      return;
    }

    console.log(`Found ${files.length} price history file(s)\n`);

    let totalBestProfit = 0;
    let totalBestFile = '';
    let totalBestResult: TradeResult | null = null;

    for (const file of files) {
      const filePath = path.join(historyDir, file);
      console.log(`📁 Analyzing: ${file}`);
      console.log("-" .repeat(40));

      try {
        const priceData = readSingleFile(filePath);
        
        if (priceData.length === 0) {
          console.log("  ⚠️  No price data in this file\n");
          continue;
        }

        console.log(`  📊 Records: ${priceData.length}`);
        console.log(`  📅 Date range: ${new Date(priceData[0].timestamp).toISOString().split('T')[0]} to ${new Date(priceData[priceData.length - 1].timestamp).toISOString().split('T')[0]}`);
        
        const result = findOptimalTrade(priceData);
        
        console.log(`  💰 Optimal Strategy:`);
        console.log(`     Buy Date: ${result.buyDate}`);
        console.log(`     Buy Price: $${result.buyPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`     Sell Date: ${result.sellDate}`);
        console.log(`     Sell Price: $${result.sellPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`     Profit: $${result.profit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`     Profit %: ${result.profitPercentage.toFixed(2)}%`);

        if (result.profit > totalBestProfit) {
          totalBestProfit = result.profit;
          totalBestFile = file;
          totalBestResult = result;
        }

      } catch (fileError) {
        console.log(`  ❌ Error processing file: ${fileError}`);
      }

      console.log("");
    }

    if (totalBestResult && files.length > 1) {
      console.log("🏆 BEST OVERALL OPPORTUNITY:");
      console.log("=" .repeat(60));
      console.log(`File: ${totalBestFile}`);
      console.log(`Buy Date: ${totalBestResult.buyDate}`);
      console.log(`Buy Price: $${totalBestResult.buyPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
      console.log(`Sell Date: ${totalBestResult.sellDate}`);
      console.log(`Sell Price: $${totalBestResult.sellPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
      console.log(`Profit: $${totalBestResult.profit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
      console.log(`Profit Percentage: ${totalBestResult.profitPercentage.toFixed(2)}%`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (require.main === module) {
  main();
}
