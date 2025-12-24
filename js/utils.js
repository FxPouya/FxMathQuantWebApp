/**
 * Utility Functions for FxMath Quant
 * Helper functions for profit calculations and formatting
 */

/**
 * Get profit multiplier based on symbol type
 * @param {string} symbol - Trading symbol (e.g., "EURUSD", "USDJPY", "XAUUSD")
 * @returns {number} - Multiplier to convert price difference to pips/points
 */
function getProfitMultiplier(symbol) {
    if (!symbol) return 10000; // Default to standard forex

    const upperSymbol = symbol.toUpperCase();

    // Check for JPY pairs (2 decimal places)
    if (upperSymbol.includes('JPY')) {
        return 100;
    }

    // Check for XAU (Gold) - already in dollars
    if (upperSymbol.includes('XAU')) {
        return 1;
    }

    // Default: standard forex pairs (EURUSD, GBPUSD, etc.) - 4 decimal places
    return 10000;
}

/**
 * Format profit value with appropriate multiplier
 * @param {number} profit - Raw profit value (price difference)
 * @param {string} symbol - Trading symbol
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted profit string
 */
function formatProfit(profit, symbol, decimals = 2) {
    const multiplier = getProfitMultiplier(symbol);
    return (profit * multiplier).toFixed(decimals);
}

/**
 * Extract symbol from filename
 * @param {string} filename - CSV filename (e.g., "EURUSD_H1.csv")
 * @returns {string} - Symbol name
 */
function extractSymbolFromFilename(filename) {
    if (!filename) return '';

    // Remove path and extension
    const basename = filename.split('/').pop().split('\\').pop();
    const nameWithoutExt = basename.replace(/\.(csv|txt)$/i, '');

    // Extract symbol (everything before first underscore or period)
    const symbol = nameWithoutExt.split(/[_\.]/)[0];

    return symbol || '';
}

// Export functions
if (typeof window !== 'undefined') {
    window.getProfitMultiplier = getProfitMultiplier;
    window.formatProfit = formatProfit;
    window.extractSymbolFromFilename = extractSymbolFromFilename;
}
