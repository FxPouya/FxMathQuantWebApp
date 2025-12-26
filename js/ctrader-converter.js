// cTrader (cBot) Converter
class CTraderConverter {
    constructor(strategy) {
        this.strategy = strategy;
        this.parser = new RuleParser();
    }

    generate() {
        const { parameters, buy_rules, sell_rules } = this.strategy;
        const symbol = parameters.symbol || 'EURUSD';
        const atrPeriod = parameters.atr_period || 14;
        const slMultiplier = parameters.sl_multiplier || 2.0;
        const tpMultiplier = parameters.tp_multiplier || 3.0;

        // Generate random 6-digit magic number
        const magicNumber = Math.floor(100000 + Math.random() * 900000);

        const buyConditions = this.parser.parseRules(buy_rules, 'csharp');
        // SELL rules use inverted operators
        const sellConditions = this.parser.parseRulesInverted(buy_rules, 'csharp');

        // Convert MQL-style array access to cTrader MarketSeries
        const convertToCTrader = (condition) => {
            return condition
                .replace(/Open\[(\d+)\]/g, 'MarketSeries.Open.Last($1)')
                .replace(/High\[(\d+)\]/g, 'MarketSeries.High.Last($1)')
                .replace(/Low\[(\d+)\]/g, 'MarketSeries.Low.Last($1)')
                .replace(/Close\[(\d+)\]/g, 'MarketSeries.Close.Last($1)');
        };

        const buyConditionsCTrader = buyConditions.map(convertToCTrader);
        const sellConditionsCTrader = sellConditions.map(convertToCTrader);

        return `using System;
using System.Linq;
using cAlgo.API;
using cAlgo.API.Indicators;
using cAlgo.API.Internals;
using cAlgo.Indicators;

namespace cAlgo.Robots
{
    [Robot(TimeZone = TimeZones.UTC, AccessRights = AccessRights.None)]
    public class Strategy_${symbol} : Robot
    {
        //=== TRADE SETTINGS ===
        [Parameter("Lot Size", DefaultValue = 0.1, MinValue = 0.01)]
        public double LotSize { get; set; }

        [Parameter("ATR Period", DefaultValue = ${atrPeriod}, MinValue = 1)]
        public int ATR_Period { get; set; }

        [Parameter("SL ATR Multiplier", DefaultValue = ${slMultiplier.toFixed(2)}, MinValue = 0.1)]
        public double SL_Multiplier { get; set; }

        [Parameter("TP ATR Multiplier", DefaultValue = ${tpMultiplier.toFixed(2)}, MinValue = 0.1)]
        public double TP_Multiplier { get; set; }

        [Parameter("Magic Number", DefaultValue = ${magicNumber})]
        public int MagicNumber { get; set; }

        [Parameter("Trade Comment", DefaultValue = "FxMath EA")]
        public string TradeComment { get; set; }

        [Parameter("Slippage", DefaultValue = 3, MinValue = 0)]
        public int Slippage { get; set; }

        //=== SL/TP SETTINGS ===
        [Parameter("Enable Hard SL", DefaultValue = true, Group = "SL/TP")]
        public bool EnableHardSL { get; set; }

        [Parameter("Enable Hard TP", DefaultValue = true, Group = "SL/TP")]
        public bool EnableHardTP { get; set; }

        //=== TRAILING STOP ===
        [Parameter("Enable Trailing", DefaultValue = false, Group = "Trailing")]
        public bool EnableTrailing { get; set; }

        [Parameter("Trailing Start (pips)", DefaultValue = 30, MinValue = 1, Group = "Trailing")]
        public double TrailingStart { get; set; }

        [Parameter("Trailing Step (pips)", DefaultValue = 10, MinValue = 1, Group = "Trailing")]
        public double TrailingStep { get; set; }

        //=== BREAKEVEN ===
        [Parameter("Enable Breakeven", DefaultValue = false, Group = "Breakeven")]
        public bool EnableBreakeven { get; set; }

        [Parameter("Breakeven Start (pips)", DefaultValue = 20, MinValue = 1, Group = "Breakeven")]
        public double BreakevenStart { get; set; }

        [Parameter("Breakeven Offset (pips)", DefaultValue = 2, MinValue = 0, Group = "Breakeven")]
        public double BreakevenOffset { get; set; }

        //=== TIME FILTER ===
        [Parameter("Enable Time Filter", DefaultValue = false, Group = "Time Filter")]
        public bool EnableTimeFilter { get; set; }

        [Parameter("Start Hour", DefaultValue = 8, MinValue = 0, MaxValue = 23, Group = "Time Filter")]
        public int StartHour { get; set; }

        [Parameter("Start Minute", DefaultValue = 0, MinValue = 0, MaxValue = 59, Group = "Time Filter")]
        public int StartMinute { get; set; }

        [Parameter("End Hour", DefaultValue = 22, MinValue = 0, MaxValue = 23, Group = "Time Filter")]
        public int EndHour { get; set; }

        [Parameter("End Minute", DefaultValue = 0, MinValue = 0, MaxValue = 59, Group = "Time Filter")]
        public int EndMinute { get; set; }

        //=== SIGNAL SETTINGS ===
        [Parameter("Close on Opposite", DefaultValue = false, Group = "Signals")]
        public bool CloseOnOpposite { get; set; }

        //=== DISPLAY SETTINGS ===
        [Parameter("Show Chart Info", DefaultValue = true, Group = "Display")]
        public bool ShowChartInfo { get; set; }

        private AverageTrueRange atr;
        private Position currentPosition;

        protected override void OnStart()
        {
            atr = Indicators.AverageTrueRange(ATR_Period, MovingAverageType.Simple);
            Print("Strategy cBot initialized for ${symbol}");
            Print("Magic Number: " + MagicNumber);
        }

        protected override void OnTick()
        {
            currentPosition = Positions.Find(TradeComment, SymbolName);

            if (currentPosition != null)
            {
                ManagePosition();
            }
            else
            {
                // Check time filter
                if (EnableTimeFilter && !IsTimeAllowed())
                    return;

                // Check signals
                if (CheckBuySignal())
                {
                    OpenBuyOrder();
                }
                else if (CheckSellSignal())
                {
                    OpenSellOrder();
                }
            }

            if (ShowChartInfo)
                DisplayChartInfo();
        }

        private bool IsTimeAllowed()
        {
            var currentTime = Server.Time;
            int currentMinutes = currentTime.Hour * 60 + currentTime.Minute;
            int startMinutes = StartHour * 60 + StartMinute;
            int endMinutes = EndHour * 60 + EndMinute;

            if (startMinutes < endMinutes)
                return currentMinutes >= startMinutes && currentMinutes < endMinutes;
            else
                return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }

        private void ManagePosition()
        {
            if (currentPosition == null)
                return;

            // Check for opposite signal
            if (CloseOnOpposite)
            {
                if (currentPosition.TradeType == TradeType.Buy && CheckSellSignal())
                {
                    ClosePosition(currentPosition);
                    return;
                }
                else if (currentPosition.TradeType == TradeType.Sell && CheckBuySignal())
                {
                    ClosePosition(currentPosition);
                    return;
                }
            }

            double currentPrice = currentPosition.TradeType == TradeType.Buy ? Symbol.Bid : Symbol.Ask;
            double pipValue = Symbol.PipSize;

            // Breakeven
            if (EnableBreakeven)
            {
                double profit = currentPosition.TradeType == TradeType.Buy ?
                    (currentPrice - currentPosition.EntryPrice) / pipValue :
                    (currentPosition.EntryPrice - currentPrice) / pipValue;

                if (profit >= BreakevenStart)
                {
                    double newSL = currentPosition.EntryPrice + (BreakevenOffset * pipValue *
                        (currentPosition.TradeType == TradeType.Buy ? 1 : -1));

                    if ((currentPosition.TradeType == TradeType.Buy && newSL > currentPosition.StopLoss) ||
                        (currentPosition.TradeType == TradeType.Sell && (currentPosition.StopLoss == null || newSL < currentPosition.StopLoss)))
                    {
                        ModifyPosition(currentPosition, newSL, currentPosition.TakeProfit);
                    }
                }
            }

            // Trailing Stop
            if (EnableTrailing)
            {
                double profit = currentPosition.TradeType == TradeType.Buy ?
                    (currentPrice - currentPosition.EntryPrice) / pipValue :
                    (currentPosition.EntryPrice - currentPrice) / pipValue;

                if (profit >= TrailingStart)
                {
                    double newSL = currentPrice - (TrailingStep * pipValue *
                        (currentPosition.TradeType == TradeType.Buy ? 1 : -1));

                    if ((currentPosition.TradeType == TradeType.Buy && newSL > currentPosition.StopLoss) ||
                        (currentPosition.TradeType == TradeType.Sell && (currentPosition.StopLoss == null || newSL < currentPosition.StopLoss)))
                    {
                        ModifyPosition(currentPosition, newSL, currentPosition.TakeProfit);
                    }
                }
            }
        }

        private void DisplayChartInfo()
        {
            string info = "\\n=== " + TradeComment + " ===\\n";
            info += "Symbol: " + SymbolName + "\\n";
            info += "Magic: " + MagicNumber + "\\n";

            if (currentPosition != null)
            {
                info += "Position: " + currentPosition.TradeType + "\\n";
                info += "Profit: " + currentPosition.NetProfit.ToString("F2") + "\\n";
            }
            else
            {
                info += "No Position\\n";
            }

            Chart.DrawStaticText("info", info, VerticalAlignment.Top, HorizontalAlignment.Left, Color.White);
        }

        private bool CheckBuySignal()
        {
            return ${buyConditionsCTrader.join(' &&\n                ')};
        }

        private bool CheckSellSignal()
        {
            return ${sellConditionsCTrader.join(' &&\n                ')};
        }

        private void OpenBuyOrder()
        {
            double atrValue = atr.Result.LastValue;
            double price = Symbol.Ask;
            double sl = EnableHardSL ? price - (atrValue * SL_Multiplier) : 0;
            double tp = EnableHardTP ? price + (atrValue * TP_Multiplier) : 0;

            double volumeInUnits = Symbol.QuantityToVolumeInUnits(LotSize);

            var result = ExecuteMarketOrder(TradeType.Buy, SymbolName, volumeInUnits, TradeComment,
                EnableHardSL ? sl : (double?)null,
                EnableHardTP ? tp : (double?)null);

            if (result.IsSuccessful)
            {
                Print("Buy order opened at " + price + " SL: " + sl + " TP: " + tp);
            }
            else
            {
                Print("Error opening buy order: " + result.Error);
            }
        }

        private void OpenSellOrder()
        {
            double atrValue = atr.Result.LastValue;
            double price = Symbol.Bid;
            double sl = EnableHardSL ? price + (atrValue * SL_Multiplier) : 0;
            double tp = EnableHardTP ? price - (atrValue * TP_Multiplier) : 0;

            double volumeInUnits = Symbol.QuantityToVolumeInUnits(LotSize);

            var result = ExecuteMarketOrder(TradeType.Sell, SymbolName, volumeInUnits, TradeComment,
                EnableHardSL ? sl : (double?)null,
                EnableHardTP ? tp : (double?)null);

            if (result.IsSuccessful)
            {
                Print("Sell order opened at " + price + " SL: " + sl + " TP: " + tp);
            }
            else
            {
                Print("Error opening sell order: " + result.Error);
            }
        }
    }
}
`;
    }
}

window.CTraderConverter = CTraderConverter;
