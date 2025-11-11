# Quick Start - Force Browser Cache Reload

## TL;DR - What You Need to Do

### For Regular Builds:
```bash
npm run build
```
✅ This will now automatically generate unique file hashes and copy cache control configs.

### For Versioned Builds (Recommended):
```bash
npm run build:versioned
```
✅ Same as above PLUS automatic update notifications for users.

### Deploy:
1. Copy the entire `dist/` folder to your web server
2. That's it! Browsers will automatically fetch new files.

---

## What Changed?

### ✅ Automatic Cache Busting
- Every build generates unique file names (e.g., `app-abc123.js`)
- When you change code, the hash changes → browsers fetch the new file
- **No manual intervention needed!**

### ✅ Version Tracking (Optional)
- Use `npm run build:versioned` to track deployments
- Creates a `version.json` file with timestamp
- App checks for updates every 5 minutes
- Users get a notification: "New version available, refresh?"

### ✅ Server Configuration
- `.htaccess` file automatically copied to dist folder (for Apache)
- HTML files: never cached
- JS/CSS files: cached for 1 year (safe because of unique hashes)

---

## Testing

1. **Build the app:**
   ```bash
   npm run build:versioned
   ```

2. **Check the output:**
   - Look in `dist/assets/` - all files should have hashes
   - Check `dist/version.json` exists
   - Verify `dist/.htaccess` exists

3. **Test locally:**
   ```bash
   npm run preview
   ```
   Open browser console, you should see:
   ```
   Version check initialized. Current version: [timestamp]
   ```

4. **Deploy and test:**
   - Deploy to your server
   - Open the app, check console for version
   - Make a small code change
   - Build and deploy again
   - Wait 5 minutes or refresh - you should see update prompt

---

## Troubleshooting

### "Users still see old version"
- **Hard refresh:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Check server:** Ensure `.htaccess` is in the deployed folder
- **CDN users:** Purge CDN cache after deployment

### "Version check not working"
- Ensure you used `npm run build:versioned` (not just `npm run build`)
- Check that `version.json` is accessible in your deployed app
- Check browser console for errors

### "Build fails"
- Run `npm install` to ensure all dependencies are installed
- Check Node version (should be 16+)

---

## For More Details

See [CACHE_BUSTING.md](./CACHE_BUSTING.md) for complete documentation.

---

## Need to Disable Version Checking?

Edit `src/main.js` and comment out:
```javascript
// startVersionCheck(5)
```

---

**That's it! Your cache busting is now fully automated.** 🎉

