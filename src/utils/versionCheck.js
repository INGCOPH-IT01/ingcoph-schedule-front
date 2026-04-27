/**
 * Version Check Utility
 * Periodically checks if a new version of the app is available
 * and prompts user to reload via a non-blocking notification.
 *
 * Key design decisions:
 * - Uses SweetAlert2 (already a project dep) instead of window.confirm
 *   so the prompt is non-blocking on mobile and does not interfere with
 *   in-flight actions (e.g. the booking checkout flow).
 * - Never fires a reload prompt while a checkout is in progress.
 * - Deduplicates: only one prompt is shown at a time.
 */

import Swal from 'sweetalert2'

// Version stamped at build time via Vite define
const runningVersion = (typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__) || null
let currentVersion = runningVersion
let checkInterval = null
let isPromptVisible = false

/**
 * A flag that external callers (e.g. BookingCart) can toggle to suppress
 * the reload prompt while a critical action is running.
 */
let isCriticalActionInProgress = false

export function setCriticalActionInProgress(value) {
  isCriticalActionInProgress = !!value
}

/**
 * Fetch the current version from the server.
 * Uses cache: 'no-store' to bypass every layer of HTTP cache,
 * which is particularly important for Chrome on Android.
 */
async function fetchVersion() {
  try {
    const response = await fetch(`/version.json?_=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    if (response.ok) {
      const data = await response.json()
      return data.version ?? null
    }
  } catch {
    // Network errors are expected on mobile — fail silently
  }
  return null
}

async function checkForNewVersion() {
  const latestVersion = await fetchVersion()
  if (latestVersion && runningVersion && latestVersion !== runningVersion) {
    return { hasNew: true, latestVersion }
  }
  return { hasNew: false, latestVersion }
}

/**
 * Show a non-blocking SweetAlert2 toast asking the user to refresh.
 * If a critical action (like checkout) is in progress, defer the prompt
 * until after the action completes by polling every 5 seconds.
 */
function notifyNewVersion(latestVersion) {
  if (isPromptVisible) return

  if (isCriticalActionInProgress) {
    // Retry after the critical action finishes
    const retryTimer = setInterval(() => {
      if (!isCriticalActionInProgress) {
        clearInterval(retryTimer)
        notifyNewVersion(latestVersion)
      }
    }, 5000)
    return
  }

  isPromptVisible = true

  Swal.fire({
    title: 'Update Available',
    text: 'A new version of the app is ready. Refresh now to get the latest updates.',
    icon: 'info',
    confirmButtonText: 'Refresh Now',
    showCancelButton: true,
    cancelButtonText: 'Later',
    allowOutsideClick: false,
    // Prevent the dialog from auto-closing and accidentally interrupting actions
    allowEscapeKey: true,
    confirmButtonColor: '#1976d2'
  }).then((result) => {
    isPromptVisible = false
    if (result.isConfirmed) {
      const url = `${window.location.pathname}?_v=${encodeURIComponent(latestVersion || Date.now())}`
      window.location.replace(url)
    }
  })
}

/**
 * Start version checking.
 * @param {number} intervalMinutes - How often to poll (default 1 minute)
 */
export function startVersionCheck(intervalMinutes = 1) {
  // Immediate check on startup
  fetchVersion().then(latest => {
    if (latest && runningVersion && latest !== runningVersion) {
      notifyNewVersion(latest)
      return
    }
    currentVersion = latest || runningVersion
  })

  // Periodic polling
  checkInterval = setInterval(async () => {
    const { hasNew, latestVersion } = await checkForNewVersion()
    if (hasNew) {
      notifyNewVersion(latestVersion)
      stopVersionCheck()
    }
  }, Math.max(1, intervalMinutes) * 60 * 1000)

  // Re-check when the tab regains visibility (common on mobile after switching apps)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const { hasNew, latestVersion } = await checkForNewVersion()
      if (hasNew) {
        notifyNewVersion(latestVersion)
        stopVersionCheck()
      }
    }
  })
}

export function stopVersionCheck() {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

export async function manualVersionCheck() {
  const result = await checkForNewVersion()
  if (result.hasNew) {
    notifyNewVersion(result.latestVersion)
  }
  return result
}

export function getCurrentVersion() {
  return currentVersion
}
