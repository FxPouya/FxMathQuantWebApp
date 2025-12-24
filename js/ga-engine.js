/**
 * Genetic Algorithm Engine - Evolves trading strategies
 */
class GeneticOptimizer {
    constructor(data, config) {
        this.data = data;
        this.config = {
            populationSize: config.populationSize || 100,
            generations: config.generations || 50,
            strategiesCount: config.strategiesCount || 5,
            rulesRange: config.rulesRange || [3, 8],
            shiftRange: config.shiftRange || [1, 10],
            minTrades: config.minTrades || 30,
            minPF: config.minPF || 1.5,
            maxDD: config.maxDD || 25,
            minWR: config.minWR || 45
        };

        this.population = [];
        this.foundStrategies = [];
        this.isRunning = false;
        this.currentGeneration = 0;
    }

    /**
     * Initialize random population
     */
    initializePopulation() {
        this.population = [];
        for (let i = 0; i < this.config.populationSize; i++) {
            const strategy = new Strategy();
            strategy.generateRandomRules(this.config.rulesRange, this.config.shiftRange);
            strategy.randomizeParameters();
            this.population.push(strategy);
        }
    }

    /**
     * Evaluate fitness for all strategies
     */
    evaluatePopulation() {
        for (const strategy of this.population) {
            const backtester = new Backtester(this.data, strategy);
            strategy.metrics = backtester.run();
            strategy.fitness = this.calculateFitness(strategy.metrics);
        }

        // Sort by fitness (descending)
        this.population.sort((a, b) => b.fitness - a.fitness);
    }

    /**
     * Calculate fitness score
     */
    calculateFitness(metrics) {
        if (metrics.totalTrades === 0) return 0;

        const pf = Math.min(metrics.profitFactor, 10);
        const trades = Math.sqrt(metrics.totalTrades);
        const wrBonus = metrics.winRate > 50 ? 1 + (metrics.winRate - 50) / 100 : 1;
        const ddPenalty = 1 + (metrics.maxDrawdown / 100);

        // Calculate BUY/SELL balance bonus
        const buyRatio = (metrics.buyTrades / metrics.totalTrades) * 100;
        const sellRatio = (metrics.sellTrades / metrics.totalTrades) * 100;

        // Reward strategies with 30-70% split (most balanced)
        // Penalize strategies with <20% or >80% of one type
        let balanceBonus = 1.0;
        if (buyRatio >= 30 && buyRatio <= 70) {
            balanceBonus = 1.2; // 20% bonus for good balance
        } else if (buyRatio >= 20 && buyRatio <= 80) {
            balanceBonus = 1.1; // 10% bonus for acceptable balance
        } else {
            balanceBonus = 0.5; // 50% penalty for poor balance
        }

        return (Math.pow(pf, 1.5) * trades * wrBonus * balanceBonus) / ddPenalty;
    }

    /**
     * Check if strategy meets criteria
     */
    meetsCriteria(strategy) {
        const m = strategy.metrics;

        // Check basic criteria
        const meetsBasic = (
            m.totalTrades >= this.config.minTrades &&
            m.profitFactor >= this.config.minPF &&
            m.maxDrawdown <= this.config.maxDD &&
            m.winRate >= this.config.minWR
        );

        if (!meetsBasic) return false;

        // Check BUY/SELL balance (should be between 20-80%)
        const buyRatio = (m.buyTrades / m.totalTrades) * 100;
        const sellRatio = (m.sellTrades / m.totalTrades) * 100;

        // Require at least 20% of each type for balance
        const isBalanced = buyRatio >= 20 && sellRatio >= 20;

        console.log(`📊 Strategy balance: BUY=${buyRatio.toFixed(1)}%, SELL=${sellRatio.toFixed(1)}%, Balanced=${isBalanced}`);

        return isBalanced;
    }

    /**
     * Tournament selection
     */
    tournamentSelection() {
        const tournamentSize = 3;
        let best = null;

        for (let i = 0; i < tournamentSize; i++) {
            const candidate = this.population[Math.floor(Math.random() * this.population.length)];
            if (!best || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }

        return best.copy();
    }

    /**
     * Crossover two parent strategies
     */
    crossover(parent1, parent2) {
        const child = new Strategy();

        // Crossover rules
        const splitPoint = Math.floor(Math.random() * Math.min(parent1.rules.length, parent2.rules.length));
        child.rules = [
            ...parent1.rules.slice(0, splitPoint),
            ...parent2.rules.slice(splitPoint)
        ];

        // Ensure rules count is within range
        while (child.rules.length < this.config.rulesRange[0]) {
            child.rules.push(child.generateRule(this.config.shiftRange));
        }
        while (child.rules.length > this.config.rulesRange[1]) {
            child.rules.splice(Math.floor(Math.random() * child.rules.length), 1);
        }

        // Crossover parameters
        child.atrPeriod = Math.random() < 0.5 ? parent1.atrPeriod : parent2.atrPeriod;
        child.slMultiplier = Math.random() < 0.5 ? parent1.slMultiplier : parent2.slMultiplier;
        child.tpMultiplier = Math.random() < 0.5 ? parent1.tpMultiplier : parent2.tpMultiplier;

        return child;
    }

    /**
     * Mutate a strategy
     */
    mutate(strategy) {
        const mutationRate = 0.2;

        if (Math.random() < mutationRate) {
            const mutationType = Math.random();

            if (mutationType < 0.4) {
                // Mutate a rule
                if (strategy.rules.length > 0) {
                    const index = Math.floor(Math.random() * strategy.rules.length);
                    strategy.rules[index] = strategy.generateRule(this.config.shiftRange);
                }
            } else if (mutationType < 0.55) {
                // Add a rule
                if (strategy.rules.length < this.config.rulesRange[1]) {
                    strategy.rules.push(strategy.generateRule(this.config.shiftRange));
                }
            } else if (mutationType < 0.7) {
                // Remove a rule
                if (strategy.rules.length > this.config.rulesRange[0]) {
                    strategy.rules.splice(Math.floor(Math.random() * strategy.rules.length), 1);
                }
            } else if (mutationType < 0.85) {
                // Mutate ATR period
                strategy.atrPeriod = Math.floor(Math.random() * 31) + 10;
            } else {
                // Mutate SL/TP
                strategy.slMultiplier = (Math.random() * 3) + 1;
                strategy.tpMultiplier = strategy.slMultiplier + (Math.random() * 5) + 0.5;
            }
        }
    }

    /**
     * Evolve one generation
     */
    evolveGeneration() {
        const newPopulation = [];

        // Elitism: keep top 2 strategies
        newPopulation.push(this.population[0].copy());
        newPopulation.push(this.population[1].copy());

        // Generate rest through crossover and mutation
        while (newPopulation.length < this.config.populationSize) {
            const parent1 = this.tournamentSelection();
            const parent2 = this.tournamentSelection();

            const child = this.crossover(parent1, parent2);
            this.mutate(child);

            newPopulation.push(child);
        }

        this.population = newPopulation;
    }

    /**
     * Run the genetic algorithm
     */
    async run(progressCallback) {
        console.log('🧬 GA.run() started');
        console.log('📊 Data rows:', this.data.length);
        console.log('⚙️ Config:', this.config);
        this.isRunning = true;
        this.foundStrategies = [];
        this.currentGeneration = 0;

        const startTime = Date.now();

        while (this.isRunning && this.foundStrategies.length < this.config.strategiesCount) {
            console.log('🔄 Starting new GA search, found so far:', this.foundStrategies.length);
            // Initialize new population for each search
            this.initializePopulation();
            console.log('✅ Population initialized:', this.population.length, 'strategies');

            // Evolve for specified generations
            for (let gen = 0; gen < this.config.generations && this.isRunning; gen++) {
                this.currentGeneration = gen + 1;

                // Evaluate fitness
                console.log(`Gen ${gen + 1}/${this.config.generations}: Evaluating population...`);
                this.evaluatePopulation();
                console.log(`Gen ${gen + 1}: Best fitness = ${this.population[0].fitness.toFixed(2)}, Trades = ${this.population[0].metrics.totalTrades}`);

                // Report progress
                if (progressCallback) {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    progressCallback({
                        generation: gen + 1,
                        totalGenerations: this.config.generations,
                        bestFitness: this.population[0].fitness,
                        avgFitness: this.population.reduce((sum, s) => sum + s.fitness, 0) / this.population.length,
                        foundCount: this.foundStrategies.length,
                        targetCount: this.config.strategiesCount,
                        elapsedTime: elapsed
                    });
                }

                // Check if best strategy meets criteria
                const best = this.population[0];
                console.log(`Checking criteria: PF=${best.metrics.profitFactor.toFixed(2)}, WR=${best.metrics.winRate.toFixed(1)}%, Trades=${best.metrics.totalTrades}, DD=${best.metrics.maxDrawdown.toFixed(2)}%`);
                if (this.meetsCriteria(best) && !this.isDuplicate(best)) {
                    console.log('✅ Strategy meets criteria!');
                    this.foundStrategies.push(best.copy());

                    if (progressCallback) {
                        progressCallback({
                            strategyFound: best,
                            foundCount: this.foundStrategies.length
                        });
                    }

                    // If we found enough, break
                    if (this.foundStrategies.length >= this.config.strategiesCount) {
                        break;
                    }
                }

                // Evolve to next generation
                if (gen < this.config.generations - 1) {
                    this.evolveGeneration();
                }

                // Allow UI to update
                await this.sleep(10);
            }
        }

        this.isRunning = false;
        console.log('🏁 GA.run() complete. Returning', this.foundStrategies.length, 'strategies');
        console.log('Strategies to return:', this.foundStrategies);
        return this.foundStrategies;
    }

    /**
     * Check if strategy is duplicate
     */
    isDuplicate(strategy) {
        for (const existing of this.foundStrategies) {
            if (this.strategiesSimilar(strategy, existing)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if two strategies are similar
     */
    strategiesSimilar(s1, s2) {
        // Simple check: if rules are identical
        if (s1.rules.length !== s2.rules.length) return false;

        const rules1 = JSON.stringify(s1.rules);
        const rules2 = JSON.stringify(s2.rules);

        return rules1 === rules2;
    }

    /**
     * Stop the optimization
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Sleep helper for async
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
