const NUMBER_RE = '(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:e[+-]?\\d+)?'
const SIZE_RE = new RegExp(
  `^\\s*(${NUMBER_RE})\\s*[x×]\\s*(${NUMBER_RE})(?:\\s*/\\s*(${NUMBER_RE}))?\\s*$`,
  'i',
)

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function toPositiveFiniteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function formatNumber(number) {
  return Number(number.toPrecision(12)).toString()
}

export function stringify(options) {
  if (!isPlainObject(options)) {
    return ''
  }

  const widthNum = toPositiveFiniteNumber(options.width)
  const heightNum = toPositiveFiniteNumber(options.height)

  if (widthNum == null || heightNum == null) {
    return ''
  }

  let width = widthNum
  let height = heightNum

  if (options.landscape === true) {
    width = Math.max(widthNum, heightNum)
    height = Math.min(widthNum, heightNum)
  }
  else if (options.landscape === false) {
    width = Math.min(widthNum, heightNum)
    height = Math.max(widthNum, heightNum)
  }

  let value = `${formatNumber(width)}x${formatNumber(height)}`

  if (options.density != null) {
    const density = toPositiveFiniteNumber(options.density)

    if (density == null) {
      return ''
    }

    value += `/${formatNumber(density)}`
  }

  return value
}

export function parse(input) {
  if (typeof input !== 'string') {
    return null
  }

  const match = input.match(SIZE_RE)

  if (!match) {
    return null
  }

  const width = toPositiveFiniteNumber(match[1])
  const height = toPositiveFiniteNumber(match[2])
  const density = match[3] == null ? undefined : toPositiveFiniteNumber(match[3])

  if (width == null || height == null || (match[3] != null && density == null)) {
    return null
  }

  return {
    width,
    height,
    ...(density != null ? { density } : {}),
  }
}
