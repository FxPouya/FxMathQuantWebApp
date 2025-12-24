/**
 * View detailed strategy information in a modal
 */
function viewStrategyDetails(index) {
    console.log('🔍 viewStrategyDetails called with index:', index);
    console.log('📊 appData.foundStrategies:', appData?.foundStrategies);

    if (!appData || !appData.foundStrategies) {
        console.error('❌ appData or foundStrategies is undefined!');
        alert('Error: Strategy data not available');
        return;
    }

    if (index < 0 || index >= appData.foundStrategies.length) {
        console.error('❌ Invalid index:', index, 'Length:', appData.foundStrategies.length);
        alert('Error: Invalid strategy index');
        return;
    }

    const strategy = appData.foundStrategies[index];
    if (!strategy || !strategy.metrics) {
        console.error('❌ Invalid strategy at index:', index);
        alert('Error: Strategy data is corrupted');
        return;
    }

    const m = strategy.metrics;

    // Additional validation for required metrics
    if (!m.profitFactor || !m.winRate || !m.totalTrades) {
        console.error('❌ Missing required metrics:', m);
        alert('Error: Strategy metrics are incomplete');
        return;
    }

    // Create modal if it doesn't exist
    let modal = document.getElementById('strategy-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'strategy-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const name = `FxMath_${String(index + 1).padStart(3, '0')}_PF${(m.profitFactor || 0).toFixed(2).replace('.', '_')}_WR${Math.round(m.winRate || 0)}`;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${name}</h2>
                <button class="modal-close" onclick="closeStrategyModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="metrics-grid-detailed">
                    <div class="metric-detailed">
                        <span class="metric-label">Profit Factor</span>
                        <span class="metric-value ${m.profitFactor >= 1.5 ? 'positive' : 'negative'}">${m.profitFactor.toFixed(2)}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Win Rate</span>
                        <span class="metric-value">${m.winRate.toFixed(1)}%</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Total Trades</span>
                        <span class="metric-value">${m.totalTrades}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">BUY Trades</span>
                        <span class="metric-value" style="color: #48bb78;">${m.buyTrades || 0}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">SELL Trades</span>
                        <span class="metric-value" style="color: #f56565;">${m.sellTrades || 0}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Winning Trades</span>
                        <span class="metric-value positive">${m.winningTrades || 0}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Losing Trades</span>
                        <span class="metric-value negative">${m.losingTrades || 0}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Max Drawdown</span>
                        <span class="metric-value negative">${m.maxDrawdown.toFixed(2)}%</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Total Profit</span>
                        <span class="metric-value ${m.totalProfit >= 0 ? 'positive' : 'negative'}">$${m.totalProfit.toFixed(2)}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Avg Win</span>
                        <span class="metric-value positive">$${m.avgWin.toFixed(2)}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Avg Loss</span>
                        <span class="metric-value negative">$${Math.abs(m.avgLoss).toFixed(2)}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Largest Win</span>
                        <span class="metric-value positive">$${m.largestWin.toFixed(2)}</span>
                    </div>
                    <div class="metric-detailed">
                        <span class="metric-label">Largest Loss</span>
                        <span class="metric-value negative">$${Math.abs(m.largestLoss).toFixed(2)}</span>
                    </div>
                    ${m.bestHour && m.worstHour ? `
                    <div class="metric-detailed" style="grid-column: 1 / -1; margin-top: 10px; padding: 10px; background: rgba(66, 153, 225, 0.1); border-radius: 6px;">
                        <span class="metric-label">Best Hour:</span>
                        <span class="metric-value positive">${String(m.bestHour.hour).padStart(2, '0')}:00 ($${m.bestHour.profit.toFixed(2)})</span>
                        <span style="margin: 0 15px;">|</span>
                        <span class="metric-label">Worst Hour:</span>
                        <span class="metric-value negative">${String(m.worstHour.hour).padStart(2, '0')}:00 ($${m.worstHour.profit.toFixed(2)})</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="chart-section">
                    <h3>Equity Curve</h3>
                    <canvas id="equity-chart"></canvas>
                </div>
                
                ${m.hourlyStats ? `
                <div class="chart-section">
                    <h3>Hourly Performance (24h)</h3>
                    <canvas id="hourly-chart"></canvas>
                </div>
                ` : ''}
                
                <div class="rules-section">
                    <h3>Strategy Rules</h3>
                    <p style="margin-bottom: 10px; color: #a0aec0;">BUY when ALL of the following conditions are true:</p>
                    <div class="rules-list">
                        ${strategy.rules.map((rule, i) => {
        let ruleText = '';
        if (rule.type === 'simple') {
            ruleText = `${rule.left.price.toUpperCase()}[${rule.left.shift}] ${rule.operator} ${rule.right.price.toUpperCase()}[${rule.right.shift}]`;
        } else {
            ruleText = `(${rule.left.price1.toUpperCase()}[${rule.left.shift1}] ${rule.left.op} ${rule.left.price2.toUpperCase()}[${rule.left.shift2}]) ${rule.operator} (${rule.right.price.toUpperCase()}[${rule.right.shift}] × ${rule.right.multiplier})`;
        }
        return `<div class="rule-item">${i + 1}. ${ruleText}</div>`;
    }).join('')}
                    </div>
                    
                    <p style="margin: 20px 0 10px 0; color: #a0aec0;">SELL when ALL of the following conditions are true:</p>
                    <div class="rules-list">
                        ${strategy.rules.map((rule, i) => {
        let ruleText = '';
        // Invert the operator for SELL rules
        const invertedOp = rule.operator === '>' ? '<=' :
            rule.operator === '<' ? '>=' :
                rule.operator === '>=' ? '<' :
                    rule.operator === '<=' ? '>' : rule.operator;

        if (rule.type === 'simple') {
            ruleText = `${rule.left.price.toUpperCase()}[${rule.left.shift}] ${invertedOp} ${rule.right.price.toUpperCase()}[${rule.right.shift}]`;
        } else {
            ruleText = `(${rule.left.price1.toUpperCase()}[${rule.left.shift1}] ${rule.left.op} ${rule.left.price2.toUpperCase()}[${rule.left.shift2}]) ${invertedOp} (${rule.right.price.toUpperCase()}[${rule.right.shift}] × ${rule.right.multiplier})`;
        }
        return `<div class="rule-item">${i + 1}. ${ruleText}</div>`;
    }).join('')}
                    </div>
                    <div class="parameters-box">
                        <strong>Parameters:</strong> ATR Period: ${strategy.atrPeriod} | SL Multiplier: ${strategy.slMultiplier.toFixed(2)} | TP Multiplier: ${strategy.tpMultiplier.toFixed(2)}
                    </div>
                </div>

                <div class="trades-section">
                    <h3>Trade Statement</h3>
                    <div class="trades-table-container">
                        <table class="trades-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Type</th>
                                    <th>Entry</th>
                                    <th>Exit</th>
                                    <th>Profit</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(m.trades && m.trades.length > 0) ? m.trades.map((t, i) => `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td><span class="badge">${t.type}</span></td>
                                        <td>${t.entry.toFixed(5)}</td>
                                        <td>${t.exit.toFixed(5)}</td>
                                        <td class="${t.profit >= 0 ? 'positive' : 'negative'}">$${t.profit.toFixed(2)}</td>
                                        <td>${t.reason.replace('_', ' ')}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="6" style="text-align: center; color: #a0aec0;">No trades recorded</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="modal-footer-actions">
                    <button class="btn-primary" onclick="downloadStrategy(${index}, 'mq4')">Download MQ4</button>
                    <button class="btn-primary" onclick="downloadStrategy(${index}, 'mq5')">Download MQ5</button>
                    <button class="btn-primary" onclick="downloadStrategy(${index}, 'ctrader')">cTrader</button>
                    <button class="btn-primary" onclick="downloadStrategy(${index}, 'pine')">Pine Script</button>
                    <button class="btn-success" onclick="downloadStrategy(${index}, 'report')">HTML Report</button>
                    <button class="btn-secondary" onclick="downloadStrategy(${index}, 'json')">JSON</button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Draw equity chart
    setTimeout(() => {
        const ctx = document.getElementById('equity-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: m.equity.map((_, i) => i),
                datasets: [{
                    label: 'Account Balance',
                    data: m.equity,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
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
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: '#2d3748' },
                        ticks: { color: '#a0aec0' }
                    },
                    x: {
                        grid: { color: '#2d3748' },
                        ticks: { color: '#a0aec0' }
                    }
                }
            }
        });

        // Render hourly performance chart if data exists
        if (m.hourlyStats) {
            const hourlyCanvas = document.getElementById('hourly-chart');
            if (hourlyCanvas) {
                new Chart(hourlyCanvas, {
                    type: 'bar',
                    data: {
                        labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
                        datasets: [{
                            label: 'Profit/Loss',
                            data: m.hourlyStats.map(h => h.profit),
                            backgroundColor: m.hourlyStats.map(h => h.profit >= 0 ? 'rgba(72, 187, 120, 0.6)' : 'rgba(245, 101, 101, 0.6)'),
                            borderColor: m.hourlyStats.map(h => h.profit >= 0 ? 'rgba(72, 187, 120, 1)' : 'rgba(245, 101, 101, 1)'),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const hour = context.dataIndex;
                                        const stats = m.hourlyStats[hour];
                                        return [
                                            `Profit: $${stats.profit.toFixed(2)}`,
                                            `Trades: ${stats.trades}`,
                                            `Wins: ${stats.wins} | Losses: ${stats.losses}`
                                        ];
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: '#a0aec0' }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#a0aec0', maxRotation: 45, minRotation: 45 }
                            }
                        }
                    }
                });
            }
        }
    }, 100);
}

/**
 * Close strategy modal
 */
function closeStrategyModal() {
    const modal = document.getElementById('strategy-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('strategy-modal');
    if (event.target === modal) {
        closeStrategyModal();
    }
}

// Explicitly expose functions to global scope for inline onclick handlers
window.viewStrategyDetails = viewStrategyDetails;
window.closeStrategyModal = closeStrategyModal;
