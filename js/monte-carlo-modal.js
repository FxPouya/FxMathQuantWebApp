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
                        <div class="mc-label">Max Drawdown (Worst)</div>
                        <div class="mc-value negative">
                            ${results.statistics.drawdown.percentile95.toFixed(2)}%
                        </div>
                        <div class="mc-sublabel">95th percentile (worst 5%)</div>
                    </div>
                    <div class="mc-stat-card">
                        <div class="mc-label">Max Drawdown (Median)</div>
                        <div class="mc-value mc-warning">
                            ${results.statistics.drawdown.median.toFixed(2)}%
                        </div>
                        <div class="mc-sublabel">Typical drawdown scenario</div>
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
                </div>
                
                <!-- Drawdown Distribution Histogram -->
                <div class="chart-section">
                    <h3>📉 Drawdown Distribution</h3>
                    <p style="color: #a0aec0; margin-bottom: 15px;">
                        Distribution of maximum drawdown across ${results.iterations.toLocaleString()} randomized trade sequences
                    </p>
                    <canvas id="mc-histogram" style="max-height: 300px;"></canvas>
                </div>
                
                <!-- Educational Note -->
                <div class="mc-explanation" style="margin-top: 20px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; padding: 15px;">
                    <h4 style="margin-bottom: 10px; color: #60a5fa;">💡 Understanding Monte Carlo Results</h4>
                    <p style="margin-bottom: 8px;">
                        <strong>Why focus on drawdown?</strong> When shuffling trades, the final equity stays nearly constant 
                        (sum of trades doesn't change), but the <strong>drawdown varies significantly</strong> based on trade order.
                    </p>
                    <p style="margin-bottom: 0;">
                        <strong>Key Insight:</strong> A robust strategy should show <strong>consistent low drawdowns</strong> across 
                        different trade sequences. High drawdown variance indicates the strategy's performance is highly dependent 
                        on lucky trade timing.
                    </p>
                </div>
                
                <!-- Drawdown Percentile Statistics -->
                <div class="mc-percentiles">
                    <h3>Drawdown Percentile Analysis</h3>
                    <table class="mc-percentile-table">
                        <thead>
                            <tr>
                                <th>Percentile</th>
                                <th>Max Drawdown</th>
                                <th>Interpretation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>5th (Best 5%)</strong></td>
                                <td class="positive">${results.statistics.drawdown.percentile5.toFixed(2)}%</td>
                                <td>Best-case drawdown scenario</td>
                            </tr>
                            <tr>
                                <td><strong>25th</strong></td>
                                <td>${results.statistics.drawdown.percentile25.toFixed(2)}%</td>
                                <td>Better than average</td>
                            </tr>
                            <tr class="highlight-row">
                                <td><strong>50th (Median)</strong></td>
                                <td>${results.statistics.drawdown.median.toFixed(2)}%</td>
                                <td>Typical drawdown</td>
                            </tr>
                            <tr>
                                <td><strong>75th</strong></td>
                                <td class="mc-warning">${results.statistics.drawdown.percentile75.toFixed(2)}%</td>
                                <td>Worse than average</td>
                            </tr>
                            <tr>
                                <td><strong>95th (Worst 5%)</strong></td>
                                <td class="negative">${results.statistics.drawdown.percentile95.toFixed(2)}%</td>
                                <td>Worst-case drawdown scenario</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Drawdown Statistics Summary -->
                <div class="mc-confidence">
                    <h3>Drawdown Statistics Summary</h3>
                    <div class="mc-confidence-grid">
                        <div class="mc-confidence-card">
                            <div class="mc-confidence-label">Average Drawdown</div>
                            <div class="mc-confidence-value">
                                ${results.statistics.drawdown.mean.toFixed(2)}%
                            </div>
                            <div class="mc-confidence-sublabel">Mean across all simulations</div>
                        </div>
                        <div class="mc-confidence-card">
                            <div class="mc-confidence-label">Drawdown Std Dev</div>
                            <div class="mc-confidence-value">
                                ${results.statistics.drawdown.stdDev.toFixed(2)}%
                            </div>
                            <div class="mc-confidence-sublabel">Variability in drawdown outcomes</div>
                        </div>
                        <div class="mc-confidence-card">
                            <div class="mc-confidence-label">Expected Return</div>
                            <div class="mc-confidence-value ${expectedReturn >= 0 ? 'positive' : 'negative'}">
                                ${expectedReturn > 0 ? '+' : ''}${expectedReturn.toFixed(2)}%
                            </div>
                            <div class="mc-confidence-sublabel">Consistent across simulations</div>
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

    // Create histogram bins for DRAWDOWN distribution
    const numBins = 30;
    const drawdownData = results.drawdownDistribution;
    const min = Math.min(...drawdownData);
    const max = Math.max(...drawdownData);
    const binWidth = (max - min) / numBins;

    const bins = new Array(numBins).fill(0);
    const binLabels = [];

    for (let i = 0; i < numBins; i++) {
        binLabels.push((min + i * binWidth).toFixed(1));
    }

    // Fill bins with drawdown data
    drawdownData.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
        bins[binIndex]++;
    });

    // Create gradient colors based on drawdown value (GREEN = low DD, RED = high DD)
    const ddStats = results.statistics.drawdown;
    const backgroundColors = bins.map((_, i) => {
        const value = min + (i + 0.5) * binWidth;
        if (value < ddStats.percentile25) return 'rgba(72, 187, 120, 0.7)'; // Green for best 25%
        if (value < ddStats.percentile50) return 'rgba(56, 178, 172, 0.7)'; // Teal
        if (value < ddStats.percentile75) return 'rgba(237, 137, 54, 0.7)'; // Orange
        return 'rgba(245, 101, 101, 0.7)'; // Red for worst 25%
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
                            return `${binStart.toFixed(1)}% - ${binEnd.toFixed(1)}%`;
                        },
                        label: function (context) {
                            const percentage = (context.parsed.y / results.iterations * 100).toFixed(1);
                            return `${context.parsed.y} outcomes (${percentage}%)`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        medianLine: {
                            type: 'line',
                            xMin: ((ddStats.median - min) / binWidth),
                            xMax: ((ddStats.median - min) / binWidth),
                            borderColor: '#667eea',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: 'Median',
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
                        text: 'Maximum Drawdown (%)',
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
