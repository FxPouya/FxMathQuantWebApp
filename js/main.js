/**
 * Main Application Controller
 */

// Global state
let appData = {
    csvData: null,
    dataName: '',
    symbol: '',
    optimizer: null,
    foundStrategies: [],
    selectedStrategies: new Set(),
    isGenerating: false
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    showSection('upload-section');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Upload zone
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');

    uploadZone.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');

        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // Navigation buttons
    document.getElementById('continue-btn').addEventListener('click', () => {
        showSection('config-section');
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        showSection('upload-section');
    });

    document.getElementById('start-btn').addEventListener('click', startGeneration);
    document.getElementById('stop-btn').addEventListener('click', stopGeneration);
    document.getElementById('new-search-btn').addEventListener('click', () => {
        showSection('upload-section');
        appData.foundStrategies = [];
    });

    document.getElementById('download-all-btn').addEventListener('click', downloadAllStrategies);

    // Comparison button
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
            if (appData.selectedStrategies.size < 2) {
                alert('Please select at least 2 strategies to compare.');
                return;
            }
            showComparison();
        });
    }
}

/**
 * Handle CSV file upload
 */
function handleFileUpload(file) {
    console.log('📁 File upload started:', file.name, 'Size:', file.size);
    if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
    }

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            console.log('📊 CSV parsed:', results.data.length, 'rows');
            if (results.data.length === 0) {
                alert('CSV file is empty');
                return;
            }

            // Validate CSV structure (accept both lowercase and capitalized column names)
            const firstRow = results.data[0];
            const requiredFields = ['open', 'high', 'low', 'close'];
            const hasRequiredFields = requiredFields.every(field => {
                // Check lowercase, capitalized, and uppercase versions
                return field in firstRow ||
                    field.charAt(0).toUpperCase() + field.slice(1) in firstRow ||
                    field.toUpperCase() in firstRow;
            });

            if (!hasRequiredFields) {
                alert('CSV must contain: time, open, high, low, close columns');
                return;
            }

            // Normalize column names to lowercase
            appData.csvData = results.data.map(row => ({
                time: row.time || row.Time || row.TIME,
                open: parseFloat(row.open || row.Open || row.OPEN),
                high: parseFloat(row.high || row.High || row.HIGH),
                low: parseFloat(row.low || row.Low || row.LOW),
                close: parseFloat(row.close || row.Close || row.CLOSE)
            }));

            appData.dataName = file.name;

            // Extract symbol from filename
            appData.symbol = typeof extractSymbolFromFilename === 'function'
                ? extractSymbolFromFilename(file.name)
                : '';

            console.log('✅ Data loaded successfully:', appData.csvData.length, 'bars');
            console.log('📊 Detected symbol:', appData.symbol || 'Unknown');

            // Apply data size limit
            applyDataSizeLimit();

            displayDataPreview();
        },
        error: (error) => {
            alert('Error parsing CSV: ' + error.message);
        }
    });
}

/**
 * Display data preview
 */
function displayDataPreview() {
    const preview = document.getElementById('data-preview');
    preview.classList.remove('hidden');

    // Update data info
    document.getElementById('data-symbol').textContent = `File: ${appData.dataName}`;
    document.getElementById('data-bars').textContent = `Bars: ${appData.csvData.length}`;

    // Detect timeframe (simple heuristic)
    const timeframe = detectTimeframe();
    document.getElementById('data-timeframe').textContent = `Timeframe: ${timeframe}`;

    // Show first 10 rows
    const tbody = document.getElementById('preview-body');
    tbody.innerHTML = '';

    const previewRows = appData.csvData.slice(0, 10);
    previewRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.time || '-'}</td>
            <td>${row.open.toFixed(5)}</td>
            <td>${row.high.toFixed(5)}</td>
            <td>${row.low.toFixed(5)}</td>
            <td>${row.close.toFixed(5)}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Apply data size limit
 */
function applyDataSizeLimit() {
    const limitSelect = document.getElementById('data-size-limit');
    const customInput = document.getElementById('custom-bars-input');

    let limit;
    if (limitSelect.value === 'custom') {
        limit = parseInt(customInput.value) || 0;
    } else {
        limit = parseInt(limitSelect.value);
    }

    if (limit > 0 && appData.csvData.length > limit) {
        console.log(`✂️ Limiting data from ${appData.csvData.length} to ${limit} bars`);
        appData.csvData = appData.csvData.slice(-limit); // Take last N bars
    }
}

/**
 * Toggle custom bars input visibility
 */
function toggleCustomBarsInput() {
    const limitSelect = document.getElementById('data-size-limit');
    const customInput = document.getElementById('custom-bars-input');

    if (limitSelect.value === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
    }
}

/**
 * Detect timeframe from data
 */
function detectTimeframe() {
    if (appData.csvData.length < 2) return 'Unknown';

    // Try to parse time difference
    const time1 = new Date(appData.csvData[0].time);
    const time2 = new Date(appData.csvData[1].time);

    if (isNaN(time1) || isNaN(time2)) return 'Unknown';

    const diffMinutes = Math.abs(time2 - time1) / (1000 * 60);

    if (diffMinutes <= 1) return 'M1';
    if (diffMinutes <= 5) return 'M5';
    if (diffMinutes <= 15) return 'M15';
    if (diffMinutes <= 30) return 'M30';
    if (diffMinutes <= 60) return 'H1';
    if (diffMinutes <= 240) return 'H4';
    if (diffMinutes <= 1440) return 'D1';

    return 'Unknown';
}

/**
 * Start strategy generation
 */
async function startGeneration() {
    console.log('🚀 Starting strategy generation...');
    if (!appData.csvData) {
        console.error('❌ No data loaded!');
        alert('Please upload data first');
        return;
    }

    // Get configuration
    console.log('⚙️ Reading configuration...');
    const config = {
        populationSize: parseInt(document.getElementById('population').value),
        generations: parseInt(document.getElementById('generations').value),
        strategiesCount: parseInt(document.getElementById('strategies-count').value),
        rulesRange: [
            parseInt(document.getElementById('rules-min').value),
            parseInt(document.getElementById('rules-max').value)
        ],
        shiftRange: [
            parseInt(document.getElementById('shift-min').value),
            parseInt(document.getElementById('shift-max').value)
        ],
        minPF: parseFloat(document.getElementById('min-pf').value),
        minWR: parseFloat(document.getElementById('min-wr').value),
        maxDD: parseFloat(document.getElementById('max-dd').value),
        minTrades: parseInt(document.getElementById('min-trades').value)
    };

    // Show progress section
    showSection('progress-section');
    appData.isGenerating = true;
    appData.foundStrategies = [];

    // Reset buttons visibility
    const stopBtn = document.getElementById('stop-btn');
    if (stopBtn) stopBtn.classList.remove('hidden');

    const viewResultsBtn = document.getElementById('view-results-btn');
    if (viewResultsBtn) viewResultsBtn.classList.add('hidden');

    // Clear progress log
    document.getElementById('progress-log').innerHTML = '';

    // Create optimizer
    console.log('🧬 Creating GA optimizer with config:', config);
    console.log('📊 Using symbol:', appData.symbol || 'Unknown');
    appData.optimizer = new GeneticOptimizer(appData.csvData, config, appData.symbol);

    // Start time
    const startTime = Date.now();

    // Run optimization
    console.log('▶️ Starting GA run...');
    const strategies = await appData.optimizer.run((progress) => {
        updateProgress(progress, startTime);
    });

    // Handle completion
    console.log('✅ GA complete! Found', strategies.length, 'strategies');
    appData.foundStrategies = strategies;
    appData.isGenerating = false;

    // Stay on page as requested, show redirection button
    showGenerationCompleteUI();
}

/**
 * Update progress display
 */
function updateProgress(progress, startTime) {
    // Update stats
    if (progress.generation !== undefined) {
        document.getElementById('current-gen').textContent =
            `${progress.generation} / ${progress.totalGenerations}`;
        document.getElementById('best-fitness').textContent =
            progress.bestFitness.toFixed(2);
        document.getElementById('found-count').textContent =
            `${progress.foundCount} / ${progress.targetCount}`;

        // Update progress bar
        const progressPercent = (progress.generation / progress.totalGenerations) * 100;
        document.getElementById('progress-bar').style.width = progressPercent + '%';
    }

    // Update elapsed time
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('elapsed-time').textContent = formatTime(elapsed);

    // Log strategy found
    if (progress.strategyFound) {
        // Don't add to appData.foundStrategies here - we'll get them from GA at the end
        // This prevents duplicate storage and ensures metrics are preserved

        const log = document.getElementById('progress-log');
        const m = progress.strategyFound.metrics;
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.style.display = 'flex';
        logEntry.style.justifyContent = 'space-between';
        logEntry.style.alignItems = 'center';
        logEntry.style.padding = '5px 0';
        logEntry.style.color = '#48bb78';

        const text = document.createElement('span');
        text.textContent = `✓ Strategy ${progress.foundCount}: PF=${m.profitFactor.toFixed(2)}, WR=${m.winRate.toFixed(1)}%, Trades=${m.totalTrades}`;

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-small';
        viewBtn.textContent = 'View Details';
        viewBtn.onclick = () => {
            const index = progress.foundCount - 1;
            viewStrategyDetails(index);
        };

        logEntry.appendChild(text);
        logEntry.appendChild(viewBtn);
        log.appendChild(logEntry);
        log.scrollTop = log.scrollHeight;
    }
}

/**
 * Stop generation
 */
function stopGeneration() {
    if (appData.optimizer) {
        appData.optimizer.stop();
        appData.isGenerating = false;

        // Update collection with whatever was found so far
        if (appData.optimizer.foundStrategies) {
            appData.foundStrategies = appData.optimizer.foundStrategies;
        }
    }

    if (appData.foundStrategies.length > 0) {
        showGenerationCompleteUI();
    } else {
        alert('No strategies found yet');
        showSection('config-section');
    }
}

/**
 * Show UI when generation is complete/stopped
 */
function showGenerationCompleteUI() {
    const stopBtn = document.getElementById('stop-btn');
    if (stopBtn) stopBtn.classList.add('hidden');

    let viewResultsBtn = document.getElementById('view-results-btn');
    if (!viewResultsBtn) {
        viewResultsBtn = document.createElement('button');
        viewResultsBtn.id = 'view-results-btn';
        viewResultsBtn.className = 'btn-success';
        viewResultsBtn.textContent = 'View All Results →';
        viewResultsBtn.style.marginLeft = '10px';
        viewResultsBtn.onclick = displayResults;
        if (stopBtn && stopBtn.parentNode) {
            stopBtn.parentNode.appendChild(viewResultsBtn);
        }
    } else {
        viewResultsBtn.classList.remove('hidden');
    }
}

/**
 * Display results
 */
function displayResults() {
    console.log('📊 Displaying results...', appData.foundStrategies.length, 'strategies');
    showSection('results-section');

    const grid = document.getElementById('strategies-grid');
    grid.innerHTML = '';

    if (appData.foundStrategies.length === 0) {
        console.warn('⚠️ No strategies to display!');
        grid.innerHTML = '<p style="color: #a0aec0; text-align: center; padding: 40px;">No strategies found. Try adjusting your criteria.</p>';
        return;
    }

    appData.foundStrategies.forEach((strategy, index) => {
        console.log(`Creating card for strategy ${index + 1}:`, strategy.metrics);
        const card = createStrategyCard(strategy, index + 1);
        grid.appendChild(card);
    });

    // Reset selection on display
    appData.selectedStrategies.clear();
    updateCompareButton();

    console.log('✅ Strategy cards created:', grid.children.length);
}

/**
 * Create strategy card
 */
function createStrategyCard(strategy, number) {
    console.log('Creating card for strategy number:', number, 'Strategy:', strategy);

    if (!strategy || !strategy.metrics) {
        console.error('Invalid strategy object:', strategy);
        const errorCard = document.createElement('div');
        errorCard.className = 'strategy-card';
        errorCard.innerHTML = '<p style="color: red;">Error: Invalid strategy data</p>';
        return errorCard;
    }

    const m = strategy.metrics;
    const card = document.createElement('div');
    card.className = 'strategy-card';

    card.innerHTML = `
        <div class="strategy-header">
            <div class="strategy-name">${name}</div>
            <input type="checkbox" class="strategy-select" onchange="toggleStrategySelection(${number - 1}, this.checked)">
        </div>
        <div class="strategy-metrics">
            <div class="metric">
                <span class="metric-label">Profit Factor</span>
                <span class="metric-value ${m.profitFactor >= 1.5 ? 'positive' : 'negative'}">
                    ${m.profitFactor.toFixed(2)}
                </span>
            </div>
            <div class="metric">
                <span class="metric-label">Win Rate</span>
                <span class="metric-value">${m.winRate.toFixed(1)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Trades</span>
                <span class="metric-value">${m.totalTrades}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Max DD</span>
                <span class="metric-value negative">${m.maxDrawdown.toFixed(2)}%</span>
            </div>
        </div>
        <div class="strategy-actions">
            <button class="btn-secondary" onclick="viewStrategyDetails(${number - 1})">View Details</button>
            <button class="btn-primary" onclick="downloadStrategy(${number - 1}, 'mq4')">MQ4</button>
            <button class="btn-primary" onclick="downloadStrategy(${number - 1}, 'mq5')">MQ5</button>
            <button class="btn-success" onclick="downloadStrategy(${number - 1}, 'report')">Report</button>
        </div>
    `;

    console.log('Card HTML created successfully');
    return card;
}

/**
 * Download single strategy
 */
function downloadStrategy(index, type) {
    console.log(`💾 Downloading strategy ${index} type ${type}...`);
    const strategy = appData.foundStrategies[index];
    if (!strategy) {
        console.error(`❌ Strategy at index ${index} not found!`);
        return;
    }

    const m = strategy.metrics;
    const name = `FxMath_${String(index + 1).padStart(3, '0')}_PF${m.profitFactor.toFixed(2).replace('.', '_')}_WR${Math.round(m.winRate)}`;

    let content, filename;

    try {
        // Convert strategy to EA-Convertor format
        const strategyData = {
            parameters: {
                symbol: 'EURUSD',
                atr_period: strategy.atrPeriod,
                sl_multiplier: strategy.slMultiplier,
                tp_multiplier: strategy.tpMultiplier,
                close_at_opposite: strategy.closeAtOpposite || true
            },
            buy_rules: strategy.rules,
            sell_rules: strategy.rules // SELL rules are inverted in the converters
        };

        if (type === 'mq4') {
            const converter = new MQ4Converter(strategyData);
            content = converter.generate();
            filename = name + '.mq4';
        } else if (type === 'mq5') {
            const converter = new MQ5Converter(strategyData);
            content = converter.generate();
            filename = name + '.mq5';
        } else if (type === 'ctrader') {
            const converter = new CTraderConverter(strategyData);
            content = converter.generate();
            filename = name + '.cs';
        } else if (type === 'pine') {
            const converter = new PineConverter(strategyData);
            content = converter.generate();
            filename = name + '.pine';
        } else if (type === 'report') {
            // Use new HTML report generator with symbol
            content = generateHTMLReport(strategy, index, appData.symbol);
            filename = name + '_report.html';
        } else if (type === 'json') {
            content = JSON.stringify(strategy.toJSON(), null, 2);
            filename = name + '.json';
        }

        console.log(`✅ Content generated for ${filename}, size: ${content.length}`);
        downloadFile(content, filename);
    } catch (error) {
        console.error(`❌ Error generating ${type} for strategy ${index}:`, error);
    }
}

/**
 * Download all strategies
 */
function downloadAllStrategies() {
    console.log('📥 Download All Strategies started...', appData.foundStrategies.length, 'strategies');

    if (appData.foundStrategies.length === 0) {
        alert('No strategies to download');
        return;
    }

    const btn = document.getElementById('download-all-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Preparing Downloads...';

    const total = appData.foundStrategies.length;
    let completed = 0;

    appData.foundStrategies.forEach((strategy, index) => {
        setTimeout(() => {
            console.log(`⏱️ Triggering downloads for strategy ${index + 1}/${total}...`);
            btn.textContent = `Downloading ${index + 1}/${total}...`;

            downloadStrategy(index, 'mq4');
            setTimeout(() => downloadStrategy(index, 'mq5'), 150);
            setTimeout(() => downloadStrategy(index, 'report'), 300);
            setTimeout(() => downloadStrategy(index, 'json'), 450);

            completed++;
            if (completed === total) {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                    console.log('✅ All downloads triggered!');
                }, 1000);
            }
        }, index * 1200); // 1.2s per strategy to be safe
    });
}

/**
 * Download file helper
 */
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Delay removal and revocation to ensure browser captures the click
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 500);
}

/**
 * Show specific section
 */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

/**
 * Toggle strategy selection for comparison
 */
function toggleStrategySelection(index, isSelected) {
    if (isSelected) {
        appData.selectedStrategies.add(index);
    } else {
        appData.selectedStrategies.delete(index);
    }
    updateCompareButton();
}

/**
 * Update comparison button text
 */
function updateCompareButton() {
    const btn = document.getElementById('compare-btn');
    if (btn) {
        const count = appData.selectedStrategies.size;
        btn.textContent = `Compare Selected (${count})`;
    }
}

/**
 * Show comparison section
 */
function showComparison() {
    const container = document.getElementById('comparison-container');
    container.innerHTML = '';

    appData.selectedStrategies.forEach(index => {
        const strategy = appData.foundStrategies[index];
        const m = strategy.metrics;
        const name = `Strategy ${index + 1}`;

        const item = document.createElement('div');
        item.className = 'comparison-item';
        item.innerHTML = `
            <h3>${name}</h3>
            <div class="strategy-metrics">
                <div class="metric">
                    <span class="metric-label">PF</span>
                    <span class="metric-value ${m.profitFactor >= 1.5 ? 'positive' : 'negative'}">${m.profitFactor.toFixed(2)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Win Rate</span>
                    <span class="metric-value">${m.winRate.toFixed(1)}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Trades</span>
                    <span class="metric-value">${m.totalTrades}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Max DD</span>
                    <span class="metric-value negative">${m.maxDrawdown.toFixed(2)}%</span>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <canvas id="comp-chart-${index}" style="height: 150px;"></canvas>
            </div>
            <div class="strategy-actions" style="margin-top: 15px;">
                <button class="btn-small" onclick="viewStrategyDetails(${index})">Full Details</button>
            </div>
        `;
        container.appendChild(item);

        // Draw small chart
        setTimeout(() => {
            const ctx = document.getElementById(`comp-chart-${index}`).getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: m.equity.map((_, i) => i),
                    datasets: [{
                        data: m.equity,
                        borderColor: '#667eea',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { display: false } }
                }
            });
        }, 100);
    });

    showSection('results-section'); // Ensure we are in results
    document.getElementById('comparison-section').classList.remove('hidden');
    document.getElementById('comparison-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Hide comparison section
 */
function hideComparison() {
    document.getElementById('comparison-section').classList.add('hidden');
}

/**
 * Format time in seconds to readable format
 */
function formatTime(seconds) {
    if (seconds < 60) return seconds + 's';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

// Explicitly expose functions to global scope for inline onclick handlers
window.downloadStrategy = downloadStrategy;
window.downloadAllStrategies = downloadAllStrategies;
window.toggleStrategySelection = toggleStrategySelection;
window.showComparison = showComparison;
window.hideComparison = hideComparison;
window.toggleCustomBarsInput = toggleCustomBarsInput;
