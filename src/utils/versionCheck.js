/**
 * Version Check Utility
 * Periodically checks if a new version of the app is available
 * and prompts user to reload
 */

let currentVersion = null;
let checkInterval = null;

/**
 * Fetch the current version from the server
 */
async function fetchVersion() {
  try {
    // Add timestamp to prevent caching
    const response = await fetch(`/version.json?t=${Date.now()}`);
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

  if (latestVersion && currentVersion && latestVersion !== currentVersion) {
    return true;
  }

  if (!currentVersion && latestVersion) {
    currentVersion = latestVersion;
  }

  return false;
}

/**
 * Show notification to user about new version
 */
function notifyNewVersion() {
  if (window.confirm('A new version is available! Click OK to refresh and get the latest updates.')) {
    // Force a hard reload
    window.location.reload(true);
  }
}

/**
 * Start version checking
 * @param {number} intervalMinutes - Check interval in minutes (default: 5)
 */
export function startVersionCheck(intervalMinutes = 5) {
  // Initial version fetch
  fetchVersion().then(version => {
    currentVersion = version;
  });

  // Check periodically
  checkInterval = setInterval(async () => {
    const hasNewVersion = await checkForNewVersion();
    if (hasNewVersion) {
      notifyNewVersion();
      stopVersionCheck();
    }
  }, intervalMinutes * 60 * 1000);
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
