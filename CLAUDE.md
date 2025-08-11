# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a cryptocurrency price analysis tool that processes historical candlestick data from JSON files to find optimal buy/sell opportunities for maximum profit. The application analyzes each price history file separately and identifies the best single-transaction profit potential.

## Development Commands

- `npm run fetch` - Download fresh cryptocurrency price data from Binance API
- `npm run dev` - Run the price analyzer application using tsx
- The main entry point is `main.ts` which can be executed directly

## Architecture

### Core Components

- **main.ts** - Main application entry point containing:
  - `PriceData` interface: Structured candlestick data (timestamp, OHLCV)
  - `TradeResult` interface: Optimal trade results with dates, prices, and profit metrics
  - `readSingleFile()`: Parses individual JSON files into PriceData arrays
  - `findOptimalTrade()`: Implements single-pass algorithm to find maximum profit opportunity
  - `main()`: Orchestrates analysis of all files and displays results

### Data Structure

The application expects JSON files in the `history/` directory containing arrays of candlestick data:
```
[timestamp, open, high, low, close, volume, close_timestamp, quote_volume, count, taker_buy_base_volume, taker_buy_quote_volume, ignore]
```

Only the first 6 values are used (timestamp through volume).

### Algorithm

Uses a linear-time algorithm to find optimal buy/sell dates:
- Tracks minimum price seen so far while iterating chronologically
- Calculates profit at each point by comparing current price to tracked minimum
- Maintains best buy/sell indices for maximum profit scenario

### Output Format

- Analyzes each JSON file individually with file name logging
- Shows record counts, date ranges, and optimal strategies per file
- Displays best overall opportunity when multiple files are processed
- Formats prices with proper currency notation and percentage calculations