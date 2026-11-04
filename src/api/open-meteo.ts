import type {
  CurrentWeather,
  Location,
  WeatherUnits,
} from '../domain/weather/models.ts'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

export class OpenMeteoError extends Error {
  public readonly code: 'INVALID_INPUT' | 'API_ERROR' | 'INVALID_RESPONSE'

  constructor(
    message: string,
    code: 'INVALID_INPUT' | 'API_ERROR' | 'INVALID_RESPONSE',
  ) {
    super(message)
    this.name = 'OpenMeteoError'
    this.code = code
  }
}

type GeocodingResult = {
  name: string
  latitude: number
  longitude: number
  country_code: string
  admin1?: string
  timezone: string
}

type GeocodingResponse = {
  results?: unknown
}

type ForecastCurrent = {
  time: string
  precipitation_probability: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  precipitation: number
  weather_code: number
  wind_direction_10m: number
  wind_speed_10m: number
}

type ForecastUnits = {
  time: string
  precipitation_probability: string
  temperature_2m: string
  relative_humidity_2m: string
  apparent_temperature: string
  is_day: string
  precipitation: string
  weather_code: string
  wind_direction_10m: string
  wind_speed_10m: string
}

type ForecastResponse = {
  current?: unknown
  current_units?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const brazilianStateCodes: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
}

const getStateCode = (countryCode: string, stateName?: string): string | undefined => {
  if (!stateName) {
    return undefined
  }

  if (countryCode.toUpperCase() !== 'BR') {
    return stateName
  }

  const normalizedName = stateName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return brazilianStateCodes[normalizedName]
}

const isGeocodingResult = (value: unknown): value is GeocodingResult => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.name === 'string' &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    typeof value.country_code === 'string' &&
    value.country_code.length > 0 &&
    typeof value.timezone === 'string' &&
    value.timezone.length > 0
  )
}

const isGeocodingResponse = (value: unknown): value is GeocodingResponse =>
  isRecord(value)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isForecastCurrent = (value: unknown): value is ForecastCurrent => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.time === 'string' &&
    isFiniteNumber(value.precipitation_probability) &&
    isFiniteNumber(value.temperature_2m) &&
    isFiniteNumber(value.relative_humidity_2m) &&
    isFiniteNumber(value.apparent_temperature) &&
    (value.is_day === 0 || value.is_day === 1) &&
    isFiniteNumber(value.precipitation) &&
    isFiniteNumber(value.weather_code) &&
    isFiniteNumber(value.wind_direction_10m) &&
    isFiniteNumber(value.wind_speed_10m)
  )
}

const isForecastUnits = (value: unknown): value is ForecastUnits => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.time === 'string' &&
    typeof value.precipitation_probability === 'string' &&
    typeof value.temperature_2m === 'string' &&
    typeof value.relative_humidity_2m === 'string' &&
    typeof value.apparent_temperature === 'string' &&
    typeof value.is_day === 'string' &&
    typeof value.precipitation === 'string' &&
    typeof value.weather_code === 'string' &&
    typeof value.wind_direction_10m === 'string' &&
    typeof value.wind_speed_10m === 'string'
  )
}

const isForecastResponse = (value: unknown): value is ForecastResponse =>
  isRecord(value)

const readGeocodingResponse = async (response: Response): Promise<GeocodingResponse> => {
  if (!response.ok) {
    throw new OpenMeteoError(
      `A geocodificação falhou com status ${response.status}.`,
      'API_ERROR',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new OpenMeteoError(
      'A resposta de geocodificação não é um JSON válido.',
      'INVALID_RESPONSE',
    )
  }

  if (!isGeocodingResponse(payload)) {
    throw new OpenMeteoError(
      'A resposta de geocodificação possui formato inválido.',
      'INVALID_RESPONSE',
    )
  }

  return payload
}

const readForecastResponse = async (response: Response): Promise<ForecastResponse> => {
  if (!response.ok) {
    throw new OpenMeteoError(
      `A consulta de clima falhou com status ${response.status}.`,
      'API_ERROR',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new OpenMeteoError(
      'A resposta de clima não é um JSON válido.',
      'INVALID_RESPONSE',
    )
  }

  if (!isForecastResponse(payload)) {
    throw new OpenMeteoError(
      'A resposta de clima possui formato inválido.',
      'INVALID_RESPONSE',
    )
  }

  return payload
}

export const findLocation = async (city: string): Promise<Location | null> => {
  const query = city.trim()

  if (query.length === 0) {
    throw new OpenMeteoError(
      'O nome da cidade é obrigatório.',
      'INVALID_INPUT',
    )
  }

  const url = new URL(GEOCODING_ENDPOINT)
  url.searchParams.set('name', query)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'pt')
  url.searchParams.set('format', 'json')

  let response: Response

  try {
    response = await fetch(url, { cache: 'no-store' })
  } catch {
    throw new OpenMeteoError(
      'Não foi possível conectar à API de geocodificação.',
      'API_ERROR',
    )
  }

  const payload = await readGeocodingResponse(response)

  if (!Array.isArray(payload.results) || payload.results.length === 0) {
    return null
  }

  const result = payload.results[0]

  if (!isGeocodingResult(result)) {
    throw new OpenMeteoError(
      'A localização retornada possui campos inválidos.',
      'INVALID_RESPONSE',
    )
  }

  const stateCode = getStateCode(result.country_code, result.admin1)

  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    countryCode: result.country_code,
    ...(stateCode === undefined ? {} : { stateCode }),
    timezone: result.timezone,
  }
}

export const getCurrentWeather = async (
  location: Location,
): Promise<CurrentWeather> => {
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude) ||
    location.timezone.trim().length === 0
  ) {
    throw new OpenMeteoError(
      'A localização possui parâmetros inválidos.',
      'INVALID_INPUT',
    )
  }

  const url = new URL(FORECAST_ENDPOINT)
  url.searchParams.set('latitude', String(location.latitude))
  url.searchParams.set('longitude', String(location.longitude))
  url.searchParams.set(
    'current',
    [
      'precipitation_probability',
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_direction_10m',
      'wind_speed_10m',
    ].join(','),
  )
  url.searchParams.set('timezone', location.timezone)

  let response: Response

  try {
    response = await fetch(url, { cache: 'no-store' })
  } catch {
    throw new OpenMeteoError(
      'Não foi possível conectar à API de clima.',
      'API_ERROR',
    )
  }

  const payload = await readForecastResponse(response)

  if (!isForecastCurrent(payload.current) || !isForecastUnits(payload.current_units)) {
    throw new OpenMeteoError(
      'A resposta de clima não contém todos os campos obrigatórios.',
      'INVALID_RESPONSE',
    )
  }

  const current = payload.current
  const units = payload.current_units
  const weatherUnits: WeatherUnits = {
    time: units.time,
    temperature: units.temperature_2m,
    relativeHumidity: units.relative_humidity_2m,
    apparentTemperature: units.apparent_temperature,
    precipitationProbability: units.precipitation_probability,
    precipitation: units.precipitation,
    weatherCode: units.weather_code,
    windDirection: units.wind_direction_10m,
    windSpeed: units.wind_speed_10m,
  }

  return {
    time: current.time,
    temperature: current.temperature_2m,
    relativeHumidity: current.relative_humidity_2m,
    apparentTemperature: current.apparent_temperature,
    isDay: current.is_day === 1,
    precipitationProbability: current.precipitation_probability,
    precipitation: current.precipitation,
    weatherCode: current.weather_code,
    windDirection: current.wind_direction_10m,
    windSpeed: current.wind_speed_10m,
    units: weatherUnits,
  }
}
