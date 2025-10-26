/**
 * Version Check Utility
 * Periodically checks if a new version of the app is available
 * and prompts user to reload
 */

// The version embedded at build time via Vite define
const runningVersion = (typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__) || null;
let currentVersion = runningVersion;
let checkInterval = null;

/**
 * Fetch the current version from the server
 */
async function fetchVersion() {
  try {
    // Add timestamp to prevent caching
    const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      return data.version;
    }
  } catch (error) {
    // Silent error handling
  }
  return null;
}

/**
 * Check if a new version is available
 */
async function checkForNewVersion() {
  const latestVersion = await fetchVersion();
  if (latestVersion && runningVersion && latestVersion !== runningVersion) {
    return { hasNew: true, latestVersion };
  }
  return { hasNew: false, latestVersion };
}

/**
 * Show notification to user about new version
 */
function notifyNewVersion(latestVersion) {
  if (window.confirm('A new version is available! Click OK to refresh and get the latest updates.')) {
    const url = `${window.location.pathname}?v=${encodeURIComponent(latestVersion || Date.now())}`;
    window.location.replace(url);
  }
}

/**
 * Start version checking
 * @param {number} intervalMinutes - Check interval in minutes (default: 5)
 */
export function startVersionCheck(intervalMinutes = 1) {
  // Immediate check on start
  fetchVersion().then(latest => {
    if (latest && runningVersion && latest !== runningVersion) {
      notifyNewVersion(latest);
      return;
    }
    currentVersion = latest || runningVersion;
  });

  // Check periodically
  checkInterval = setInterval(async () => {
    const { hasNew, latestVersion } = await checkForNewVersion();
    if (hasNew) {
      notifyNewVersion(latestVersion);
      stopVersionCheck();
    }
  }, Math.max(1, intervalMinutes) * 60 * 1000);

  // Also re-check when tab becomes visible
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const { hasNew, latestVersion } = await checkForNewVersion();
      if (hasNew) {
        notifyNewVersion(latestVersion);
        stopVersionCheck();
      }
    }
  });
}

/**
 * Stop version checking
 */
export function stopVersionCheck() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

/**
 * Manually check for updates
 */
export async function manualVersionCheck() {
  const hasNewVersion = await checkForNewVersion();
  if (hasNewVersion) {
    notifyNewVersion();
  }
  return hasNewVersion;
}

/**
 * Get current version
 */
export function getCurrentVersion() {
  return currentVersion;
}
