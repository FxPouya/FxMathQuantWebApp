/**
 * Monte Carlo Simulation - Analyzes strategy robustness through trade randomization
 * 
 * This module shuffles trade sequences thousands of times to calculate:
 * - Distribution of possible outcomes
 * - Confidence intervals (5th-95th percentile)
 * - Risk of ruin probability
 * - Expected vs worst-case scenarios
 */

class MonteCarloSimulation {
    constructor(trades, iterations = 1000, rorThreshold = 0.2) {
        this.trades = trades; // Array of trade objects with profit/loss
        this.iterations = iterations;
        this.rorThreshold = rorThreshold; // Risk of ruin threshold (default 20%)
        this.startingEquity = 10000;
    }

    /**
     * Run the full Monte Carlo simulation
     * @returns {Object} Statistical results
     */
    run() {
        console.log(`🎲 Running Monte Carlo simulation (${this.iterations} iterations)...`);
        const startTime = performance.now();

        const results = [];

        for (let i = 0; i < this.iterations; i++) {
            const shuffled = this.shuffleTrades();
            const equity = this.calculateEquityCurve(shuffled);

            results.push({
                finalEquity: equity[equity.length - 1],
                maxEquity: Math.max(...equity),
                minEquity: Math.min(...equity),
                maxDrawdown: this.calculateMaxDrawdown(equity),
                equityCurve: equity
            });
        }

        const statistics = this.calculateStatistics(results);
        const endTime = performance.now();

        console.log(`✅ Monte Carlo complete in ${(endTime - startTime).toFixed(0)}ms`);

        return {
            iterations: this.iterations,
            statistics,
            distribution: results.map(r => r.finalEquity),
            drawdownDistribution: results.map(r => r.maxDrawdown),
            riskOfRuin: this.calculateRiskOfRuin(results),
            confidence: this.calculateConfidenceIntervals(results),
            executionTime: endTime - startTime
        };
    }

    /**
     * Shuffle trades using Fisher-Yates algorithm
     * @returns {Array} Shuffled copy of trades
     */
    shuffleTrades() {
        const shuffled = [...this.trades];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * Calculate equity curve for a sequence of trades
     * @param {Array} trades - Ordered array of trades
     * @returns {Array} Equity values over time
     */
    calculateEquityCurve(trades) {
        const equity = [this.startingEquity];
        let currentEquity = this.startingEquity;

        for (const trade of trades) {
            currentEquity += trade.profit;
            equity.push(currentEquity);
        }

        return equity;
    }

    /**
     * Calculate maximum drawdown from equity curve
     * @param {Array} equity - Equity curve
     * @returns {Number} Max drawdown percentage
     */
    calculateMaxDrawdown(equity) {
        let maxEquity = equity[0];
        let maxDD = 0;

        for (const value of equity) {
            if (value > maxEquity) {
                maxEquity = value;
            }
            const drawdown = ((maxEquity - value) / maxEquity) * 100;
            if (drawdown > maxDD) {
                maxDD = drawdown;
            }
        }

        return maxDD;
    }

    /**
     * Calculate comprehensive statistics from results
     * @param {Array} results - Array of simulation results
     * @returns {Object} Statistical measures
     */
    calculateStatistics(results) {
        const finalEquities = results.map(r => r.finalEquity);
        const drawdowns = results.map(r => r.maxDrawdown);

        return {
            equity: {
                mean: this.mean(finalEquities),
                median: this.median(finalEquities),
                stdDev: this.standardDeviation(finalEquities),
                min: Math.min(...finalEquities),
                max: Math.max(...finalEquities),
                percentile5: this.getPercentile(finalEquities, 5),
                percentile25: this.getPercentile(finalEquities, 25),
                percentile50: this.getPercentile(finalEquities, 50),
                percentile75: this.getPercentile(finalEquities, 75),
                percentile95: this.getPercentile(finalEquities, 95)
            },
            drawdown: {
                mean: this.mean(drawdowns),
                median: this.median(drawdowns),
                stdDev: this.standardDeviation(drawdowns),
                min: Math.min(...drawdowns),
                max: Math.max(...drawdowns),
                percentile5: this.getPercentile(drawdowns, 5),
                percentile95: this.getPercentile(drawdowns, 95)
            }
        };
    }

    /**
     * Calculate risk of ruin (probability of losing X% of capital)
     * @param {Array} results - Simulation results
     * @returns {Number} Risk of ruin percentage
     */
    calculateRiskOfRuin(results) {
        const ruinEquity = this.startingEquity * (1 - this.rorThreshold);
        const ruinCount = results.filter(r => r.minEquity <= ruinEquity).length;

        return (ruinCount / results.length) * 100;
    }

    /**
     * Calculate confidence intervals
     * @param {Array} results - Simulation results
     * @returns {Object} Confidence interval data
     */
    calculateConfidenceIntervals(results) {
        const finalEquities = results.map(r => r.finalEquity);

        return {
            range90: {
                lower: this.getPercentile(finalEquities, 5),
                upper: this.getPercentile(finalEquities, 95)
            },
            range50: {
                lower: this.getPercentile(finalEquities, 25),
                upper: this.getPercentile(finalEquities, 75)
            }
        };
    }

    /**
     * Calculate mean (average)
     * @param {Array} data - Numeric array
     * @returns {Number} Mean value
     */
    mean(data) {
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }

    /**
     * Calculate median (50th percentile)
     * @param {Array} data - Numeric array
     * @returns {Number} Median value
     */
    median(data) {
        return this.getPercentile(data, 50);
    }

    /**
     * Calculate standard deviation
     * @param {Array} data - Numeric array
     * @returns {Number} Standard deviation
     */
    standardDeviation(data) {
        const avg = this.mean(data);
        const squareDiffs = data.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = this.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calculate percentile value
     * @param {Array} data - Numeric array
     * @param {Number} percentile - Percentile to calculate (0-100)
     * @returns {Number} Percentile value
     */
    getPercentile(data, percentile) {
        const sorted = [...data].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;

        if (lower === upper) {
            return sorted[lower];
        }

        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    /**
     * Generate summary text for results
     * @param {Object} results - Monte Carlo results
     * @returns {String} Human-readable summary
     */
    static generateSummary(results) {
        const { statistics, riskOfRuin, confidence } = results;
        const expectedReturn = ((statistics.equity.mean - 10000) / 10000 * 100).toFixed(2);

        let summary = `Monte Carlo Analysis (${results.iterations} iterations):\n\n`;
        summary += `Expected Return: ${expectedReturn}%\n`;
        summary += `90% Confidence Range: $${confidence.range90.lower.toFixed(2)} - $${confidence.range90.upper.toFixed(2)}\n`;
        summary += `Risk of Ruin (${(results.rorThreshold * 100)}%): ${riskOfRuin.toFixed(2)}%\n\n`;

        if (riskOfRuin < 5) {
            summary += `✅ Low risk - Strategy shows good robustness`;
        } else if (riskOfRuin < 15) {
            summary += `⚠️ Moderate risk - Acceptable but monitor closely`;
        } else {
            summary += `❌ High risk - Consider reducing position size or avoiding`;
        }

        return summary;
    }

    /**
     * Extract trades from strategy backtest results
     * @param {Object} strategy - Strategy with metrics
     * @returns {Array} Array of trade objects
     */
    static extractTrades(strategy) {
        if (!strategy.metrics || !strategy.metrics.trades) {
            throw new Error('Strategy must have backtest results with trades');
        }

        return strategy.metrics.trades.map(trade => ({
            profit: trade.profit,
            type: trade.type,
            entry: trade.entry,
            exit: trade.exit
        }));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonteCarloSimulation;
}
