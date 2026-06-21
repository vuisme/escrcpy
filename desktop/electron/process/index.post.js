import { app } from 'electron'
import { compare } from 'compare-versions'
import electronStore from '$electron/helpers/store/index.js'
import { setupEnvPath } from './helper.js'

const currentVersion = app.getVersion()
const storedVersion = electronStore.get('version') || '0.0.0'

if (compare(currentVersion, storedVersion, '!=')) {
  electronStore.delete('common.scrcpyPath')
  electronStore.delete('common.adbPath')
  electronStore.delete('common.gnirehtetPath')
  electronStore.set('version', currentVersion)
}

setupEnvPath()
