/**
 * HTML Report Generator
 * Generates comprehensive HTML reports with full trading statement
 */

function generateHTMLReport(strategy, index, symbol = '') {
    const m = strategy.metrics;
    const name = `FxMath_${String(index + 1).padStart(3, '0')}_PF${(m.profitFactor || 0).toFixed(2).replace('.', '_')}_WR${Math.round(m.winRate || 0)}`;

    // Note: Profits are already multiplied in the backtester, so we can display them directly

    // Generate SELL rules (inverted operators)
    const sellRulesHTML = strategy.rules.map((rule, i) => {
        const invertedOp = rule.operator === '>' ? '<=' :
            rule.operator === '<' ? '>=' :
                rule.operator === '>=' ? '<' :
                    rule.operator === '<=' ? '>' : rule.operator;

        let ruleText = '';
        if (rule.type === 'simple') {
            ruleText = `${rule.left.price.toUpperCase()}[${rule.left.shift}] ${invertedOp} ${rule.right.price.toUpperCase()}[${rule.right.shift}]`;
        } else {
            ruleText = `(${rule.left.price1.toUpperCase()}[${rule.left.shift1}] ${rule.left.op} ${rule.left.price2.toUpperCase()}[${rule.left.shift2}]) ${invertedOp} (${rule.right.price.toUpperCase()}[${rule.right.shift}] × ${rule.right.multiplier})`;
        }
        return `<div class="rule-item">${i + 1}. ${ruleText}</div>`;
    }).join('');

    // Generate BUY rules
    const buyRulesHTML = strategy.rules.map((rule, i) => {
        let ruleText = '';
        if (rule.type === 'simple') {
            ruleText = `${rule.left.price.toUpperCase()}[${rule.left.shift}] ${rule.operator} ${rule.right.price.toUpperCase()}[${rule.right.shift}]`;
        } else {
            ruleText = `(${rule.left.price1.toUpperCase()}[${rule.left.shift1}] ${rule.left.op} ${rule.left.price2.toUpperCase()}[${rule.left.shift2}]) ${rule.operator} (${rule.right.price.toUpperCase()}[${rule.right.shift}] × ${rule.right.multiplier})`;
        }
        return `<div class="rule-item">${i + 1}. ${ruleText}</div>`;
    }).join('');

    // Generate trades table
    const tradesHTML = m.trades.map((trade, i) => {
        const profitClass = trade.profit > 0 ? 'profit-positive' : 'profit-negative';
        const typeClass = trade.type === 'BUY' ? 'type-buy' : 'type-sell';
        return `
            <tr>
                <td>${i + 1}</td>
                <td><span class="badge ${typeClass}">${trade.type}</span></td>
                <td>${new Date(trade.openTime).toLocaleString()}</td>
                <td>${new Date(trade.closeTime).toLocaleString()}</td>
                <td>$${trade.entry.toFixed(5)}</td>
                <td>$${trade.exit.toFixed(5)}</td>
                <td class="${profitClass}">$${trade.profit.toFixed(2)}</td>
                <td>${trade.reason.toUpperCase()}</td>
            </tr>
        `;
    }).join('');

    // Generate hourly stats table
    let hourlyStatsHTML = '';
    if (m.hourlyStats) {
        hourlyStatsHTML = m.hourlyStats.map((stats, hour) => {
            if (stats.trades === 0) return '';
            const profitClass = stats.profit > 0 ? 'profit-positive' : 'profit-negative';
            return `
                <tr>
                    <td>${String(hour).padStart(2, '0')}:00</td>
                    <td>${stats.trades}</td>
                    <td>${stats.wins}</td>
                    <td>${stats.losses}</td>
                    <td class="${profitClass}">$${stats.profit.toFixed(2)}</td>
                    <td>${stats.trades > 0 ? ((stats.wins / stats.trades) * 100).toFixed(1) : 0}%</td>
                </tr>
            `;
        }).join('');
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Trading Strategy Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 {
            font-size: 24px;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .metric-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
        }
        .metric-value.positive { color: #48bb78; }
        .metric-value.negative { color: #f56565; }
        .rules-box {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .rules-box h3 {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 15px;
        }
        .rule-item {
            padding: 8px 0;
            font-family: 'Courier New', monospace;
            color: #2d3748;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background: #f7fafc;
            font-weight: 600;
            color: #4a5568;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        tr:hover { background: #f7fafc; }
        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .type-buy {
            background: #c6f6d5;
            color: #22543d;
        }
        .type-sell {
            background: #fed7d7;
            color: #742a2a;
        }
        .profit-positive { color: #48bb78; font-weight: 600; }
        .profit-negative { color: #f56565; font-weight: 600; }
        .best-worst {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            display: flex;
            justify-content: space-around;
            text-align: center;
        }
        .best-worst div {
            flex: 1;
        }
        .best-worst h4 {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
        }
        .best-worst .value {
            font-size: 20px;
            font-weight: bold;
        }
        .chart-container {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            height: 300px;
        }
        .footer {
            background: #f7fafc;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${name}</h1>
            <p>FxMath Quant - Automated Trading Strategy Report</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <!-- Performance Metrics -->
            <div class="section">
                <h2>Performance Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">Profit Factor</div>
                        <div class="metric-value positive">${(m.profitFactor || 0).toFixed(2)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Win Rate</div>
                        <div class="metric-value">${(m.winRate || 0).toFixed(1)}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Total Trades</div>
                        <div class="metric-value">${m.totalTrades || 0}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">BUY Trades</div>
                        <div class="metric-value" style="color: #48bb78;">${m.buyTrades || 0}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">SELL Trades</div>
                        <div class="metric-value" style="color: #f56565;">${m.sellTrades || 0}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Max Drawdown</div>
                        <div class="metric-value negative">${(m.maxDrawdown || 0).toFixed(2)}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Total Profit</div>
                        <div class="metric-value ${m.totalProfit >= 0 ? 'positive' : 'negative'}">$${(m.totalProfit || 0).toFixed(2)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Avg Win</div>
                        <div class="metric-value positive">$${(m.avgWin || 0).toFixed(2)}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Avg Loss</div>
                        <div class="metric-value negative">$${Math.abs(m.avgLoss || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <!-- Equity Curve Chart -->
            <div class="section">
                <h2>Equity Curve</h2>
                <div class="chart-container">
                    <canvas id="equityChart"></canvas>
                </div>
            </div>

            ${m.hourlyStats ? `
            <!-- Hourly Performance Chart -->
            <div class="section">
                <h2>Hourly Performance (24h)</h2>
                <div class="chart-container">
                    <canvas id="hourlyChart"></canvas>
                </div>
            </div>
            ` : ''}

            ${m.bestHour && m.worstHour ? `
            <!-- Best/Worst Hours -->
            <div class="section">
                <h2>Time-Based Performance</h2>
                <div class="best-worst">
                    <div>
                        <h4>Best Trading Hour</h4>
                        <div class="value positive">${String(m.bestHour.hour).padStart(2, '0')}:00</div>
                        <div class="profit-positive">$${m.bestHour.profit.toFixed(2)}</div>
                    </div>
                    <div>
                        <h4>Worst Trading Hour</h4>
                        <div class="value negative">${String(m.worstHour.hour).padStart(2, '0')}:00</div>
                        <div class="profit-negative">$${m.worstHour.profit.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Strategy Rules -->
            <div class="section">
                <h2>Strategy Rules</h2>
                <div class="rules-box">
                    <h3>BUY when ALL of the following conditions are true:</h3>
                    ${buyRulesHTML}
                </div>
                <div class="rules-box">
                    <h3>SELL when ALL of the following conditions are true:</h3>
                    ${sellRulesHTML}
                </div>
                <div class="rules-box">
                    <h3>Parameters</h3>
                    <div class="rule-item">ATR Period: ${strategy.atrPeriod}</div>
                    <div class="rule-item">SL Multiplier: ${strategy.slMultiplier.toFixed(2)}</div>
                    <div class="rule-item">TP Multiplier: ${strategy.tpMultiplier.toFixed(2)}</div>
                </div>
            </div>

            ${hourlyStatsHTML ? `
            <!-- Hourly Performance -->
            <div class="section">
                <h2>Hourly Performance Analysis</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Hour</th>
                            <th>Trades</th>
                            <th>Wins</th>
                            <th>Losses</th>
                            <th>Profit/Loss</th>
                            <th>Win Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hourlyStatsHTML}
                    </tbody>
                </table>
            </div>
            ` : ''}

            <!-- Full Trading Statement -->
            <div class="section">
                <h2>Complete Trading Statement</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Type</th>
                            <th>Open Time</th>
                            <th>Close Time</th>
                            <th>Entry</th>
                            <th>Exit</th>
                            <th>Profit/Loss</th>
                            <th>Exit Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tradesHTML}
                    </tbody>
                </table>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>FxMath Quant - Automated Trading Strategy Generator</p>
            <p>This report is for informational purposes only. Past performance does not guarantee future results.</p>
        </div>
    </div>

    <script>
        // Render Equity Curve Chart
        const equityCtx = document.getElementById('equityChart');
        if (equityCtx) {
            new Chart(equityCtx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(m.equity.map((_, i) => i))},
                    datasets: [{
                        label: 'Account Balance',
                        data: ${JSON.stringify(m.equity)},
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
                            bodyColor: '#a0aec0'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: 'rgba(0, 0, 0, 0.1)' },
                            ticks: { color: '#4a5568' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#4a5568' }
                        }
                    }
                }
            });
        }

        // Render Hourly Performance Chart
        const hourlyCtx = document.getElementById('hourlyChart');
        if (hourlyCtx) {
            const hourlyData = ${JSON.stringify(m.hourlyStats || [])};
            new Chart(hourlyCtx, {
                type: 'bar',
                data: {
                    labels: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00'),
                    datasets: [{
                        label: 'Profit/Loss',
                        data: hourlyData.map(h => h.profit),
                        backgroundColor: hourlyData.map(h => h.profit >= 0 ? 'rgba(72, 187, 120, 0.6)' : 'rgba(245, 101, 101, 0.6)'),
                        borderColor: hourlyData.map(h => h.profit >= 0 ? 'rgba(72, 187, 120, 1)' : 'rgba(245, 101, 101, 1)'),
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
                                label: function(context) {
                                    const hour = context.dataIndex;
                                    const stats = hourlyData[hour];
                                    return [
                                        'Profit: $' + stats.profit.toFixed(2),
                                        'Trades: ' + stats.trades,
                                        'Wins: ' + stats.wins + ' | Losses: ' + stats.losses
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0, 0, 0, 0.1)' },
                            ticks: { color: '#4a5568' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#4a5568', maxRotation: 45, minRotation: 45 }
                        }
                    }
                }
            });
        }
    </script>
</body>
</html>`;

    return html;
}

// Export function
window.generateHTMLReport = generateHTMLReport;
