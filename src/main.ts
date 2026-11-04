import './style.css'
import { findLocation, getCurrentWeather, OpenMeteoError } from './api/open-meteo.ts'
import {
  formatLocalDateTime,
  formatPercentage,
  formatTemperature,
  formatWindDirection,
  formatWindSpeed,
  normalizeCityQuery,
} from './domain/formatting/formatters.ts'
import { getWeatherCondition } from './domain/weather/conditions.ts'
import type { Location, CurrentWeather } from './domain/weather/models.ts'
import type { AppError, AppState } from './domain/weather/state.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="site-header">
    <div class="page-container">
      <p class="eyebrow">Clima agora</p>
      <h1>Consulte o clima da sua cidade</h1>
      <p class="intro">Descubra as condições meteorológicas atuais em qualquer lugar.</p>
    </div>
  </header>

  <main class="page-container">
    <form id="search-form" class="search-form" novalidate>
      <div class="search-field">
        <label for="city-input">Cidade</label>
        <div class="search-controls">
          <input
            id="city-input"
            name="city"
            type="text"
            autocomplete="address-level2"
            placeholder="Ex.: São Paulo"
            aria-describedby="city-hint city-error"
            aria-invalid="false"
          />
          <button id="search-button" type="submit">Buscar clima</button>
        </div>
        <p id="city-hint" class="field-hint">Digite o nome de uma cidade para começar.</p>
        <p id="city-error" class="field-error" role="alert"></p>
      </div>
    </form>

    <section id="weather-panel" class="weather-panel" aria-labelledby="results-heading" hidden>
      <h2 id="results-heading" class="sr-only">Resultado do clima</h2>
      <aside class="weather-summary" aria-labelledby="summary-heading">
        <h3 id="summary-heading">Resumo</h3>
        <div id="summary-content"></div>
      </aside>
      <section class="weather-details" aria-labelledby="details-heading">
        <h3 id="details-heading">Detalhes meteorológicos</h3>
        <div id="details-content"></div>
      </section>
    </section>

    <section id="initial-state" class="message-panel" aria-labelledby="initial-heading">
      <h2 id="initial-heading">Pesquise uma cidade</h2>
      <p>Informe uma cidade acima para ver o clima atual.</p>
    </section>

    <div id="loading-message" class="message-panel" role="status" aria-live="polite" hidden>
      <p>Buscando o clima...</p>
    </div>
    <div id="status-message" class="message-panel" role="status" aria-live="polite" hidden></div>
  </main>
`

const form = document.querySelector<HTMLFormElement>('#search-form')!
const cityInput = document.querySelector<HTMLInputElement>('#city-input')!
const searchButton = document.querySelector<HTMLButtonElement>('#search-button')!
const cityError = document.querySelector<HTMLParagraphElement>('#city-error')!
const initialState = document.querySelector<HTMLElement>('#initial-state')!
const weatherPanel = document.querySelector<HTMLElement>('#weather-panel')!
const loadingMessage = document.querySelector<HTMLElement>('#loading-message')!
const statusMessage = document.querySelector<HTMLElement>('#status-message')!
const summaryContent = document.querySelector<HTMLElement>('#summary-content')!
const detailsContent = document.querySelector<HTMLElement>('#details-content')!

let isLoading = false

const clearResults = (): void => {
  summaryContent.replaceChildren()
  detailsContent.replaceChildren()
  weatherPanel.hidden = true
}

const setLoadingState = (loading: boolean): void => {
  isLoading = loading
  searchButton.disabled = loading
  cityInput.disabled = loading
  loadingMessage.hidden = !loading
  if (loading) {
    initialState.hidden = true
    statusMessage.hidden = true
    clearResults()
  }
}

const createError = (code: AppError['code'], message: string, cause?: unknown): AppError => ({
  code,
  message,
  ...(cause === undefined ? {} : { cause }),
})

const showStatus = (message: string, retryQuery?: string): void => {
  statusMessage.replaceChildren()
  const text = document.createElement('p')
  text.textContent = message
  statusMessage.append(text)

  if (retryQuery !== undefined) {
    const retryButton = document.createElement('button')
    retryButton.type = 'button'
    retryButton.className = 'retry-button'
    retryButton.dataset.query = retryQuery
    retryButton.textContent = 'Tentar novamente'
    statusMessage.append(retryButton)
  }

  statusMessage.hidden = false
}

const createPeriodIcon = (isDay: boolean): SVGSVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.classList.add('period-icon')

  if (isDay) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', '12')
    circle.setAttribute('cy', '12')
    circle.setAttribute('r', '4')
    circle.classList.add('sun-core')
    svg.append(circle)

    for (let index = 0; index < 8; index += 1) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      const angle = (index * Math.PI) / 4
      line.setAttribute('x1', String(12 + Math.cos(angle) * 7))
      line.setAttribute('y1', String(12 + Math.sin(angle) * 7))
      line.setAttribute('x2', String(12 + Math.cos(angle) * 9))
      line.setAttribute('y2', String(12 + Math.sin(angle) * 9))
      line.classList.add('sun-ray')
      svg.append(line)
    }
  } else {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z')
    path.classList.add('moon-shape')
    svg.append(path)
  }

  return svg
}

const renderSummary = (location: Location, current: CurrentWeather): void => {
  const condition = getWeatherCondition(current.weatherCode)
  summaryContent.replaceChildren()

  const city = document.createElement('h4')
  city.textContent = `${location.name}, ${
    location.stateCode === undefined ? '' : `${location.stateCode}, `
  }${location.countryCode}`

  const temperature = document.createElement('p')
  temperature.className = 'current-temperature'
  temperature.textContent = formatTemperature(current.temperature, current.units.temperature)

  const conditionDescription = document.createElement('p')
  conditionDescription.className = 'weather-condition'
  conditionDescription.textContent = condition.description

  const localTime = document.createElement('p')
  localTime.textContent = formatLocalDateTime(current.time, location.timezone)

  const period = document.createElement('p')
  period.className = 'weather-period'
  period.append(createPeriodIcon(current.isDay))
  const periodText = document.createElement('span')
  periodText.textContent = current.isDay ? 'Dia' : 'Noite'
  period.append(periodText)

  summaryContent.append(city, temperature, conditionDescription, localTime, period)
}

const renderDetails = (current: CurrentWeather): void => {
  const details = [
    ['Umidade relativa', formatPercentage(current.relativeHumidity, current.units.relativeHumidity)],
    ['Sensação térmica', formatTemperature(current.apparentTemperature, current.units.apparentTemperature)],
    [
      'Probabilidade de precipitação',
      formatPercentage(current.precipitationProbability, current.units.precipitationProbability),
    ],
    ['Velocidade do vento', formatWindSpeed(current.windSpeed, current.units.windSpeed)],
    ['Direção do vento', formatWindDirection(current.windDirection)],
  ]

  detailsContent.replaceChildren()
  for (const [label, value] of details) {
    const item = document.createElement('div')
    item.className = 'weather-detail'
    const itemLabel = document.createElement('dt')
    itemLabel.textContent = label
    const itemValue = document.createElement('dd')
    itemValue.textContent = value
    item.append(itemLabel, itemValue)
    detailsContent.append(item)
  }
}

const renderState = (state: AppState): void => {
  if (state.status === 'success') {
    renderSummary(state.location, state.current)
    renderDetails(state.current)
    weatherPanel.hidden = false
    statusMessage.hidden = true
    initialState.hidden = true
    return
  }

  clearResults()
  initialState.hidden = state.status === 'loading' ? true : state.status !== 'initial'

  if (state.status === 'not-found') {
    showStatus(state.error.message, state.query)
  } else if (state.status === 'error') {
    showStatus(state.error.message, state.query)
  } else if (state.status === 'invalid-input') {
    showStatus(state.error.message)
  }
}

const runSearch = async (value: string): Promise<void> => {
  const query = normalizeCityQuery(value)
  cityInput.value = query
  cityError.textContent = ''
  cityInput.setAttribute('aria-invalid', 'false')
  setLoadingState(true)

  try {
    const location = await findLocation(query)
    if (location === null) {
      const state: AppState = {
        status: 'not-found',
        query,
        error: createError('LOCATION_NOT_FOUND', `Não foi possível encontrar "${query}".`),
      }
      renderState(state)
      return
    }

    const current = await getCurrentWeather(location)
    renderState({ status: 'success', query, location, current })
  } catch (error) {
    const message =
      error instanceof OpenMeteoError && error.code === 'INVALID_RESPONSE'
        ? 'A API retornou dados inválidos. Tente novamente.'
        : 'Não foi possível carregar o clima. Tente novamente.'
    renderState({
      status: 'error',
      query,
      error: createError(
        error instanceof OpenMeteoError ? error.code : 'API_ERROR',
        message,
        error,
      ),
    })
  } finally {
    setLoadingState(false)
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()

  if (isLoading) {
    return
  }

  const query = normalizeCityQuery(cityInput.value)
  cityError.textContent = ''
  cityInput.setAttribute('aria-invalid', 'false')

  if (query.length === 0) {
    renderState({
      status: 'invalid-input',
      error: createError('INVALID_INPUT', 'Digite o nome de uma cidade.'),
    })
    cityError.textContent = 'Digite o nome de uma cidade.'
    cityInput.setAttribute('aria-invalid', 'true')
    cityInput.focus()
    return
  }

  void runSearch(query)
})

statusMessage.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLButtonElement) || target.dataset.query === undefined || isLoading) {
    return
  }

  cityInput.value = target.dataset.query
  void runSearch(target.dataset.query)
})
