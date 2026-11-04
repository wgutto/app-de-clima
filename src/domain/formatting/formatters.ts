const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

const dateTimeParts = (
  value: string,
): { year: number; month: number; day: number; hour: number; minute: number } | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)

  if (!match) {
    return null
  }

  const [, year, month, day, hour, minute] = match
  const parsed = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  }
  const date = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute),
  )

  return (
    date.getUTCFullYear() === parsed.year &&
    date.getUTCMonth() === parsed.month - 1 &&
    date.getUTCDate() === parsed.day &&
    date.getUTCHours() === parsed.hour &&
    date.getUTCMinutes() === parsed.minute
  )
    ? parsed
    : null
}

const formatNumberWithUnit = (value: number, unit: string): string => {
  if (!Number.isFinite(value)) {
    return '—'
  }

  const formattedValue = numberFormatter.format(value)
  return unit.length > 0 ? `${formattedValue} ${unit}` : formattedValue
}

export const normalizeCityQuery = (value: string): string => value.trim()

export const isValidCityQuery = (value: string): boolean =>
  normalizeCityQuery(value).length > 0

export const formatTemperature = (value: number, unit = '°C'): string =>
  formatNumberWithUnit(value, unit)

export const formatPercentage = (value: number, unit = '%'): string =>
  formatNumberWithUnit(value, unit)

export const formatWindSpeed = (value: number, unit = 'km/h'): string =>
  formatNumberWithUnit(value, unit)

const windDirections = [
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SO',
  'O',
  'NO',
] as const

export const formatWindDirection = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '—'
  }

  const normalizedDegrees = ((value % 360) + 360) % 360
  const directionIndex = Math.round(normalizedDegrees / 45) % windDirections.length
  return windDirections[directionIndex]
}

export const formatLocalDateTime = (value: string, timezone: string): string => {
  const parts = dateTimeParts(value)

  if (!parts) {
    return '—'
  }

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
  const utcMillis = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  )
  const targetParts = formatter
    .formatToParts(new Date(utcMillis))
    .reduce<Record<string, number>>((result, part) => {
      if (part.type !== 'literal') {
        result[part.type] = Number(part.value)
      }
      return result
    }, {})
  const targetAsUtc = Date.UTC(
    targetParts.year,
    targetParts.month - 1,
    targetParts.day,
    targetParts.hour,
    targetParts.minute,
  )
  const localInstant = new Date(utcMillis - (targetAsUtc - utcMillis))

  const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
  const formattedParts = longDateFormatter.formatToParts(localInstant)
  const partsByType = formattedParts.reduce<Record<string, string>>((result, part) => {
    if (part.type !== 'literal') {
      result[part.type] = part.value
    }
    return result
  }, {})

  return `${partsByType.weekday}, ${partsByType.day} de ${partsByType.month} de ${
    partsByType.year
  } às ${partsByType.hour}:${partsByType.minute}`
}

export const formatCurrentLocalDateTime = (
  timezone: string,
  date: Date = new Date(),
): string => {
  const formattedParts = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== 'literal') {
        result[part.type] = part.value
      }
      return result
    }, {})

  return `${formattedParts.weekday}, ${formattedParts.day} de ${formattedParts.month} de ${
    formattedParts.year
  } às ${formattedParts.hour}:${formattedParts.minute}`
}
