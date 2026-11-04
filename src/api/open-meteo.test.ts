import { describe, expect, it, vi } from 'vitest'
import { findLocation, getCurrentWeather, OpenMeteoError } from './open-meteo.ts'

const location = {
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  countryCode: 'BR',
  timezone: 'America/Sao_Paulo',
}

const forecastPayload = {
  current: {
    time: '2026-11-03T16:15',
    precipitation_probability: 20,
    temperature_2m: 23.5,
    relative_humidity_2m: 70,
    apparent_temperature: 24,
    is_day: 1,
    precipitation: 0,
    weather_code: 2,
    wind_direction_10m: 132,
    wind_speed_10m: 12.4,
  },
  current_units: {
    time: 'iso8601',
    precipitation_probability: '%',
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    apparent_temperature: '°C',
    is_day: '',
    precipitation: 'mm',
    weather_code: 'wmo code',
    wind_direction_10m: '°',
    wind_speed_10m: 'km/h',
  },
}

describe('integração Open-Meteo', () => {
  it('resolve a cidade com parâmetros codificados e transforma a localização', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [
              {
                name: 'São Paulo',
                latitude: -23.55,
                longitude: -46.63,
                country_code: 'BR',
                admin1: 'São Paulo',
                timezone: 'America/Sao_Paulo',
              },
            ],
          }),
        ),
      )

    await expect(findLocation(' São Paulo ')).resolves.toEqual({
      ...location,
      stateCode: 'SP',
    })

    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]))
    expect(requestUrl.searchParams.get('name')).toBe('São Paulo')
    expect(requestUrl.searchParams.get('count')).toBe('1')
    expect(requestUrl.searchParams.get('language')).toBe('pt')
    expect(requestUrl.searchParams.get('format')).toBe('json')
    fetchMock.mockRestore()
  })

  it('classifica pesquisa vazia como entrada inválida sem chamar a rede', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')

    await expect(findLocation('   ')).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    })
    expect(fetchMock).not.toHaveBeenCalled()
    fetchMock.mockRestore()
  })

  it('retorna nulo quando a cidade não foi encontrada', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ results: [] })),
    )

    await expect(findLocation('Cidade inexistente')).resolves.toBeNull()
    vi.restoreAllMocks()
  })

  it('consulta e transforma o clima atual preservando as unidades', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(forecastPayload)))

    await expect(getCurrentWeather(location)).resolves.toEqual({
      time: '2026-11-03T16:15',
      temperature: 23.5,
      relativeHumidity: 70,
      apparentTemperature: 24,
      isDay: true,
      precipitationProbability: 20,
      precipitation: 0,
      weatherCode: 2,
      windDirection: 132,
      windSpeed: 12.4,
      units: {
        time: 'iso8601',
        temperature: '°C',
        relativeHumidity: '%',
        apparentTemperature: '°C',
        precipitationProbability: '%',
        precipitation: 'mm',
        weatherCode: 'wmo code',
        windDirection: '°',
        windSpeed: 'km/h',
      },
    })

    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]))
    expect(requestUrl.searchParams.get('latitude')).toBe('-23.55')
    expect(requestUrl.searchParams.get('longitude')).toBe('-46.63')
    expect(requestUrl.searchParams.get('timezone')).toBe('America/Sao_Paulo')
    expect(requestUrl.searchParams.get('current')).toContain('temperature_2m')
    expect(requestUrl.searchParams.get('current')).toContain('wind_speed_10m')
    fetchMock.mockRestore()
  })

  it('classifica localização inválida antes da requisição', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')

    await expect(
      getCurrentWeather({ ...location, latitude: Number.NaN }),
    ).rejects.toBeInstanceOf(OpenMeteoError)
    await expect(
      getCurrentWeather({ ...location, timezone: ' ' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' })
    expect(fetchMock).not.toHaveBeenCalled()
    fetchMock.mockRestore()
  })

  it('classifica payload de clima incompleto como resposta inválida', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ current: {} })),
    )

    await expect(getCurrentWeather(location)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
    vi.restoreAllMocks()
  })
})
