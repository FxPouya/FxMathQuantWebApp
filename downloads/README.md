# FxMath Quant Data Exporter

**Export historical price data from MetaTrader 4/5 to CSV format for FxMath Quant Strategy Finder**

## 📋 Overview

These Expert Advisors (EAs) allow you to easily export historical price data from your MetaTrader platform in the exact format required by FxMath Quant Strategy Finder and Optimizer.

## 📦 What's Included

- **FxMathQuant_DataExporter_MT4.mq4** - Expert Advisor for MetaTrader 4
- **FxMathQuant_DataExporter_MT5.mq5** - Expert Advisor for MetaTrader 5
- **README.md** - This file with complete instructions

## ✨ Features

✅ **Easy to Use** - Just attach to chart and click export button (or press 'E' key)
✅ **Configurable Bars** - Set how many bars to export (default: 10,000)
✅ **Automatic Suffix Removal** - Removes broker suffixes (e.g., XAUUSDpro → XAUUSD)
✅ **Progress Tracking** - Shows export progress in Expert log
✅ **CSV Format** - Exact format required by FxMath Quant application
✅ **On-Chart Button** - Visual button to trigger export
✅ **Keyboard Shortcut** - Press 'E' key to export
✅ **Auto-Export Option** - Can export automatically when EA starts

## 📋 CSV Format Generated

The exported file follows this format (matching FxMath Quant requirements):

```csv
Time,Open,High,Low,Close,Tick_Volume,Spread,Real_Volume
2023-05-11 21:00:00,2013.87,2015.11,2013.40,2014.39,4858,24,0
2023-05-11 22:00:00,2014.40,2016.50,2013.41,2014.15,4271,24,0
2023-05-11 23:00:00,2014.17,2015.08,2013.68,2014.90,1616,24,0
...
```

## 🚀 Installation

### For MetaTrader 4

1. **Copy the File**
   - Copy `FxMathQuant_DataExporter_MT4.mq4` to:
   - `MetaTrader 4/MQL4/Experts/`

2. **Compile**
   - Open MetaEditor (F4 in MT4)
   - Navigate to Experts folder
   - Double-click `FxMathQuant_DataExporter_MT4.mq4`
   - Click "Compile" (F7)
   - Check for success message

3. **Verify Installation**
   - In MT4, open Navigator (Ctrl+N)
   - Expand "Expert Advisors"
   - You should see "FxMathQuant_DataExporter_MT4"

### For MetaTrader 5

1. **Copy the File**
   - Copy `FxMathQuant_DataExporter_MT5.mq5` to:
   - `MetaTrader 5/MQL5/Experts/`

2. **Compile**
   - Open MetaEditor (F4 in MT5)
   - Navigate to Experts folder
   - Double-click `FxMathQuant_DataExporter_MT5.mq5`
   - Click "Compile" (F7)
   - Check for success message

3. **Verify Installation**
   - In MT5, open Navigator (Ctrl+N)
   - Expand "Expert Advisors"
   - You should see "FxMathQuant_DataExporter_MT5"

## 📖 Usage Instructions

### Method 1: Using On-Chart Button (Easiest)

1. **Open Chart**
   - Open the chart for the symbol you want to export (e.g., XAUUSD, EURUSD)
   - Select the timeframe (H1, H4, D1, etc.)

2. **Attach EA**
   - Drag and drop the EA from Navigator onto the chart
   - Or right-click chart → Expert Advisors → FxMathQuant_DataExporter_MT4/MT5

3. **Configure Settings** (Optional)
   - In the EA parameters window:
     - **BarsToExport**: Number of bars (default: 10000)
     - **RemoveSuffix**: true/false (removes broker suffix)
     - **ExportFolder**: Folder name (default: "FxMathQuant")
     - **AutoExportOnStart**: false (set true for automatic export)
     - **ShowSuccessMessage**: true (shows completion dialog)
   - Click "OK"

4. **Export Data**
   - Click the blue "Export Data to CSV" button that appears on the chart
   - OR press the 'E' key on your keyboard
   - Wait for completion message

5. **Find Your File**
   - **MT4**: `MetaTrader 4/MQL4/Files/FxMathQuant/SYMBOL_TIMEFRAME.csv`
   - **MT5**: `MetaTrader 5/MQL5/Files/FxMathQuant/SYMBOL_TIMEFRAME.csv`
   - Example: `XAUUSD_H1.csv`, `EURUSD_M15.csv`

### Method 2: Auto-Export on Start

1. **Attach EA with Auto-Export Enabled**
   - Drag EA to chart
   - Set **AutoExportOnStart = true**
   - Click "OK"
   - Export starts immediately

2. **Wait for Completion**
   - Check Expert log (Tools → Experts tab)
   - Success message appears when done

### Method 3: Using Keyboard Shortcut

1. **Attach EA to Chart**
   - Drag EA onto chart
   - Click "OK" with default settings

2. **Press 'E' Key**
   - Make sure the chart is active
   - Press the 'E' key on your keyboard
   - Export begins immediately

## ⚙️ Parameter Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **BarsToExport** | int | 10000 | Number of historical bars to export |
| **RemoveSuffix** | bool | true | Remove broker suffix from symbol name |
| **ExportFolder** | string | "FxMathQuant" | Subfolder in MQL4/5/Files/ for exports |
| **AutoExportOnStart** | bool | false | Export automatically when EA starts |
| **ShowSuccessMessage** | bool | true | Show popup when export completes |

## 📁 File Naming Convention

The exported files are automatically named using this format:

```
{SYMBOL}_{TIMEFRAME}.csv
```

**Examples:**
- `XAUUSD_H1.csv` - Gold on 1-hour chart
- `EURUSD_M15.csv` - EUR/USD on 15-minute chart
- `BTCUSD_D1.csv` - Bitcoin on daily chart

### Suffix Removal Examples

When **RemoveSuffix = true**, broker-specific suffixes are automatically removed:

| Broker Symbol | Exported As |
|---------------|-------------|
| XAUUSDpro | XAUUSD |
| EURUSD.ecn | EURUSD |
| GBPUSD.lmax | GBPUSD |
| BTCUSDm | BTCUSD |
| USDJPY.raw | USDJPY |

## 🔍 Supported Timeframes

### MetaTrader 4
- M1, M5, M15, M30 (minutes)
- H1, H4 (hours)
- D1 (daily)
- W1 (weekly)
- MN1 (monthly)

### MetaTrader 5
- M1, M2, M3, M4, M5, M6, M10, M12, M15, M20, M30 (minutes)
- H1, H2, H3, H4, H6, H8, H12 (hours)
- D1 (daily)
- W1 (weekly)
- MN1 (monthly)

## 📊 What Data is Exported

Each exported bar contains:

1. **Time** - Bar opening time (YYYY-MM-DD HH:MM:SS format)
2. **Open** - Opening price
3. **High** - Highest price
4. **Low** - Lowest price
5. **Close** - Closing price
6. **Tick_Volume** - Number of ticks (always available)
7. **Spread** - Bid/Ask spread in points
8. **Real_Volume** - Exchange volume (0 if not available for symbol)

## 💡 Tips for Best Results

### Recommended Number of Bars

| Use Case | Recommended Bars |
|----------|------------------|
| **Quick Testing** | 1,000 - 3,000 |
| **Standard Analysis** | 5,000 - 10,000 |
| **Comprehensive Analysis** | 15,000 - 30,000 |
| **Maximum Data** | 50,000+ |

**Note:** More bars = more reliable backtesting results, but slower processing in FxMath Quant.

### Best Timeframes for Strategy Development

- **H1 (1 Hour)** - Good balance of data and trading frequency
- **H4 (4 Hours)** - Swing trading strategies
- **D1 (Daily)** - Position trading strategies
- **M15 (15 Minutes)** - Short-term trading strategies

### Data Quality Tips

✅ **Use Quality Brokers** - Choose brokers with good historical data
✅ **Check Data Gaps** - Weekends and holidays create gaps (normal)
✅ **Download More Than Needed** - Export 20-30% more bars as buffer
✅ **Update Regularly** - Re-export data monthly for latest market conditions

## 🐛 Troubleshooting

### Issue: "Failed to create file"

**Causes:**
- Permissions issue
- Folder doesn't exist
- Disk full

**Solutions:**
1. Check MT4/MT5 has write permissions
2. Try changing `ExportFolder` to empty string ""
3. Free up disk space
4. Run MT4/MT5 as administrator

### Issue: "Not enough bars available"

**Causes:**
- Symbol doesn't have enough historical data
- Data not downloaded yet

**Solutions:**
1. In MT4/MT5, press F2 to open History Center
2. Select the symbol and timeframe
3. Download more history from broker
4. Reduce `BarsToExport` parameter

### Issue: "Suffix not removed correctly"

**Causes:**
- Unusual broker suffix not in the list

**Solutions:**
1. Set `RemoveSuffix = false`
2. Manually rename the file after export
3. Contact support to add your broker's suffix

### Issue: Export button doesn't appear

**Causes:**
- EA not attached correctly
- AutoTrading disabled

**Solutions:**
1. Enable AutoTrading (Ctrl+E or click button in toolbar)
2. Re-attach EA to chart
3. Check Expert log for error messages

### Issue: CSV format not recognized by FxMath Quant

**Causes:**
- Different locale/region settings
- Decimal separator issues

**Solutions:**
1. Check exported file opens correctly in Excel/Notepad
2. Verify format matches: `Time,Open,High,Low,Close,Tick_Volume,Spread,Real_Volume`
3. Ensure decimal separator is period (.) not comma (,)

## 📂 Example Workflow

### Complete Export Process

1. **Open MetaTrader**
   - Launch MT4 or MT5

2. **Select Symbol and Timeframe**
   - Open XAUUSD chart
   - Switch to H1 timeframe

3. **Attach EA**
   - Drag `FxMathQuant_DataExporter_MT4` to chart
   - Set BarsToExport = 10000
   - Click OK

4. **Export Data**
   - Click "Export Data to CSV" button
   - Wait ~5-10 seconds (for 10,000 bars)

5. **Verify Export**
   - Check success message
   - Note file location

6. **Use in FxMath Quant**
   - Copy `XAUUSD_H1.csv` to your data folder
   - Or load directly in FxMath Quant application

7. **Repeat for Other Symbols/Timeframes**
   - EURUSD H1
   - GBPUSD H4
   - BTCUSD D1
   - etc.

## 🔄 Updating Data

### When to Re-Export

- **Monthly**: For active strategy development
- **After Major Events**: Brexit, elections, etc.
- **When Results Degrade**: Market conditions changed
- **Before Going Live**: Use latest data for final validation

### Quick Update Process

1. Set `AutoExportOnStart = true`
2. Attach EA to multiple charts
3. Wait for all exports to complete
4. Copy files to FxMath Quant data folder

## 📞 Support

### Getting Help

1. **Check Expert Log**
   - In MT4/MT5: View → Toolbox → Experts tab
   - Look for error messages
   - Note the error code

2. **Common Error Codes**
   - **4103**: File cannot be opened
   - **4051**: Invalid function parameter
   - **5004**: History not loaded

3. **Contact Support**
   - Email: support@fxmathquant.com
   - Include: Symbol, Timeframe, Error message, MT4/MT5 version

## 📄 Technical Details

### File Format Specification

```
Header:  Time,Open,High,Low,Close,Tick_Volume,Spread,Real_Volume
Data:    YYYY-MM-DD HH:MM:SS,FLOAT,FLOAT,FLOAT,FLOAT,INT,INT,INT
Sorting: Chronological (oldest to newest)
Encoding: ANSI/UTF-8
Separator: Comma (,)
Line Ending: CRLF (Windows)
Decimal: Period (.)
```

### Performance

| Bars | Export Time | File Size |
|------|-------------|-----------|
| 1,000 | 1-2 seconds | ~100 KB |
| 10,000 | 5-10 seconds | ~1 MB |
| 50,000 | 30-60 seconds | ~5 MB |
| 100,000 | 1-2 minutes | ~10 MB |

**Note:** Times vary based on CPU speed and disk I/O.

## 📋 Checklist - First Time Export

Before your first export, make sure:

- [ ] EA file copied to correct MQL4/Experts or MQL5/Experts folder
- [ ] EA compiled successfully in MetaEditor
- [ ] AutoTrading enabled in MT4/MT5 (Ctrl+E)
- [ ] Chart opened for desired symbol
- [ ] Correct timeframe selected
- [ ] Historical data downloaded (F2 → History Center)
- [ ] Sufficient disk space available
- [ ] EA attached to chart successfully
- [ ] Export button visible on chart

## 🎓 Advanced Usage

### Exporting Multiple Symbols

Create a script to attach EA to multiple charts:

1. Open multiple charts (EURUSD, GBPUSD, XAUUSD, etc.)
2. Set `AutoExportOnStart = true`
3. Attach EA to all charts
4. All exports run automatically

### Custom Export Folders

Organize by strategy or date:

```
ExportFolder = "FxMathQuant/Strategy1"
ExportFolder = "FxMathQuant/2025-12"
ExportFolder = "FxMathQuant/Forex"
```

### Batch Processing

For power users:

1. Create template with EA attached
2. Apply template to multiple charts
3. Set `AutoExportOnStart = true`
4. All charts export simultaneously

## 🔒 Data Privacy

- All data is exported **locally** to your computer
- No data is sent to external servers
- No internet connection required for export
- Files remain in your MT4/MT5 Files folder

## 📜 License

© 2025 FxMath Quant. All rights reserved.

This software is provided as a free tool for FxMath Quant users.

## 🚀 Version History

### Version 1.0 (December 2025)
- Initial release
- MT4 and MT5 support
- Automatic suffix removal
- On-chart button
- Keyboard shortcut support
- Configurable parameters
- Progress tracking

---

## ✅ Quick Reference

### Common Commands

| Action | Method 1 | Method 2 |
|--------|----------|----------|
| **Export** | Click button on chart | Press 'E' key |
| **Re-export** | Click button again | Restart EA |
| **Find file** | MQL4/5/Files/FxMathQuant/ | Check success message |
| **Change bars** | Edit EA settings | Detach and re-attach EA |

### Default File Locations

**MT4:** `C:\Users\YourName\AppData\Roaming\MetaQuotes\Terminal\{ID}\MQL4\Files\FxMathQuant\`

**MT5:** `C:\Users\YourName\AppData\Roaming\MetaQuotes\Terminal\{ID}\MQL5\Files\FxMathQuant\`

---

**Happy Trading! 🎯**

For more information about FxMath Quant Strategy Finder and Optimizer, visit:
https://www.fxmathquant.com
