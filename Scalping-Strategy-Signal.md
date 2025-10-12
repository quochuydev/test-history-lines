Mar 30
Overview

This Pine Script (v6) implements a scalping strategy that uses higher timeframe data (default: 4H) to generate entry and exit signals, originally designed for the 15-minute timeframe with an option for 30-minute charts. The "Scalping Strategy Signal v2 by [INFINITYTRADER]" integrates moving averages, RSI, volume, ATR, and candlestick patterns to identify trading opportunities. It features adjustable risk management with ATR-based stop-loss, take-profit, and trailing stops, plus dynamic position sizing based on user-set capital. Trades trigger only on the higher timeframe candle close (e.g., 4H) to limit activity within the same period. This closed-source script offers a structured scalping approach, blending multiple entry methods and risk controls for adaptability across market conditions.

What Makes It Unique

Unlike typical scalping scripts relying on single-indicator triggers (e.g., RSI alone or basic MA crossovers), this strategy combines four distinct entry methods—standard MA crossovers, RSI-based momentum shifts, trend-following shorts, and candlestick pattern logic—evaluated on a 4H timeframe for confirmation. This multi-layered design, paired with re-entry logic after losses and a mix of manual, ATR-based, and trailing exits, aims to balance trade frequency and reliability. The higher timeframe filter adds precision not commonly found in simpler scalping tools, while the 30-minute option enhances consistency by reducing noise.

How It Works

Timeframe Logic
Runs on a base timeframe (designed for 15-minute charts, with a 30-minute option) while pulling data from a user-chosen higher timeframe (default: 4H) for signal accuracy.
Limits entries to the close of each 4H candle, ensuring one trade per period to avoid over-trading in volatile conditions.

Indicators and Data
Moving Averages: Employs 21-period and 50-period simple moving averages on the higher timeframe to detect trends and signal entries/exits.
Volume: Requires volume to exceed 70% of its 20-period average on the higher timeframe for momentum confirmation.
RSI: Uses a 14-period RSI for overbought/oversold filtering and a 6-period RSI for precise entry timing.
ATR: Applies a 14-period Average True Range on the higher timeframe to set adaptive stop-loss and take-profit levels.
Candlestick Patterns: Analyzes consecutive green or red 4H bars for trend continuation signals.

Why These Indicators

The blend of moving averages, RSI, volume, ATR, and candlestick patterns forms a robust scalping framework. Moving averages establish trend context, RSI filters momentum and avoids extremes, volume confirms market activity, ATR adjusts risk to volatility, and candlestick patterns enhance entry timing with price action insights. Together, they target small, frequent moves in flat or trending markets, with the 4H filter reducing false signals common in lower-timeframe scalping.

Entry Conditions

Four entry methods are evaluated at the 4H candle close:
Standard Long Entry: Price crosses above the 21-period moving average, volume exceeds 70% of its 20-period average, and the 1H 14-period RSI is below 70—confirms uptrend momentum.
Special Long Entry: The 6-period RSI crosses above 23, price is more than 1.5 times the ATR from the 21-period moving average, and price exceeds its prior close—targets oversold bounces with a stop-loss at the 4H candle’s low.
Short Entries:

- RSI-Based: The 6-period RSI crosses below 68 with volume support—catches overbought pullbacks.
- Trend-Based: Price crosses below the 21-period moving average, volume is above 70% of its average, and the 1H 14-period RSI is above 30—confirms downtrends.
  Red/Green Bar Logic: Two consecutive green 4H bars for longs or red 4H bars for shorts—uses candlestick patterns for continuation, with a tight stop-loss from the base timeframe candle.

Re-Entry Logic
Long: After a losing special long, triggers when the 6-period RSI crosses 27 and price crosses the 21-period moving average.
Short: After a losing short, triggers when the 6-period RSI crosses 50 and price crosses below the 21-period moving average.
Purpose: Offers recovery opportunities with stricter conditions.

Exit Conditions
Manual Exits: Longs close if the 21-period MA crosses below the 50-period MA or the 1H 14-period RSI exceeds 68; shorts close if the 21-period MA crosses above the 50-period MA or RSI drops below 25.
ATR-Based TP/SL: Stop-loss is entry price ± ATR × 1.5 (default); take-profit is ± ATR × 4 (default), checked at 4H close.
Trailing Stop: Adjusts ±6x ATR from peak/trough, closing if price retraces within 1x ATR.
Special/Tight SL: Special longs exit if price opens below the 4H candle’s low; 4th method entries use the base timeframe candle’s low/high, checked every bar.

Position Sizing
Bases trade value on user-set capital (default: 100 USDT), dividing by the higher timeframe close price for dynamic sizing.

Visualization
Displays a table at the bottom-right with current/previous signals, TP/SL levels, equity, trading pair, and trade size—color-coded for clarity (green for buy, red for sell).

Inputs
Initial Capital (USDT): Sets trade value (default: 100, min: 1).
ATR Stop-Loss Multiplier: Adjusts SL distance (default: 1.5, min: 1).
ATR Take-Profit Multiplier: Adjusts TP distance (default: 4, min: 1).
Higher Timeframe: Selects analysis timeframe (options: 1m, 5m, 15m, 30m, 1H, 4H, D, W; default: 4H).

Usage Notes
Intended Timeframe: Designed for 15-minute charts with 4H confirmation for precision and frequency; 30-minute charts improve consistency by reducing noise.
Backtesting: Adjust ATR multipliers and capital to match your asset’s volatility and risk tolerance.
Risk Management: Combines manual, ATR, and trailing exits—monitor to avoid overexposure.
Limitations: 4H candle-close dependency may delay entries in fast markets; RSI/volume filters can reduce trades in low-momentum periods.

Backtest Observations

Tested on BTC/USDT (4H higher timeframe, default settings: Initial Capital: 100 USDT, ATR SL: 1.5x, ATR TP: 4x) across market conditions, comparing 15-minute and 30-minute charts:

Bull Market (Jul 2023 - Dec 2023):
15-Minute: 277 long, 219 short; Win Rate: 42.74%; P&L: 108%; Drawdown: 1.99%; Profit Factor: 3.074.
30-Minute: 257 long, 215 short; Win Rate: 49.58%; P&L: 116.85%; Drawdown: 2.34%; Profit Factor: 3.14.
Notes: Moving average crossovers and green bar patterns suited this bullish phase; 30-minute improved win rate and P&L by filtering weaker signals.

Bear Market (Jan 2022 - Jun 2022):
15-Minute: 262 long, 211 short; Win Rate: 44.4%; P&L: 239.80%; Drawdown: 3.74%; Profit Factor: 3.419.
30-Minute: 250 long, 200 short; Win Rate: 52.22%; P&L: 258.77%; Drawdown: 5.34%; Profit Factor: 3.461.
Notes: Red bar patterns and RSI shorts thrived in the downtrend; 30-minute cut choppy reversals for better consistency.

Flat Market (Jan 2021 - Jun 2021):
15-Minute: 280 long, 208 short; Win Rate: 51.84%; P&L: 340.33%; Drawdown: 9.59%; Profit Factor: 2.924.
30-Minute: 270 long, 209 short; Win Rate: 55.11%; P&L: 315.42%; Drawdown: 7.21%; Profit Factor: 2.598.
Notes: High trade frequency and P&L showed strength in ranges; 30-minute lowered drawdown for better risk control.

Results reflect historical performance on BTC/USDT with default settings—users should test on their assets and timeframes. Past performance does not guarantee future results and is shared only to illustrate the strategy’s behavior.

Why It Works Well in Flat Markets

A "flat market" lacks strong directional trends, with price oscillating around moving averages, as in Jan 2021 - Jun 2021 for BTC/USDT. This strategy excels here because its crossover-based entries trigger frequently in tight ranges. In trending markets, an exit might not be followed by a new entry without a pullback, but flat markets produce multiple crossovers, enabling more trades. ATR-based TP/SL and trailing stops capture these small swings, while RSI and volume filters ensure momentum, driving high P&L and win rates.

Technical Details
Built in Pine Script v6 for TradingView compatibility.
Prevents overlapping trades with long/short checks.
Handles edge cases like zero division and auto-detects the trading pair’s base currency (e.g., BTC from BTCUSDT).

This strategy suits scalpers seeking structured entries and risk management. Test on 15-minute or 30-minute charts to match your style and market conditions.
Apr 3
Release Notes
I've fixed some bugs in the script and added a proper take profit for the 4th entry. If you're using replay mode, keep in mind that replay speed affects the data. Also, live trading results may differ from backtests due to slippage and other factors. Feel free to test it out, and let me know if you have any feedback!
Apr 14
Release Notes
Key Improvements

Locked-In Profit Mechanism (Customizable)
This version introduces a locked-in profit feature designed to secure gains once a trade moves favorably. The lock-in level is adjustable to suit different assets or trader preferences.
This function is especially useful in volatile markets, helping to protect profits from reversing. However, as with any trading tool, it can act as a double-edged sword—locking in too early may cut off larger potential moves. Please backtest on the specific asset you intend to trade to ensure optimal configuration.

Refined Take-Profit and Stop-Loss Table Display
The TP and SL metrics are now accurately displayed and calculated based on your strategy input parameters. This provides improved clarity and precision when reviewing trade performance.

Lock-in Evaluation Timeframe
The locked-in profit logic is evaluated on a 120-minute timeframe. This is intentionally designed to reduce over-sensitivity to short-term price fluctuations and avoid premature exits due to minor volatility.

Strategy Behavior and Practical Considerations

Fully Automated Execution
This strategy is built for full automation. Manual intervention—such as manually closing trades or adjusting parameters during active sessions—can interfere with the algorithm’s rhythm.
It typically takes around two days after activation for the strategy to properly “align” with the asset. Once this alignment is achieved, the system tends to deliver more accurate and consistent trade entries.

Backtest vs. Live Discrepancy
Live results will not exactly mirror backtest performance. TradingView’s backtest engine uses idealized conditions: trades are executed only at candle close, and it does not simulate intrabar price movements, slippage, or live market execution delays. Therefore, backtests should be used as guidance—not absolute prediction.

Manual Use Option
For discretionary traders, the strategy also supports manual execution via alerts. You can configure alerts for signal conditions and choose to evaluate and enter trades manually. This provides a semi-automated alternative while maintaining full control over entries.

For feedback, questions, or improvement suggestions, feel free to reach out.
Wishing you steady gains and smart trading.
Jun 25
Release Notes
Thank you for your continued interest and valuable feedback.

We’ve updated the script to improve clarity, performance, and trade quality. This latest version enters cleaner setups with enhanced filtering aiming to increase win rates while maintaining healthy drawdown levels. The visuals have also been designed for ease of use, helping traders quickly identify potential setups on the chart.

For Manual Traders
This strategy is primarily created with manual traders in mind. While the logic provides a solid framework, we encourage you to take an active role in how you manage your trades. You're free to adjust exit conditions based on your risk appetite, timeframe, and market context.

Proper Setup is Key
One of the most important things to note: the input settings you choose will significantly impact your results. This script is flexible and responsive but only if configured correctly. A minor change in settings can shift outcomes dramatically, so we highly recommend taking time to optimize your inputs to match your trading style and market conditions.

Strategy vs. Real-Time Behavior
If you’ve used TradingView strategies before, you’ll know that alerts can only trigger at candle close. This limitation means alerts may not always match what you see visually in real-time. It’s not a bug but rather a platform constraint. Because of this, automation using strategies often requires custom workarounds, and even then, the sync isn’t always ideal.

Replay Mode Clarification
In bar replay mode, some users notice differences in order fill behavior. This is expected replay loads candles sequentially, often missing full real-time context, which can lead to slight discrepancies, especially in more dynamic strategies.

Indicator Version (Beta)
To address many of these issues, we’re now developing an indicator version of the strategy. This will allow alerts to be triggered mid-candle, making it more responsive for those who still want alert functionality without the strategy limitations. If you'd like to test it out or share your insights, feel free to DM me.

Need Help Setting Up or Reading Signals?
If you’d like guidance on how to properly set up your chart, understand the signals, or learn how to validate and invalidate trades more effectively, reach out directly. We’re here to support thoughtful, manual trading not just automation.

For feedback, questions, or suggestions for improvement, feel free to reach out.
When in doubt, zoom out. Context creates conviction.
Wishing you steady gains and smart trading. Happy trading!
Jun 26
Release Notes
updated the script with additional input options for better customization and a more flexible setup experience
