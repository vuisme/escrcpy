import { spawn } from 'node:child_process'
import appStore from '@electron/helpers/store.js'
import {
  adbPath,
  gnirehtetApkPath,
  gnirehtetPath,
} from '@electron/configs/index.js'

const appDebug = appStore.get('common.debug') || false

let adbkit = null

const shell = async (command, { debug = false, stdout, stderr } = {}) => {
  const spawnPath = appStore.get('common.gnirehtetPath') || gnirehtetPath
  const ADB = appStore.get('common.adbPath') || adbPath

  if (!spawnPath) {
    throw new Error(
      'Failed to retrieve Gnirehtet dependency path. If you\'re using macOS, please ensure that the dependency is installed correctly.',
    )
  }

  const GNIREHTET_APK = gnirehtetApkPath

  const args = command.split(' ')

  console.log('gnirehtet.shell.spawnPath', spawnPath)
  console.log('gnirehtet.shell.adbPath', adbPath)

  const gnirehtetProcess = spawn(`"${spawnPath}"`, args, {
    env: { ...process.env, ADB, GNIREHTET_APK },
    shell: true,
    encoding: 'utf8',
  })

  gnirehtetProcess.stdout.on('data', (data) => {
    const stringData = data.toString()

    if (debug) {
      console.log('gnirehtetProcess.stdout.data:', stringData)
    }

    if (stdout) {
      stdout(stringData, gnirehtetProcess)
    }
  })

  gnirehtetProcess.stderr.on('data', (data) => {
    const stringData = data.toString()

    if (debug) {
      console.error('gnirehtetProcess.stderr.data:', stringData)
    }

    if (stderr) {
      stderr(stringData, gnirehtetProcess)
    }
  })

  return new Promise((resolve, reject) => {
    gnirehtetProcess.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
      else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })

    gnirehtetProcess.on('error', (err) => {
      reject(err)
    })
  })
}

const install = deviceId => shell(`install ${deviceId}`)
const start = deviceId => shell(`start ${deviceId}`)
const stop = deviceId => shell(`stop ${deviceId}`)
const tunnel = deviceId => shell(`tunnel ${deviceId}`)

const installed = async (deviceId) => {
  const res = await adbkit.isInstalled(deviceId, 'com.genymobile.gnirehtet')
  console.log('gnirehtet.apk.installed', res)
  return res
}

let relayProcess = null
const stopRelayProcess = () => {
  if (!relayProcess) {
    return
  }

  relayProcess?.kill()
  relayProcess = null
}
const relay = async (args) => {
  if (relayProcess) {
    return relayProcess
  }

  return new Promise((resolve, reject) => {
    shell('relay', {
      ...args,
      debug: appDebug,
      stdout: (_, process) => {
        if (!relayProcess) {
          relayProcess = process
        }
        resolve(process)
      },
      stderr: (error) => {
        stopRelayProcess()
        reject(error)
      },
    })?.catch((error) => {
      stopRelayProcess()
      reject(error)
    })
  })
}

const run = async (deviceId) => {
  await relay().catch((error) => {
    throw new Error(error?.message || 'Gnirehtet Relay fail')
  })

  await install(deviceId).catch((error) => {
    throw new Error(error?.message || 'Gnirehtet Install Client fail')
  })

  await start(deviceId).catch((error) => {
    throw new Error(error?.message || 'Gnirehtet Start fail')
  })
}

window.addEventListener('beforeunload', () => {
  stop()

  stopRelayProcess()
})

export default (options = {}) => {
  adbkit = options.adbkit

  return {
    shell,
    relay,
    install,
    installed,
    start,
    stop,
    tunnel,
    run,
  }
}
