# FxMathQuant-Web Deployment Checklist

## ✅ Pre-Deployment Checklist

### Files Ready for GitHub Pages

- [x] DataProvider EAs copied to `downloads/` folder
  - `FxMathQuant_DataExporter_MT4.ex4`
  - `FxMathQuant_DataExporter_MT5.ex5`
  - `README.md` (DataProvider guide)

- [x] User Manual created
  - `USER_MANUAL.md` - Comprehensive guide

- [x] Contact Information Updated
  - Email: fxmathsolution@gmail.com
  - Telegram: https://t.me/FxMath

- [x] Logout Button Added
  - Located in header (top-right)
  - Icon: 🚪
  - Function: `logoutLicense()`

- [x] Session Management
  - **Duration**: Persists until manual logout or browser data clear
  - **No auto-logout**: Session remains active
  - **Stored in**: localStorage

- [x] CSV Upload Fix
  - Accepts capitalized column names (Time, Open, High, Low, Close)
  - Compatible with MT4/MT5 DataProvider EA exports

- [x] Cache Busting
  - `main.js?v=2.0` - Forces browser to load updated file

## 📋 Deployment Steps

### 1. Create GitHub Repository

```bash
# On GitHub.com
1. Click "New Repository"
2. Name: FxMathQuant-Web
3. Visibility: Public
4. Add README: Yes
5. Click "Create repository"
```

### 2. Enable GitHub Pages

```bash
# In repository settings
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Click "Save"
```

### 3. Upload Files

**Option A: Web Interface**
```bash
1. Click "Add file" → "Upload files"
2. Drag entire FxMathQuant-Web folder contents
3. Commit message: "Initial deployment"
4. Click "Commit changes"
```

**Option B: Git Command Line**
```bash
cd /home/fxmathai/Desktop/2025-12/FxMathQuant-Web-Version/FxMathQuant-Web

git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/FxMathQuant-Web.git
git push -u origin main
```

### 4. Wait for Deployment

- GitHub Actions will build and deploy (1-2 minutes)
- Check "Actions" tab for progress
- Green checkmark = deployed successfully

### 5. Test Live Site

```
https://YOUR_USERNAME.github.io/FxMathQuant-Web/
```

Test:
1. License activation
2. CSV upload
3. Strategy generation
4. Downloads
5. Logout button

## 🔧 Post-Deployment Configuration

### Update API URL (Already Done)

```javascript
// js/login.js - Line 7
const API_URL = 'https://fxmath.com/quantw/api/validate.php';
```

### Server-Side Setup (Already Complete)

- ✅ Server deployed at: https://fxmath.com/quantw/
- ✅ Admin panel: https://fxmath.com/quantw/admin/
- ✅ API endpoint: https://fxmath.com/quantw/api/validate.php
- ✅ License generation API: https://fxmath.com/quantw/api/create.php

## 📁 File Structure

```
FxMathQuant-Web/
├── index.html (main app)
├── login.html (license activation)
├── USER_MANUAL.md (comprehensive guide)
├── css/
│   └── style.css
├── js/
│   ├── main.js (v2.0 - cache busted)
│   ├── login.js (API URL updated)
│   ├── license-check.js
│   ├── backtester.js
│   ├── ga-engine.js
│   ├── strategy.js
│   ├── strategy-details.js
│   ├── html-report-generator.js
│   ├── ui-controller.js
│   ├── rule-parser.js
│   ├── mq4-converter.js
│   ├── mq5-converter.js
│   ├── ctrader-converter.js
│   └── pine-converter.js
├── downloads/
│   ├── FxMathQuant_DataExporter_MT4.ex4
│   ├── FxMathQuant_DataExporter_MT5.ex5
│   └── README.md
├── data/
│   └── (sample CSV files)
└── assets/
    └── (images, icons)
```

## 🎯 Features Summary

### License System
- ✅ License activation required
- ✅ Lifetime and time-limited licenses supported
- ✅ Session persists until logout
- ✅ Logout button in header
- ✅ API validation against production server

### Data Import
- ✅ CSV upload (drag-and-drop or browse)
- ✅ Accepts MT4/MT5 DataProvider EA format
- ✅ Capitalized column names supported
- ✅ 10,000+ bars recommended

### Strategy Generation
- ✅ Genetic algorithm optimization
- ✅ Configurable parameters
- ✅ Real-time progress tracking
- ✅ Multiple strategies per run

### Results & Downloads
- ✅ Strategy details modal
- ✅ BUY/SELL rules display
- ✅ Equity curve chart
- ✅ Hourly performance analysis
- ✅ Trade statement
- ✅ Download formats: MQ4, MQ5, cTrader, Pine Script, HTML, JSON

### User Support
- ✅ Comprehensive user manual
- ✅ DataProvider EA guide
- ✅ Contact: fxmathsolution@gmail.com
- ✅ Telegram: https://t.me/FxMath

## 🔒 Security

- ✅ License validation via API
- ✅ HTTPS required for production
- ✅ CORS enabled for GitHub Pages
- ✅ No sensitive data stored client-side
- ✅ Session in localStorage (can be cleared)

## 📊 Session Management

### How It Works
1. User activates license on `login.html`
2. License validated against API
3. License info stored in `localStorage`
4. `license-check.js` validates on every page load
5. Session persists until:
   - User clicks logout button
   - User clears browser data
   - License expires (for time-limited)

### Logout Process
1. User clicks 🚪 button in header
2. Confirmation dialog appears
3. `localStorage` cleared
4. Redirected to `login.html`

## 🎉 Ready for Deployment!

All files are prepared and ready to upload to GitHub Pages.

**Next Action**: Upload to GitHub and test!
