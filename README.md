# FxMathQuant Web - AI-Powered Strategy Generator

🚀 **Generate profitable trading strategies using Genetic Algorithms - 100% in your browser!**

## Features

✅ **Client-Side Processing** - Everything runs in your browser, no server needed  
✅ **AI-Powered** - Genetic Algorithm evolves profitable trading strategies  
✅ **Fast Backtesting** - Optimized JavaScript with typed arrays  
✅ **MQ4/MQ5 Export** - Generate ready-to-use MetaTrader Expert Advisors  
✅ **HTML Reports** - Beautiful performance reports with interactive charts  
✅ **GitHub Pages Ready** - Host for FREE on GitHub Pages  

## How It Works

1. **Upload CSV Data** - Export OHLC data from MT4/MT5 and upload
2. **Configure GA** - Set population, generations, and performance filters
3. **Generate Strategies** - AI evolves profitable trading strategies
4. **Download Code** - Get MQ4, MQ5, and HTML reports

## Quick Start

### Option 1: Local Development

```bash
# Clone or download this folder
cd FxMathQuant-Web

# Serve with any HTTP server
python -m http.server 8000
# or
npx serve

# Open browser
open http://localhost:8000
```

### Option 2: GitHub Pages (Recommended)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/fxmathquant-web.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save

3. **Access Your App**
   - URL: `https://yourusername.github.io/fxmathquant-web/`

## Preparing Data

### MT4/MT5 Data Export

Create a simple EA to export OHLC data:

**MT4 Script (SaveOHLC.mq4):**
```mql4
//+------------------------------------------------------------------+
//| Script to export OHLC data to CSV                                |
//+------------------------------------------------------------------+
void OnStart()
{
   string filename = Symbol() + "_" + PeriodToString() + ".csv";
   int handle = FileOpen(filename, FILE_WRITE|FILE_CSV);
   
   if(handle != INVALID_HANDLE)
   {
      FileWrite(handle, "time", "open", "high", "low", "close");
      
      int bars = iBars(Symbol(), Period());
      for(int i = bars - 1; i >= 0; i--)
      {
         FileWrite(handle,
            TimeToString(iTime(Symbol(), Period(), i)),
            iOpen(Symbol(), Period(), i),
            iHigh(Symbol(), Period(), i),
            iLow(Symbol(), Period(), i),
            iClose(Symbol(), Period(), i)
         );
      }
      
      FileClose(handle);
      Print("Data exported to: ", filename);
   }
}

string PeriodToString()
{
   switch(Period())
   {
      case PERIOD_M1: return "M1";
      case PERIOD_M5: return "M5";
      case PERIOD_M15: return "M15";
      case PERIOD_M30: return "M30";
      case PERIOD_H1: return "H1";
      case PERIOD_H4: return "H4";
      case PERIOD_D1: return "D1";
      default: return "Unknown";
   }
}
```

**MT5 Script (SaveOHLC.mq5):**
```mql5
//+------------------------------------------------------------------+
//| Script to export OHLC data to CSV                                |
//+------------------------------------------------------------------+
void OnStart()
{
   string filename = _Symbol + "_" + PeriodToString() + ".csv";
   int handle = FileOpen(filename, FILE_WRITE|FILE_CSV);
   
   if(handle != INVALID_HANDLE)
   {
      FileWrite(handle, "time", "open", "high", "low", "close");
      
      int bars = Bars(_Symbol, _Period);
      datetime time[];
      double open[], high[], low[], close[];
      
      CopyTime(_Symbol, _Period, 0, bars, time);
      CopyOpen(_Symbol, _Period, 0, bars, open);
      CopyHigh(_Symbol, _Period, 0, bars, high);
      CopyLow(_Symbol, _Period, 0, bars, low);
      CopyClose(_Symbol, _Period, 0, bars, close);
      
      for(int i = bars - 1; i >= 0; i--)
      {
         FileWrite(handle,
            TimeToString(time[i]),
            open[i],
            high[i],
            low[i],
            close[i]
         );
      }
      
      FileClose(handle);
      Print("Data exported to: ", filename);
   }
}

string PeriodToString()
{
   switch(_Period)
   {
      case PERIOD_M1: return "M1";
      case PERIOD_M5: return "M5";
      case PERIOD_M15: return "M15";
      case PERIOD_M30: return "M30";
      case PERIOD_H1: return "H1";
      case PERIOD_H4: return "H4";
      case PERIOD_D1: return "D1";
      default: return "Unknown";
   }
}
```

## Configuration Guide

### GA Parameters

| Parameter | Recommended | Description |
|-----------|-------------|-------------|
| Population | 100-200 | Strategies per generation |
| Generations | 50-100 | Evolution cycles |
| Strategies to Find | 5-10 | Target number of strategies |

### Performance Filters

| Filter | Recommended | Description |
|--------|-------------|-------------|
| Min Profit Factor | 1.5-2.0 | Minimum PF required |
| Min Win Rate | 45-55% | Minimum win rate |
| Max Drawdown | 20-30% | Maximum acceptable DD |
| Min Trades | 30-50 | Minimum trade count |

## Performance

- **Processing Speed:** ~50-100 strategies/second (depends on device)
- **Recommended Data Size:** 1,000-5,000 bars
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest versions)

## Technical Stack

- **Frontend:** Vanilla HTML5 + JavaScript (no frameworks)
- **Charts:** Chart.js 4.4.0
- **CSV Parsing:** PapaParse 5.4.1
- **Styling:** Custom CSS with dark theme
- **Hosting:** GitHub Pages compatible

## Project Structure

```
FxMathQuant-Web/
├── index.html              # Main page
├── css/
│   └── style.css          # Styles
├── js/
│   ├── main.js            # App controller
│   ├── strategy.js        # Strategy class
│   ├── backtester.js      # Backtesting engine
│   ├── ga-engine.js       # Genetic Algorithm
│   ├── mq4-generator.js   # MQ4 code generator
│   ├── mq5-generator.js   # MQ5 code generator
│   └── report-generator.js # HTML report generator
└── README.md
```

## Browser Compatibility

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  

## Limitations

- **Dataset Size:** Recommended max 5,000 bars for optimal performance
- **Processing Time:** Depends on device CPU (slower on mobile)
- **Storage:** All data stays in browser (not saved to server)

## FAQ

**Q: Is my data sent to a server?**  
A: No! Everything runs 100% in your browser. Your data never leaves your device.

**Q: Can I use this offline?**  
A: Yes, once loaded. Download the files and open `index.html` locally.

**Q: How accurate is the backtesting?**  
A: Very accurate. Uses the same logic as the Python version with ATR-based SL/TP.

**Q: Can I modify the generated MQ4/MQ5 code?**  
A: Yes! The code is clean and well-commented for easy customization.

## Support

- **Website:** https://fxmathquant.com
- **Email:** support@fxmath.com
- **GitHub:** https://github.com/yourusername/fxmathquant-web

## License

© 2025 FxMathQuant. All rights reserved.

## Disclaimer

⚠️ **Trading Risk Warning**

Trading forex and CFDs carries a high level of risk. Past performance is not indicative of future results. Always test strategies on demo accounts before live trading. Never invest more than you can afford to lose.

---

**Made with ❤️ by FxMathQuant**
