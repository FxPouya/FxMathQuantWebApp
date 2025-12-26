/**
 * Display Monte Carlo results in a professional modal with Chart.js visualization
 */
function displayMonteCarloModal(strategy, index, results) {
    const m = strategy.metrics;
    const stats = results.statistics.equity;
    const expectedReturn = ((stats.mean - 10000) / 10000 * 100);

    // Determine risk level
    let riskLevel, riskClass, riskEmoji, riskMessage;
    if (results.riskOfRuin < 5) {
        riskLevel = 'LOW RISK';
        riskClass = 'good';
        riskEmoji = '✅';
        riskMessage = 'Excellent robustness. This strategy shows consistent performance across different trade sequences. Safe to trade!';
    } else if (results.riskOfRuin < 15) {
        riskLevel = 'MODERATE RISK';
        riskClass = 'warning';
        riskEmoji = '⚠️';
        riskMessage = 'Acceptable but monitor closely. Strategy has some variability. Consider reducing position size or using tighter risk management.';
    } else {
        riskLevel = 'HIGH RISK';
        riskClass = 'bad';
        riskEmoji = '❌';
        riskMessage = 'High variance. Strategy shows significant variability in outcomes. Consider avoiding or significantly reducing position size.';
    }

    // Create modal if it doesn't exist
    let modal = document.getElementById('montecarlo-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'montecarlo-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1200px;">
            <div class="modal-header">
                <h2>🎲 Monte Carlo Simulation Results</h2>
                <button class="modal-close" onclick="closeMonteCarloModal()">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Strategy Info -->
                <div class="mc-strategy-info">
                    <h3>Strategy #${index + 1}</h3>
                    <p>PF: ${m.profitFactor.toFixed(2)} | WR: ${m.winRate.toFixed(1)}% | Trades: ${m.totalTrades}</p>
                </div>
                
                <!-- Risk Assessment Banner -->
                <div class="mc-risk-banner mc-${riskClass}">
                    <div class="mc-risk-icon">${riskEmoji}</div>
                    <div class="mc-risk-content">
                        <h3>${riskLevel}</h3>
                        <p>${riskMessage}</p>
                    </div>
                </div>
                
                <!-- Summary Statistics -->
                <div class="mc-summary">
                    <div class="mc-stat-card">
                        <div class="mc-label">Expected Return</div>
                        <div class="mc-value ${expectedReturn >= 0 ? 'positive' : 'negative'}">
                            ${expectedReturn > 0 ? '+' : ''}${expectedReturn.toFixed(2)}%
                        </div>
                        <div class="mc-sublabel">Mean final equity</div>
                    </div>
                    <div class="mc-stat-card">
                        <div class="mc-label">Risk of Ruin</div>
                        <div class="mc-value mc-${riskClass}">${results.riskOfRuin.toFixed(2)}%</div>
                        <div class="mc-sublabel">Probability of ${(results.rorThreshold * 100).toFixed(0)}% loss</div>
                    </div>
                    <div class="mc-stat-card">
                        <div class="mc-label">Iterations</div>
                        <div class="mc-value">${results.iterations.toLocaleString()}</div>
                        <div class="mc-sublabel">Completed in ${results.executionTime.toFixed(0)}ms</div>
                    </div>
                    <div class="mc-stat-card">
                        <div class="mc-label">Std Deviation</div>
                        <div class="mc-value">$${stats.stdDev.toFixed(2)}</div>
                        <div class="mc-sublabel">Variability measure</div>
                    </div>
                </div>
                
                <!-- Equity Distribution Histogram -->
                <div class="chart-section">
                    <h3>Equity Distribution</h3>
                    <p style="color: #a0aec0; margin-bottom: 15px;">
                        Distribution of final equity across ${results.iterations.toLocaleString()} randomized trade sequences
                    </p>
                    <canvas id="mc-histogram" style="max-height: 300px;"></canvas>
                </div>
                
                <!-- Percentile Statistics -->
                <div class="mc-percentiles">
                    <h3>Percentile Analysis</h3>
                    <table class="mc-percentile-table">
                        <thead>
                            <tr>
                                <th>Percentile</th>
                                <th>Final Equity</th>
                                <th>Return</th>
                                <th>Interpretation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>5th (Worst 5%)</strong></td>
                                <td>$${stats.percentile5.toFixed(2)}</td>
                                <td class="${((stats.percentile5 - 10000) / 10000 * 100) >= 0 ? 'positive' : 'negative'}">
                                    ${((stats.percentile5 - 10000) / 10000 * 100) > 0 ? '+' : ''}${((stats.percentile5 - 10000) / 10000 * 100).toFixed(2)}%
                                </td>
                                <td>Downside risk scenario</td>
                            </tr>
                            <tr>
                                <td><strong>25th</strong></td>
                                <td>$${stats.percentile25.toFixed(2)}</td>
                                <td class="${((stats.percentile25 - 10000) / 10000 * 100) >= 0 ? 'positive' : 'negative'}">
                                    ${((stats.percentile25 - 10000) / 10000 * 100) > 0 ? '+' : ''}${((stats.percentile25 - 10000) / 10000 * 100).toFixed(2)}%
                                </td>
                                <td>Below average outcome</td>
                            </tr>
                            <tr class="highlight-row">
                                <td><strong>50th (Median)</strong></td>
                                <td>$${stats.percentile50.toFixed(2)}</td>
                                <td class="${((stats.percentile50 - 10000) / 10000 * 100) >= 0 ? 'positive' : 'negative'}">
                                    ${((stats.percentile50 - 10000) / 10000 * 100) > 0 ? '+' : ''}${((stats.percentile50 - 10000) / 10000 * 100).toFixed(2)}%
                                </td>
                                <td>Typical outcome</td>
                            </tr>
                            <tr>
                                <td><strong>75th</strong></td>
                                <td>$${stats.percentile75.toFixed(2)}</td>
                                <td class="${((stats.percentile75 - 10000) / 10000 * 100) >= 0 ? 'positive' : 'negative'}">
                                    ${((stats.percentile75 - 10000) / 10000 * 100) > 0 ? '+' : ''}${((stats.percentile75 - 10000) / 10000 * 100).toFixed(2)}%
                                </td>
                                <td>Above average outcome</td>
                            </tr>
                            <tr>
                                <td><strong>95th (Best 5%)</strong></td>
                                <td>$${stats.percentile95.toFixed(2)}</td>
                                <td class="${((stats.percentile95 - 10000) / 10000 * 100) >= 0 ? 'positive' : 'negative'}">
                                    ${((stats.percentile95 - 10000) / 10000 * 100) > 0 ? '+' : ''}${((stats.percentile95 - 10000) / 10000 * 100).toFixed(2)}%
                                </td>
                                <td>Upside potential</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Confidence Intervals -->
                <div class="mc-confidence">
                    <h3>Confidence Intervals</h3>
                    <div class="mc-confidence-grid">
                        <div class="mc-confidence-card">
                            <div class="mc-confidence-label">90% Confidence Range</div>
                            <div class="mc-confidence-value">
                                $${results.confidence.range90.lower.toFixed(2)} - $${results.confidence.range90.upper.toFixed(2)}
                            </div>
                            <div class="mc-confidence-sublabel">90% of outcomes fall within this range</div>
                        </div>
                        <div class="mc-confidence-card">
                            <div class="mc-confidence-label">50% Confidence Range</div>
                            <div class="mc-confidence-value">
                                $${results.confidence.range50.lower.toFixed(2)} - $${results.confidence.range50.upper.toFixed(2)}
                            </div>
                            <div class="mc-confidence-sublabel">50% of outcomes fall within this range</div>
                        </div>
                    </div>
                </div>
                
                <!-- Explanation -->
                <div class="mc-explanation">
                    <h4>📖 What is Monte Carlo Simulation?</h4>
                    <p>
                        Monte Carlo simulation tests strategy robustness by randomly shuffling the order of trades 
                        ${results.iterations.toLocaleString()} times. This shows how the strategy would perform under 
                        different market conditions and helps identify if good results are due to luck or genuine edge.
                    </p>
                    <p style="margin-top: 10px;">
                        <strong>Key Insight:</strong> A robust strategy should show consistent positive returns across 
                        most simulations, with low risk of ruin and tight confidence intervals.
                    </p>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Draw histogram after modal is visible
    setTimeout(() => {
        drawMonteCarloHistogram(results, stats);
    }, 100);
}

/**
 * Draw Monte Carlo histogram using Chart.js
 */
function drawMonteCarloHistogram(results, stats) {
    const canvas = document.getElementById('mc-histogram');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Create histogram bins
    const numBins = 30;
    const min = Math.min(...results.distribution);
    const max = Math.max(...results.distribution);
    const binWidth = (max - min) / numBins;

    const bins = new Array(numBins).fill(0);
    const binLabels = [];

    for (let i = 0; i < numBins; i++) {
        binLabels.push((min + i * binWidth).toFixed(0));
    }

    // Fill bins
    results.distribution.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
        bins[binIndex]++;
    });

    // Create gradient colors based on value
    const backgroundColors = bins.map((_, i) => {
        const value = min + (i + 0.5) * binWidth;
        if (value < stats.percentile5) return 'rgba(245, 101, 101, 0.7)'; // Red for worst 5%
        if (value < stats.percentile25) return 'rgba(237, 137, 54, 0.7)'; // Orange
        if (value < stats.percentile75) return 'rgba(72, 187, 120, 0.7)'; // Green
        return 'rgba(56, 178, 172, 0.7)'; // Teal for best 25%
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f3a',
                    titleColor: '#fff',
                    bodyColor: '#a0aec0',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                    callbacks: {
                        title: function (context) {
                            const binStart = parseFloat(context[0].label);
                            const binEnd = binStart + binWidth;
                            return `$${binStart.toFixed(0)} - $${binEnd.toFixed(0)}`;
                        },
                        label: function (context) {
                            const percentage = (context.parsed.y / results.iterations * 100).toFixed(1);
                            return `${context.parsed.y} outcomes (${percentage}%)`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        meanLine: {
                            type: 'line',
                            xMin: ((stats.mean - min) / binWidth),
                            xMax: ((stats.mean - min) / binWidth),
                            borderColor: '#667eea',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: 'Mean',
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#2d3748' },
                    ticks: { color: '#a0aec0' },
                    title: {
                        display: true,
                        text: 'Frequency',
                        color: '#a0aec0'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#a0aec0',
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 10
                    },
                    title: {
                        display: true,
                        text: 'Final Equity ($)',
                        color: '#a0aec0'
                    }
                }
            }
        }
    });
}

/**
 * Close Monte Carlo modal
 */
function closeMonteCarloModal() {
    const modal = document.getElementById('montecarlo-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('montecarlo-modal');
    if (event.target === modal) {
        closeMonteCarloModal();
    }
});

// Expose functions globally
window.displayMonteCarloModal = displayMonteCarloModal;
window.closeMonteCarloModal = closeMonteCarloModal;
