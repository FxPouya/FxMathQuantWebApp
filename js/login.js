/**
 * License Login Handler
 * FxMathQuant-Web
 */

// API endpoint - Production server
const API_URL = 'https://fxmath.com/quantw/api/validate.php';

// DOM elements
const licenseForm = document.getElementById('licenseForm');
const licenseKeyInput = document.getElementById('licenseKey');
const activateBtn = document.getElementById('activateBtn');
const alertBox = document.getElementById('alertBox');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already licensed
    if (isLicenseValid()) {
        window.location.href = 'index.html';
    }

    // Format license key input
    licenseKeyInput.addEventListener('input', formatLicenseKey);

    // Handle form submission
    licenseForm.addEventListener('submit', handleLicenseSubmit);
});

/**
 * Format license key as user types (add dashes)
 */
function formatLicenseKey(e) {
    let value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formatted = '';

    for (let i = 0; i < value.length && i < 32; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += '-';
        }
        formatted += value[i];
    }

    e.target.value = formatted;
}

/**
 * Handle license form submission
 */
async function handleLicenseSubmit(e) {
    e.preventDefault();

    const licenseKey = licenseKeyInput.value.trim();

    // Validate format
    if (!isValidLicenseFormat(licenseKey)) {
        showAlert('Please enter a valid license key format', 'error');
        return;
    }

    // Disable button and show loading
    activateBtn.disabled = true;
    activateBtn.innerHTML = '<span class="spinner"></span>Validating...';

    try {
        // Call validation API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ license_key: licenseKey })
        });

        const data = await response.json();

        if (data.success) {
            // Store license info in localStorage
            const licenseInfo = {
                key: licenseKey,
                type: data.license.type,
                status: data.license.status,
                validated_at: new Date().toISOString()
            };

            if (data.license.type === 'limited') {
                licenseInfo.expiry_date = data.license.expiry_date;
                licenseInfo.days_remaining = data.license.days_remaining;
            }

            localStorage.setItem('fxmath_license', JSON.stringify(licenseInfo));

            // Show success message
            showAlert('License activated successfully! Redirecting...', 'success');

            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } else {
            // Show error message
            showAlert(data.message || 'License validation failed', 'error');
            activateBtn.disabled = false;
            activateBtn.innerHTML = 'Activate License';
        }

    } catch (error) {
        console.error('Validation error:', error);
        showAlert('Connection error. Please check your server configuration.', 'error');
        activateBtn.disabled = false;
        activateBtn.innerHTML = 'Activate License';
    }
}

/**
 * Validate license key format
 */
function isValidLicenseFormat(key) {
    // Should be 32 alphanumeric characters with dashes every 4 characters
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(key);
}

/**
 * Check if license is valid
 */
function isLicenseValid() {
    const licenseData = localStorage.getItem('fxmath_license');

    if (!licenseData) {
        return false;
    }

    try {
        const license = JSON.parse(licenseData);

        // Check if license exists
        if (!license.key || license.status !== 'active') {
            return false;
        }

        // Check expiry for limited licenses
        if (license.type === 'limited') {
            const expiryDate = new Date(license.expiry_date);
            const now = new Date();

            if (now > expiryDate) {
                // License expired
                localStorage.removeItem('fxmath_license');
                return false;
            }
        }

        return true;

    } catch (error) {
        console.error('License validation error:', error);
        return false;
    }
}

/**
 * Show alert message
 */
function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;

    // Auto-hide after 5 seconds for non-success messages
    if (type !== 'success') {
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 5000);
    }
}
