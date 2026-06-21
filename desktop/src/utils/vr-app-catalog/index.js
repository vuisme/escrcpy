import defaultApps from '$electron/resources/build/apps.json'

export const VR_APP_CATALOG_STORE_KEY = 'vrApps.catalog'

export const COMFORT_OPTIONS = ['Thoải mái', 'Bình thường', 'Chóng mặt']

export function normalizeVrApp(app = {}) {
  const packageName = String(app.packageName || app.value || '').trim()
  const name = String(app.name || app.label || packageName).trim()

  return {
    packageName,
    runName: String(app.runName || app.activity || '').trim(),
    icon: String(app.icon || '').trim(),
    name,
    description: String(app.description || '').trim(),
    video: String(app.video || '').trim(),
    comfort: COMFORT_OPTIONS.includes(app.comfort) ? app.comfort : COMFORT_OPTIONS[0],
  }
}

export function dedupeVrApps(apps = []) {
  const seen = new Set()

  return apps
    .map(normalizeVrApp)
    .filter((app) => {
      if (!app.packageName || seen.has(app.packageName)) {
        return false
      }

      seen.add(app.packageName)
      return true
    })
}

export function getDefaultVrApps() {
  return dedupeVrApps(defaultApps)
}

export function getStoredVrApps() {
  const storedApps = window.$preload.store.get(VR_APP_CATALOG_STORE_KEY)

  if (Array.isArray(storedApps) && storedApps.length > 0) {
    return dedupeVrApps(storedApps)
  }

  return getDefaultVrApps()
}

export function setStoredVrApps(apps = []) {
  const value = dedupeVrApps(apps)
  window.$preload.store.set(VR_APP_CATALOG_STORE_KEY, value)
  return value
}

export function resetStoredVrApps() {
  window.$preload.store.delete(VR_APP_CATALOG_STORE_KEY)
  return getDefaultVrApps()
}

export function parseResolveActivity(rawText = '') {
  return rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line.includes('/')) || ''
}
