# FxMathQuant Strategy Finder - User Manual

**AI-Powered Trading Strategy Generator**

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [License Activation](#license-activation)
3. [Exporting Data from MT4/MT5](#exporting-data)
4. [Uploading Data](#uploading-data)
5. [Configuring Strategy Generation](#configuration)
6. [Generating Strategies](#generation)
7. [Viewing Results](#results)
8. [Downloading Strategies](#downloading)
9. [Troubleshooting](#troubleshooting)
10. [Contact Support](#support)

---

## 🚀 Getting Started

### What is FxMathQuant?

FxMathQuant is an AI-powered trading strategy generator that uses genetic algorithms to discover profitable trading strategies from your historical price data.

### System Requirements

- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **MetaTrader**: MT4 or MT5 (for data export)
- **License Key**: Required for access

---

## 🔑 License Activation

### Step 1: Obtain License Key

Purchase a license from:
- **Website**: https://fxmath.com
- **Email**: fxmathsolution@gmail.com
- **Telegram**: https://t.me/FxMath

### Step 2: Activate License

1. **Open the application** in your web browser
2. **Enter your license key** in the format: `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`
3. **Click "Activate License"**
4. **Wait for validation** (requires internet connection)
5. **You'll be redirected** to the main application

### License Types

- **Lifetime License**: Never expires, unlimited use
- **Time-Limited License**: Valid for specified days (30, 90, 365, etc.)

### Session Duration

- **Active Session**: Remains active until you logout or clear browser data
- **Auto-Logout**: No automatic logout (session persists)
- **Manual Logout**: Click the logout button in the top-right corner

---

## 📊 Exporting Data from MT4/MT5

### Download Data Provider EA

1. **Download the EA** from the application:
   - MT4: `FxMathQuant_DataExporter_MT4.ex4`
   - MT5: `FxMathQuant_DataExporter_MT5.ex5`

2. **Install in MetaTrader**:
   - Copy to `MQL4/Experts/` (MT4) or `MQL5/Experts/` (MT5)
   - Restart MetaTrader
   - Find in Navigator → Expert Advisors

### Export Historical Data

1. **Open a chart** (e.g., XAUUSD H1)
2. **Drag the EA** onto the chart
3. **Configure settings**:
   - **Bars to Export**: 10,000 (recommended)
   - **Remove Suffix**: true (removes broker suffix)
   - **Export Folder**: FxMathQuant
4. **Click "Export to CSV"** button
5. **Wait for completion** message
6. **Find your file**: `MQL4/Files/FxMathQuant/XAUUSD_H1.csv`

### Recommended Data

| Timeframe | Bars | Use Case |
|-----------|------|----------|
| **M15** | 10,000 | Scalping strategies |
| **H1** | 10,000 | Intraday trading |
| **H4** | 5,000 | Swing trading |
| **D1** | 3,000 | Position trading |

---

## 📤 Uploading Data

### Step 1: Upload CSV File

1. **Click "Browse"** or drag-and-drop your CSV file
2. **Select the file** exported from MT4/MT5
3. **Wait for parsing** (10,000 bars ≈ 2-3 seconds)
4. **Confirmation**: "Data loaded successfully: X bars"

### Supported Format

```csv
Time,Open,High,Low,Close,Tick_Volume,Spread,Real_Volume
2024-04-18 01:00:00,2361.73,2367.69,2361.37,2365.29,2325,7,0
```

**Note**: Column names can be lowercase or capitalized.

---

## ⚙️ Configuring Strategy Generation

### Genetic Algorithm Settings

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| **Population Size** | 100 | 50-500 | Number of strategies per generation |
| **Generations** | 50 | 10-200 | Number of evolution cycles |
| **Mutation Rate** | 0.1 | 0.01-0.5 | Probability of random changes |
| **Crossover Rate** | 0.7 | 0.3-0.9 | Probability of combining strategies |
| **Elite Size** | 5 | 1-20 | Best strategies preserved each generation |

### Strategy Criteria

| Criteria | Default | Description |
|----------|---------|-------------|
| **Min Profit Factor** | 1.5 | Minimum ratio of profit to loss |
| **Min Win Rate** | 50% | Minimum percentage of winning trades |
| **Min Total Trades** | 30 | Minimum number of trades |
| **Max Drawdown** | 30% | Maximum equity drawdown allowed |

### Recommended Settings

**For Beginners:**
- Population: 100
- Generations: 50
- Min Profit Factor: 1.5
- Min Win Rate: 50%

**For Advanced Users:**
- Population: 200-300
- Generations: 100-150
- Min Profit Factor: 2.0
- Min Win Rate: 55%

---

## 🎯 Generating Strategies

### Step 1: Start Generation

1. **Review your settings**
2. **Click "Start Generation"**
3. **Monitor progress**:
   - Current generation
   - Strategies found
   - Best fitness score
   - Time elapsed

### Step 2: Wait for Completion

- **Time estimate**: 30 seconds to 5 minutes
- **Depends on**:
  - Population size
  - Number of generations
  - Data size
  - Computer speed

### Step 3: Review Results

- **Strategies found**: Number of strategies meeting criteria
- **Best strategy**: Highest fitness score
- **Generation**: When the strategy was discovered

---

## 📈 Viewing Results

### Strategy List

Each strategy shows:
- **Profit Factor**: Ratio of gross profit to gross loss
- **Win Rate**: Percentage of winning trades
- **Total Trades**: Number of trades executed
- **Net Profit**: Total profit in currency
- **Max Drawdown**: Largest equity drop

### Strategy Details

Click "View Details" to see:

1. **Performance Metrics**:
   - Profit Factor, Win Rate, Total Trades
   - Net Profit, Max Drawdown, Recovery Factor
   - Average Win/Loss, Largest Win/Loss

2. **BUY Rules**:
   - Entry conditions (e.g., `RSI(14) < 30`)
   - All rules must be true for BUY signal

3. **SELL Rules**:
   - Entry conditions (inverted from BUY)
   - All rules must be true for SELL signal

4. **Equity Curve**:
   - Visual representation of account growth
   - Shows drawdown periods

5. **Hourly Performance**:
   - Best/worst trading hours
   - Win rate by hour
   - Profit by hour

6. **Trade Statement**:
   - Complete list of all trades
   - Entry/exit times and prices
   - Profit/loss per trade

---

## 💾 Downloading Strategies

### Available Formats

1. **MetaTrader 4 (.mq4)**:
   - For MT4 platform
   - Includes all input parameters
   - Ready to compile and use

2. **MetaTrader 5 (.mq5)**:
   - For MT5 platform
   - Includes all input parameters
   - Ready to compile and use

3. **cTrader (.cs)**:
   - For cTrader platform
   - C# source code
   - Ready to compile

4. **TradingView (Pine Script)**:
   - For TradingView platform
   - Pine Script v5
   - Ready to use

5. **HTML Report**:
   - Comprehensive performance report
   - Includes all charts and metrics
   - Shareable and printable

6. **JSON Data**:
   - Raw strategy data
   - For custom integrations
   - Machine-readable format

### How to Download

1. **Click "Download"** button on strategy card
2. **Select format** from dropdown
3. **File downloads** automatically
4. **Install in your platform**:
   - MT4/MT5: Copy to `Experts/` folder
   - cTrader: Import as cBot
   - TradingView: Copy-paste Pine Script

---

## 🐛 Troubleshooting

### CSV Upload Issues

**Error: "CSV must contain: time, open, high, low, close columns"**
- **Solution**: Ensure CSV has required columns
- **Check**: Column names can be lowercase or capitalized
- **Try**: Re-export from MT4/MT5 using DataProvider EA

**Error: "CSV file is empty"**
- **Solution**: Check file has data rows
- **Try**: Open CSV in Excel/Notepad to verify

### License Issues

**Error: "Invalid license key"**
- **Solution**: Check key format (32 characters with dashes)
- **Try**: Copy-paste from email (avoid typing)

**Error: "License has expired"**
- **Solution**: Contact support for renewal
- **Email**: fxmathsolution@gmail.com

**Error: "License validation failed"**
- **Solution**: Check internet connection
- **Try**: Disable VPN/proxy
- **Contact**: Support if issue persists

### Generation Issues

**No strategies found**
- **Solution**: Relax criteria (lower Min Profit Factor, Win Rate)
- **Try**: Increase population size and generations
- **Check**: Data quality (enough bars, no gaps)

**Generation too slow**
- **Solution**: Reduce population size and generations
- **Try**: Use smaller dataset (fewer bars)
- **Check**: Close other browser tabs

### Browser Issues

**Page not loading**
- **Solution**: Clear browser cache (Ctrl+Shift+R)
- **Try**: Use incognito/private mode
- **Check**: JavaScript is enabled

**Charts not displaying**
- **Solution**: Disable ad blockers
- **Try**: Different browser
- **Check**: Internet connection

---

## 📞 Contact Support

### Get Help

**Email**: fxmathsolution@gmail.com
- Response time: 24-48 hours
- Include: License key, error message, screenshots

**Telegram**: https://t.me/FxMath
- Faster response
- Community support
- Updates and announcements

**Website**: https://fxmath.com
- Documentation
- Video tutorials
- FAQ

### Before Contacting Support

Please provide:
1. **License key** (first 8 characters)
2. **Error message** (exact text or screenshot)
3. **Browser** (Chrome, Firefox, etc.) and version
4. **Steps to reproduce** the issue
5. **CSV file** (if upload issue)

---

## 📚 Additional Resources

### Video Tutorials

- **Getting Started**: https://fxmath.com/tutorials/getting-started
- **Data Export**: https://fxmath.com/tutorials/data-export
- **Strategy Generation**: https://fxmath.com/tutorials/generation
- **Advanced Settings**: https://fxmath.com/tutorials/advanced

### Documentation

- **DataProvider EA Guide**: See `downloads/README.md`
- **API Documentation**: For developers
- **License System**: Setup and management

### Community

- **Telegram Group**: https://t.me/FxMath
- **Discord**: https://discord.gg/fxmath
- **Forum**: https://forum.fxmath.com

---

## ⚠️ Important Notes

### Disclaimer

- **Past performance** does not guarantee future results
- **Backtest results** may differ from live trading
- **Always test** strategies on demo account first
- **Risk management** is essential
- **No guarantee** of profitability

### Best Practices

1. **Test thoroughly** on demo before live
2. **Use proper lot sizing** (1-2% risk per trade)
3. **Monitor performance** regularly
4. **Update data** monthly for fresh strategies
5. **Diversify** across multiple strategies and pairs
6. **Set stop-loss** on all trades
7. **Keep records** of all trades

### Data Privacy

- **All data** is processed locally in your browser
- **No data** is sent to external servers
- **License validation** only sends license key
- **CSV files** remain on your computer
- **Strategies** are yours to keep

---

## 🎓 Tips for Success

### Data Quality

- Use **quality broker** with good historical data
- Export **enough bars** (10,000+ recommended)
- Check for **data gaps** (weekends are normal)
- **Update regularly** (monthly) for current market conditions

### Strategy Selection

- **Don't overfit**: Avoid too many rules
- **Diversify**: Use multiple strategies
- **Validate**: Test on different time periods
- **Monitor**: Track live performance

### Risk Management

- **Never risk** more than 2% per trade
- **Use stop-loss** always
- **Position sizing**: Based on account size
- **Drawdown limit**: Stop trading at 20% drawdown

---

**Happy Trading! 🎯**

For support: fxmathsolution@gmail.com | https://t.me/FxMath

© 2025 FxMath Solution. All rights reserved.
