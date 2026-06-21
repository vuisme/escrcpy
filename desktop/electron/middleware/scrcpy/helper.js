/**
 * Parse scrcpy app list output into structured data
 * @param {string} rawText - Raw text output from scrcpy --list-apps command
 * @returns {Array<{
 *   name: string,
 *   packageName: string,
 *   isSystemApp: boolean
 * }>} Array of parsed app objects
 */
export function parseScrcpyAppList(rawText) {
  if (typeof rawText !== 'string') {
    throw new TypeError('scrcpy content must be a string')
  }

  return rawText
    .split('\n')
    .filter(line => line.startsWith(' * ') || line.startsWith(' - '))
    .map((line) => {
      const isSystemApp = line.startsWith(' * ')
      // Remove prefix and trim
      const content = line.substring(3).trim()
      // Find last space to separate name and package
      const lastSpaceIndex = content.lastIndexOf(' ')

      return {
        name: content.substring(0, lastSpaceIndex).trim(),
        packageName: content.substring(lastSpaceIndex + 1).trim(),
        isSystemApp,
      }
    })
}

/**
 * Parse scrcpy codec output into structured data
 * @param {*} rawText
 * @returns
 */
export function parseScrcpyCodecList(rawText) {
  try {
    const result = {
      video: [],
      audio: [],
    }

    const lines = rawText.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (!trimmedLine || !trimmedLine.startsWith('--')) {
        continue
      }

      const pairs = trimmedLine.match(/--[\w-]+=[\w.-]+/g)
      if (!pairs || pairs.length < 2)
        continue

      const info = pairs.reduce((acc, pair) => {
        const [key, value] = pair.substring(2).split('=')
        acc[key] = value
        return acc
      }, {})

      if (info['video-codec'] && info['video-encoder']) {
        result.video.push({
          type: 'video',
          codec: info['video-codec'],
          encoder: info['video-encoder'],
        })
      }
      else if (info['audio-codec'] && info['audio-encoder']) {
        result.audio.push({
          type: 'audio',
          codec: info['audio-codec'],
          encoder: info['audio-encoder'],
        })
      }
    }

    if (result.video.length === 0 && result.audio.length === 0) {
      throw new Error('No valid codec information found in the log content')
    }

    return result
  }
  catch (error) {
    console.error('Error parsing codec information:', error)
    return {
      video: [],
      audio: [],
      error: error.message,
    }
  }
}

/**
 * Gets a list of available display ids
 * @param {*} text
 * @returns
 */
export function parseDisplayIds(text) {
  if (!text || typeof text !== 'string') {
    return []
  }

  try {
    const displayIdPattern = /--display-id=(\d+)/g

    const matches = Array.from(text.matchAll(displayIdPattern))

    const displayIds = matches.map(match => Number.parseInt(match[1], 10))

    const uniqueDisplayIds = [...new Set(displayIds)].filter(id => !Number.isNaN(id))

    return uniqueDisplayIds.sort((a, b) => a - b)
  }
  catch (error) {
    console.error('Error parsing display IDs:', error)
    return []
  }
}

/**
 * @param {string} output
 * @param {boolean} [dedupe] 是否去重；
 * @returns {array[object]} 摄像头信息列表
 */
export function parseScrcpyCameras(output, options) {
  const { dedupe = false } = options || {}

  const cameraLineRE
    = /^\s*--camera-id=(\S+)\s+\(([^,]+),\s*(\d+)x(\d+),\s*fps=\{([^}]*)\}(?:,\s*zoom-range=\[([^\]]+)\])?.*\)\s*$/

  const cameras = []

  const cameraMap = new Map()

  for (const line of output.split(/\r?\n/)) {
    const match = cameraLineRE.exec(line)
    if (!match)
      continue

    const [, id, facingRaw, widthRaw, heightRaw, fpsRaw, zoomRaw] = match

    const fps = fpsRaw
      .split(',')
      .map(v => Number(v.trim()))
      .filter(Number.isFinite)

    const camera = {
      id,
      facing: facingRaw || 'unknown',
      width: Number(widthRaw),
      height: Number(heightRaw),
      fps,
    }

    if (zoomRaw) {
      const zoom = zoomRaw
        .split(',')
        .map(v => Number(v.trim()))
        .filter(Number.isFinite)

      if (zoom.length === 2) {
        camera.zoomRange = [zoom[0], zoom[1]]
      }
    }

    if (!dedupe) {
      cameras.push(camera)
      continue
    }

    const dedupeKey = [
      camera.facing,
      camera.width,
      camera.height,
      camera.fps.join(','),
    ].join('|')

    const existing = cameraMap.get(dedupeKey)

    const getZoomSpan = (zoomRange) => {
      if (!zoomRange)
        return 0

      return zoomRange[1] - zoomRange[0]
    }

    if (!existing || getZoomSpan(camera.zoomRange) > getZoomSpan(existing.zoomRange)) {
      cameraMap.set(dedupeKey, camera)
    }
  }

  return dedupe ? [...cameraMap.values()] : cameras
}
