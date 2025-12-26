// Rule Parser - Converts strategy rule objects to platform-specific syntax
class RuleParser {
    constructor() { }

    parseRules(rules, platform = 'mql') {
        return rules.map(rule => this.parseRule(rule, platform));
    }

    // Parse rules with inverted operators (for SELL signals)
    parseRulesInverted(rules, platform = 'mql') {
        return rules.map(rule => this.parseRule(rule, platform, true));
    }

    parseRule(rule, platform = 'mql', invertOp = false) {
        if (rule.type === 'simple') {
            return this.parseSimpleRule(rule, platform, invertOp);
        } else {
            return this.parseArithmeticRule(rule, platform, invertOp);
        }
    }

    parseSimpleRule(rule, platform, invertOp = false) {
        const left = this.getPriceReference(rule.left.price, rule.left.shift, platform);
        const right = this.getPriceReference(rule.right.price, rule.right.shift, platform);
        const operator = invertOp ? this.invertOperator(rule.operator) : rule.operator;

        return `${left} ${operator} ${right}`;
    }

    parseArithmeticRule(rule, platform, invertOp = false) {
        const left1 = this.getPriceReference(rule.left.price1, rule.left.shift1, platform);
        const left2 = this.getPriceReference(rule.left.price2, rule.left.shift2, platform);
        const leftOp = rule.left.op;
        const right = this.getPriceReference(rule.right.price, rule.right.shift, platform);
        const multiplier = rule.right.multiplier;
        const operator = invertOp ? this.invertOperator(rule.operator) : rule.operator;

        return `(${left1} ${leftOp} ${left2}) ${operator} (${right} * ${multiplier})`;
    }

    // Invert comparison operators for SELL signals
    invertOperator(operator) {
        const inversionMap = {
            '<': '>=',
            '<=': '>',
            '>': '<=',
            '>=': '<',
            '==': '!=',
            '!=': '=='
        };
        return inversionMap[operator] || operator;
    }

    getPriceReference(priceType, shift, platform) {
        const price = priceType.charAt(0).toUpperCase() + priceType.slice(1).toLowerCase();

        if (platform === 'mql') {
            // MQ4 style
            return `${price}[${shift}]`;
        } else if (platform === 'mq5') {
            // MQ5 style
            return `i${price}(_Symbol, PERIOD_CURRENT, ${shift})`;
        } else if (platform === 'pine') {
            // Pine Script style
            const priceLower = priceType.toLowerCase();
            return shift === 0 ? priceLower : `${priceLower}[${shift}]`;
        } else if (platform === 'csharp') {
            // cTrader C# style
            return `MarketSeries.${price}.Last(${shift})`;
        }

        return `${price}[${shift}]`;
    }
}

// Export for use in other modules
window.RuleParser = RuleParser;
