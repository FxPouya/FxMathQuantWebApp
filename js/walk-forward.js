/**
 * Walk-Forward Analysis Module
 * Validates strategies on out-of-sample data to detect overfitting
 */

class WalkForwardAnalysis {
    constructor(data, trainingRatio = 0.7) {
        this.data = data;
        this.trainingRatio = trainingRatio;
        this.splitIndex = Math.floor(data.length * trainingRatio);
    }

    /**
     * Split data into training and testing periods
     * @returns {Object} { training: Array, testing: Array }
     */
    split() {
        return {
            training: this.data.slice(0, this.splitIndex),
            testing: this.data.slice(this.splitIndex),
            splitIndex: this.splitIndex,
            trainingBars: this.splitIndex,
            testingBars: this.data.length - this.splitIndex
        };
    }

    /**
     * Run walk-forward analysis on a strategy
     * @param {Object} strategy - Strategy to analyze
     * @param {string} symbol - Trading symbol
     * @returns {Object} Analysis results
     */
    analyze(strategy, symbol = '') {
        const { training, testing } = this.split();

        // Backtest on training data
        const trainingBacktest = new Backtester(training, strategy, symbol);
        const trainingResults = trainingBacktest.run();

        // Backtest on testing data
        const testingBacktest = new Backtester(testing, strategy, symbol);
        const testingResults = testingBacktest.run();

        // Calculate degradation
        const degradation = this.calculateDegradation(trainingResults, testingResults);

        // Calculate robustness score
        const robustnessScore = this.calculateRobustness(degradation, trainingResults, testingResults);

        // Determine if strategy passed
        const passed = robustnessScore >= 60;

        return {
            training: trainingResults,
            testing: testingResults,
            degradation: degradation,
            robustness: robustnessScore,
            passed: passed,
            splitInfo: {
                trainingBars: training.length,
                testingBars: testing.length,
                trainingRatio: this.trainingRatio
            }
        };
    }

    /**
     * Calculate performance degradation between training and testing
     * @param {Object} train - Training results
     * @param {Object} test - Testing results
     * @returns {Object} Degradation metrics
     */
    calculateDegradation(train, test) {
        return {
            profitFactor: this.calcPercentDegradation(train.profitFactor, test.profitFactor),
            winRate: train.winRate - test.winRate,
            maxDrawdown: test.maxDrawdown - train.maxDrawdown,
            netProfit: this.calcPercentDegradation(train.netProfit, test.netProfit),
            totalTrades: test.totalTrades,
            avgWin: this.calcPercentDegradation(train.avgWin, test.avgWin),
            avgLoss: this.calcPercentDegradation(train.avgLoss, test.avgLoss)
        };
    }

    /**
     * Calculate percentage degradation
     * @param {number} trainValue - Training value
     * @param {number} testValue - Testing value
     * @returns {number} Degradation percentage
     */
    calcPercentDegradation(trainValue, testValue) {
        if (trainValue === 0) return 0;
        return ((trainValue - testValue) / trainValue * 100);
    }

    /**
     * Calculate robustness score (0-100)
     * Higher score = more robust strategy
     * @param {Object} degradation - Degradation metrics
     * @param {Object} train - Training results
     * @param {Object} test - Testing results
     * @returns {number} Robustness score
     */
    calculateRobustness(degradation, train, test) {
        // Profit Factor score (40% weight)
        // Lower degradation = higher score
        const pfDeg = Math.abs(degradation.profitFactor);
        let pfScore = 100;
        if (pfDeg > 50) pfScore = 0;
        else if (pfDeg > 30) pfScore = 30;
        else if (pfDeg > 15) pfScore = 60;
        else pfScore = 100;

        // Win Rate score (30% weight)
        const wrDeg = Math.abs(degradation.winRate);
        let wrScore = 100;
        if (wrDeg > 20) wrScore = 0;
        else if (wrDeg > 10) wrScore = 40;
        else if (wrDeg > 5) wrScore = 70;
        else wrScore = 100;

        // Drawdown score (30% weight)
        // For drawdown, increase is bad
        const ddDeg = degradation.maxDrawdown;
        let ddScore = 100;
        if (ddDeg > 15) ddScore = 0;
        else if (ddDeg > 10) ddScore = 40;
        else if (ddDeg > 5) ddScore = 70;
        else if (ddDeg < -5) ddScore = 100; // Better drawdown in testing
        else ddScore = 85;

        // Additional checks
        // Penalize if testing has too few trades
        let tradesPenalty = 0;
        if (test.totalTrades < 20) {
            tradesPenalty = 20;
        } else if (test.totalTrades < 30) {
            tradesPenalty = 10;
        }

        // Bonus if testing performs better
        let bonus = 0;
        if (test.profitFactor > train.profitFactor && test.winRate >= train.winRate) {
            bonus = 10;
        }

        // Weighted average
        const score = (pfScore * 0.4) + (wrScore * 0.3) + (ddScore * 0.3) - tradesPenalty + bonus;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Get degradation severity level
     * @param {number} value - Degradation value
     * @param {boolean} inverse - If true, higher is worse (for drawdown)
     * @returns {string} 'good', 'warning', or 'bad'
     */
    getDegradationLevel(value, inverse = false) {
        const absValue = Math.abs(value);

        if (inverse) {
            // For drawdown increase
            if (value < 0) return 'good'; // Improved
            if (absValue < 5) return 'good';
            if (absValue < 10) return 'warning';
            return 'bad';
        } else {
            // For profit factor, win rate degradation
            if (absValue < 10) return 'good';
            if (absValue < 20) return 'warning';
            return 'bad';
        }
    }

    /**
     * Generate summary text for walk-forward results
     * @param {Object} results - Walk-forward results
     * @returns {string} Summary text
     */
    generateSummary(results) {
        const { robustness, passed, degradation } = results;

        if (passed) {
            if (robustness >= 80) {
                return 'Excellent! Strategy shows strong robustness with minimal overfitting.';
            } else if (robustness >= 70) {
                return 'Good! Strategy performs well on out-of-sample data.';
            } else {
                return 'Acceptable. Strategy shows reasonable robustness but monitor performance.';
            }
        } else {
            if (robustness < 40) {
                return 'Warning! High overfitting risk. Strategy may not perform well in live trading.';
            } else {
                return 'Caution. Strategy shows some overfitting. Consider re-optimization or more data.';
            }
        }
    }
}

// Export for use in other modules
window.WalkForwardAnalysis = WalkForwardAnalysis;
