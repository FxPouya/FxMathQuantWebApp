/**
 * Backtester - Fast backtesting engine using typed arrays
 */
class Backtester {
    constructor(data, strategy) {
        this.strategy = strategy;
        this.dataLength = data.length;

        // Use typed arrays for performance
        this.open = new Float64Array(data.length);
        this.high = new Float64Array(data.length);
        this.low = new Float64Array(data.length);
        this.close = new Float64Array(data.length);
        this.time = new Array(data.length);

        // Populate arrays
        for (let i = 0; i < data.length; i++) {
            this.open[i] = parseFloat(data[i].open) || 0;
            this.high[i] = parseFloat(data[i].high) || 0;
            this.low[i] = parseFloat(data[i].low) || 0;
            this.close[i] = parseFloat(data[i].close) || 0;
            this.time[i] = data[i].time || i;
        }
    }

    /**
     * Run backtest and return metrics
     */
    run() {
        console.log('📊 Backtester.run() - Data length:', this.dataLength);
        const atr = this.calculateATR(this.strategy.atrPeriod);
        console.log('✅ ATR calculated, period:', this.strategy.atrPeriod);

        let balance = 10000;
        let position = null;
        const trades = [];
        const equity = [balance];

        // Start from ATR period to have enough data
        for (let i = this.strategy.atrPeriod + 10; i < this.dataLength; i++) {
            // Check for close at opposite signal first (if enabled)
            if (position && this.strategy.closeAtOpposite) {
                if (position.type === 'BUY' && this.checkSellSignal(i)) {
                    // Close BUY and open SELL
                    const closePrice = this.close[i];
                    const profit = closePrice - position.entry;
                    balance += profit;
                    trades.push({
                        type: 'BUY',
                        entry: position.entry,
                        exit: closePrice,
                        profit: profit,
                        reason: 'opposite',
                        openTime: position.openTime,
                        closeTime: this.time[i]
                    });
                    equity.push(balance);
                    position = this.openPosition('SELL', i, atr[i]);
                    continue;
                } else if (position.type === 'SELL' && this.checkBuySignal(i)) {
                    // Close SELL and open BUY
                    const closePrice = this.close[i];
                    const profit = position.entry - closePrice;
                    balance += profit;
                    trades.push({
                        type: 'SELL',
                        entry: position.entry,
                        exit: closePrice,
                        profit: profit,
                        reason: 'opposite',
                        openTime: position.openTime,
                        closeTime: this.time[i]
                    });
                    equity.push(balance);
                    position = this.openPosition('BUY', i, atr[i]);
                    continue;
                }
            }

            // Check for normal exit (TP/SL)
            if (position) {
                const exitResult = this.checkExit(position, i);
                if (exitResult) {
                    balance += exitResult.profit;
                    trades.push(exitResult);
                    equity.push(balance);
                    position = null;
                }
            }

            // Check for entry signals (only if no position)
            if (!position) {
                if (this.checkBuySignal(i)) {
                    position = this.openPosition('BUY', i, atr[i]);
                } else if (this.checkSellSignal(i)) {
                    position = this.openPosition('SELL', i, atr[i]);
                }
            }
        }

        // Close any open position at the end
        if (position) {
            const exitPrice = this.close[this.dataLength - 1];
            const profit = exitPrice - position.entry;
            balance += profit;
            trades.push({
                type: 'BUY',
                entry: position.entry,
                exit: exitPrice,
                profit: profit,
                reason: 'end_of_data'
            });
            equity.push(balance);
        }

        return this.calculateMetrics(trades, balance, equity);
    }

    /**
     * Check if BUY signal is triggered
     */
    checkBuySignal(index) {
        // All rules must be true
        for (const rule of this.strategy.rules) {
            if (!this.evaluateRule(rule, index)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if SELL signal is triggered (symmetrical to BUY with inverted operators)
     */
    checkSellSignal(index) {
        // All SELL rules must be true (SELL rules = BUY rules with inverted operators)
        for (const rule of this.strategy.rules) {
            if (!this.evaluateSellRule(rule, index)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Evaluate a SELL rule (BUY rule with inverted operator)
     */
    evaluateSellRule(rule, index) {
        let leftValue, rightValue;

        if (rule.type === 'simple') {
            leftValue = this.getPriceValue(rule.left.price, index - rule.left.shift);
            rightValue = this.getPriceValue(rule.right.price, index - rule.right.shift);
        } else {
            // Arithmetic rule
            const left1 = this.getPriceValue(rule.left.price1, index - rule.left.shift1);
            const left2 = this.getPriceValue(rule.left.price2, index - rule.left.shift2);
            const rightPrice = this.getPriceValue(rule.right.price, index - rule.right.shift);

            switch (rule.left.op) {
                case '+': leftValue = left1 + left2; break;
                case '-': leftValue = left1 - left2; break;
                case '*': leftValue = left1 * left2; break;
                default: leftValue = left1;
            }

            rightValue = rightPrice * rule.right.multiplier;
        }

        // Invert the operator for SELL
        switch (rule.operator) {
            case '>': return leftValue <= rightValue;
            case '<': return leftValue >= rightValue;
            case '>=': return leftValue < rightValue;
            case '<=': return leftValue > rightValue;
            default: return false;
        }
    }

    /**
     * Evaluate a single rule
     */
    evaluateRule(rule, index) {
        let leftValue, rightValue;

        if (rule.type === 'simple') {
            leftValue = this.getPriceValue(rule.left.price, index - rule.left.shift);
            rightValue = this.getPriceValue(rule.right.price, index - rule.right.shift);
        } else {
            // Arithmetic rule
            const left1 = this.getPriceValue(rule.left.price1, index - rule.left.shift1);
            const left2 = this.getPriceValue(rule.left.price2, index - rule.left.shift2);

            switch (rule.left.op) {
                case '+': leftValue = left1 + left2; break;
                case '-': leftValue = left1 - left2; break;
                case '*': leftValue = left1 * left2; break;
                default: leftValue = left1;
            }

            const rightPrice = this.getPriceValue(rule.right.price, index - rule.right.shift);
            rightValue = rightPrice * rule.right.multiplier;
        }

        // Evaluate operator
        switch (rule.operator) {
            case '>': return leftValue > rightValue;
            case '<': return leftValue < rightValue;
            case '>=': return leftValue >= rightValue;
            case '<=': return leftValue <= rightValue;
            default: return false;
        }
    }

    /**
     * Get price value at specific index
     */
    getPriceValue(priceType, index) {
        if (index < 0 || index >= this.dataLength) return 0;

        switch (priceType) {
            case 'open': return this.open[index];
            case 'high': return this.high[index];
            case 'low': return this.low[index];
            case 'close': return this.close[index];
            default: return 0;
        }
    }

    /**
     * Open a new position
     */
    openPosition(type, index, atr) {
        const entry = this.close[index];
        let sl, tp;

        if (type === 'BUY') {
            sl = entry - (atr * this.strategy.slMultiplier);
            tp = entry + (atr * this.strategy.tpMultiplier);
        } else { // SELL
            sl = entry + (atr * this.strategy.slMultiplier);
            tp = entry - (atr * this.strategy.tpMultiplier);
        }

        return {
            type: type,
            entry: entry,
            sl: sl,
            tp: tp,
            openIndex: index,
            openTime: this.time[index]
        };
    }

    /**
     * Check if position should be exited
     */
    checkExit(position, index) {
        const high = this.high[index];
        const low = this.low[index];

        if (position.type === 'BUY') {
            // BUY: TP is above entry, SL is below
            if (high >= position.tp) {
                return {
                    type: position.type,
                    entry: position.entry,
                    exit: position.tp,
                    profit: position.tp - position.entry,
                    reason: 'take_profit',
                    openTime: position.openTime,
                    closeTime: this.time[index]
                };
            }

            if (low <= position.sl) {
                return {
                    type: position.type,
                    entry: position.entry,
                    exit: position.sl,
                    profit: position.sl - position.entry,
                    reason: 'stop_loss',
                    openTime: position.openTime,
                    closeTime: this.time[index]
                };
            }
        } else { // SELL
            // SELL: TP is below entry, SL is above
            if (low <= position.tp) {
                return {
                    type: position.type,
                    entry: position.entry,
                    exit: position.tp,
                    profit: position.entry - position.tp,
                    reason: 'take_profit',
                    openTime: position.openTime,
                    closeTime: this.time[index]
                };
            }

            if (high >= position.sl) {
                return {
                    type: position.type,
                    entry: position.entry,
                    exit: position.sl,
                    profit: position.entry - position.sl,
                    reason: 'stop_loss',
                    openTime: position.openTime,
                    closeTime: this.time[index]
                };
            }
        }

        return null;
    }

    /**
     * Calculate ATR (Average True Range)
     */
    calculateATR(period) {
        const atr = new Float64Array(this.dataLength);
        const tr = new Float64Array(this.dataLength);

        // Calculate True Range
        for (let i = 1; i < this.dataLength; i++) {
            const hl = this.high[i] - this.low[i];
            const hc = Math.abs(this.high[i] - this.close[i - 1]);
            const lc = Math.abs(this.low[i] - this.close[i - 1]);
            tr[i] = Math.max(hl, hc, lc);
        }

        // Calculate ATR using SMA
        for (let i = period; i < this.dataLength; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += tr[i - j];
            }
            atr[i] = sum / period;
        }

        return atr;
    }

    /**
     * Calculate performance metrics
     */
    calculateMetrics(trades, finalBalance, equity) {
        if (trades.length === 0) {
            return {
                totalTrades: 0,
                buyTrades: 0,
                sellTrades: 0,
                winRate: 0,
                profitFactor: 0,
                maxDrawdown: 0,
                finalBalance: finalBalance,
                totalProfit: 0,
                avgWin: 0,
                avgLoss: 0,
                largestWin: 0,
                largestLoss: 0
            };
        }

        const winners = trades.filter(t => t.profit > 0);
        const losers = trades.filter(t => t.profit <= 0);
        const buyTrades = trades.filter(t => t.type === 'BUY');
        const sellTrades = trades.filter(t => t.type === 'SELL');

        const grossProfit = winners.reduce((sum, t) => sum + t.profit, 0);
        const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.profit, 0));

        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 10 : 0);
        const winRate = (winners.length / trades.length) * 100;

        const maxDD = this.calculateMaxDrawdown(equity);

        const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
        const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;

        const largestWin = winners.length > 0 ? Math.max(...winners.map(t => t.profit)) : 0;
        const largestLoss = losers.length > 0 ? Math.min(...losers.map(t => t.profit)) : 0;

        // Calculate hourly performance (0-23 hours)
        const hourlyStats = Array.from({ length: 24 }, () => ({
            trades: 0,
            wins: 0,
            losses: 0,
            profit: 0
        }));

        trades.forEach(trade => {
            if (trade.openTime) {
                const hour = new Date(trade.openTime).getHours();
                hourlyStats[hour].trades++;
                if (trade.profit > 0) {
                    hourlyStats[hour].wins++;
                } else {
                    hourlyStats[hour].losses++;
                }
                hourlyStats[hour].profit += trade.profit;
            }
        });

        // Find best and worst hours
        let bestHour = { hour: 0, profit: -Infinity };
        let worstHour = { hour: 0, profit: Infinity };

        hourlyStats.forEach((stats, hour) => {
            if (stats.trades > 0) {
                if (stats.profit > bestHour.profit) {
                    bestHour = { hour, profit: stats.profit };
                }
                if (stats.profit < worstHour.profit) {
                    worstHour = { hour, profit: stats.profit };
                }
            }
        });

        return {
            totalTrades: trades.length,
            buyTrades: buyTrades.length,
            sellTrades: sellTrades.length,
            winningTrades: winners.length,
            losingTrades: losers.length,
            winRate: winRate,
            profitFactor: profitFactor,
            maxDrawdown: maxDD,
            finalBalance: finalBalance,
            totalProfit: finalBalance - 10000,
            grossProfit: grossProfit,
            grossLoss: grossLoss,
            avgWin: avgWin,
            avgLoss: avgLoss,
            largestWin: largestWin,
            largestLoss: largestLoss,
            hourlyStats: hourlyStats,
            bestHour: bestHour,
            worstHour: worstHour,
            equity: equity,
            trades: trades
        };
    }

    /**
     * Calculate maximum drawdown
     */
    calculateMaxDrawdown(equity) {
        let maxDD = 0;
        let peak = equity[0];

        for (let i = 1; i < equity.length; i++) {
            if (equity[i] > peak) {
                peak = equity[i];
            }
            const dd = ((peak - equity[i]) / peak) * 100;
            if (dd > maxDD) {
                maxDD = dd;
            }
        }

        return maxDD;
    }
}
