# Cache Busting Setup

This document explains the cache busting strategy implemented to ensure users always get the latest version of the application after deployment.

## What's Been Implemented

### 1. **HTML Cache Control Headers**
Added meta tags to `index.html` to prevent browsers from caching the main HTML file:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### 2. **Vite Build Configuration**
Enhanced `vite.config.js` to ensure unique hashes on every build:
- All assets get unique hash-based filenames
- Changed files get new hashes automatically
- Example: `index-BQ3vIKi2.css` → `index-NEW_HASH.css`

### 3. **Versioned Build Script**
Created `build-with-version.js` that:
- Generates a timestamp-based version number
- Creates a `version.json` file in the dist folder
- Tracks build date and version

**Usage:**
```bash
npm run build:versioned
```

### 4. **Automatic Version Checking**
Implemented `src/utils/versionCheck.js` that:
- Checks for new versions every 5 minutes (in production)
- Prompts users to refresh when a new version is available
- Automatically integrated in `src/main.js`

### 5. **Server Configuration Files**

#### For Apache (`.htaccess`)
- Prevents HTML caching
- Enables long-term caching for static assets (1 year)
- Vue Router fallback support

#### For Nginx (`nginx.conf.example`)
- Same caching strategy
- Copy and adapt for your server

## How to Use

### Standard Build
```bash
npm run build
```
This will:
- Generate hashed filenames for all assets
- Output to `dist/` folder

### Versioned Build (Recommended)
```bash
npm run build:versioned
```
This will:
- Do everything the standard build does
- Create a `version.json` file with timestamp
- Enable automatic update notifications

## Deployment Checklist

1. **Build the application:**
   ```bash
   npm run build:versioned
   ```

2. **Copy the appropriate server config:**
   - **Apache**: Copy `.htaccess` to your dist folder (already included)
   - **Nginx**: Use `nginx.conf.example` as a reference

3. **Deploy the `dist/` folder** to your web server

4. **Verify the deployment:**
   - Check that `version.json` is accessible at: `https://yourdomain.com/version.json`
   - Hard refresh your browser (Ctrl+F5 / Cmd+Shift+R)

## Server Configuration

### If Using Laravel to Serve Frontend

If you're serving the frontend through Laravel (e.g., via public folder), you may need to configure Laravel's `public/.htaccess` or add routes to serve the SPA correctly.

### If Using Separate Web Server

Make sure your web server (Apache/Nginx) is configured to:
1. Not cache `index.html`
2. Cache static assets with long expiry
3. Redirect all requests to `index.html` for Vue Router

## Testing Cache Busting

1. Build and deploy version 1:
   ```bash
   npm run build:versioned
   # Deploy to server
   ```

2. Open the app in a browser and note the version in console:
   ```
   Version check initialized. Current version: 1729439542123
   ```

3. Make a small change to your code

4. Build and deploy version 2:
   ```bash
   npm run build:versioned
   # Deploy to server
   ```

5. After 5 minutes (or less), you should see an alert prompting to refresh

## Manual Version Check

You can manually check for updates in the browser console:
```javascript
import { manualVersionCheck } from './utils/versionCheck'
await manualVersionCheck()
```

## Troubleshooting

### Users Still See Old Version

1. **Check server configuration:**
   - Ensure `.htaccess` or nginx config is active
   - Verify cache headers using browser DevTools (Network tab)

2. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Or hard refresh: Ctrl+F5 (Cmd+Shift+R on Mac)

3. **Verify version.json is accessible:**
   ```bash
   curl https://yourdomain.com/version.json
   ```

4. **Check CDN/Proxy cache:**
   - If using Cloudflare or similar, purge the CDN cache
   - Set cache rules to bypass HTML files

### Version Check Not Working

1. Ensure you used `npm run build:versioned`
2. Check that `version.json` exists in your dist folder
3. Check browser console for errors
4. Verify the app is running in production mode

## Additional Options

### Adjust Version Check Interval

Edit `src/main.js`:
```javascript
// Check every 10 minutes instead of 5
startVersionCheck(10)
```

### Disable Version Check

Remove or comment out in `src/main.js`:
```javascript
// startVersionCheck(5)
```

## Best Practices

1. **Always use versioned builds** for production deployments
2. **Test in staging** environment first
3. **Monitor** the version.json endpoint
4. **Document** your deployment process
5. **Keep** a deployment log with version numbers

## How It Works

1. **Build Time**: Vite generates unique hashes based on file content
2. **Deployment**: New files with new hashes are deployed
3. **Browser Request**: Browser requests `index.html` (never cached)
4. **HTML Response**: Contains references to new hashed files
5. **Asset Loading**: Browser loads new JS/CSS (or uses cached if unchanged)
6. **Version Check**: App periodically checks for new `version.json`
7. **Update Prompt**: User is notified when a new version is available

## Support

If you encounter issues, check:
- Browser console for errors
- Network tab for cache headers
- Server logs for configuration issues

