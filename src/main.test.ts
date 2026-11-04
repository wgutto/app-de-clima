// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  findLocation: vi.fn(),
  getCurrentWeather: vi.fn(),
}))

vi.mock('./api/open-meteo.ts', () => ({
  ...api,
  OpenMeteoError: class OpenMeteoError extends Error {},
}))

const location = {
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  countryCode: 'BR',
  timezone: 'America/Sao_Paulo',
}

const current = {
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
}

const loadApp = async (): Promise<void> => {
  document.body.innerHTML = '<div id="app"></div>'
  vi.resetModules()
  await import('./main.ts')
}

describe('fluxo da interface', () => {
  beforeEach(() => {
    api.findLocation.mockReset()
    api.getCurrentWeather.mockReset()
  })

  it('inicia a busca pelo botão e exibe o sucesso', async () => {
    api.findLocation.mockResolvedValue(location)
    api.getCurrentWeather.mockResolvedValue(current)
    await loadApp()

    expect(document.querySelector('.site-footer')?.textContent).toContain('Augusto Brito')
    document.querySelector<HTMLInputElement>('#city-input')!.value = ' São Paulo '
    document.querySelector<HTMLButtonElement>('#search-button')!.click()
    await vi.waitFor(() => {
      expect(document.querySelector<HTMLElement>('#weather-panel')?.hidden).toBe(false)
    })

    expect(api.findLocation).toHaveBeenCalledWith('São Paulo')
    expect(document.querySelector('#summary-content')?.textContent).toContain('23,5 °C')
    expect(document.querySelectorAll('.weather-detail')).toHaveLength(5)
  })

  it('inicia a mesma busca ao pressionar Enter', async () => {
    api.findLocation.mockResolvedValue(null)
    await loadApp()

    const input = document.querySelector<HTMLInputElement>('#city-input')!
    input.value = ' Recife '
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    input.form?.requestSubmit()

    await vi.waitFor(() => {
      expect(api.findLocation).toHaveBeenCalledWith('Recife')
    })
    expect(document.querySelector('#status-message')?.textContent).toContain(
      'Não foi possível encontrar "Recife".',
    )
  })

  it('desabilita submissões duplicadas durante o loading', async () => {
    let resolveLocation: (value: typeof location) => void = () => undefined
    api.findLocation.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLocation = resolve
        }),
    )
    await loadApp()

    const input = document.querySelector<HTMLInputElement>('#city-input')!
    const button = document.querySelector<HTMLButtonElement>('#search-button')!
    input.value = 'Curitiba'
    button.click()
    button.click()

    expect(button.disabled).toBe(true)
    expect(api.findLocation).toHaveBeenCalledTimes(1)
    resolveLocation(location)
    api.getCurrentWeather.mockResolvedValue(current)
    await vi.waitFor(() => expect(button.disabled).toBe(false))
  })

  it('exibe erro de clima sem manter o painel anterior', async () => {
    api.findLocation.mockResolvedValue(location)
    api.getCurrentWeather.mockRejectedValue(new Error('network'))
    await loadApp()

    document.querySelector<HTMLInputElement>('#city-input')!.value = 'Santos'
    document.querySelector<HTMLButtonElement>('#search-button')!.click()
    await vi.waitFor(() => {
      expect(document.querySelector('#status-message')?.textContent).toContain(
        'Não foi possível carregar o clima.',
      )
    })

    expect(document.querySelector<HTMLElement>('#weather-panel')?.hidden).toBe(true)
    expect(document.querySelector('#summary-content')?.textContent).toBe('')
  })
})
