/**
 * License Check Module
 * Verifies license on app load and redirects if invalid
 */

(function () {
    'use strict';

    // Wait for DOM to be ready, then check license
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkLicense);
    } else {
        checkLicense();
    }

    /**
     * Main license check function
     */
    function checkLicense() {
        const licenseData = localStorage.getItem('fxmath_license');

        // No license found
        if (!licenseData) {
            redirectToLogin();
            return;
        }

        try {
            const license = JSON.parse(licenseData);

            // Validate license structure
            if (!license.key || !license.type || !license.status) {
                console.warn('Invalid license data structure');
                redirectToLogin();
                return;
            }

            // Check if license is active
            if (license.status !== 'active') {
                console.warn('License is not active');
                redirectToLogin();
                return;
            }

            // Check expiry for limited licenses
            if (license.type === 'limited') {
                if (!license.expiry_date) {
                    console.warn('Limited license missing expiry date');
                    redirectToLogin();
                    return;
                }

                const expiryDate = new Date(license.expiry_date);
                const now = new Date();

                if (now > expiryDate) {
                    console.warn('License has expired');
                    localStorage.removeItem('fxmath_license');
                    alert('Your license has expired. Please renew your license to continue using FxMathQuant.');
                    redirectToLogin();
                    return;
                }

                // Calculate days remaining
                const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                // Warn if license is expiring soon (7 days or less)
                if (daysRemaining <= 7 && daysRemaining > 0) {
                    console.warn(`License expiring in ${daysRemaining} days`);
                    showExpiryWarning(daysRemaining);
                }
            }

            // License is valid
            console.log('License validated successfully');
            displayLicenseInfo(license);

        } catch (error) {
            console.error('License check error:', error);
            redirectToLogin();
        }
    }

    /**
     * Redirect to login page
     */
    function redirectToLogin() {
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    /**
     * Show expiry warning
     */
    function showExpiryWarning(daysRemaining) {
        // Create warning banner if it doesn't exist
        let banner = document.getElementById('license-expiry-warning');

        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'license-expiry-warning';
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 12px 20px;
                text-align: center;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;

            banner.innerHTML = `
                ⚠️ Your license will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. 
                Please renew to continue using FxMathQuant.
                <button onclick="this.parentElement.remove()" style="
                    background: rgba(255,255,255,0.3);
                    border: none;
                    color: white;
                    padding: 4px 12px;
                    margin-left: 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: 600;
                ">Dismiss</button>
            `;

            document.body.insertBefore(banner, document.body.firstChild);

            // Adjust body padding to account for banner
            document.body.style.paddingTop = '50px';
        }
    }

    /**
     * Display license info in header
     */
    function displayLicenseInfo(license) {
        console.log('%c License Information ', 'background: #667eea; color: white; font-weight: bold; padding: 5px 10px;');
        console.log('Type:', license.type);
        console.log('Status:', license.status);

        const licenseInfoDiv = document.getElementById('license-info');

        if (licenseInfoDiv) {
            let infoHTML = '';

            if (license.type === 'lifetime') {
                infoHTML = '🔓 <strong>Lifetime License</strong> | Valid Forever';
                console.log('Expiry:', 'Never (Lifetime)');
            } else if (license.type === 'limited') {
                const expiryDate = new Date(license.expiry_date);
                const now = new Date();
                const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                const expiryStr = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                if (daysRemaining <= 7) {
                    infoHTML = `⚠️ <strong>Time-Limited License</strong> | Expires: ${expiryStr} (<span style="color: #ffeb3b;">${daysRemaining} days left</span>)`;
                } else {
                    infoHTML = `🔓 <strong>Time-Limited License</strong> | Expires: ${expiryStr} (${daysRemaining} days left)`;
                }

                console.log('Expiry Date:', license.expiry_date);
                console.log('Days Remaining:', daysRemaining);
            }

            licenseInfoDiv.innerHTML = infoHTML;
        }
    }

    /**
     * Expose logout function globally
     */
    window.logoutLicense = function () {
        if (confirm('Are you sure you want to logout? You will need to enter your license key again.')) {
            localStorage.removeItem('fxmath_license');
            window.location.href = 'login.html';
        }
    };

})();
