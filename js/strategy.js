/**
 * Strategy Class - Represents a trading strategy with rules and parameters
 */
class Strategy {
    constructor() {
        this.rules = [];
        this.atrPeriod = 20;
        this.slMultiplier = 2.0;
        this.tpMultiplier = 3.0;
        this.closeAtOpposite = false; // Disable to allow independent BUY/SELL signals
        this.fitness = 0;
        this.metrics = {};
        this.id = this.generateId();
    }

    generateId() {
        return 'strategy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate random trading rules
     */
    generateRandomRules(count, shiftRange) {
        const minRules = count[0] || 3;
        const maxRules = count[1] || 8;
        const numRules = Math.floor(Math.random() * (maxRules - minRules + 1)) + minRules;

        for (let i = 0; i < numRules; i++) {
            this.rules.push(this.generateRule(shiftRange));
        }
    }

    /**
     * Generate a single random rule
     */
    generateRule(shiftRange) {
        const priceTypes = ['open', 'high', 'low', 'close'];
        const operators = ['>', '<', '>=', '<='];

        const minShift = shiftRange[0] || 1;
        const maxShift = shiftRange[1] || 10;

        // 70% simple rules, 30% arithmetic rules
        if (Math.random() < 0.7) {
            // Simple rule: CLOSE[1] > OPEN[2]
            return {
                type: 'simple',
                left: {
                    price: priceTypes[Math.floor(Math.random() * 4)],
                    shift: Math.floor(Math.random() * (maxShift - minShift + 1)) + minShift
                },
                operator: operators[Math.floor(Math.random() * 4)],
                right: {
                    price: priceTypes[Math.floor(Math.random() * 4)],
                    shift: Math.floor(Math.random() * (maxShift - minShift + 1)) + minShift
                }
            };
        } else {
            // Arithmetic rule: (HIGH[1] + LOW[1]) > (CLOSE[2] * 1.01)
            const arithmeticOps = ['+', '-', '*'];
            const multipliers = [0.99, 1.01, 1.02, 0.98];

            return {
                type: 'arithmetic',
                left: {
                    price1: priceTypes[Math.floor(Math.random() * 4)],
                    shift1: Math.floor(Math.random() * (maxShift - minShift + 1)) + minShift,
                    op: arithmeticOps[Math.floor(Math.random() * 3)],
                    price2: priceTypes[Math.floor(Math.random() * 4)],
                    shift2: Math.floor(Math.random() * (maxShift - minShift + 1)) + minShift
                },
                operator: operators[Math.floor(Math.random() * 4)],
                right: {
                    price: priceTypes[Math.floor(Math.random() * 4)],
                    shift: Math.floor(Math.random() * (maxShift - minShift + 1)) + minShift,
                    multiplier: multipliers[Math.floor(Math.random() * 4)]
                }
            };
        }
    }

    /**
     * Randomize ATR and SL/TP parameters
     */
    randomizeParameters() {
        this.atrPeriod = Math.floor(Math.random() * 31) + 10; // 10-40
        this.slMultiplier = (Math.random() * 3) + 1; // 1.0-4.0
        this.tpMultiplier = this.slMultiplier + (Math.random() * 5) + 0.5; // SL + 0.5 to 5.5
    }

    /**
     * Create a deep copy of the strategy
     */
    copy() {
        const newStrategy = new Strategy();
        newStrategy.rules = JSON.parse(JSON.stringify(this.rules));
        newStrategy.atrPeriod = this.atrPeriod;
        newStrategy.slMultiplier = this.slMultiplier;
        newStrategy.tpMultiplier = this.tpMultiplier;
        newStrategy.closeAtOpposite = this.closeAtOpposite;
        newStrategy.metrics = this.metrics ? JSON.parse(JSON.stringify(this.metrics)) : {};
        newStrategy.fitness = this.fitness || 0;
        // Copy walk-forward analysis results
        newStrategy.walkForward = this.walkForward ? JSON.parse(JSON.stringify(this.walkForward)) : undefined;
        return newStrategy;
    }

    /**
     * Convert rules to human-readable format
     */
    getRulesText() {
        return this.rules.map((rule, index) => {
            if (rule.type === 'simple') {
                return `${index + 1}. ${rule.left.price.toUpperCase()}[${rule.left.shift}] ${rule.operator} ${rule.right.price.toUpperCase()}[${rule.right.shift}]`;
            } else {
                return `${index + 1}. (${rule.left.price1.toUpperCase()}[${rule.left.shift1}] ${rule.left.op} ${rule.left.price2.toUpperCase()}[${rule.left.shift2}]) ${rule.operator} (${rule.right.price.toUpperCase()}[${rule.right.shift}] * ${rule.right.multiplier})`;
            }
        }).join('\n');
    }

    /**
     * Export to JSON
     */
    toJSON() {
        return {
            id: this.id,
            rules: this.rules,
            parameters: {
                atr_period: this.atrPeriod,
                sl_multiplier: this.slMultiplier,
                tp_multiplier: this.tpMultiplier,
                close_at_opposite: this.closeAtOpposite
            },
            performance: this.metrics,
            fitness: this.fitness
        };
    }

    /**
     * Import from JSON
     */
    static fromJSON(json) {
        const strategy = new Strategy();
        strategy.id = json.id;
        strategy.rules = json.rules;
        strategy.atrPeriod = json.parameters.atr_period;
        strategy.slMultiplier = json.parameters.sl_multiplier;
        strategy.tpMultiplier = json.parameters.tp_multiplier;
        strategy.closeAtOpposite = json.parameters.close_at_opposite || false;
        strategy.metrics = json.performance || {};
        strategy.fitness = json.fitness || 0;
        return strategy;
    }
}
