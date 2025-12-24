// Pine Script Converter
class PineConverter {
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

        const buyConditions = this.parser.parseRules(buy_rules, 'pine');
        const sellConditions = this.parser.parseRules(sell_rules, 'pine');

        return `//@version=5
strategy("Strategy ${symbol}", overlay=true, 
         initial_capital=10000, 
         default_qty_type=strategy.percent_of_equity, 
         default_qty_value=100,
         commission_type=strategy.commission.percent,
         commission_value=0.1)

// Input Parameters
lotSize = input.float(0.01, "Lot Size", minval=0.01, step=0.01)
atrPeriod = input.int(${atrPeriod}, "ATR Period", minval=1)
slMultiplier = input.float(${slMultiplier.toFixed(2)}, "Stop Loss Multiplier", minval=0.1, step=0.1)
tpMultiplier = input.float(${tpMultiplier.toFixed(2)}, "Take Profit Multiplier", minval=0.1, step=0.1)

// Calculate ATR
atrValue = ta.atr(atrPeriod)

// Buy Signal Conditions
buySignal = ${buyConditions.join(' and\n            ')}

// Sell Signal Conditions
sellSignal = ${sellConditions.join(' and\n            ')}

// Calculate Stop Loss and Take Profit levels
longStopLoss = close - (atrValue * slMultiplier)
longTakeProfit = close + (atrValue * tpMultiplier)
shortStopLoss = close + (atrValue * slMultiplier)
shortTakeProfit = close - (atrValue * tpMultiplier)

// Strategy Entry and Exit
if (buySignal)
    strategy.entry("Long", strategy.long, comment="Buy Signal")
    strategy.exit("Long Exit", "Long", stop=longStopLoss, limit=longTakeProfit)

if (sellSignal)
    strategy.entry("Short", strategy.short, comment="Sell Signal")
    strategy.exit("Short Exit", "Short", stop=shortStopLoss, limit=shortTakeProfit)

// Plot Buy and Sell signals
plotshape(buySignal, title="Buy Signal", location=location.belowbar, 
          color=color.green, style=shape.triangleup, size=size.small)
plotshape(sellSignal, title="Sell Signal", location=location.abovebar, 
          color=color.red, style=shape.triangledown, size=size.small)

// Plot Stop Loss and Take Profit levels
plot(strategy.position_size > 0 ? longStopLoss : na, 
     title="Long SL", color=color.red, style=plot.style_linebr, linewidth=1)
plot(strategy.position_size > 0 ? longTakeProfit : na, 
     title="Long TP", color=color.green, style=plot.style_linebr, linewidth=1)
plot(strategy.position_size < 0 ? shortStopLoss : na, 
     title="Short SL", color=color.red, style=plot.style_linebr, linewidth=1)
plot(strategy.position_size < 0 ? shortTakeProfit : na, 
     title="Short TP", color=color.green, style=plot.style_linebr, linewidth=1)
`;
    }
}

window.PineConverter = PineConverter;
